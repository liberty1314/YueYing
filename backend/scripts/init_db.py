"""
数据库初始化脚本
直接从 SQLAlchemy 模型创建所有表
"""
import sys
from pathlib import Path

# 添加项目根目录到 Python 路径
sys.path.insert(0, str(Path(__file__).parent.parent))

from sqlalchemy import create_engine, text
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


def init_database():
    """初始化数据库，创建所有表"""
    try:
        logger.info("开始初始化数据库...")
        logger.info(f"数据库 URL: {settings.DATABASE_URL.split('@')[1] if '@' in settings.DATABASE_URL else settings.DATABASE_URL}")
        
        # 创建数据库引擎
        engine = create_engine(settings.DATABASE_URL)
        
        # 测试数据库连接
        with engine.connect() as conn:
            result = conn.execute(text("SELECT version()"))
            version = result.scalar()
            logger.info(f"✓ 数据库连接成功: PostgreSQL {version.split()[1]}")
        
        # 创建所有表
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
        
        logger.info("✓ 数据库初始化完成")
        return True
        
    except Exception as e:
        logger.error(f"✗ 数据库初始化失败: {e}")
        import traceback
        traceback.print_exc()
        return False


if __name__ == "__main__":
    success = init_database()
    sys.exit(0 if success else 1)
