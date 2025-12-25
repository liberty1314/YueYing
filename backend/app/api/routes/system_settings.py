"""
系统设置 API 路由
"""
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from loguru import logger

from app.core.database import get_db
from app.api.dependencies.auth import get_current_admin, get_current_user
from app.models.user import User
from app.schemas.system_settings import (
    SystemSettingsUpdate,
    SystemSettingsResponse,
)
from app.services.system_settings_service import SystemSettingsService
from app.core.exceptions import NotFoundError


router = APIRouter(prefix="/system-settings", tags=["系统设置"])


@router.get(
    "/public",
    summary="获取公开的系统设置",
    description="获取公开的系统设置（无需登录）。仅返回公开可见的设置项。",
)
async def get_public_system_settings(
    db: Session = Depends(get_db),
):
    """
    获取公开的系统设置（无需登录）
    
    返回：
    - allow_anonymous_home_access: 是否允许未登录用户访问首页
    - enable_explore: 是否启用探索/推荐功能
    - enable_stats: 是否启用数据统计页面
    - enable_ai_assistant: 是否启用AI助手页面
    """
    try:
        settings = SystemSettingsService.get_settings(db)
        return {
            "allow_anonymous_home_access": settings.allow_anonymous_home_access,
            "enable_explore": settings.enable_explore,
            "enable_stats": settings.enable_stats,
            "enable_ai_assistant": settings.enable_ai_assistant,
        }
    except Exception as e:
        logger.error(f"Error getting public system settings: {e}", exc_info=True)
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="获取系统设置失败",
        )


@router.get(
    "",
    response_model=SystemSettingsResponse,
    summary="获取系统设置",
    description="获取当前的系统设置（需要登录）。如果数据库中没有设置，将自动从环境变量创建默认设置。",
)
async def get_system_settings(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """
    获取系统设置
    
    自动处理：
    - 如果数据库没有设置，从环境变量创建默认设置
    - 如果 FORCE_READ_ENV_SETTINGS=true，强制从环境变量更新设置
    """
    try:
        settings = SystemSettingsService.get_settings(db)
        return SystemSettingsResponse.model_validate(settings)
    except Exception as e:
        logger.error(f"Error getting system settings: {e}", exc_info=True)
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="获取系统设置失败",
        )


@router.put(
    "",
    response_model=SystemSettingsResponse,
    summary="更新系统设置",
    description="更新系统设置（仅管理员）。",
)
async def update_system_settings(
    update_data: SystemSettingsUpdate,
    current_user: User = Depends(get_current_admin),
    db: Session = Depends(get_db),
):
    """更新系统设置"""
    try:
        settings = SystemSettingsService.update_settings(
            db, update_data.model_dump(exclude_unset=True)
        )
        return SystemSettingsResponse.model_validate(settings)
    except NotFoundError as e:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=str(e),
        )
    except Exception as e:
        logger.error(f"Error updating system settings: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="更新系统设置失败",
        )

