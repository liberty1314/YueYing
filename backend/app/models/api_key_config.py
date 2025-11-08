"""
API 密钥配置数据模型
"""
from sqlalchemy import Column, String, Integer, Boolean, Text, DateTime, Enum
import enum
from datetime import datetime

from app.models.base import BaseModel


class ApiKeyService(str, enum.Enum):
    """API 服务枚举"""
    
    TMDB = "tmdb"
    GOOGLE_BOOKS = "google_books"
    BANGUMI = "bangumi"


class TestStatus(str, enum.Enum):
    """测试状态枚举"""
    
    NOT_TESTED = "not_tested"
    SUCCESS = "success"
    FAILED = "failed"


class ApiKeyConfig(BaseModel):
    """API 密钥配置表"""
    
    __tablename__ = "api_key_configs"
    
    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    
    # 服务配置
    service = Column(
        Enum(ApiKeyService),
        nullable=False,
        unique=True,
        comment="API 服务类型"
    )
    
    # API 密钥（加密存储）
    api_key = Column(String(500), nullable=True, comment="API 密钥（加密存储）")
    
    # 基础 URL（某些服务需要）
    base_url = Column(String(500), nullable=True, comment="API 基础 URL")
    
    # 功能开关
    enabled = Column(Boolean, nullable=False, default=True, comment="是否启用")
    
    # 测试信息
    last_tested_at = Column(DateTime, nullable=True, comment="最后测试时间")
    test_status = Column(
        Enum(TestStatus),
        nullable=False,
        default=TestStatus.NOT_TESTED,
        comment="测试状态"
    )
    test_message = Column(Text, nullable=True, comment="测试消息")
    
    # 备注
    description = Column(Text, nullable=True, comment="配置描述")
    
    def __repr__(self):
        return f"<ApiKeyConfig(id={self.id}, service='{self.service}', enabled={self.enabled})>"

