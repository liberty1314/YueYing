"""
用户记录缓存服务
负责用户记录列表的缓存管理，缓存在用户登录期间保持，登出时清除
"""
import json
from typing import Optional, Dict, Any, List, Tuple
from datetime import timedelta

from app.core.cache import AsyncCacheManager, CacheKeyGenerator
from app.core.logging import logger


class UserItemsCacheService:
    """用户记录缓存服务"""

    # 缓存键前缀
    CACHE_PREFIX = "user_items"
    
    # 缓存过期时间：直到用户登出（设置较长时间，在登出时手动删除）
    # 设置为 24 小时，但在用户操作时会手动清除
    CACHE_EXPIRE = timedelta(hours=24)
    
    def __init__(self):
        self.cache = AsyncCacheManager()
    
    def _get_cache_key(self, user_id: int, filters: Optional[Dict[str, Any]] = None) -> str:
        """
        生成用户记录列表的缓存键
        
        Args:
            user_id: 用户ID
            filters: 筛选参数（包含所有查询条件）
        
        Returns:
            缓存键
        """
        if filters:
            # 移除 None 值，确保缓存键一致性
            filter_params = {k: v for k, v in filters.items() if v is not None}
            return CacheKeyGenerator.generate_key(
                f"{self.CACHE_PREFIX}:list:{user_id}",
                **filter_params
            )
        return f"{self.CACHE_PREFIX}:list:{user_id}"
    
    def _get_user_cache_pattern(self, user_id: int) -> str:
        """
        生成用户所有记录缓存的匹配模式
        
        Args:
            user_id: 用户ID
        
        Returns:
            匹配模式
        """
        return f"{self.CACHE_PREFIX}:list:{user_id}:*"
    
    async def get_cached_items(
        self, 
        user_id: int, 
        filters: Optional[Dict[str, Any]] = None
    ) -> Optional[Tuple[List[Dict[str, Any]], int]]:
        """
        从缓存获取用户记录列表
        
        Args:
            user_id: 用户ID
            filters: 筛选参数
        
        Returns:
            (记录列表, 总数) 或 None（如果缓存不存在）
        """
        try:
            cache_key = self._get_cache_key(user_id, filters)
            cached_data = await self.cache.get(cache_key)
            
            if cached_data:
                logger.debug(f"Cache hit for user {user_id} items with filters {filters}")
                return cached_data.get("items"), cached_data.get("total")
            
            logger.debug(f"Cache miss for user {user_id} items with filters {filters}")
            return None
            
        except Exception as e:
            logger.error(f"Error getting cached items for user {user_id}: {e}")
            return None
    
    async def cache_items(
        self,
        user_id: int,
        items: List[Dict[str, Any]],
        total: int,
        filters: Optional[Dict[str, Any]] = None
    ):
        """
        缓存用户记录列表
        
        Args:
            user_id: 用户ID
            items: 记录列表
            total: 总数
            filters: 筛选参数
        """
        try:
            cache_key = self._get_cache_key(user_id, filters)
            cache_data = {
                "items": items,
                "total": total
            }
            
            await self.cache.set(
                cache_key,
                cache_data,
                expire=int(self.CACHE_EXPIRE.total_seconds())
            )
            
            logger.debug(f"Cached {len(items)} items for user {user_id} with filters {filters}")
            
        except Exception as e:
            logger.error(f"Error caching items for user {user_id}: {e}")
    
    async def clear_user_cache(self, user_id: int):
        """
        清除用户的所有记录缓存
        
        Args:
            user_id: 用户ID
        """
        try:
            pattern = self._get_user_cache_pattern(user_id)
            deleted_count = await self.cache.delete_pattern(pattern)
            
            logger.info(f"Cleared {deleted_count} cache entries for user {user_id}")
            
        except Exception as e:
            logger.error(f"Error clearing cache for user {user_id}: {e}")
    
    async def clear_all_user_caches(self, user_ids: List[int]):
        """
        批量清除多个用户的缓存（用于管理操作）
        
        Args:
            user_ids: 用户ID列表
        """
        try:
            for user_id in user_ids:
                await self.clear_user_cache(user_id)
                
            logger.info(f"Cleared caches for {len(user_ids)} users")
            
        except Exception as e:
            logger.error(f"Error clearing caches for multiple users: {e}")


# 全局缓存服务实例
user_items_cache_service = UserItemsCacheService()
