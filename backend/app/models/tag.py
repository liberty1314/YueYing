"""
标签模型
"""
from sqlalchemy import Column, String, Integer, Enum, Boolean, ForeignKey, UniqueConstraint
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
    """标签表（用户级别）"""

    __tablename__ = "tags"
    __table_args__ = (
        UniqueConstraint('user_id', 'name', name='uix_user_tag_name'),
    )

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    user_id = Column(
        Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True
    )
    name = Column(String(100), nullable=False, index=True)
    type = Column(Enum(TagType), nullable=False, default=TagType.CUSTOM, index=True)
    is_auto = Column(Boolean, nullable=False, default=False)  # 是否AI自动生成
    color = Column(String(20), nullable=True)  # 标签颜色（用于前端显示）
    description = Column(String(500), nullable=True)  # 标签描述

    # 关系
    user = relationship("User", back_populates="tags")
    user_items = relationship(
        "UserItemTag",
        back_populates="tag",
        cascade="all, delete-orphan",
    )

    def __repr__(self):
        return f"<Tag(id={self.id}, user_id={self.user_id}, name='{self.name}', type='{self.type}')>"


class UserItemTag(BaseModel):
    """用户记录-标签关系表"""

    __tablename__ = "user_item_tags"
    __table_args__ = (
        UniqueConstraint('user_item_id', 'tag_id', name='uix_user_item_tag'),
    )

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    user_item_id = Column(
        Integer, ForeignKey("user_items.id", ondelete="CASCADE"), nullable=False, index=True
    )
    tag_id = Column(
        Integer, ForeignKey("tags.id", ondelete="CASCADE"), nullable=False, index=True
    )

    # 关系
    user_item = relationship("UserItem", back_populates="tags")
    tag = relationship("Tag", back_populates="user_items")

    def __repr__(self):
        return f"<UserItemTag(user_item_id={self.user_item_id}, tag_id={self.tag_id})>"


# 保留旧的 ItemTag 模型以兼容迁移
class ItemTag(BaseModel):
    """条目标签关系表（已废弃，保留以兼容旧数据）"""

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

    def __repr__(self):
        return f"<ItemTag(item_id={self.item_id}, tag_id={self.tag_id})>"

