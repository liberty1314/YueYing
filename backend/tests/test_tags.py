"""
标签系统测试
"""
import pytest
from fastapi.testclient import TestClient
from sqlalchemy.orm import Session

from app.main import app
from app.models.tag import Tag, UserItemTag, TagType
from app.models.user_item import UserItem
from app.models.item import Item
from app.schemas.tag import TagCreate, TagUpdate
from app.services.tag_service import TagService
from app.core.exceptions import ConflictError, NotFoundError


class TestTagService:
    """标签服务测试"""

    def test_create_tag(self, db: Session, test_user):
        """测试创建标签"""
        tag_data = TagCreate(
            name="测试标签",
            type=TagType.CUSTOM,
            color="#FF5733",
            description="这是一个测试标签",
        )
        tag = TagService.create_tag(db=db, user_id=test_user.id, tag_data=tag_data)

        assert tag.id is not None
        assert tag.user_id == test_user.id
        assert tag.name == "测试标签"
        assert tag.type == TagType.CUSTOM
        assert tag.color == "#FF5733"
        assert tag.is_auto is False

    def test_create_duplicate_tag(self, db: Session, test_user):
        """测试创建重复标签"""
        tag_data = TagCreate(name="重复标签", type=TagType.CUSTOM)
        TagService.create_tag(db=db, user_id=test_user.id, tag_data=tag_data)

        with pytest.raises(ConflictError):
            TagService.create_tag(db=db, user_id=test_user.id, tag_data=tag_data)

    def test_get_tag(self, db: Session, test_user):
        """测试获取标签"""
        tag_data = TagCreate(name="获取标签测试", type=TagType.CUSTOM)
        created_tag = TagService.create_tag(db=db, user_id=test_user.id, tag_data=tag_data)

        tag = TagService.get_tag(db=db, user_id=test_user.id, tag_id=created_tag.id)
        assert tag is not None
        assert tag.id == created_tag.id
        assert tag.name == "获取标签测试"

    def test_get_tags(self, db: Session, test_user):
        """测试获取标签列表"""
        # 创建多个标签
        for i in range(3):
            tag_data = TagCreate(name=f"标签{i}", type=TagType.CUSTOM)
            TagService.create_tag(db=db, user_id=test_user.id, tag_data=tag_data)

        tags = TagService.get_tags(db=db, user_id=test_user.id)
        assert len(tags) >= 3

    def test_get_tags_with_filters(self, db: Session, test_user):
        """测试筛选标签"""
        TagService.create_tag(
            db=db,
            user_id=test_user.id,
            tag_data=TagCreate(name="情绪标签", type=TagType.EMOTION),
        )
        TagService.create_tag(
            db=db,
            user_id=test_user.id,
            tag_data=TagCreate(name="主题标签", type=TagType.THEME),
        )

        emotion_tags = TagService.get_tags(db=db, user_id=test_user.id, tag_type=TagType.EMOTION)
        assert len(emotion_tags) >= 1
        assert all(tag.type == TagType.EMOTION for tag in emotion_tags)

    def test_update_tag(self, db: Session, test_user):
        """测试更新标签"""
        tag_data = TagCreate(name="旧名称", type=TagType.CUSTOM)
        tag = TagService.create_tag(db=db, user_id=test_user.id, tag_data=tag_data)

        update_data = TagUpdate(name="新名称", color="#00FF00")
        updated_tag = TagService.update_tag(
            db=db, user_id=test_user.id, tag_id=tag.id, tag_data=update_data
        )

        assert updated_tag.name == "新名称"
        assert updated_tag.color == "#00FF00"

    def test_delete_tag(self, db: Session, test_user):
        """测试删除标签"""
        tag_data = TagCreate(name="待删除标签", type=TagType.CUSTOM)
        tag = TagService.create_tag(db=db, user_id=test_user.id, tag_data=tag_data)

        success = TagService.delete_tag(db=db, user_id=test_user.id, tag_id=tag.id)
        assert success is True

        deleted_tag = TagService.get_tag(db=db, user_id=test_user.id, tag_id=tag.id)
        assert deleted_tag is None

    def test_add_tags_to_user_item(self, db: Session, test_user):
        """测试为用户记录添加标签"""
        # 创建标签
        tag1 = TagService.create_tag(
            db=db, user_id=test_user.id, tag_data=TagCreate(name="标签1", type=TagType.CUSTOM)
        )
        tag2 = TagService.create_tag(
            db=db, user_id=test_user.id, tag_data=TagCreate(name="标签2", type=TagType.CUSTOM)
        )

        # 创建 Item 和 UserItem
        item = Item(
            external_id="test123",
            source="tmdb",
            content_type="movie",
            title="测试电影",
        )
        db.add(item)
        db.flush()

        user_item = UserItem(
            user_id=test_user.id,
            item_id=item.id,
            status="want_to_watch",
        )
        db.add(user_item)
        db.commit()
        db.refresh(user_item)

        # 添加标签
        item_tags = TagService.add_tags_to_user_item(
            db=db,
            user_id=test_user.id,
            user_item_id=user_item.id,
            tag_ids=[tag1.id, tag2.id],
        )

        assert len(item_tags) == 2

    def test_remove_tag_from_user_item(self, db: Session, test_user):
        """测试从用户记录移除标签"""
        # 创建标签和用户记录
        tag = TagService.create_tag(
            db=db, user_id=test_user.id, tag_data=TagCreate(name="待移除标签", type=TagType.CUSTOM)
        )

        item = Item(
            external_id="test456",
            source="tmdb",
            content_type="movie",
            title="测试电影2",
        )
        db.add(item)
        db.flush()

        user_item = UserItem(
            user_id=test_user.id,
            item_id=item.id,
            status="want_to_watch",
        )
        db.add(user_item)
        db.commit()
        db.refresh(user_item)

        # 添加标签
        TagService.add_tags_to_user_item(
            db=db,
            user_id=test_user.id,
            user_item_id=user_item.id,
            tag_ids=[tag.id],
        )

        # 移除标签
        success = TagService.remove_tag_from_user_item(
            db=db,
            user_id=test_user.id,
            user_item_id=user_item.id,
            tag_id=tag.id,
        )
        assert success is True

    def test_get_popular_tags(self, db: Session, test_user):
        """测试获取热门标签"""
        # 创建标签和用户记录
        tag1 = TagService.create_tag(
            db=db, user_id=test_user.id, tag_data=TagCreate(name="热门标签1", type=TagType.CUSTOM)
        )
        tag2 = TagService.create_tag(
            db=db, user_id=test_user.id, tag_data=TagCreate(name="热门标签2", type=TagType.CUSTOM)
        )

        # 创建多个 UserItem 并关联 tag1
        for i in range(3):
            item = Item(
                external_id=f"popular{i}",
                source="tmdb",
                content_type="movie",
                title=f"热门电影{i}",
            )
            db.add(item)
            db.flush()

            user_item = UserItem(
                user_id=test_user.id,
                item_id=item.id,
                status="want_to_watch",
            )
            db.add(user_item)
            db.flush()

            TagService.add_tags_to_user_item(
                db=db,
                user_id=test_user.id,
                user_item_id=user_item.id,
                tag_ids=[tag1.id],
            )

        db.commit()

        # 获取热门标签
        popular_tags = TagService.get_popular_tags(db=db, user_id=test_user.id, limit=10)
        assert len(popular_tags) > 0
        assert popular_tags[0].id == tag1.id


class TestTagAPI:
    """标签 API 测试"""

    @pytest.fixture
    def auth_headers(self, client: TestClient):
        """获取认证头"""
        register_data = {
            "username": "taguser",
            "email": "tag@example.com",
            "password": "testpassword123",
        }
        client.post("/api/auth/register", json=register_data)

        login_data = {
            "email": "tag@example.com",
            "password": "testpassword123",
        }
        response = client.post("/api/auth/login", json=login_data)

        if response.status_code != 200:
            raise Exception(f"Login failed: {response.status_code} - {response.text}")

        token = response.json()["access_token"]
        return {"Authorization": f"Bearer {token}"}

    def test_create_tag_api(self, client: TestClient, auth_headers: dict):
        """测试创建标签 API"""
        tag_data = {
            "name": "API测试标签",
            "type": "custom",
            "color": "#FF5733",
            "description": "通过API创建的标签",
        }
        response = client.post("/api/tags", json=tag_data, headers=auth_headers)
        assert response.status_code == 201
        data = response.json()
        assert data["name"] == "API测试标签"
        assert "id" in data

    def test_get_tags_api(self, client: TestClient, auth_headers: dict):
        """测试获取标签列表 API"""
        # 先创建几个标签
        for i in range(3):
            client.post(
                "/api/tags",
                json={"name": f"列表标签{i}", "type": "custom"},
                headers=auth_headers,
            )

        response = client.get("/api/tags", headers=auth_headers)
        assert response.status_code == 200
        data = response.json()
        assert "total" in data
        assert "tags" in data
        assert data["total"] >= 3

    def test_get_popular_tags_api(self, client: TestClient, auth_headers: dict):
        """测试获取热门标签 API"""
        response = client.get("/api/tags/popular", headers=auth_headers)
        assert response.status_code == 200
        assert isinstance(response.json(), list)

    def test_update_tag_api(self, client: TestClient, auth_headers: dict):
        """测试更新标签 API"""
        # 先创建标签
        create_response = client.post(
            "/api/tags",
            json={"name": "待更新标签", "type": "custom"},
            headers=auth_headers,
        )
        tag_id = create_response.json()["id"]

        # 更新标签
        update_data = {"name": "已更新标签", "color": "#00FF00"}
        response = client.put(f"/api/tags/{tag_id}", json=update_data, headers=auth_headers)
        assert response.status_code == 200
        data = response.json()
        assert data["name"] == "已更新标签"
        assert data["color"] == "#00FF00"

    def test_delete_tag_api(self, client: TestClient, auth_headers: dict):
        """测试删除标签 API"""
        # 先创建标签
        create_response = client.post(
            "/api/tags",
            json={"name": "待删除标签", "type": "custom"},
            headers=auth_headers,
        )
        tag_id = create_response.json()["id"]

        # 删除标签
        response = client.delete(f"/api/tags/{tag_id}", headers=auth_headers)
        assert response.status_code == 204

        # 验证已删除
        get_response = client.get(f"/api/tags/{tag_id}", headers=auth_headers)
        assert get_response.status_code == 404

