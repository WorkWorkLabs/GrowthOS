-- GrowthOS Supabase 完整表结构重建脚本
-- =====================================================
-- 注意：在Supabase控制台的SQL编辑器中运行此脚本
-- =====================================================

-- 首先清理现有表（谨慎使用）
-- 如果需要保留数据，请先备份
DROP TABLE IF EXISTS product_images CASCADE;
DROP TABLE IF EXISTS orders CASCADE;
DROP TABLE IF EXISTS products CASCADE;
DROP TABLE IF EXISTS streamflow_sellers CASCADE;
DROP TABLE IF EXISTS users CASCADE;

-- 删除现有的枚举类型
DROP TYPE IF EXISTS pricing_model CASCADE;
DROP TYPE IF EXISTS subscription_period CASCADE;
DROP TYPE IF EXISTS product_zone CASCADE;
DROP TYPE IF EXISTS order_status CASCADE;
DROP TYPE IF EXISTS product_status CASCADE;

-- =====================================================
-- 1. 创建枚举类型
-- =====================================================

CREATE TYPE pricing_model AS ENUM ('one_time', 'subscription');
CREATE TYPE subscription_period AS ENUM ('daily', 'weekly', 'monthly', 'yearly');
CREATE TYPE product_zone AS ENUM ('courses', 'products', 'services', 'events', 'accommodation', 'all');
CREATE TYPE order_status AS ENUM ('pending', 'processing', 'active', 'completed', 'cancelled', 'failed');
CREATE TYPE product_status AS ENUM ('active', 'inactive', 'deleted');

-- =====================================================
-- 2. 创建用户表 (users)
-- =====================================================

CREATE TABLE users (
    -- 主键和基础信息
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email VARCHAR(255) UNIQUE NOT NULL CHECK (email ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$'),
    username VARCHAR(50) UNIQUE NOT NULL CHECK (length(username) >= 3),
    
    -- 个人信息
    bio TEXT DEFAULT '',
    avatar VARCHAR(500) DEFAULT 'https://avatars.githubusercontent.com/u/190834534?s=200&v=4',
    
    -- 钱包和社交信息
    wallet_address VARCHAR(44) UNIQUE, -- Solana钱包地址长度
    social_wechat VARCHAR(100),
    social_alipay VARCHAR(100),
    social_linkedin VARCHAR(200),
    social_website VARCHAR(200),
    
    -- 验证和状态
    email_verified BOOLEAN DEFAULT FALSE,
    is_active BOOLEAN DEFAULT TRUE,
    
    -- 时间戳
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- =====================================================
-- 3. 创建产品表 (products)
-- =====================================================

CREATE TABLE products (
    -- 主键和基础信息
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(200) NOT NULL CHECK (length(name) >= 3),
    description TEXT NOT NULL CHECK (length(description) >= 10),
    
    -- 作者信息
    author_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    author_name VARCHAR(50) NOT NULL, -- 冗余存储提升查询性能
    
    -- 价格信息
    price DECIMAL(10,2) NOT NULL CHECK (price >= 0),
    currency VARCHAR(10) NOT NULL DEFAULT 'SOL',
    
    -- 分类和专区
    category VARCHAR(100) NOT NULL,
    zone product_zone NOT NULL DEFAULT 'products',
    
    -- 定价模式
    pricing_model pricing_model NOT NULL DEFAULT 'one_time',
    product_type VARCHAR(20) NOT NULL DEFAULT 'product', -- 兼容旧字段
    
    -- 订阅相关字段
    subscription_period subscription_period,
    subscription_duration INTEGER, -- 持续时长（月数）
    subscription_price_per_period DECIMAL(10,2), -- 每期价格
    subscription_prices JSONB, -- 灵活价格配置: {"monthly": 29.99, "yearly": 299.99}
    
    -- 媒体和标签
    images JSONB DEFAULT '[]'::jsonb, -- [{"url": "...", "alt": "..."}]
    tags JSONB DEFAULT '[]'::jsonb, -- [{"type": "ai", "label": "Code Generation"}]
    
    -- 统计数据
    views INTEGER DEFAULT 0 CHECK (views >= 0),
    likes INTEGER DEFAULT 0 CHECK (likes >= 0),
    rating DECIMAL(3,2) DEFAULT 0.0 CHECK (rating >= 0 AND rating <= 5),
    
    -- 状态
    status product_status NOT NULL DEFAULT 'active',
    
    -- 时间戳
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- =====================================================
-- 4. 创建产品图片表 (product_images)
-- =====================================================

CREATE TABLE product_images (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
    image_url VARCHAR(500) NOT NULL,
    image_type VARCHAR(20) DEFAULT 'default', -- default, thumbnail, gallery
    is_primary BOOLEAN DEFAULT FALSE,
    display_order INTEGER DEFAULT 0,
    alt_text VARCHAR(200),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- =====================================================
-- 5. 创建StreamFlow卖家表 (streamflow_sellers)
-- =====================================================

CREATE TABLE streamflow_sellers (
    user_id UUID PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
    streamflow_seller_id VARCHAR(100) NOT NULL UNIQUE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- =====================================================
-- 6. 创建订单表 (orders)
-- =====================================================

CREATE TABLE orders (
    -- 主键和基础信息
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    
    -- 关联信息
    product_id UUID NOT NULL REFERENCES products(id) ON DELETE RESTRICT,
    buyer_id UUID NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
    seller_id UUID NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
    
    -- 价格信息
    total_amount DECIMAL(10,2) NOT NULL CHECK (total_amount >= 0),
    currency VARCHAR(10) NOT NULL DEFAULT 'SOL',
    
    -- StreamFlow相关
    streamflow_stream_id VARCHAR(100),
    streamflow_seller_id VARCHAR(100),
    
    -- 钱包地址
    buyer_wallet_address VARCHAR(44),
    seller_wallet_address VARCHAR(44),
    
    -- 状态
    status order_status NOT NULL DEFAULT 'pending',
    
    -- 产品类型和订阅信息
    product_type VARCHAR(20) NOT NULL DEFAULT 'product',
    subscription_period subscription_period,
    subscription_duration INTEGER,
    subscription_start_date TIMESTAMPTZ,
    subscription_end_date TIMESTAMPTZ,
    
    -- Stream支付参数
    stream_amount VARCHAR(50), -- 以字符串存储精确的区块链金额
    stream_amount_per_period VARCHAR(50),
    stream_period_seconds INTEGER,
    stream_start_time VARCHAR(50),
    stream_end_time VARCHAR(50),
    
    -- 错误处理
    error_message TEXT,
    retry_count INTEGER DEFAULT 0 CHECK (retry_count >= 0),
    last_retry_at TIMESTAMPTZ,
    
    -- 时间戳
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- =====================================================
-- 7. 创建索引优化查询性能
-- =====================================================

-- 用户表索引
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_username ON users(username);
CREATE INDEX idx_users_wallet_address ON users(wallet_address) WHERE wallet_address IS NOT NULL;
CREATE INDEX idx_users_active ON users(is_active);

-- 产品表索引
CREATE INDEX idx_products_author ON products(author_id, status);
CREATE INDEX idx_products_category ON products(category, status);
CREATE INDEX idx_products_zone ON products(zone, status);
CREATE INDEX idx_products_price ON products(price, status);
CREATE INDEX idx_products_created ON products(created_at DESC);
CREATE INDEX idx_products_views ON products(views DESC);
CREATE INDEX idx_products_likes ON products(likes DESC);
CREATE INDEX idx_products_rating ON products(rating DESC);
CREATE INDEX idx_products_search ON products USING gin(to_tsvector('english', name || ' ' || description));

-- 产品图片表索引
CREATE INDEX idx_product_images_product ON product_images(product_id, display_order);
CREATE INDEX idx_product_images_primary ON product_images(product_id, is_primary) WHERE is_primary = true;

-- 订单表索引
CREATE INDEX idx_orders_buyer ON orders(buyer_id, status);
CREATE INDEX idx_orders_seller ON orders(seller_id, status);
CREATE INDEX idx_orders_product ON orders(product_id, status);
CREATE INDEX idx_orders_created ON orders(created_at DESC);
CREATE INDEX idx_orders_streamflow ON orders(streamflow_stream_id) WHERE streamflow_stream_id IS NOT NULL;

-- =====================================================
-- 8. 创建触发器函数
-- =====================================================

-- 更新 updated_at 的触发器函数
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- 为需要的表添加 updated_at 触发器
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_products_updated_at BEFORE UPDATE ON products
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_orders_updated_at BEFORE UPDATE ON orders
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- =====================================================
-- 9. 创建实用函数
-- =====================================================

-- 增加产品浏览次数
CREATE OR REPLACE FUNCTION increment_product_views(product_id UUID)
RETURNS void AS $$
BEGIN
    UPDATE products 
    SET views = views + 1, updated_at = NOW()
    WHERE id = product_id;
END;
$$ LANGUAGE plpgsql;

-- 切换产品点赞状态
CREATE OR REPLACE FUNCTION toggle_product_like(product_id UUID, increment BOOLEAN)
RETURNS void AS $$
BEGIN
    IF increment THEN
        UPDATE products 
        SET likes = likes + 1, updated_at = NOW()
        WHERE id = product_id;
    ELSE
        UPDATE products 
        SET likes = GREATEST(likes - 1, 0), updated_at = NOW()
        WHERE id = product_id;
    END IF;
END;
$$ LANGUAGE plpgsql;

-- 同步产品作者名称
CREATE OR REPLACE FUNCTION sync_product_author_name()
RETURNS TRIGGER AS $$
BEGIN
    -- 当用户名更新时，同步更新所有相关产品的作者名
    IF OLD.username != NEW.username THEN
        UPDATE products 
        SET author_name = NEW.username, updated_at = NOW()
        WHERE author_id = NEW.id;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER sync_product_author_name_trigger 
    AFTER UPDATE OF username ON users
    FOR EACH ROW EXECUTE FUNCTION sync_product_author_name();

-- =====================================================
-- 10. RLS (Row Level Security) 安全策略
-- =====================================================

-- 启用 RLS
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE product_images ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE streamflow_sellers ENABLE ROW LEVEL SECURITY;

-- 用户表策略：用户只能查看和修改自己的数据
CREATE POLICY "Users can view own profile" ON users
    FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON users
    FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Enable public user profiles for read" ON users
    FOR SELECT USING (true);

-- 产品表策略：所有人可查看活跃产品，作者可管理自己的产品
CREATE POLICY "Anyone can view active products" ON products
    FOR SELECT USING (status = 'active' OR auth.uid() = author_id);

CREATE POLICY "Authors can insert products" ON products
    FOR INSERT WITH CHECK (auth.uid() = author_id);

CREATE POLICY "Authors can update own products" ON products
    FOR UPDATE USING (auth.uid() = author_id);

CREATE POLICY "Authors can delete own products" ON products
    FOR DELETE USING (auth.uid() = author_id);

-- 产品图片表策略
CREATE POLICY "Anyone can view product images" ON product_images
    FOR SELECT USING (EXISTS (
        SELECT 1 FROM products WHERE products.id = product_images.product_id 
        AND (products.status = 'active' OR auth.uid() = products.author_id)
    ));

CREATE POLICY "Authors can manage product images" ON product_images
    FOR ALL USING (EXISTS (
        SELECT 1 FROM products WHERE products.id = product_images.product_id 
        AND auth.uid() = products.author_id
    ));

-- 订单表策略：买家和卖家可查看相关订单
CREATE POLICY "Users can view own orders" ON orders
    FOR SELECT USING (auth.uid() = buyer_id OR auth.uid() = seller_id);

CREATE POLICY "Buyers can create orders" ON orders
    FOR INSERT WITH CHECK (auth.uid() = buyer_id);

CREATE POLICY "Users can update own orders" ON orders
    FOR UPDATE USING (auth.uid() = buyer_id OR auth.uid() = seller_id);

-- StreamFlow卖家表策略
CREATE POLICY "Users can view own streamflow seller" ON streamflow_sellers
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can manage own streamflow seller" ON streamflow_sellers
    FOR ALL USING (auth.uid() = user_id);

-- =====================================================
-- 11. 插入初始测试数据
-- =====================================================

-- 注意：实际的用户认证数据会通过Supabase Auth系统创建
-- 这里只是为了测试目的创建一些占位数据

-- 插入测试用户（这些用户需要通过Supabase Auth注册）
INSERT INTO users (id, email, username, bio, email_verified, is_active) VALUES
    ('8ab146dd-9e5d-4046-9b14-04bc5e2c8a73', 'test@example.com', 'testuser', 'Test user for development', true, true),
    ('9bc257ee-0f6e-5157-ac25-15cd6f3d9b84', 'admin@workwork.com', 'admin', 'Administrator account', true, true)
ON CONFLICT (id) DO NOTHING;

-- 插入测试产品
INSERT INTO products (
    name, description, author_id, author_name, price, currency, category, zone,
    pricing_model, product_type, tags, images, views, likes, rating, status
) VALUES 
    (
        'AI Code Generator Pro',
        'Advanced AI-powered code generation tool for Solana smart contracts. Generate secure, optimized Rust code with built-in best practices and automated testing.',
        '8ab146dd-9e5d-4046-9b14-04bc5e2c8a73',
        'testuser',
        49.99,
        'SOL',
        'AI Tools',
        'products',
        'one_time',
        'product',
        '[{"type": "ai", "label": "Code Generation"}, {"type": "crypto", "label": "Solana"}, {"type": "education", "label": "Development"}]'::jsonb,
        '[{"url": "https://avatars.githubusercontent.com/u/190834534?s=200&v=4", "alt": "AI Code Generator Pro"}]'::jsonb,
        1247,
        89,
        4.8,
        'active'
    ),
    (
        'DeFi Analytics Dashboard',
        'Comprehensive analytics platform for DeFi protocols on Solana. Real-time data, yield tracking, and risk assessment tools for professional traders.',
        '8ab146dd-9e5d-4046-9b14-04bc5e2c8a73',
        'testuser',
        29.99,
        'SOL',
        'Analytics',
        'services',
        'one_time',
        'product',
        '[{"type": "crypto", "label": "DeFi"}, {"type": "education", "label": "Analytics"}, {"type": "crypto", "label": "Trading"}]'::jsonb,
        '[{"url": "https://avatars.githubusercontent.com/u/190834534?s=200&v=4", "alt": "DeFi Analytics Dashboard"}]'::jsonb,
        2156,
        156,
        4.7,
        'active'
    ),
    (
        'Solana Developer Bootcamp',
        'Intensive 8-week online bootcamp covering Solana development from basics to advanced topics. Includes live coding sessions, projects, and mentorship.',
        '9bc257ee-0f6e-5157-ac25-15cd6f3d9b84',
        'admin',
        199.99,
        'SOL',
        'Education',
        'courses',
        'subscription',
        'subscription',
        '[{"type": "education", "label": "Bootcamp"}, {"type": "crypto", "label": "Solana"}, {"type": "education", "label": "Programming"}]'::jsonb,
        '[{"url": "https://avatars.githubusercontent.com/u/190834534?s=200&v=4", "alt": "Solana Developer Bootcamp"}]'::jsonb,
        3421,
        298,
        4.9,
        'active'
    );

-- 为每个产品添加主图片到 product_images 表
INSERT INTO product_images (product_id, image_url, image_type, is_primary, display_order, alt_text)
SELECT 
    p.id,
    'https://avatars.githubusercontent.com/u/190834534?s=200&v=4',
    'default',
    true,
    0,
    p.name || ' - Main Image'
FROM products p;

-- =====================================================
-- 完成信息
-- =====================================================

-- 显示创建结果
SELECT 'SCHEMA SETUP COMPLETE' as status;
SELECT 'USERS COUNT' as info, COUNT(*) as count FROM users;
SELECT 'PRODUCTS COUNT' as info, COUNT(*) as count FROM products;
SELECT 'PRODUCT IMAGES COUNT' as info, COUNT(*) as count FROM product_images;