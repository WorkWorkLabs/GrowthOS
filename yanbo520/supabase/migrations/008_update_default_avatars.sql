-- Update all users with dicebear avatars to use the GitHub avatar
UPDATE users 
SET avatar = 'https://avatars.githubusercontent.com/u/190834534?s=200&v=4'
WHERE avatar LIKE '%dicebear.com%' OR avatar IS NULL;

-- Update any remaining sample users that might have dicebear avatars
UPDATE users 
SET avatar = 'https://avatars.githubusercontent.com/u/190834534?s=200&v=4'
WHERE avatar LIKE '%avataaars%';

-- Also update the user metadata in auth.users if needed
UPDATE auth.users 
SET raw_user_meta_data = jsonb_set(
  COALESCE(raw_user_meta_data, '{}'),
  '{avatar}',
  '"https://avatars.githubusercontent.com/u/190834534?s=200&v=4"'
)
WHERE raw_user_meta_data->>'avatar' LIKE '%dicebear.com%' 
   OR raw_user_meta_data->>'avatar' IS NULL;