-- 统一修改所有产品图片为默认头像
-- 执行时间: 2024-12-XX

-- 将所有现有产品的图片URL修改为统一的GitHub头像
UPDATE products 
SET image_url = 'https://avatars.githubusercontent.com/u/190834534?s=200&v=4',
    updated_at = NOW()
WHERE image_url IS NOT NULL OR image_url != 'https://avatars.githubusercontent.com/u/190834534?s=200&v=4';

-- 将空图片URL的产品也设置为默认头像
UPDATE products 
SET image_url = 'https://avatars.githubusercontent.com/u/190834534?s=200&v=4',
    updated_at = NOW()
WHERE image_url IS NULL;

-- 验证更新结果
-- SELECT COUNT(*) as total_products, 
--        COUNT(CASE WHEN image_url = 'https://avatars.githubusercontent.com/u/190834534?s=200&v=4' THEN 1 END) as updated_images
-- FROM products 
-- WHERE status = 'active';