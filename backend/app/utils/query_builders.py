"""
数据库查询构建工具

提供可复用的查询构建函数，减少重复的过滤、排序和分页逻辑
"""
from typing import Any, Dict, List, Optional, Type, TypeVar
from sqlalchemy.orm import Query
from sqlalchemy import asc, desc, or_, and_
from sqlalchemy.sql import ColumnElement

T = TypeVar('T')


def build_filter_query(
    query: Query,
    model: Type[T],
    filters: Dict[str, Any],
    exact_match: bool = True
) -> Query:
    """
    根据过滤条件构建查询
    
    Args:
        query: SQLAlchemy 查询对象
        model: 模型类
        filters: 过滤条件字典
        exact_match: 是否精确匹配（False 时使用 LIKE）
    
    Returns:
        添加了过滤条件的查询对象
    
    Examples:
        query = db.query(UserItem)
        filters = {"status": "watching", "content_type": "movie"}
        query = build_filter_query(query, UserItem, filters)
    """
    for field, value in filters.items():
        if value is None:
            continue
        
        # 检查模型是否有该字段
        if not hasattr(model, field):
            continue
        
        column = getattr(model, field)
        
        if exact_match:
            query = query.filter(column == value)
        else:
            # 模糊匹配（用于字符串字段）
            if isinstance(value, str):
                query = query.filter(column.ilike(f"%{value}%"))
            else:
                query = query.filter(column == value)
    
    return query


def build_sort_query(
    query: Query,
    model: Type[T],
    sort_by: Optional[str] = None,
    sort_order: str = "desc"
) -> Query:
    """
    根据排序条件构建查询
    
    Args:
        query: SQLAlchemy 查询对象
        model: 模型类
        sort_by: 排序字段名
        sort_order: 排序顺序 ("asc" 或 "desc")
    
    Returns:
        添加了排序条件的查询对象
    
    Examples:
        query = db.query(UserItem)
        query = build_sort_query(query, UserItem, "created_at", "desc")
    """
    if not sort_by:
        return query
    
    # 检查模型是否有该字段
    if not hasattr(model, sort_by):
        return query
    
    column = getattr(model, sort_by)
    
    if sort_order.lower() == "asc":
        query = query.order_by(asc(column))
    else:
        query = query.order_by(desc(column))
    
    return query


def build_pagination_query(
    query: Query,
    page: int = 1,
    page_size: int = 20,
    max_page_size: int = 100
) -> tuple[Query, int, int]:
    """
    添加分页到查询
    
    Args:
        query: SQLAlchemy 查询对象
        page: 页码（从 1 开始）
        page_size: 每页数量
        max_page_size: 最大每页数量
    
    Returns:
        (分页后的查询, 跳过的记录数, 实际每页数量)
    
    Examples:
        query = db.query(UserItem)
        query, skip, limit = build_pagination_query(query, page=2, page_size=10)
        items = query.all()
    """
    # 验证和调整参数
    page = max(1, page)
    page_size = min(max(1, page_size), max_page_size)
    
    # 计算跳过的记录数
    skip = (page - 1) * page_size
    
    # 应用分页
    query = query.offset(skip).limit(page_size)
    
    return query, skip, page_size


def build_search_query(
    query: Query,
    model: Type[T],
    search_term: str,
    search_fields: List[str]
) -> Query:
    """
    构建搜索查询（在多个字段中搜索）
    
    Args:
        query: SQLAlchemy 查询对象
        model: 模型类
        search_term: 搜索关键词
        search_fields: 要搜索的字段列表
    
    Returns:
        添加了搜索条件的查询对象
    
    Examples:
        query = db.query(UserItem)
        query = build_search_query(
            query, UserItem, "星际", ["title", "description"]
        )
    """
    if not search_term or not search_fields:
        return query
    
    # 构建 OR 条件
    conditions = []
    for field in search_fields:
        if hasattr(model, field):
            column = getattr(model, field)
            conditions.append(column.ilike(f"%{search_term}%"))
    
    if conditions:
        query = query.filter(or_(*conditions))
    
    return query


def build_date_range_query(
    query: Query,
    model: Type[T],
    date_field: str,
    start_date: Optional[Any] = None,
    end_date: Optional[Any] = None
) -> Query:
    """
    构建日期范围查询
    
    Args:
        query: SQLAlchemy 查询对象
        model: 模型类
        date_field: 日期字段名
        start_date: 开始日期
        end_date: 结束日期
    
    Returns:
        添加了日期范围条件的查询对象
    
    Examples:
        query = db.query(UserItem)
        query = build_date_range_query(
            query, UserItem, "created_at",
            start_date=datetime(2024, 1, 1),
            end_date=datetime(2024, 12, 31)
        )
    """
    if not hasattr(model, date_field):
        return query
    
    column = getattr(model, date_field)
    
    if start_date:
        query = query.filter(column >= start_date)
    
    if end_date:
        query = query.filter(column <= end_date)
    
    return query


def build_in_query(
    query: Query,
    model: Type[T],
    field: str,
    values: List[Any]
) -> Query:
    """
    构建 IN 查询
    
    Args:
        query: SQLAlchemy 查询对象
        model: 模型类
        field: 字段名
        values: 值列表
    
    Returns:
        添加了 IN 条件的查询对象
    
    Examples:
        query = db.query(UserItem)
        query = build_in_query(
            query, UserItem, "status", ["watching", "completed"]
        )
    """
    if not values or not hasattr(model, field):
        return query
    
    column = getattr(model, field)
    query = query.filter(column.in_(values))
    
    return query


def apply_filters_and_pagination(
    query: Query,
    model: Type[T],
    filters: Optional[Dict[str, Any]] = None,
    search_term: Optional[str] = None,
    search_fields: Optional[List[str]] = None,
    sort_by: Optional[str] = None,
    sort_order: str = "desc",
    page: int = 1,
    page_size: int = 20
) -> tuple[Query, int, int]:
    """
    一次性应用过滤、搜索、排序和分页
    
    这是一个便捷函数，组合了多个查询构建函数
    
    Args:
        query: SQLAlchemy 查询对象
        model: 模型类
        filters: 过滤条件
        search_term: 搜索关键词
        search_fields: 搜索字段
        sort_by: 排序字段
        sort_order: 排序顺序
        page: 页码
        page_size: 每页数量
    
    Returns:
        (处理后的查询, 跳过的记录数, 每页数量)
    
    Examples:
        query = db.query(UserItem)
        query, skip, limit = apply_filters_and_pagination(
            query, UserItem,
            filters={"status": "watching"},
            search_term="星际",
            search_fields=["title"],
            sort_by="created_at",
            page=1,
            page_size=10
        )
        items = query.all()
    """
    # 应用过滤
    if filters:
        query = build_filter_query(query, model, filters)
    
    # 应用搜索
    if search_term and search_fields:
        query = build_search_query(query, model, search_term, search_fields)
    
    # 应用排序
    if sort_by:
        query = build_sort_query(query, model, sort_by, sort_order)
    
    # 应用分页
    query, skip, limit = build_pagination_query(query, page, page_size)
    
    return query, skip, limit


def get_total_count(query: Query) -> int:
    """
    获取查询的总记录数（不应用分页）
    
    Args:
        query: SQLAlchemy 查询对象
    
    Returns:
        总记录数
    
    Examples:
        query = db.query(UserItem).filter(UserItem.status == "watching")
        total = get_total_count(query)
    """
    return query.count()


def calculate_pagination_info(
    total: int,
    page: int,
    page_size: int
) -> Dict[str, Any]:
    """
    计算分页信息
    
    Args:
        total: 总记录数
        page: 当前页码
        page_size: 每页数量
    
    Returns:
        包含分页信息的字典
    
    Examples:
        total = get_total_count(query)
        pagination = calculate_pagination_info(total, page=2, page_size=10)
        # {
        #     "total": 45,
        #     "page": 2,
        #     "page_size": 10,
        #     "total_pages": 5,
        #     "has_next": True,
        #     "has_prev": True
        # }
    """
    total_pages = (total + page_size - 1) // page_size if page_size > 0 else 0
    
    return {
        "total": total,
        "page": page,
        "page_size": page_size,
        "total_pages": total_pages,
        "has_next": page < total_pages,
        "has_prev": page > 1
    }
