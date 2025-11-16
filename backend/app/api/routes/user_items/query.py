"""
用户记录查询路由
"""

from typing import List
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
    UserItemResponse,
    UserItemListResponse,
    CursorPaginationResponse,
    UserItemFilters,
    WatchStatus,
    ContentType,
)


router = APIRouter()


@router.get(
    "/",
    response_model=UserItemListResponse,
    summary="获取用户记录列表",
    description="获取当前用户的所有记录，支持筛选、排序、分页、字段选择和条件请求",
)
async def get_user_items(
    request: Request,
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
    fields: str = Query(
        None,
        description="要返回的字段，用逗号分隔。如：id,title,status,rating。默认为所有字段"
    ),
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
    - **fields**: 字段选择
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
    
    # 构建缓存键的筛选参数
    filter_dict = {
        "status": watch_status.value if watch_status else None,
        "content_type": content_type.value if content_type else None,
        "min_rating": min_rating,
        "max_rating": max_rating,
        "year_from": year_from,
        "year_to": year_to,
        "search": search,
        "sort_by": sort_by,
        "sort_order": sort_order,
        "page": page,
        "page_size": page_size,
    }
    
    # 尝试从缓存获取
    cached_result = await user_items_cache_service.get_cached_items(
        user_id=current_user.id,
        filters=filter_dict
    )
    
    # 解析字段选择
    selected_fields = FieldSelector.parse_fields(fields)

    if cached_result:
        # 缓存命中，直接返回
        items_data, total = cached_result
        # 应用字段选择
        filtered_items_data = FieldSelector.filter_response_list(items_data, selected_fields)
        items_response = [UserItemResponse(**item) for item in filtered_items_data]
    else:
        # 缓存未命中，从数据库查询
        items, total = UserItemService.get_user_items(
            db=db,
            user_id=current_user.id,
            filters=filters,
        )

        # 手动构建响应列表
        items_response = []
        items_data = []
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
            # 应用字段选择
            filtered_data = FieldSelector.filter_response_data(response_data, selected_fields)
            items_response.append(UserItemResponse(**filtered_data))
            items_data.append(response_data)

        # 缓存查询结果（缓存未过滤的数据）
        await user_items_cache_service.cache_items(
            user_id=current_user.id,
            items=items_data,
            total=total,
            filters=filter_dict
        )
    
    total_pages = (total + page_size - 1) // page_size

    response_data = UserItemListResponse(
        total=total,
        page=page,
        page_size=page_size,
        total_pages=total_pages,
        items=items_response,
    )

    # 使用条件响应（支持ETag缓存）
    return create_conditional_response(
        request=request,
        data=response_data.model_dump(),
        cache_control="private, max-age=60"  # 列表数据缓存1分钟
    )


@router.get(
    "/cursor",
    response_model=CursorPaginationResponse,
    summary="获取用户记录列表（游标分页）",
    description="获取当前用户的所有记录，支持筛选、排序、游标分页和字段选择",
)
async def get_user_items_with_cursor(
    watch_status: WatchStatus = Query(None, alias="status", description="按状态筛选"),
    content_type: ContentType = Query(None, description="按内容类型筛选"),
    min_rating: int = Query(None, ge=0, le=10, description="最低评分"),
    max_rating: int = Query(None, ge=0, le=10, description="最高评分"),
    year_from: int = Query(None, description="年份起始"),
    year_to: int = Query(None, description="年份结束"),
    search: str = Query(None, description="搜索关键词（标题）"),
    sort_by: str = Query(
        "updated_at",
        description="排序字段（created_at/updated_at/rating/started_at/completed_at/title/year）",
    ),
    sort_order: str = Query("desc", description="排序顺序（asc/desc）"),
    cursor: str = Query(None, description="游标（用于分页）"),
    limit: int = Query(20, ge=1, le=100, description="每页数量"),
    fields: str = Query(
        None,
        description="要返回的字段，用逗号分隔。如：id,title,status,rating。默认为所有字段"
    ),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """
    获取用户记录列表（游标分页）

    支持多种筛选和排序选项：
    - **status**: 按观看状态筛选
    - **content_type**: 按内容类型筛选
    - **min_rating/max_rating**: 按评分范围筛选
    - **year_from/year_to**: 按年份范围筛选
    - **search**: 按标题搜索
    - **sort_by**: 排序字段
    - **sort_order**: 排序顺序
    - **cursor**: 游标分页游标
    - **limit**: 每页数量
    - **fields**: 字段选择
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
            cursor=cursor,
            limit=limit,
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"无效的筛选参数: {str(e)}",
        )

    # 解析字段选择
    selected_fields = FieldSelector.parse_fields(fields)

    # 使用游标分页查询
    items, next_cursor, has_more = UserItemService.get_user_items_with_cursor(
        db=db,
        user_id=current_user.id,
        filters=filters,
    )

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
        # 应用字段选择
        filtered_data = FieldSelector.filter_response_data(response_data, selected_fields)
        items_response.append(UserItemResponse(**filtered_data))

    return CursorPaginationResponse(
        items=items_response,
        next_cursor=next_cursor,
        has_more=has_more,
        total_count=None,  # 游标分页不返回总数以提高性能
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
