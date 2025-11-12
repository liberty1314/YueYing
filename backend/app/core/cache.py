"""
Redis 缓存管理器和装饰器
"""
import json
import hashlib
import functools
from typing import Any, Callable, Optional, Union
from redis import Redis
from redis.asyncio import Redis as AsyncRedis

from app.core.redis import redis_client
from app.core.logging import logger


class CacheKeyGenerator:
    """缓存键生成器"""

    @staticmethod
    def generate_key(prefix: str, *args, skip_first: bool = False, **kwargs) -> str:
        """
        生成缓存键

        Args:
            prefix: 缓存键前缀
            *args: 位置参数
            skip_first: 是否跳过第一个参数（用于跳过实例方法的 self）
            **kwargs: 关键字参数

        Returns:
            生成的缓存键
        """
        # 将参数转换为字符串
        key_parts = [prefix]

        # 处理位置参数（如果是实例方法，跳过 self）
        args_to_use = args[1:] if skip_first and args else args
        for arg in args_to_use:
            key_parts.append(str(arg))

        # 处理关键字参数（按键排序以保证一致性）
        for key in sorted(kwargs.keys()):
            value = kwargs[key]
            key_parts.append(f"{key}:{value}")

        # 生成键
        key_string = ":".join(key_parts)

        # 如果键太长，使用哈希
        if len(key_string) > 200:
            hash_suffix = hashlib.md5(key_string.encode()).hexdigest()
            return f"{prefix}:hash:{hash_suffix}"

        return key_string

    @staticmethod
    def generate_pattern(prefix: str, pattern: str = "*") -> str:
        """
        生成缓存键匹配模式

        Args:
            prefix: 缓存键前缀
            pattern: 匹配模式

        Returns:
            匹配模式字符串
        """
        return f"{prefix}:{pattern}"


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
        try:
            value = self.redis.get(key)
            if value is None:
                return None

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
        try:
            # 序列化值
            if isinstance(value, (dict, list, tuple)):
                value = json.dumps(value, ensure_ascii=False)
            elif not isinstance(value, (str, bytes, int, float)):
                value = str(value)

            # 设置缓存
            return self.redis.set(key, value, ex=expire, nx=nx, xx=xx)

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
            return self.redis.delete(*keys)

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
        try:
            value = await self.redis.get(key)
            if value is None:
                return None

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
        try:
            if isinstance(value, (dict, list, tuple)):
                value = json.dumps(value, ensure_ascii=False)
            elif not isinstance(value, (str, bytes, int, float)):
                value = str(value)

            return await self.redis.set(key, value, ex=expire, nx=nx, xx=xx)

        except Exception as e:
            logger.error(f"设置缓存失败: key={key}, error={e}")
            return False

    async def delete(self, *keys: str) -> int:
        """删除缓存（异步）"""
        try:
            if not keys:
                return 0
            return await self.redis.delete(*keys)

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


def cached(
    prefix: str,
    expire: Optional[int] = 3600,
    key_builder: Optional[Callable] = None,
) -> Callable:
    """
    缓存装饰器（同步函数）

    Args:
        prefix: 缓存键前缀
        expire: 过期时间（秒），None 表示永不过期
        key_builder: 自定义键生成函数

    Returns:
        装饰器函数

    Example:
        @cached(prefix="user", expire=3600)
        def get_user(user_id: int):
            return fetch_user_from_db(user_id)
    """

    def decorator(func: Callable) -> Callable:
        @functools.wraps(func)
        def wrapper(*args, **kwargs):
            # 检测是否是实例方法（第一个参数是对象实例）
            skip_first = False
            if args and hasattr(args[0], '__dict__') and hasattr(func, '__name__'):
                # 检查第一个参数是否是一个实例对象
                skip_first = True
            
            # 生成缓存键
            if key_builder:
                cache_key = key_builder(*args, **kwargs)
            else:
                cache_key = CacheKeyGenerator.generate_key(prefix, *args, skip_first=skip_first, **kwargs)

            # 尝试从缓存获取
            cached_value = cache_manager.get(cache_key)
            if cached_value is not None:
                logger.debug(f"缓存命中: {cache_key}")
                return cached_value

            # 执行函数
            logger.debug(f"缓存未命中: {cache_key}")
            result = func(*args, **kwargs)

            # 存入缓存
            if result is not None:
                cache_manager.set(cache_key, result, expire=expire)

            return result

        # 添加缓存失效方法
        def invalidate(*args, **kwargs):
            """使缓存失效"""
            # 检测是否是实例方法
            skip_first = False
            if args and hasattr(args[0], '__dict__') and hasattr(func, '__name__'):
                skip_first = True
                
            if key_builder:
                cache_key = key_builder(*args, **kwargs)
            else:
                cache_key = CacheKeyGenerator.generate_key(prefix, *args, skip_first=skip_first, **kwargs)
            cache_manager.delete(cache_key)

        def invalidate_all():
            """使所有相关缓存失效"""
            pattern = CacheKeyGenerator.generate_pattern(prefix)
            cache_manager.delete_pattern(pattern)

        wrapper.invalidate = invalidate
        wrapper.invalidate_all = invalidate_all

        return wrapper

    return decorator


def async_cached(
    prefix: str,
    expire: Optional[int] = 3600,
    key_builder: Optional[Callable] = None,
) -> Callable:
    """
    异步缓存装饰器

    Args:
        prefix: 缓存键前缀
        expire: 过期时间（秒），None 表示永不过期
        key_builder: 自定义键生成函数

    Returns:
        装饰器函数

    Example:
        @async_cached(prefix="user", expire=3600)
        async def get_user(user_id: int):
            return await fetch_user_from_db(user_id)
    """

    def decorator(func: Callable) -> Callable:
        @functools.wraps(func)
        async def wrapper(*args, **kwargs):
            # 检测是否是实例方法（第一个参数是对象实例）
            skip_first = False
            if args and hasattr(args[0], '__dict__') and hasattr(func, '__name__'):
                # 检查第一个参数是否是一个实例对象
                skip_first = True
            
            # 生成缓存键
            if key_builder:
                cache_key = key_builder(*args, **kwargs)
            else:
                cache_key = CacheKeyGenerator.generate_key(prefix, *args, skip_first=skip_first, **kwargs)

            # 尝试从缓存获取
            cached_value = await async_cache_manager.get(cache_key)
            if cached_value is not None:
                logger.debug(f"缓存命中: {cache_key}")
                return cached_value

            # 执行函数
            logger.debug(f"缓存未命中: {cache_key}")
            result = await func(*args, **kwargs)

            # 存入缓存
            if result is not None:
                await async_cache_manager.set(cache_key, result, expire=expire)

            return result

        # 添加缓存失效方法
        async def invalidate(*args, **kwargs):
            """使缓存失效"""
            # 检测是否是实例方法
            skip_first = False
            if args and hasattr(args[0], '__dict__') and hasattr(func, '__name__'):
                skip_first = True
                
            if key_builder:
                cache_key = key_builder(*args, **kwargs)
            else:
                cache_key = CacheKeyGenerator.generate_key(prefix, *args, skip_first=skip_first, **kwargs)
            await async_cache_manager.delete(cache_key)

        async def invalidate_all():
            """使所有相关缓存失效"""
            pattern = CacheKeyGenerator.generate_pattern(prefix)
            await async_cache_manager.delete_pattern(pattern)

        wrapper.invalidate = invalidate
        wrapper.invalidate_all = invalidate_all

        return wrapper

    return decorator

