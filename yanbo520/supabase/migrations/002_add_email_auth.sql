-- Drop existing table and recreate with new schema
DROP TABLE IF EXISTS users CASCADE;

-- Create enhanced users table with email authentication
CREATE TABLE users (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  username TEXT NOT NULL,
  bio TEXT,
  avatar TEXT,
  
  -- Web3 Integration (optional)
  wallet_address TEXT UNIQUE,
  
  -- Social Account Links
  social_wechat TEXT,
  social_alipay TEXT,
  social_linkedin TEXT,
  social_website TEXT,
  
  -- Account Status
  email_verified BOOLEAN DEFAULT false,
  is_active BOOLEAN DEFAULT true,
  
  -- Timestamps
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Recreate the update trigger
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_users_updated_at 
  BEFORE UPDATE ON users 
  FOR EACH ROW 
  EXECUTE FUNCTION update_updated_at_column();

-- Enable Row Level Security
ALTER TABLE users ENABLE ROW LEVEL SECURITY;

-- Updated RLS policies for email-based authentication
CREATE POLICY "Users can view all profiles" ON users FOR SELECT USING (true);
CREATE POLICY "Users can update own profile" ON users FOR UPDATE USING (auth.uid()::text = id::text);
CREATE POLICY "Users can insert own profile" ON users FOR INSERT WITH CHECK (auth.uid()::text = id::text);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_username ON users(username);
CREATE INDEX IF NOT EXISTS idx_users_wallet_address ON users(wallet_address);
CREATE INDEX IF NOT EXISTS idx_users_created_at ON users(created_at);

-- Insert sample data with email authentication
INSERT INTO users (email, username, bio, avatar, wallet_address, social_linkedin, social_website) VALUES 
  ('web3master@example.com', 'Web3 Master', 'Building the future of decentralized applications', 'https://api.dicebear.com/7.x/avataaars/svg?seed=web3master', '0x742d35Cc6634C0532925a3b8D41B2C02D32A8efb', 'https://linkedin.com/in/web3master', 'https://web3master.dev'),
  ('trader@example.com', 'Crypto Trader Pro', 'Professional trader with 5+ years experience', 'https://api.dicebear.com/7.x/avataaars/svg?seed=trader', '0x123...abc', '', 'https://cryptotrader.pro')
ON CONFLICT (email) DO NOTHING;