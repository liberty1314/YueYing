"""
日志相关 Schemas
"""
from pydantic import BaseModel, Field
from typing import Optional, List
from datetime import datetime
from enum import Enum


class LogLevel(str, Enum):
    """日志级别枚举"""
    TRACE = "TRACE"
    DEBUG = "DEBUG"
    INFO = "INFO"
    SUCCESS = "SUCCESS"
    WARNING = "WARNING"
    ERROR = "ERROR"
    CRITICAL = "CRITICAL"


class LogEntry(BaseModel):
    """单条日志记录"""
    timestamp: datetime = Field(description="日志时间")
    level: str = Field(description="日志级别")
    location: str = Field(description="日志位置（模块:函数:行号）")
    message: str = Field(description="日志消息")
    raw_line: str = Field(description="原始日志行")
    is_multiline: bool = Field(default=False, description="是否为多行日志")
    
    class Config:
        json_schema_extra = {
            "example": {
                "timestamp": "2025-11-08T12:30:45.123",
                "level": "INFO",
                "location": "app.main:startup:45",
                "message": "Application started successfully",
                "raw_line": "2025-11-08 12:30:45.123 | INFO     | app.main:startup:45 | Application started successfully",
                "is_multiline": False
            }
        }


class LogFilter(BaseModel):
    """日志查询过滤器"""
    level: Optional[str] = Field(None, description="日志级别过滤")
    start_time: Optional[datetime] = Field(None, description="开始时间")
    end_time: Optional[datetime] = Field(None, description="结束时间")
    keyword: Optional[str] = Field(None, description="关键词搜索")


class LogListResponse(BaseModel):
    """日志列表响应"""
    logs: List[LogEntry] = Field(description="日志列表")
    total: int = Field(description="总日志数")
    page: int = Field(description="当前页码")
    page_size: int = Field(description="每页大小")
    has_more: bool = Field(description="是否有更多日志")


class LogStats(BaseModel):
    """日志统计信息"""
    total: int = Field(description="总日志数")
    by_level: dict = Field(description="按级别统计", default_factory=dict)
    file_size: int = Field(description="日志文件大小（字节）")
    last_update: Optional[datetime] = Field(None, description="最后更新时间")
    
    class Config:
        json_schema_extra = {
            "example": {
                "total": 1500,
                "by_level": {
                    "INFO": 800,
                    "WARNING": 450,
                    "ERROR": 200,
                    "DEBUG": 50
                },
                "file_size": 2048576,
                "last_update": "2025-11-08T12:30:45.123"
            }
        }









