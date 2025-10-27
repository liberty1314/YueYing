"""
用户记录模型
"""
from sqlalchemy import (
    Column,
    Integer,
    String,
    Float,
    Date,
    Text,
    Enum,
    ForeignKey,
)
from sqlalchemy.orm import relationship
import enum

from app.models.base import BaseModel


class ItemStatus(str, enum.Enum):
    """记录状态枚举"""

    WANT = "want"  # 想看/想读
    DOING = "doing"  # 在看/在读
    DONE = "done"  # 看过/读过


class UserItem(BaseModel):
    """用户记录表"""

    __tablename__ = "user_items"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    user_id = Column(
        Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True
    )
    item_id = Column(
        Integer, ForeignKey("items.id", ondelete="CASCADE"), nullable=False, index=True
    )
    status = Column(Enum(ItemStatus), nullable=False, default=ItemStatus.WANT, index=True)
    rating = Column(Float, nullable=True)  # 评分 0-5
    watched_date = Column(Date, nullable=True, index=True)  # 观看/阅读完成日期
    progress = Column(Integer, nullable=True)  # 进度（第几集/第几页）
    notes = Column(Text, nullable=True)  # 个人笔记
    is_favorite = Column(Integer, nullable=False, default=0)  # 是否收藏

    # 关系
    user = relationship("User", back_populates="user_items")
    item = relationship("Item", back_populates="user_items")
    collection_items = relationship(
        "CollectionItem",
        back_populates="user_item",
        cascade="all, delete-orphan",
    )

    def __repr__(self):
        return f"<UserItem(id={self.id}, user_id={self.user_id}, item_id={self.item_id}, status='{self.status}')>"

