"""
用户记录服务
"""

from typing import Optional, List, Tuple
from sqlalchemy.orm import Session
from sqlalchemy import and_, or_, func, desc, asc, case
from loguru import logger

from app.models.user_item import UserItem
from app.models.item import Item
from app.schemas.user_item import (
    UserItemCreate,
    UserItemUpdate,
    UserItemFilters,
)


class UserItemService:
    """用户记录服务类"""

    @staticmethod
    def _get_or_create_item(
        db: Session,
        external_id: str,
        source: str,
        content_type: str,
        title: str,
        **kwargs
    ) -> Item:
        """
        获取或创建 Item 记录
        
        Args:
            db: 数据库会话
            external_id: 外部ID
            source: 数据源
            content_type: 内容类型
            title: 标题
            **kwargs: 其他字段
            
        Returns:
            Item: Item 对象
        """
        # 查找现有 Item
        item = (
            db.query(Item)
            .filter(
                and_(
                    Item.external_id == external_id,
                    Item.source == source,
                )
            )
            .first()
        )

        if item:
            # 更新现有 Item 的信息
            for key, value in kwargs.items():
                if hasattr(item, key) and value is not None:
                    setattr(item, key, value)
            if title:
                item.title = title
            db.commit()
            db.refresh(item)
            logger.info(f"Updated existing Item: {item.id}")
            return item

        # 创建新 Item
        item = Item(
            external_id=external_id,
            source=source,
            content_type=content_type,
            title=title,
            **kwargs
        )
        db.add(item)
        db.commit()
        db.refresh(item)
        logger.info(f"Created new Item: {item.id}")
        return item

    @staticmethod
    def create_user_item(
        db: Session,
        user_id: int,
        user_item_data: UserItemCreate
    ) -> UserItem:
        """
        创建用户记录
        
        Args:
            db: 数据库会话
            user_id: 用户ID
            user_item_data: 用户记录数据
            
        Returns:
            UserItem: 创建的用户记录
            
        Raises:
            ValueError: 如果该记录已存在
        """
        # 检查是否已存在
        existing = (
            db.query(UserItem)
            .join(Item)
            .filter(
                and_(
                    UserItem.user_id == user_id,
                    Item.external_id == user_item_data.external_id,
                    Item.source == user_item_data.source,
                )
            )
            .first()
        )

        if existing:
            raise ValueError("该内容已在你的记录中")

        # 获取或创建 Item
        item = UserItemService._get_or_create_item(
            db=db,
            external_id=user_item_data.external_id,
            source=user_item_data.source,
            content_type=user_item_data.content_type,
            title=user_item_data.title,
            original_title=user_item_data.original_title,
            description=user_item_data.description,
            poster_url=user_item_data.poster_url,
            backdrop_url=user_item_data.backdrop_url,
            release_date=user_item_data.release_date,
            year=user_item_data.year,
            language=user_item_data.language,
            extra_data=user_item_data.metadata,  # 映射 metadata 到 extra_data
        )

        # 创建用户记录
        user_item = UserItem(
            user_id=user_id,
            item_id=item.id,
            status=user_item_data.status,
            rating=user_item_data.rating,
            notes=user_item_data.notes,
            started_at=user_item_data.started_at,
            completed_at=user_item_data.completed_at,
        )

        db.add(user_item)
        db.commit()
        db.refresh(user_item)
        
        logger.info(f"Created UserItem: {user_item.id} for user {user_id}")
        return user_item

    @staticmethod
    def get_user_item(
        db: Session,
        user_id: int,
        user_item_id: int
    ) -> Optional[UserItem]:
        """
        获取单个用户记录
        
        Args:
            db: 数据库会话
            user_id: 用户ID
            user_item_id: 用户记录ID
            
        Returns:
            Optional[UserItem]: 用户记录或 None
        """
        return (
            db.query(UserItem)
            .filter(
                and_(
                    UserItem.id == user_item_id,
                    UserItem.user_id == user_id,
                )
            )
            .first()
        )

    @staticmethod
    def update_user_item(
        db: Session,
        user_id: int,
        user_item_id: int,
        user_item_data: UserItemUpdate
    ) -> Optional[UserItem]:
        """
        更新用户记录
        
        Args:
            db: 数据库会话
            user_id: 用户ID
            user_item_id: 用户记录ID
            user_item_data: 更新数据
            
        Returns:
            Optional[UserItem]: 更新后的用户记录或 None
        """
        user_item = UserItemService.get_user_item(db, user_id, user_item_id)
        if not user_item:
            return None

        # 更新用户记录字段
        update_data = user_item_data.model_dump(exclude_unset=True)
        
        # 分离 Item 字段和 UserItem 字段
        item_fields = [
            "title", "original_title", "description", "poster_url",
            "backdrop_url", "release_date", "year", "language"
        ]
        
        user_item_fields = {}
        item_update_fields = {}
        
        for key, value in update_data.items():
            if key in item_fields:
                item_update_fields[key] = value
            else:
                user_item_fields[key] = value

        # 更新 UserItem 字段
        for key, value in user_item_fields.items():
            setattr(user_item, key, value)

        # 更新关联的 Item 字段
        if item_update_fields and user_item.item:
            for key, value in item_update_fields.items():
                # 映射 metadata 到 extra_data
                if key == "metadata":
                    setattr(user_item.item, "extra_data", value)
                else:
                    setattr(user_item.item, key, value)

        db.commit()
        db.refresh(user_item)
        
        logger.info(f"Updated UserItem: {user_item_id}")
        return user_item

    @staticmethod
    def delete_user_item(
        db: Session,
        user_id: int,
        user_item_id: int
    ) -> bool:
        """
        删除用户记录
        
        Args:
            db: 数据库会话
            user_id: 用户ID
            user_item_id: 用户记录ID
            
        Returns:
            bool: 是否删除成功
        """
        user_item = UserItemService.get_user_item(db, user_id, user_item_id)
        if not user_item:
            return False

        db.delete(user_item)
        db.commit()
        
        logger.info(f"Deleted UserItem: {user_item_id}")
        return True

    @staticmethod
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
        if filters.sort_by == "title":
            order_column = Item.title
        elif filters.sort_by == "status":
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
        else:
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

    @staticmethod
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

