-- Fix RLS policies and add automatic profile creation trigger

-- 1. 删除现有的策略
DROP POLICY IF EXISTS "Users can insert own profile" ON users;
DROP POLICY IF EXISTS "Users can update own profile" ON users;
DROP POLICY IF EXISTS "Users can view all profiles" ON users;

-- 2. 创建更好的RLS策略
CREATE POLICY "Enable select for all users" ON users 
  FOR SELECT USING (true);

CREATE POLICY "Enable insert for authenticated users" ON users
  FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Enable update for users based on user_id" ON users 
  FOR UPDATE USING (auth.uid()::text = id::text);

-- 3. 创建自动创建用户profile的触发器函数
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.users (id, email, username, avatar, bio)
  VALUES (
    new.id,
    new.email,
    COALESCE(new.raw_user_meta_data->>'username', split_part(new.email, '@', 1)),
    COALESCE(
      new.raw_user_meta_data->>'avatar',
      'https://avatars.githubusercontent.com/u/190834534?s=200&v=4'
    ),
    COALESCE(new.raw_user_meta_data->>'bio', 'Hello! I''m new to WorkWork.')
  );
  RETURN new;
END;
$$ language plpgsql security definer;

-- 4. 创建触发器：当新用户在auth.users中创建时自动创建profile
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- 5. 清理现有测试数据
DELETE FROM users WHERE email LIKE '%@example.com';