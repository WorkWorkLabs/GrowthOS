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

def test_auth_operations():
    """测试认证相关操作"""
    print("\n" + "=" * 60)
    print("🔐 测试认证操作")
    print("=" * 60)
    
    # 测试登录API
    auth_url = f"{SUPABASE_URL}/auth/v1"
    auth_headers = {
        'apikey': SUPABASE_ANON_KEY,
        'Content-Type': 'application/json'
    }
    
    print("\n🔍 1. 测试认证端点...")
    
    # 测试邮箱登录
    test_credentials = {
        "email": "1qa@1qa.1qa",  # 从日志中看到的邮箱
        "password": "123456"     # 假设的密码
    }
    
    try:
        print(f"🌐 POST {auth_url}/token?grant_type=password")
        login_response = requests.post(
            f"{auth_url}/token?grant_type=password",
            headers=auth_headers,
            json={
                "email": test_credentials["email"],
                "password": test_credentials["password"]
            }
        )
        
        print(f"📊 登录状态: {login_response.status_code}")
        if login_response.status_code == 200:
            print("✅ 登录成功!")
            auth_data = login_response.json()
            access_token = auth_data.get('access_token')
            user_id = auth_data.get('user', {}).get('id')
            print(f"🎫 用户ID: {user_id}")
            print(f"🎫 Token前缀: {access_token[:20] if access_token else 'None'}...")
            
            # 用token测试用户查询
            if access_token and user_id:
                test_authenticated_query(access_token, user_id)
                
        else:
            print(f"❌ 登录失败: {login_response.text}")
            
    except Exception as e:
        print(f"❌ 登录测试失败: {e}")
    
    # 测试注册API
    print("\n🔍 2. 测试注册端点...")
    try:
        print(f"🌐 POST {auth_url}/signup")
        signup_response = requests.post(
            f"{auth_url}/signup",
            headers=auth_headers,
            json={
                "email": "test_new@example.com",
                "password": "testpass123",
                "data": {
                    "username": "testuser"
                }
            }
        )
        
        print(f"📊 注册状态: {signup_response.status_code}")
        if signup_response.status_code in [200, 409]:  # 200成功，409已存在
            print("✅ 注册端点正常")
        else:
            print(f"❌ 注册失败: {signup_response.text}")
            
    except Exception as e:
        print(f"❌ 注册测试失败: {e}")

def test_authenticated_query(access_token, user_id):
    """使用JWT token测试认证查询"""
    print("\n🔍 3. 测试认证查询...")
    
    auth_headers = {
        'apikey': SUPABASE_ANON_KEY,
        'Authorization': f'Bearer {access_token}',
        'Content-Type': 'application/json',
        'Accept': 'application/json'
    }
    
    # 测试查询特定用户
    print(f"🔍 查询用户: {user_id}")
    result = make_authenticated_request(f"users?select=*&id=eq.{user_id}", headers=auth_headers)
    
    if result is not None:
        print(f"✅ 认证查询成功: {len(result)} 条记录")
        if result:
            print(f"📄 用户数据: {json.dumps(result[0], indent=2, ensure_ascii=False)}")
        else:
            print("⚠️  用户记录不存在，尝试创建...")
            test_user_creation(access_token, user_id)
    else:
        print("❌ 认证查询失败")

def test_user_creation(access_token, user_id):
    """测试用户创建"""
    print("\n🔍 4. 测试用户创建...")
    
    auth_headers = {
        'apikey': SUPABASE_ANON_KEY,
        'Authorization': f'Bearer {access_token}',
        'Content-Type': 'application/json',
        'Accept': 'application/json'
    }
    
    user_data = {
        "id": user_id,
        "email": "1qa@1qa.1qa",
        "username": "1qa",
        "bio": "Hello! I'm new to WorkWork.",
        "avatar": "https://avatars.githubusercontent.com/u/190834534?s=200&v=4",
        "email_verified": True
    }
    
    try:
        url = f"{BASE_URL}/users"
        print(f"🌐 POST {url}")
        response = requests.post(url, headers=auth_headers, json=user_data)
        
        print(f"📊 创建状态: {response.status_code}")
        if response.status_code in [200, 201]:
            print("✅ 用户创建成功!")
            result = response.json()
            print(f"📄 创建的用户: {json.dumps(result, indent=2, ensure_ascii=False)}")
        else:
            print(f"❌ 用户创建失败: {response.text}")
            
    except Exception as e:
        print(f"❌ 创建用户时出错: {e}")

def make_authenticated_request(endpoint, headers):
    """发送认证请求"""
    url = f"{BASE_URL}/{endpoint}"
    try:
        response = requests.get(url, headers=headers)
        print(f"🌐 GET {url}")
        print(f"📊 Status: {response.status_code}")
        
        if response.status_code == 200:
            return response.json()
        else:
            print(f"❌ Error: {response.text}")
            return None
            
    except Exception as e:
        print(f"❌ Request failed: {e}")
        return None

def main():
    """主函数"""
    print("🚀 Supabase数据库诊断工具")
    print(f"📡 连接到: {SUPABASE_URL}")
    
    if check_database_structure():
        test_auth_operations()
        
        print("\n" + "=" * 60)
        print("✨ 诊断完成!")
        print("=" * 60)
        print("\n💡 建议的解决方案:")
        print("1. 如果认证失败 → 检查用户密码或邮箱确认状态")
        print("2. 如果users表为空 → 检查数据库触发器或手动创建用户")
        print("3. 如果查询失败 → 检查RLS策略")
        print("4. 如果权限错误 → 检查API密钥权限")
        print("5. 如果表不存在 → 运行schema建表脚本")
    else:
        print("\n❌ 诊断失败，请检查网络连接和配置!")

if __name__ == "__main__":
    main()