-- 创建用户设置表
CREATE TABLE user_settings (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE UNIQUE,
  
  -- 通知设置
  email_notifications BOOLEAN DEFAULT true,
  push_notifications BOOLEAN DEFAULT true,
  order_notifications BOOLEAN DEFAULT true,
  marketing_notifications BOOLEAN DEFAULT false,
  security_notifications BOOLEAN DEFAULT true,
  
  -- 隐私设置
  profile_visibility TEXT DEFAULT 'public' CHECK (profile_visibility IN ('public', 'private', 'contacts_only')),
  show_online_status BOOLEAN DEFAULT true,
  allow_contact_from_strangers BOOLEAN DEFAULT true,
  show_purchase_history BOOLEAN DEFAULT false,
  
  -- 界面设置
  language TEXT DEFAULT 'en' CHECK (language IN ('en', 'zh', 'es', 'fr', 'de', 'ja', 'ko')),
  theme TEXT DEFAULT 'light' CHECK (theme IN ('light', 'dark', 'auto')),
  currency_preference TEXT DEFAULT 'USD' CHECK (currency_preference IN ('USD', 'EUR', 'GBP', 'JPY', 'CNY', 'KRW', 'SOL')),
  timezone TEXT DEFAULT 'UTC',
  
  -- 安全设置
  two_factor_enabled BOOLEAN DEFAULT false,
  session_timeout INTEGER DEFAULT 7200, -- 2小时，单位秒
  require_password_change BOOLEAN DEFAULT false,
  
  -- API设置
  api_access_enabled BOOLEAN DEFAULT false,
  webhooks_enabled BOOLEAN DEFAULT false,
  
  -- 时间戳
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 创建索引
CREATE INDEX idx_user_settings_user_id ON user_settings(user_id);

-- 创建更新时间触发器
CREATE OR REPLACE FUNCTION update_user_settings_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_user_settings_updated_at
    BEFORE UPDATE ON user_settings
    FOR EACH ROW
    EXECUTE FUNCTION update_user_settings_updated_at();

-- 设置RLS策略
ALTER TABLE user_settings ENABLE ROW LEVEL SECURITY;

-- 允许用户管理自己的设置
CREATE POLICY "Allow users to manage their own settings" ON user_settings
    FOR ALL USING (auth.uid() = user_id);

-- 创建API密钥表（用于API访问）
CREATE TABLE user_api_keys (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  key_name TEXT NOT NULL,
  api_key TEXT NOT NULL UNIQUE,
  api_secret TEXT NOT NULL,
  permissions JSONB DEFAULT '[]'::jsonb, -- 权限列表
  last_used_at TIMESTAMP WITH TIME ZONE,
  expires_at TIMESTAMP WITH TIME ZONE,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 创建索引
CREATE INDEX idx_user_api_keys_user_id ON user_api_keys(user_id);
CREATE INDEX idx_user_api_keys_api_key ON user_api_keys(api_key);
CREATE INDEX idx_user_api_keys_active ON user_api_keys(is_active);

-- 设置RLS策略
ALTER TABLE user_api_keys ENABLE ROW LEVEL SECURITY;

-- 允许用户管理自己的API密钥
CREATE POLICY "Allow users to manage their own API keys" ON user_api_keys
    FOR ALL USING (auth.uid() = user_id);

-- 创建通知记录表
CREATE TABLE user_notifications (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  
  -- 通知内容
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('info', 'success', 'warning', 'error', 'order', 'security', 'marketing')),
  
  -- 通知状态
  is_read BOOLEAN DEFAULT false,
  is_archived BOOLEAN DEFAULT false,
  
  -- 关联数据
  related_id TEXT, -- 关联的订单ID、产品ID等
  related_type TEXT, -- 关联类型：order, product, user等
  
  -- 通知渠道
  sent_via_email BOOLEAN DEFAULT false,
  sent_via_push BOOLEAN DEFAULT false,
  
  -- 时间戳
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  read_at TIMESTAMP WITH TIME ZONE,
  archived_at TIMESTAMP WITH TIME ZONE
);

-- 创建索引
CREATE INDEX idx_user_notifications_user_id ON user_notifications(user_id);
CREATE INDEX idx_user_notifications_type ON user_notifications(type);
CREATE INDEX idx_user_notifications_is_read ON user_notifications(is_read);
CREATE INDEX idx_user_notifications_created_at ON user_notifications(created_at DESC);

-- 设置RLS策略
ALTER TABLE user_notifications ENABLE ROW LEVEL SECURITY;

-- 允许用户管理自己的通知
CREATE POLICY "Allow users to manage their own notifications" ON user_notifications
    FOR ALL USING (auth.uid() = user_id);

-- 为现有用户创建默认设置的函数
CREATE OR REPLACE FUNCTION create_default_user_settings()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO user_settings (user_id)
    VALUES (NEW.id)
    ON CONFLICT (user_id) DO NOTHING;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 为新用户自动创建默认设置
CREATE TRIGGER trigger_create_default_user_settings
    AFTER INSERT ON users
    FOR EACH ROW
    EXECUTE FUNCTION create_default_user_settings();

-- 为现有用户创建默认设置
INSERT INTO user_settings (user_id)
SELECT id FROM users
ON CONFLICT (user_id) DO NOTHING;