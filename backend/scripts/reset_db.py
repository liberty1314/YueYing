"""
数据库重置脚本
警告：此脚本会删除所有数据！仅用于开发环境！
"""
import sys
from pathlib import Path

# 添加项目根目录到 Python 路径
sys.path.insert(0, str(Path(__file__).parent.parent))

from sqlalchemy import create_engine, text, inspect
from app.core.config import settings
from app.core.database import Base
from app.core.logging import setup_logging

# 导入所有模型以确保它们被注册到 Base.metadata
from app.models.user import User
from app.models.item import Item
from app.models.user_item import UserItem
from app.models.tag import Tag
from app.models.conversation import Conversation, ConversationMessage
from app.models.llm_config import LLMConfig
from app.models.api_key_config import ApiKeyConfig
from app.models.summary import Summary
from app.models.background_task import BackgroundTask
from app.models.user_settings import UserSettings
from app.models.system_settings import SystemSettings

logger = setup_logging()


def confirm_reset():
    """确认是否要重置数据库"""
    print("\n" + "=" * 60)
    print("⚠️  警告：数据库重置操作")
    print("=" * 60)
    print("此操作将：")
    print("  1. 删除所有现有表")
    print("  2. 删除所有枚举类型")
    print("  3. 清空所有数据")
    print("  4. 重新创建表结构（不包含数据）")
    print("\n⚠️  此操作不可逆！所有数据将永久丢失！")
    print("=" * 60)
    
    # 在开发环境中允许重置
    if settings.APP_ENV != "production":
        # Docker 容器中运行时自动确认（通过 Makefile 调用）
        import os
        if os.getenv("AUTO_CONFIRM_RESET") == "true":
            print("\n✓ 自动确认模式")
            return True
        
        response = input("\n确认要继续吗？输入 'YES' 继续: ")
        if response != "YES":
            print("❌ 操作已取消")
            return False
    else:
        print("\n⚠️  生产环境禁止使用此脚本！")
        return False
    
    return True


def drop_all_tables(engine):
    """删除所有表"""
    try:
        logger.info("正在删除所有表...")
        
        # 获取所有表名
        inspector = inspect(engine)
        tables = inspector.get_table_names()
        
        if not tables:
            logger.info("✓ 没有需要删除的表")
            return True
        
        logger.info(f"找到 {len(tables)} 个表:")
        for table in tables:
            logger.info(f"  - {table}")
        
        # 使用 CASCADE 删除所有表
        with engine.connect() as conn:
            # 禁用外键约束检查
            conn.execute(text("SET session_replication_role = 'replica';"))
            
            # 删除所有表
            for table in tables:
                logger.info(f"删除表: {table}")
                conn.execute(text(f'DROP TABLE IF EXISTS "{table}" CASCADE'))
            
            # 恢复外键约束检查
            conn.execute(text("SET session_replication_role = 'origin';"))
            
            conn.commit()
        
        logger.info("✓ 所有表已删除")
        return True
        
    except Exception as e:
        logger.error(f"✗ 删除表失败: {e}")
        import traceback
        traceback.print_exc()
        return False


def drop_all_enums(engine):
    """删除所有枚举类型"""
    try:
        logger.info("正在删除所有枚举类型...")
        
        with engine.connect() as conn:
            # 查询所有自定义枚举类型
            result = conn.execute(text("""
                SELECT t.typname
                FROM pg_type t
                JOIN pg_catalog.pg_namespace n ON n.oid = t.typnamespace
                WHERE t.typtype = 'e'
                AND n.nspname = 'public'
                ORDER BY t.typname
            """))
            
            enums = [row[0] for row in result]
            
            if not enums:
                logger.info("✓ 没有需要删除的枚举类型")
                return True
            
            logger.info(f"找到 {len(enums)} 个枚举类型:")
            for enum in enums:
                logger.info(f"  - {enum}")
            
            # 删除所有枚举类型
            for enum in enums:
                logger.info(f"删除枚举: {enum}")
                conn.execute(text(f'DROP TYPE IF EXISTS "{enum}" CASCADE'))
            
            conn.commit()
        
        logger.info("✓ 所有枚举类型已删除")
        return True
        
    except Exception as e:
        logger.error(f"✗ 删除枚举类型失败: {e}")
        import traceback
        traceback.print_exc()
        return False


def create_all_tables(engine):
    """创建所有表"""
    try:
        logger.info("正在创建数据库表...")
        Base.metadata.create_all(bind=engine)
        logger.info("✓ 数据库表创建成功")
        
        # 显示创建的表
        with engine.connect() as conn:
            result = conn.execute(text("""
                SELECT tablename 
                FROM pg_tables 
                WHERE schemaname = 'public' 
                ORDER BY tablename
            """))
            tables = [row[0] for row in result]
            logger.info(f"✓ 已创建 {len(tables)} 个表:")
            for table in tables:
                logger.info(f"  - {table}")
        
        return True
        
    except Exception as e:
        logger.error(f"✗ 创建表失败: {e}")
        import traceback
        traceback.print_exc()
        return False


def reset_database():
    """重置数据库"""
    try:
        logger.info("开始重置数据库...")
        logger.info(f"数据库 URL: {settings.DATABASE_URL.split('@')[1] if '@' in settings.DATABASE_URL else settings.DATABASE_URL}")
        
        # 创建数据库引擎
        engine = create_engine(settings.DATABASE_URL)
        
        # 测试数据库连接
        with engine.connect() as conn:
            result = conn.execute(text("SELECT version()"))
            version = result.scalar()
            logger.info(f"✓ 数据库连接成功: PostgreSQL {version.split()[1]}")
        
        # 步骤 1: 删除所有表
        if not drop_all_tables(engine):
            return False
        
        # 步骤 2: 删除所有枚举类型
        if not drop_all_enums(engine):
            return False
        
        # 步骤 3: 重新创建表
        if not create_all_tables(engine):
            return False
        
        logger.info("=" * 60)
        logger.info("✓ 数据库重置完成")
        logger.info("=" * 60)
        logger.info("下一步操作：")
        logger.info("  1. 运行迁移脚本: make migrate")
        logger.info("  2. 初始化种子数据: make seed")
        logger.info("=" * 60)
        
        return True
        
    except Exception as e:
        logger.error(f"✗ 数据库重置失败: {e}")
        import traceback
        traceback.print_exc()
        return False


if __name__ == "__main__":
    # 确认操作
    if not confirm_reset():
        sys.exit(1)
    
    # 执行重置
    success = reset_database()
    sys.exit(0 if success else 1)
