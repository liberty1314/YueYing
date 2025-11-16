"""
缓存策略

提供多种缓存策略实现，包括多级缓存、LRU、TTL 等
"""

# 注意：多级缓存功能已在 multi_level.py 中实现
# 此文件保留用于未来扩展其他缓存策略

from app.core.cache.multi_level import (
    MultiLevelCacheManager,
    AsyncMultiLevelCacheManager,
    multi_level_cache_manager,
    async_multi_level_cache_manager,
    multi_level_cached,
    async_multi_level_cached,
)

__all__ = [
    "MultiLevelCacheManager",
    "AsyncMultiLevelCacheManager",
    "multi_level_cache_manager",
    "async_multi_level_cache_manager",
    "multi_level_cached",
    "async_multi_level_cached",
]

# 未来可以在这里添加其他缓存策略：
# - LRUCacheStrategy: LRU 淘汰策略
# - TTLCacheStrategy: 基于时间的过期策略
# - SizeLimitedCacheStrategy: 基于大小限制的策略
# - AdaptiveCacheStrategy: 自适应缓存策略
