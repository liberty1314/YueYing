"""
用户设置模型
"""
from sqlalchemy import Column, Integer, Boolean, ForeignKey
from sqlalchemy.orm import relationship
from app.models.base import BaseModel


class UserSettings(BaseModel):
    """用户设置表"""

    __tablename__ = "user_settings"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False, unique=True, index=True)
    
    # AI 功能设置
    auto_generate_tags = Column(Boolean, nullable=False, default=False, server_default='false', comment="创建记录时自动生成标签")
    
    # 关联用户
    user = relationship("User", back_populates="settings")

    def __repr__(self):
        return f"<UserSettings(user_id={self.user_id}, auto_generate_tags={self.auto_generate_tags})>"

