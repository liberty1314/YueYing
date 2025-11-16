"""
缓存失效逻辑

提供缓存失效、清除和批量操作的工具函数
"""
from typing import List, Optional, Pattern
import re
from loguru import logger

from app.core.redis import redis_client as default_redis_client


class CacheInvalidator:
    """
    缓存失效管理器
    
    提供多种缓存失效策略和批量操作
    
    Examples:
        # 使用全局实例
        from app.core.cache.invalidation import cache_invalidator
        cache_invalidator.invalidate_by_key("user:123:profile")
        
        # 创建自定义实例
        from app.core.redis import redis_client
        invalidator = CacheInvalidator(redis_client)
        invalidator.invalidate_by_pattern("user:*")
    """
    
    def __init__(self, redis_instance=None):
        """
        初始化缓存失效管理器
        
        Args:
            redis_instance: Redis 客户端实例，支持以下类型：
                - None: 使用默认的全局 Redis 客户端
                - RedisClient 对象: 自动提取其 sync_client 属性
                - Redis 对象: 直接使用
        
        Examples:
            # 使用默认客户端
            invalidator = CacheInvalidator()
            
            # 使用自定义 RedisClient
            from app.core.redis import redis_client
            invalidator = CacheInvalidator(redis_client)
            
            # 使用原生 Redis 对象
            import redis
            r = redis.Redis(host='localhost', port=6379)
            invalidator = CacheInvalidator(r)
        """
        if redis_instance is None:
            # 使用默认的全局 Redis 客户端
            self.redis = default_redis_client.sync_client
        elif hasattr(redis_instance, 'sync_client'):
            # 如果是 RedisClient 对象，获取其 sync_client
            self.redis = redis_instance.sync_client
        else:
            # 直接使用传入的 Redis 客户端
            self.redis = redis_instance
    
    def invalidate_by_key(self, key: str) -> bool:
        """
        根据键失效单个缓存
        
        Args:
            key: 缓存键
        
        Returns:
            是否成功失效
        
        Examples:
            invalidator.invalidate_by_key("user:123:profile")
        """
        try:
            result = self.redis.delete(key)
            if result:
                logger.info(f"Invalidated cache key: {key}")
            return bool(result)
        except Exception as e:
            logger.error(f"Failed to invalidate cache key {key}: {e}")
            return False
    
    def invalidate_by_pattern(self, pattern: str) -> int:
        """
        根据模式批量失效缓存
        
        Args:
            pattern: 匹配模式（支持 Redis 通配符）
        
        Returns:
            失效的缓存数量
        
        Examples:
            # 失效某个用户的所有缓存
            invalidator.invalidate_by_pattern("user:123:*")
            
            # 失效所有用户的统计缓存
            invalidator.invalidate_by_pattern("user:*:stats:*")
        """
        try:
            keys = self.redis.keys(pattern)
            if not keys:
                logger.debug(f"No keys found matching pattern: {pattern}")
                return 0
            
            count = self.redis.delete(*keys)
            logger.info(f"Invalidated {count} cache keys matching pattern: {pattern}")
            return count
        except Exception as e:
            logger.error(f"Failed to invalidate cache by pattern {pattern}: {e}")
            return 0
    
    def invalidate_by_prefix(self, prefix: str) -> int:
        """
        根据前缀批量失效缓存
        
        Args:
            prefix: 缓存键前缀
        
        Returns:
            失效的缓存数量
        
        Examples:
            # 失效所有用户缓存
            invalidator.invalidate_by_prefix("user:")
            
            # 失效所有 API 缓存
            invalidator.invalidate_by_prefix("api:")
        """
        pattern = f"{prefix}*"
        return self.invalidate_by_pattern(pattern)
    
    def invalidate_by_tags(self, tags: List[str]) -> int:
        """
        根据标签批量失效缓存
        
        注意：需要在设置缓存时同时设置标签关联
        
        Args:
            tags: 标签列表
        
        Returns:
            失效的缓存数量
        
        Examples:
            # 失效所有带有 "movie" 标签的缓存
            invalidator.invalidate_by_tags(["movie"])
        """
        total_count = 0
        for tag in tags:
            # 获取该标签关联的所有键
            tag_key = f"tag:{tag}"
            keys = self.redis.smembers(tag_key)
            
            if keys:
                # 删除所有关联的缓存键
                count = self.redis.delete(*keys)
                # 删除标签集合本身
                self.redis.delete(tag_key)
                total_count += count
                logger.info(f"Invalidated {count} cache keys with tag: {tag}")
        
        return total_count
    
    def invalidate_user_cache(self, user_id: int) -> int:
        """
        失效某个用户的所有缓存
        
        Args:
            user_id: 用户ID
        
        Returns:
            失效的缓存数量
        
        Examples:
            invalidator.invalidate_user_cache(123)
        """
        pattern = f"user:{user_id}:*"
        return self.invalidate_by_pattern(pattern)
    
    def invalidate_all(self, confirm: bool = False) -> bool:
        """
        清空所有缓存（危险操作）
        
        Args:
            confirm: 必须显式确认才能执行
        
        Returns:
            是否成功
        
        Examples:
            # 必须传入 confirm=True 才能执行
            invalidator.invalidate_all(confirm=True)
        """
        if not confirm:
            logger.warning("invalidate_all() requires confirm=True to execute")
            return False
        
        try:
            self.redis.flushdb()
            logger.warning("All cache has been cleared!")
            return True
        except Exception as e:
            logger.error(f"Failed to clear all cache: {e}")
            return False
    
    def get_cache_size(self, pattern: Optional[str] = None) -> int:
        """
        获取缓存数量
        
        Args:
            pattern: 可选的匹配模式
        
        Returns:
            缓存键数量
        
        Examples:
            # 获取所有缓存数量
            total = invalidator.get_cache_size()
            
            # 获取用户缓存数量
            user_cache_count = invalidator.get_cache_size("user:*")
        """
        try:
            if pattern:
                keys = self.redis.keys(pattern)
                return len(keys)
            else:
                return self.redis.dbsize()
        except Exception as e:
            logger.error(f"Failed to get cache size: {e}")
            return 0
    
    def get_cache_memory_usage(self) -> dict:
        """
        获取缓存内存使用情况
        
        Returns:
            内存使用信息字典
        
        Examples:
            info = invalidator.get_cache_memory_usage()
            print(f"Used memory: {info['used_memory_human']}")
        """
        try:
            info = self.redis.info('memory')
            return {
                'used_memory': info.get('used_memory', 0),
                'used_memory_human': info.get('used_memory_human', '0B'),
                'used_memory_peak': info.get('used_memory_peak', 0),
                'used_memory_peak_human': info.get('used_memory_peak_human', '0B'),
            }
        except Exception as e:
            logger.error(f"Failed to get cache memory usage: {e}")
            return {}


# 创建全局实例（延迟初始化）
_cache_invalidator = None


def get_cache_invalidator() -> CacheInvalidator:
    """
    获取缓存失效管理器实例（单例模式）
    
    Returns:
        CacheInvalidator 实例
    """
    global _cache_invalidator
    if _cache_invalidator is None:
        _cache_invalidator = CacheInvalidator()
    return _cache_invalidator


# 为了向后兼容，保留 cache_invalidator 变量
cache_invalidator = get_cache_invalidator()


# 便捷函数
def invalidate_cache(key: str) -> bool:
    """
    失效单个缓存的便捷函数
    
    Args:
        key: 缓存键
    
    Returns:
        是否成功
    """
    return get_cache_invalidator().invalidate_by_key(key)


def invalidate_cache_pattern(pattern: str) -> int:
    """
    根据模式批量失效缓存的便捷函数
    
    Args:
        pattern: 匹配模式
    
    Returns:
        失效的缓存数量
    """
    return get_cache_invalidator().invalidate_by_pattern(pattern)


def invalidate_user_cache(user_id: int) -> int:
    """
    失效用户缓存的便捷函数
    
    Args:
        user_id: 用户ID
    
    Returns:
        失效的缓存数量
    """
    return get_cache_invalidator().invalidate_user_cache(user_id)


__all__ = [
    "CacheInvalidator",
    "cache_invalidator",
    "get_cache_invalidator",
    "invalidate_cache",
    "invalidate_cache_pattern",
    "invalidate_user_cache",
]
