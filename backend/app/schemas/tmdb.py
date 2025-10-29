"""
TMDB API 响应 Schemas

定义 TMDB API 的请求和响应数据结构
"""

from typing import Optional, List
from datetime import date
from pydantic import BaseModel, Field


# ==================== 通用模型 ====================

class TMDBImage(BaseModel):
    """TMDB 图片模型"""
    
    file_path: str
    width: int
    height: int
    iso_639_1: Optional[str] = None
    aspect_ratio: float
    vote_average: float
    vote_count: int


class TMDBVideo(BaseModel):
    """TMDB 视频模型"""
    
    id: str
    iso_639_1: str
    iso_3166_1: str
    key: str
    name: str
    site: str
    size: int
    type: str
    official: bool
    published_at: str


class TMDBGenre(BaseModel):
    """类型/类别"""
    
    id: int
    name: str


class TMDBProductionCompany(BaseModel):
    """制作公司"""
    
    id: int
    logo_path: Optional[str] = None
    name: str
    origin_country: str


class TMDBProductionCountry(BaseModel):
    """制作国家"""
    
    iso_3166_1: str
    name: str


class TMDBSpokenLanguage(BaseModel):
    """使用语言"""
    
    iso_639_1: str
    name: str
    english_name: str


# ==================== 演职人员模型 ====================

class TMDBCastMember(BaseModel):
    """演员信息"""
    
    id: int
    name: str
    original_name: str
    character: str
    gender: int
    profile_path: Optional[str] = None
    order: int
    cast_id: int
    credit_id: str


class TMDBCrewMember(BaseModel):
    """工作人员信息"""
    
    id: int
    name: str
    original_name: str
    job: str
    department: str
    gender: int
    profile_path: Optional[str] = None
    credit_id: str


class TMDBCredits(BaseModel):
    """演职人员信息"""
    
    cast: List[TMDBCastMember] = []
    crew: List[TMDBCrewMember] = []


# ==================== 电影模型 ====================

class TMDBMovieBase(BaseModel):
    """电影基础信息（搜索结果）"""
    
    id: int
    title: str
    original_title: str
    overview: Optional[str] = None
    poster_path: Optional[str] = None
    backdrop_path: Optional[str] = None
    release_date: Optional[str] = None
    genre_ids: List[int] = []
    popularity: float
    vote_average: float
    vote_count: int
    adult: bool
    original_language: str
    video: bool = False


class TMDBMovieDetail(TMDBMovieBase):
    """电影详细信息"""
    
    # 移除基类中的 genre_ids，使用详细的 genres
    genres: List[TMDBGenre] = []
    budget: int = 0
    revenue: int = 0
    runtime: Optional[int] = None
    status: str
    tagline: Optional[str] = None
    homepage: Optional[str] = None
    imdb_id: Optional[str] = None
    production_companies: List[TMDBProductionCompany] = []
    production_countries: List[TMDBProductionCountry] = []
    spoken_languages: List[TMDBSpokenLanguage] = []
    
    # 可选的附加数据
    credits: Optional[TMDBCredits] = None
    videos: Optional[dict] = None
    images: Optional[dict] = None

    class Config:
        from_attributes = True


class TMDBMovieSearchResponse(BaseModel):
    """电影搜索响应"""
    
    page: int
    results: List[TMDBMovieBase]
    total_pages: int
    total_results: int


# ==================== 剧集模型 ====================

class TMDBTVShowBase(BaseModel):
    """剧集基础信息（搜索结果）"""
    
    id: int
    name: str
    original_name: str
    overview: Optional[str] = None
    poster_path: Optional[str] = None
    backdrop_path: Optional[str] = None
    first_air_date: Optional[str] = None
    origin_country: List[str] = []
    genre_ids: List[int] = []
    popularity: float
    vote_average: float
    vote_count: int
    original_language: str


class TMDBTVSeasonInfo(BaseModel):
    """剧集季度信息"""
    
    id: int
    name: str
    overview: Optional[str] = None
    poster_path: Optional[str] = None
    season_number: int
    episode_count: int
    air_date: Optional[str] = None


class TMDBTVEpisodeInfo(BaseModel):
    """剧集集数信息"""
    
    id: int
    name: str
    overview: Optional[str] = None
    still_path: Optional[str] = None
    episode_number: int
    season_number: int
    air_date: Optional[str] = None
    vote_average: float
    vote_count: int
    runtime: Optional[int] = None


class TMDBTVCreatedBy(BaseModel):
    """创建者信息"""
    
    id: int
    name: str
    gender: int
    profile_path: Optional[str] = None
    credit_id: str


class TMDBTVNetwork(BaseModel):
    """播放网络"""
    
    id: int
    name: str
    logo_path: Optional[str] = None
    origin_country: str


class TMDBTVShowDetail(TMDBTVShowBase):
    """剧集详细信息"""
    
    # 移除基类中的 genre_ids，使用详细的 genres
    genres: List[TMDBGenre] = []
    created_by: List[TMDBTVCreatedBy] = []
    episode_run_time: List[int] = []
    homepage: Optional[str] = None
    in_production: bool
    languages: List[str] = []
    last_air_date: Optional[str] = None
    last_episode_to_air: Optional[TMDBTVEpisodeInfo] = None
    next_episode_to_air: Optional[TMDBTVEpisodeInfo] = None
    networks: List[TMDBTVNetwork] = []
    number_of_episodes: int = 0
    number_of_seasons: int = 0
    production_companies: List[TMDBProductionCompany] = []
    production_countries: List[TMDBProductionCountry] = []
    seasons: List[TMDBTVSeasonInfo] = []
    spoken_languages: List[TMDBSpokenLanguage] = []
    status: str
    tagline: Optional[str] = None
    type: str
    
    # 可选的附加数据
    credits: Optional[TMDBCredits] = None
    videos: Optional[dict] = None
    images: Optional[dict] = None

    class Config:
        from_attributes = True


class TMDBTVShowSearchResponse(BaseModel):
    """剧集搜索响应"""
    
    page: int
    results: List[TMDBTVShowBase]
    total_pages: int
    total_results: int


# ==================== 请求模型 ====================

class TMDBSearchRequest(BaseModel):
    """搜索请求"""
    
    query: str = Field(..., min_length=1, max_length=200, description="搜索关键词")
    page: int = Field(1, ge=1, le=500, description="页码")
    language: str = Field("zh-CN", description="语言")
    year: Optional[int] = Field(None, description="年份过滤")


class TMDBDetailRequest(BaseModel):
    """详情请求"""
    
    language: str = Field("zh-CN", description="语言")
    append_to_response: Optional[str] = Field(
        None, 
        description="附加响应数据，逗号分隔 (credits,videos,images)"
    )

