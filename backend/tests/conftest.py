"""
Pytest 配置和 fixtures
"""
import pytest
from unittest.mock import MagicMock, patch
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker

from app.main import app
from app.core.database import Base, get_db
from app.models.user import User
from app.core.security import get_password_hash

# 测试数据库 URL（使用内存 SQLite）
SQLALCHEMY_DATABASE_URL = "sqlite:///./test.db"

# 创建测试数据库引擎
engine = create_engine(
    SQLALCHEMY_DATABASE_URL,
    connect_args={"check_same_thread": False}
)

# 创建测试会话工厂
TestingSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)


@pytest.fixture(scope="function")
def db():
    """数据库 fixture"""
    # 创建所有表
    Base.metadata.create_all(bind=engine)
    
    # 创建会话
    session = TestingSessionLocal()
    
    try:
        yield session
    finally:
        session.close()
        # 删除所有表
        Base.metadata.drop_all(bind=engine)


@pytest.fixture(scope="function")
def client(db):
    """测试客户端 fixture"""
    def override_get_db():
        try:
            yield db
        finally:
            db.close()
    
    app.dependency_overrides[get_db] = override_get_db
    
    with TestClient(app) as test_client:
        yield test_client
    
    app.dependency_overrides.clear()


@pytest.fixture(scope="function")
def test_user(db):
    """创建测试用户 fixture"""
    user = User(
        email="test@example.com",
        username="testuser",
        hashed_password=get_password_hash("testpassword123"),
        is_active=True,
    )
    db.add(user)
    db.commit()
    db.refresh(user)
    return user


@pytest.fixture(scope="function")
def mock_redis():
    """Mock Redis 客户端 fixture"""
    mock = MagicMock()
    
    # Mock 常用的 Redis 方法
    mock.get.return_value = None
    mock.set.return_value = True
    mock.delete.return_value = 1
    mock.keys.return_value = []
    mock.smembers.return_value = set()
    mock.flushdb.return_value = True
    mock.dbsize.return_value = 0
    mock.info.return_value = {
        'used_memory': 0,
        'used_memory_human': '0B',
        'used_memory_peak': 0,
        'used_memory_peak_human': '0B',
    }
    
    return mock


@pytest.fixture(scope="function", autouse=True)
def mock_redis_client(mock_redis):
    """自动 mock Redis 客户端（所有测试自动应用）"""
    with patch('app.core.redis.redis_client') as mock_client:
        # Mock RedisClient 对象
        mock_client.sync_client = mock_redis
        mock_client.async_client = MagicMock()
        
        # 同时 mock cache invalidation 模块中的 redis_client
        with patch('app.core.cache.invalidation.default_redis_client', mock_client):
            # Mock 性能监控中间件中的 redis_client
            with patch('app.middleware.performance_middleware.performance_metrics.redis_client', mock_redis):
                yield mock_client


