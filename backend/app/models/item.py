"""
内容条目模型
"""
from sqlalchemy import Column, String, Integer, Text, Enum, JSON, UniqueConstraint
from sqlalchemy.orm import relationship
import enum

from app.models.base import BaseModel


class ItemType(str, enum.Enum):
    """内容类型枚举"""

    MOVIE = "movie"
    TV_SERIES = "tv_series"
    ANIME = "anime"
    BOOK = "book"
    GAME = "game"  # 添加游戏类型


class Item(BaseModel):
    """内容条目表"""

    __tablename__ = "items"
    __table_args__ = (
        UniqueConstraint('external_id', 'source', name='uix_external_id_source'),
    )

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    
    # 外部数据源信息（新增）
    external_id = Column(String(255), nullable=False, index=True)  # 外部ID
    source = Column(String(50), nullable=False, index=True)  # 数据源 (tmdb/google_books/bangumi)
    content_type = Column(String(50), nullable=False, index=True)  # 内容类型 (movie/tv/anime/book/game)
    
    # 基本信息
    type = Column(Enum(ItemType), nullable=True, index=True)  # 保留兼容性，改为可空
    title = Column(String(500), nullable=False, index=True)
    original_title = Column(String(500), nullable=True)
    description = Column(Text, nullable=True)
    
    # 图片
    poster_url = Column(String(1000), nullable=True)  # 海报
    backdrop_url = Column(String(1000), nullable=True)  # 背景图（新增）
    cover_url = Column(String(1000), nullable=True)  # 封面（保留兼容性）
    
    # 发行信息
    release_date = Column(String(50), nullable=True)  # 发布日期（新增）
    release_year = Column(Integer, nullable=True, index=True)
    year = Column(String(10), nullable=True)  # 年份字符串（新增）
    
    # 创作者
    director = Column(String(255), nullable=True)
    author = Column(String(255), nullable=True)
    cast = Column(Text, nullable=True)  # JSON 格式存储演员列表
    
    # 详细信息
    genres = Column(Text, nullable=True)  # JSON 格式存储类型列表
    duration = Column(Integer, nullable=True)  # 电影时长（分钟）或书籍页数
    language = Column(String(50), nullable=True)
    country = Column(String(100), nullable=True)

    # 元数据（新增）
    extra_data = Column(JSON, nullable=True)  # 其他元数据（不能用metadata，是SQLAlchemy保留字段）

    # 外部ID（保留兼容性，改为可空）
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

