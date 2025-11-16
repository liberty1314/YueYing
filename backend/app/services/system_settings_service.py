"""
系统设置服务
"""
from sqlalchemy.orm import Session
from loguru import logger

from app.models.system_settings import SystemSettings
from app.core.exceptions import NotFoundError
from app.core.config import settings as config


class SystemSettingsService:
    """系统设置服务 - 单例模式"""
    
    @staticmethod
    def _create_default_settings(db: Session) -> SystemSettings:
        """从环境变量创建默认系统设置"""
        logger.info("Creating default system settings from environment variables")
        
        default_settings = SystemSettings(
            enable_explore=config.DEFAULT_ENABLE_EXPLORE,
            allow_user_ai_tag_settings=config.DEFAULT_ALLOW_USER_AI_TAG_SETTINGS,
            allow_anonymous_home_access=config.DEFAULT_ALLOW_ANONYMOUS_HOME_ACCESS,
        )
        
        db.add(default_settings)
        db.commit()
        db.refresh(default_settings)
        
        logger.info(f"Created default system settings: {default_settings}")
        return default_settings
    
    @staticmethod
    def _force_update_from_env(db: Session, settings: SystemSettings) -> SystemSettings:
        """强制从环境变量更新系统设置"""
        logger.warning("Force updating system settings from environment variables")
        
        settings.enable_explore = config.DEFAULT_ENABLE_EXPLORE
        settings.allow_user_ai_tag_settings = config.DEFAULT_ALLOW_USER_AI_TAG_SETTINGS
        settings.allow_anonymous_home_access = config.DEFAULT_ALLOW_ANONYMOUS_HOME_ACCESS
        
        db.commit()
        db.refresh(settings)
        
        logger.info(f"Force updated system settings: {settings}")
        return settings
    
    @staticmethod
    def get_settings(db: Session) -> SystemSettings:
        """
        获取系统设置（单例）
        
        逻辑：
        1. 如果 FORCE_READ_ENV_SETTINGS=true，强制从环境变量更新数据库设置
        2. 如果数据库没有设置，从环境变量创建默认设置
        3. 否则返回数据库中的设置
        """
        settings = db.query(SystemSettings).first()
        
        # 情况1：强制从环境变量读取并覆盖数据库
        if config.FORCE_READ_ENV_SETTINGS:
            if settings:
                # 数据库有设置，强制更新
                return SystemSettingsService._force_update_from_env(db, settings)
            else:
                # 数据库没有设置，创建默认设置
                return SystemSettingsService._create_default_settings(db)
        
        # 情况2：数据库没有设置，创建默认设置
        if not settings:
            logger.info("No system settings found in database, creating defaults")
            return SystemSettingsService._create_default_settings(db)
        
        # 情况3：正常情况，返回数据库设置
        return settings
    
    @staticmethod
    def update_settings(db: Session, update_data: dict) -> SystemSettings:
        """更新系统设置"""
        settings = db.query(SystemSettings).first()
        
        if not settings:
            raise NotFoundError("系统设置不存在")
        
        # 更新字段
        for key, value in update_data.items():
            if hasattr(settings, key):
                setattr(settings, key, value)
        
        try:
            db.commit()
            db.refresh(settings)
            logger.info(f"Updated system settings: {update_data}")
            return settings
        except Exception as e:
            db.rollback()
            logger.error(f"Error updating system settings: {e}")
            raise
    
    @staticmethod
    def is_explore_enabled(db: Session) -> bool:
        """检查探索功能是否启用"""
        try:
            settings = db.query(SystemSettings).first()
            return settings.enable_explore if settings else False
        except Exception as e:
            logger.error(f"Error checking explore status: {e}")
            return False

