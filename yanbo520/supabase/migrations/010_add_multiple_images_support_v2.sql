-- 添加多图支持（保守方案）
-- 保留image_url字段，添加images字段

-- 1. 添加新的images JSONB字段
ALTER TABLE products ADD COLUMN images JSONB DEFAULT '[]'::jsonb;

-- 2. 将现有image_url数据迁移到images数组格式
UPDATE products 
SET images = CASE 
  WHEN image_url IS NOT NULL AND image_url != '' THEN 
    jsonb_build_array(jsonb_build_object('url', image_url, 'alt', name || ' - Product Image'))
  ELSE 
    '[]'::jsonb
END;

-- 3. 为没有图片的产品设置默认图片
UPDATE products 
SET images = jsonb_build_array(
  jsonb_build_object(
    'url', 'https://avatars.githubusercontent.com/u/190834534?s=200&v=4',
    'alt', name || ' - Default Image'
  )
)
WHERE images = '[]'::jsonb OR images IS NULL;

-- 4. 同时更新image_url字段为第一张图片（保持同步）
UPDATE products 
SET image_url = images->0->>'url'
WHERE jsonb_array_length(images) > 0;

-- 5. 创建GIN索引用于images字段查询
CREATE INDEX idx_products_images ON products USING GIN (images);

-- 6. 添加约束确保images是有效的JSON数组
ALTER TABLE products ADD CONSTRAINT check_images_is_array 
CHECK (jsonb_typeof(images) = 'array');

-- 7. 创建触发器函数，保持image_url和images同步
CREATE OR REPLACE FUNCTION sync_product_images()
RETURNS TRIGGER AS $$
BEGIN
    -- 当images更新时，同步更新image_url
    IF TG_OP = 'UPDATE' AND OLD.images IS DISTINCT FROM NEW.images THEN
        IF jsonb_array_length(NEW.images) > 0 THEN
            NEW.image_url := NEW.images->0->>'url';
        ELSE
            NEW.image_url := 'https://avatars.githubusercontent.com/u/190834534?s=200&v=4';
        END IF;
    END IF;
    
    -- 当image_url更新时，同步更新images（如果images为空或只有一张图）
    IF TG_OP = 'UPDATE' AND OLD.image_url IS DISTINCT FROM NEW.image_url THEN
        IF jsonb_array_length(NEW.images) <= 1 THEN
            NEW.images := jsonb_build_array(
                jsonb_build_object('url', NEW.image_url, 'alt', NEW.name || ' - Product Image')
            );
        END IF;
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 8. 创建触发器
CREATE TRIGGER trigger_sync_product_images
    BEFORE UPDATE ON products
    FOR EACH ROW
    EXECUTE FUNCTION sync_product_images();

-- 验证迁移结果
-- SELECT name, image_url, images FROM products LIMIT 5;