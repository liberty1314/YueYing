"""
标签管理 API 路由
"""
from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session
from typing import Optional, List
from loguru import logger

from app.core.database import get_db
from app.api.dependencies.auth import get_current_user
from app.core.exceptions import NotFoundError, ConflictError
from app.models.user import User
from app.schemas.tag import (
    TagCreate,
    TagUpdate,
    TagResponse,
    TagListResponse,
    TagStatsResponse,
    TagType,
    UserItemTagCreate,
)
from app.services.tag_service import TagService


router = APIRouter(prefix="/tags", tags=["标签管理"])


@router.post(
    "",
    response_model=TagResponse,
    status_code=status.HTTP_201_CREATED,
    summary="创建标签",
    description="为当前用户创建一个新标签。",
)
async def create_tag(
    tag_data: TagCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """创建标签"""
    try:
        tag = TagService.create_tag(db=db, user_id=current_user.id, tag_data=tag_data)
        
        # 手动添加 usage_count
        tag.usage_count = 0
        
        return tag
    except ConflictError as e:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail=str(e),
        )
    except Exception as e:
        logger.error(f"Error creating tag: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="创建标签失败",
        )


@router.get(
    "",
    response_model=TagListResponse,
    summary="获取标签列表",
    description="获取当前用户的所有标签，支持按类型和关键词筛选。",
)
async def get_tags(
    tag_type: Optional[TagType] = Query(None, description="按标签类型筛选"),
    search: Optional[str] = Query(None, description="按标签名称搜索"),
    limit: int = Query(100, ge=1, le=500, description="返回数量限制"),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """获取标签列表"""
    try:
        tags = TagService.get_tags(
            db=db,
            user_id=current_user.id,
            tag_type=tag_type,
            search=search,
            limit=limit,
        )
        return TagListResponse(
            total=len(tags),
            tags=tags,
        )
    except Exception as e:
        logger.error(f"Error getting tags: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="获取标签列表失败",
        )


@router.get(
    "/popular",
    response_model=List[TagResponse],
    summary="获取热门标签",
    description="获取当前用户最常用的标签。",
)
async def get_popular_tags(
    limit: int = Query(10, ge=1, le=50, description="返回数量"),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """获取热门标签"""
    try:
        tags = TagService.get_popular_tags(
            db=db,
            user_id=current_user.id,
            limit=limit,
        )
        return tags
    except Exception as e:
        logger.error(f"Error getting popular tags: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="获取热门标签失败",
        )


@router.get(
    "/stats",
    response_model=TagStatsResponse,
    summary="获取标签统计",
    description="获取当前用户的标签统计信息。",
)
async def get_tag_stats(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """获取标签统计"""
    try:
        stats = TagService.get_tag_stats(db=db, user_id=current_user.id)
        return TagStatsResponse(**stats)
    except Exception as e:
        logger.error(f"Error getting tag stats: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="获取标签统计失败",
        )


@router.get(
    "/{tag_id}",
    response_model=TagResponse,
    summary="获取标签详情",
    description="获取指定标签的详细信息。",
)
async def get_tag(
    tag_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """获取标签详情"""
    tag = TagService.get_tag(db=db, user_id=current_user.id, tag_id=tag_id)
    if not tag:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="标签不存在",
        )
    
    # 手动添加 usage_count
    tag.usage_count = 0
    
    return tag


@router.put(
    "/{tag_id}",
    response_model=TagResponse,
    summary="更新标签",
    description="更新指定标签的信息。",
)
async def update_tag(
    tag_id: int,
    tag_data: TagUpdate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """更新标签"""
    try:
        tag = TagService.update_tag(
            db=db,
            user_id=current_user.id,
            tag_id=tag_id,
            tag_data=tag_data,
        )
        if not tag:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="标签不存在",
            )
        
        # 手动添加 usage_count
        tag.usage_count = 0
        
        logger.info(f"User {current_user.id} updated tag {tag_id}")
        return tag
    except ConflictError as e:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail=str(e),
        )
    except Exception as e:
        logger.error(f"Error updating tag: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="更新标签失败",
        )


@router.delete(
    "/{tag_id}",
    status_code=status.HTTP_204_NO_CONTENT,
    summary="删除标签",
    description="删除指定标签（会自动删除所有关联）。",
)
async def delete_tag(
    tag_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """删除标签"""
    success = TagService.delete_tag(db=db, user_id=current_user.id, tag_id=tag_id)
    if not success:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="标签不存在",
        )
    logger.info(f"User {current_user.id} deleted tag {tag_id}")
    return


@router.post(
    "/user-items/{user_item_id}/tags",
    status_code=status.HTTP_201_CREATED,
    summary="为记录添加标签",
    description="为指定用户记录添加一个或多个标签。",
)
async def add_tags_to_user_item(
    user_item_id: int,
    tag_data: UserItemTagCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """为记录添加标签"""
    try:
        item_tags = TagService.add_tags_to_user_item(
            db=db,
            user_id=current_user.id,
            user_item_id=user_item_id,
            tag_ids=tag_data.tag_ids,
        )
        logger.info(
            f"User {current_user.id} added {len(item_tags)} tags to user_item {user_item_id}"
        )
        return {"message": f"成功添加 {len(item_tags)} 个标签"}
    except NotFoundError as e:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=str(e),
        )
    except Exception as e:
        logger.error(f"Error adding tags to user item: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="添加标签失败",
        )


@router.delete(
    "/user-items/{user_item_id}/tags/{tag_id}",
    status_code=status.HTTP_204_NO_CONTENT,
    summary="从记录中移除标签",
    description="从指定用户记录中移除指定标签。",
)
async def remove_tag_from_user_item(
    user_item_id: int,
    tag_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """从记录中移除标签"""
    try:
        success = TagService.remove_tag_from_user_item(
            db=db,
            user_id=current_user.id,
            user_item_id=user_item_id,
            tag_id=tag_id,
        )
        if not success:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="标签关联不存在",
            )
        logger.info(
            f"User {current_user.id} removed tag {tag_id} from user_item {user_item_id}"
        )
        return
    except NotFoundError as e:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=str(e),
        )
    except Exception as e:
        logger.error(f"Error removing tag from user item: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="移除标签失败",
        )


@router.get(
    "/user-items/{user_item_id}/tags",
    response_model=List[TagResponse],
    summary="获取记录的标签",
    description="获取指定用户记录的所有标签。",
)
async def get_user_item_tags(
    user_item_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """获取记录的标签"""
    try:
        item_tags = TagService.get_user_item_tags(
            db=db,
            user_id=current_user.id,
            user_item_id=user_item_id,
        )
        tags = [item_tag.tag for item_tag in item_tags]
        
        # 手动添加 usage_count
        for tag in tags:
            tag.usage_count = 0
        
        return tags
    except NotFoundError as e:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=str(e),
        )
    except Exception as e:
        logger.error(f"Error getting user item tags: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="获取记录标签失败",
        )

