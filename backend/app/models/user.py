"""
用户模型
"""
from sqlalchemy import Column, String, Boolean, Integer
from sqlalchemy.orm import relationship

from app.models.base import BaseModel


class User(BaseModel):
    """用户表"""

    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    email = Column(String(255), unique=True, index=True, nullable=False)
    username = Column(String(50), unique=True, index=True, nullable=True)
    hashed_password = Column(String(255), nullable=False)
    full_name = Column(String(100), nullable=True)
    avatar_url = Column(String(500), nullable=True)
    is_active = Column(Boolean, default=True, nullable=False)
    is_verified = Column(Boolean, default=False, nullable=False)

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

    def __repr__(self):
        return f"<User(id={self.id}, email='{self.email}')>"

