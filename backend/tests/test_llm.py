"""
LLM 服务和 API 测试
"""
import pytest
from fastapi.testclient import TestClient
from sqlalchemy.orm import Session
from unittest.mock import AsyncMock, patch, MagicMock

from app.main import app
from app.core.database import get_db
from app.models.user import User
from app.schemas.llm import ChatCompletionRequest, Message
from app.services.llm_service import LLMService
from app.clients.llm.siliconflow import SiliconFlowClient


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
        email="llmtest@example.com",
        username="llmtest",
        hashed_password="$2b$12$KIXqZ9Z9Z9Z9Z9Z9Z9Z9ZeZ9Z9Z9Z9Z9Z9Z9Z9Z9Z9Z9Z9Z9Z",  # fake hash
    )
    db.add(user)
    db.commit()
    db.refresh(user)
    return user


@pytest.fixture
def auth_headers(test_user):
    """认证头"""
    # 生成真实的 JWT token
    from app.core.security import create_access_token
    from datetime import timedelta

    token = create_access_token(
        data={"sub": str(test_user.id)}, expires_delta=timedelta(minutes=30)
    )
    return {"Authorization": f"Bearer {token}"}


# ====================================
# SiliconFlowClient 测试
# ====================================


class TestSiliconFlowClient:
    """测试硅基流动客户端"""

    @pytest.mark.asyncio
    async def test_list_models(self):
        """测试获取模型列表"""
        client = SiliconFlowClient(
            api_key="test-key", base_url="https://api.siliconflow.cn/v1"
        )
        models = await client.list_models()

        assert isinstance(models, list)
        assert len(models) > 0
        assert "id" in models[0]
        assert "name" in models[0]
        assert "provider" in models[0]

    @pytest.mark.asyncio
    @patch("httpx.AsyncClient.post")
    async def test_chat_completion(self, mock_post):
        """测试聊天完成"""
        # Mock HTTP 响应
        mock_response = MagicMock()
        mock_response.json.return_value = {
            "id": "chatcmpl-123",
            "model": "deepseek-ai/DeepSeek-V3",
            "choices": [
                {
                    "message": {"content": "你好！我是AI助手。"},
                    "finish_reason": "stop",
                }
            ],
            "usage": {"prompt_tokens": 10, "completion_tokens": 20, "total_tokens": 30},
        }
        mock_response.raise_for_status = MagicMock()
        mock_post.return_value = mock_response

        client = SiliconFlowClient(
            api_key="test-key", base_url="https://api.siliconflow.cn/v1"
        )

        messages = [
            {"role": "system", "content": "你是一个AI助手"},
            {"role": "user", "content": "你好"},
        ]

        result = await client.chat_completion(
            messages=messages, model="deepseek-ai/DeepSeek-V3", temperature=0.7
        )

        assert result["id"] == "chatcmpl-123"
        assert result["model"] == "deepseek-ai/DeepSeek-V3"
        assert result["content"] == "你好！我是AI助手。"
        assert result["usage"]["total_tokens"] == 30


# ====================================
# LLMService 测试
# ====================================


class TestLLMService:
    """测试 LLM 服务"""

    @pytest.mark.asyncio
    @patch("app.services.llm_service.LLMService.get_client")
    async def test_chat_completion(self, mock_get_client):
        """测试聊天完成"""
        # Mock 客户端
        mock_client = AsyncMock()
        mock_client.chat_completion.return_value = {
            "id": "chatcmpl-123",
            "model": "deepseek-ai/DeepSeek-V3",
            "content": "测试响应",
            "usage": {"prompt_tokens": 10, "completion_tokens": 5, "total_tokens": 15},
            "finish_reason": "stop",
        }
        mock_get_client.return_value = mock_client

        messages = [{"role": "user", "content": "测试消息"}]
        result = await LLMService.chat_completion(messages=messages)

        assert result["id"] == "chatcmpl-123"
        assert result["content"] == "测试响应"
        mock_client.chat_completion.assert_called_once()

    @pytest.mark.asyncio
    @patch("app.services.llm_service.LLMService.get_client")
    async def test_list_models(self, mock_get_client):
        """测试获取模型列表"""
        # Mock 客户端
        mock_client = AsyncMock()
        mock_client.list_models.return_value = [
            {
                "id": "deepseek-ai/DeepSeek-V3",
                "name": "DeepSeek V3",
                "provider": "DeepSeek",
            }
        ]
        mock_get_client.return_value = mock_client

        result = await LLMService.list_models()

        assert len(result) > 0
        assert result[0]["id"] == "deepseek-ai/DeepSeek-V3"
        mock_client.list_models.assert_called_once()

    @pytest.mark.asyncio
    @patch("app.services.llm_service.LLMService.chat_completion")
    async def test_generate_tags(self, mock_chat_completion):
        """测试生成标签"""
        # Mock 聊天完成响应
        mock_chat_completion.return_value = {
            "content": "治愈,成长,文艺",
            "usage": {},
        }

        tags = await LLMService.generate_tags(
            content_title="测试电影",
            content_description="一个温暖的故事",
            content_type="movie",
        )

        assert isinstance(tags, list)
        assert len(tags) == 3
        assert "治愈" in tags
        assert "成长" in tags
        assert "文艺" in tags
        mock_chat_completion.assert_called_once()


# ====================================
# LLM API 测试
# ====================================


class TestLLMAPI:
    """测试 LLM API"""

    @pytest.mark.asyncio
    @patch("app.services.llm_service.LLMService.chat_completion")
    def test_chat_completion_api(self, mock_chat_completion, client, auth_headers):
        """测试聊天完成 API"""
        # Mock 服务响应
        mock_chat_completion.return_value = {
            "id": "chatcmpl-123",
            "model": "deepseek-ai/DeepSeek-V3",
            "content": "你好！",
            "usage": {"prompt_tokens": 10, "completion_tokens": 5, "total_tokens": 15},
            "finish_reason": "stop",
        }

        response = client.post(
            "/api/llm/chat/completions",
            headers=auth_headers,
            json={
                "model": "deepseek-ai/DeepSeek-V3",
                "messages": [
                    {"role": "system", "content": "你是AI助手"},
                    {"role": "user", "content": "你好"},
                ],
                "temperature": 0.7,
                "stream": False,
            },
        )

        assert response.status_code == 200
        data = response.json()
        assert data["id"] == "chatcmpl-123"
        assert data["content"] == "你好！"

    @pytest.mark.asyncio
    @patch("app.services.llm_service.LLMService.list_models")
    def test_list_models_api(self, mock_list_models, client, auth_headers):
        """测试获取模型列表 API"""
        # Mock 服务响应
        mock_list_models.return_value = [
            {
                "id": "deepseek-ai/DeepSeek-V3",
                "name": "DeepSeek V3",
                "provider": "DeepSeek",
                "description": "强大的中文推理模型",
                "context_length": 64000,
                "max_output_tokens": 8192,
            }
        ]

        response = client.get("/api/llm/models", headers=auth_headers)

        assert response.status_code == 200
        data = response.json()
        assert data["total"] == 1
        assert len(data["models"]) == 1
        assert data["models"][0]["id"] == "deepseek-ai/DeepSeek-V3"

    @pytest.mark.asyncio
    @patch("app.services.llm_service.LLMService.generate_tags")
    def test_generate_tags_api(self, mock_generate_tags, client, auth_headers):
        """测试生成标签 API"""
        # Mock 服务响应
        mock_generate_tags.return_value = ["治愈", "成长", "文艺"]

        response = client.post(
            "/api/llm/generate-tags",
            headers=auth_headers,
            params={
                "content_title": "测试电影",
                "content_description": "一个温暖的故事",
                "content_type": "movie",
            },
        )

        assert response.status_code == 200
        data = response.json()
        assert data["count"] == 3
        assert "治愈" in data["tags"]

