"""
LLM 服务层
"""
from typing import List, Dict, Any, Optional, AsyncGenerator
from loguru import logger

from app.clients.llm.siliconflow import SiliconFlowClient
from app.core.config import settings
from app.core.exceptions import ConfigurationError, APIError


class LLMService:
    """LLM 服务类"""

    _client: Optional[SiliconFlowClient] = None

    @classmethod
    def get_client(cls) -> SiliconFlowClient:
        """
        获取 LLM 客户端实例（单例模式）
        """
        if cls._client is None:
            # 根据配置的提供商选择客户端
            provider = settings.DEFAULT_LLM_PROVIDER.lower()

            if provider == "siliconflow":
                if not settings.SILICONFLOW_API_KEY:
                    raise ConfigurationError("SILICONFLOW_API_KEY 未配置")
                cls._client = SiliconFlowClient(
                    api_key=settings.SILICONFLOW_API_KEY,
                    base_url=settings.SILICONFLOW_BASE_URL,
                )
                logger.info("Initialized SiliconFlow LLM client")
            else:
                raise ConfigurationError(f"不支持的 LLM 提供商: {provider}")

        return cls._client

    @classmethod
    async def chat_completion(
        cls,
        messages: List[Dict[str, str]],
        model: Optional[str] = None,
        temperature: float = 0.7,
        max_tokens: Optional[int] = None,
        top_p: float = 1.0,
        stream: bool = False,
        **kwargs
    ) -> Dict[str, Any]:
        """
        聊天完成（非流式）

        Args:
            messages: 消息列表
            model: 模型名称（默认使用配置的默认模型）
            temperature: 温度参数
            max_tokens: 最大生成token数
            top_p: nucleus sampling参数
            stream: 是否流式输出
            **kwargs: 其他参数

        Returns:
            响应字典
        """
        client = cls.get_client()
        model = model or settings.DEFAULT_LLM_MODEL

        logger.info(
            f"LLM chat completion: model={model}, messages={len(messages)}, "
            f"temperature={temperature}, stream={stream}"
        )

        try:
            result = await client.chat_completion(
                messages=messages,
                model=model,
                temperature=temperature,
                max_tokens=max_tokens,
                top_p=top_p,
                stream=stream,
                **kwargs
            )
            return result
        except Exception as e:
            logger.error(f"LLM chat completion error: {e}")
            raise

    @classmethod
    async def chat_completion_stream(
        cls,
        messages: List[Dict[str, str]],
        model: Optional[str] = None,
        temperature: float = 0.7,
        max_tokens: Optional[int] = None,
        top_p: float = 1.0,
        **kwargs
    ) -> AsyncGenerator[str, None]:
        """
        聊天完成（流式）

        Args:
            messages: 消息列表
            model: 模型名称（默认使用配置的默认模型）
            temperature: 温度参数
            max_tokens: 最大生成token数
            top_p: nucleus sampling参数
            **kwargs: 其他参数

        Yields:
            生成的内容片段
        """
        client = cls.get_client()
        model = model or settings.DEFAULT_LLM_MODEL

        logger.info(
            f"LLM streaming chat completion: model={model}, messages={len(messages)}, "
            f"temperature={temperature}"
        )

        try:
            async for chunk in client.chat_completion_stream(
                messages=messages,
                model=model,
                temperature=temperature,
                max_tokens=max_tokens,
                top_p=top_p,
                **kwargs
            ):
                yield chunk
        except Exception as e:
            logger.error(f"LLM streaming chat completion error: {e}")
            raise

    @classmethod
    async def list_models(cls) -> List[Dict[str, Any]]:
        """
        获取可用模型列表

        Returns:
            模型列表
        """
        client = cls.get_client()
        try:
            models = await client.list_models()
            logger.info(f"Listed {len(models)} available models")
            return models
        except Exception as e:
            logger.error(f"LLM list models error: {e}")
            raise

    @classmethod
    async def generate_tags(
        cls,
        content_title: str,
        content_description: Optional[str] = None,
        content_type: Optional[str] = None,
        model: Optional[str] = None,
    ) -> List[str]:
        """
        基于内容生成标签（用于 AI 自动标签功能）

        Args:
            content_title: 内容标题
            content_description: 内容描述
            content_type: 内容类型（movie/tv/anime/book/game）
            model: 模型名称

        Returns:
            标签列表
        """
        # 构建 prompt
        prompt = f"""请为以下内容生成3-5个合适的标签。

内容类型: {content_type or '未知'}
标题: {content_title}
"""
        if content_description:
            prompt += f"简介: {content_description}\n"

        prompt += """
请生成以下三类标签（每类1-2个）：
1. 情绪标签（如：治愈、烧脑、感动、轻松等）
2. 主题标签（如：成长、爱情、科幻、悬疑等）
3. 风格标签（如：文艺、商业、实验、经典等）

只需要返回标签，用逗号分隔，不需要解释。示例：治愈,成长,文艺
"""

        messages = [
            {"role": "system", "content": "你是一个专业的内容标签生成助手。"},
            {"role": "user", "content": prompt},
        ]

        try:
            result = await cls.chat_completion(
                messages=messages,
                model=model,
                temperature=0.8,  # 稍高的温度以获得更多样的标签
                max_tokens=100,
            )

            # 解析标签
            tags_text = result["content"].strip()
            tags = [tag.strip() for tag in tags_text.split(",") if tag.strip()]

            logger.info(f"Generated {len(tags)} tags for content: {content_title}")
            return tags[:5]  # 最多返回5个标签

        except Exception as e:
            logger.error(f"Failed to generate tags: {e}")
            return []

