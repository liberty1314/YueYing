"""
收藏集模型
"""
from sqlalchemy import Column, String, Integer, Text, ForeignKey, Boolean
from sqlalchemy.orm import relationship

from app.models.base import BaseModel


class Collection(BaseModel):
    """收藏集表"""

    __tablename__ = "collections"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    user_id = Column(
        Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True
    )
    name = Column(String(200), nullable=False)
    description = Column(Text, nullable=True)
    cover_url = Column(String(1000), nullable=True)
    is_public = Column(Boolean, nullable=False, default=False)  # 是否公开
    sort_order = Column(Integer, nullable=False, default=0)  # 排序顺序

    # 关系
    user = relationship("User", back_populates="collections")
    items = relationship(
        "CollectionItem",
        back_populates="collection",
        cascade="all, delete-orphan",
    )

    def __repr__(self):
        return f"<Collection(id={self.id}, name='{self.name}', user_id={self.user_id})>"


class CollectionItem(BaseModel):
    """收藏集内容关系表"""

    __tablename__ = "collection_items"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    collection_id = Column(
        Integer,
        ForeignKey("collections.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )
    user_item_id = Column(
        Integer,
        ForeignKey("user_items.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )
    sort_order = Column(Integer, nullable=False, default=0)  # 在收藏集中的排序

    # 关系
    collection = relationship("Collection", back_populates="items")
    user_item = relationship("UserItem", back_populates="collection_items")

    def __repr__(self):
        return f"<CollectionItem(collection_id={self.collection_id}, user_item_id={self.user_item_id})>"

