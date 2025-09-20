#!/usr/bin/env python3
"""
Supabase数据库结构检查脚本
用于诊断用户表查询问题
"""

import requests
import json
import os
from dotenv import load_dotenv

# 加载环境变量
load_dotenv('.env.local')

# Supabase配置
SUPABASE_URL = os.getenv('NEXT_PUBLIC_SUPABASE_URL')
SUPABASE_ANON_KEY = os.getenv('NEXT_PUBLIC_SUPABASE_ANON_KEY')

if not SUPABASE_URL or not SUPABASE_ANON_KEY:
    print("❌ 环境变量未配置!")
    print(f"SUPABASE_URL: {SUPABASE_URL}")
    print(f"SUPABASE_ANON_KEY: {'***' if SUPABASE_ANON_KEY else 'None'}")
    exit(1)

# API配置
BASE_URL = f"{SUPABASE_URL}/rest/v1"
headers = {
    'apikey': SUPABASE_ANON_KEY,
    'Authorization': f'Bearer {SUPABASE_ANON_KEY}',
    'Content-Type': 'application/json',
    'Accept': 'application/json'
}

def make_request(endpoint, method='GET', data=None):
    """发送API请求"""
    url = f"{BASE_URL}/{endpoint}"
    try:
        if method == 'GET':
            response = requests.get(url, headers=headers)
        elif method == 'POST':
            response = requests.post(url, headers=headers, json=data)
        
        print(f"\n🌐 {method} {url}")
        print(f"📊 Status: {response.status_code}")
        
        if response.status_code == 200:
            return response.json()
        else:
            print(f"❌ Error: {response.text}")
            return None
            
    except Exception as e:
        print(f"❌ Request failed: {e}")
        return None

def check_database_structure():
    """检查数据库结构"""
    print("=" * 60)
    print("🔍 检查数据库结构")
    print("=" * 60)
    
    # 1. 检查所有表
    print("\n📋 1. 获取所有表结构...")
    tables_info = make_request("", method='GET')
    
    if tables_info is not None:
        print(f"✅ API连接成功!")
    else:
        print("❌ API连接失败!")
        return False
    
    # 2. 检查users表结构 - 使用OPTIONS请求
    print("\n👥 2. 检查users表...")
    
    # 尝试不同的查询方式
    queries = [
        ("users?select=*&limit=0", "获取表结构"),
        ("users?select=id,email,username&limit=5", "基础字段查询"),
        ("users?select=count(*)", "计数查询"),
    ]
    
    for query, desc in queries:
        print(f"\n🔍 {desc}: {query}")
        result = make_request(query)
        if result is not None:
            print(f"✅ 成功: {len(result) if isinstance(result, list) else 'OK'}")
            if isinstance(result, list) and len(result) > 0:
                print(f"📄 示例数据: {json.dumps(result[0], indent=2, ensure_ascii=False)}")
        else:
            print("❌ 失败")
    
    # 3. 检查特定用户
    print("\n🎯 3. 检查特定用户...")
    target_user_id = "fbbddb72-1b65-4601-b363-3b1881e634cd"
    
    user_queries = [
        (f"users?select=*&id=eq.{target_user_id}", "完整查询"),
        (f"users?select=id,username,email&id=eq.{target_user_id}", "基础查询"),
    ]
    
    for query, desc in user_queries:
        print(f"\n🔍 {desc}: {query}")
        result = make_request(query)
        if result is not None:
            print(f"✅ 成功: {len(result)} 条记录")
            if result:
                print(f"📄 用户数据: {json.dumps(result[0], indent=2, ensure_ascii=False)}")
            else:
                print("⚠️  用户不存在")
    
    # 4. 检查RLS策略
    print("\n🔒 4. 检查RLS策略...")
    # 注意: 这需要特殊权限，可能会失败
    rls_check = make_request("pg_policies?select=*&tablename=eq.users")
    if rls_check:
        print(f"✅ RLS策略: {len(rls_check)} 条")
        for policy in rls_check:
            print(f"   - {policy.get('policyname', 'Unknown')}: {policy.get('cmd', 'Unknown')}")
    
    return True

def test_auth_user():
    """测试认证用户相关操作"""
    print("\n" + "=" * 60)
    print("🔐 测试认证相关操作")
    print("=" * 60)
    
    # 这里可以添加认证测试
    # 但需要实际的JWT token
    print("⚠️  认证测试需要有效的JWT token，跳过...")

def main():
    """主函数"""
    print("🚀 Supabase数据库诊断工具")
    print(f"📡 连接到: {SUPABASE_URL}")
    
    if check_database_structure():
        test_auth_user()
        
        print("\n" + "=" * 60)
        print("✨ 诊断完成!")
        print("=" * 60)
        print("\n💡 建议的解决方案:")
        print("1. 如果users表为空 → 检查用户注册流程")
        print("2. 如果查询失败 → 检查RLS策略")
        print("3. 如果权限错误 → 检查API密钥权限")
        print("4. 如果表不存在 → 运行schema建表脚本")
    else:
        print("\n❌ 诊断失败，请检查网络连接和配置!")

if __name__ == "__main__":
    main()