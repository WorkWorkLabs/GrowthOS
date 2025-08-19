-- 修复订阅周期定义，添加daily和weekly支持
-- Migration: 012_fix_subscription_periods.sql

-- 先删除现有约束
ALTER TABLE products DROP CONSTRAINT IF EXISTS products_subscription_period_check;
ALTER TABLE orders DROP CONSTRAINT IF EXISTS orders_subscription_period_check;

-- 更新产品表的订阅周期约束
ALTER TABLE products 
ADD CONSTRAINT products_subscription_period_check 
CHECK (subscription_period IN ('daily', 'weekly', 'monthly', 'quarterly', 'yearly'));

-- 更新订单表的订阅周期约束  
ALTER TABLE orders
ADD CONSTRAINT orders_subscription_period_check
CHECK (subscription_period IN ('daily', 'weekly', 'monthly', 'quarterly', 'yearly'));

-- 更新订阅周期枚举（如果存在）
DROP TYPE IF EXISTS subscription_period CASCADE;
CREATE TYPE subscription_period AS ENUM ('daily', 'weekly', 'monthly', 'quarterly', 'yearly');

-- 添加注释说明
COMMENT ON COLUMN products.subscription_period IS '订阅周期：daily/weekly/monthly/quarterly/yearly';
COMMENT ON COLUMN products.subscription_duration IS '订阅总时长（以周期为单位）';
COMMENT ON COLUMN products.subscription_price_per_period IS '每个订阅周期的价格';