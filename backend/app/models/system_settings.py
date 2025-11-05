"""
系统设置模型
"""
from sqlalchemy import Column, Integer, Boolean
from app.models.base import BaseModel


class SystemSettings(BaseModel):
    """系统设置表 - 单例模式，全局只有一条记录"""

    __tablename__ = "system_settings"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    
    # 功能开关
    enable_explore = Column(
        Boolean, 
        nullable=False, 
        default=False, 
        server_default='false', 
        comment="启用探索/推荐功能"
    )

    def __repr__(self):
        return f"<SystemSettings(id={self.id}, enable_explore={self.enable_explore})>"

