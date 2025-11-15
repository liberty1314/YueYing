"""
Redis 缓存管理器和装饰器
"""
import json
import hashlib
import functools
import time
from typing import Any, Callable, Optional, Union, Dict
from redis import Redis
from redis.asyncio import Redis as AsyncRedis

from app.core.redis import redis_client
from app.core.logging import logger
from app.core.cache_stats import cache_stats_collector


class CacheKeyGenerator:
    """
    增强的缓存键生成器
    
    支持层次化命名空间和多种键生成策略
    """
    
    # 键结构常量
    MAX_KEY_LENGTH = 200
    HASH_PREFIX = "hash"
    
    @staticmethod
    def generate_key(prefix: str, *args, skip_first: bool = False, **kwargs) -> str:
        """
        生成缓存键（向后兼容的方法）

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
        if len(key_string) > CacheKeyGenerator.MAX_KEY_LENGTH:
            hash_suffix = hashlib.md5(key_string.encode()).hexdigest()
            return f"{prefix}:{CacheKeyGenerator.HASH_PREFIX}:{hash_suffix}"

        return key_string
    
    @staticmethod
    def generate_hierarchical_key(
        service: str,
        entity_type: str,
        identifier: str,
        *args,
        **kwargs
    ) -> str:
        """
        生成层次化缓存键
        
        键结构: {service}:{entity_type}:{identifier}[:params]
        
        Examples:
            - api:movie:tmdb:550
            - user:123:items:status=watching
            - search:book:query_hash:abc123
            - stats:456:overview:period=month
        
        Args:
            service: 服务命名空间 (api, user, search, stats等)
            entity_type: 实体类型 (movie, book, items, profile等)
            identifier: 唯一标识符 (ID, hash等)
            *args: 额外的路径参数
            **kwargs: 查询参数

        Returns:
            层次化缓存键
        """
        # 构建基础键部分
        key_parts = [service, entity_type, identifier]
        
        # 添加额外的路径参数
        for arg in args:
            key_parts.append(str(arg))
        
        # 添加查询参数（按键排序）
        if kwargs:
            params = []
            for key in sorted(kwargs.keys()):
                value = kwargs[key]
                # 过滤 None 值
                if value is not None:
                    params.append(f"{key}={value}")
            if params:
                key_parts.append("&".join(params))
        
        # 生成键
        key_string = ":".join(key_parts)
        
        # 如果键太长，使用哈希但保留前缀
        if len(key_string) > CacheKeyGenerator.MAX_KEY_LENGTH:
            # 保留服务和实体类型作为前缀
            prefix = f"{service}:{entity_type}"
            hash_suffix = hashlib.md5(key_string.encode()).hexdigest()
            return f"{prefix}:{CacheKeyGenerator.HASH_PREFIX}:{hash_suffix}"
        
        return key_string
    
    @staticmethod
    def generate_user_key(
        user_id: int,
        entity_type: str,
        identifier: Optional[str] = None,
        **kwargs
    ) -> str:
        """
        生成用户特定的缓存键
        
        这是 generate_hierarchical_key 的便捷方法，专门用于用户数据
        
        Examples:
            - user:123:profile
            - user:123:items:456
            - user:123:stats:overview
        
        Args:
            user_id: 用户ID
            entity_type: 实体类型 (profile, items, stats等)
            identifier: 可选的实体标识符
            **kwargs: 额外的查询参数

        Returns:
            用户特定的缓存键
        """
        if identifier:
            return CacheKeyGenerator.generate_hierarchical_key(
                "user", str(user_id), entity_type, identifier, **kwargs
            )
        else:
            return CacheKeyGenerator.generate_hierarchical_key(
                "user", str(user_id), entity_type, **kwargs
            )
    
    @staticmethod
    def parse_key(key: str) -> Dict[str, str]:
        """
        解析缓存键，提取各个组成部分
        
        Args:
            key: 缓存键字符串

        Returns:
            包含键组成部分的字典
            - service: 服务命名空间
            - entity_type: 实体类型
            - identifier: 标识符
            - params: 参数字典（如果有）
            - is_hashed: 是否为哈希键
        """
        parts = key.split(":")
        
        if len(parts) < 2:
            return {
                "service": parts[0] if parts else "",
                "entity_type": "",
                "identifier": "",
                "params": {},
                "is_hashed": False,
                "raw_key": key
            }
        
        result = {
            "service": parts[0],
            "entity_type": parts[1] if len(parts) > 1 else "",
            "identifier": "",
            "params": {},
            "is_hashed": False,
            "raw_key": key
        }
        
        # 检查是否为哈希键
        if len(parts) > 2 and parts[2] == CacheKeyGenerator.HASH_PREFIX:
            result["is_hashed"] = True
            result["hash"] = parts[3] if len(parts) > 3 else ""
            return result
        
        # 提取标识符
        if len(parts) > 2:
            result["identifier"] = parts[2]
        
        # 解析参数（如果有）
        if len(parts) > 3:
            # 最后一部分可能包含参数
            last_part = parts[-1]
            if "=" in last_part:
                # 解析查询参数
                params = {}
                for param in last_part.split("&"):
                    if "=" in param:
                        k, v = param.split("=", 1)
                        params[k] = v
                result["params"] = params
                # 移除参数部分，保留路径
                result["path"] = ":".join(parts[3:-1]) if len(parts) > 4 else ""
            else:
                result["path"] = ":".join(parts[3:])
        
        return result

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
    
    @staticmethod
    def generate_hierarchical_pattern(
        service: str,
        entity_type: Optional[str] = None,
        identifier: Optional[str] = None
    ) -> str:
        """
        生成层次化键的匹配模式
        
        Examples:
            - generate_hierarchical_pattern("user") -> "user:*"
            - generate_hierarchical_pattern("user", "123") -> "user:123:*"
            - generate_hierarchical_pattern("user", "123", "items") -> "user:123:items:*"
        
        Args:
            service: 服务命名空间
            entity_type: 可选的实体类型
            identifier: 可选的标识符

        Returns:
            匹配模式字符串
        """
        parts = [service]
        
        if entity_type is not None:
            parts.append(str(entity_type))
            
            if identifier is not None:
                parts.append(str(identifier))
        
        parts.append("*")
        return ":".join(parts)
    
    @staticmethod
    def validate_key(key: str) -> bool:
        """
        验证缓存键格式是否正确
        
        Args:
            key: 缓存键字符串

        Returns:
            是否为有效的缓存键
        """
        if not key or not isinstance(key, str):
            return False
        
        # 检查长度
        if len(key) > CacheKeyGenerator.MAX_KEY_LENGTH * 2:  # 允许哈希键稍长
            return False
        
        # 检查是否包含非法字符
        # Redis 键可以包含任何字符，但我们限制为安全字符
        import re
        if not re.match(r'^[a-zA-Z0-9:_\-=&.]+$', key):
            return False
        
        # 检查基本结构（至少包含一个冒号）
        if ":" not in key:
            return False
        
        return True


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



# ============================================================================
# 多级缓存管理器
# ============================================================================

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
        import fnmatch
        
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
        import fnmatch
        
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
