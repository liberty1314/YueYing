"""
重置数据库脚本

删除所有数据并重新创建种子数据
"""
import sys
from pathlib import Path

# 添加项目根目录到 Python 路径
sys.path.append(str(Path(__file__).parent.parent))

from app.core.database import SessionLocal, engine, Base
from seed_data import create_seed_data


def reset_database():
    """重置数据库"""
    print("🔄 开始重置数据库...\n")
    
    # 1. 删除所有表
    print("⚠️  删除所有表...")
    Base.metadata.drop_all(bind=engine)
    print("✅ 表已删除\n")
    
    # 2. 重新创建所有表
    print("🔨 重新创建所有表...")
    Base.metadata.create_all(bind=engine)
    print("✅ 表已创建\n")
    
    # 3. 创建种子数据
    db = SessionLocal()
    try:
        create_seed_data(db)
    finally:
        db.close()
    
    print("\n✅ 数据库重置完成！")


if __name__ == "__main__":
    print("⚠️  警告: 此操作将删除所有数据并重置数据库！")
    confirm = input("确认继续? (yes/no): ")
    
    if confirm.lower() == "yes":
        reset_database()
    else:
        print("❌ 操作已取消")

