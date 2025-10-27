"""
管理员模型
"""
from sqlalchemy import Column, String, Integer, Boolean, Enum
import enum

from app.models.base import BaseModel


class AdminRole(str, enum.Enum):
    """管理员角色枚举"""

    SUPER_ADMIN = "super_admin"  # 超级管理员
    ADMIN = "admin"  # 普通管理员
    MODERATOR = "moderator"  # 内容审核员


class AdminUser(BaseModel):
    """管理员表"""

    __tablename__ = "admin_users"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    email = Column(String(255), unique=True, index=True, nullable=False)
    username = Column(String(50), unique=True, index=True, nullable=False)
    hashed_password = Column(String(255), nullable=False)
    full_name = Column(String(100), nullable=True)
    role = Column(
        Enum(AdminRole), nullable=False, default=AdminRole.MODERATOR, index=True
    )
    is_active = Column(Boolean, default=True, nullable=False)
    avatar_url = Column(String(500), nullable=True)

    def __repr__(self):
        return f"<AdminUser(id={self.id}, username='{self.username}', role='{self.role}')>"

