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
    
    allow_user_ai_tag_settings = Column(
        Boolean,
        nullable=False,
        default=True,
        server_default='true',
        comment="允许用户自行设置 AI 自动标签"
    )
    
    allow_anonymous_home_access = Column(
        Boolean,
        nullable=False,
        default=True,
        server_default='true',
        comment="允许未登录用户访问首页"
    )
    
    enable_stats = Column(
        Boolean,
        nullable=False,
        default=True,
        server_default='true',
        comment="启用数据统计页面"
    )
    
    enable_ai_assistant = Column(
        Boolean,
        nullable=False,
        default=True,
        server_default='true',
        comment="启用AI助手页面"
    )

    def __repr__(self):
        return f"<SystemSettings(id={self.id}, enable_explore={self.enable_explore}, allow_user_ai_tag_settings={self.allow_user_ai_tag_settings}, allow_anonymous_home_access={self.allow_anonymous_home_access}, enable_stats={self.enable_stats}, enable_ai_assistant={self.enable_ai_assistant})>"

