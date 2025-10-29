"""
统一搜索 Pydantic Schemas
"""

from typing import List, Optional, Dict, Any
from pydantic import BaseModel, Field
from enum import Enum


class ContentType(str, Enum):
    """内容类型"""
    MOVIE = "movie"
    TV = "tv"
    ANIME = "anime"
    BOOK = "book"
    GAME = "game"
    ALL = "all"


class SearchSource(str, Enum):
    """搜索来源"""
    TMDB = "tmdb"
    GOOGLE_BOOKS = "google_books"
    BANGUMI = "bangumi"


class UnifiedSearchResult(BaseModel):
    """统一搜索结果项"""
    id: str = Field(..., description="唯一标识（格式：{source}_{type}_{external_id}）")
    external_id: str = Field(..., description="外部数据源的ID")
    source: SearchSource = Field(..., description="数据来源")
    content_type: str = Field(..., description="内容类型")

    # 基础信息
    title: str = Field(..., description="标题（优先使用中文）")
    original_title: Optional[str] = Field(None, description="原始标题")
    description: Optional[str] = Field(None, description="简介/描述")

    # 图片
    poster_url: Optional[str] = Field(None, description="海报/封面图片URL")
    backdrop_url: Optional[str] = Field(None, description="背景图片URL")

    # 时间
    release_date: Optional[str] = Field(None, description="发布日期")
    year: Optional[str] = Field(None, description="年份")

    # 评分
    rating: Optional[float] = Field(None, description="评分")
    vote_count: Optional[int] = Field(None, description="评分人数")
    popularity: Optional[float] = Field(None, description="热度/人气值")

    # 语言
    language: Optional[str] = Field(None, description="语言")

    # 元数据（各个来源特有的数据）
    metadata: Optional[Dict[str, Any]] = Field(None, description="额外元数据")

    class Config:
        json_schema_extra = {
            "example": {
                "id": "tmdb_movie_550",
                "external_id": "550",
                "source": "tmdb",
                "content_type": "movie",
                "title": "搏击俱乐部",
                "original_title": "Fight Club",
                "description": "一个抑郁的上班族和一个颓废的肥皂制造商组建了一个地下搏击俱乐部...",
                "poster_url": "https://image.tmdb.org/t/p/w500/pB8BM7pdSp6B6Ih7QZ4DrQ3PmJK.jpg",
                "release_date": "1999-10-15",
                "year": "1999",
                "rating": 8.4,
                "vote_count": 26000,
                "popularity": 61.416,
                "language": "en",
                "metadata": {
                    "genre_ids": [18, 53, 35],
                    "adult": False
                }
            }
        }


class UnifiedSearchResponse(BaseModel):
    """统一搜索响应"""
    query: str = Field(..., description="搜索关键词")
    content_type: str = Field(..., description="内容类型筛选")
    total: int = Field(..., description="总结果数")
    page: int = Field(..., description="当前页码")
    page_size: int = Field(..., description="每页结果数")
    total_pages: int = Field(..., description="总页数")
    results: List[UnifiedSearchResult] = Field(..., description="搜索结果列表")

    class Config:
        json_schema_extra = {
            "example": {
                "query": "搏击俱乐部",
                "content_type": "all",
                "total": 15,
                "page": 1,
                "page_size": 20,
                "total_pages": 1,
                "results": [
                    {
                        "id": "tmdb_movie_550",
                        "external_id": "550",
                        "source": "tmdb",
                        "content_type": "movie",
                        "title": "搏击俱乐部",
                        "original_title": "Fight Club",
                        "description": "一个抑郁的上班族...",
                        "poster_url": "https://image.tmdb.org/t/p/w500/poster.jpg",
                        "release_date": "1999-10-15",
                        "year": "1999",
                        "rating": 8.4,
                        "vote_count": 26000,
                        "popularity": 61.416,
                        "language": "en",
                        "metadata": {}
                    }
                ]
            }
        }


class SearchStatsResponse(BaseModel):
    """搜索统计响应"""
    total_results: int = Field(..., description="总结果数")
    results_by_source: Dict[str, int] = Field(..., description="各来源结果数")
    results_by_type: Dict[str, int] = Field(..., description="各类型结果数")

    class Config:
        json_schema_extra = {
            "example": {
                "total_results": 50,
                "results_by_source": {
                    "tmdb": 25,
                    "google_books": 15,
                    "bangumi": 10
                },
                "results_by_type": {
                    "movie": 15,
                    "tv": 10,
                    "anime": 10,
                    "book": 15,
                    "game": 0
                }
            }
        }

