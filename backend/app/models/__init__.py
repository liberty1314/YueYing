"""
数据模型导入

导入所有模型以便 Alembic 能够检测到它们
"""
from app.models.base import BaseModel, TimestampMixin
from app.models.user import User, UserRole
from app.models.item import Item, ItemType
from app.models.user_item import UserItem, ItemStatus
from app.models.tag import Tag, TagType, ItemTag
from app.models.collection import Collection, CollectionItem
from app.models.llm_config import LLMConfig
from app.models.system_settings import SystemSettings

__all__ = [
    "BaseModel",
    "TimestampMixin",
    "User",
    "UserRole",
    "Item",
    "ItemType",
    "UserItem",
    "ItemStatus",
    "Tag",
    "TagType",
    "ItemTag",
    "Collection",
    "CollectionItem",
    "LLMConfig",
    "SystemSettings",
]
