"""
管理员日志查询 API
"""
from fastapi import APIRouter, Depends, Query, HTTPException
from sqlalchemy.orm import Session
from typing import Optional
from datetime import datetime

from app.core.database import get_db
from app.api.dependencies.auth import get_current_admin
from app.models.user import User
from app.services.log_service import log_service
from app.schemas.log import (
    LogListResponse,
    LogEntry,
    LogFilter,
    LogStats,
)


router = APIRouter(prefix="/logs", tags=["Admin - Logs"])


@router.get("", response_model=LogListResponse)
def get_logs(
    page: int = Query(1, ge=1, description="页码"),
    page_size: int = Query(50, ge=10, le=200, description="每页大小"),
    level: Optional[str] = Query(None, description="日志级别过滤"),
    start_time: Optional[datetime] = Query(None, description="开始时间"),
    end_time: Optional[datetime] = Query(None, description="结束时间"),
    keyword: Optional[str] = Query(None, description="关键词搜索"),
    current_admin: User = Depends(get_current_admin),
    db: Session = Depends(get_db)
):
    """
    查询历史日志
    
    - **page**: 页码（从 1 开始）
    - **page_size**: 每页大小（10-200）
    - **level**: 日志级别过滤（可选）
    - **start_time**: 开始时间（可选）
    - **end_time**: 结束时间（可选）
    - **keyword**: 关键词搜索（可选）
    
    **返回**: 日志列表 + 分页信息
    """
    # 构建过滤器
    filters = LogFilter(
        level=level,
        start_time=start_time,
        end_time=end_time,
        keyword=keyword
    )
    
    # 读取日志
    logs, total = log_service.read_logs(
        page=page,
        page_size=page_size,
        filters=filters
    )
    
    # 计算是否还有更多日志
    has_more = (page * page_size) < total
    
    return LogListResponse(
        logs=logs,
        total=total,
        page=page,
        page_size=page_size,
        has_more=has_more
    )


@router.get("/levels", response_model=list[str])
def get_log_levels(
    current_admin: User = Depends(get_current_admin),
    db: Session = Depends(get_db)
):
    """
    获取所有可用的日志级别
    
    **返回**: 日志级别列表
    """
    return log_service.get_available_levels()


@router.get("/stats", response_model=LogStats)
def get_log_stats(
    current_admin: User = Depends(get_current_admin),
    db: Session = Depends(get_db)
):
    """
    获取日志统计信息
    
    **返回**: 日志统计数据（总数、按级别统计、文件大小等）
    """
    stats = log_service.get_log_stats()
    return LogStats(**stats)


@router.get("/tail", response_model=list[LogEntry])
def tail_logs(
    n: int = Query(100, ge=1, le=500, description="日志条数"),
    current_admin: User = Depends(get_current_admin),
    db: Session = Depends(get_db)
):
    """
    获取最新的 n 条日志
    
    - **n**: 日志条数（1-500）
    
    **返回**: 最新的日志列表
    """
    logs = log_service.tail_logs(n=n)
    return logs









