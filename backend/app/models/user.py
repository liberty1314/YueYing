"""
用户模型
"""
from sqlalchemy import Column, String, Boolean, Integer, Enum as SQLEnum
from sqlalchemy.orm import relationship
import enum

from app.models.base import BaseModel


class UserRole(str, enum.Enum):
    """用户角色枚举"""
    USER = "user"              # 普通用户（默认）
    ADMIN = "admin"            # 管理员


class User(BaseModel):
    """用户表（包含普通用户和管理员）"""

    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True, comment="用户ID")
    email = Column(String(255), unique=True, index=True, nullable=False, comment="邮箱地址")
    username = Column(String(50), unique=True, index=True, nullable=True, comment="用户名")
    hashed_password = Column(String(255), nullable=False, comment="加密后的密码")
    full_name = Column(String(100), nullable=True, comment="真实姓名")
    avatar_url = Column(String(500), nullable=True, comment="头像URL")
    is_active = Column(Boolean, default=True, nullable=False, comment="是否激活")
    is_verified = Column(Boolean, default=False, nullable=False, comment="是否已验证邮箱")
    role = Column(SQLEnum(UserRole, values_callable=lambda x: [e.value for e in x]), nullable=False, default=UserRole.USER, index=True, comment="用户角色")

    # 关系
    user_items = relationship(
        "UserItem",
        back_populates="user",
        cascade="all, delete-orphan",
    )
    collections = relationship(
        "Collection",
        back_populates="user",
        cascade="all, delete-orphan",
    )
    tags = relationship(
        "Tag",
        back_populates="user",
        cascade="all, delete-orphan",
    )
    settings = relationship(
        "UserSettings",
        back_populates="user",
        uselist=False,
        cascade="all, delete-orphan",
    )
    conversations = relationship(
        "Conversation",
        back_populates="user",
        cascade="all, delete-orphan",
    )
    summaries = relationship(
        "Summary",
        back_populates="user",
        cascade="all, delete-orphan",
    )

    def is_admin(self) -> bool:
        """检查是否为管理员"""
        return self.role == UserRole.ADMIN

    def __repr__(self):
        return f"<User(id={self.id}, email='{self.email}', role='{self.role}')>"

