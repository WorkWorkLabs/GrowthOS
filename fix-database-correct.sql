-- GrowthOS 数据库数据修复脚本 - 正确版本
-- 在Supabase控制台的SQL编辑器中执行
-- =====================================================

-- 临时禁用RLS
ALTER TABLE users DISABLE ROW LEVEL SECURITY;
ALTER TABLE products DISABLE ROW LEVEL SECURITY;

-- 清空现有数据（保留Supabase系统用户）
DELETE FROM orders WHERE true;
DELETE FROM product_images WHERE true;
DELETE FROM products WHERE true;
DELETE FROM users WHERE email NOT LIKE '%@supabase.io' AND email NOT LIKE '%service_role%';

-- 插入测试用户（使用正确的字段）
INSERT INTO users (
    id, 
    email, 
    username, 
    bio, 
    avatar,
    wallet_address,
    social_wechat,
    social_alipay,
    social_linkedin,
    social_website,
    email_verified, 
    is_active
) VALUES
(
    '8ab146dd-9e5d-4046-9b14-04bc5e2c8a73', 
    'test@example.com', 
    'testuser', 
    'Test user for development', 
    'https://avatars.githubusercontent.com/u/190834534?s=200&v=4',
    null,
    null,
    null,
    null,
    null,
    true, 
    true
),
(
    '9bc257ee-0f6e-5157-ac25-15cd6f3d9b84', 
    'admin@workwork.com', 
    'admin', 
    'Administrator account', 
    'https://avatars.githubusercontent.com/u/190834534?s=200&v=4',
    null,
    null,
    null,
    null,
    null,
    true, 
    true
);

-- 插入测试产品
INSERT INTO products (
    name, 
    description, 
    author_id, 
    author_name, 
    price, 
    currency, 
    category, 
    zone, 
    pricing_model, 
    product_type, 
    tags, 
    images, 
    views, 
    likes, 
    rating, 
    status
) VALUES
(
    'AI Code Generator Pro',
    'Advanced AI-powered code generation tool for Solana smart contracts. Generate secure, optimized Rust code with built-in best practices.',
    '8ab146dd-9e5d-4046-9b14-04bc5e2c8a73',
    'testuser',
    49.99,
    'SOL',
    'AI Tools',
    'products',
    'one_time',
    'product',
    '[{"type":"ai","label":"Code Generation"},{"type":"crypto","label":"Solana"}]'::jsonb,
    '[{"url":"https://avatars.githubusercontent.com/u/190834534?s=200&v=4","alt":"AI Code Generator Pro"}]'::jsonb,
    1247,
    89,
    4.8,
    'active'
),
(
    'DeFi Analytics Dashboard',
    'Comprehensive analytics platform for DeFi protocols on Solana. Real-time data, yield tracking, and risk assessment tools.',
    '8ab146dd-9e5d-4046-9b14-04bc5e2c8a73',
    'testuser',
    29.99,
    'SOL',
    'Analytics',
    'services',
    'one_time',
    'product',
    '[{"type":"crypto","label":"DeFi"},{"type":"education","label":"Analytics"}]'::jsonb,
    '[{"url":"https://avatars.githubusercontent.com/u/190834534?s=200&v=4","alt":"DeFi Analytics Dashboard"}]'::jsonb,
    2156,
    156,
    4.7,
    'active'
),
(
    'Solana Developer Bootcamp',
    'Intensive 8-week online bootcamp covering Solana development from basics to advanced topics.',
    '9bc257ee-0f6e-5157-ac25-15cd6f3d9b84',
    'admin',
    199.99,
    'SOL',
    'Education',
    'courses',
    'subscription',
    'subscription',
    '[{"type":"education","label":"Bootcamp"},{"type":"crypto","label":"Solana"}]'::jsonb,
    '[{"url":"https://avatars.githubusercontent.com/u/190834534?s=200&v=4","alt":"Solana Developer Bootcamp"}]'::jsonb,
    3421,
    298,
    4.9,
    'active'
);

-- 为每个产品添加主图片到 product_images 表
INSERT INTO product_images (
    product_id,
    image_url,
    image_type,
    is_primary,
    display_order,
    alt_text
)
SELECT 
    p.id,
    'https://avatars.githubusercontent.com/u/190834534?s=200&v=4',
    'default',
    true,
    0,
    p.name || ' - Main Image'
FROM products p;

-- 重新启用RLS
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE products ENABLE ROW LEVEL SECURITY;

-- 显示结果
SELECT 'Users inserted:' as info, COUNT(*) as count FROM users;
SELECT 'Products inserted:' as info, COUNT(*) as count FROM products;
SELECT 'Product images inserted:' as info, COUNT(*) as count FROM product_images;

-- 显示详细信息
SELECT 'USER DETAILS:' as section, username, email, bio FROM users ORDER BY username;
SELECT 'PRODUCT DETAILS:' as section, name, price, currency, category, zone FROM products ORDER BY name;