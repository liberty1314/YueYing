"""
Redis 连接管理
"""
from typing import Optional
from redis import Redis
from redis.asyncio import Redis as AsyncRedis

from app.core.config import settings


class RedisClient:
    """Redis 客户端封装"""

    def __init__(self):
        self._sync_client: Optional[Redis] = None
        self._async_client: Optional[AsyncRedis] = None

    @property
    def sync_client(self) -> Redis:
        """获取同步 Redis 客户端"""
        if self._sync_client is None:
            self._sync_client = Redis.from_url(
                settings.REDIS_URL,
                decode_responses=True,
                encoding="utf-8",
            )
        return self._sync_client

    @property
    def async_client(self) -> AsyncRedis:
        """获取异步 Redis 客户端"""
        if self._async_client is None:
            self._async_client = AsyncRedis.from_url(
                settings.REDIS_URL,
                decode_responses=True,
                encoding="utf-8",
            )
        return self._async_client

    def close(self):
        """关闭所有连接"""
        if self._sync_client:
            self._sync_client.close()
        if self._async_client:
            import asyncio
            asyncio.create_task(self._async_client.close())


# 创建全局 Redis 客户端实例
redis_client = RedisClient()


def get_redis() -> Redis:
    """获取 Redis 同步客户端（用于依赖注入）"""
    return redis_client.sync_client


async def get_async_redis() -> AsyncRedis:
    """获取 Redis 异步客户端（用于依赖注入）"""
    return redis_client.async_client


