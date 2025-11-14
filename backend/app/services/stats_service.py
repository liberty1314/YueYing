"""
统计数据服务
"""
from typing import List, Dict, Optional
from sqlalchemy.orm import Session
from sqlalchemy import func, extract, case
from datetime import datetime, timedelta, date
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
    ActivityHeatmapData,
    RecentActivityItem,
    YearDistribution,
)
from app.core.cache import cached, async_cached


class StatsService:
    """统计服务类"""

    @staticmethod
    @cached(prefix="stats_overview", expire=300)  # 缓存5分钟
    def get_overview_stats(db: Session, user_id: int) -> OverviewStats:
        """
        获取概览统计（优化版本，减少查询次数，带缓存）
        """
        # 总记录数和平均评分（单个查询）
        basic_stats = db.query(
            func.count(UserItem.id).label('total_items'),
            func.avg(UserItem.rating).label('avg_rating'),
            func.count(case((UserItem.rating.isnot(None), 1))).label('total_rated')
        ).filter(UserItem.user_id == user_id).first()

        # 本月新增
        now = datetime.now()
        first_day_of_month = datetime(now.year, now.month, 1)
        this_month_added = db.query(func.count(UserItem.id)).filter(
            UserItem.user_id == user_id,
            UserItem.created_at >= first_day_of_month
        ).scalar()

        # 按状态统计（单个查询）
        by_status_query = (
            db.query(UserItem.status, func.count(UserItem.id))
            .filter(UserItem.user_id == user_id)
            .group_by(UserItem.status)
            .all()
        )
        by_status = {status: count for status, count in by_status_query}

        # 按类型统计（单个查询，带JOIN）
        by_type_query = (
            db.query(Item.content_type, func.count(UserItem.id))
            .join(UserItem, Item.id == UserItem.item_id)
            .filter(UserItem.user_id == user_id)
            .group_by(Item.content_type)
            .all()
        )
        by_type = {content_type: count for content_type, count in by_type_query}

        return OverviewStats(
            total_items=basic_stats.total_items,
            by_status=by_status,
            by_type=by_type,
            average_rating=round(basic_stats.avg_rating, 2) if basic_stats.avg_rating else None,
            total_rated=basic_stats.total_rated,
            this_month_added=this_month_added,
        )

    @staticmethod
    @cached(prefix="stats_type_dist", expire=600)  # 缓存10分钟
    def get_type_distribution(db: Session, user_id: int) -> List[TypeDistribution]:
        """
        获取类型分布（带缓存）
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
    @cached(prefix="stats_status_dist", expire=600)  # 缓存10分钟
    def get_status_distribution(db: Session, user_id: int) -> List[StatusDistribution]:
        """
        获取状态分布（带缓存）
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
    @cached(prefix="stats_rating_dist", expire=600)  # 缓存10分钟
    def get_rating_distribution(db: Session, user_id: int) -> List[RatingDistribution]:
        """
        获取评分分布（0-10分，带缓存）
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
    @cached(prefix="stats_top_tags", expire=600)  # 缓存10分钟
    def get_top_tags(db: Session, user_id: int, limit: int = 10) -> List[TagStats]:
        """
        获取热门标签统计（带缓存）
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
    def get_activity_heatmap(db: Session, user_id: int, days: int = 365) -> List[ActivityHeatmapData]:
        """
        获取活动热力图数据（过去N天）
        """
        end_date = datetime.now()
        start_date = end_date - timedelta(days=days)
        
        # 查询每天的活动数量（基于 updated_at）
        results = (
            db.query(
                func.date(UserItem.updated_at).label("date"),
                func.count(UserItem.id).label("count"),
            )
            .filter(
                UserItem.user_id == user_id,
                UserItem.updated_at >= start_date
            )
            .group_by(func.date(UserItem.updated_at))
            .all()
        )
        
        # 转换为字典便于查找
        activity_dict = {str(d): count for d, count in results}
        
        # 生成完整的日期范围（包括没有活动的日期）
        heatmap_data = []
        current_date = start_date.date()
        while current_date <= end_date.date():
            date_str = current_date.strftime("%Y-%m-%d")
            count = activity_dict.get(date_str, 0)
            heatmap_data.append(ActivityHeatmapData(date=date_str, count=count))
            current_date += timedelta(days=1)
        
        return heatmap_data

    @staticmethod
    def get_recent_activities(db: Session, user_id: int, limit: int = 10) -> List[RecentActivityItem]:
        """
        获取最近浏览/更新的记录
        """
        results = (
            db.query(UserItem, Item)
            .join(Item, UserItem.item_id == Item.id)
            .filter(UserItem.user_id == user_id)
            .order_by(UserItem.updated_at.desc())
            .limit(limit)
            .all()
        )
        
        activities = []
        for user_item, item in results:
            activities.append(
                RecentActivityItem(
                    id=user_item.id,
                    item_id=item.id,
                    title=item.title,
                    content_type=item.content_type,
                    poster_url=item.poster_url,
                    status=user_item.status,
                    rating=user_item.rating,
                    updated_at=user_item.updated_at,
                )
            )
        
        return activities

    @staticmethod
    @cached(prefix="stats_year_dist", expire=600)  # 缓存10分钟
    def get_year_distribution(db: Session, user_id: int) -> List[YearDistribution]:
        """
        获取年代分布（基于内容的发行年份，带缓存）
        """
        results = (
            db.query(Item.year, func.count(UserItem.id).label("count"))
            .join(UserItem, Item.id == UserItem.item_id)
            .filter(UserItem.user_id == user_id)
            .group_by(Item.year)
            .order_by(Item.year)
            .all()
        )
        
        return [
            YearDistribution(year=year, count=count)
            for year, count in results
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
        activity_heatmap = StatsService.get_activity_heatmap(db, user_id)
        recent_activities = StatsService.get_recent_activities(db, user_id)
        year_distribution = StatsService.get_year_distribution(db, user_id)

        return ComprehensiveStats(
            overview=overview,
            type_distribution=type_distribution,
            status_distribution=status_distribution,
            rating_distribution=rating_distribution,
            time_trend=time_trend,
            top_tags=top_tags,
            activity_heatmap=activity_heatmap,
            recent_activities=recent_activities,
            year_distribution=year_distribution,
        )

