"""
认证系统测试

测试用户注册、登录、Token 刷新等功能
"""
import pytest
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from sqlalchemy.pool import StaticPool

from app.main import app
from app.core.database import Base, get_db
from app.models.user import User
from app.core.security import get_password_hash

# 创建测试数据库
SQLALCHEMY_DATABASE_URL = "sqlite:///:memory:"

engine = create_engine(
    SQLALCHEMY_DATABASE_URL,
    connect_args={"check_same_thread": False},
    poolclass=StaticPool,
)
TestingSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)


# ====================================
# Fixtures
# ====================================


@pytest.fixture
def db_session():
    """创建测试数据库会话"""
    Base.metadata.create_all(bind=engine)
    db = TestingSessionLocal()
    try:
        yield db
    finally:
        db.close()
        Base.metadata.drop_all(bind=engine)


@pytest.fixture
def client(db_session):
    """创建测试客户端"""

    def override_get_db():
        try:
            yield db_session
        finally:
            pass

    app.dependency_overrides[get_db] = override_get_db
    client = TestClient(app)
    yield client
    app.dependency_overrides.clear()


@pytest.fixture
def test_user(db_session):
    """创建测试用户"""
    user = User(
        email="test@example.com",
        username="testuser",
        hashed_password=get_password_hash("testpassword123"),
        is_active=True,
    )
    db_session.add(user)
    db_session.commit()
    db_session.refresh(user)
    return user


@pytest.fixture
def auth_headers(client, test_user):
    """获取认证头"""
    response = client.post(
        "/api/auth/login",
        json={
            "email": "test@example.com",
            "password": "testpassword123",
        },
    )
    assert response.status_code == 200
    token = response.json()["access_token"]
    return {"Authorization": f"Bearer {token}"}


# ====================================
# 用户注册测试
# ====================================


class TestRegister:
    """用户注册测试"""

    def test_register_success(self, client):
        """测试成功注册"""
        response = client.post(
            "/api/auth/register",
            json={
                "email": "newuser@example.com",
                "username": "newuser",
                "password": "password123",
            },
        )

        assert response.status_code == 201
        data = response.json()
        assert data["email"] == "newuser@example.com"
        assert data["username"] == "newuser"
        assert data["is_active"] is True
        assert "id" in data
        assert "password" not in data
        assert "password_hash" not in data

    def test_register_duplicate_email(self, client, test_user):
        """测试重复邮箱注册"""
        response = client.post(
            "/api/auth/register",
            json={
                "email": "test@example.com",  # 已存在
                "username": "anotheruser",
                "password": "password123",
            },
        )

        assert response.status_code == 400
        assert "邮箱" in response.json()["detail"]

    def test_register_duplicate_username(self, client, test_user):
        """测试重复用户名注册"""
        response = client.post(
            "/api/auth/register",
            json={
                "email": "another@example.com",
                "username": "testuser",  # 已存在
                "password": "password123",
            },
        )

        assert response.status_code == 400
        assert "用户名" in response.json()["detail"]

    def test_register_invalid_email(self, client):
        """测试无效邮箱格式"""
        response = client.post(
            "/api/auth/register",
            json={
                "email": "invalid-email",
                "username": "testuser",
                "password": "password123",
            },
        )

        assert response.status_code == 422  # Validation error

    def test_register_short_password(self, client):
        """测试密码太短"""
        response = client.post(
            "/api/auth/register",
            json={
                "email": "test@example.com",
                "username": "testuser",
                "password": "12345",  # 少于6个字符
            },
        )

        assert response.status_code == 422

    def test_register_invalid_username(self, client):
        """测试无效用户名"""
        response = client.post(
            "/api/auth/register",
            json={
                "email": "test@example.com",
                "username": "test user!@#",  # 包含特殊字符
                "password": "password123",
            },
        )

        assert response.status_code == 422


# ====================================
# 用户登录测试
# ====================================


class TestLogin:
    """用户登录测试"""

    def test_login_success(self, client, test_user):
        """测试成功登录"""
        response = client.post(
            "/api/auth/login",
            json={
                "email": "test@example.com",
                "password": "testpassword123",
            },
        )

        assert response.status_code == 200
        data = response.json()
        assert "access_token" in data
        assert "refresh_token" in data
        assert data["token_type"] == "bearer"

    def test_login_wrong_password(self, client, test_user):
        """测试错误密码"""
        response = client.post(
            "/api/auth/login",
            json={
                "email": "test@example.com",
                "password": "wrongpassword",
            },
        )

        assert response.status_code == 401
        assert "邮箱或密码错误" in response.json()["detail"]

    def test_login_nonexistent_user(self, client):
        """测试不存在的用户"""
        response = client.post(
            "/api/auth/login",
            json={
                "email": "nonexistent@example.com",
                "password": "password123",
            },
        )

        assert response.status_code == 401

    def test_login_inactive_user(self, client, db_session):
        """测试已禁用用户"""
        # 创建已禁用用户
        user = User(
            email="inactive@example.com",
            username="inactiveuser",
            hashed_password=get_password_hash("password123"),
            is_active=False,
        )
        db_session.add(user)
        db_session.commit()

        response = client.post(
            "/api/auth/login",
            json={
                "email": "inactive@example.com",
                "password": "password123",
            },
        )

        assert response.status_code == 401


# ====================================
# Token 刷新测试
# ====================================


class TestTokenRefresh:
    """Token 刷新测试"""

    def test_refresh_token_success(self, client, test_user):
        """测试成功刷新 Token"""
        # 先登录获取 refresh_token
        login_response = client.post(
            "/api/auth/login",
            json={
                "email": "test@example.com",
                "password": "testpassword123",
            },
        )

        refresh_token = login_response.json()["refresh_token"]

        # 刷新 token
        response = client.post(
            "/api/auth/refresh",
            json={"refresh_token": refresh_token},
        )

        assert response.status_code == 200
        data = response.json()
        assert "access_token" in data
        assert data["token_type"] == "bearer"

    def test_refresh_token_invalid(self, client):
        """测试无效的刷新 Token"""
        response = client.post(
            "/api/auth/refresh",
            json={"refresh_token": "invalid_token"},
        )

        assert response.status_code == 401


# ====================================
# 获取当前用户测试
# ====================================


class TestGetCurrentUser:
    """获取当前用户测试"""

    def test_get_current_user_success(self, client, auth_headers):
        """测试成功获取当前用户"""
        response = client.get("/api/auth/me", headers=auth_headers)

        assert response.status_code == 200
        data = response.json()
        assert data["email"] == "test@example.com"
        assert data["username"] == "testuser"
        assert "id" in data
        assert "password" not in data

    def test_get_current_user_no_token(self, client):
        """测试未提供 Token"""
        response = client.get("/api/auth/me")

        assert response.status_code == 403  # HTTPBearer requires token

    def test_get_current_user_invalid_token(self, client):
        """测试无效 Token"""
        response = client.get(
            "/api/auth/me",
            headers={"Authorization": "Bearer invalid_token"},
        )

        assert response.status_code == 401


# ====================================
# 修改密码测试
# ====================================


class TestChangePassword:
    """修改密码测试"""

    def test_change_password_success(self, client, auth_headers):
        """测试成功修改密码"""
        response = client.post(
            "/api/auth/change-password",
            headers=auth_headers,
            json={
                "old_password": "testpassword123",
                "new_password": "newpassword123",
            },
        )

        assert response.status_code == 200
        assert response.json()["success"] is True

        # 验证可以使用新密码登录
        login_response = client.post(
            "/api/auth/login",
            json={
                "email": "test@example.com",
                "password": "newpassword123",
            },
        )

        assert login_response.status_code == 200

    def test_change_password_wrong_old_password(self, client, auth_headers):
        """测试旧密码错误"""
        response = client.post(
            "/api/auth/change-password",
            headers=auth_headers,
            json={
                "old_password": "wrongpassword",
                "new_password": "newpassword123",
            },
        )

        assert response.status_code == 400
        assert "旧密码错误" in response.json()["detail"]

    def test_change_password_no_auth(self, client):
        """测试未认证"""
        response = client.post(
            "/api/auth/change-password",
            json={
                "old_password": "testpassword123",
                "new_password": "newpassword123",
            },
        )

        assert response.status_code == 403


# ====================================
# 退出登录测试
# ====================================


class TestLogout:
    """退出登录测试"""

    def test_logout_success(self, client, auth_headers):
        """测试成功退出登录"""
        response = client.post("/api/auth/logout", headers=auth_headers)

        assert response.status_code == 200
        assert response.json()["success"] is True

    def test_logout_no_auth(self, client):
        """测试未认证"""
        response = client.post("/api/auth/logout")

        assert response.status_code == 403


# ====================================
# 集成测试
# ====================================


class TestAuthIntegration:
    """认证系统集成测试"""

    def test_complete_auth_flow(self, client):
        """测试完整的认证流程"""
        # 1. 注册
        register_response = client.post(
            "/api/auth/register",
            json={
                "email": "integration@example.com",
                "username": "integrationuser",
                "password": "password123",
            },
        )

        assert register_response.status_code == 201
        user_id = register_response.json()["id"]

        # 2. 登录
        login_response = client.post(
            "/api/auth/login",
            json={
                "email": "integration@example.com",
                "password": "password123",
            },
        )

        assert login_response.status_code == 200
        access_token = login_response.json()["access_token"]
        refresh_token = login_response.json()["refresh_token"]

        # 3. 获取当前用户
        me_response = client.get(
            "/api/auth/me",
            headers={"Authorization": f"Bearer {access_token}"},
        )

        assert me_response.status_code == 200
        assert me_response.json()["id"] == user_id

        # 4. 刷新 Token
        refresh_response = client.post(
            "/api/auth/refresh",
            json={"refresh_token": refresh_token},
        )

        assert refresh_response.status_code == 200
        new_access_token = refresh_response.json()["access_token"]

        # 5. 使用新 Token 访问
        me_response_2 = client.get(
            "/api/auth/me",
            headers={"Authorization": f"Bearer {new_access_token}"},
        )

        assert me_response_2.status_code == 200

        # 6. 修改密码
        change_password_response = client.post(
            "/api/auth/change-password",
            headers={"Authorization": f"Bearer {new_access_token}"},
            json={
                "old_password": "password123",
                "new_password": "newpassword123",
            },
        )

        assert change_password_response.status_code == 200

        # 7. 使用新密码登录
        login_response_2 = client.post(
            "/api/auth/login",
            json={
                "email": "integration@example.com",
                "password": "newpassword123",
            },
        )

        assert login_response_2.status_code == 200

        # 8. 退出登录
        logout_response = client.post(
            "/api/auth/logout",
            headers={"Authorization": f"Bearer {new_access_token}"},
        )

        assert logout_response.status_code == 200

