"""
硅基流动 LLM 客户端
"""
from typing import List, Dict, Any, Optional, AsyncGenerator
import httpx
import json
from loguru import logger

from app.clients.llm.base import BaseLLMClient
from app.core.exceptions import APIError


class SiliconFlowClient(BaseLLMClient):
    """硅基流动 API 客户端"""

    # 支持的模型列表
    SUPPORTED_MODELS = {
        # DeepSeek 模型
        "deepseek-ai/DeepSeek-V3": {
            "name": "DeepSeek V3",
            "provider": "DeepSeek",
            "description": "DeepSeek V3 - 强大的中文推理模型",
            "context_length": 64000,
            "max_output_tokens": 8192,
        },
        "deepseek-ai/DeepSeek-V2.5": {
            "name": "DeepSeek V2.5",
            "provider": "DeepSeek",
            "description": "DeepSeek V2.5 - 高性价比推理模型",
            "context_length": 32000,
            "max_output_tokens": 4096,
        },
        # Qwen 模型
        "Qwen/Qwen2.5-72B-Instruct": {
            "name": "Qwen 2.5 72B",
            "provider": "Alibaba",
            "description": "通义千问 2.5 72B - 阿里云大模型",
            "context_length": 32000,
            "max_output_tokens": 8192,
        },
        "Qwen/Qwen2.5-7B-Instruct": {
            "name": "Qwen 2.5 7B",
            "provider": "Alibaba",
            "description": "通义千问 2.5 7B - 轻量级模型",
            "context_length": 32000,
            "max_output_tokens": 4096,
        },
        # Meta Llama 模型
        "meta-llama/Meta-Llama-3.1-70B-Instruct": {
            "name": "Llama 3.1 70B",
            "provider": "Meta",
            "description": "Meta Llama 3.1 70B - 开源强力模型",
            "context_length": 128000,
            "max_output_tokens": 8192,
        },
        "meta-llama/Meta-Llama-3.1-8B-Instruct": {
            "name": "Llama 3.1 8B",
            "provider": "Meta",
            "description": "Meta Llama 3.1 8B - 快速高效",
            "context_length": 128000,
            "max_output_tokens": 4096,
        },
    }

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
        调用聊天完成 API（非流式）
        """
        url = f"{self.base_url}/chat/completions"
        headers = {
            "Authorization": f"Bearer {self.api_key}",
            "Content-Type": "application/json",
        }

        payload = {
            "model": model,
            "messages": messages,
            "temperature": temperature,
            "top_p": top_p,
            "stream": False,
        }

        if max_tokens:
            payload["max_tokens"] = max_tokens

        # 合并额外参数
        payload.update(kwargs)

        logger.info(f"Calling SiliconFlow API: model={model}, messages={len(messages)}")

        try:
            async with httpx.AsyncClient(timeout=60.0) as client:
                response = await client.post(url, headers=headers, json=payload)
                response.raise_for_status()
                result = response.json()

                logger.info(
                    f"SiliconFlow API response: id={result.get('id')}, "
                    f"usage={result.get('usage')}"
                )

                # 返回标准化格式
                return {
                    "id": result.get("id", ""),
                    "model": result.get("model", model),
                    "content": result["choices"][0]["message"]["content"],
                    "usage": result.get("usage", {}),
                    "finish_reason": result["choices"][0].get("finish_reason", "stop"),
                }

        except httpx.HTTPStatusError as e:
            error_detail = e.response.text
            logger.error(f"SiliconFlow API HTTP error: {e.response.status_code} - {error_detail}")
            raise APIError(f"LLM API 调用失败: {error_detail}")
        except Exception as e:
            logger.error(f"SiliconFlow API error: {e}")
            raise APIError(f"LLM API 调用异常: {str(e)}")

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
        调用聊天完成 API（流式）
        """
        url = f"{self.base_url}/chat/completions"
        headers = {
            "Authorization": f"Bearer {self.api_key}",
            "Content-Type": "application/json",
        }

        payload = {
            "model": model,
            "messages": messages,
            "temperature": temperature,
            "top_p": top_p,
            "stream": True,
        }

        if max_tokens:
            payload["max_tokens"] = max_tokens

        # 合并额外参数
        payload.update(kwargs)

        logger.info(f"Calling SiliconFlow streaming API: model={model}, messages={len(messages)}")

        try:
            async with httpx.AsyncClient(timeout=120.0) as client:
                async with client.stream("POST", url, headers=headers, json=payload) as response:
                    response.raise_for_status()

                    async for line in response.aiter_lines():
                        if line.startswith("data: "):
                            data = line[6:]  # 去掉 "data: " 前缀
                            if data.strip() == "[DONE]":
                                break

                            try:
                                chunk = json.loads(data)
                                delta = chunk["choices"][0].get("delta", {})
                                content = delta.get("content", "")
                                if content:
                                    yield content
                            except json.JSONDecodeError:
                                continue

        except httpx.HTTPStatusError as e:
            error_detail = e.response.text
            logger.error(f"SiliconFlow streaming API HTTP error: {e.response.status_code} - {error_detail}")
            raise APIError(f"LLM 流式 API 调用失败: {error_detail}")
        except Exception as e:
            logger.error(f"SiliconFlow streaming API error: {e}")
            raise APIError(f"LLM 流式 API 调用异常: {str(e)}")

    async def list_models(self) -> List[Dict[str, Any]]:
        """
        获取支持的模型列表
        """
        return [
            {
                "id": model_id,
                **model_info,
            }
            for model_id, model_info in self.SUPPORTED_MODELS.items()
        ]

