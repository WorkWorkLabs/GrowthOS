-- 添加多图支持
-- 将单个image_url字段改为images数组

-- 1. 检查并删除依赖视图（如果存在）
DROP VIEW IF EXISTS products_with_primary_image CASCADE;

-- 2. 备份现有图片数据到临时列
ALTER TABLE products ADD COLUMN temp_image_url TEXT;
UPDATE products SET temp_image_url = image_url WHERE image_url IS NOT NULL;

-- 3. 删除旧的image_url字段（现在没有依赖了）
ALTER TABLE products DROP COLUMN image_url;

-- 4. 添加新的images JSONB字段
ALTER TABLE products ADD COLUMN images JSONB DEFAULT '[]'::jsonb;

-- 5. 将备份的图片数据迁移到新的images数组格式
UPDATE products 
SET images = CASE 
  WHEN temp_image_url IS NOT NULL THEN 
    jsonb_build_array(jsonb_build_object('url', temp_image_url, 'alt', name || ' - Product Image'))
  ELSE 
    '[]'::jsonb
END;

-- 6. 为没有图片的产品设置默认图片
UPDATE products 
SET images = jsonb_build_array(
  jsonb_build_object(
    'url', 'https://avatars.githubusercontent.com/u/190834534?s=200&v=4',
    'alt', name || ' - Default Image'
  )
)
WHERE images = '[]'::jsonb OR images IS NULL;

-- 7. 删除临时列
ALTER TABLE products DROP COLUMN temp_image_url;

-- 8. 创建GIN索引用于images字段查询
CREATE INDEX idx_products_images ON products USING GIN (images);

-- 9. 添加约束确保images是有效的JSON数组
ALTER TABLE products ADD CONSTRAINT check_images_is_array 
CHECK (jsonb_typeof(images) = 'array');

-- 10. 重新创建兼容性视图（如果需要）
-- CREATE VIEW products_with_primary_image AS 
-- SELECT 
--   *,
--   CASE 
--     WHEN jsonb_array_length(images) > 0 THEN 
--       images->0->>'url'
--     ELSE 
--       'https://avatars.githubusercontent.com/u/190834534?s=200&v=4'
--   END as image_url
-- FROM products;

-- 验证迁移结果
-- SELECT name, images FROM products LIMIT 5;