#!/usr/bin/env python3
"""
创建测试用户脚本
"""

import requests
import json
import os
from dotenv import load_dotenv

# 加载环境变量
load_dotenv('.env.local')

SUPABASE_URL = os.getenv('NEXT_PUBLIC_SUPABASE_URL')
SUPABASE_ANON_KEY = os.getenv('NEXT_PUBLIC_SUPABASE_ANON_KEY')

def create_test_user():
    """创建一个有效的测试用户"""
    print("🚀 创建测试用户")
    print("=" * 50)
    
    auth_url = f"{SUPABASE_URL}/auth/v1"
    headers = {
        'apikey': SUPABASE_ANON_KEY,
        'Content-Type': 'application/json'
    }
    
    # 创建新用户
    test_user = {
        "email": "test_working@example.com",
        "password": "testpass123",
        "data": {
            "username": "testuser123",
            "bio": "Test user for debugging"
        }
    }
    
    print(f"📧 创建用户: {test_user['email']}")
    print(f"🔑 密码: {test_user['password']}")
    
    try:
        # 1. 注册用户
        print("\n🔍 1. 注册用户...")
        signup_response = requests.post(
            f"{auth_url}/signup",
            headers=headers,
            json=test_user
        )
        
        print(f"📊 注册状态: {signup_response.status_code}")
        if signup_response.status_code in [200, 409]:
            signup_data = signup_response.json()
            user_id = signup_data.get('user', {}).get('id')
            print(f"✅ 用户注册成功!")
            print(f"🆔 用户ID: {user_id}")
            
            # 2. 立即尝试登录
            print("\n🔍 2. 测试登录...")
            login_response = requests.post(
                f"{auth_url}/token?grant_type=password",
                headers=headers,
                json={
                    "email": test_user["email"],
                    "password": test_user["password"]
                }
            )
            
            print(f"📊 登录状态: {login_response.status_code}")
            if login_response.status_code == 200:
                login_data = login_response.json()
                access_token = login_data.get('access_token')
                print("✅ 登录成功!")
                print(f"🎫 Token: {access_token[:30]}...")
                
                # 3. 创建用户记录
                create_user_record(access_token, user_id, test_user)
                
            else:
                print(f"❌ 登录失败: {login_response.text}")
                if "email not confirmed" in login_response.text.lower():
                    print("⚠️  需要邮箱确认，但我们可以继续测试创建用户记录")
                    if user_id:
                        # 即使登录失败，也尝试用ANON key创建用户记录
                        create_user_record_anon(user_id, test_user)
        else:
            print(f"❌ 注册失败: {signup_response.text}")
            
    except Exception as e:
        print(f"❌ 操作失败: {e}")

def create_user_record(access_token, user_id, user_info):
    """使用认证token创建用户记录"""
    print("\n🔍 3. 创建用户记录(认证)...")
    
    headers = {
        'apikey': SUPABASE_ANON_KEY,
        'Authorization': f'Bearer {access_token}',
        'Content-Type': 'application/json'
    }
    
    user_data = {
        "id": user_id,
        "email": user_info["email"],
        "username": user_info["data"]["username"],
        "bio": user_info["data"]["bio"],
        "avatar": "https://avatars.githubusercontent.com/u/190834534?s=200&v=4",
        "email_verified": True
    }
    
    try:
        response = requests.post(
            f"{SUPABASE_URL}/rest/v1/users",
            headers=headers,
            json=user_data
        )
        
        print(f"📊 创建状态: {response.status_code}")
        if response.status_code in [200, 201]:
            print("✅ 用户记录创建成功!")
            result = response.json()
            print(f"📄 用户数据: {json.dumps(result, indent=2, ensure_ascii=False)}")
        else:
            print(f"❌ 创建失败: {response.text}")
            
    except Exception as e:
        print(f"❌ 创建用户记录失败: {e}")

def create_user_record_anon(user_id, user_info):
    """使用匿名key创建用户记录（如果RLS允许）"""
    print("\n🔍 3. 创建用户记录(匿名)...")
    
    headers = {
        'apikey': SUPABASE_ANON_KEY,
        'Content-Type': 'application/json'
    }
    
    user_data = {
        "id": user_id,
        "email": user_info["email"],
        "username": user_info["data"]["username"],
        "bio": user_info["data"]["bio"],
        "avatar": "https://avatars.githubusercontent.com/u/190834534?s=200&v=4",
        "email_verified": False  # 邮箱未确认
    }
    
    try:
        response = requests.post(
            f"{SUPABASE_URL}/rest/v1/users",
            headers=headers,
            json=user_data
        )
        
        print(f"📊 创建状态: {response.status_code}")
        if response.status_code in [200, 201]:
            print("✅ 用户记录创建成功!")
            result = response.json()
            print(f"📄 用户数据: {json.dumps(result, indent=2, ensure_ascii=False)}")
        else:
            print(f"❌ 创建失败: {response.text}")
            
    except Exception as e:
        print(f"❌ 创建用户记录失败: {e}")

if __name__ == "__main__":
    create_test_user()
    print("\n" + "=" * 50)
    print("💡 现在可以用以下凭据测试:")
    print("📧 邮箱: test_working@example.com")
    print("🔑 密码: testpass123")
    print("=" * 50)