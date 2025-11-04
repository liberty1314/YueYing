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

    id = Column(Integer, primary_key=True, index=True, autoincrement=True, comment="条目ID")
    
    # 外部数据源信息
    external_id = Column(String(255), nullable=False, index=True, comment="外部数据源ID")
    source = Column(String(50), nullable=False, index=True, comment="数据源(tmdb/google_books/bangumi)")
    content_type = Column(String(50), nullable=False, index=True, comment="内容类型(movie/tv/anime/book/game)")
    
    # 基本信息
    type = Column(Enum(ItemType), nullable=True, index=True, comment="条目类型(枚举)")
    title = Column(String(500), nullable=False, index=True, comment="标题")
    original_title = Column(String(500), nullable=True, comment="原始标题")
    description = Column(Text, nullable=True, comment="简介描述")
    
    # 图片
    poster_url = Column(String(1000), nullable=True, comment="海报图URL")
    backdrop_url = Column(String(1000), nullable=True, comment="背景图URL")
    cover_url = Column(String(1000), nullable=True, comment="封面图URL(兼容旧版)")
    
    # 发行信息
    release_date = Column(String(50), nullable=True, comment="发布日期")
    release_year = Column(Integer, nullable=True, index=True, comment="发行年份")
    year = Column(String(10), nullable=True, comment="年份字符串")
    
    # 创作者
    director = Column(String(255), nullable=True, comment="导演")
    author = Column(String(255), nullable=True, comment="作者")
    cast = Column(Text, nullable=True, comment="演员列表(JSON格式)")
    
    # 详细信息
    genres = Column(Text, nullable=True, comment="类型列表(JSON格式)")
    duration = Column(Integer, nullable=True, comment="时长(分钟)或页数")
    language = Column(String(50), nullable=True, comment="语言")
    country = Column(String(100), nullable=True, comment="国家/地区")

    # 元数据
    extra_data = Column(JSON, nullable=True, comment="额外元数据(JSON格式)")

    # 外部ID(兼容旧版)
    external_ids = Column(JSON, nullable=True, comment="外部平台ID映射(JSON)")

    # 外部评分
    external_ratings = Column(JSON, nullable=True, comment="外部平台评分(JSON)")

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

