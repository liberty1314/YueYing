"""
用户记录 API 路由
"""

from typing import List
from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session
from loguru import logger

from app.core.database import get_db
from app.api.dependencies.auth import get_current_user
from app.models.user import User
from app.services.user_item_service import UserItemService
from app.schemas.user_item import (
    UserItemCreate,
    UserItemUpdate,
    UserItemResponse,
    UserItemListResponse,
    UserItemFilters,
    WatchStatus,
    ContentType,
)


router = APIRouter(prefix="/user-items", tags=["User Items"])


@router.post(
    "",
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
    response_model=UserItemResponse,
    summary="获取用户记录详情",
    description="根据ID获取单个用户记录的详细信息",
)
async def get_user_item(
    user_item_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """
    获取用户记录详情
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
    
    return UserItemResponse(**response_data)


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
    
    logger.info(f"User {current_user.id} deleted user_item {user_item_id}")
    return None


@router.get(
    "",
    response_model=UserItemListResponse,
    summary="获取用户记录列表",
    description="获取当前用户的所有记录，支持筛选、排序和分页",
)
async def get_user_items(
    watch_status: WatchStatus = Query(None, alias="status", description="按状态筛选"),
    content_type: ContentType = Query(None, description="按内容类型筛选"),
    min_rating: int = Query(None, ge=0, le=10, description="最低评分"),
    max_rating: int = Query(None, ge=0, le=10, description="最高评分"),
    year_from: int = Query(None, description="年份起始"),
    year_to: int = Query(None, description="年份结束"),
    search: str = Query(None, description="搜索关键词（标题）"),
    sort_by: str = Query(
        "updated_at",
        description="排序字段（created_at/updated_at/rating/started_at/completed_at/title）",
    ),
    sort_order: str = Query("desc", description="排序顺序（asc/desc）"),
    page: int = Query(1, ge=1, description="页码"),
    page_size: int = Query(20, ge=1, le=100, description="每页数量"),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """
    获取用户记录列表
    
    支持多种筛选和排序选项：
    - **status**: 按观看状态筛选
    - **content_type**: 按内容类型筛选
    - **min_rating/max_rating**: 按评分范围筛选
    - **year_from/year_to**: 按年份范围筛选
    - **search**: 按标题搜索
    - **sort_by**: 排序字段
    - **sort_order**: 排序顺序
    - **page/page_size**: 分页参数
    """
    try:
        filters = UserItemFilters(
            status=watch_status,
            content_type=content_type,
            min_rating=min_rating,
            max_rating=max_rating,
            year_from=year_from,
            year_to=year_to,
            search=search,
            sort_by=sort_by,
            sort_order=sort_order,
            page=page,
            page_size=page_size,
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"无效的筛选参数: {str(e)}",
        )
    
    items, total = UserItemService.get_user_items(
        db=db,
        user_id=current_user.id,
        filters=filters,
    )
    
    total_pages = (total + page_size - 1) // page_size
    
    # 手动构建响应列表
    items_response = []
    for user_item in items:
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
        items_response.append(UserItemResponse(**response_data))
    
    return UserItemListResponse(
        total=total,
        page=page,
        page_size=page_size,
        total_pages=total_pages,
        items=items_response,
    )


@router.get(
    "/stats/summary",
    summary="获取用户记录统计",
    description="获取用户记录的统计信息（总数、按状态/类型分组、平均评分等）",
)
async def get_user_item_stats(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """
    获取用户记录统计信息
    
    返回：
    - **total**: 总记录数
    - **by_status**: 按状态分组的数量
    - **by_type**: 按内容类型分组的数量
    - **average_rating**: 平均评分
    """
    stats = UserItemService.get_user_item_stats(
        db=db,
        user_id=current_user.id,
    )
    
    return stats

