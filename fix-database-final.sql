-- GrowthOS 数据库数据修复脚本
-- 在Supabase控制台的SQL编辑器中执行
-- =====================================================

-- 临时禁用RLS
ALTER TABLE users DISABLE ROW LEVEL SECURITY;
ALTER TABLE products DISABLE ROW LEVEL SECURITY;

-- 清空现有数据
DELETE FROM orders WHERE true;
DELETE FROM product_images WHERE true;
DELETE FROM products WHERE true;
DELETE FROM users WHERE email NOT LIKE '%@supabase.io';

-- 插入测试用户（包含所有必需字段）
INSERT INTO users (
    id, email, username, bio, avatar, 
    email_verified, is_active, 
    password_hash, role, name, is_admin
) VALUES
(
    '8ab146dd-9e5d-4046-9b14-04bc5e2c8a73', 
    'test@example.com', 
    'testuser', 
    'Test user for development', 
    'https://avatars.githubusercontent.com/u/190834534?s=200&v=4',
    true, 
    true,
    'supabase_auth_managed',
    'user',
    'Test User',
    false
),
(
    '9bc257ee-0f6e-5157-ac25-15cd6f3d9b84', 
    'admin@workwork.com', 
    'admin', 
    'Administrator account', 
    'https://avatars.githubusercontent.com/u/190834534?s=200&v=4',
    true, 
    true,
    'supabase_auth_managed',
    'user', 
    'Admin User',
    true
);

-- 插入测试产品（修正JSON格式）
INSERT INTO products (name, description, author_id, author_name, price, currency, category, zone, pricing_model, product_type, tags, images, views, likes, rating, status) VALUES
('AI Code Generator Pro', 'Advanced AI-powered code generation tool for Solana smart contracts.', '8ab146dd-9e5d-4046-9b14-04bc5e2c8a73', 'testuser', 49.99, 'SOL', 'AI Tools', 'products', 'one_time', 'product', '[{"type":"ai","label":"Code Generation"},{"type":"crypto","label":"Solana"}]'::jsonb, '[{"url":"https://avatars.githubusercontent.com/u/190834534?s=200&v=4","alt":"AI Code Generator Pro"}]'::jsonb, 1247, 89, 4.8, 'active'),

('DeFi Analytics Dashboard', 'Comprehensive analytics platform for DeFi protocols on Solana.', '8ab146dd-9e5d-4046-9b14-04bc5e2c8a73', 'testuser', 29.99, 'SOL', 'Analytics', 'services', 'one_time', 'product', '[{"type":"crypto","label":"DeFi"},{"type":"education","label":"Analytics"}]'::jsonb, '[{"url":"https://avatars.githubusercontent.com/u/190834534?s=200&v=4","alt":"DeFi Analytics Dashboard"}]'::jsonb, 2156, 156, 4.7, 'active'),

('Solana Developer Bootcamp', 'Intensive 8-week online bootcamp covering Solana development.', '9bc257ee-0f6e-5157-ac25-15cd6f3d9b84', 'admin', 199.99, 'SOL', 'Education', 'courses', 'subscription', 'subscription', '[{"type":"education","label":"Bootcamp"},{"type":"crypto","label":"Solana"}]'::jsonb, '[{"url":"https://avatars.githubusercontent.com/u/190834534?s=200&v=4","alt":"Solana Developer Bootcamp"}]'::jsonb, 3421, 298, 4.9, 'active');

-- 重新启用RLS
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE products ENABLE ROW LEVEL SECURITY;

-- 显示结果
SELECT 'Users inserted:' as info, COUNT(*) as count FROM users;
SELECT 'Products inserted:' as info, COUNT(*) as count FROM products;
SELECT username, email, role FROM users;
SELECT name, price, currency, category FROM products;