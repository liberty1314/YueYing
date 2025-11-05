"""
推荐 API 路由
"""
from fastapi import APIRouter, Depends, Query, HTTPException, status
from sqlalchemy.orm import Session
from typing import List, Optional
from loguru import logger

from app.core.database import get_db
from app.api.dependencies.auth import get_current_user
from app.models.user import User
from app.models.item import Item
from app.models.user_item import UserItem
from app.ai.recommender.hybrid import HybridRecommender
from app.schemas.recommendation import (
    RecommendationItem,
    RecommendationsResponse,
    RecommendationStrategy,
)


router = APIRouter(prefix="/recommendations", tags=["Recommendations"])


# ====================================
# API Routes
# ====================================


@router.get(
    "/for-you",
    response_model=RecommendationsResponse,
    summary="个性化推荐",
    description="基于用户历史为用户生成个性化推荐。",
)
def get_recommendations_for_you(
    limit: int = Query(10, ge=1, le=50, description="返回数量"),
    strategy: str = Query("weighted", description="推荐策略: weighted/cascade/switch"),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """
    为当前用户生成个性化推荐
    """
    try:
        # 创建混合推荐器
        recommender = HybridRecommender(db)

        # 生成推荐
        recommendations = recommender.recommend(
            user_id=current_user.id,
            top_k=limit,
            exclude_seen=True,
            strategy=strategy,
        )

        # 获取推荐物品详情
        item_ids = [item_id for item_id, _ in recommendations]
        items = db.query(Item).filter(Item.id.in_(item_ids)).all()

        # 构建映射
        item_map = {item.id: item for item in items}

        # 构建响应
        result_items = []
        for item_id, score in recommendations:
            if item_id in item_map:
                item = item_map[item_id]
                result_items.append(
                    RecommendationItem(
                        item_id=item.id,
                        title=item.title,
                        poster_url=item.poster_url,
                        content_type=item.content_type,
                        score=score,
                        genres=item.genres,
                    )
                )

        return RecommendationsResponse(
            recommendations=result_items,
            total=len(result_items),
            strategy=strategy,
        )

    except Exception as e:
        logger.error(f"Error generating recommendations for user {current_user.id}: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"生成推荐失败: {str(e)}",
        )


@router.get(
    "/similar/{item_id}",
    response_model=RecommendationsResponse,
    summary="相似内容推荐",
    description="获取与指定内容相似的其他内容。",
)
def get_similar_items(
    item_id: int,
    limit: int = Query(10, ge=1, le=50, description="返回数量"),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """
    获取与指定内容相似的其他内容
    """
    try:
        # 检查物品是否存在
        item = db.query(Item).filter(Item.id == item_id).first()
        if not item:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="内容不存在",
            )

        # 创建混合推荐器
        recommender = HybridRecommender(db)

        # 获取相似物品
        similar_items = recommender.get_similar_items(item_id, top_k=limit)

        # 获取物品详情
        similar_item_ids = [similar_id for similar_id, _ in similar_items]
        items = db.query(Item).filter(Item.id.in_(similar_item_ids)).all()

        # 构建映射
        item_map = {item.id: item for item in items}

        # 构建响应
        result_items = []
        for similar_id, score in similar_items:
            if similar_id in item_map:
                item = item_map[similar_id]
                result_items.append(
                    RecommendationItem(
                        item_id=item.id,
                        title=item.title,
                        poster_url=item.poster_url,
                        content_type=item.content_type,
                        score=score,
                        genres=item.genres,
                    )
                )

        return RecommendationsResponse(
            recommendations=result_items,
            total=len(result_items),
            strategy="content_based",
        )

    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error getting similar items for item {item_id}: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"获取相似内容失败: {str(e)}",
        )


@router.get(
    "/discover",
    response_model=RecommendationsResponse,
    summary="探索发现",
    description="探索发现新内容（包含更多样性）。",
)
def get_discover_recommendations(
    limit: int = Query(20, ge=1, le=50, description="返回数量"),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """
    探索发现新内容
    """
    try:
        # 创建混合推荐器
        recommender = HybridRecommender(db)

        # 生成探索推荐
        recommendations = recommender.get_discover_recommendations(
            user_id=current_user.id,
            top_k=limit,
        )

        # 获取推荐物品详情
        item_ids = [item_id for item_id, _ in recommendations]
        items = db.query(Item).filter(Item.id.in_(item_ids)).all()

        # 构建映射
        item_map = {item.id: item for item in items}

        # 构建响应
        result_items = []
        for item_id, score in recommendations:
            if item_id in item_map:
                item = item_map[item_id]
                result_items.append(
                    RecommendationItem(
                        item_id=item.id,
                        title=item.title,
                        poster_url=item.poster_url,
                        content_type=item.content_type,
                        score=score,
                        genres=item.genres,
                    )
                )

        return RecommendationsResponse(
            recommendations=result_items,
            total=len(result_items),
            strategy="discover",
        )

    except Exception as e:
        logger.error(f"Error generating discover recommendations for user {current_user.id}: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"探索发现失败: {str(e)}",
        )

