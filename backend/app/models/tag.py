"""
标签模型
"""
from sqlalchemy import Column, String, Integer, Enum, Boolean, ForeignKey
from sqlalchemy.orm import relationship
import enum

from app.models.base import BaseModel


class TagType(str, enum.Enum):
    """标签类型枚举"""

    EMOTION = "emotion"  # 情绪标签（治愈、烧脑、感动等）
    THEME = "theme"  # 主题标签（成长、爱情、科幻等）
    STYLE = "style"  # 风格标签（文艺、商业、实验等）
    CUSTOM = "custom"  # 自定义标签


class Tag(BaseModel):
    """标签表"""

    __tablename__ = "tags"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    name = Column(String(100), nullable=False, unique=True, index=True)
    type = Column(Enum(TagType), nullable=False, default=TagType.CUSTOM, index=True)
    is_auto = Column(Boolean, nullable=False, default=False)  # 是否AI自动生成
    color = Column(String(20), nullable=True)  # 标签颜色（用于前端显示）
    description = Column(String(500), nullable=True)  # 标签描述

    # 关系
    items = relationship(
        "ItemTag",
        back_populates="tag",
        cascade="all, delete-orphan",
    )

    def __repr__(self):
        return f"<Tag(id={self.id}, name='{self.name}', type='{self.type}')>"


class ItemTag(BaseModel):
    """条目标签关系表"""

    __tablename__ = "item_tags"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    item_id = Column(
        Integer, ForeignKey("items.id", ondelete="CASCADE"), nullable=False, index=True
    )
    tag_id = Column(
        Integer, ForeignKey("tags.id", ondelete="CASCADE"), nullable=False, index=True
    )

    # 关系
    item = relationship("Item", back_populates="tags")
    tag = relationship("Tag", back_populates="items")

    def __repr__(self):
        return f"<ItemTag(item_id={self.item_id}, tag_id={self.tag_id})>"

