"""
初始化数据库脚本

创建所有表并执行初始迁移
"""
import sys
from pathlib import Path

# 添加项目根目录到 Python 路径
sys.path.append(str(Path(__file__).parent.parent))

from app.core.database import engine, Base
from app.models import *  # 导入所有模型


def init_db():
    """初始化数据库"""
    print("🔄 开始创建数据库表...")
    
    try:
        # 创建所有表
        Base.metadata.create_all(bind=engine)
        print("✅ 数据库表创建成功！")
        
        # 打印创建的表
        print("\n📋 已创建的表:")
        for table in Base.metadata.sorted_tables:
            print(f"  - {table.name}")
            
    except Exception as e:
        print(f"❌ 创建数据库表失败: {e}")
        raise


def drop_all_tables():
    """删除所有表（危险操作！）"""
    print("⚠️  警告: 即将删除所有表...")
    confirm = input("确认删除? (yes/no): ")
    
    if confirm.lower() == "yes":
        Base.metadata.drop_all(bind=engine)
        print("✅ 所有表已删除")
    else:
        print("❌ 操作已取消")


if __name__ == "__main__":
    import argparse
    
    parser = argparse.ArgumentParser(description="数据库初始化脚本")
    parser.add_argument(
        "--drop",
        action="store_true",
        help="删除所有表（危险操作）",
    )
    
    args = parser.parse_args()
    
    if args.drop:
        drop_all_tables()
    else:
        init_db()

