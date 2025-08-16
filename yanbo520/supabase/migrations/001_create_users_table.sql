-- Create users table for storing basic user profile information
CREATE TABLE IF NOT EXISTS users (
  wallet_address TEXT PRIMARY KEY,
  username TEXT NOT NULL,
  bio TEXT,
  avatar TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create function to automatically update updated_at column
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create trigger to automatically update updated_at when row is modified
CREATE TRIGGER update_users_updated_at 
  BEFORE UPDATE ON users 
  FOR EACH ROW 
  EXECUTE FUNCTION update_updated_at_column();

-- Enable Row Level Security (RLS)
ALTER TABLE users ENABLE ROW LEVEL SECURITY;

-- Create policies for RLS (anyone can read, only owner can update)
CREATE POLICY "Users can view all profiles" ON users FOR SELECT USING (true);
CREATE POLICY "Users can update own profile" ON users FOR UPDATE USING (true);
CREATE POLICY "Users can insert own profile" ON users FOR INSERT WITH CHECK (true);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_users_username ON users(username);
CREATE INDEX IF NOT EXISTS idx_users_created_at ON users(created_at);

-- Insert some sample data for testing
INSERT INTO users (wallet_address, username, bio, avatar) VALUES 
  ('0x742d35Cc6634C0532925a3b8D41B2C02D32A8efb', 'Web3 Master', 'Building the future of decentralized applications', 'https://api.dicebear.com/7.x/avataaars/svg?seed=web3master'),
  ('0x123...abc', 'Crypto Trader Pro', 'Professional trader with 5+ years experience', 'https://api.dicebear.com/7.x/avataaars/svg?seed=trader')
ON CONFLICT (wallet_address) DO NOTHING;