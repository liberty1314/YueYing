"""
用户记录业务逻辑
"""

from typing import List, Tuple, Optional
from sqlalchemy.orm import Session
from sqlalchemy import and_, or_, func, desc, asc, case
from loguru import logger

from app.models.user_item import UserItem
from app.models.item import Item
from app.schemas.user_item import UserItemFilters


def get_user_items(
    db: Session,
    user_id: int,
    filters: UserItemFilters
) -> Tuple[List[UserItem], int]:
    """
    获取用户记录列表（带筛选、排序、分页）
    
    Args:
        db: 数据库会话
        user_id: 用户ID
        filters: 筛选条件
        
    Returns:
        Tuple[List[UserItem], int]: (记录列表, 总数)
    """
    # 基础查询
    query = db.query(UserItem).join(Item).filter(UserItem.user_id == user_id)

    # 应用筛选条件
    if filters.status:
        query = query.filter(UserItem.status == filters.status)

    if filters.content_type:
        query = query.filter(Item.content_type == filters.content_type)

    if filters.min_rating is not None:
        query = query.filter(UserItem.rating >= filters.min_rating)

    if filters.max_rating is not None:
        query = query.filter(UserItem.rating <= filters.max_rating)

    if filters.year_from:
        query = query.filter(Item.year >= str(filters.year_from))

    if filters.year_to:
        query = query.filter(Item.year <= str(filters.year_to))

    if filters.search:
        search_pattern = f"%{filters.search}%"
        query = query.filter(
            or_(
                Item.title.ilike(search_pattern),
                Item.original_title.ilike(search_pattern),
            )
        )

    # 获取总数
    total = query.count()

    # 应用排序
    if filters.sort_by == "status":
        # 自定义状态排序：watching(1) > want_to_watch(2) > watched(3)
        status_order = case(
            (UserItem.status == "watching", 1),
            (UserItem.status == "want_to_watch", 2),
            (UserItem.status == "watched", 3),
            else_=4
        )
        if filters.sort_order == "desc":
            query = query.order_by(desc(status_order))
        else:
            query = query.order_by(asc(status_order))
        # 二级排序：按更新时间降序
        query = query.order_by(desc(UserItem.updated_at))
    elif filters.sort_by == "title":
        # 按标题排序
        order_column = Item.title
        if filters.sort_order == "desc":
            query = query.order_by(desc(order_column))
        else:
            query = query.order_by(asc(order_column))
    elif filters.sort_by == "year":
        # 按年份排序
        order_column = Item.year
        if filters.sort_order == "desc":
            query = query.order_by(desc(order_column))
        else:
            query = query.order_by(asc(order_column))
    else:
        # 按 UserItem 的其他字段排序
        order_column = getattr(UserItem, filters.sort_by, UserItem.updated_at)
        if filters.sort_order == "desc":
            query = query.order_by(desc(order_column))
        else:
            query = query.order_by(asc(order_column))

    # 应用分页
    offset = (filters.page - 1) * filters.page_size
    query = query.offset(offset).limit(filters.page_size)

    items = query.all()
    
    logger.info(
        f"Retrieved {len(items)} UserItems for user {user_id} (total: {total})"
    )
    return items, total


def get_user_items_with_cursor(
    db: Session,
    user_id: int,
    filters: UserItemFilters
) -> Tuple[List[UserItem], Optional[str], bool]:
    """
    获取用户记录列表（游标分页）

    Args:
        db: 数据库会话
        user_id: 用户ID
        filters: 筛选条件

    Returns:
        Tuple[List[UserItem], Optional[str], bool]: (记录列表, 下一页游标, 是否还有更多数据)
    """
    # 基础查询
    query = db.query(UserItem).join(Item).filter(UserItem.user_id == user_id)

    # 应用筛选条件（同传统分页）
    if filters.status:
        query = query.filter(UserItem.status == filters.status)

    if filters.content_type:
        query = query.filter(Item.content_type == filters.content_type)

    if filters.min_rating is not None:
        query = query.filter(UserItem.rating >= filters.min_rating)

    if filters.max_rating is not None:
        query = query.filter(UserItem.rating <= filters.max_rating)

    if filters.year_from:
        query = query.filter(Item.year >= str(filters.year_from))

    if filters.year_to:
        query = query.filter(Item.year <= str(filters.year_to))

    if filters.search:
        search_pattern = f"%{filters.search}%"
        query = query.filter(
            or_(
                Item.title.ilike(search_pattern),
                Item.original_title.ilike(search_pattern),
            )
        )

    # 应用排序（同传统分页，但需要确定排序方向）
    order_column = None
    order_func = desc if filters.sort_order == "desc" else asc

    if filters.sort_by == "status":
        # 自定义状态排序：watching(1) > want_to_watch(2) > watched(3)
        status_order = case(
            (UserItem.status == "watching", 1),
            (UserItem.status == "want_to_watch", 2),
            (UserItem.status == "watched", 3),
            else_=4
        )
        query = query.order_by(order_func(status_order))
        # 二级排序：按更新时间
        query = query.order_by(desc(UserItem.updated_at))
    elif filters.sort_by == "title":
        order_column = Item.title
        query = query.order_by(order_func(order_column))
    elif filters.sort_by == "year":
        order_column = Item.year
        query = query.order_by(order_func(order_column))
    else:
        # 按 UserItem 的其他字段排序
        order_column = getattr(UserItem, filters.sort_by, UserItem.updated_at)
        query = query.order_by(order_func(order_column))

    # 游标分页逻辑
    if filters.cursor:
        try:
            # 解析游标：格式为 "sort_value:id"
            cursor_parts = filters.cursor.split(":")
            if len(cursor_parts) == 2:
                cursor_sort_value, cursor_id = cursor_parts
                cursor_id = int(cursor_id)

                # 根据排序方向构建游标条件
                if filters.sort_order == "desc":
                    if filters.sort_by == "status":
                        # 对于状态排序，需要特殊处理
                        # 这里简化处理，使用ID作为二级游标
                        query = query.filter(
                            and_(
                                UserItem.id < cursor_id
                            )
                        )
                    else:
                        # 其他字段的游标条件
                        if order_column is not None:
                            query = query.filter(
                                or_(
                                    order_func(order_column) < cursor_sort_value,
                                    and_(
                                        order_column == cursor_sort_value,
                                        UserItem.id < cursor_id
                                    )
                                )
                            )
                        else:
                            query = query.filter(UserItem.id < cursor_id)
                else:
                    # 升序
                    if filters.sort_by == "status":
                        query = query.filter(
                            and_(
                                UserItem.id > cursor_id
                            )
                        )
                    else:
                        if order_column is not None:
                            query = query.filter(
                                or_(
                                    order_func(order_column) > cursor_sort_value,
                                    and_(
                                        order_column == cursor_sort_value,
                                        UserItem.id > cursor_id
                                    )
                                )
                            )
                        else:
                            query = query.filter(UserItem.id > cursor_id)
        except (ValueError, IndexError):
            # 无效游标，忽略
            pass

    # 限制数量（多取一条来判断是否还有更多数据）
    limit = filters.limit + 1
    items = query.limit(limit).all()

    # 判断是否还有更多数据
    has_more = len(items) > filters.limit
    if has_more:
        items = items[:-1]  # 移除多取的那条

    # 生成下一页游标
    next_cursor = None
    if has_more and items:
        last_item = items[-1]
        # 生成游标：使用排序字段值 + ID
        if filters.sort_by == "status":
            # 状态排序使用ID
            cursor_value = str(last_item.id)
        elif hasattr(last_item, filters.sort_by):
            sort_value = getattr(last_item, filters.sort_by)
            cursor_value = f"{sort_value}:{last_item.id}"
        elif hasattr(last_item.item, filters.sort_by):
            sort_value = getattr(last_item.item, filters.sort_by)
            cursor_value = f"{sort_value}:{last_item.id}"
        else:
            cursor_value = str(last_item.id)

        next_cursor = cursor_value

    logger.info(
        f"Retrieved {len(items)} UserItems with cursor for user {user_id} "
        f"(has_more: {has_more}, next_cursor: {next_cursor})"
    )
    return items, next_cursor, has_more


def get_user_item_stats(db: Session, user_id: int) -> dict:
    """
    获取用户记录统计信息
    
    Args:
        db: 数据库会话
        user_id: 用户ID
        
    Returns:
        dict: 统计信息
    """
    stats = {
        "total": 0,
        "by_status": {},
        "by_type": {},
        "average_rating": None,
    }

    # 总数
    stats["total"] = db.query(UserItem).filter(UserItem.user_id == user_id).count()

    # 按状态统计
    status_counts = (
        db.query(UserItem.status, func.count(UserItem.id))
        .filter(UserItem.user_id == user_id)
        .group_by(UserItem.status)
        .all()
    )
    stats["by_status"] = {status: count for status, count in status_counts}

    # 按类型统计
    type_counts = (
        db.query(Item.content_type, func.count(UserItem.id))
        .join(UserItem)
        .filter(UserItem.user_id == user_id)
        .group_by(Item.content_type)
        .all()
    )
    stats["by_type"] = {content_type: count for content_type, count in type_counts}

    # 平均评分
    avg_rating = (
        db.query(func.avg(UserItem.rating))
        .filter(
            and_(
                UserItem.user_id == user_id,
                UserItem.rating.isnot(None),
            )
        )
        .scalar()
    )
    stats["average_rating"] = float(avg_rating) if avg_rating else None

    return stats
