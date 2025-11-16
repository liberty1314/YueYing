"""
多级缓存管理器

提供 L1（内存）+ L2（Redis）两层缓存架构
"""
import functools
import time
import fnmatch
from typing import Any, Callable, Optional

from app.core.logging import logger
from app.core.cache.key_generator import CacheKeyGenerator
from app.core.cache.manager import CacheManager, AsyncCacheManager, cache_manager, async_cache_manager
from app.core.cache_stats import cache_stats_collector


class MultiLevelCacheManager:
    """
    多级缓存管理器（同步版本）
    
    协调 L1（内存缓存）和 L2（Redis 缓存）两层缓存
    
    查找流程：
    1. 检查 L1（内存）- 最快
    2. L1 未命中，检查 L2（Redis）
    3. L2 命中，提升到 L1
    4. L2 未命中，返回 None
    """
    
    def __init__(
        self,
        l1_cache: Optional['MemoryCacheManager'] = None,
        l2_cache: Optional[CacheManager] = None,
        stats_collector: Optional['CacheStatsCollector'] = None,
        config_manager: Optional['CacheConfigManager'] = None
    ):
        """
        初始化多级缓存管理器
        
        Args:
            l1_cache: L1 内存缓存管理器
            l2_cache: L2 Redis 缓存管理器
            stats_collector: 统计收集器
            config_manager: 配置管理器
        """
        # 延迟导入避免循环依赖
        from app.core.memory_cache import MemoryCacheManager
        from app.core.cache_config import cache_config_manager
        
        self.l1 = l1_cache or MemoryCacheManager()
        self.l2 = l2_cache or cache_manager
        self.stats = stats_collector or cache_stats_collector
        self.config_manager = config_manager or cache_config_manager
        
        logger.info("多级缓存管理器已初始化（同步版本）")
    
    def get(self, key: str) -> Optional[Any]:
        """
        从多级缓存获取值
        
        查找顺序：L1 → L2 → None
        
        Args:
            key: 缓存键

        Returns:
            缓存值，如果不存在则返回 None
        """
        start_time = time.time()
        
        # 1. 检查 L1（内存缓存）
        value = self.l1.cache.get(key)
        if value is not None:
            latency_ms = (time.time() - start_time) * 1000
            logger.debug(f"多级缓存 L1 命中: key={key}, latency={latency_ms:.2f}ms")
            return value
        
        # 2. 检查 L2（Redis 缓存）
        value = self.l2.get(key)
        if value is not None:
            # L2 命中，提升到 L1
            # 使用较短的 TTL（L1 默认 TTL）
            self.l1.cache.set(key, value)
            latency_ms = (time.time() - start_time) * 1000
            logger.debug(
                f"多级缓存 L2 命中并提升到 L1: key={key}, "
                f"latency={latency_ms:.2f}ms"
            )
            return value
        
        # 3. 完全未命中
        logger.debug(f"多级缓存完全未命中: key={key}")
        return None
    
    def set(
        self,
        key: str,
        value: Any,
        l1_ttl: Optional[int] = None,
        l2_ttl: Optional[int] = None
    ) -> None:
        """
        设置多级缓存
        
        同时设置到 L1 和 L2
        
        Args:
            key: 缓存键
            value: 缓存值
            l1_ttl: L1 TTL（秒），None 使用默认值
            l2_ttl: L2 TTL（秒），None 使用默认值
        """
        # 设置到 L1
        self.l1.cache.set(key, value, ttl=l1_ttl)
        
        # 设置到 L2
        self.l2.set(key, value, expire=l2_ttl)
        
        logger.debug(
            f"多级缓存设置: key={key}, l1_ttl={l1_ttl}s, l2_ttl={l2_ttl}s"
        )
    
    def delete(self, key: str) -> None:
        """
        从多级缓存删除键
        
        同时从 L1 和 L2 删除
        
        Args:
            key: 缓存键
        """
        self.l1.cache.delete(key)
        self.l2.delete(key)
        logger.debug(f"多级缓存删除: key={key}")
    
    def delete_pattern(self, pattern: str) -> int:
        """
        根据模式删除多级缓存
        
        Args:
            pattern: 匹配模式

        Returns:
            删除的键数量
        """
        # 删除 L1 中匹配的键
        l1_count = 0
        if hasattr(self.l1, 'cache') and hasattr(self.l1.cache, 'cache'):
            # 获取所有 L1 键（LRUCache.cache 是 OrderedDict）
            keys_to_delete = []
            for key in list(self.l1.cache.cache.keys()):
                if fnmatch.fnmatch(key, pattern):
                    keys_to_delete.append(key)
            
            # 删除匹配的键
            for key in keys_to_delete:
                self.l1.cache.delete(key)
                l1_count += 1
        
        # 删除 L2 中匹配的键
        l2_count = self.l2.delete_pattern(pattern)
        
        total_count = l1_count + l2_count
        logger.debug(f"多级缓存模式删除: pattern={pattern}, L1={l1_count}, L2={l2_count}, total={total_count}")
        return total_count
    
    def clear(self) -> None:
        """清空所有缓存"""
        self.l1.clear()
        # 注意：不清空 L2，因为可能被其他实例使用
        logger.info("多级缓存 L1 已清空")
    
    def get_ttl_for_data_type(self, data_type: 'CacheDataType') -> tuple[int, int]:
        """
        根据数据类型获取 TTL 配置
        
        Args:
            data_type: 缓存数据类型

        Returns:
            (l1_ttl, l2_ttl) 元组
        """
        return self.config_manager.get_ttl_for_data_type(data_type)
    
    def set_with_data_type(
        self,
        key: str,
        value: Any,
        data_type: 'CacheDataType'
    ) -> None:
        """
        根据数据类型设置缓存（使用配置的 TTL）
        
        Args:
            key: 缓存键
            value: 缓存值
            data_type: 数据类型
        """
        l1_ttl, l2_ttl = self.get_ttl_for_data_type(data_type)
        self.set(key, value, l1_ttl=l1_ttl, l2_ttl=l2_ttl)


class AsyncMultiLevelCacheManager:
    """
    多级缓存管理器（异步版本）
    
    协调 L1（内存缓存）和 L2（Redis 缓存）两层缓存
    """
    
    def __init__(
        self,
        l1_cache: Optional['MemoryCacheManager'] = None,
        l2_cache: Optional[AsyncCacheManager] = None,
        stats_collector: Optional['CacheStatsCollector'] = None,
        config_manager: Optional['CacheConfigManager'] = None
    ):
        """
        初始化异步多级缓存管理器
        
        Args:
            l1_cache: L1 内存缓存管理器
            l2_cache: L2 异步 Redis 缓存管理器
            stats_collector: 统计收集器
            config_manager: 配置管理器
        """
        # 延迟导入避免循环依赖
        from app.core.memory_cache import MemoryCacheManager
        from app.core.cache_config import cache_config_manager
        
        self.l1 = l1_cache or MemoryCacheManager()
        self.l2 = l2_cache or async_cache_manager
        self.stats = stats_collector or cache_stats_collector
        self.config_manager = config_manager or cache_config_manager
        
        logger.info("多级缓存管理器已初始化（异步版本）")
    
    async def get(self, key: str) -> Optional[Any]:
        """
        从多级缓存获取值（异步）
        
        查找顺序：L1 → L2 → None
        
        Args:
            key: 缓存键

        Returns:
            缓存值，如果不存在则返回 None
        """
        start_time = time.time()
        
        # 1. 检查 L1（内存缓存）- 同步操作
        value = self.l1.cache.get(key)
        if value is not None:
            latency_ms = (time.time() - start_time) * 1000
            logger.debug(f"异步多级缓存 L1 命中: key={key}, latency={latency_ms:.2f}ms")
            return value
        
        # 2. 检查 L2（Redis 缓存）- 异步操作
        value = await self.l2.get(key)
        if value is not None:
            # L2 命中，提升到 L1
            self.l1.cache.set(key, value)
            latency_ms = (time.time() - start_time) * 1000
            logger.debug(
                f"异步多级缓存 L2 命中并提升到 L1: key={key}, "
                f"latency={latency_ms:.2f}ms"
            )
            return value
        
        # 3. 完全未命中
        logger.debug(f"异步多级缓存完全未命中: key={key}")
        return None
    
    async def set(
        self,
        key: str,
        value: Any,
        l1_ttl: Optional[int] = None,
        l2_ttl: Optional[int] = None
    ) -> None:
        """
        设置多级缓存（异步）
        
        同时设置到 L1 和 L2
        
        Args:
            key: 缓存键
            value: 缓存值
            l1_ttl: L1 TTL（秒），None 使用默认值
            l2_ttl: L2 TTL（秒），None 使用默认值
        """
        # 设置到 L1（同步）
        self.l1.cache.set(key, value, ttl=l1_ttl)
        
        # 设置到 L2（异步）
        await self.l2.set(key, value, expire=l2_ttl)
        
        logger.debug(
            f"异步多级缓存设置: key={key}, l1_ttl={l1_ttl}s, l2_ttl={l2_ttl}s"
        )
    
    async def delete(self, key: str) -> None:
        """
        从多级缓存删除键（异步）
        
        同时从 L1 和 L2 删除
        
        Args:
            key: 缓存键
        """
        self.l1.cache.delete(key)
        await self.l2.delete(key)
        logger.debug(f"异步多级缓存删除: key={key}")
    
    async def delete_pattern(self, pattern: str) -> int:
        """
        根据模式删除多级缓存（异步）
        
        Args:
            pattern: 匹配模式

        Returns:
            删除的键数量
        """
        # 删除 L1 中匹配的键
        l1_count = 0
        if hasattr(self.l1, 'cache') and hasattr(self.l1.cache, 'cache'):
            # 获取所有 L1 键（LRUCache.cache 是 OrderedDict）
            keys_to_delete = []
            for key in list(self.l1.cache.cache.keys()):
                if fnmatch.fnmatch(key, pattern):
                    keys_to_delete.append(key)
            
            # 删除匹配的键
            for key in keys_to_delete:
                self.l1.cache.delete(key)
                l1_count += 1
        
        # 删除 L2 中匹配的键
        l2_count = await self.l2.delete_pattern(pattern)
        
        total_count = l1_count + l2_count
        logger.debug(f"异步多级缓存模式删除: pattern={pattern}, L1={l1_count}, L2={l2_count}, total={total_count}")
        return total_count
    
    def clear(self) -> None:
        """清空 L1 缓存"""
        self.l1.clear()
        logger.info("异步多级缓存 L1 已清空")
    
    def get_ttl_for_data_type(self, data_type: 'CacheDataType') -> tuple[int, int]:
        """
        根据数据类型获取 TTL 配置
        
        Args:
            data_type: 缓存数据类型

        Returns:
            (l1_ttl, l2_ttl) 元组
        """
        return self.config_manager.get_ttl_for_data_type(data_type)
    
    async def set_with_data_type(
        self,
        key: str,
        value: Any,
        data_type: 'CacheDataType'
    ) -> None:
        """
        根据数据类型设置缓存（使用配置的 TTL）
        
        Args:
            key: 缓存键
            value: 缓存值
            data_type: 数据类型
        """
        l1_ttl, l2_ttl = self.get_ttl_for_data_type(data_type)
        await self.set(key, value, l1_ttl=l1_ttl, l2_ttl=l2_ttl)


# 创建全局多级缓存管理器实例
multi_level_cache_manager = MultiLevelCacheManager()
async_multi_level_cache_manager = AsyncMultiLevelCacheManager()


# ============================================================================
# 多级缓存装饰器
# ============================================================================

def multi_level_cached(
    prefix: str,
    l1_ttl: Optional[int] = 300,  # 5 分钟
    l2_ttl: Optional[int] = 3600,  # 1 小时
    key_builder: Optional[Callable] = None,
) -> Callable:
    """
    多级缓存装饰器（同步函数）
    
    Args:
        prefix: 缓存键前缀
        l1_ttl: L1 TTL（秒）
        l2_ttl: L2 TTL（秒）
        key_builder: 自定义键生成函数

    Returns:
        装饰器函数

    Example:
        @multi_level_cached(prefix="user", l1_ttl=300, l2_ttl=3600)
        def get_user(user_id: int):
            return fetch_user_from_db(user_id)
    """
    
    def decorator(func: Callable) -> Callable:
        @functools.wraps(func)
        def wrapper(*args, **kwargs):
            # 检测是否是实例方法
            skip_first = False
            if args and hasattr(args[0], '__dict__') and hasattr(func, '__name__'):
                skip_first = True
            
            # 生成缓存键
            if key_builder:
                cache_key = key_builder(*args, **kwargs)
            else:
                cache_key = CacheKeyGenerator.generate_key(
                    prefix, *args, skip_first=skip_first, **kwargs
                )
            
            # 尝试从多级缓存获取
            cached_value = multi_level_cache_manager.get(cache_key)
            if cached_value is not None:
                logger.debug(f"多级缓存命中: {cache_key}")
                return cached_value
            
            # 执行函数
            logger.debug(f"多级缓存未命中: {cache_key}")
            result = func(*args, **kwargs)
            
            # 存入多级缓存
            if result is not None:
                multi_level_cache_manager.set(
                    cache_key, result, l1_ttl=l1_ttl, l2_ttl=l2_ttl
                )
            
            return result
        
        # 添加缓存失效方法
        def invalidate(*args, **kwargs):
            """使缓存失效"""
            skip_first = False
            if args and hasattr(args[0], '__dict__') and hasattr(func, '__name__'):
                skip_first = True
            
            if key_builder:
                cache_key = key_builder(*args, **kwargs)
            else:
                cache_key = CacheKeyGenerator.generate_key(
                    prefix, *args, skip_first=skip_first, **kwargs
                )
            multi_level_cache_manager.delete(cache_key)
        
        def invalidate_all():
            """使所有相关缓存失效"""
            pattern = CacheKeyGenerator.generate_pattern(prefix)
            multi_level_cache_manager.delete_pattern(pattern)
        
        wrapper.invalidate = invalidate
        wrapper.invalidate_all = invalidate_all
        
        return wrapper
    
    return decorator


def async_multi_level_cached(
    prefix: str,
    l1_ttl: Optional[int] = 300,  # 5 分钟
    l2_ttl: Optional[int] = 3600,  # 1 小时
    key_builder: Optional[Callable] = None,
) -> Callable:
    """
    异步多级缓存装饰器
    
    Args:
        prefix: 缓存键前缀
        l1_ttl: L1 TTL（秒）
        l2_ttl: L2 TTL（秒）
        key_builder: 自定义键生成函数

    Returns:
        装饰器函数

    Example:
        @async_multi_level_cached(prefix="user", l1_ttl=300, l2_ttl=3600)
        async def get_user(user_id: int):
            return await fetch_user_from_db(user_id)
    """
    
    def decorator(func: Callable) -> Callable:
        @functools.wraps(func)
        async def wrapper(*args, **kwargs):
            # 检测是否是实例方法
            skip_first = False
            if args and hasattr(args[0], '__dict__') and hasattr(func, '__name__'):
                skip_first = True
            
            # 生成缓存键
            if key_builder:
                cache_key = key_builder(*args, **kwargs)
            else:
                cache_key = CacheKeyGenerator.generate_key(
                    prefix, *args, skip_first=skip_first, **kwargs
                )
            
            # 尝试从多级缓存获取
            cached_value = await async_multi_level_cache_manager.get(cache_key)
            if cached_value is not None:
                logger.debug(f"异步多级缓存命中: {cache_key}")
                return cached_value
            
            # 执行函数
            logger.debug(f"异步多级缓存未命中: {cache_key}")
            result = await func(*args, **kwargs)
            
            # 存入多级缓存
            if result is not None:
                await async_multi_level_cache_manager.set(
                    cache_key, result, l1_ttl=l1_ttl, l2_ttl=l2_ttl
                )
            
            return result
        
        # 添加缓存失效方法
        async def invalidate(*args, **kwargs):
            """使缓存失效"""
            skip_first = False
            if args and hasattr(args[0], '__dict__') and hasattr(func, '__name__'):
                skip_first = True
            
            if key_builder:
                cache_key = key_builder(*args, **kwargs)
            else:
                cache_key = CacheKeyGenerator.generate_key(
                    prefix, *args, skip_first=skip_first, **kwargs
                )
            await async_multi_level_cache_manager.delete(cache_key)
        
        async def invalidate_all():
            """使所有相关缓存失效"""
            pattern = CacheKeyGenerator.generate_pattern(prefix)
            await async_multi_level_cache_manager.delete_pattern(pattern)
        
        wrapper.invalidate = invalidate
        wrapper.invalidate_all = invalidate_all
        
        return wrapper
    
    return decorator
