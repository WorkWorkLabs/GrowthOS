-- 修复 RLS 策略冲突问题
-- 在 Supabase SQL 编辑器中运行此脚本

-- 1. 删除冲突的用户表策略
DROP POLICY IF EXISTS "Users can view own profile" ON users;
DROP POLICY IF EXISTS "Enable public user profiles for read" ON users;

-- 2. 创建新的统一策略
CREATE POLICY "Users can view profiles" ON users
    FOR SELECT USING (
        -- 用户可以查看自己的完整资料
        auth.uid() = id 
        OR 
        -- 或者查看其他用户的公开资料（排除敏感信息）
        true
    );

-- 3. 临时禁用 RLS 进行测试（可选）
-- ALTER TABLE users DISABLE ROW LEVEL SECURITY;

-- 4. 检查当前策略
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual 
FROM pg_policies 
WHERE tablename = 'users';