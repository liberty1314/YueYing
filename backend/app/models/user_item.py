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

    WANT_TO_WATCH = "want_to_watch"  # 想看/想读
    WATCHING = "watching"  # 在看/在读
    WATCHED = "watched"  # 看过/读过
    # 保留旧值兼容性
    WANT = "want"  
    DOING = "doing"  
    DONE = "done"  


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
    status = Column(String(50), nullable=False, default="want_to_watch", index=True)  # 改为 String 以支持新值
    rating = Column(Integer, nullable=True)  # 评分 0-10（改为 Integer）
    notes = Column(Text, nullable=True)  # 个人笔记
    
    # 日期字段（新）
    started_at = Column(String(50), nullable=True)  # 开始日期
    completed_at = Column(String(50), nullable=True)  # 完成日期
    
    # 旧字段（保留兼容性）
    watched_date = Column(Date, nullable=True, index=True)  # 观看/阅读完成日期
    progress = Column(Integer, nullable=True)  # 进度（第几集/第几页）
    is_favorite = Column(Integer, nullable=False, default=0)  # 是否收藏

    # 关系
    user = relationship("User", back_populates="user_items")
    item = relationship("Item", back_populates="user_items")
    collection_items = relationship(
        "CollectionItem",
        back_populates="user_item",
        cascade="all, delete-orphan",
    )
    tags = relationship(
        "UserItemTag",
        back_populates="user_item",
        cascade="all, delete-orphan",
    )

    def __repr__(self):
        return f"<UserItem(id={self.id}, user_id={self.user_id}, item_id={self.item_id}, status='{self.status}')>"

