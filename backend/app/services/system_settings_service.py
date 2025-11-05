"""
系统设置服务
"""
from sqlalchemy.orm import Session
from loguru import logger

from app.models.system_settings import SystemSettings
from app.core.exceptions import NotFoundError


class SystemSettingsService:
    """系统设置服务 - 单例模式"""
    
    @staticmethod
    def get_settings(db: Session) -> SystemSettings:
        """获取系统设置（单例）"""
        settings = db.query(SystemSettings).first()
        if not settings:
            raise NotFoundError("系统设置不存在")
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

