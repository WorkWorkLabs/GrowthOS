-- 修复 Supabase RLS 策略
-- 在 Supabase SQL 编辑器中运行此脚本

-- 1. 删除有问题的现有策略
DROP POLICY IF EXISTS "Users can view own profile" ON users;
DROP POLICY IF EXISTS "Users can update own profile" ON users;
DROP POLICY IF EXISTS "Enable public user profiles for read" ON users;
DROP POLICY IF EXISTS "Authors can insert products" ON users;

-- 2. 创建正确的用户表策略

-- 允许所有人查看用户基本信息（用于显示作者等）
CREATE POLICY "Anyone can view user profiles" ON users
    FOR SELECT USING (true);

-- 允许认证用户创建自己的记录
CREATE POLICY "Users can create own profile" ON users
    FOR INSERT WITH CHECK (auth.uid() = id);

-- 允许用户更新自己的记录
CREATE POLICY "Users can update own profile" ON users
    FOR UPDATE USING (auth.uid() = id);

-- 允许用户删除自己的记录（可选）
CREATE POLICY "Users can delete own profile" ON users
    FOR DELETE USING (auth.uid() = id);

-- 3. 验证策略创建
SELECT 
    schemaname, 
    tablename, 
    policyname, 
    permissive, 
    cmd,
    qual
FROM pg_policies 
WHERE tablename = 'users' 
ORDER BY cmd, policyname;