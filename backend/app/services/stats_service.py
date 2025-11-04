"""
统计数据服务
"""
from typing import List, Dict, Optional
from sqlalchemy.orm import Session
from sqlalchemy import func, extract
from datetime import datetime, timedelta
from loguru import logger

from app.models.user_item import UserItem
from app.models.item import Item
from app.models.tag import Tag, UserItemTag
from app.schemas.stats import (
    OverviewStats,
    TypeDistribution,
    StatusDistribution,
    RatingDistribution,
    TimeSeriesPoint,
    TimeTrend,
    TagStats,
    ComprehensiveStats,
)


class StatsService:
    """统计服务类"""

    @staticmethod
    def get_overview_stats(db: Session, user_id: int) -> OverviewStats:
        """
        获取概览统计
        """
        # 总记录数
        total_items = db.query(UserItem).filter(UserItem.user_id == user_id).count()

        # 按状态统计
        by_status_query = (
            db.query(UserItem.status, func.count(UserItem.id))
            .filter(UserItem.user_id == user_id)
            .group_by(UserItem.status)
            .all()
        )
        by_status = {status: count for status, count in by_status_query}

        # 按类型统计
        by_type_query = (
            db.query(Item.content_type, func.count(UserItem.id))
            .join(UserItem, Item.id == UserItem.item_id)
            .filter(UserItem.user_id == user_id)
            .group_by(Item.content_type)
            .all()
        )
        by_type = {content_type: count for content_type, count in by_type_query}

        # 平均评分
        avg_rating = (
            db.query(func.avg(UserItem.rating))
            .filter(UserItem.user_id == user_id, UserItem.rating.isnot(None))
            .scalar()
        )

        # 已评分数量
        total_rated = (
            db.query(UserItem)
            .filter(UserItem.user_id == user_id, UserItem.rating.isnot(None))
            .count()
        )

        return OverviewStats(
            total_items=total_items,
            by_status=by_status,
            by_type=by_type,
            average_rating=round(avg_rating, 2) if avg_rating else None,
            total_rated=total_rated,
        )

    @staticmethod
    def get_type_distribution(db: Session, user_id: int) -> List[TypeDistribution]:
        """
        获取类型分布
        """
        total = db.query(UserItem).filter(UserItem.user_id == user_id).count()

        if total == 0:
            return []

        results = (
            db.query(Item.content_type, func.count(UserItem.id).label("count"))
            .join(UserItem, Item.id == UserItem.item_id)
            .filter(UserItem.user_id == user_id)
            .group_by(Item.content_type)
            .order_by(func.count(UserItem.id).desc())
            .all()
        )

        distribution = []
        for content_type, count in results:
            percentage = (count / total) * 100
            distribution.append(
                TypeDistribution(
                    type=content_type,
                    count=count,
                    percentage=round(percentage, 2),
                )
            )

        return distribution

    @staticmethod
    def get_status_distribution(db: Session, user_id: int) -> List[StatusDistribution]:
        """
        获取状态分布
        """
        total = db.query(UserItem).filter(UserItem.user_id == user_id).count()

        if total == 0:
            return []

        results = (
            db.query(UserItem.status, func.count(UserItem.id).label("count"))
            .filter(UserItem.user_id == user_id)
            .group_by(UserItem.status)
            .order_by(func.count(UserItem.id).desc())
            .all()
        )

        distribution = []
        for status, count in results:
            percentage = (count / total) * 100
            distribution.append(
                StatusDistribution(
                    status=status,
                    count=count,
                    percentage=round(percentage, 2),
                )
            )

        return distribution

    @staticmethod
    def get_rating_distribution(db: Session, user_id: int) -> List[RatingDistribution]:
        """
        获取评分分布（0-10分）
        """
        results = (
            db.query(UserItem.rating, func.count(UserItem.id).label("count"))
            .filter(UserItem.user_id == user_id, UserItem.rating.isnot(None))
            .group_by(UserItem.rating)
            .order_by(UserItem.rating)
            .all()
        )

        # 确保所有评分都有数据（即使为0）
        distribution = []
        rating_dict = {rating: count for rating, count in results}

        for rating in range(0, 11):
            count = rating_dict.get(rating, 0)
            distribution.append(RatingDistribution(rating=rating, count=count))

        return distribution

    @staticmethod
    def get_time_trend(
        db: Session, user_id: int, period: str = "month", months: int = 12
    ) -> TimeTrend:
        """
        获取时间趋势（按月/季度/年）
        """
        # 计算起始日期
        end_date = datetime.now()
        start_date = end_date - timedelta(days=months * 30)

        # 查询数据（按创建时间）
        query = (
            db.query(
                func.date_trunc(period, UserItem.created_at).label("period"),
                func.count(UserItem.id).label("count"),
            )
            .filter(
                UserItem.user_id == user_id, UserItem.created_at >= start_date
            )
            .group_by(func.date_trunc(period, UserItem.created_at))
            .order_by(func.date_trunc(period, UserItem.created_at))
            .all()
        )

        # 构建时间序列数据
        data = []
        cumulative = 0

        for period_date, count in query:
            cumulative += count
            # 格式化日期
            if isinstance(period_date, datetime):
                date_str = period_date.strftime("%Y-%m")
            else:
                date_str = str(period_date)

            data.append(
                TimeSeriesPoint(
                    date=date_str, count=count, cumulative_count=cumulative
                )
            )

        return TimeTrend(period=period, data=data)

    @staticmethod
    def get_top_tags(db: Session, user_id: int, limit: int = 10) -> List[TagStats]:
        """
        获取热门标签统计
        """
        results = (
            db.query(
                Tag.name,
                func.count(UserItemTag.id).label("count"),
                Tag.color,
            )
            .join(UserItemTag, Tag.id == UserItemTag.tag_id)
            .join(UserItem, UserItemTag.user_item_id == UserItem.id)
            .filter(UserItem.user_id == user_id, Tag.user_id == user_id)
            .group_by(Tag.id, Tag.name, Tag.color)
            .order_by(func.count(UserItemTag.id).desc())
            .limit(limit)
            .all()
        )

        return [
            TagStats(tag_name=name, count=count, color=color)
            for name, count, color in results
        ]

    @staticmethod
    def get_comprehensive_stats(
        db: Session, user_id: int, time_period: str = "month", months: int = 12
    ) -> ComprehensiveStats:
        """
        获取综合统计（一次性获取所有统计数据）
        """
        logger.info(f"Generating comprehensive stats for user {user_id}")

        overview = StatsService.get_overview_stats(db, user_id)
        type_distribution = StatsService.get_type_distribution(db, user_id)
        status_distribution = StatsService.get_status_distribution(db, user_id)
        rating_distribution = StatsService.get_rating_distribution(db, user_id)
        time_trend = StatsService.get_time_trend(db, user_id, time_period, months)
        top_tags = StatsService.get_top_tags(db, user_id)

        return ComprehensiveStats(
            overview=overview,
            type_distribution=type_distribution,
            status_distribution=status_distribution,
            rating_distribution=rating_distribution,
            time_trend=time_trend,
            top_tags=top_tags,
        )

