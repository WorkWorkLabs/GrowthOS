-- 添加订阅模式支持
-- Migration: 011_add_subscription_model.sql

-- 1. 创建定价模式枚举
CREATE TYPE pricing_model AS ENUM ('one_time', 'subscription');

-- 2. 创建订阅周期枚举  
CREATE TYPE subscription_period AS ENUM ('daily', 'weekly', 'monthly', 'yearly');

-- 3. 为products表添加订阅相关字段
ALTER TABLE products ADD COLUMN pricing_model pricing_model DEFAULT 'one_time' NOT NULL;
ALTER TABLE products ADD COLUMN subscription_period subscription_period DEFAULT NULL;
ALTER TABLE products ADD COLUMN subscription_prices JSONB DEFAULT NULL;

-- 4. 添加约束：如果是订阅模式，必须有订阅周期和价格
ALTER TABLE products ADD CONSTRAINT check_subscription_fields 
  CHECK (
    (pricing_model = 'one_time' AND subscription_period IS NULL AND subscription_prices IS NULL) OR
    (pricing_model = 'subscription' AND subscription_period IS NOT NULL AND subscription_prices IS NOT NULL)
  );

-- 5. 更新现有产品为一次性购买模式
UPDATE products SET pricing_model = 'one_time' WHERE pricing_model IS NULL;

-- 6. 为订阅价格字段添加索引以提高查询性能
CREATE INDEX idx_products_pricing_model ON products(pricing_model);
CREATE INDEX idx_products_subscription_period ON products(subscription_period);

-- 7. 创建视图方便查询订阅产品
CREATE OR REPLACE VIEW subscription_products AS
SELECT 
  *,
  CASE 
    WHEN pricing_model = 'subscription' THEN
      COALESCE(subscription_prices->>(subscription_period::text), price::text)
    ELSE 
      price::text
  END as display_price
FROM products 
WHERE pricing_model = 'subscription';

-- 8. 创建视图方便查询一次性产品  
CREATE OR REPLACE VIEW one_time_products AS
SELECT * FROM products WHERE pricing_model = 'one_time';

-- 注释说明
COMMENT ON COLUMN products.pricing_model IS '定价模式：一次性购买或订阅制';
COMMENT ON COLUMN products.subscription_period IS '订阅周期：日/周/月/年，仅当pricing_model为subscription时使用';
COMMENT ON COLUMN products.subscription_prices IS '订阅价格配置，格式：{"daily": 0.99, "weekly": 4.99, "monthly": 19.99, "yearly": 199.99}';