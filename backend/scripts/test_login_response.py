#!/usr/bin/env python3
"""
测试登录接口是否返回用户信息（包括 avatar_url）
"""
import requests
import json
import sys

# API 配置
API_URL = "http://localhost:8000/api"

def test_login_response():
    """测试登录接口响应"""
    print("🧪 测试登录接口...")
    
    # 替换为你的测试账号
    login_data = {
        "email": "admin@admin.local",  # 修改为你的邮箱
        "password": "admin123",  # 修改为你的密码
        "remember_me": True
    }
    
    try:
        response = requests.post(
            f"{API_URL}/auth/login",
            json=login_data,
            timeout=10
        )
        
        print(f"📊 状态码: {response.status_code}")
        
        if response.status_code == 200:
            data = response.json()
            print("\n✅ 登录成功！")
            print(f"\n📝 响应数据结构:")
            print(f"  - access_token: {'✓' if 'access_token' in data else '✗'}")
            print(f"  - refresh_token: {'✓' if 'refresh_token' in data else '✗'}")
            print(f"  - user: {'✓' if 'user' in data else '✗'}")
            
            if 'user' in data:
                user = data['user']
                print(f"\n👤 用户信息:")
                print(f"  - id: {user.get('id')}")
                print(f"  - username: {user.get('username')}")
                print(f"  - email: {user.get('email')}")
                print(f"  - avatar_url: {user.get('avatar_url', '(未设置)')}")
                print(f"  - role: {user.get('role')}")
                
                if user.get('avatar_url'):
                    print(f"\n🎉 头像URL已包含在登录响应中！")
                    print(f"   URL: {user['avatar_url']}")
                    return True
                else:
                    print(f"\n⚠️  用户还没有上传头像（avatar_url 为空）")
                    print(f"   这是正常的，上传头像后会显示")
                    return True
            else:
                print(f"\n❌ 响应中缺少 user 字段！")
                print(f"\n完整响应:")
                print(json.dumps(data, indent=2))
                return False
        else:
            print(f"❌ 登录失败: {response.text}")
            return False
            
    except requests.exceptions.RequestException as e:
        print(f"❌ 请求失败: {e}")
        return False
    except Exception as e:
        print(f"❌ 错误: {e}")
        return False

if __name__ == "__main__":
    print("=" * 60)
    print("   测试登录接口返回用户信息")
    print("=" * 60)
    print()
    
    success = test_login_response()
    
    print()
    print("=" * 60)
    if success:
        print("✅ 测试通过！登录接口正确返回用户信息")
    else:
        print("❌ 测试失败！请检查后端代码")
    print("=" * 60)
    
    sys.exit(0 if success else 1)
