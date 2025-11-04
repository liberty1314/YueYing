"""
标签相关的 Pydantic Schemas
"""
from datetime import datetime
from typing import Optional, List
from pydantic import BaseModel, Field
import enum


class TagType(str, enum.Enum):
    """标签类型枚举"""
    EMOTION = "emotion"
    THEME = "theme"
    STYLE = "style"
    CUSTOM = "custom"


class TagBase(BaseModel):
    """标签基础 Schema"""
    name: str = Field(..., min_length=1, max_length=100, description="标签名称")
    type: TagType = Field(TagType.CUSTOM, description="标签类型")
    color: Optional[str] = Field(None, max_length=20, description="标签颜色")
    description: Optional[str] = Field(None, max_length=500, description="标签描述")


class TagCreate(TagBase):
    """创建标签 Schema"""
    pass


class TagUpdate(BaseModel):
    """更新标签 Schema"""
    name: Optional[str] = Field(None, min_length=1, max_length=100)
    type: Optional[TagType] = None
    color: Optional[str] = Field(None, max_length=20)
    description: Optional[str] = Field(None, max_length=500)


class TagResponse(TagBase):
    """标签响应 Schema"""
    id: int
    user_id: int
    is_auto: bool
    usage_count: Optional[int] = Field(None, description="使用次数")
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True


class TagListResponse(BaseModel):
    """标签列表响应 Schema"""
    total: int
    tags: List[TagResponse]


class TagStatsResponse(BaseModel):
    """标签统计响应 Schema"""
    total: int
    by_type: dict
    popular_tags: List[TagResponse]


class UserItemTagCreate(BaseModel):
    """添加标签到用户记录 Schema"""
    tag_ids: List[int] = Field(..., description="标签ID列表")


class UserItemTagResponse(BaseModel):
    """用户记录标签关联响应 Schema"""
    id: int
    user_item_id: int
    tag_id: int
    tag: TagResponse
    created_at: datetime

    class Config:
        from_attributes = True

