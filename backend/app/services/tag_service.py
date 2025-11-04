"""
标签管理服务
"""
from typing import List, Optional, Tuple
from sqlalchemy.orm import Session, joinedload
from sqlalchemy import func, and_
from loguru import logger

from app.models.tag import Tag, UserItemTag, TagType
from app.models.user_item import UserItem
from app.schemas.tag import TagCreate, TagUpdate
from app.core.exceptions import NotFoundError, ConflictError


class TagService:
    """标签服务类"""

    @staticmethod
    def create_tag(db: Session, user_id: int, tag_data: TagCreate) -> Tag:
        """
        创建标签
        """
        # 检查标签名称是否已存在（同一用户）
        existing = (
            db.query(Tag)
            .filter(
                Tag.user_id == user_id,
                Tag.name == tag_data.name,
            )
            .first()
        )

        if existing:
            raise ConflictError(f"标签 '{tag_data.name}' 已存在")

        tag = Tag(
            user_id=user_id,
            name=tag_data.name,
            type=tag_data.type,
            color=tag_data.color,
            description=tag_data.description,
            is_auto=False,
        )

        db.add(tag)
        db.commit()
        db.refresh(tag)
        logger.info(f"Created tag: {tag.id} for user {user_id}")
        return tag

    @staticmethod
    def get_tag(db: Session, user_id: int, tag_id: int) -> Optional[Tag]:
        """
        获取单个标签
        """
        tag = (
            db.query(Tag)
            .filter(Tag.id == tag_id, Tag.user_id == user_id)
            .first()
        )
        return tag

    @staticmethod
    def get_tags(
        db: Session,
        user_id: int,
        tag_type: Optional[TagType] = None,
        search: Optional[str] = None,
        limit: int = 100,
    ) -> List[Tag]:
        """
        获取标签列表（带使用次数）
        """
        query = db.query(
            Tag,
            func.count(UserItemTag.id).label("usage_count")
        ).outerjoin(UserItemTag, Tag.id == UserItemTag.tag_id).filter(
            Tag.user_id == user_id
        )

        if tag_type:
            query = query.filter(Tag.type == tag_type)

        if search:
            query = query.filter(Tag.name.ilike(f"%{search}%"))

        query = query.group_by(Tag.id).order_by(
            func.count(UserItemTag.id).desc(),
            Tag.created_at.desc()
        ).limit(limit)

        results = query.all()
        
        # 将使用次数附加到 Tag 对象
        tags = []
        for tag, usage_count in results:
            tag.usage_count = usage_count
            tags.append(tag)
        
        return tags

    @staticmethod
    def update_tag(
        db: Session, user_id: int, tag_id: int, tag_data: TagUpdate
    ) -> Optional[Tag]:
        """
        更新标签
        """
        tag = TagService.get_tag(db, user_id, tag_id)
        if not tag:
            return None

        # 如果更新名称，检查是否与其他标签冲突
        if tag_data.name and tag_data.name != tag.name:
            existing = (
                db.query(Tag)
                .filter(
                    Tag.user_id == user_id,
                    Tag.name == tag_data.name,
                    Tag.id != tag_id,
                )
                .first()
            )
            if existing:
                raise ConflictError(f"标签 '{tag_data.name}' 已存在")

        # 更新字段
        update_data = tag_data.model_dump(exclude_unset=True)
        for key, value in update_data.items():
            setattr(tag, key, value)

        db.commit()
        db.refresh(tag)
        logger.info(f"Updated tag: {tag_id}")
        return tag

    @staticmethod
    def delete_tag(db: Session, user_id: int, tag_id: int) -> bool:
        """
        删除标签（会级联删除关联）
        """
        tag = TagService.get_tag(db, user_id, tag_id)
        if not tag:
            return False

        db.delete(tag)
        db.commit()
        logger.info(f"Deleted tag: {tag_id}")
        return True

    @staticmethod
    def get_popular_tags(db: Session, user_id: int, limit: int = 10) -> List[Tag]:
        """
        获取热门标签（按使用次数排序）
        """
        results = (
            db.query(
                Tag,
                func.count(UserItemTag.id).label("usage_count")
            )
            .join(UserItemTag, Tag.id == UserItemTag.tag_id)
            .filter(Tag.user_id == user_id)
            .group_by(Tag.id)
            .order_by(func.count(UserItemTag.id).desc())
            .limit(limit)
            .all()
        )
        
        tags = []
        for tag, usage_count in results:
            tag.usage_count = usage_count
            tags.append(tag)
        
        return tags

    @staticmethod
    def add_tags_to_user_item(
        db: Session,
        user_id: int,
        user_item_id: int,
        tag_ids: List[int],
    ) -> List[UserItemTag]:
        """
        为用户记录添加标签
        """
        # 验证 user_item 属于该用户
        user_item = (
            db.query(UserItem)
            .filter(UserItem.id == user_item_id, UserItem.user_id == user_id)
            .first()
        )

        if not user_item:
            raise NotFoundError("记录不存在")

        # 验证所有标签都属于该用户
        tags = (
            db.query(Tag)
            .filter(Tag.id.in_(tag_ids), Tag.user_id == user_id)
            .all()
        )

        if len(tags) != len(tag_ids):
            raise NotFoundError("部分标签不存在")

        # 获取已存在的关联
        existing_tag_ids = {
            item_tag.tag_id
            for item_tag in db.query(UserItemTag).filter(
                UserItemTag.user_item_id == user_item_id
            ).all()
        }

        # 创建新的关联
        new_item_tags = []
        for tag_id in tag_ids:
            if tag_id not in existing_tag_ids:
                item_tag = UserItemTag(
                    user_item_id=user_item_id,
                    tag_id=tag_id,
                )
                db.add(item_tag)
                new_item_tags.append(item_tag)

        if new_item_tags:
            db.commit()
            for item_tag in new_item_tags:
                db.refresh(item_tag)
            logger.info(f"Added {len(new_item_tags)} tags to user_item {user_item_id}")

        return new_item_tags

    @staticmethod
    def remove_tag_from_user_item(
        db: Session,
        user_id: int,
        user_item_id: int,
        tag_id: int,
    ) -> bool:
        """
        从用户记录中移除标签
        """
        # 验证 user_item 和 tag 都属于该用户
        user_item = (
            db.query(UserItem)
            .filter(UserItem.id == user_item_id, UserItem.user_id == user_id)
            .first()
        )

        if not user_item:
            raise NotFoundError("记录不存在")

        tag = TagService.get_tag(db, user_id, tag_id)
        if not tag:
            raise NotFoundError("标签不存在")

        # 删除关联
        item_tag = (
            db.query(UserItemTag)
            .filter(
                UserItemTag.user_item_id == user_item_id,
                UserItemTag.tag_id == tag_id,
            )
            .first()
        )

        if not item_tag:
            return False

        db.delete(item_tag)
        db.commit()
        logger.info(f"Removed tag {tag_id} from user_item {user_item_id}")
        return True

    @staticmethod
    def get_user_item_tags(
        db: Session,
        user_id: int,
        user_item_id: int,
    ) -> List[UserItemTag]:
        """
        获取用户记录的所有标签
        """
        # 验证 user_item 属于该用户
        user_item = (
            db.query(UserItem)
            .filter(UserItem.id == user_item_id, UserItem.user_id == user_id)
            .first()
        )

        if not user_item:
            raise NotFoundError("记录不存在")

        item_tags = (
            db.query(UserItemTag)
            .options(joinedload(UserItemTag.tag))
            .filter(UserItemTag.user_item_id == user_item_id)
            .all()
        )

        return item_tags

    @staticmethod
    def get_tag_stats(db: Session, user_id: int) -> dict:
        """
        获取标签统计信息
        """
        total = db.query(Tag).filter(Tag.user_id == user_id).count()

        # 按类型统计
        by_type = (
            db.query(Tag.type, func.count(Tag.id))
            .filter(Tag.user_id == user_id)
            .group_by(Tag.type)
            .all()
        )
        type_stats = {tag_type: count for tag_type, count in by_type}

        # 获取热门标签
        popular_tags = TagService.get_popular_tags(db, user_id, limit=10)

        return {
            "total": total,
            "by_type": type_stats,
            "popular_tags": popular_tags,
        }

    @staticmethod
    def get_or_create_tag(
        db: Session,
        user_id: int,
        tag_name: str,
        tag_type: TagType = TagType.CUSTOM,
        color: Optional[str] = None,
    ) -> Tag:
        """
        获取或创建标签（用于自动标签功能）
        """
        tag = (
            db.query(Tag)
            .filter(
                Tag.user_id == user_id,
                Tag.name == tag_name,
            )
            .first()
        )

        if tag:
            return tag

        tag = Tag(
            user_id=user_id,
            name=tag_name,
            type=tag_type,
            color=color,
            is_auto=True,
        )
        db.add(tag)
        db.commit()
        db.refresh(tag)
        logger.info(f"Auto-created tag: {tag.id} for user {user_id}")
        return tag

