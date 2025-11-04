"""
统计数据 API 路由
"""
from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session
from typing import Optional
from loguru import logger

from app.core.database import get_db
from app.api.dependencies.auth import get_current_user
from app.models.user import User
from app.schemas.stats import (
    OverviewStats,
    TypeDistribution,
    StatusDistribution,
    RatingDistribution,
    TimeTrend,
    TagStats,
    ComprehensiveStats,
)
from app.services.stats_service import StatsService


router = APIRouter(prefix="/stats", tags=["Statistics"])


@router.get(
    "/overview",
    response_model=OverviewStats,
    summary="获取概览统计",
    description="获取用户的概览统计数据，包括总数、状态分布、类型分布、平均评分等。",
)
async def get_overview_stats(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """获取概览统计"""
    try:
        stats = StatsService.get_overview_stats(db=db, user_id=current_user.id)
        return stats
    except Exception as e:
        logger.error(f"Error getting overview stats: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="获取概览统计失败",
        )


@router.get(
    "/type-distribution",
    response_model=list[TypeDistribution],
    summary="获取类型分布",
    description="获取用户记录的内容类型分布统计。",
)
async def get_type_distribution(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """获取类型分布"""
    try:
        distribution = StatsService.get_type_distribution(
            db=db, user_id=current_user.id
        )
        return distribution
    except Exception as e:
        logger.error(f"Error getting type distribution: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="获取类型分布失败",
        )


@router.get(
    "/status-distribution",
    response_model=list[StatusDistribution],
    summary="获取状态分布",
    description="获取用户记录的观看状态分布统计。",
)
async def get_status_distribution(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """获取状态分布"""
    try:
        distribution = StatsService.get_status_distribution(
            db=db, user_id=current_user.id
        )
        return distribution
    except Exception as e:
        logger.error(f"Error getting status distribution: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="获取状态分布失败",
        )


@router.get(
    "/rating-distribution",
    response_model=list[RatingDistribution],
    summary="获取评分分布",
    description="获取用户记录的评分分布统计（0-10分）。",
)
async def get_rating_distribution(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """获取评分分布"""
    try:
        distribution = StatsService.get_rating_distribution(
            db=db, user_id=current_user.id
        )
        return distribution
    except Exception as e:
        logger.error(f"Error getting rating distribution: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="获取评分分布失败",
        )


@router.get(
    "/time-trend",
    response_model=TimeTrend,
    summary="获取时间趋势",
    description="获取用户记录的时间趋势统计，支持按月/季度/年查看。",
)
async def get_time_trend(
    period: str = Query("month", description="时间周期 (month/quarter/year)"),
    months: int = Query(12, ge=1, le=60, description="查看最近几个月的数据"),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """获取时间趋势"""
    try:
        trend = StatsService.get_time_trend(
            db=db, user_id=current_user.id, period=period, months=months
        )
        return trend
    except Exception as e:
        logger.error(f"Error getting time trend: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="获取时间趋势失败",
        )


@router.get(
    "/top-tags",
    response_model=list[TagStats],
    summary="获取热门标签",
    description="获取用户最常用的标签统计。",
)
async def get_top_tags(
    limit: int = Query(10, ge=1, le=50, description="返回标签数量"),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """获取热门标签"""
    try:
        tags = StatsService.get_top_tags(db=db, user_id=current_user.id, limit=limit)
        return tags
    except Exception as e:
        logger.error(f"Error getting top tags: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="获取热门标签失败",
        )


@router.get(
    "/comprehensive",
    response_model=ComprehensiveStats,
    summary="获取综合统计",
    description="一次性获取所有统计数据，包括概览、分布、趋势、标签等。",
)
async def get_comprehensive_stats(
    time_period: str = Query("month", description="时间周期 (month/quarter/year)"),
    months: int = Query(12, ge=1, le=60, description="查看最近几个月的数据"),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """获取综合统计"""
    try:
        stats = StatsService.get_comprehensive_stats(
            db=db, user_id=current_user.id, time_period=time_period, months=months
        )
        return stats
    except Exception as e:
        logger.error(f"Error getting comprehensive stats: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="获取综合统计失败",
        )

