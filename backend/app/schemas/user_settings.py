"""
用户设置 Pydantic Schemas
"""
from datetime import datetime
from pydantic import BaseModel, Field


class UserSettingsBase(BaseModel):
    """用户设置基类"""
    auto_generate_tags: bool = Field(False, description="创建记录时自动生成标签")


class UserSettingsCreate(UserSettingsBase):
    """创建用户设置"""
    pass


class UserSettingsUpdate(BaseModel):
    """更新用户设置"""
    auto_generate_tags: bool | None = Field(None, description="创建记录时自动生成标签")


class UserSettingsResponse(UserSettingsBase):
    """用户设置响应"""
    id: int
    user_id: int
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True

