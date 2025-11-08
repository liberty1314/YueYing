"""
API 密钥配置 Schemas
"""
from pydantic import BaseModel, Field
from typing import Optional, List
from datetime import datetime
from enum import Enum


class ApiKeyServiceEnum(str, Enum):
    """API 服务枚举"""
    TMDB = "tmdb"
    GOOGLE_BOOKS = "google_books"
    BANGUMI = "bangumi"


class TestStatusEnum(str, Enum):
    """测试状态枚举"""
    NOT_TESTED = "not_tested"
    SUCCESS = "success"
    FAILED = "failed"


class ApiKeyConfigResponse(BaseModel):
    """API 密钥配置响应模型"""
    service: str
    api_key: Optional[str] = Field(None, description="API 密钥完整值（仅在 reveal=true 时返回）")
    api_key_preview: Optional[str] = Field(None, description="API 密钥预览（脱敏）")
    has_key: bool = Field(description="是否已配置密钥")
    base_url: Optional[str] = Field(None, description="API 基础 URL")
    enabled: bool = Field(description="是否启用")
    last_tested_at: Optional[datetime] = Field(None, description="最后测试时间")
    test_status: str = Field(description="测试状态")
    test_message: Optional[str] = Field(None, description="测试消息")
    description: Optional[str] = Field(None, description="配置描述")
    created_at: datetime
    updated_at: datetime
    
    class Config:
        from_attributes = True


class ApiKeyConfigUpdate(BaseModel):
    """API 密钥配置更新请求"""
    api_key: Optional[str] = Field(None, description="API 密钥")
    base_url: Optional[str] = Field(None, description="API 基础 URL")
    enabled: Optional[bool] = Field(None, description="是否启用")
    description: Optional[str] = Field(None, description="配置描述")


class ApiKeyTestResponse(BaseModel):
    """API 连接测试响应"""
    success: bool = Field(description="测试是否成功")
    message: str = Field(description="测试消息")
    tested_at: datetime = Field(description="测试时间")


class ApiKeyListResponse(BaseModel):
    """API 密钥配置列表响应"""
    configs: List[ApiKeyConfigResponse]

