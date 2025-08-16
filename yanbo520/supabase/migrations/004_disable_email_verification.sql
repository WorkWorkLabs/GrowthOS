-- 禁用邮箱验证，适用于demo阶段

-- 更新现有用户的邮箱验证状态
UPDATE auth.users SET email_confirmed_at = NOW() WHERE email_confirmed_at IS NULL;

-- 更新触发器，自动确认新用户邮箱
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.users (id, email, username, avatar, bio, email_verified)
  VALUES (
    new.id,
    new.email,
    COALESCE(new.raw_user_meta_data->>'username', split_part(new.email, '@', 1)),
    COALESCE(
      new.raw_user_meta_data->>'avatar',
      'https://avatars.githubusercontent.com/u/190834534?s=200&v=4'
    ),
    COALESCE(new.raw_user_meta_data->>'bio', 'Hello! I''m new to WorkWork.'),
    true  -- 自动设置邮箱为已验证
  );
  RETURN new;
END;
$$ language plpgsql security definer;

-- 更新auth.users表，确保新用户邮箱自动确认
CREATE OR REPLACE FUNCTION public.auto_confirm_email()
RETURNS trigger AS $$
BEGIN
  -- 自动确认邮箱
  NEW.email_confirmed_at = NOW();
  RETURN NEW;
END;
$$ language plpgsql security definer;

-- 创建触发器自动确认新用户邮箱
DROP TRIGGER IF EXISTS auto_confirm_email_trigger ON auth.users;
CREATE TRIGGER auto_confirm_email_trigger
  BEFORE INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.auto_confirm_email();