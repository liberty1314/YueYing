"""
AI 标签生成 API 路由
"""
from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session
from typing import List, Optional
from pydantic import BaseModel, Field
from loguru import logger

from app.core.database import get_db
from app.api.dependencies.auth import get_current_user
from app.models.user import User
from app.ai.tag_generator import TagGenerator
from app.core.exceptions import NotFoundError


router = APIRouter(prefix="/ai", tags=["AI Tags"])


# ====================================
# Pydantic Schemas
# ====================================


class GenerateTagsRequest(BaseModel):
    """生成标签请求"""
    user_item_id: int = Field(..., description="用户记录ID")
    include_notes: bool = Field(True, description="是否包含用户笔记")
    model: Optional[str] = Field(None, description="使用的模型")


class BatchGenerateTagsRequest(BaseModel):
    """批量生成标签请求"""
    user_item_ids: List[int] = Field(..., description="用户记录ID列表")
    model: Optional[str] = Field(None, description="使用的模型")


class RegenerateTagsRequest(BaseModel):
    """重新生成标签请求"""
    user_item_id: int = Field(..., description="用户记录ID")
    feedback: Optional[str] = Field(None, description="用户反馈")
    model: Optional[str] = Field(None, description="使用的模型")


class TagInfo(BaseModel):
    """标签信息"""
    id: int
    name: str


class GenerateTagsResponse(BaseModel):
    """生成标签响应"""
    user_item_id: int
    tags: List[TagInfo]
    total: int


class BatchGenerateTagsResponse(BaseModel):
    """批量生成标签响应"""
    results: List[GenerateTagsResponse]
    total_processed: int
    total_success: int
    total_failed: int


# ====================================
# API Routes
# ====================================


@router.post(
    "/generate-tags",
    response_model=GenerateTagsResponse,
    summary="生成AI标签",
    description="为单个用户记录生成 AI 标签，并自动关联到记录。",
)
async def generate_tags(
    request: GenerateTagsRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """生成 AI 标签"""
    try:
        logger.info(
            f"User {current_user.id} generating tags for user_item {request.user_item_id}"
        )

        result = await TagGenerator.generate_and_save_tags(
            db=db,
            user_id=current_user.id,
            user_item_id=request.user_item_id,
            include_notes=request.include_notes,
            model=request.model,
        )

        return GenerateTagsResponse(**result)

    except ValueError as e:
        logger.error(f"Invalid request: {e}")
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=str(e),
        )
    except Exception as e:
        logger.error(f"Error generating tags: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"生成标签失败: {str(e)}",
        )


@router.post(
    "/batch-generate-tags",
    response_model=BatchGenerateTagsResponse,
    summary="批量生成AI标签",
    description="为多个用户记录批量生成 AI 标签。",
)
async def batch_generate_tags(
    request: BatchGenerateTagsRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """批量生成 AI 标签"""
    try:
        logger.info(
            f"User {current_user.id} batch generating tags for {len(request.user_item_ids)} items"
        )

        results = await TagGenerator.batch_generate_tags(
            db=db,
            user_id=current_user.id,
            user_item_ids=request.user_item_ids,
            model=request.model,
        )

        # 统计成功和失败数量
        success_count = sum(1 for r in results if "error" not in r)
        failed_count = len(results) - success_count

        response_results = []
        for result in results:
            if "error" not in result:
                response_results.append(GenerateTagsResponse(**result))

        return BatchGenerateTagsResponse(
            results=response_results,
            total_processed=len(results),
            total_success=success_count,
            total_failed=failed_count,
        )

    except Exception as e:
        logger.error(f"Error batch generating tags: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"批量生成标签失败: {str(e)}",
        )


@router.post(
    "/regenerate-tags",
    response_model=GenerateTagsResponse,
    summary="重新生成AI标签",
    description="重新生成 AI 标签，会删除现有的 AI 生成标签。",
)
async def regenerate_tags(
    request: RegenerateTagsRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """重新生成 AI 标签"""
    try:
        logger.info(
            f"User {current_user.id} regenerating tags for user_item {request.user_item_id}"
        )

        result = await TagGenerator.regenerate_tags(
            db=db,
            user_id=current_user.id,
            user_item_id=request.user_item_id,
            feedback=request.feedback,
            model=request.model,
        )

        return GenerateTagsResponse(**result)

    except ValueError as e:
        logger.error(f"Invalid request: {e}")
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=str(e),
        )
    except Exception as e:
        logger.error(f"Error regenerating tags: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"重新生成标签失败: {str(e)}",
        )

