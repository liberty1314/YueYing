"""
内容条目模型
"""
from sqlalchemy import Column, String, Integer, Text, Enum, JSON
from sqlalchemy.orm import relationship
import enum

from app.models.base import BaseModel


class ItemType(str, enum.Enum):
    """内容类型枚举"""

    MOVIE = "movie"
    TV_SERIES = "tv_series"
    ANIME = "anime"
    BOOK = "book"


class Item(BaseModel):
    """内容条目表"""

    __tablename__ = "items"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    type = Column(Enum(ItemType), nullable=False, index=True)
    title = Column(String(500), nullable=False, index=True)
    original_title = Column(String(500), nullable=True)
    cover_url = Column(String(1000), nullable=True)
    release_year = Column(Integer, nullable=True, index=True)
    director = Column(String(255), nullable=True)
    author = Column(String(255), nullable=True)
    cast = Column(Text, nullable=True)  # JSON 格式存储演员列表
    description = Column(Text, nullable=True)
    genres = Column(Text, nullable=True)  # JSON 格式存储类型列表
    duration = Column(Integer, nullable=True)  # 电影时长（分钟）或书籍页数
    language = Column(String(50), nullable=True)
    country = Column(String(100), nullable=True)

    # 外部ID（用于关联第三方数据）
    external_ids = Column(JSON, nullable=True)
    # 格式: {"tmdb": 123, "douban": "12345678", "anilist": 12345, ...}

    # 外部评分
    external_ratings = Column(JSON, nullable=True)
    # 格式: {"tmdb": 8.5, "douban": 9.0, "anilist": 8.8}

    # 关系
    user_items = relationship(
        "UserItem",
        back_populates="item",
        cascade="all, delete-orphan",
    )
    tags = relationship(
        "ItemTag",
        back_populates="item",
        cascade="all, delete-orphan",
    )

    def __repr__(self):
        return f"<Item(id={self.id}, type='{self.type}', title='{self.title}')>"

