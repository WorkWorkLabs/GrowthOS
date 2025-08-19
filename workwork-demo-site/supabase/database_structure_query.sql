-- 完整数据库结构查询脚本
-- 运行此脚本获取当前数据库的实际结构

-- ===========================================
-- 1. 获取所有表的基本信息
-- ===========================================
SELECT 
  '=== TABLES OVERVIEW ===' as section,
  null as table_name,
  null as column_name,
  null as data_type,
  null as is_nullable,
  null as column_default,
  null as constraint_info
UNION ALL

SELECT 
  'TABLE' as section,
  table_name,
  null as column_name,
  null as data_type,
  null as is_nullable,
  null as column_default,
  null as constraint_info
FROM information_schema.tables 
WHERE table_schema = 'public' 
  AND table_type = 'BASE TABLE'
ORDER BY table_name;

-- ===========================================
-- 2. 获取所有表的详细列信息
-- ===========================================
SELECT 
  '=== COLUMNS DETAILS ===' as section,
  null as table_name,
  null as column_name,
  null as data_type,
  null as is_nullable,
  null as column_default,
  null as constraint_info
UNION ALL

SELECT 
  'COLUMN' as section,
  table_name,
  column_name,
  CASE 
    WHEN data_type = 'USER-DEFINED' THEN udt_name
    WHEN data_type = 'ARRAY' THEN udt_name
    ELSE data_type 
  END as data_type,
  is_nullable,
  column_default,
  null as constraint_info
FROM information_schema.columns 
WHERE table_schema = 'public'
ORDER BY table_name, column_name;

-- ===========================================
-- 3. 获取所有约束信息
-- ===========================================
SELECT 
  '=== CONSTRAINTS ===' as section,
  null as table_name,
  null as column_name,
  null as data_type,
  null as is_nullable,
  null as column_default,
  null as constraint_info
UNION ALL

SELECT 
  'CONSTRAINT' as section,
  tc.table_name,
  kcu.column_name,
  tc.constraint_type as data_type,
  null as is_nullable,
  null as column_default,
  CASE 
    WHEN tc.constraint_type = 'FOREIGN KEY' THEN 
      CONCAT('REFERENCES ', ccu.table_name, '(', ccu.column_name, ')')
    WHEN tc.constraint_type = 'CHECK' THEN
      cc.check_clause
    ELSE tc.constraint_name
  END as constraint_info
FROM information_schema.table_constraints tc
LEFT JOIN information_schema.key_column_usage kcu 
  ON tc.constraint_name = kcu.constraint_name
LEFT JOIN information_schema.constraint_column_usage ccu 
  ON tc.constraint_name = ccu.constraint_name
LEFT JOIN information_schema.check_constraints cc
  ON tc.constraint_name = cc.constraint_name
WHERE tc.table_schema = 'public'
ORDER BY tc.table_name, tc.constraint_type;

-- ===========================================
-- 4. 获取所有索引信息
-- ===========================================
SELECT 
  '=== INDEXES ===' as section,
  null as table_name,
  null as column_name,
  null as data_type,
  null as is_nullable,
  null as column_default,
  null as constraint_info
UNION ALL

SELECT 
  'INDEX' as section,
  schemaname || '.' || tablename as table_name,
  indexname as column_name,
  indexdef as data_type,
  null as is_nullable,
  null as column_default,
  null as constraint_info
FROM pg_indexes 
WHERE schemaname = 'public'
ORDER BY tablename, indexname;

-- ===========================================
-- 5. 获取所有自定义类型和枚举
-- ===========================================
SELECT 
  '=== CUSTOM TYPES ===' as section,
  null as table_name,
  null as column_name,
  null as data_type,
  null as is_nullable,
  null as column_default,
  null as constraint_info
UNION ALL

SELECT 
  'TYPE' as section,
  typname as table_name,
  null as column_name,
  typtype as data_type,
  null as is_nullable,
  null as column_default,
  array_to_string(enum_labels, ', ') as constraint_info
FROM pg_type t
LEFT JOIN (
  SELECT enumtypid, array_agg(enumlabel ORDER BY enumsortorder) as enum_labels
  FROM pg_enum
  GROUP BY enumtypid
) e ON t.oid = e.enumtypid
WHERE typnamespace = (SELECT oid FROM pg_namespace WHERE nspname = 'public')
  AND typtype IN ('e', 'c')
ORDER BY typname;

-- ===========================================
-- 6. 获取所有函数和触发器
-- ===========================================
SELECT 
  '=== FUNCTIONS ===' as section,
  null as table_name,
  null as column_name,
  null as data_type,
  null as is_nullable,
  null as column_default,
  null as constraint_info
UNION ALL

SELECT 
  'FUNCTION' as section,
  routine_name as table_name,
  routine_type as column_name,
  data_type,
  null as is_nullable,
  null as column_default,
  external_language as constraint_info
FROM information_schema.routines 
WHERE routine_schema = 'public'
ORDER BY routine_name;

-- ===========================================
-- 7. 获取所有触发器
-- ===========================================
SELECT 
  '=== TRIGGERS ===' as section,
  null as table_name,
  null as column_name,
  null as data_type,
  null as is_nullable,
  null as column_default,
  null as constraint_info
UNION ALL

SELECT 
  'TRIGGER' as section,
  event_object_table as table_name,
  trigger_name as column_name,
  action_timing as data_type,
  event_manipulation as is_nullable,
  action_statement as column_default,
  null as constraint_info
FROM information_schema.triggers 
WHERE trigger_schema = 'public'
ORDER BY event_object_table, trigger_name;

-- ===========================================
-- 8. 获取RLS策略信息
-- ===========================================
SELECT 
  '=== RLS POLICIES ===' as section,
  null as table_name,
  null as column_name,
  null as data_type,
  null as is_nullable,
  null as column_default,
  null as constraint_info
UNION ALL

SELECT 
  'POLICY' as section,
  tablename as table_name,
  policyname as column_name,
  cmd as data_type,
  qual as is_nullable,
  with_check as column_default,
  null as constraint_info
FROM pg_policies 
WHERE schemaname = 'public'
ORDER BY tablename, policyname;