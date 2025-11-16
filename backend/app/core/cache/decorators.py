"""
缓存装饰器

提供同步和异步的缓存装饰器功能
"""
import functools
from typing import Any, Callable, Optional

from app.core.logging import logger
from app.core.cache.key_generator import CacheKeyGenerator
from app.core.cache.manager import cache_manager, async_cache_manager


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
