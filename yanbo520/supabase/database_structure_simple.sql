-- 简化的数据库结构查询脚本
-- 分段查询避免复杂UNION导致的问题

-- ===========================================
-- 1. 查看所有表
-- ===========================================
\echo '=== ALL TABLES ==='
SELECT table_name, table_type
FROM information_schema.tables 
WHERE table_schema = 'public' 
ORDER BY table_name;

-- ===========================================
-- 2. 查看所有列详细信息
-- ===========================================
\echo '=== ALL COLUMNS ==='
SELECT 
  table_name,
  column_name,
  CASE 
    WHEN data_type = 'USER-DEFINED' THEN udt_name
    WHEN data_type = 'ARRAY' THEN udt_name
    ELSE data_type 
  END as data_type,
  is_nullable,
  column_default
FROM information_schema.columns 
WHERE table_schema = 'public'
ORDER BY table_name, column_name;

-- ===========================================
-- 3. 查看所有约束
-- ===========================================
\echo '=== ALL CONSTRAINTS ==='
SELECT 
  tc.table_name,
  tc.constraint_name,
  tc.constraint_type,
  kcu.column_name,
  CASE 
    WHEN tc.constraint_type = 'FOREIGN KEY' THEN 
      CONCAT('REFERENCES ', ccu.table_name, '(', ccu.column_name, ')')
    ELSE ''
  END as reference_info
FROM information_schema.table_constraints tc
LEFT JOIN information_schema.key_column_usage kcu 
  ON tc.constraint_name = kcu.constraint_name
LEFT JOIN information_schema.constraint_column_usage ccu 
  ON tc.constraint_name = ccu.constraint_name
WHERE tc.table_schema = 'public'
ORDER BY tc.table_name, tc.constraint_type;

-- ===========================================
-- 4. 查看CHECK约束详情
-- ===========================================
\echo '=== CHECK CONSTRAINTS ==='
SELECT 
  tc.table_name,
  tc.constraint_name,
  cc.check_clause
FROM information_schema.table_constraints tc
JOIN information_schema.check_constraints cc
  ON tc.constraint_name = cc.constraint_name
WHERE tc.table_schema = 'public'
  AND tc.constraint_type = 'CHECK'
ORDER BY tc.table_name;

-- ===========================================
-- 5. 查看所有索引
-- ===========================================
\echo '=== ALL INDEXES ==='
SELECT 
  schemaname,
  tablename,
  indexname,
  indexdef
FROM pg_indexes 
WHERE schemaname = 'public'
ORDER BY tablename, indexname;

-- ===========================================
-- 6. 查看自定义类型和枚举
-- ===========================================
\echo '=== CUSTOM TYPES ==='
SELECT 
  t.typname as type_name,
  t.typtype as type_kind,
  CASE 
    WHEN t.typtype = 'e' THEN 
      (SELECT string_agg(enumlabel, ', ' ORDER BY enumsortorder) 
       FROM pg_enum WHERE enumtypid = t.oid)
    ELSE 'composite type'
  END as type_values
FROM pg_type t
WHERE t.typnamespace = (SELECT oid FROM pg_namespace WHERE nspname = 'public')
  AND t.typtype IN ('e', 'c')
ORDER BY t.typname;

-- ===========================================
-- 7. 查看所有函数
-- ===========================================
\echo '=== ALL FUNCTIONS ==='
SELECT 
  routine_name,
  routine_type,
  data_type,
  external_language
FROM information_schema.routines 
WHERE routine_schema = 'public'
ORDER BY routine_name;

-- ===========================================
-- 8. 查看所有触发器
-- ===========================================
\echo '=== ALL TRIGGERS ==='
SELECT 
  trigger_name,
  event_object_table as table_name,
  action_timing,
  event_manipulation,
  action_statement
FROM information_schema.triggers 
WHERE trigger_schema = 'public'
ORDER BY event_object_table, trigger_name;

-- ===========================================
-- 9. 查看RLS策略
-- ===========================================
\echo '=== RLS POLICIES ==='
SELECT 
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd,
  qual,
  with_check
FROM pg_policies 
WHERE schemaname = 'public'
ORDER BY tablename, policyname;