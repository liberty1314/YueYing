"""
用户记录相关测试
"""

import pytest
from fastapi.testclient import TestClient
from sqlalchemy.orm import Session

from app.models.user import User
from app.models.user_item import UserItem
from app.models.item import Item
from app.services.user_item_service import UserItemService
from app.schemas.user_item import UserItemCreate, UserItemUpdate, UserItemFilters


class TestUserItemService:
    """用户记录服务测试"""

    @pytest.fixture
    def test_user(self, db: Session):
        """创建测试用户"""
        user = User(
            username="testuser",
            email="test@example.com",
            hashed_password="hashedpassword",
        )
        db.add(user)
        db.commit()
        db.refresh(user)
        return user

    @pytest.fixture
    def sample_user_item_data(self):
        """示例用户记录数据"""
        return UserItemCreate(
            external_id="test_movie_123",
            source="tmdb",
            content_type="movie",
            title="Test Movie",
            original_title="Test Movie Original",
            description="A test movie",
            poster_url="https://example.com/poster.jpg",
            backdrop_url="https://example.com/backdrop.jpg",
            release_date="2024-01-01",
            year="2024",
            language="en",
            metadata={"director": "Test Director"},
            status="watched",
            rating=8,
            notes="Great movie!",
            started_at="2024-01-01",
            completed_at="2024-01-02",
        )

    @pytest.mark.asyncio
    async def test_create_user_item(
        self, db: Session, test_user: User, sample_user_item_data: UserItemCreate
    ):
        """测试创建用户记录"""
        user_item = UserItemService.create_user_item(
            db=db,
            user_id=test_user.id,
            user_item_data=sample_user_item_data,
        )

        assert user_item is not None
        assert user_item.user_id == test_user.id
        assert user_item.status == "watched"
        assert user_item.rating == 8
        assert user_item.notes == "Great movie!"
        assert user_item.item is not None
        assert user_item.item.title == "Test Movie"

    @pytest.mark.asyncio
    async def test_create_duplicate_user_item(
        self, db: Session, test_user: User, sample_user_item_data: UserItemCreate
    ):
        """测试创建重复的用户记录"""
        # 第一次创建
        UserItemService.create_user_item(
            db=db,
            user_id=test_user.id,
            user_item_data=sample_user_item_data,
        )

        # 第二次创建应该失败
        with pytest.raises(ValueError, match="该内容已在你的记录中"):
            UserItemService.create_user_item(
                db=db,
                user_id=test_user.id,
                user_item_data=sample_user_item_data,
            )

    @pytest.mark.asyncio
    async def test_get_user_item(
        self, db: Session, test_user: User, sample_user_item_data: UserItemCreate
    ):
        """测试获取用户记录"""
        created_item = UserItemService.create_user_item(
            db=db,
            user_id=test_user.id,
            user_item_data=sample_user_item_data,
        )

        retrieved_item = UserItemService.get_user_item(
            db=db,
            user_id=test_user.id,
            user_item_id=created_item.id,
        )

        assert retrieved_item is not None
        assert retrieved_item.id == created_item.id
        assert retrieved_item.status == "watched"

    @pytest.mark.asyncio
    async def test_update_user_item(
        self, db: Session, test_user: User, sample_user_item_data: UserItemCreate
    ):
        """测试更新用户记录"""
        user_item = UserItemService.create_user_item(
            db=db,
            user_id=test_user.id,
            user_item_data=sample_user_item_data,
        )

        update_data = UserItemUpdate(
            status="watching",
            rating=9,
            notes="Updated notes",
        )

        updated_item = UserItemService.update_user_item(
            db=db,
            user_id=test_user.id,
            user_item_id=user_item.id,
            user_item_data=update_data,
        )

        assert updated_item is not None
        assert updated_item.status == "watching"
        assert updated_item.rating == 9
        assert updated_item.notes == "Updated notes"

    @pytest.mark.asyncio
    async def test_delete_user_item(
        self, db: Session, test_user: User, sample_user_item_data: UserItemCreate
    ):
        """测试删除用户记录"""
        user_item = UserItemService.create_user_item(
            db=db,
            user_id=test_user.id,
            user_item_data=sample_user_item_data,
        )

        success = UserItemService.delete_user_item(
            db=db,
            user_id=test_user.id,
            user_item_id=user_item.id,
        )

        assert success is True

        # 验证已删除
        deleted_item = UserItemService.get_user_item(
            db=db,
            user_id=test_user.id,
            user_item_id=user_item.id,
        )
        assert deleted_item is None

    @pytest.mark.asyncio
    async def test_get_user_items_with_filters(
        self, db: Session, test_user: User
    ):
        """测试带筛选的获取用户记录列表"""
        # 创建多个测试记录
        for i in range(5):
            data = UserItemCreate(
                external_id=f"movie_{i}",
                source="tmdb",
                content_type="movie",
                title=f"Movie {i}",
                status="watched" if i < 3 else "watching",
                rating=5 + i if i < 3 else None,
            )
            UserItemService.create_user_item(
                db=db,
                user_id=test_user.id,
                user_item_data=data,
            )

        # 测试按状态筛选
        filters = UserItemFilters(status="watched", page=1, page_size=10)
        items, total = UserItemService.get_user_items(
            db=db,
            user_id=test_user.id,
            filters=filters,
        )

        assert len(items) == 3
        assert total == 3
        assert all(item.status == "watched" for item in items)

    @pytest.mark.asyncio
    async def test_get_user_items_with_sorting(
        self, db: Session, test_user: User
    ):
        """测试带排序的获取用户记录列表"""
        # 创建多个测试记录
        for i in range(3):
            data = UserItemCreate(
                external_id=f"movie_{i}",
                source="tmdb",
                content_type="movie",
                title=f"Movie {i}",
                status="watched",
                rating=5 + i,
            )
            UserItemService.create_user_item(
                db=db,
                user_id=test_user.id,
                user_item_data=data,
            )

        # 测试按评分升序排序
        filters = UserItemFilters(
            sort_by="rating",
            sort_order="asc",
            page=1,
            page_size=10,
        )
        items, total = UserItemService.get_user_items(
            db=db,
            user_id=test_user.id,
            filters=filters,
        )

        assert len(items) == 3
        assert items[0].rating == 5
        assert items[1].rating == 6
        assert items[2].rating == 7

    @pytest.mark.asyncio
    async def test_get_user_item_stats(
        self, db: Session, test_user: User
    ):
        """测试获取用户记录统计"""
        # 创建测试记录
        for i in range(5):
            data = UserItemCreate(
                external_id=f"item_{i}",
                source="tmdb",
                content_type="movie" if i < 3 else "tv",
                title=f"Item {i}",
                status="watched" if i < 3 else "watching",
                rating=8 if i < 3 else None,
            )
            UserItemService.create_user_item(
                db=db,
                user_id=test_user.id,
                user_item_data=data,
            )

        stats = UserItemService.get_user_item_stats(
            db=db,
            user_id=test_user.id,
        )

        assert stats["total"] == 5
        assert stats["by_status"]["watched"] == 3
        assert stats["by_status"]["watching"] == 2
        assert stats["by_type"]["movie"] == 3
        assert stats["by_type"]["tv"] == 2
        assert stats["average_rating"] == 8.0


class TestUserItemAPI:
    """用户记录 API 测试"""

    @pytest.fixture
    def auth_headers(self, client: TestClient):
        """获取认证头"""
        # 注册并登录用户
        register_data = {
            "username": "testuser",
            "email": "test@example.com",
            "password": "testpassword123",
        }
        client.post("/api/auth/register", json=register_data)

        # 登录（使用 email）
        login_data = {
            "email": "test@example.com",
            "password": "testpassword123",
        }
        response = client.post("/api/auth/login", json=login_data)
        
        if response.status_code != 200:
            raise Exception(f"Login failed: {response.status_code} - {response.text}")
        
        token = response.json()["access_token"]
        return {"Authorization": f"Bearer {token}"}

    def test_create_user_item_api(
        self, client: TestClient, auth_headers: dict
    ):
        """测试创建用户记录 API"""
        data = {
            "external_id": "test_movie_123",
            "source": "tmdb",
            "content_type": "movie",
            "title": "Test Movie",
            "status": "watched",
            "rating": 8,
            "notes": "Great!",
        }

        response = client.post(
            "/api/user-items",
            json=data,
            headers=auth_headers,
        )

        assert response.status_code == 201
        result = response.json()
        assert result["title"] == "Test Movie"
        assert result["status"] == "watched"
        assert result["rating"] == 8

    def test_get_user_items_api(
        self, client: TestClient, auth_headers: dict
    ):
        """测试获取用户记录列表 API"""
        # 先创建一些记录
        for i in range(3):
            data = {
                "external_id": f"movie_{i}",
                "source": "tmdb",
                "content_type": "movie",
                "title": f"Movie {i}",
                "status": "watched",
            }
            client.post("/api/user-items", json=data, headers=auth_headers)

        # 获取列表
        response = client.get("/api/user-items", headers=auth_headers)

        assert response.status_code == 200
        result = response.json()
        assert result["total"] == 3
        assert len(result["items"]) == 3

    def test_get_user_items_with_filters_api(
        self, client: TestClient, auth_headers: dict
    ):
        """测试带筛选的获取用户记录列表 API"""
        # 创建不同状态的记录
        statuses = ["watched", "watching", "want_to_watch"]
        for i, status in enumerate(statuses):
            data = {
                "external_id": f"movie_{i}",
                "source": "tmdb",
                "content_type": "movie",
                "title": f"Movie {i}",
                "status": status,
            }
            client.post("/api/user-items", json=data, headers=auth_headers)

        # 筛选 watched 状态
        response = client.get(
            "/api/user-items?status=watched",
            headers=auth_headers,
        )

        assert response.status_code == 200
        result = response.json()
        assert result["total"] == 1
        assert result["items"][0]["status"] == "watched"

    def test_update_user_item_api(
        self, client: TestClient, auth_headers: dict
    ):
        """测试更新用户记录 API"""
        # 创建记录
        create_data = {
            "external_id": "test_movie",
            "source": "tmdb",
            "content_type": "movie",
            "title": "Test Movie",
            "status": "watching",
        }
        create_response = client.post(
            "/api/user-items",
            json=create_data,
            headers=auth_headers,
        )
        item_id = create_response.json()["id"]

        # 更新记录
        update_data = {
            "status": "watched",
            "rating": 9,
            "notes": "Amazing!",
        }
        response = client.put(
            f"/api/user-items/{item_id}",
            json=update_data,
            headers=auth_headers,
        )

        assert response.status_code == 200
        result = response.json()
        assert result["status"] == "watched"
        assert result["rating"] == 9
        assert result["notes"] == "Amazing!"

    def test_delete_user_item_api(
        self, client: TestClient, auth_headers: dict
    ):
        """测试删除用户记录 API"""
        # 创建记录
        create_data = {
            "external_id": "test_movie",
            "source": "tmdb",
            "content_type": "movie",
            "title": "Test Movie",
            "status": "watched",
        }
        create_response = client.post(
            "/api/user-items",
            json=create_data,
            headers=auth_headers,
        )
        item_id = create_response.json()["id"]

        # 删除记录
        response = client.delete(
            f"/api/user-items/{item_id}",
            headers=auth_headers,
        )

        assert response.status_code == 204

        # 验证已删除
        get_response = client.get(
            f"/api/user-items/{item_id}",
            headers=auth_headers,
        )
        assert get_response.status_code == 404

    def test_get_stats_api(
        self, client: TestClient, auth_headers: dict
    ):
        """测试获取统计信息 API"""
        # 创建一些记录
        for i in range(5):
            data = {
                "external_id": f"item_{i}",
                "source": "tmdb",
                "content_type": "movie" if i < 3 else "tv",
                "title": f"Item {i}",
                "status": "watched" if i < 3 else "watching",
                "rating": 8 if i < 3 else None,
            }
            client.post("/api/user-items", json=data, headers=auth_headers)

        # 获取统计
        response = client.get("/api/user-items/stats/summary", headers=auth_headers)

        assert response.status_code == 200
        stats = response.json()
        assert stats["total"] == 5
        assert stats["by_status"]["watched"] == 3
        assert stats["by_type"]["movie"] == 3
        assert stats["average_rating"] == 8.0

