"""
数据库配置和会话管理
"""
from sqlalchemy import create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker

from app.core.config import settings

# 创建数据库引擎（优化连接池配置）
engine = create_engine(
    settings.DATABASE_URL,
    # 连接池配置优化
    pool_pre_ping=True,  # 连接池预检查，避免使用失效连接
    pool_size=15,  # 连接池大小，增加以支持更多并发
    max_overflow=30,  # 最大溢出连接数，增加以应对突发负载
    pool_timeout=30,  # 获取连接的超时时间（秒）
    pool_recycle=3600,  # 连接回收时间（1小时），避免长时间连接失效

    # 连接配置优化
    echo=False,  # 禁用 SQL echo 以避免与 loguru 格式化冲突

    # 数据库连接参数优化
    connect_args={
        "connect_timeout": 10,  # 连接超时时间
        "options": "-c statement_timeout=30000",  # 语句执行超时30秒
    }
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


