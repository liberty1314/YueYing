"""
数据库配置和会话管理
"""
from sqlalchemy import create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker

from app.core.config import settings

# 创建数据库引擎
engine = create_engine(
    settings.DATABASE_URL,
    pool_pre_ping=True,  # 连接池预检查
    pool_size=10,  # 连接池大小
    max_overflow=20,  # 最大溢出连接数
    echo=settings.DEBUG,  # 是否打印 SQL 语句
)

# 创建会话工厂
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

# 创建基础模型类
Base = declarative_base()


def get_db():
    """
    数据库会话依赖
    用于 FastAPI 的依赖注入
    """
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


