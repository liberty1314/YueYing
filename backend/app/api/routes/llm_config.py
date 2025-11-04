"""
LLM 配置管理 API 路由
"""
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from loguru import logger

from app.core.database import get_db
from app.api.dependencies.auth import get_current_admin
from app.models.user import User
from app.schemas.llm import (
    LLMConfigCreate,
    LLMConfigUpdate,
    LLMConfigResponse,
    LLMConfigTestRequest,
    LLMConfigTestResponse,
)
from app.services.llm_config_service import LLMConfigService
from app.core.exceptions import NotFoundError


router = APIRouter(prefix="/llm-config", tags=["LLM Config"])


@router.get(
    "",
    response_model=LLMConfigResponse,
    summary="获取 LLM 配置",
    description="获取当前的 LLM 配置（全局单例）。",
)
async def get_llm_config(
    current_user: User = Depends(get_current_admin),
    db: Session = Depends(get_db),
):
    """获取 LLM 配置"""
    try:
        config = LLMConfigService.get_config(db)
        if not config:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="LLM 配置不存在",
            )

        # 返回完整配置（包括明文 API 密钥）
        # 注意：这是管理端点，需要认证，所以显示明文密钥是合理的
        config_dict = {
            "id": config.id,
            "provider": config.provider.value,
            "api_key": config.api_key,  # 明文显示 API 密钥
            "base_url": config.base_url,
            "default_model": config.default_model,
            "temperature": config.temperature,
            "max_tokens": config.max_tokens,
            "top_p": config.top_p,
            "enabled": config.enabled,
            "auto_tag_enabled": config.auto_tag_enabled,
            "description": config.description,
            "created_at": config.created_at.isoformat(),
            "updated_at": config.updated_at.isoformat(),
        }

        return LLMConfigResponse(**config_dict)

    except HTTPException:
        # 重新抛出 HTTPException（如 404），不要转换为 500
        raise
    except Exception as e:
        logger.error(f"Error getting LLM config: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="获取 LLM 配置失败",
        )


@router.post(
    "",
    response_model=LLMConfigResponse,
    status_code=status.HTTP_201_CREATED,
    summary="创建 LLM 配置",
    description="创建新的 LLM 配置（如果已存在则更新）。",
)
async def create_llm_config(
    config_data: LLMConfigCreate,
    current_user: User = Depends(get_current_admin),
    db: Session = Depends(get_db),
):
    """创建 LLM 配置"""
    try:
        config = LLMConfigService.create_config(db, config_data)

        # 返回完整配置（包括明文 API 密钥）
        config_dict = {
            "id": config.id,
            "provider": config.provider.value,
            "api_key": config.api_key,  # 明文显示 API 密钥
            "base_url": config.base_url,
            "default_model": config.default_model,
            "temperature": config.temperature,
            "max_tokens": config.max_tokens,
            "top_p": config.top_p,
            "enabled": config.enabled,
            "auto_tag_enabled": config.auto_tag_enabled,
            "description": config.description,
            "created_at": config.created_at.isoformat(),
            "updated_at": config.updated_at.isoformat(),
        }

        return LLMConfigResponse(**config_dict)

    except Exception as e:
        logger.error(f"Error creating LLM config: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="创建 LLM 配置失败",
        )


@router.put(
    "",
    response_model=LLMConfigResponse,
    summary="更新 LLM 配置",
    description="更新当前的 LLM 配置。",
)
async def update_llm_config(
    update_data: LLMConfigUpdate,
    current_user: User = Depends(get_current_admin),
    db: Session = Depends(get_db),
):
    """更新 LLM 配置"""
    try:
        config = LLMConfigService.update_config(
            db, update_data.model_dump(exclude_unset=True)
        )

        # 返回完整配置（包括明文 API 密钥）
        config_dict = {
            "id": config.id,
            "provider": config.provider.value,
            "api_key": config.api_key,  # 明文显示 API 密钥
            "base_url": config.base_url,
            "default_model": config.default_model,
            "temperature": config.temperature,
            "max_tokens": config.max_tokens,
            "top_p": config.top_p,
            "enabled": config.enabled,
            "auto_tag_enabled": config.auto_tag_enabled,
            "description": config.description,
            "created_at": config.created_at.isoformat(),
            "updated_at": config.updated_at.isoformat(),
        }

        return LLMConfigResponse(**config_dict)

    except NotFoundError as e:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=str(e),
        )
    except Exception as e:
        logger.error(f"Error updating LLM config: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="更新 LLM 配置失败",
        )


@router.delete(
    "",
    status_code=status.HTTP_204_NO_CONTENT,
    summary="删除 LLM 配置",
    description="删除当前的 LLM 配置。",
)
async def delete_llm_config(
    current_user: User = Depends(get_current_admin),
    db: Session = Depends(get_db),
):
    """删除 LLM 配置"""
    try:
        success = LLMConfigService.delete_config(db)
        if not success:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="LLM 配置不存在",
            )
        return

    except Exception as e:
        logger.error(f"Error deleting LLM config: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="删除 LLM 配置失败",
        )


@router.get(
    "/presets",
    summary="获取提供商预设配置",
    description="获取所有 LLM 提供商的预设配置（从环境变量）。",
)
async def get_provider_presets(
    current_user: User = Depends(get_current_admin),
):
    """获取提供商预设配置"""
    try:
        presets = LLMConfigService.get_provider_presets()
        return presets
    except Exception as e:
        logger.error(f"Error getting provider presets: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="获取提供商预设失败",
        )


@router.post(
    "/test",
    response_model=LLMConfigTestResponse,
    summary="测试 LLM 连接",
    description="测试 LLM API 连接是否正常。",
)
async def test_llm_connection(
    test_request: LLMConfigTestRequest,
    current_user: User = Depends(get_current_admin),
):
    """测试 LLM 连接"""
    try:
        success, message, latency = await LLMConfigService.test_connection(
            provider=test_request.provider.value,
            api_key=test_request.api_key,
            base_url=test_request.base_url,
            model=test_request.model,
        )

        return LLMConfigTestResponse(
            success=success,
            message=message,
            latency=latency,
        )

    except Exception as e:
        logger.error(f"Error testing LLM connection: {e}")
        return LLMConfigTestResponse(
            success=False,
            message=f"测试失败: {str(e)}",
            latency=None,
        )

