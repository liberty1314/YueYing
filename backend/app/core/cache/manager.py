"""
缓存管理器

提供同步和异步的 Redis 缓存管理功能
"""
import json
import time
from typing import Any, Optional, Union

from redis import Redis
from redis.asyncio import Redis as AsyncRedis

from app.core.redis import redis_client
from app.core.logging import logger
from app.core.cache_stats import cache_stats_collector


class CacheManager:
    """缓存管理器"""

    def __init__(self, redis: Optional[Union[Redis, AsyncRedis]] = None):
        """
        初始化缓存管理器

        Args:
            redis: Redis 客户端实例，如果为 None 则使用全局客户端
        """
        self.redis = redis or redis_client.sync_client

    def get(self, key: str) -> Optional[Any]:
        """
        获取缓存

        Args:
            key: 缓存键

        Returns:
            缓存值，如果不存在则返回 None
        """
        start_time = time.time()
        
        try:
            value = self.redis.get(key)
            latency_ms = (time.time() - start_time) * 1000
            
            if value is None:
                # 记录缓存未命中
                cache_stats_collector.record_miss(key)
                return None

            # 记录缓存命中
            cache_stats_collector.record_hit(key, latency_ms)

            # 尝试解析 JSON
            try:
                return json.loads(value)
            except (json.JSONDecodeError, TypeError):
                return value

        except Exception as e:
            logger.error(f"获取缓存失败: key={key}, error={e}")
            return None

    def set(
        self,
        key: str,
        value: Any,
        expire: Optional[int] = None,
        nx: bool = False,
        xx: bool = False,
    ) -> bool:
        """
        设置缓存

        Args:
            key: 缓存键
            value: 缓存值
            expire: 过期时间（秒），None 表示永不过期
            nx: 仅当键不存在时设置
            xx: 仅当键存在时设置

        Returns:
            是否设置成功
        """
        start_time = time.time()
        
        try:
            # 序列化值
            if isinstance(value, (dict, list, tuple)):
                value = json.dumps(value, ensure_ascii=False)
            elif not isinstance(value, (str, bytes, int, float)):
                value = str(value)

            # 设置缓存
            result = self.redis.set(key, value, ex=expire, nx=nx, xx=xx)
            
            # 记录缓存设置操作
            latency_ms = (time.time() - start_time) * 1000
            cache_stats_collector.record_set(key, latency_ms)
            
            return result

        except Exception as e:
            logger.error(f"设置缓存失败: key={key}, error={e}")
            return False

    def delete(self, *keys: str) -> int:
        """
        删除缓存

        Args:
            *keys: 要删除的缓存键

        Returns:
            删除的键数量
        """
        try:
            if not keys:
                return 0
            
            result = self.redis.delete(*keys)
            
            # 记录缓存删除操作
            for key in keys:
                cache_stats_collector.record_delete(key)
            
            return result

        except Exception as e:
            logger.error(f"删除缓存失败: keys={keys}, error={e}")
            return 0

    def delete_pattern(self, pattern: str) -> int:
        """
        根据模式删除缓存

        Args:
            pattern: 匹配模式

        Returns:
            删除的键数量
        """
        try:
            keys = self.redis.keys(pattern)
            if not keys:
                return 0
            return self.redis.delete(*keys)

        except Exception as e:
            logger.error(f"根据模式删除缓存失败: pattern={pattern}, error={e}")
            return 0

    def exists(self, *keys: str) -> int:
        """
        检查键是否存在

        Args:
            *keys: 要检查的键

        Returns:
            存在的键数量
        """
        try:
            return self.redis.exists(*keys)

        except Exception as e:
            logger.error(f"检查键存在失败: keys={keys}, error={e}")
            return 0

    def expire(self, key: str, seconds: int) -> bool:
        """
        设置键的过期时间

        Args:
            key: 缓存键
            seconds: 过期时间（秒）

        Returns:
            是否设置成功
        """
        try:
            return self.redis.expire(key, seconds)

        except Exception as e:
            logger.error(f"设置过期时间失败: key={key}, error={e}")
            return False

    def ttl(self, key: str) -> int:
        """
        获取键的剩余过期时间

        Args:
            key: 缓存键

        Returns:
            剩余时间（秒），-1 表示永不过期，-2 表示键不存在
        """
        try:
            return self.redis.ttl(key)

        except Exception as e:
            logger.error(f"获取TTL失败: key={key}, error={e}")
            return -2

    def increment(self, key: str, amount: int = 1) -> Optional[int]:
        """
        增加计数器

        Args:
            key: 缓存键
            amount: 增加量

        Returns:
            增加后的值
        """
        try:
            return self.redis.incrby(key, amount)

        except Exception as e:
            logger.error(f"增加计数器失败: key={key}, error={e}")
            return None

    def decrement(self, key: str, amount: int = 1) -> Optional[int]:
        """
        减少计数器

        Args:
            key: 缓存键
            amount: 减少量

        Returns:
            减少后的值
        """
        try:
            return self.redis.decrby(key, amount)

        except Exception as e:
            logger.error(f"减少计数器失败: key={key}, error={e}")
            return None


class AsyncCacheManager:
    """异步缓存管理器"""

    def __init__(self, redis: Optional[AsyncRedis] = None):
        """
        初始化异步缓存管理器

        Args:
            redis: 异步 Redis 客户端实例
        """
        self.redis = redis or redis_client.async_client

    async def get(self, key: str) -> Optional[Any]:
        """获取缓存（异步）"""
        start_time = time.time()
        
        try:
            value = await self.redis.get(key)
            latency_ms = (time.time() - start_time) * 1000
            
            if value is None:
                # 记录缓存未命中
                cache_stats_collector.record_miss(key)
                return None

            # 记录缓存命中
            cache_stats_collector.record_hit(key, latency_ms)

            try:
                return json.loads(value)
            except (json.JSONDecodeError, TypeError):
                return value

        except Exception as e:
            logger.error(f"获取缓存失败: key={key}, error={e}")
            return None

    async def set(
        self,
        key: str,
        value: Any,
        expire: Optional[int] = None,
        nx: bool = False,
        xx: bool = False,
    ) -> bool:
        """设置缓存（异步）"""
        start_time = time.time()
        
        try:
            if isinstance(value, (dict, list, tuple)):
                value = json.dumps(value, ensure_ascii=False)
            elif not isinstance(value, (str, bytes, int, float)):
                value = str(value)

            result = await self.redis.set(key, value, ex=expire, nx=nx, xx=xx)
            
            # 记录缓存设置操作
            latency_ms = (time.time() - start_time) * 1000
            cache_stats_collector.record_set(key, latency_ms)
            
            return result

        except Exception as e:
            logger.error(f"设置缓存失败: key={key}, error={e}")
            return False

    async def delete(self, *keys: str) -> int:
        """删除缓存（异步）"""
        try:
            if not keys:
                return 0
            
            result = await self.redis.delete(*keys)
            
            # 记录缓存删除操作
            for key in keys:
                cache_stats_collector.record_delete(key)
            
            return result

        except Exception as e:
            logger.error(f"删除缓存失败: keys={keys}, error={e}")
            return 0

    async def delete_pattern(self, pattern: str) -> int:
        """根据模式删除缓存（异步）"""
        try:
            keys = await self.redis.keys(pattern)
            if not keys:
                return 0
            return await self.redis.delete(*keys)

        except Exception as e:
            logger.error(f"根据模式删除缓存失败: pattern={pattern}, error={e}")
            return 0

    async def exists(self, *keys: str) -> int:
        """检查键是否存在（异步）"""
        try:
            return await self.redis.exists(*keys)

        except Exception as e:
            logger.error(f"检查键存在失败: keys={keys}, error={e}")
            return 0

    async def expire(self, key: str, seconds: int) -> bool:
        """设置键的过期时间（异步）"""
        try:
            return await self.redis.expire(key, seconds)

        except Exception as e:
            logger.error(f"设置过期时间失败: key={key}, error={e}")
            return False

    async def ttl(self, key: str) -> int:
        """获取键的剩余过期时间（异步）"""
        try:
            return await self.redis.ttl(key)

        except Exception as e:
            logger.error(f"获取TTL失败: key={key}, error={e}")
            return -2

    async def increment(self, key: str, amount: int = 1) -> Optional[int]:
        """增加计数器（异步）"""
        try:
            return await self.redis.incrby(key, amount)

        except Exception as e:
            logger.error(f"增加计数器失败: key={key}, error={e}")
            return None

    async def decrement(self, key: str, amount: int = 1) -> Optional[int]:
        """减少计数器（异步）"""
        try:
            return await self.redis.decrby(key, amount)

        except Exception as e:
            logger.error(f"减少计数器失败: key={key}, error={e}")
            return None


# 创建全局缓存管理器实例
cache_manager = CacheManager()
async_cache_manager = AsyncCacheManager()
