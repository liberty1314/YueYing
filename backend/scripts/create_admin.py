#!/usr/bin/env python3
"""
创建管理员账号的 CLI 工具

Usage:
    python scripts/create_admin.py
    
或使用环境变量:
    ADMIN_EMAIL=admin@example.com ADMIN_PASSWORD=secret123 python scripts/create_admin.py
"""
import sys
import os
from pathlib import Path

# 添加项目根目录到 Python 路径
project_root = Path(__file__).parent.parent
sys.path.insert(0, str(project_root))

from getpass import getpass
from app.core.database import SessionLocal
from app.services.admin_service import admin_service
from loguru import logger


def create_admin():
    """创建管理员账号"""
    print("=" * 60)
    print("创建管理员账号")
    print("=" * 60)
    
    # 从环境变量或用户输入获取信息
    email = os.getenv("ADMIN_EMAIL")
    if not email:
        email = input("请输入管理员邮箱: ").strip()
    
    if not email:
        print("错误：邮箱不能为空")
        return False
    
    password = os.getenv("ADMIN_PASSWORD")
    if not password:
        password = getpass("请输入管理员密码（至少6位）: ")
        password_confirm = getpass("请再次输入密码确认: ")
        
        if password != password_confirm:
            print("错误：两次输入的密码不一致")
            return False
    
    if len(password) < 6:
        print("错误：密码至少需要6位字符")
        return False
    
    username = os.getenv("ADMIN_USERNAME") or input("请输入用户名（可选，直接回车跳过）: ").strip() or None
    full_name = os.getenv("ADMIN_FULLNAME") or input("请输入全名（可选，直接回车跳过）: ").strip() or None
    
    print("\n正在创建管理员账号...")
    
    db = SessionLocal()
    try:
        # 创建管理员
        admin_user = admin_service.create_admin_user(
            db=db,
            email=email,
            password=password,
            username=username,
            full_name=full_name
        )
        
        print("\n" + "=" * 60)
        print("✅ 管理员账号创建成功！")
        print("=" * 60)
        print(f"ID:       {admin_user.id}")
        print(f"邮箱:     {admin_user.email}")
        print(f"用户名:   {admin_user.username or '(未设置)'}")
        print(f"全名:     {admin_user.full_name or '(未设置)'}")
        print(f"角色:     {admin_user.role.value}")
        print(f"状态:     {'激活' if admin_user.is_active else '禁用'}")
        print("=" * 60)
        print("\n您现在可以使用此账号登录管理后台。")
        
        return True
        
    except ValueError as e:
        print(f"\n❌ 创建失败：{e}")
        return False
        
    except Exception as e:
        logger.error(f"创建管理员时发生错误: {e}", exc_info=True)
        print(f"\n❌ 创建失败：{e}")
        return False
        
    finally:
        db.close()


def main():
    """主函数"""
    try:
        success = create_admin()
        sys.exit(0 if success else 1)
    except KeyboardInterrupt:
        print("\n\n操作已取消")
        sys.exit(1)


if __name__ == "__main__":
    main()

