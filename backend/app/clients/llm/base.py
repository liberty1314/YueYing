"""
LLM 客户端基类
"""
from abc import ABC, abstractmethod
from typing import List, Dict, Any, Optional, AsyncGenerator
from loguru import logger


class BaseLLMClient(ABC):
    """LLM 客户端基类"""

    def __init__(self, api_key: str, base_url: str, **kwargs):
        """
        初始化 LLM 客户端

        Args:
            api_key: API 密钥
            base_url: API 基础 URL
            **kwargs: 其他配置参数
        """
        self.api_key = api_key
        self.base_url = base_url
        self.config = kwargs
        logger.info(f"Initialized {self.__class__.__name__} with base_url={base_url}")

    @abstractmethod
    async def chat_completion(
        self,
        messages: List[Dict[str, str]],
        model: str,
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
            model: 模型名称
            temperature: 温度参数
            max_tokens: 最大生成token数
            top_p: nucleus sampling参数
            stream: 是否流式输出
            **kwargs: 其他参数

        Returns:
            响应字典
        """
        pass

    @abstractmethod
    async def chat_completion_stream(
        self,
        messages: List[Dict[str, str]],
        model: str,
        temperature: float = 0.7,
        max_tokens: Optional[int] = None,
        top_p: float = 1.0,
        **kwargs
    ) -> AsyncGenerator[str, None]:
        """
        聊天完成（流式）

        Args:
            messages: 消息列表
            model: 模型名称
            temperature: 温度参数
            max_tokens: 最大生成token数
            top_p: nucleus sampling参数
            **kwargs: 其他参数

        Yields:
            生成的内容片段
        """
        pass

    @abstractmethod
    async def list_models(self) -> List[Dict[str, Any]]:
        """
        获取可用模型列表

        Returns:
            模型列表
        """
        pass

