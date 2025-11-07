#!/usr/bin/env python3
"""
合并所有迁移文件为单个初始迁移

警告：此脚本会：
1. 备份当前的迁移文件
2. 创建新的合并迁移
3. 删除旧的迁移文件

使用场景：开发环境，可以重建数据库
不适用于：生产环境或有重要数据的环境
"""
import os
import sys
import shutil
from datetime import datetime
from pathlib import Path

# 添加项目根目录到路径
sys.path.insert(0, str(Path(__file__).parent.parent))

def backup_migrations():
    """备份现有迁移文件"""
    versions_dir = Path(__file__).parent.parent / "alembic" / "versions"
    backup_dir = versions_dir.parent / "versions_backup"
    
    if backup_dir.exists():
        print(f"⚠️  备份目录已存在: {backup_dir}")
        response = input("是否覆盖？(y/N) ")
        if response.lower() != 'y':
            print("已取消操作")
            sys.exit(0)
        shutil.rmtree(backup_dir)
    
    print(f"📦 备份迁移文件到: {backup_dir}")
    shutil.copytree(versions_dir, backup_dir)
    print("✅ 备份完成")
    return backup_dir

def create_merged_migration():
    """创建合并后的迁移文件"""
    versions_dir = Path(__file__).parent.parent / "alembic" / "versions"
    
    # 读取 alembic.ini 获取脚本位置
    template = '''"""合并所有迁移 - 完整数据库架构

Revision ID: merged_schema
Revises: 
Create Date: {date}

此迁移合并了所有之前的迁移文件
"""
from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql

# revision identifiers, used by Alembic.
revision = 'merged_schema'
down_revision = None
branch_labels = None
depends_on = None


def upgrade() -> None:
    """创建所有表和结构"""
    
    # 从 models 导入来自动生成 schema
    # 建议使用 alembic revision --autogenerate 来生成完整的 upgrade()
    pass


def downgrade() -> None:
    """删除所有表"""
    # 按依赖关系倒序删除表
    op.drop_table('conversation_messages')
    op.drop_table('conversations')
    op.drop_table('user_item_tags')
    op.drop_table('collection_items')
    op.drop_table('collections')
    op.drop_table('user_items')
    op.drop_table('tags')
    op.drop_table('items')
    op.drop_table('user_settings')
    op.drop_table('system_settings')
    op.drop_table('llm_configs')
    op.drop_table('users')
'''
    
    date = datetime.now().strftime("%Y-%m-%d %H:%M:%S")
    content = template.format(date=date)
    
    output_file = versions_dir / "merged_schema.py"
    
    print(f"📝 创建合并迁移文件: {output_file}")
    with open(output_file, 'w', encoding='utf-8') as f:
        f.write(content)
    
    print("✅ 合并迁移文件已创建")
    print("\n⚠️  重要：请手动编辑此文件，补全 upgrade() 函数")
    print("   建议步骤：")
    print("   1. 删除数据库")
    print("   2. 运行: alembic revision --autogenerate -m 'complete schema'")
    print("   3. 将生成的 upgrade() 内容复制到 merged_schema.py")
    
    return output_file

def cleanup_old_migrations():
    """清理旧的迁移文件"""
    versions_dir = Path(__file__).parent.parent / "alembic" / "versions"
    
    print("\n🗑️  清理旧的迁移文件...")
    
    for file in versions_dir.glob("*.py"):
        if file.name != "merged_schema.py" and file.name != "__init__.py":
            print(f"   删除: {file.name}")
            file.unlink()
    
    print("✅ 旧迁移文件已清理")

def main():
    print("=" * 50)
    print("🔄 迁移文件合并工具")
    print("=" * 50)
    print()
    
    print("⚠️  警告：此操作会删除所有旧的迁移文件！")
    print("⚠️  仅在开发环境中使用，确保可以重建数据库！")
    print()
    
    response = input("是否继续？(yes/no) ")
    if response.lower() != 'yes':
        print("已取消操作")
        sys.exit(0)
    
    print()
    
    # 1. 备份
    backup_dir = backup_migrations()
    print()
    
    # 2. 创建合并迁移
    merged_file = create_merged_migration()
    print()
    
    # 3. 清理旧文件
    response = input("是否删除旧的迁移文件？(y/N) ")
    if response.lower() == 'y':
        cleanup_old_migrations()
    
    print()
    print("=" * 50)
    print("🎉 完成！")
    print("=" * 50)
    print()
    print(f"备份位置: {backup_dir}")
    print(f"新迁移文件: {merged_file}")
    print()
    print("下一步：")
    print("1. 删除数据库：docker-compose down -v")
    print("2. 重新生成迁移：alembic revision --autogenerate -m 'initial schema'")
    print("3. 应用迁移：alembic upgrade head")
    print()

if __name__ == "__main__":
    main()

