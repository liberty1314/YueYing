"""
用户记录相关的 Pydantic schemas
"""

from datetime import datetime
from typing import Optional, Dict, Any
from pydantic import BaseModel, Field, validator
from enum import Enum


class WatchStatus(str, Enum):
    """观看状态枚举"""
    WANT_TO_WATCH = "want_to_watch"  # 想看
    WATCHING = "watching"  # 在看
    WATCHED = "watched"  # 看过


class ContentType(str, Enum):
    """内容类型枚举"""
    MOVIE = "movie"
    TV = "tv"
    ANIME = "anime"
    BOOK = "book"
    GAME = "game"


class UserItemBase(BaseModel):
    """用户记录基础 Schema"""
    # 外部数据
    external_id: str = Field(..., description="外部ID（来自TMDB/Google Books等）")
    source: str = Field(..., description="数据源（tmdb/google_books/bangumi）")
    content_type: ContentType = Field(..., description="内容类型")
    
    # 内容信息
    title: str = Field(..., min_length=1, max_length=500, description="标题")
    original_title: Optional[str] = Field(None, max_length=500, description="原标题")
    description: Optional[str] = Field(None, description="简介")
    poster_url: Optional[str] = Field(None, description="海报URL")
    backdrop_url: Optional[str] = Field(None, description="背景图URL")
    release_date: Optional[str] = Field(None, description="发布日期")
    year: Optional[str] = Field(None, description="年份")
    language: Optional[str] = Field(None, description="语言")
    metadata: Optional[Dict[str, Any]] = Field(None, description="其他元数据")
    
    # 用户记录
    status: WatchStatus = Field(..., description="观看状态")
    rating: Optional[int] = Field(None, ge=0, le=10, description="评分（0-10）")
    notes: Optional[str] = Field(None, description="笔记")
    started_at: Optional[str] = Field(None, description="开始日期")
    completed_at: Optional[str] = Field(None, description="完成日期")

    class Config:
        use_enum_values = True


class UserItemCreate(UserItemBase):
    """创建用户记录 Schema"""
    pass


class UserItemUpdate(BaseModel):
    """更新用户记录 Schema"""
    status: Optional[WatchStatus] = Field(None, description="观看状态")
    rating: Optional[int] = Field(None, ge=0, le=10, description="评分（0-10）")
    notes: Optional[str] = Field(None, description="笔记")
    started_at: Optional[str] = Field(None, description="开始日期")
    completed_at: Optional[str] = Field(None, description="完成日期")
    
    # 允许更新内容信息
    title: Optional[str] = Field(None, min_length=1, max_length=500, description="标题")
    original_title: Optional[str] = Field(None, max_length=500, description="原标题")
    description: Optional[str] = Field(None, description="简介")
    poster_url: Optional[str] = Field(None, description="海报URL")
    backdrop_url: Optional[str] = Field(None, description="背景图URL")
    release_date: Optional[str] = Field(None, description="发布日期")
    year: Optional[str] = Field(None, description="年份")
    language: Optional[str] = Field(None, description="语言")
    metadata: Optional[Dict[str, Any]] = Field(None, description="其他元数据")

    class Config:
        use_enum_values = True


class UserItemResponse(UserItemBase):
    """用户记录响应 Schema"""
    id: int = Field(..., description="记录ID")
    user_id: int = Field(..., description="用户ID")
    item_id: int = Field(..., description="内容项ID")
    created_at: datetime = Field(..., description="创建时间")
    updated_at: datetime = Field(..., description="更新时间")

    class Config:
        from_attributes = True
        use_enum_values = True


class UserItemListResponse(BaseModel):
    """用户记录列表响应 Schema"""
    total: int = Field(..., description="总数")
    page: int = Field(..., description="当前页")
    page_size: int = Field(..., description="每页数量")
    total_pages: int = Field(..., description="总页数")
    items: list[UserItemResponse] = Field(..., description="记录列表")

    class Config:
        from_attributes = True


class UserItemFilters(BaseModel):
    """用户记录筛选 Schema"""
    status: Optional[WatchStatus] = Field(None, description="按状态筛选")
    content_type: Optional[ContentType] = Field(None, description="按内容类型筛选")
    min_rating: Optional[int] = Field(None, ge=0, le=10, description="最低评分")
    max_rating: Optional[int] = Field(None, ge=0, le=10, description="最高评分")
    year_from: Optional[int] = Field(None, description="年份起始")
    year_to: Optional[int] = Field(None, description="年份结束")
    search: Optional[str] = Field(None, description="搜索关键词（标题）")
    
    # 排序
    sort_by: Optional[str] = Field(
        "updated_at",
        description="排序字段（created_at/updated_at/rating/started_at/completed_at）"
    )
    sort_order: Optional[str] = Field(
        "desc",
        description="排序顺序（asc/desc）"
    )
    
    # 分页
    page: int = Field(1, ge=1, description="页码")
    page_size: int = Field(20, ge=1, le=100, description="每页数量")

    class Config:
        use_enum_values = True

    @validator("sort_order")
    def validate_sort_order(cls, v):
        if v not in ["asc", "desc"]:
            raise ValueError("sort_order must be 'asc' or 'desc'")
        return v

    @validator("sort_by")
    def validate_sort_by(cls, v):
        allowed_fields = [
            "status",
            "created_at",
            "updated_at",
            "rating",
            "started_at",
            "completed_at",
            "title",
        ]
        if v not in allowed_fields:
            raise ValueError(f"sort_by must be one of {allowed_fields}")
        return v

