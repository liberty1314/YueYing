"""
AI 标签生成服务和 API 测试
"""
import pytest
from fastapi.testclient import TestClient
from sqlalchemy.orm import Session
from unittest.mock import AsyncMock, patch

from app.main import app
from app.models.user import User
from app.models.item import Item, ItemType
from app.models.user_item import UserItem, ItemStatus
from app.models.tag import Tag
from app.ai.tag_generator import TagGenerator
from app.ai.prompts.tag_generation import TagGenerationPrompts


# ====================================
# Fixtures
# ====================================


@pytest.fixture
def client():
    """测试客户端"""
    return TestClient(app)


@pytest.fixture
def test_user(db: Session):
    """创建测试用户"""
    user = User(
        email="aitagtest@example.com",
        username="aitagtest",
        hashed_password="$2b$12$KIXqZ9Z9Z9Z9Z9Z9Z9Z9ZeZ9Z9Z9Z9Z9Z9Z9Z9Z9Z9Z9Z9Z9Z",
    )
    db.add(user)
    db.commit()
    db.refresh(user)
    return user


@pytest.fixture
def test_item(db: Session):
    """创建测试内容"""
    item = Item(
        content_type=ItemType.MOVIE,
        title="测试电影",
        description="一个温暖治愈的成长故事，讲述了一个年轻人在小镇上的成长经历。",
        poster_url="https://example.com/poster.jpg",
        external_id="test123",
        external_source="tmdb",
        genres=["剧情", "文艺"],
    )
    db.add(item)
    db.commit()
    db.refresh(item)
    return item


@pytest.fixture
def test_user_item(db: Session, test_user, test_item):
    """创建测试用户记录"""
    user_item = UserItem(
        user_id=test_user.id,
        item_id=test_item.id,
        status=ItemStatus.WATCHED,
        rating=8,
        notes="非常感人，让我想起了自己的成长经历。",
    )
    db.add(user_item)
    db.commit()
    db.refresh(user_item)
    return user_item


@pytest.fixture
def auth_headers(test_user):
    """认证头"""
    from app.core.security import create_access_token
    from datetime import timedelta

    token = create_access_token(
        data={"sub": str(test_user.id)}, expires_delta=timedelta(minutes=30)
    )
    return {"Authorization": f"Bearer {token}"}


# ====================================
# TagGenerator 测试
# ====================================


class TestTagGenerator:
    """测试 TagGenerator 类"""

    def test_normalize_tags(self):
        """测试标签标准化"""
        tags = [
            "治愈",
            "  成长  ",
            "文艺",
            "治愈",  # 重复
            "Healing",
            "a",  # 太短
            "这是一个非常非常长的标签名称",  # 太长
            "温暖，",  # 包含标点
        ]

        normalized = TagGenerator.normalize_tags(tags)

        assert "治愈" in normalized
        assert "成长" in normalized
        assert "文艺" in normalized
        assert "温暖" in normalized
        assert len([t for t in normalized if t == "治愈"]) == 1  # 去重
        assert "a" not in normalized  # 太短被过滤
        assert len(normalized) <= 10  # 最多10个

    def test_parse_tags_from_response(self):
        """测试从响应中解析标签"""
        # 测试标准格式
        response1 = "治愈,成长,文艺"
        tags1 = TagGenerator.parse_tags_from_response(response1)
        assert tags1 == ["治愈", "成长", "文艺"]

        # 测试带前缀
        response2 = "标签: 治愈,成长,文艺"
        tags2 = TagGenerator.parse_tags_from_response(response2)
        assert tags2 == ["治愈", "成长", "文艺"]

        # 测试顿号分隔
        response3 = "治愈、成长、文艺"
        tags3 = TagGenerator.parse_tags_from_response(response3)
        assert tags3 == ["治愈", "成长", "文艺"]

        # 测试换行分隔
        response4 = "治愈\n成长\n文艺"
        tags4 = TagGenerator.parse_tags_from_response(response4)
        assert tags4 == ["治愈", "成长", "文艺"]

    @pytest.mark.asyncio
    @patch("app.services.llm_service.LLMService.chat_completion")
    async def test_generate_tags_for_content(
        self, mock_chat_completion, db, test_user, test_user_item
    ):
        """测试为内容生成标签"""
        # Mock LLM 响应
        mock_chat_completion.return_value = {
            "content": "治愈,成长,文艺,温暖",
            "usage": {},
        }

        tags = await TagGenerator.generate_tags_for_content(
            db=db,
            user_id=test_user.id,
            user_item_id=test_user_item.id,
            include_notes=True,
        )

        assert len(tags) == 4
        assert "治愈" in tags
        assert "成长" in tags
        assert "文艺" in tags
        assert "温暖" in tags
        mock_chat_completion.assert_called_once()

    @pytest.mark.asyncio
    @patch("app.services.llm_service.LLMService.chat_completion")
    async def test_generate_and_save_tags(
        self, mock_chat_completion, db, test_user, test_user_item
    ):
        """测试生成并保存标签"""
        # Mock LLM 响应
        mock_chat_completion.return_value = {
            "content": "治愈,成长,文艺",
            "usage": {},
        }

        result = await TagGenerator.generate_and_save_tags(
            db=db,
            user_id=test_user.id,
            user_item_id=test_user_item.id,
        )

        assert result["user_item_id"] == test_user_item.id
        assert result["total"] == 3
        assert len(result["tags"]) == 3

        # 验证标签已保存到数据库
        tags = db.query(Tag).filter(Tag.user_id == test_user.id).all()
        assert len(tags) == 3

    @pytest.mark.asyncio
    @patch("app.services.llm_service.LLMService.chat_completion")
    async def test_regenerate_tags(
        self, mock_chat_completion, db, test_user, test_user_item
    ):
        """测试重新生成标签"""
        # 先生成一次标签
        mock_chat_completion.return_value = {
            "content": "治愈,成长",
            "usage": {},
        }

        await TagGenerator.generate_and_save_tags(
            db=db,
            user_id=test_user.id,
            user_item_id=test_user_item.id,
        )

        # 重新生成
        mock_chat_completion.return_value = {
            "content": "感动,温暖,文艺",
            "usage": {},
        }

        result = await TagGenerator.regenerate_tags(
            db=db,
            user_id=test_user.id,
            user_item_id=test_user_item.id,
        )

        assert result["total"] == 3
        # 验证旧标签被替换
        tag_names = [tag["name"] for tag in result["tags"]]
        assert "感动" in tag_names
        assert "温暖" in tag_names
        assert "文艺" in tag_names


# ====================================
# TagGenerationPrompts 测试
# ====================================


class TestTagGenerationPrompts:
    """测试 TagGenerationPrompts 类"""

    def test_build_content_tags_prompt(self):
        """测试构建内容标签 Prompt"""
        prompt = TagGenerationPrompts.build_content_tags_prompt(
            content_type="movie",
            title="测试电影",
            description="一个温暖的故事",
            user_notes="很感动",
            genres=["剧情", "文艺"],
        )

        assert "测试电影" in prompt
        assert "一个温暖的故事" in prompt
        assert "很感动" in prompt
        assert "剧情" in prompt
        assert "文艺" in prompt
        assert "电影" in prompt

    def test_build_note_tags_prompt(self):
        """测试构建笔记标签 Prompt"""
        prompt = TagGenerationPrompts.build_note_tags_prompt(
            title="测试电影",
            notes="这部电影非常治愈，让我想起了童年的美好时光。",
        )

        assert "测试电影" in prompt
        assert "这部电影非常治愈" in prompt


# ====================================
# AI Tags API 测试
# ====================================


class TestAITagsAPI:
    """测试 AI Tags API"""

    @pytest.mark.asyncio
    @patch("app.ai.tag_generator.TagGenerator.generate_and_save_tags")
    def test_generate_tags_api(
        self, mock_generate, client, auth_headers, test_user_item
    ):
        """测试生成标签 API"""
        # Mock 生成结果
        mock_generate.return_value = {
            "user_item_id": test_user_item.id,
            "tags": [
                {"id": 1, "name": "治愈"},
                {"id": 2, "name": "成长"},
            ],
            "total": 2,
        }

        response = client.post(
            "/api/ai/generate-tags",
            headers=auth_headers,
            json={
                "user_item_id": test_user_item.id,
                "include_notes": True,
            },
        )

        assert response.status_code == 200
        data = response.json()
        assert data["user_item_id"] == test_user_item.id
        assert data["total"] == 2
        assert len(data["tags"]) == 2

    @pytest.mark.asyncio
    @patch("app.ai.tag_generator.TagGenerator.batch_generate_tags")
    def test_batch_generate_tags_api(
        self, mock_batch_generate, client, auth_headers, test_user_item
    ):
        """测试批量生成标签 API"""
        # Mock 批量生成结果
        mock_batch_generate.return_value = [
            {
                "user_item_id": test_user_item.id,
                "tags": [{"id": 1, "name": "治愈"}],
                "total": 1,
            }
        ]

        response = client.post(
            "/api/ai/batch-generate-tags",
            headers=auth_headers,
            json={
                "user_item_ids": [test_user_item.id],
            },
        )

        assert response.status_code == 200
        data = response.json()
        assert data["total_processed"] == 1
        assert data["total_success"] == 1
        assert data["total_failed"] == 0

    @pytest.mark.asyncio
    @patch("app.ai.tag_generator.TagGenerator.regenerate_tags")
    def test_regenerate_tags_api(
        self, mock_regenerate, client, auth_headers, test_user_item
    ):
        """测试重新生成标签 API"""
        # Mock 重新生成结果
        mock_regenerate.return_value = {
            "user_item_id": test_user_item.id,
            "tags": [{"id": 1, "name": "感动"}],
            "total": 1,
        }

        response = client.post(
            "/api/ai/regenerate-tags",
            headers=auth_headers,
            json={
                "user_item_id": test_user_item.id,
                "feedback": "希望更多情感类标签",
            },
        )

        assert response.status_code == 200
        data = response.json()
        assert data["user_item_id"] == test_user_item.id
        assert data["total"] == 1

