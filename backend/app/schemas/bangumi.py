"""
Bangumi API 响应 Schemas

定义 Bangumi API 的请求和响应数据结构
"""

from typing import Optional, List, Dict, Any
from datetime import date
from pydantic import BaseModel, Field


# ==================== 基础模型 ====================

class BangumiImage(BaseModel):
    """图片信息"""
    
    large: Optional[str] = None
    common: Optional[str] = None
    medium: Optional[str] = None
    small: Optional[str] = None
    grid: Optional[str] = None


class BangumiRating(BaseModel):
    """评分信息"""
    
    total: int = 0
    count: Dict[str, int] = {}
    score: float = 0.0


class BangumiCollection(BaseModel):
    """收藏统计"""
    
    wish: int = 0  # 想看
    collect: int = 0  # 看过
    doing: int = 0  # 在看
    on_hold: int = 0  # 搁置
    dropped: int = 0  # 抛弃


# ==================== 条目（Subject）模型 ====================

class BangumiSubject(BaseModel):
    """条目基本信息"""
    
    id: int
    type: int  # 1=书籍, 2=动画, 3=音乐, 4=游戏, 6=三次元
    name: str  # 条目名称
    name_cn: str = ""  # 条目中文名称
    summary: str = ""  # 简介
    images: Optional[BangumiImage] = None  # 封面图
    eps: Optional[int] = 0  # 总集数
    eps_count: Optional[int] = 0  # 总集数（备用字段）
    air_date: Optional[str] = None  # 放送开始日期
    air_weekday: Optional[int] = None  # 放送星期
    rating: Optional[BangumiRating] = None  # 评分
    rank: Optional[int] = None  # 排名
    collection: Optional[BangumiCollection] = None  # 收藏统计
    url: Optional[str] = None  # 条目地址
    
    # V0 API 额外字段
    nsfw: Optional[bool] = False  # 是否为 NSFW 内容
    locked: Optional[bool] = False  # 是否锁定
    date: Optional[str] = None  # 发布日期
    platform: Optional[str] = None  # 平台
    volumes: Optional[int] = 0  # 卷数/话数
    series: Optional[bool] = False  # 是否为系列
    tags: Optional[List[Dict[str, Any]]] = []  # 标签


class BangumiSubjectDetail(BangumiSubject):
    """条目详细信息（继承基本信息）"""
    
    # 完整信息
    infobox: Optional[List[Dict[str, Any]]] = []  # 详细信息框
    total_episodes: Optional[int] = 0  # 总集数
    
    # 关联信息
    crt: Optional[List[Any]] = []  # 角色
    staff: Optional[List[Any]] = []  # 制作人员
    topic: Optional[List[Any]] = []  # 讨论话题
    blog: Optional[List[Any]] = []  # 日志


class BangumiSearchResult(BaseModel):
    """搜索结果"""
    
    list: Optional[List[BangumiSubject]] = []
    results: int = 0  # 搜索结果总数
    code: Optional[int] = None  # 状态码（如果有错误）


# ==================== 章节/剧集模型 ====================

class BangumiEpisode(BaseModel):
    """章节/剧集信息"""
    
    id: int
    type: int  # 0=本篇, 1=SP, 2=OP, 3=ED
    name: str  # 剧集名称
    name_cn: str = ""  # 剧集中文名称
    sort: float  # 排序号（如 1.0, 2.0）
    ep: Optional[int] = None  # 剧集编号
    airdate: Optional[str] = None  # 放送日期
    comment: Optional[int] = 0  # 评论数
    duration: Optional[str] = None  # 时长
    desc: Optional[str] = ""  # 简介
    disc: Optional[int] = 0  # 所属碟片


class BangumiEpisodeList(BaseModel):
    """章节列表响应"""
    
    total: int
    limit: int
    offset: int
    data: List[BangumiEpisode] = []


# ==================== 角色模型 ====================

class BangumiCharacter(BaseModel):
    """角色信息"""
    
    id: int
    name: str  # 角色名称
    type: int  # 1=角色, 2=机体, 3=舰船, 4=组织
    images: Optional[BangumiImage] = None  # 角色图片
    comment: Optional[int] = 0  # 评论数
    collects: Optional[int] = 0  # 收藏数
    info: Optional[Dict[str, Any]] = {}  # 详细信息
    
    # 关联信息（在条目角色列表中）
    relation: Optional[str] = None  # 关系（主角、配角等）
    actors: Optional[List[Dict[str, Any]]] = []  # 声优


# ==================== 人物模型 ====================

class BangumiPerson(BaseModel):
    """人物信息（声优、制作人员等）"""
    
    id: int
    name: str  # 人物名称
    type: int  # 1=个人, 2=公司, 3=组合
    career: Optional[List[str]] = []  # 职业
    images: Optional[BangumiImage] = None  # 人物图片
    short_summary: Optional[str] = ""  # 简短介绍
    locked: Optional[bool] = False  # 是否锁定
    
    # 关联信息（在条目人物列表中）
    relation: Optional[str] = None  # 关系（导演、原作等）


# ==================== 每日放送模型 ====================

class BangumiCalendarItem(BaseModel):
    """放送时间表项"""
    
    weekday: Dict[str, Any]  # 星期信息
    items: List[BangumiSubject] = []  # 该天放送的条目列表


# ==================== 请求模型 ====================

class SubjectSearchRequest(BaseModel):
    """条目搜索请求"""
    
    keyword: str = Field(..., min_length=1, max_length=200, description="搜索关键词")
    type: Optional[int] = Field(None, description="条目类型 (1=书籍, 2=动画, 3=音乐, 4=游戏, 6=三次元)")
    max_results: int = Field(25, ge=1, le=25, description="最大结果数")
    start: int = Field(0, ge=0, description="起始位置")


class EpisodesRequest(BaseModel):
    """章节列表请求"""
    
    subject_id: int = Field(..., description="条目 ID")
    type: int = Field(0, description="章节类型 (0=本篇, 1=SP, 2=OP, 3=ED)")
    offset: int = Field(0, ge=0, description="偏移量")
    limit: int = Field(100, ge=1, le=100, description="限制数量")


# ==================== 简化的响应模型 ====================

class SimpleSubjectInfo(BaseModel):
    """简化的条目信息（用于列表展示）"""
    
    id: int
    type: int
    type_name: str  # 类型名称
    name: str
    name_cn: str = ""
    summary: str = ""
    cover: Optional[str] = None  # 封面图 URL
    rating_score: float = 0.0
    rating_total: int = 0
    rank: Optional[int] = None
    air_date: Optional[str] = None
    eps_count: int = 0
    collection_total: int = 0  # 总收藏数
    url: Optional[str] = None

    @classmethod
    def from_subject(cls, subject: BangumiSubject) -> "SimpleSubjectInfo":
        """从 BangumiSubject 转换"""
        # 类型名称映射
        type_names = {1: "书籍", 2: "动画", 3: "音乐", 4: "游戏", 6: "三次元"}
        
        # 封面图 URL
        cover = None
        if subject.images:
            cover = subject.images.large or subject.images.common or subject.images.medium
        
        # 评分
        rating_score = 0.0
        rating_total = 0
        if subject.rating:
            rating_score = subject.rating.score
            rating_total = subject.rating.total
        
        # 总收藏数
        collection_total = 0
        if subject.collection:
            collection_total = (
                subject.collection.wish
                + subject.collection.collect
                + subject.collection.doing
                + subject.collection.on_hold
                + subject.collection.dropped
            )
        
        # 集数
        eps_count = subject.eps or subject.eps_count or 0
        
        return cls(
            id=subject.id,
            type=subject.type,
            type_name=type_names.get(subject.type, "未知"),
            name=subject.name,
            name_cn=subject.name_cn,
            summary=subject.summary[:200] if subject.summary else "",  # 限制长度
            cover=cover,
            rating_score=rating_score,
            rating_total=rating_total,
            rank=subject.rank,
            air_date=subject.air_date or subject.date,
            eps_count=eps_count,
            collection_total=collection_total,
            url=subject.url,
        )


class SimpleSearchResponse(BaseModel):
    """简化的搜索响应"""
    
    total: int
    items: List[SimpleSubjectInfo]

    @classmethod
    def from_search_result(cls, result: BangumiSearchResult) -> "SimpleSearchResponse":
        """从 BangumiSearchResult 转换"""
        items = []
        if result.list:
            items = [SimpleSubjectInfo.from_subject(subject) for subject in result.list]
        
        return cls(
            total=result.results,
            items=items,
        )


class SimpleEpisodeInfo(BaseModel):
    """简化的章节信息"""
    
    id: int
    type: int
    name: str
    name_cn: str = ""
    sort: float
    ep: Optional[int] = None
    airdate: Optional[str] = None
    duration: Optional[str] = None
    desc: str = ""

    @classmethod
    def from_episode(cls, episode: BangumiEpisode) -> "SimpleEpisodeInfo":
        """从 BangumiEpisode 转换"""
        return cls(
            id=episode.id,
            type=episode.type,
            name=episode.name,
            name_cn=episode.name_cn,
            sort=episode.sort,
            ep=episode.ep,
            airdate=episode.airdate,
            duration=episode.duration,
            desc=episode.desc or "",
        )

