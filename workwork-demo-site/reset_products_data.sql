-- 清空所有产品数据并插入6个测试产品
-- ==========================================

BEGIN;

-- 1. 清空所有产品相关数据（保留用户数据）
-- ==========================================

-- 删除所有订单（这会级联删除相关数据）
DELETE FROM orders;

-- 删除所有产品图片
DELETE FROM product_images;

-- 删除所有产品
DELETE FROM products;

-- 删除 StreamFlow 卖家信息（会随着用户删除自动清理，但手动清理确保干净）
DELETE FROM streamflow_sellers;

-- 2. 插入6个测试产品
-- ==========================================

-- 首先获取一个用户ID作为测试产品的作者
-- 如果没有用户，这个脚本会失败，需要先有用户数据
WITH test_user AS (
  SELECT id, username, email FROM users LIMIT 1
)

-- 插入6个测试产品
INSERT INTO products (
  name, 
  description, 
  author_id, 
  author_name, 
  price, 
  currency, 
  category, 
  pricing_model,
  product_type,
  status,
  tags,
  images,
  views,
  likes,
  rating
) 
SELECT 
  product_name,
  product_description,
  test_user.id,
  test_user.username,
  product_price,
  'SOL',
  product_category,
  product_pricing_model::pricing_model,
  'product',
  'active',
  product_tags::jsonb,
  product_images::jsonb,
  product_views,
  product_likes,
  product_rating
FROM test_user, (
  VALUES 
    (
      'AI Code Generator Pro',
      'Advanced AI-powered code generation tool for Solana smart contracts. Generate secure, optimized Rust code with built-in best practices and automated testing.',
      49.99,
      'AI Tools',
      'one_time',
      '[{"type": "ai", "label": "Code Generation"}, {"type": "crypto", "label": "Solana"}, {"type": "education", "label": "Development"}]',
      '[{"url": "https://avatars.githubusercontent.com/u/190834534?s=200&v=4", "alt": "AI Code Generator Pro"}]',
      1247,
      89,
      4.8
    ),
    (
      'DeFi Analytics Dashboard',
      'Comprehensive analytics platform for DeFi protocols on Solana. Real-time data, yield tracking, and risk assessment tools for professional traders.',
      29.99,
      'Analytics',
      'one_time',
      '[{"type": "crypto", "label": "DeFi"}, {"type": "education", "label": "Analytics"}, {"type": "crypto", "label": "Trading"}]',
      '[{"url": "https://avatars.githubusercontent.com/u/190834534?s=200&v=4", "alt": "DeFi Analytics Dashboard"}]',
      2156,
      156,
      4.7
    ),
    (
      'NFT Collection Manager',
      'Complete toolkit for creating, managing, and marketing NFT collections on Solana. Includes metadata generation, rarity calculator, and marketplace integration.',
      79.99,
      'NFT Tools',
      'one_time',
      '[{"type": "crypto", "label": "NFT"}, {"type": "ai", "label": "Generation"}, {"type": "education", "label": "Marketing"}]',
      '[{"url": "https://avatars.githubusercontent.com/u/190834534?s=200&v=4", "alt": "NFT Collection Manager"}]',
      892,
      134,
      4.9
    ),
    (
      'Solana Developer Bootcamp',
      'Intensive 8-week online bootcamp covering Solana development from basics to advanced topics. Includes live coding sessions, projects, and mentorship.',
      199.99,
      'Education',
      'one_time',
      '[{"type": "education", "label": "Bootcamp"}, {"type": "crypto", "label": "Solana"}, {"type": "education", "label": "Programming"}]',
      '[{"url": "https://avatars.githubusercontent.com/u/190834534?s=200&v=4", "alt": "Solana Developer Bootcamp"}]',
      3421,
      298,
      4.9
    ),
    (
      'Crypto Portfolio Tracker',
      'Advanced portfolio management tool with real-time tracking, P&L analysis, tax reporting, and automated DCA strategies for crypto investments.',
      19.99,
      'Tools',
      'one_time',
      '[{"type": "crypto", "label": "Portfolio"}, {"type": "education", "label": "Investment"}, {"type": "ai", "label": "Analytics"}]',
      '[{"url": "https://avatars.githubusercontent.com/u/190834534?s=200&v=4", "alt": "Crypto Portfolio Tracker"}]',
      1876,
      167,
      4.6
    ),
    (
      'Web3 UI Component Library',
      'Beautiful React components designed specifically for Web3 applications. Includes wallet connectors, transaction buttons, and blockchain data displays.',
      39.99,
      'Templates',
      'one_time',
      '[{"type": "education", "label": "UI"}, {"type": "crypto", "label": "Web3"}, {"type": "education", "label": "Components"}]',
      '[{"url": "https://avatars.githubusercontent.com/u/190834534?s=200&v=4", "alt": "Web3 UI Component Library"}]',
      1234,
      112,
      4.5
    )
) AS test_products(
  product_name, 
  product_description, 
  product_price, 
  product_category,
  product_pricing_model,
  product_tags, 
  product_images,
  product_views,
  product_likes,
  product_rating
);

-- 3. 为每个产品添加一张主图片到 product_images 表
-- ==========================================

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

-- 4. 显示插入结果
-- ==========================================

-- 显示插入的产品数量
SELECT 
  'PRODUCTS INSERTED' as info,
  COUNT(*) as count 
FROM products;

-- 显示插入的图片数量  
SELECT 
  'PRODUCT IMAGES INSERTED' as info,
  COUNT(*) as count 
FROM product_images;

-- 显示所有测试产品
SELECT 
  'TEST PRODUCTS' as info,
  name,
  category,
  price,
  currency,
  views,
  likes,
  rating
FROM products 
ORDER BY created_at;

COMMIT;