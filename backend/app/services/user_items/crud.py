"""
用户记录 CRUD 操作
"""

from typing import Optional
from sqlalchemy.orm import Session
from sqlalchemy import and_
from loguru import logger
import asyncio

from app.models.user_item import UserItem
from app.models.item import Item
from app.schemas.user_item import UserItemCreate, UserItemUpdate
from app.services.user_settings_service import UserSettingsService


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


async def create_user_item(
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
    item = _get_or_create_item(
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
    
    # 同步添加到向量存储（确保立即可用）
    try:
        from app.ai.rag.vector_store import get_vector_store
        vector_store = get_vector_store()
        
        # 直接 await 异步调用
        await vector_store.add_user_item(db, user_item)
        logger.info(f"Added user_item {user_item.id} to vector store")
    except Exception as e:
        logger.error(f"Failed to add user_item {user_item.id} to vector store: {e}", exc_info=True)
    
    # 检查是否需要自动生成标签
    try:
        if UserSettingsService.check_auto_generate_tags(db, user_id):
            logger.info(f"Auto-generating tags for user_item {user_item.id}")
            # 异步触发标签生成（不阻塞主流程）
            from app.ai.tag_generator import TagGenerator
            # 使用 asyncio 在后台执行
            try:
                loop = asyncio.get_event_loop()
            except RuntimeError:
                loop = asyncio.new_event_loop()
                asyncio.set_event_loop(loop)
            
            # 创建后台任务
            asyncio.create_task(
                TagGenerator.generate_and_save_tags(
                    db=db,
                    user_id=user_id,
                    user_item_id=user_item.id,
                    include_notes=True,
                )
            )
            logger.info(f"Triggered auto tag generation for user_item {user_item.id}")
    except Exception as e:
        # 不影响主流程，只记录错误
        logger.error(f"Failed to trigger auto tag generation: {e}")
    
    return user_item


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


async def update_user_item(
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
    user_item = get_user_item(db, user_id, user_item_id)
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
    
    # 同步更新向量存储（确保立即可用）
    try:
        from app.ai.rag.vector_store import get_vector_store
        vector_store = get_vector_store()
        
        # 直接 await 异步调用
        await vector_store.update_user_item(db, user_item)
        logger.info(f"Updated user_item {user_item_id} in vector store")
    except Exception as e:
        logger.error(f"Failed to update user_item {user_item_id} in vector store: {e}", exc_info=True)
    
    return user_item


async def delete_user_item(
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
    user_item = get_user_item(db, user_id, user_item_id)
    if not user_item:
        return False

    db.delete(user_item)
    db.commit()
    
    logger.info(f"Deleted UserItem: {user_item_id}")
    
    # 同步从向量存储中删除
    try:
        from app.ai.rag.vector_store import get_vector_store
        vector_store = get_vector_store()
        
        # 直接 await 异步调用
        await vector_store.delete_user_item(user_item_id)
        logger.info(f"Deleted user_item {user_item_id} from vector store")
    except Exception as e:
        logger.error(f"Failed to delete user_item {user_item_id} from vector store: {e}", exc_info=True)
    
    return True
