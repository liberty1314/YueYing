"""
系统设置 Schema
"""
from pydantic import BaseModel, Field


class SystemSettingsBase(BaseModel):
    """系统设置基础 Schema"""
    enable_explore: bool = Field(
        default=False,
        description="启用探索/推荐功能"
    )
    allow_user_ai_tag_settings: bool = Field(
        default=True,
        description="允许用户自行设置 AI 自动标签"
    )
    allow_anonymous_home_access: bool = Field(
        default=True,
        description="允许未登录用户访问首页"
    )


class SystemSettingsUpdate(SystemSettingsBase):
    """系统设置更新 Schema"""
    pass


class SystemSettingsResponse(SystemSettingsBase):
    """系统设置响应 Schema"""
    id: int
    
    class Config:
        from_attributes = True

