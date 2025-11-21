"""
性能监控中间件
记录API响应时间和请求统计
"""
from fastapi import Request, Response
from starlette.middleware.base import BaseHTTPMiddleware
from starlette.types import ASGIApp
from datetime import datetime
import time
from collections import defaultdict
from typing import Dict, List
import redis
import json
from loguru import logger

from app.core.config import settings


class PerformanceMetrics:
    """性能指标收集器"""
    
    def __init__(self):
        # 使用Redis存储指标数据
        try:
            # 使用环境变量获取Redis配置
            import os
            redis_host = os.getenv('REDIS_HOST', 'localhost')
            redis_port = int(os.getenv('REDIS_PORT', '6379'))
            redis_password = os.getenv('REDIS_PASSWORD', '')
            
            self.redis_client = redis.Redis(
                host=redis_host,
                port=redis_port,
                password=redis_password if redis_password else None,
                decode_responses=True,
            )
            self.redis_client.ping()
            logger.info("Performance metrics Redis connection established")
        except Exception as e:
            logger.error(f"Failed to connect to Redis for metrics: {e}")
            self.redis_client = None
    
    def record_request(self, endpoint: str, method: str, response_time: float, status_code: int):
        """记录单次请求"""
        if not self.redis_client:
            return
        
        try:
            current_minute = datetime.now().strftime("%Y-%m-%d %H:%M")
            
            # 1. 记录响应时间到sorted set（用于计算百分位）
            key_response_times = f"metrics:response_times:{endpoint}:{method}"
            timestamp = time.time()
            self.redis_client.zadd(
                key_response_times, 
                {f"{timestamp}:{response_time}": timestamp}
            )
            # 只保留最近1小时的数据
            one_hour_ago = timestamp - 3600
            self.redis_client.zremrangebyscore(key_response_times, 0, one_hour_ago)
            
            # 2. 更新统计数据（使用hash）
            key_stats = f"metrics:stats:{endpoint}:{method}"
            pipe = self.redis_client.pipeline()
            pipe.hincrby(key_stats, "total_requests", 1)
            pipe.hincrbyfloat(key_stats, "total_response_time", response_time)
            
            # 更新最大响应时间
            current_max = self.redis_client.hget(key_stats, "max_response_time")
            if current_max is None or float(current_max) < response_time:
                pipe.hset(key_stats, "max_response_time", str(response_time))
            
            # 更新最小响应时间
            current_min = self.redis_client.hget(key_stats, "min_response_time")
            if current_min is None or float(current_min) > response_time:
                pipe.hset(key_stats, "min_response_time", str(response_time))
            
            # 设置过期时间（24小时）
            pipe.expire(key_stats, 86400)
            pipe.execute()
            
            # 3. 记录每分钟请求数
            key_rpm = f"metrics:rpm:{current_minute}"
            self.redis_client.incr(key_rpm)
            self.redis_client.expire(key_rpm, 3600)  # 1小时过期
            
            # 4. 记录状态码分布
            key_status = f"metrics:status_codes:{endpoint}:{method}"
            self.redis_client.hincrby(key_status, str(status_code), 1)
            self.redis_client.expire(key_status, 86400)
            
        except Exception as e:
            logger.error(f"Failed to record metrics: {e}")
    
    def get_endpoint_stats(self, endpoint: str, method: str) -> Dict:
        """获取端点统计信息"""
        if not self.redis_client:
            return {}
        
        try:
            key_stats = f"metrics:stats:{endpoint}:{method}"
            stats = self.redis_client.hgetall(key_stats)
            
            if not stats:
                return {
                    "total_requests": 0,
                    "avg_response_time": 0,
                    "max_response_time": 0,
                    "min_response_time": 0,
                }
            
            total_requests = int(stats.get("total_requests", 0))
            total_response_time = float(stats.get("total_response_time", 0))
            
            return {
                "total_requests": total_requests,
                "avg_response_time": round(total_response_time / total_requests if total_requests > 0 else 0, 2),
                "max_response_time": round(float(stats.get("max_response_time", 0)), 2),
                "min_response_time": round(float(stats.get("min_response_time", 0)), 2),
            }
        except Exception as e:
            logger.error(f"Failed to get endpoint stats: {e}")
            return {}
    
    def get_all_endpoints_stats(self) -> List[Dict]:
        """获取所有端点的统计信息"""
        if not self.redis_client:
            return []
        
        try:
            # 获取所有统计键
            pattern = "metrics:stats:*"
            keys = self.redis_client.keys(pattern)
            
            stats_list = []
            for key in keys:
                # 解析键名: metrics:stats:{endpoint}:{method}
                parts = key.split(":")
                if len(parts) >= 4:
                    endpoint = parts[2]
                    method = parts[3]
                    
                    stats = self.get_endpoint_stats(endpoint, method)
                    if stats.get("total_requests", 0) > 0:
                        stats["endpoint"] = endpoint
                        stats["method"] = method
                        stats_list.append(stats)
            
            # 按请求数排序
            stats_list.sort(key=lambda x: x["total_requests"], reverse=True)
            return stats_list
            
        except Exception as e:
            logger.error(f"Failed to get all endpoints stats: {e}")
            return []
    
    def get_rpm_stats(self, minutes: int = 5) -> Dict:
        """获取最近N分钟的请求速率"""
        if not self.redis_client:
            return {"rpm_avg": 0, "rpm_data": []}
        
        try:
            now = datetime.now()
            rpm_data = []
            total_requests = 0
            
            for i in range(minutes):
                minute_time = now.replace(second=0, microsecond=0)
                minute_time = minute_time.replace(minute=minute_time.minute - i)
                minute_key = minute_time.strftime("%Y-%m-%d %H:%M")
                
                key = f"metrics:rpm:{minute_key}"
                count = self.redis_client.get(key)
                count = int(count) if count else 0
                
                rpm_data.append({
                    "minute": minute_key,
                    "requests": count
                })
                total_requests += count
            
            rpm_data.reverse()  # 按时间正序
            
            return {
                "rpm_avg": round(total_requests / minutes if minutes > 0 else 0, 2),
                "rpm_data": rpm_data,
                "total_requests": total_requests
            }
            
        except Exception as e:
            logger.error(f"Failed to get RPM stats: {e}")
            return {"rpm_avg": 0, "rpm_data": []}


# 全局性能指标收集器
performance_metrics = PerformanceMetrics()


class PerformanceMiddleware(BaseHTTPMiddleware):
    """性能监控中间件"""
    
    def __init__(self, app: ASGIApp):
        super().__init__(app)
    
    async def dispatch(self, request: Request, call_next):
        # 排除健康检查和静态资源
        if request.url.path in ["/health", "/docs", "/redoc", "/openapi.json"]:
            return await call_next(request)
        
        # 记录开始时间
        start_time = time.time()
        
        # 处理请求
        response = await call_next(request)
        
        # 计算响应时间
        response_time = (time.time() - start_time) * 1000  # 转换为毫秒
        
        # 提取端点路径（去除查询参数）
        endpoint = request.url.path
        method = request.method
        
        # 记录性能指标
        performance_metrics.record_request(
            endpoint=endpoint,
            method=method,
            response_time=response_time,
            status_code=response.status_code
        )
        
        # 添加响应时间到响应头
        response.headers["X-Response-Time"] = f"{response_time:.2f}ms"
        
        return response
