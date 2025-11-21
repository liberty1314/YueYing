"""
系统健康检查 API
"""
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from sqlalchemy import text
from datetime import datetime
from loguru import logger
import psutil
import redis
import os

from app.core.database import get_db
from app.core.config import settings
from app.middleware.performance_middleware import performance_metrics


router = APIRouter(prefix="/health", tags=["健康检查"])


@router.get(
    "",
    summary="基础健康检查",
    description="检查服务是否运行"
)
async def health_check():
    """基础健康检查"""
    return {
        "status": "healthy",
        "timestamp": datetime.now().isoformat(),
        "service": "yueying-backend",
        "version": "1.0.0",
    }


@router.get(
    "/detailed",
    summary="详细健康检查",
    description="检查所有依赖服务的状态"
)
async def detailed_health_check(db: Session = Depends(get_db)):
    """详细健康检查"""
    health_status = {
        "status": "healthy",
        "timestamp": datetime.now().isoformat(),
        "checks": {},
    }

    # 1. 数据库检查
    try:
        db.execute(text("SELECT 1"))
        health_status["checks"]["database"] = {
            "status": "healthy",
            "message": "Database connection successful",
        }
    except Exception as e:
        logger.error(f"Database health check failed: {e}")
        health_status["checks"]["database"] = {
            "status": "unhealthy",
            "message": str(e),
        }
        health_status["status"] = "unhealthy"

    # 2. Redis检查
    try:
        redis_client = redis.Redis(
            host=os.getenv('REDIS_HOST', 'localhost'),
            port=int(os.getenv('REDIS_PORT', '6379')),
            password=os.getenv('REDIS_PASSWORD', '') or None,
            decode_responses=True,
        )
        redis_client.ping()
        health_status["checks"]["redis"] = {
            "status": "healthy",
            "message": "Redis connection successful",
        }
    except Exception as e:
        logger.error(f"Redis health check failed: {e}")
        health_status["checks"]["redis"] = {
            "status": "unhealthy",
            "message": str(e),
        }
        health_status["status"] = "unhealthy"

    # 3. 系统资源检查
    try:
        cpu_percent = psutil.cpu_percent(interval=1)
        memory = psutil.virtual_memory()
        disk = psutil.disk_usage('/')

        health_status["checks"]["system_resources"] = {
            "status": "healthy" if memory.percent < 90 else "warning",
            "cpu_percent": cpu_percent,
            "memory_percent": memory.percent,
            "disk_percent": disk.percent,
        }
    except Exception as e:
        logger.error(f"System resources check failed: {e}")
        health_status["checks"]["system_resources"] = {
            "status": "unknown",
            "message": str(e),
        }

    return health_status


@router.get(
    "/performance",
    summary="性能指标",
    description="获取系统性能指标"
)
async def get_performance_metrics(db: Session = Depends(get_db)):
    """获取性能指标"""
    try:
        # 系统资源
        cpu_percent = psutil.cpu_percent(interval=1)
        memory = psutil.virtual_memory()
        
        # Redis信息
        redis_client = redis.Redis(
            host=os.getenv('REDIS_HOST', 'localhost'),
            port=int(os.getenv('REDIS_PORT', '6379')),
            password=os.getenv('REDIS_PASSWORD', '') or None,
            decode_responses=True,
        )
        redis_info = redis_client.info()
        
        # 数据库连接数
        result = db.execute(text("SELECT count(*) FROM pg_stat_activity"))
        db_connections = result.scalar()
        
        # 从性能中间件获取实际指标
        rpm_stats = performance_metrics.get_rpm_stats(minutes=5)
        all_endpoints = performance_metrics.get_all_endpoints_stats()
        
        # 计算平均响应时间
        avg_response_time = 0
        if all_endpoints:
            total_time = sum(stat['avg_response_time'] * stat['total_requests'] for stat in all_endpoints)
            total_requests = sum(stat['total_requests'] for stat in all_endpoints)
            avg_response_time = round(total_time / total_requests if total_requests > 0 else 0, 2)
        
        # Redis缓存命中率
        keyspace_hits = redis_info.get('keyspace_hits', 0)
        keyspace_misses = redis_info.get('keyspace_misses', 0)
        cache_hit_rate = 0
        if keyspace_hits + keyspace_misses > 0:
            cache_hit_rate = round((keyspace_hits / (keyspace_hits + keyspace_misses)) * 100, 2)

        return {
            "api_response_time_avg": avg_response_time,
            "cache_hit_rate": cache_hit_rate,
            "memory_usage_percent": round(memory.percent, 2),
            "db_connection_count": db_connections,
            "redis_memory_mb": round(redis_info.get('used_memory', 0) / 1024 / 1024, 2),
            "request_count_minute": rpm_stats['rpm_avg'],
            "total_endpoints": len(all_endpoints),
            "top_endpoints": all_endpoints[:5] if all_endpoints else [],
        }
    except Exception as e:
        logger.error(f"Failed to get performance metrics: {e}")
        return {
            "error": str(e),
            "api_response_time_avg": 0,
            "cache_hit_rate": 0,
            "memory_usage_percent": 0,
            "db_connection_count": 0,
            "redis_memory_mb": 0,
            "request_count_minute": 0,
        }


@router.get(
    "/metrics/endpoints",
    summary="端点性能统计",
    description="获取所有API端点的性能统计"
)
async def get_endpoints_metrics():
    """获取端点性能统计"""
    try:
        endpoints_stats = performance_metrics.get_all_endpoints_stats()
        return {
            "total": len(endpoints_stats),
            "endpoints": endpoints_stats,
        }
    except Exception as e:
        logger.error(f"Failed to get endpoints metrics: {e}")
        return {
            "total": 0,
            "endpoints": [],
            "error": str(e),
        }


@router.get(
    "/metrics/rpm",
    summary="请求速率统计",
    description="获取每分钟请求数统计"
)
async def get_rpm_metrics(minutes: int = 30):
    """获取RPM统计"""
    try:
        rpm_stats = performance_metrics.get_rpm_stats(minutes=minutes)
        return rpm_stats
    except Exception as e:
        logger.error(f"Failed to get RPM metrics: {e}")
        return {
            "rpm_avg": 0,
            "rpm_data": [],
            "error": str(e),
        }
