"""
Redis 缓存管理器和装饰器

此文件保留用于向后兼容，所有功能已拆分到 cache/ 子模块中：
- cache/key_generator.py: 缓存键生成器
- cache/manager.py: 缓存管理器
- cache/decorators.py: 缓存装饰器
- cache/multi_level.py: 多级缓存管理器

请使用新的导入路径：
    from app.core.cache import CacheKeyGenerator, cache_manager, cached
"""

# 从新模块导入所有内容以保持向后兼容
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
]
