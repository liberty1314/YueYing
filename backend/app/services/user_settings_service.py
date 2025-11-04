"""
用户设置服务层
"""
from typing import Optional
from sqlalchemy.orm import Session
from loguru import logger

from app.models.user_settings import UserSettings
from app.schemas.user_settings import UserSettingsCreate, UserSettingsUpdate


class UserSettingsService:
    """用户设置服务"""

    @staticmethod
    def get_or_create_settings(db: Session, user_id: int) -> UserSettings:
        """
        获取或创建用户设置

        Args:
            db: 数据库会话
            user_id: 用户ID

        Returns:
            用户设置对象
        """
        settings = db.query(UserSettings).filter(UserSettings.user_id == user_id).first()

        if not settings:
            # 创建默认设置
            settings = UserSettings(
                user_id=user_id,
                auto_generate_tags=False,  # 默认关闭
            )
            db.add(settings)
            db.commit()
            db.refresh(settings)
            logger.info(f"Created default settings for user {user_id}")

        return settings

    @staticmethod
    def update_settings(
        db: Session,
        user_id: int,
        settings_data: UserSettingsUpdate,
    ) -> UserSettings:
        """
        更新用户设置

        Args:
            db: 数据库会话
            user_id: 用户ID
            settings_data: 设置更新数据

        Returns:
            更新后的设置对象
        """
        settings = UserSettingsService.get_or_create_settings(db, user_id)

        # 更新字段
        update_data = settings_data.model_dump(exclude_unset=True)
        for key, value in update_data.items():
            setattr(settings, key, value)

        db.add(settings)
        db.commit()
        db.refresh(settings)

        logger.info(f"Updated settings for user {user_id}: {update_data}")
        return settings

    @staticmethod
    def check_auto_generate_tags(db: Session, user_id: int) -> bool:
        """
        检查用户是否启用了自动生成标签

        Args:
            db: 数据库会话
            user_id: 用户ID

        Returns:
            是否启用自动生成标签
        """
        settings = UserSettingsService.get_or_create_settings(db, user_id)
        return settings.auto_generate_tags

