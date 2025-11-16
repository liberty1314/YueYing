"""
用户记录 CRUD 路由
"""

from fastapi import APIRouter, Depends, HTTPException, status, Query, Request
from sqlalchemy.orm import Session
from loguru import logger

from app.core.database import get_db
from app.api.dependencies.auth import get_current_user
from app.models.user import User
from app.services.user_items import UserItemService
from app.services.user_items_cache import user_items_cache_service
from app.utils.field_selector import FieldSelector
from app.utils.http_cache import create_conditional_response
from app.schemas.user_item import (
    UserItemCreate,
    UserItemUpdate,
    UserItemResponse,
)


router = APIRouter()


@router.post(
    "/",
    response_model=UserItemResponse,
    status_code=status.HTTP_201_CREATED,
    summary="创建用户记录",
    description="添加内容到用户的记录列表中",
)
async def create_user_item(
    user_item_data: UserItemCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """
    创建用户记录
    
    - **external_id**: 外部ID（来自TMDB/Google Books等）
    - **source**: 数据源（tmdb/google_books/bangumi）
    - **content_type**: 内容类型（movie/tv/anime/book/game）
    - **title**: 标题
    - **status**: 观看状态（want_to_watch/watching/watched）
    - **rating**: 评分（0-10，可选）
    - **notes**: 笔记（可选）
    - **started_at**: 开始日期（可选）
    - **completed_at**: 完成日期（可选）
    """
    try:
        user_item = await UserItemService.create_user_item(
            db=db,
            user_id=current_user.id,
            user_item_data=user_item_data,
        )
        
        # 手动加载关联的 item
        db.refresh(user_item)
        
        # 清除用户记录缓存
        await user_items_cache_service.clear_user_cache(current_user.id)
        
        logger.info(
            f"User {current_user.id} created user_item {user_item.id}"
        )
        
        # 手动构建响应，将 item 字段合并到 user_item
        response_data = {
            "id": user_item.id,
            "user_id": user_item.user_id,
            "item_id": user_item.item_id,
            "status": user_item.status,
            "rating": user_item.rating,
            "notes": user_item.notes,
            "started_at": user_item.started_at,
            "completed_at": user_item.completed_at,
            "progress": user_item.progress,
            "created_at": user_item.created_at,
            "updated_at": user_item.updated_at,
            # 从 item 复制字段
            "external_id": user_item.item.external_id,
            "source": user_item.item.source,
            "content_type": user_item.item.content_type,
            "title": user_item.item.title,
            "original_title": user_item.item.original_title,
            "description": user_item.item.description,
            "poster_url": user_item.item.poster_url,
            "backdrop_url": user_item.item.backdrop_url,
            "release_date": user_item.item.release_date,
            "year": user_item.item.year,
            "language": user_item.item.language,
            "metadata": user_item.item.extra_data,  # 映射回 metadata
        }
        
        return UserItemResponse(**response_data)
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e),
        )
    except Exception as e:
        logger.error(f"Failed to create user_item: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="创建记录失败",
        )


@router.get(
    "/{user_item_id}",
    summary="获取用户记录详情",
    description="根据ID获取单个用户记录的详细信息，支持字段选择和条件请求",
)
async def get_user_item(
    request: Request,
    user_item_id: int,
    fields: str = Query(
        None,
        description="要返回的字段，用逗号分隔。如：id,title,status,rating。默认为所有字段"
    ),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """
    获取用户记录详情

    支持字段选择：
    - **fields**: 指定要返回的字段，用逗号分隔
    """
    user_item = UserItemService.get_user_item(
        db=db,
        user_id=current_user.id,
        user_item_id=user_item_id,
    )

    if not user_item:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="记录不存在",
        )

    # 手动构建响应
    response_data = {
        "id": user_item.id,
        "user_id": user_item.user_id,
        "item_id": user_item.item_id,
        "status": user_item.status,
        "rating": user_item.rating,
        "notes": user_item.notes,
        "started_at": user_item.started_at,
        "completed_at": user_item.completed_at,
        "progress": user_item.progress,
        "created_at": user_item.created_at,
        "updated_at": user_item.updated_at,
        "external_id": user_item.item.external_id,
        "source": user_item.item.source,
        "content_type": user_item.item.content_type,
        "title": user_item.item.title,
        "original_title": user_item.item.original_title,
        "description": user_item.item.description,
        "poster_url": user_item.item.poster_url,
        "backdrop_url": user_item.item.backdrop_url,
        "release_date": user_item.item.release_date,
        "year": user_item.item.year,
        "language": user_item.item.language,
        "metadata": user_item.item.extra_data,
    }

    # 解析并应用字段选择
    selected_fields = FieldSelector.parse_fields(fields)
    filtered_data = FieldSelector.filter_response_data(response_data, selected_fields)

    # 使用条件响应（支持ETag缓存）
    return create_conditional_response(
        request=request,
        data=filtered_data,
        cache_control="private, max-age=300"  # 用户数据缓存5分钟
    )


@router.put(
    "/{user_item_id}",
    response_model=UserItemResponse,
    summary="更新用户记录",
    description="更新用户记录的状态、评分、笔记等信息",
)
async def update_user_item(
    user_item_id: int,
    user_item_data: UserItemUpdate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """
    更新用户记录
    """
    user_item = await UserItemService.update_user_item(
        db=db,
        user_id=current_user.id,
        user_item_id=user_item_id,
        user_item_data=user_item_data,
    )
    
    if not user_item:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="记录不存在",
        )
    
    # 清除用户记录缓存
    await user_items_cache_service.clear_user_cache(current_user.id)
    
    logger.info(f"User {current_user.id} updated user_item {user_item_id}")
    
    # 手动构建响应
    response_data = {
        "id": user_item.id,
        "user_id": user_item.user_id,
        "item_id": user_item.item_id,
        "status": user_item.status,
        "rating": user_item.rating,
        "notes": user_item.notes,
        "started_at": user_item.started_at,
        "completed_at": user_item.completed_at,
        "progress": user_item.progress,
        "created_at": user_item.created_at,
        "updated_at": user_item.updated_at,
        "external_id": user_item.item.external_id,
        "source": user_item.item.source,
        "content_type": user_item.item.content_type,
        "title": user_item.item.title,
        "original_title": user_item.item.original_title,
        "description": user_item.item.description,
        "poster_url": user_item.item.poster_url,
        "backdrop_url": user_item.item.backdrop_url,
        "release_date": user_item.item.release_date,
        "year": user_item.item.year,
        "language": user_item.item.language,
        "metadata": user_item.item.extra_data,
    }
    
    return UserItemResponse(**response_data)


@router.delete(
    "/{user_item_id}",
    status_code=status.HTTP_204_NO_CONTENT,
    summary="删除用户记录",
    description="从用户的记录列表中删除指定内容",
)
async def delete_user_item(
    user_item_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """
    删除用户记录
    """
    success = await UserItemService.delete_user_item(
        db=db,
        user_id=current_user.id,
        user_item_id=user_item_id,
    )
    
    if not success:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="记录不存在",
        )
    
    # 清除用户记录缓存
    await user_items_cache_service.clear_user_cache(current_user.id)
    
    logger.info(f"User {current_user.id} deleted user_item {user_item_id}")
    return None
