"""
用户设置 API 路由
"""
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from loguru import logger

from app.core.database import get_db
from app.api.dependencies.auth import get_current_user
from app.models.user import User
from app.schemas.user_settings import UserSettingsResponse, UserSettingsUpdate
from app.services.user_settings_service import UserSettingsService


router = APIRouter(prefix="/settings", tags=["User Settings"])


@router.get(
    "",
    response_model=UserSettingsResponse,
    summary="获取用户设置",
    description="获取当前用户的设置。",
)
def get_user_settings(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """获取用户设置"""
    try:
        settings = UserSettingsService.get_or_create_settings(db, current_user.id)
        return settings
    except Exception as e:
        logger.error(f"Error getting settings for user {current_user.id}: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="获取用户设置失败",
        )


@router.put(
    "",
    response_model=UserSettingsResponse,
    summary="更新用户设置",
    description="更新当前用户的设置。",
)
def update_user_settings(
    settings_data: UserSettingsUpdate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """更新用户设置"""
    try:
        settings = UserSettingsService.update_settings(
            db, current_user.id, settings_data
        )
        return settings
    except Exception as e:
        logger.error(f"Error updating settings for user {current_user.id}: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="更新用户设置失败",
        )

