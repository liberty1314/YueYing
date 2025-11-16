"""
用户记录路由模块

将 CRUD 和查询路由整合到统一的路由器中
"""

from fastapi import APIRouter
from . import crud, query

# 创建主路由器
router = APIRouter(prefix="/user-items", tags=["用户条目"])

# 包含 CRUD 路由（创建、读取、更新、删除）
router.include_router(crud.router)

# 包含查询路由（列表、游标分页、统计）
router.include_router(query.router)

__all__ = ["router"]
