"""
Pytest 配置和 fixtures
"""
import pytest
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


