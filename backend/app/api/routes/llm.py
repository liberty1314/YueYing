"""
LLM API 路由
"""
from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.responses import StreamingResponse
from sqlalchemy.orm import Session
from typing import Optional
from loguru import logger

from app.core.database import get_db
from app.api.dependencies.auth import get_current_user
from app.models.user import User
from app.schemas.llm import (
    ChatCompletionRequest,
    ChatCompletionResponse,
    ModelInfo,
    ModelListResponse,
)
from app.services.llm_service import LLMService
from app.core.exceptions import ConfigurationError, APIError


router = APIRouter(prefix="/llm", tags=["LLM 服务"])


@router.post(
    "/chat/completions",
    response_model=ChatCompletionResponse,
    summary="聊天完成",
    description="调用 LLM 进行聊天完成，支持流式和非流式输出。",
)
async def chat_completion(
    request: ChatCompletionRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """聊天完成"""
    try:
        # 转换消息格式
        messages = [{"role": msg.role, "content": msg.content} for msg in request.messages]

        # 如果是流式响应
        if request.stream:
            async def generate():
                try:
                    async for chunk in LLMService.chat_completion_stream(
                        messages=messages,
                        model=request.model,
                        temperature=request.temperature,
                        max_tokens=request.max_tokens,
                        top_p=request.top_p,
                    ):
                        # SSE 格式
                        yield f"data: {chunk}\n\n"
                    yield "data: [DONE]\n\n"
                except Exception as e:
                    logger.error(f"Streaming error: {e}")
                    yield f"data: {{\"error\": \"{str(e)}\"}}\n\n"

            return StreamingResponse(
                generate(),
                media_type="text/event-stream",
                headers={
                    "Cache-Control": "no-cache",
                    "Connection": "keep-alive",
                    "X-Accel-Buffering": "no",
                },
            )

        # 非流式响应
        result = await LLMService.chat_completion(
            messages=messages,
            model=request.model,
            temperature=request.temperature,
            max_tokens=request.max_tokens,
            top_p=request.top_p,
            stream=False,
        )

        return ChatCompletionResponse(**result)

    except ConfigurationError as e:
        logger.error(f"LLM configuration error: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"LLM 配置错误: {str(e)}",
        )
    except APIError as e:
        logger.error(f"LLM API error: {e}")
        raise HTTPException(
            status_code=status.HTTP_502_BAD_GATEWAY,
            detail=f"LLM API 调用失败: {str(e)}",
        )
    except Exception as e:
        logger.error(f"Unexpected error in chat completion: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="聊天完成失败",
        )


@router.get(
    "/models",
    response_model=ModelListResponse,
    summary="获取模型列表",
    description="获取可用的 LLM 模型列表。",
)
async def list_models(
    current_user: User = Depends(get_current_user),
):
    """获取模型列表"""
    try:
        models_data = await LLMService.list_models()
        models = [ModelInfo(**model) for model in models_data]
        return ModelListResponse(models=models, total=len(models))
    except ConfigurationError as e:
        logger.error(f"LLM configuration error: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"LLM 配置错误: {str(e)}",
        )
    except Exception as e:
        logger.error(f"Error listing models: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="获取模型列表失败",
        )


@router.post(
    "/generate-tags",
    response_model=dict,
    summary="生成内容标签",
    description="基于内容信息使用 AI 生成标签。",
)
async def generate_tags(
    content_title: str,
    content_description: Optional[str] = None,
    content_type: Optional[str] = None,
    model: Optional[str] = None,
    current_user: User = Depends(get_current_user),
):
    """生成内容标签"""
    try:
        tags = await LLMService.generate_tags(
            content_title=content_title,
            content_description=content_description,
            content_type=content_type,
            model=model,
        )
        return {"tags": tags, "count": len(tags)}
    except ConfigurationError as e:
        logger.error(f"LLM configuration error: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"LLM 配置错误: {str(e)}",
        )
    except APIError as e:
        logger.error(f"LLM API error: {e}")
        raise HTTPException(
            status_code=status.HTTP_502_BAD_GATEWAY,
            detail=f"LLM API 调用失败: {str(e)}",
        )
    except Exception as e:
        logger.error(f"Error generating tags: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="生成标签失败",
        )

