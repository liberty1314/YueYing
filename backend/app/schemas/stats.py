"""
统计数据 Pydantic Schemas
"""
from typing import List, Dict, Optional
from pydantic import BaseModel, Field
from datetime import date


class OverviewStats(BaseModel):
    """概览统计"""
    total_items: int = Field(..., description="总记录数")
    by_status: Dict[str, int] = Field(..., description="按状态统计")
    by_type: Dict[str, int] = Field(..., description="按类型统计")
    average_rating: Optional[float] = Field(None, description="平均评分")
    total_rated: int = Field(..., description="已评分数量")
    
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


class ComprehensiveStats(BaseModel):
    """综合统计响应"""
    overview: OverviewStats
    type_distribution: List[TypeDistribution]
    status_distribution: List[StatusDistribution]
    rating_distribution: List[RatingDistribution]
    time_trend: TimeTrend
    top_tags: List[TagStats]
    
    class Config:
        from_attributes = True

