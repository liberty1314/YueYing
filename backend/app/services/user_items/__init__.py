"""
用户记录服务

将原有的 UserItemService 拆分为多个模块：
- crud.py: 基础 CRUD 操作
- business.py: 业务逻辑（查询、统计）
"""

from typing import Optional, List, Tuple
from sqlalchemy.orm import Session

from app.schemas.user_item import UserItemCreate, UserItemUpdate, UserItemFilters
from app.models.user_item import UserItem

from .crud import (
    create_user_item,
    get_user_item,
    update_user_item,
    delete_user_item,
    check_user_item,
)
from .business import (
    get_user_items,
    get_user_items_with_cursor,
    get_user_item_stats,
)


class UserItemService:
    """用户记录服务类（保持向后兼容）"""

    # CRUD 操作
    create_user_item = staticmethod(create_user_item)
    get_user_item = staticmethod(get_user_item)
    update_user_item = staticmethod(update_user_item)
    delete_user_item = staticmethod(delete_user_item)
    check_user_item = staticmethod(check_user_item)

    # 业务逻辑
    get_user_items = staticmethod(get_user_items)
    get_user_items_with_cursor = staticmethod(get_user_items_with_cursor)
    get_user_item_stats = staticmethod(get_user_item_stats)


__all__ = [
    "UserItemService",
    # CRUD
    "create_user_item",
    "get_user_item",
    "update_user_item",
    "delete_user_item",
    "check_user_item",
    # 业务逻辑
    "get_user_items",
    "get_user_items_with_cursor",
    "get_user_item_stats",
]
