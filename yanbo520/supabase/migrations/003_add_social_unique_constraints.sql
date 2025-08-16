-- 为社交账号字段添加唯一性约束，防止用户间重复
-- 注意：只对非空值添加唯一约束

-- 为微信账号添加唯一约束（排除空值和NULL）
CREATE UNIQUE INDEX idx_users_social_wechat_unique 
ON users (social_wechat) 
WHERE social_wechat IS NOT NULL AND social_wechat != '';

-- 为支付宝账号添加唯一约束（排除空值和NULL）
CREATE UNIQUE INDEX idx_users_social_alipay_unique 
ON users (social_alipay) 
WHERE social_alipay IS NOT NULL AND social_alipay != '';

-- 为LinkedIn添加唯一约束（排除空值和NULL）
CREATE UNIQUE INDEX idx_users_social_linkedin_unique 
ON users (social_linkedin) 
WHERE social_linkedin IS NOT NULL AND social_linkedin != '';

-- 为个人网站添加唯一约束（排除空值和NULL）
CREATE UNIQUE INDEX idx_users_social_website_unique 
ON users (social_website) 
WHERE social_website IS NOT NULL AND social_website != '';

-- 添加钱包地址的唯一约束（如果还没有的话）
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint 
        WHERE conname = 'users_wallet_address_key'
    ) THEN
        ALTER TABLE users ADD CONSTRAINT users_wallet_address_unique 
        UNIQUE (wallet_address);
    END IF;
END $$;