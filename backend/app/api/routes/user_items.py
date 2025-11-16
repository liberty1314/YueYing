"""
用户记录 API 路由

此文件已重构为模块化结构，实际路由定义在 user_items/ 子目录中：
- user_items/crud.py: CRUD 操作（创建、读取、更新、删除）
- user_items/query.py: 查询操作（列表、分页、统计）

此文件仅用于向后兼容，直接导出子模块的路由器。
"""

from app.api.routes.user_items import router

__all__ = ["router"]
