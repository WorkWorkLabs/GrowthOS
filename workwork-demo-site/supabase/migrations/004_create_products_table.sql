-- 创建产品表
CREATE TABLE products (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT NOT NULL,
  author_id UUID REFERENCES users(id) ON DELETE CASCADE,
  author_name TEXT NOT NULL, -- 冗余字段，便于查询
  price DECIMAL(10,2) NOT NULL,
  currency TEXT NOT NULL DEFAULT 'SOL',
  category TEXT NOT NULL,
  image_url TEXT,
  
  -- 统计数据
  views INTEGER DEFAULT 0,
  likes INTEGER DEFAULT 0,
  rating DECIMAL(3,2) DEFAULT 0.0,
  
  -- 标签（JSON格式存储）
  tags JSONB DEFAULT '[]'::jsonb,
  
  -- 产品状态
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'deleted')),
  
  -- 时间戳
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 创建索引
CREATE INDEX idx_products_author_id ON products(author_id);
CREATE INDEX idx_products_category ON products(category);
CREATE INDEX idx_products_status ON products(status);
CREATE INDEX idx_products_created_at ON products(created_at DESC);
CREATE INDEX idx_products_price ON products(price);
CREATE INDEX idx_products_rating ON products(rating DESC);
CREATE INDEX idx_products_views ON products(views DESC);
CREATE INDEX idx_products_likes ON products(likes DESC);

-- 为tags字段创建GIN索引，支持JSON查询
CREATE INDEX idx_products_tags ON products USING GIN (tags);

-- 创建更新时间触发器
CREATE OR REPLACE FUNCTION update_products_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_products_updated_at
    BEFORE UPDATE ON products
    FOR EACH ROW
    EXECUTE FUNCTION update_products_updated_at();

-- 设置RLS策略
ALTER TABLE products ENABLE ROW LEVEL SECURITY;

-- 允许所有人查看active状态的产品
CREATE POLICY "Allow public read access to active products" ON products
    FOR SELECT USING (status = 'active');

-- 允许作者管理自己的产品
CREATE POLICY "Allow authors to manage their own products" ON products
    FOR ALL USING (auth.uid() = author_id);

-- 允许认证用户创建产品
CREATE POLICY "Allow authenticated users to create products" ON products
    FOR INSERT WITH CHECK (auth.uid() = author_id);

-- 插入样例产品数据
INSERT INTO products (
  name, 
  description, 
  author_id, 
  author_name, 
  price, 
  currency, 
  category, 
  image_url, 
  views, 
  likes, 
  rating, 
  tags
) VALUES 
(
  'SolanaSwap DEX Platform',
  'A decentralized exchange built on Solana featuring lightning-fast swaps, yield farming, and liquidity mining. Our platform supports 500+ SPL tokens with minimal fees and institutional-grade security.',
  (SELECT id FROM users LIMIT 1),
  'CryptoBuilder',
  25.99,
  'SOL',
  'DeFi',
  'https://images.unsplash.com/photo-1639762681485-074b7f938ba0?w=400&h=300&fit=crop',
  1247,
  89,
  4.8,
  '[{"type": "crypto", "label": "DeFi"}, {"type": "ai", "label": "Automated"}, {"type": "crypto", "label": "Solana"}]'::jsonb
),
(
  'AI NFT Generator Pro',
  'Create stunning NFTs using advanced AI algorithms. Generate unique artwork, mint directly to Solana, and list on major marketplaces. Includes commercial license and batch generation tools.',
  (SELECT id FROM users LIMIT 1),
  'AIArtist',
  49.99,
  'SOL', 
  'AI Tools',
  'https://images.unsplash.com/photo-1617791160536-598cf32026fb?w=400&h=300&fit=crop',
  892,
  156,
  4.9,
  '[{"type": "ai", "label": "AI Art"}, {"type": "crypto", "label": "NFT"}, {"type": "ai", "label": "Generator"}]'::jsonb
),
(
  'DeFi Portfolio Tracker',
  'Comprehensive dashboard for tracking your DeFi investments across multiple chains. Real-time P&L, yield farming analytics, impermanent loss calculator, and tax reporting features.',
  (SELECT id FROM users LIMIT 1),
  'DeFiDev',
  19.99,
  'SOL',
  'Analytics',
  'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=400&h=300&fit=crop',
  2341,
  234,
  4.7,
  '[{"type": "crypto", "label": "DeFi"}, {"type": "education", "label": "Analytics"}, {"type": "crypto", "label": "Portfolio"}]'::jsonb
),
(
  'Smart Contract Auditor',
  'Automated smart contract security analysis tool powered by AI. Detects vulnerabilities, gas optimization opportunities, and provides detailed security reports for Solana programs.',
  (SELECT id FROM users LIMIT 1),
  'SecurityPro',
  79.99,
  'SOL',
  'Security',
  'https://images.unsplash.com/photo-1560472354-b33ff0c44a43?w=400&h=300&fit=crop',
  567,
  78,
  4.6,
  '[{"type": "ai", "label": "Security"}, {"type": "crypto", "label": "Smart Contracts"}, {"type": "education", "label": "Audit"}]'::jsonb
),
(
  'Crypto Trading Bot Academy',
  'Complete course on building and deploying trading bots for crypto markets. Includes Python code, strategy backtesting, risk management, and live trading setup with API integrations.',
  (SELECT id FROM users LIMIT 1),
  'TradingGuru',
  129.99,
  'SOL',
  'Education',
  'https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?w=400&h=300&fit=crop',
  3456,
  445,
  4.9,
  '[{"type": "education", "label": "Trading"}, {"type": "ai", "label": "Automation"}, {"type": "crypto", "label": "Bots"}]'::jsonb
),
(
  'Web3 Social Network Starter',
  'Open-source social platform template with wallet authentication, NFT profile pictures, token-gated communities, and decentralized messaging. Built with React and Solana.',
  (SELECT id FROM users LIMIT 1),
  'Web3Builder',
  39.99,
  'SOL',
  'Templates',
  'https://images.unsplash.com/photo-1611095790444-1dfa35800054?w=400&h=300&fit=crop',
  1123,
  167,
  4.5,
  '[{"type": "crypto", "label": "Web3"}, {"type": "education", "label": "Social"}, {"type": "crypto", "label": "Template"}]'::jsonb
),
(
  'Yield Farming Calculator',
  'Advanced calculator for DeFi yield farming strategies. Compare APY across protocols, calculate impermanent loss, optimize liquidity positions, and track historical performance.',
  (SELECT id FROM users LIMIT 1),
  'YieldHacker',
  14.99,
  'SOL',
  'Tools',
  'https://images.unsplash.com/photo-1559526324-4b87b5e36e44?w=400&h=300&fit=crop',
  834,
  92,
  4.4,
  '[{"type": "crypto", "label": "DeFi"}, {"type": "education", "label": "Calculator"}, {"type": "crypto", "label": "Yield"}]'::jsonb
),
(
  'AI Crypto News Aggregator',
  'Intelligent news aggregation platform that analyzes crypto market sentiment, summarizes key events, and provides AI-powered market insights. Includes price alerts and social media monitoring.',
  (SELECT id FROM users LIMIT 1),
  'NewsAI',
  24.99,
  'SOL',
  'Analytics',
  'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=300&fit=crop',
  1567,
  203,
  4.7,
  '[{"type": "ai", "label": "News"}, {"type": "crypto", "label": "Analytics"}, {"type": "ai", "label": "Sentiment"}]'::jsonb
);

-- 创建一个函数来更新产品统计数据
CREATE OR REPLACE FUNCTION increment_product_views(product_id UUID)
RETURNS VOID AS $$
BEGIN
    UPDATE products 
    SET views = views + 1 
    WHERE id = product_id;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION toggle_product_like(product_id UUID, increment BOOLEAN)
RETURNS VOID AS $$
BEGIN
    IF increment THEN
        UPDATE products 
        SET likes = likes + 1 
        WHERE id = product_id;
    ELSE
        UPDATE products 
        SET likes = GREATEST(likes - 1, 0) 
        WHERE id = product_id;
    END IF;
END;
$$ LANGUAGE plpgsql;