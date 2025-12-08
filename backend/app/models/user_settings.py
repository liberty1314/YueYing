"""
用户设置模型
"""
from sqlalchemy import Column, Integer, Boolean, String, ForeignKey
from sqlalchemy.orm import relationship
from app.models.base import BaseModel


class UserSettings(BaseModel):
    """用户设置表"""

    __tablename__ = "user_settings"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False, unique=True, index=True)
    
    # AI 功能设置
    auto_generate_tags = Column(Boolean, nullable=False, default=False, server_default='false', comment="创建记录时自动生成标签")
    
    # 搜索设置
    enable_strict_search_filter = Column(Boolean, nullable=False, default=True, server_default='true', comment="启用严格搜索过滤（只返回标题包含关键词的结果）")
    
    # 关联用户
    user = relationship("User", back_populates="settings")

    def __repr__(self):
        return f"<UserSettings(user_id={self.user_id}, auto_generate_tags={self.auto_generate_tags}, enable_strict_search_filter={self.enable_strict_search_filter})>"

