"""
用户设置 Pydantic Schemas
"""
from datetime import datetime
from typing import Optional
from pydantic import BaseModel, Field


class UserSettingsBase(BaseModel):
    """用户设置基类"""
    auto_generate_tags: bool = Field(False, description="创建记录时自动生成标签")
    enable_strict_search_filter: bool = Field(True, description="启用严格搜索过滤（只返回标题包含关键词的结果）")
    default_library_status: str = Field('want_to_watch', description="我的记录页面默认筛选状态")


class UserSettingsCreate(UserSettingsBase):
    """创建用户设置"""
    pass


class UserSettingsUpdate(BaseModel):
    """更新用户设置"""
    auto_generate_tags: Optional[bool] = Field(None, description="创建记录时自动生成标签")
    enable_strict_search_filter: Optional[bool] = Field(None, description="启用严格搜索过滤")
    default_library_status: Optional[str] = Field(None, description="我的记录页面默认筛选状态")


class UserSettingsResponse(UserSettingsBase):
    """用户设置响应"""
    id: int
    user_id: int
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True

