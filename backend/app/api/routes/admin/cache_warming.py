"""
缓存预热管理 API

提供缓存预热的触发、状态查询和历史记录接口
"""
from typing import List, Dict, Any, Optional
from fastapi import APIRouter, Depends, HTTPException, Query, BackgroundTasks
from pydantic import BaseModel, Field

from app.models.user import User
from app.api.dependencies.auth import get_current_admin
from app.services.cache_warming import cache_warming_service
from app.core.logging import logger


router = APIRouter()


# ====================================
# 响应模型
# ====================================

class WarmingStatusResponse(BaseModel):
    """预热状态响应"""
    is_running: bool
    last_run: Optional[str] = None
    last_duration_seconds: Optional[float] = None
    last_status: Optional[str] = None
    items_warmed: Optional[int] = None


class WarmingHistoryItem(BaseModel):
    """预热历史记录"""
    timestamp: str
    duration_seconds: float
    status: str
    items_warmed: int
    strategies: List[str]


class WarmingHistoryResponse(BaseModel):
    """预热历史响应"""
    history: List[WarmingHistoryItem]


class WarmingStrategyItem(BaseModel):
    """预热策略"""
    name: str
    description: str
    enabled: bool = True


class WarmingStrategiesResponse(BaseModel):
    """预热策略列表响应"""
    strategies: List[WarmingStrategyItem]


class WarmingTriggerResponse(BaseModel):
    """预热触发响应"""
    message: str
    task_id: Optional[str] = None


# ====================================
# 预热管理端点
# ====================================

@router.post("/warm", response_model=WarmingTriggerResponse)
async def trigger_warming(
    background_tasks: BackgroundTasks,
    batch_size: Optional[int] = Query(None, ge=10, le=1000, description="批次大小"),
    current_user: User = Depends(get_current_admin)
):
    """
    手动触发缓存预热
    
    在后台执行所有预热策略，预加载热点数据到缓存中。
    
    - **batch_size**: 批次大小，不指定则使用配置的默认值
    """
    try:
        # 检查是否已经在运行
        status = cache_warming_service.get_warming_status()
        if status["is_warming"]:
            raise HTTPException(
                status_code=409,
                detail="预热正在进行中，请稍后再试"
            )
        
        # 在后台执行预热
        background_tasks.add_task(
            cache_warming_service.warm_all,
            batch_size=batch_size
        )
        
        logger.info(
            f"管理员 {current_user.username} 触发了缓存预热, "
            f"batch_size={batch_size}"
        )
        
        return WarmingTriggerResponse(
            message="缓存预热已在后台启动",
            task_id=None  # 可以在未来添加任务ID跟踪
        )
    
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"触发缓存预热失败: {e}", exc_info=True)
        raise HTTPException(
            status_code=500,
            detail=f"触发缓存预热失败: {str(e)}"
        )


@router.get("/status", response_model=WarmingStatusResponse)
async def get_warming_status(
    current_user: User = Depends(get_current_admin)
):
    """
    获取缓存预热状态
    
    返回当前预热状态和最近一次预热的信息。
    """
    try:
        status = cache_warming_service.get_warming_status()
        
        # 构建响应
        response = WarmingStatusResponse(
            is_running=status["is_warming"]
        )
        
        # 如果有最近的预热记录，添加详细信息
        if status["last_warming"]:
            last = status["last_warming"]
            response.last_run = last.get("completed_at") or last.get("started_at")
            response.last_duration_seconds = last.get("duration_seconds")
            response.last_status = last.get("status")
            response.items_warmed = last.get("items_warmed")
        
        return response
    
    except Exception as e:
        logger.error(f"获取预热状态失败: {e}", exc_info=True)
        raise HTTPException(
            status_code=500,
            detail=f"获取预热状态失败: {str(e)}"
        )


@router.get("/history", response_model=WarmingHistoryResponse)
async def get_warming_history(
    limit: int = Query(10, ge=1, le=100, description="返回的记录数量"),
    current_user: User = Depends(get_current_admin)
):
    """
    获取缓存预热历史
    
    返回最近的预热记录，包括执行时间、耗时、状态等信息。
    
    - **limit**: 返回的记录数量，默认10条
    """
    try:
        history_data = cache_warming_service.get_warming_history(limit=limit)
        
        # 转换为响应格式
        history_items = []
        for record in history_data:
            # 将单个策略的结果转换为历史记录格式
            history_items.append(
                WarmingHistoryItem(
                    timestamp=record.get("completed_at") or record.get("started_at") or "",
                    duration_seconds=record.get("duration_seconds", 0),
                    status=record.get("status", "unknown"),
                    items_warmed=record.get("items_warmed", 0),
                    strategies=[record.get("strategy_name", "unknown")]
                )
            )
        
        return WarmingHistoryResponse(history=history_items)
    
    except Exception as e:
        logger.error(f"获取预热历史失败: {e}", exc_info=True)
        raise HTTPException(
            status_code=500,
            detail=f"获取预热历史失败: {str(e)}"
        )


@router.get("/strategies", response_model=WarmingStrategiesResponse)
async def get_warming_strategies(
    current_user: User = Depends(get_current_admin)
):
    """
    获取所有预热策略
    
    返回系统中注册的所有预热策略及其描述。
    """
    try:
        strategies_data = cache_warming_service.get_strategies()
        
        # 转换为响应格式
        strategies = [
            WarmingStrategyItem(
                name=s["name"],
                description=s["description"],
                enabled=True  # 目前所有策略都是启用的
            )
            for s in strategies_data
        ]
        
        return WarmingStrategiesResponse(strategies=strategies)
    
    except Exception as e:
        logger.error(f"获取预热策略失败: {e}", exc_info=True)
        raise HTTPException(
            status_code=500,
            detail=f"获取预热策略失败: {str(e)}"
        )
