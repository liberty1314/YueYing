"""
缓存模块

提供多层次的缓存管理功能：
- CacheKeyGenerator: 缓存键生成器
- CacheManager: 同步缓存管理器
- AsyncCacheManager: 异步缓存管理器
- MultiLevelCacheManager: 多级缓存管理器
- CacheInvalidator: 缓存失效管理器
- 缓存装饰器: cached, async_cached, multi_level_cached, async_multi_level_cached

重构说明：
此模块已从单一的大文件（1385行）拆分为多个小模块，提高可维护性。
所有原有接口保持不变，确保向后兼容。

模块结构：
- key_generator.py: 缓存键生成器
- manager.py: 缓存管理器（同步和异步）
- decorators.py: 缓存装饰器
- multi_level.py: 多级缓存管理器
- strategies.py: 缓存策略（多级缓存等）
- invalidation.py: 缓存失效逻辑

使用方式：
    from app.core.cache import CacheKeyGenerator, CacheManager, cached
    
    # 所有原有代码无需修改，保持向后兼容
"""

# 导入所有组件
from app.core.cache.key_generator import CacheKeyGenerator
from app.core.cache.manager import (
    CacheManager,
    AsyncCacheManager,
    cache_manager,
    async_cache_manager,
)
from app.core.cache.decorators import (
    cached,
    async_cached,
)
from app.core.cache.multi_level import (
    MultiLevelCacheManager,
    AsyncMultiLevelCacheManager,
    multi_level_cache_manager,
    async_multi_level_cache_manager,
    multi_level_cached,
    async_multi_level_cached,
)
from app.core.cache.strategies import (
    # 策略模块重新导出多级缓存（保持兼容）
    MultiLevelCacheManager as StrategyMultiLevelCacheManager,
    AsyncMultiLevelCacheManager as StrategyAsyncMultiLevelCacheManager,
)
from app.core.cache.invalidation import (
    CacheInvalidator,
    cache_invalidator,
    invalidate_cache,
    invalidate_cache_pattern,
    invalidate_user_cache,
)

# 导出所有公共接口
__all__ = [
    # 键生成器
    "CacheKeyGenerator",
    # 管理器
    "CacheManager",
    "AsyncCacheManager",
    "cache_manager",
    "async_cache_manager",
    # 装饰器
    "cached",
    "async_cached",
    # 多级缓存
    "MultiLevelCacheManager",
    "AsyncMultiLevelCacheManager",
    "multi_level_cache_manager",
    "async_multi_level_cache_manager",
    "multi_level_cached",
    "async_multi_level_cached",
    # 缓存失效
    "CacheInvalidator",
    "cache_invalidator",
    "invalidate_cache",
    "invalidate_cache_pattern",
    "invalidate_user_cache",
]
