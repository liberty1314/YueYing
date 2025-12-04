"""
统计数据 Pydantic Schemas
"""
from typing import List, Dict, Optional
from pydantic import BaseModel, Field
from datetime import date, datetime


class OverviewStats(BaseModel):
    """概览统计"""
    total_items: int = Field(..., description="总记录数")
    by_status: Dict[str, int] = Field(..., description="按状态统计")
    by_type: Dict[str, int] = Field(..., description="按类型统计")
    average_rating: Optional[float] = Field(None, description="平均评分")
    total_rated: int = Field(..., description="已评分数量")
    this_month_added: int = Field(0, description="本月新增记录数")
    
    class Config:
        from_attributes = True


class TypeDistribution(BaseModel):
    """类型分布"""
    type: str = Field(..., description="内容类型")
    count: int = Field(..., description="数量")
    percentage: float = Field(..., description="百分比")
    
    class Config:
        from_attributes = True


class StatusDistribution(BaseModel):
    """状态分布"""
    status: str = Field(..., description="观看状态")
    count: int = Field(..., description="数量")
    percentage: float = Field(..., description="百分比")
    
    class Config:
        from_attributes = True


class RatingDistribution(BaseModel):
    """评分分布"""
    rating: int = Field(..., description="评分")
    count: int = Field(..., description="数量")
    
    class Config:
        from_attributes = True


class TimeSeriesPoint(BaseModel):
    """时间序列数据点"""
    date: str = Field(..., description="日期 (YYYY-MM)")
    count: int = Field(..., description="数量")
    cumulative_count: Optional[int] = Field(None, description="累计数量")
    
    class Config:
        from_attributes = True


class TimeTrend(BaseModel):
    """时间趋势"""
    period: str = Field(..., description="时间周期 (month/quarter/year)")
    data: List[TimeSeriesPoint] = Field(..., description="时间序列数据")
    
    class Config:
        from_attributes = True


class TagStats(BaseModel):
    """标签统计"""
    tag_name: str = Field(..., description="标签名称")
    count: int = Field(..., description="使用次数")
    color: Optional[str] = Field(None, description="标签颜色")
    
    class Config:
        from_attributes = True


class ActivityHeatmapData(BaseModel):
    """活动热力图数据点"""
    date: str = Field(..., description="日期 (YYYY-MM-DD)")
    count: int = Field(..., description="当天活动数量")
    
    class Config:
        from_attributes = True


class RecentActivityItem(BaseModel):
    """最近活动项"""
    id: int = Field(..., description="用户记录ID")
    item_id: int = Field(..., description="内容项ID")
    title: str = Field(..., description="标题")
    content_type: str = Field(..., description="内容类型")
    poster_url: Optional[str] = Field(None, description="海报URL")
    status: str = Field(..., description="观看状态")
    rating: Optional[float] = Field(None, description="评分")
    updated_at: datetime = Field(..., description="更新时间")
    
    class Config:
        from_attributes = True


class YearDistribution(BaseModel):
    """年代分布"""
    year: Optional[int] = Field(None, description="年份")
    count: int = Field(..., description="数量")
    
    class Config:
        from_attributes = True


class ComprehensiveStats(BaseModel):
    """综合统计响应"""
    overview: OverviewStats
    type_distribution: List[TypeDistribution]
    status_distribution: List[StatusDistribution]
    rating_distribution: List[RatingDistribution]
    time_trend: TimeTrend
    top_tags: List[TagStats]
    activity_heatmap: List[ActivityHeatmapData]
    recent_activities: List[RecentActivityItem]
    year_distribution: List[YearDistribution]
    
    class Config:
        from_attributes = True

