"""
缓存管理 API

提供缓存统计、配置和管理接口
"""
from typing import Optional, Dict, Any
from fastapi import APIRouter, Depends, HTTPException, Query
from pydantic import BaseModel, Field

from app.models.user import User
from app.api.dependencies.auth import get_current_admin
from app.core.cache import multi_level_cache_manager
from app.core.cache_stats import cache_stats_collector
from app.core.cache_config import cache_config_manager, CacheDataType
from app.core.memory_cache import memory_cache_manager
from app.core.logging import logger


router = APIRouter()


# ====================================
# 响应模型
# ====================================

class CacheStatsResponse(BaseModel):
    """缓存统计响应"""
    # L1 (内存) 统计
    l1_stats: Dict[str, Any]
    
    # L2 (Redis) 统计
    l2_stats: Dict[str, Any]
    
    # 时间窗口
    time_window_seconds: int


class CacheConfigResponse(BaseModel):
    """缓存配置响应"""
    l1_max_size: int
    l1_default_ttl: int
    l2_default_ttl: int
    warming_enabled: bool
    warming_on_startup: bool
    warming_batch_size: int
    stats_enabled: bool
    stats_max_history: int
    ttl_configs: Dict[str, Dict[str, Any]]


class CacheConfigUpdateRequest(BaseModel):
    """缓存配置更新请求"""
    l1_max_size: Optional[int] = Field(None, ge=100, le=10000)
    l1_default_ttl: Optional[int] = Field(None, ge=0, le=86400)
    l2_default_ttl: Optional[int] = Field(None, ge=0, le=604800)
    warming_enabled: Optional[bool] = None
    warming_on_startup: Optional[bool] = None
    warming_batch_size: Optional[int] = Field(None, ge=10, le=1000)
    stats_enabled: Optional[bool] = None
    stats_max_history: Optional[int] = Field(None, ge=100, le=100000)


class CacheClearRequest(BaseModel):
    """缓存清理请求"""
    pattern: Optional[str] = Field(None, description="清理模式，如 'user:*'")
    clear_l1: bool = Field(True, description="是否清理 L1 缓存")
    clear_l2: bool = Field(True, description="是否清理 L2 缓存")


class CacheClearResponse(BaseModel):
    """缓存清理响应"""
    message: str
    keys_deleted: int


# ====================================
# 缓存统计端点
# ====================================

@router.get("/stats", response_model=CacheStatsResponse)
async def get_cache_stats(
    time_window: int = Query(3600, ge=60, le=86400, description="时间窗口（秒）"),
    current_user: User = Depends(get_current_admin)
):
    """
    获取缓存统计信息
    
    返回 L1 和 L2 缓存的详细统计信息，包括：
    - 命中率
    - 平均延迟
    - 内存使用
    - 操作次数
    
    - **time_window**: 统计时间窗口（秒），默认1小时
    """
    try:
        # 获取 L1 (内存) 统计
        l1_stats = memory_cache_manager.get_stats()
        
        # 获取 L2 (Redis) 统计
        l2_stats_obj = cache_stats_collector.get_stats(
            time_window_seconds=time_window
        )
        
        l2_stats = {
            "hit_rate": l2_stats_obj.hit_rate,
            "avg_latency_ms": l2_stats_obj.avg_latency_ms,
            "total_operations": l2_stats_obj.total_operations,
            "hits": l2_stats_obj.hits,
            "misses": l2_stats_obj.misses,
            "sets": 0,  # 暂不统计
            "deletes": 0,  # 暂不统计
        }
        
        return CacheStatsResponse(
            l1_stats=l1_stats,
            l2_stats=l2_stats,
            time_window_seconds=time_window
        )
    
    except Exception as e:
        logger.error(f"获取缓存统计失败: {e}", exc_info=True)
        raise HTTPException(
            status_code=500,
            detail=f"获取缓存统计失败: {str(e)}"
        )


@router.get("/stats/top-keys")
async def get_top_keys(
    limit: int = Query(10, ge=1, le=100, description="返回的键数量"),
    current_user: User = Depends(get_current_admin)
):
    """
    获取访问频率最高的缓存键
    
    - **limit**: 返回的键数量，默认10个
    """
    try:
        top_keys = cache_stats_collector.get_top_keys(limit=limit)
        
        return {
            "top_keys": [
                {"key": key, "count": count}
                for key, count in top_keys
            ]
        }
    
    except Exception as e:
        logger.error(f"获取热门键失败: {e}", exc_info=True)
        raise HTTPException(
            status_code=500,
            detail=f"获取热门键失败: {str(e)}"
        )


# ====================================
# 缓存配置端点
# ====================================

@router.get("/config", response_model=CacheConfigResponse)
async def get_cache_config(
    current_user: User = Depends(get_current_admin)
):
    """
    获取当前缓存配置
    
    返回所有缓存配置参数，包括：
    - L1 和 L2 的默认 TTL
    - 预热配置
    - 统计配置
    - 数据类型特定的 TTL 配置
    """
    try:
        config = cache_config_manager.get_config()
        config_dict = config.to_dict()
        
        return CacheConfigResponse(**config_dict)
    
    except Exception as e:
        logger.error(f"获取缓存配置失败: {e}", exc_info=True)
        raise HTTPException(
            status_code=500,
            detail=f"获取缓存配置失败: {str(e)}"
        )


@router.put("/config")
async def update_cache_config(
    request: CacheConfigUpdateRequest,
    current_user: User = Depends(get_current_admin)
):
    """
    更新缓存配置
    
    可以更新以下配置：
    - L1 最大大小
    - L1 和 L2 默认 TTL
    - 预热配置
    - 统计配置
    
    注意：配置更新后立即生效，但不会影响已存在的缓存
    """
    try:
        # 构建更新参数
        update_params = {}
        for field, value in request.dict(exclude_unset=True).items():
            if value is not None:
                update_params[field] = value
        
        if not update_params:
            raise HTTPException(
                status_code=400,
                detail="没有提供要更新的配置"
            )
        
        # 更新配置
        success = cache_config_manager.update_config(**update_params)
        
        if not success:
            raise HTTPException(
                status_code=400,
                detail="配置更新失败，请检查参数是否有效"
            )
        
        logger.info(
            f"管理员 {current_user.username} 更新了缓存配置: "
            f"{update_params}"
        )
        
        # 返回更新后的配置
        config = cache_config_manager.get_config()
        return {
            "message": "配置更新成功",
            "config": config.to_dict()
        }
    
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"更新缓存配置失败: {e}", exc_info=True)
        raise HTTPException(
            status_code=500,
            detail=f"更新缓存配置失败: {str(e)}"
        )


# ====================================
# 缓存管理端点
# ====================================

@router.delete("/clear", response_model=CacheClearResponse)
async def clear_cache(
    request: CacheClearRequest,
    current_user: User = Depends(get_current_admin)
):
    """
    清理缓存
    
    可以选择：
    - 清理所有缓存（不指定 pattern）
    - 清理匹配模式的缓存（指定 pattern）
    - 只清理 L1 或 L2（通过 clear_l1 和 clear_l2 控制）
    
    警告：此操作不可逆，请谨慎使用
    """
    try:
        keys_deleted = 0
        
        if request.pattern:
            # 清理匹配模式的缓存
            if request.clear_l1 and request.clear_l2:
                # 使用多级缓存管理器清理
                keys_deleted = multi_level_cache_manager.delete_pattern(
                    request.pattern
                )
                message = f"已清理匹配 '{request.pattern}' 的缓存"
            
            elif request.clear_l1:
                # 只清理 L1
                # L1 不支持模式删除，需要遍历
                logger.warning("L1 不支持模式删除，跳过")
                message = f"L1 不支持模式删除"
            
            elif request.clear_l2:
                # 只清理 L2
                keys_deleted = multi_level_cache_manager.l2.delete_pattern(
                    request.pattern
                )
                message = f"已清理 L2 中匹配 '{request.pattern}' 的缓存"
            
            else:
                raise HTTPException(
                    status_code=400,
                    detail="必须至少选择清理 L1 或 L2"
                )
        
        else:
            # 清理所有缓存
            if request.clear_l1:
                multi_level_cache_manager.clear()
                message = "已清理 L1 缓存"
            
            if request.clear_l2:
                # 清理所有 L2 缓存
                keys_deleted = multi_level_cache_manager.l2.delete_pattern("*")
                if request.clear_l1:
                    message = "已清理所有缓存（L1 + L2）"
                else:
                    message = "已清理 L2 缓存"
        
        logger.warning(
            f"管理员 {current_user.username} 清理了缓存: "
            f"pattern={request.pattern}, l1={request.clear_l1}, "
            f"l2={request.clear_l2}, deleted={keys_deleted}"
        )
        
        return CacheClearResponse(
            message=message,
            keys_deleted=keys_deleted
        )
    
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"清理缓存失败: {e}", exc_info=True)
        raise HTTPException(
            status_code=500,
            detail=f"清理缓存失败: {str(e)}"
        )


@router.get("/info")
async def get_cache_info(
    current_user: User = Depends(get_current_admin)
):
    """
    获取缓存系统信息
    
    返回缓存系统的概览信息，包括：
    - 缓存层级
    - 配置摘要
    - 当前状态
    """
    try:
        config = cache_config_manager.get_config()
        l1_stats = memory_cache_manager.get_stats()
        
        return {
            "cache_layers": {
                "l1": {
                    "type": "Memory LRU",
                    "max_size": config.l1_max_size,
                    "current_size": l1_stats["size"],
                    "default_ttl": config.l1_default_ttl,
                },
                "l2": {
                    "type": "Redis",
                    "default_ttl": config.l2_default_ttl,
                }
            },
            "features": {
                "multi_level": True,
                "auto_promotion": True,
                "pattern_invalidation": True,
                "cache_warming": config.warming_enabled,
                "statistics": config.stats_enabled,
            },
            "data_types": len(config.ttl_configs),
        }
    
    except Exception as e:
        logger.error(f"获取缓存信息失败: {e}", exc_info=True)
        raise HTTPException(
            status_code=500,
            detail=f"获取缓存信息失败: {str(e)}"
        )
