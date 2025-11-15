"""
首页数据缓存服务
负责首页数据的缓存管理、预加载和定时更新
"""
import json
from typing import Optional, Dict, Any, List
from datetime import datetime, timedelta
import asyncio

from app.core.cache import AsyncMultiLevelCacheManager, CacheKeyGenerator
from app.core.logging import logger
from app.services.external_apis.tmdb import tmdb_client
from app.services.external_apis.bangumi import bangumi_client


class HomeDataCacheService:
    """首页数据缓存服务"""

    # 缓存键前缀
    CACHE_PREFIX = "home_data"
    
    # 数据类型
    DATA_TYPES = {
        "trending_today": "trending:all:day",
        "trending_week": "trending:all:week",
        "anime_calendar": "bangumi:calendar",
        "top_movies": "top_rated:movies",
        "top_tv": "top_rated:tv",
    }
    
    # 缓存 TTL 配置
    # L1: 5 分钟（内存缓存）
    # L2: 1 小时（Redis 缓存）
    L1_TTL = 300
    L2_TTL = 3600
    
    def __init__(self):
        self.cache = AsyncMultiLevelCacheManager()
        
    def _get_cache_key(self, data_type: str, **params) -> str:
        """
        生成缓存键
        
        Args:
            data_type: 数据类型
            **params: 附加参数（如年份等）
        
        Returns:
            缓存键
        """
        if params:
            return CacheKeyGenerator.generate_key(
                f"{self.CACHE_PREFIX}:{data_type}",
                **params
            )
        return f"{self.CACHE_PREFIX}:{data_type}"
    
    def _get_last_update_key(self, data_type: str) -> str:
        """获取最后更新时间的缓存键"""
        return f"{self.CACHE_PREFIX}:{data_type}:last_update"
    
    async def _set_last_update(self, data_type: str):
        """设置最后更新时间"""
        last_update_key = self._get_last_update_key(data_type)
        await self.cache.set(
            last_update_key,
            datetime.utcnow().isoformat(),
            expire=None  # 永不过期
        )
    
    async def _get_last_update(self, data_type: str) -> Optional[datetime]:
        """获取最后更新时间"""
        last_update_key = self._get_last_update_key(data_type)
        last_update_str = await self.cache.get(last_update_key)
        
        if last_update_str:
            try:
                return datetime.fromisoformat(last_update_str)
            except (ValueError, TypeError):
                return None
        return None
    
    async def load_trending_today(self) -> Dict[str, Any]:
        """加载今日趋势数据"""
        try:
            logger.info("Loading trending today data from TMDB")
            result = await tmdb_client.get_trending(
                media_type="all",
                time_window="day",
                page=1,
                language="zh-CN"
            )
            return result
        except Exception as e:
            logger.error(f"Failed to load trending today: {e}")
            return {"results": []}
    
    async def load_trending_week(self) -> Dict[str, Any]:
        """加载本周趋势数据"""
        try:
            logger.info("Loading trending week data from TMDB")
            result = await tmdb_client.get_trending(
                media_type="all",
                time_window="week",
                page=1,
                language="zh-CN"
            )
            return result
        except Exception as e:
            logger.error(f"Failed to load trending week: {e}")
            return {"results": []}
    
    async def load_anime_calendar(self) -> List[Dict[str, Any]]:
        """加载动漫放送表数据"""
        try:
            logger.info("Loading anime calendar from Bangumi")
            result = await bangumi_client.get_calendar()
            return result
        except Exception as e:
            logger.error(f"Failed to load anime calendar: {e}")
            return []
    
    async def load_top_rated_movies(self, year: Optional[int] = None) -> Dict[str, Any]:
        """
        加载高分电影数据
        
        Args:
            year: 年份筛选
        
        Returns:
            电影数据
        """
        try:
            logger.info(f"Loading top rated movies (year={year})")
            result = await tmdb_client.get_top_rated_movies(
                page=1,
                language="zh-CN",
                year=year
            )
            return result
        except Exception as e:
            logger.error(f"Failed to load top rated movies: {e}")
            return {"results": []}
    
    async def load_top_rated_tv(self, year: Optional[int] = None) -> Dict[str, Any]:
        """
        加载高分剧集数据
        
        Args:
            year: 年份筛选
        
        Returns:
            剧集数据
        """
        try:
            logger.info(f"Loading top rated TV shows (year={year})")
            result = await tmdb_client.get_top_rated_tv_shows(
                page=1,
                language="zh-CN",
                first_air_date_year=year
            )
            return result
        except Exception as e:
            logger.error(f"Failed to load top rated TV shows: {e}")
            return {"results": []}
    
    async def cache_data(
        self, 
        data_type: str, 
        data: Any, 
        expire: Optional[int] = None,
        **params
    ) -> bool:
        """
        缓存数据到多级缓存
        
        Args:
            data_type: 数据类型
            data: 要缓存的数据
            expire: L2 过期时间（秒），None 使用默认值
            **params: 附加参数
        
        Returns:
            是否缓存成功
        """
        try:
            cache_key = self._get_cache_key(data_type, **params)
            l2_ttl = expire if expire is not None else self.L2_TTL
            await self.cache.set(cache_key, data, l1_ttl=self.L1_TTL, l2_ttl=l2_ttl)
            
            await self._set_last_update(data_type)
            logger.info(f"Cached {data_type} data to multi-level cache")
            
            return True
        except Exception as e:
            logger.error(f"Failed to cache {data_type}: {e}")
            return False
    
    async def get_cached_data(self, data_type: str, **params) -> Optional[Any]:
        """
        从多级缓存获取数据
        
        Args:
            data_type: 数据类型
            **params: 附加参数
        
        Returns:
            缓存的数据，不存在则返回 None
        """
        try:
            cache_key = self._get_cache_key(data_type, **params)
            data = await self.cache.get(cache_key)
            
            if data:
                logger.debug(f"Multi-level cache hit for {data_type}")
            else:
                logger.debug(f"Multi-level cache miss for {data_type}")
            
            return data
        except Exception as e:
            logger.error(f"Failed to get cached {data_type}: {e}")
            return None
    
    async def refresh_all_home_data(self, expire: Optional[int] = None):
        """
        刷新所有首页数据
        
        Args:
            expire: 缓存过期时间（秒）
        """
        logger.info("Starting to refresh all home data")
        
        # 当前年份和近5年
        current_year = datetime.now().year
        years = list(range(current_year, current_year - 5, -1))
        
        # 并发加载所有数据
        tasks = []
        
        # 趋势数据
        tasks.append(self._refresh_trending_today(expire))
        tasks.append(self._refresh_trending_week(expire))
        
        # 动漫放送表
        tasks.append(self._refresh_anime_calendar(expire))
        
        # 高分电影和剧集（近5年）
        for year in years:
            tasks.append(self._refresh_top_movies(year, expire))
            tasks.append(self._refresh_top_tv(year, expire))
        
        # 执行所有任务
        results = await asyncio.gather(*tasks, return_exceptions=True)
        
        # 统计结果
        success_count = sum(1 for r in results if r is True)
        fail_count = sum(1 for r in results if r is not True)
        
        logger.info(
            f"Home data refresh completed: "
            f"success={success_count}, failed={fail_count}"
        )
    
    async def _refresh_trending_today(self, expire: Optional[int] = None) -> bool:
        """刷新今日趋势"""
        data = await self.load_trending_today()
        return await self.cache_data("trending_today", data, expire=expire)
    
    async def _refresh_trending_week(self, expire: Optional[int] = None) -> bool:
        """刷新本周趋势"""
        data = await self.load_trending_week()
        return await self.cache_data("trending_week", data, expire=expire)
    
    async def _refresh_anime_calendar(self, expire: Optional[int] = None) -> bool:
        """刷新动漫放送表"""
        data = await self.load_anime_calendar()
        return await self.cache_data("anime_calendar", data, expire=expire)
    
    async def _refresh_top_movies(self, year: int, expire: Optional[int] = None) -> bool:
        """刷新高分电影"""
        data = await self.load_top_rated_movies(year=year)
        return await self.cache_data("top_movies", data, expire=expire, year=year)
    
    async def _refresh_top_tv(self, year: int, expire: Optional[int] = None) -> bool:
        """刷新高分剧集"""
        data = await self.load_top_rated_tv(year=year)
        return await self.cache_data("top_tv", data, expire=expire, year=year)
    
    async def get_or_load_data(
        self, 
        data_type: str, 
        loader_func,
        expire: Optional[int] = None,
        **params
    ) -> Any:
        """
        获取或加载数据（缓存优先）
        
        Args:
            data_type: 数据类型
            loader_func: 数据加载函数
            expire: 缓存过期时间
            **params: 附加参数
        
        Returns:
            数据
        """
        # 先尝试从缓存获取
        cached_data = await self.get_cached_data(data_type, **params)
        if cached_data is not None:
            return cached_data
        
        # 缓存未命中，加载数据
        logger.info(f"Cache miss for {data_type}, loading from source")
        data = await loader_func(**params) if params else await loader_func()
        
        # 缓存数据
        await self.cache_data(data_type, data, expire=expire, **params)
        
        return data
    
    async def should_refresh(self, data_type: str, hours: int = 24) -> bool:
        """
        检查是否需要刷新数据
        
        Args:
            data_type: 数据类型
            hours: 刷新间隔（小时）
        
        Returns:
            是否需要刷新
        """
        last_update = await self._get_last_update(data_type)
        
        if last_update is None:
            return True
        
        time_since_update = datetime.utcnow() - last_update
        return time_since_update > timedelta(hours=hours)


# 全局实例
home_cache_service = HomeDataCacheService()
