-- Add product category zones functionality
-- ==========================================

BEGIN;

-- 1. Create product zone enum type
-- ==========================================
CREATE TYPE product_zone AS ENUM (
  'courses',      -- Courses zone
  'products',     -- Products zone  
  'services',     -- Services zone
  'events',       -- Events zone
  'accommodation' -- Accommodation zone
);

-- 2. Add zone field to products table
-- ==========================================
ALTER TABLE products 
ADD COLUMN zone product_zone DEFAULT 'courses';

-- 3. Create index for zone field
-- ==========================================
CREATE INDEX idx_products_zone ON products(zone);

-- 4. Categorize existing products into courses zone
-- ==========================================
UPDATE products 
SET zone = 'courses' 
WHERE zone IS NULL;

-- 5. Update product categories to better fit zone concept
-- ==========================================
-- Existing category mapping to new zones:
-- - Education, AI Tools, Analytics, Tools → courses
-- - Templates, NFT Tools → products  
-- - Others remain in courses zone

-- Move obvious product types to products zone
UPDATE products 
SET zone = 'products' 
WHERE category IN ('Templates', 'NFT Tools');

-- 6. Create zone-related helper functions
-- ==========================================

-- Get zone statistics
CREATE OR REPLACE FUNCTION get_zone_stats()
RETURNS TABLE(
  zone_name product_zone,
  product_count bigint,
  total_views bigint,
  avg_rating numeric
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    p.zone,
    COUNT(*) as product_count,
    COALESCE(SUM(p.views), 0) as total_views,
    COALESCE(AVG(p.rating), 0) as avg_rating
  FROM products p
  WHERE p.status = 'active'
  GROUP BY p.zone
  ORDER BY p.zone;
END;
$$ LANGUAGE plpgsql;

-- 7. Update RLS policies to support zone filtering
-- ==========================================

-- Add comment to existing policy for clarity
COMMENT ON POLICY "Allow public read access to active products" ON products 
IS 'Allows public to read active products across all zones';

-- 8. Insert sample data for different zones
-- ==========================================

-- Get a test user ID
WITH test_user AS (
  SELECT id, username FROM users LIMIT 1
)

-- Insert sample products for other zones
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
  product_zone::product_zone,
  'one_time'::pricing_model,
  'product',
  'active',
  product_tags::jsonb,
  product_images::jsonb,
  product_views,
  product_likes,
  product_rating
FROM test_user, (
  VALUES 
    -- Services zone example
    (
      'Web3 Project Technical Consulting',
      'Professional Web3 technical consulting services to help your project from concept to deployment. Includes architecture design, smart contract development guidance, security audit recommendations.',
      299.99,
      'Technical Consulting',
      'services',
      '[{"type": "crypto", "label": "Web3"}, {"type": "education", "label": "Consulting"}, {"type": "crypto", "label": "Technical"}]',
      '[{"url": "https://avatars.githubusercontent.com/u/190834534?s=200&v=4", "alt": "Web3 Project Technical Consulting"}]',
      456,
      23,
      4.8
    ),
    -- Events zone example
    (
      'Solana Developer Conference Ticket',
      '2024 Annual Solana Developer Conference ticket, includes two days of technical presentations, hands-on workshops, and networking dinner. Perfect opportunity to connect with top developers.',
      89.99,
      'Conference Ticket',
      'events',
      '[{"type": "education", "label": "Conference"}, {"type": "crypto", "label": "Solana"}, {"type": "education", "label": "Networking"}]',
      '[{"url": "https://avatars.githubusercontent.com/u/190834534?s=200&v=4", "alt": "Solana Developer Conference Ticket"}]',
      789,
      67,
      4.9
    ),
    -- Accommodation zone example
    (
      'Web3 Co-working Space Monthly Rental',
      'Web3-themed co-working space located in the heart of Silicon Valley, 24/7 access, high-speed internet, meeting rooms, plus regular tech sharing events.',
      399.99,
      'Co-working Space',
      'accommodation',
      '[{"type": "education", "label": "Co-working"}, {"type": "crypto", "label": "Web3"}, {"type": "education", "label": "Space"}]',
      '[{"url": "https://avatars.githubusercontent.com/u/190834534?s=200&v=4", "alt": "Web3 Co-working Space Monthly Rental"}]',
      234,
      12,
      4.6
    )
) AS new_products(
  product_name, 
  product_description, 
  product_price, 
  product_category,
  product_zone,
  product_tags, 
  product_images,
  product_views,
  product_likes,
  product_rating
)
WHERE EXISTS (SELECT 1 FROM test_user);

-- 9. Display migration results
-- ==========================================

-- Show zone product statistics
SELECT 
  '=== Zone Product Statistics ===' as info,
  zone,
  COUNT(*) as product_count,
  AVG(price) as avg_price,
  SUM(views) as total_views
FROM products 
WHERE status = 'active'
GROUP BY zone
ORDER BY zone;

-- Show all products' zone distribution
SELECT 
  '=== Product Zone Distribution ===' as info,
  name as product_name,
  zone,
  category,
  price
FROM products 
WHERE status = 'active'
ORDER BY zone, name;

COMMIT;