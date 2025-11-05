"""
推荐相关的 Pydantic 模型
"""
from pydantic import BaseModel, Field
from typing import List, Optional
from enum import Enum


class RecommendationStrategy(str, Enum):
    """推荐策略枚举"""
    WEIGHTED = "weighted"
    CASCADE = "cascade"
    SWITCH = "switch"
    CONTENT_BASED = "content_based"
    COLLABORATIVE = "collaborative"
    DISCOVER = "discover"


class RecommendationItem(BaseModel):
    """推荐物品"""
    item_id: int = Field(..., description="物品ID")
    title: str = Field(..., description="标题")
    original_title: Optional[str] = Field(None, description="原标题")
    poster_url: Optional[str] = Field(None, description="海报URL")
    backdrop_url: Optional[str] = Field(None, description="背景图URL")
    content_type: str = Field(..., description="内容类型")
    release_date: Optional[str] = Field(None, description="发布日期")
    year: Optional[int] = Field(None, description="年份")
    language: Optional[str] = Field(None, description="语言")
    genres: Optional[List[str]] = Field(None, description="类型标签")
    score: float = Field(..., description="推荐分数", ge=0.0, le=1.0)

    class Config:
        from_attributes = True


class RecommendationsResponse(BaseModel):
    """推荐响应"""
    recommendations: List[RecommendationItem] = Field(..., description="推荐列表")
    total: int = Field(..., description="推荐总数")
    strategy: RecommendationStrategy = Field(..., description="推荐策略")

    class Config:
        from_attributes = True

