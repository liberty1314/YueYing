"""
TMDB API 客户端

The Movie Database (TMDB) API 集成
提供电影、剧集的搜索和详情获取功能
"""

import httpx
from typing import Optional, Dict, Any, List
from loguru import logger
from sqlalchemy.orm import Session

from app.core.config import settings
from app.core.cache import async_cached
from app.utils.cache_keys import TMDB_MOVIE_DETAIL_TTL, TMDB_SEARCH_TTL


class TMDBClient:
    """TMDB API 客户端"""

    BASE_URL = "https://api.themoviedb.org/3"
    IMAGE_BASE_URL = "https://image.tmdb.org/t/p"

    def __init__(self, api_key: Optional[str] = None, db: Optional[Session] = None):
        """
        初始化 TMDB 客户端

        Args:
            api_key: TMDB API 密钥，如果不提供则从配置中读取
            db: 数据库会话，用于从数据库读取密钥配置
        """
        # 优先级：传入的 api_key > 数据库配置 > 环境变量
        if api_key:
            self.api_key = api_key
        elif db:
            # 尝试从数据库读取
            try:
                from app.services.api_key_service import api_key_service
                from app.models.api_key_config import ApiKeyService
                self.api_key = api_key_service.get_decrypted_key(db, ApiKeyService.TMDB)
                if self.api_key:
                    logger.debug("TMDB: 使用数据库中的 API 密钥")
            except Exception as e:
                logger.warning(f"TMDB: 从数据库读取密钥失败: {e}")
                self.api_key = settings.TMDB_API_KEY
        else:
            self.api_key = settings.TMDB_API_KEY
        
        if not self.api_key:
            logger.warning("TMDB API key not configured")

        self.client = httpx.AsyncClient(
            base_url=self.BASE_URL,
            timeout=30.0,
            params={"api_key": self.api_key},
        )

    async def __aenter__(self):
        """异步上下文管理器入口"""
        return self

    async def __aexit__(self, exc_type, exc_val, exc_tb):
        """异步上下文管理器退出"""
        await self.close()

    async def close(self):
        """关闭客户端连接"""
        await self.client.aclose()

    def _build_image_url(self, path: Optional[str], size: str = "original") -> Optional[str]:
        """
        构建图片 URL

        Args:
            path: 图片路径
            size: 图片尺寸 (w92, w154, w185, w342, w500, w780, original)

        Returns:
            完整的图片 URL
        """
        if not path:
            return None
        return f"{self.IMAGE_BASE_URL}/{size}{path}"

    async def _request(
        self,
        method: str,
        endpoint: str,
        params: Optional[Dict[str, Any]] = None,
        **kwargs,
    ) -> Dict[str, Any]:
        """
        发送 HTTP 请求

        Args:
            method: HTTP 方法
            endpoint: API 端点
            params: 查询参数
            **kwargs: 其他请求参数

        Returns:
            JSON 响应数据

        Raises:
            httpx.HTTPError: 请求失败
        """
        try:
            response = await self.client.request(
                method=method,
                url=endpoint,
                params=params or {},
                **kwargs,
            )
            response.raise_for_status()
            return response.json()
        except httpx.HTTPError as e:
            logger.error(f"TMDB API request failed: {method} {endpoint} - {str(e)}")
            raise

    # ==================== 电影相关 API ====================

    @async_cached(prefix="tmdb:search:movie", expire=TMDB_SEARCH_TTL)
    async def search_movies(
        self,
        query: str,
        page: int = 1,
        language: str = "zh-CN",
        year: Optional[int] = None,
    ) -> Dict[str, Any]:
        """
        搜索电影

        Args:
            query: 搜索关键词
            page: 页码
            language: 语言
            year: 年份过滤

        Returns:
            搜索结果
        """
        params = {
            "query": query,
            "page": page,
            "language": language,
        }
        if year:
            params["year"] = year

        logger.info(f"Searching movies: query='{query}', page={page}, year={year}")
        return await self._request("GET", "/search/movie", params=params)

    @async_cached(prefix="tmdb:movie", expire=TMDB_MOVIE_DETAIL_TTL)
    async def get_movie_details(
        self,
        movie_id: int,
        language: str = "zh-CN",
        append_to_response: Optional[str] = None,
    ) -> Dict[str, Any]:
        """
        获取电影详情

        Args:
            movie_id: 电影 ID
            language: 语言
            append_to_response: 附加响应数据 (credits, videos, images, etc.)

        Returns:
            电影详情
        """
        params = {"language": language}
        if append_to_response:
            params["append_to_response"] = append_to_response

        logger.info(f"Fetching movie details: id={movie_id}, language={language}")
        return await self._request("GET", f"/movie/{movie_id}", params=params)

    async def get_movie_credits(
        self,
        movie_id: int,
        language: str = "zh-CN",
    ) -> Dict[str, Any]:
        """
        获取电影演职人员

        Args:
            movie_id: 电影 ID
            language: 语言

        Returns:
            演职人员信息
        """
        params = {"language": language}
        logger.info(f"Fetching movie credits: id={movie_id}")
        return await self._request("GET", f"/movie/{movie_id}/credits", params=params)

    async def get_movie_videos(
        self,
        movie_id: int,
        language: str = "zh-CN",
    ) -> Dict[str, Any]:
        """
        获取电影视频（预告片等）

        Args:
            movie_id: 电影 ID
            language: 语言

        Returns:
            视频列表
        """
        params = {"language": language}
        logger.info(f"Fetching movie videos: id={movie_id}")
        return await self._request("GET", f"/movie/{movie_id}/videos", params=params)

    async def get_popular_movies(
        self,
        page: int = 1,
        language: str = "zh-CN",
        region: Optional[str] = None,
    ) -> Dict[str, Any]:
        """
        获取热门电影

        Args:
            page: 页码
            language: 语言
            region: 地区代码

        Returns:
            热门电影列表
        """
        params = {"page": page, "language": language}
        if region:
            params["region"] = region

        logger.info(f"Fetching popular movies: page={page}, region={region}")
        return await self._request("GET", "/movie/popular", params=params)

    async def get_top_rated_movies(
        self,
        page: int = 1,
        language: str = "zh-CN",
        region: Optional[str] = None,
    ) -> Dict[str, Any]:
        """
        获取高分电影

        Args:
            page: 页码
            language: 语言
            region: 地区代码

        Returns:
            高分电影列表
        """
        params = {"page": page, "language": language}
        if region:
            params["region"] = region

        logger.info(f"Fetching top rated movies: page={page}, region={region}")
        return await self._request("GET", "/movie/top_rated", params=params)

    # ==================== 剧集相关 API ====================

    @async_cached(prefix="tmdb:search:tv", expire=TMDB_SEARCH_TTL)
    async def search_tv_shows(
        self,
        query: str,
        page: int = 1,
        language: str = "zh-CN",
        first_air_date_year: Optional[int] = None,
    ) -> Dict[str, Any]:
        """
        搜索剧集

        Args:
            query: 搜索关键词
            page: 页码
            language: 语言
            first_air_date_year: 首播年份过滤

        Returns:
            搜索结果
        """
        params = {
            "query": query,
            "page": page,
            "language": language,
        }
        if first_air_date_year:
            params["first_air_date_year"] = first_air_date_year

        logger.info(f"Searching TV shows: query='{query}', page={page}")
        return await self._request("GET", "/search/tv", params=params)

    @async_cached(prefix="tmdb:tv", expire=TMDB_MOVIE_DETAIL_TTL)
    async def get_tv_details(
        self,
        tv_id: int,
        language: str = "zh-CN",
        append_to_response: Optional[str] = None,
    ) -> Dict[str, Any]:
        """
        获取剧集详情

        Args:
            tv_id: 剧集 ID
            language: 语言
            append_to_response: 附加响应数据

        Returns:
            剧集详情
        """
        params = {"language": language}
        if append_to_response:
            params["append_to_response"] = append_to_response

        logger.info(f"Fetching TV show details: id={tv_id}, language={language}")
        return await self._request("GET", f"/tv/{tv_id}", params=params)

    async def get_tv_credits(
        self,
        tv_id: int,
        language: str = "zh-CN",
    ) -> Dict[str, Any]:
        """
        获取剧集演职人员

        Args:
            tv_id: 剧集 ID
            language: 语言

        Returns:
            演职人员信息
        """
        params = {"language": language}
        logger.info(f"Fetching TV show credits: id={tv_id}")
        return await self._request("GET", f"/tv/{tv_id}/credits", params=params)

    async def get_tv_season_details(
        self,
        tv_id: int,
        season_number: int,
        language: str = "zh-CN",
    ) -> Dict[str, Any]:
        """
        获取剧集季度详情

        Args:
            tv_id: 剧集 ID
            season_number: 季度编号
            language: 语言

        Returns:
            季度详情
        """
        params = {"language": language}
        logger.info(f"Fetching TV season details: tv_id={tv_id}, season={season_number}")
        return await self._request(
            "GET", f"/tv/{tv_id}/season/{season_number}", params=params
        )

    async def get_popular_tv_shows(
        self,
        page: int = 1,
        language: str = "zh-CN",
    ) -> Dict[str, Any]:
        """
        获取热门剧集

        Args:
            page: 页码
            language: 语言

        Returns:
            热门剧集列表
        """
        params = {"page": page, "language": language}
        logger.info(f"Fetching popular TV shows: page={page}")
        return await self._request("GET", "/tv/popular", params=params)

    async def get_top_rated_tv_shows(
        self,
        page: int = 1,
        language: str = "zh-CN",
    ) -> Dict[str, Any]:
        """
        获取高分剧集

        Args:
            page: 页码
            language: 语言

        Returns:
            高分剧集列表
        """
        params = {"page": page, "language": language}
        logger.info(f"Fetching top rated TV shows: page={page}")
        return await self._request("GET", "/tv/top_rated", params=params)

    # ==================== 趋势相关 API ====================

    @async_cached(prefix="tmdb:trending", expire=3600)  # 缓存1小时
    async def get_trending(
        self,
        media_type: str = "all",  # all, movie, tv, person
        time_window: str = "day",  # day, week
        page: int = 1,
        language: str = "zh-CN",
    ) -> Dict[str, Any]:
        """
        获取趋势内容
        
        Args:
            media_type: 媒体类型 (all, movie, tv, person)
            time_window: 时间窗口 (day=今日, week=本周)
            page: 页码
            language: 语言
            
        Returns:
            趋势列表
        """
        params = {"page": page, "language": language}
        logger.info(f"Fetching trending {media_type} for {time_window}: page={page}")
        return await self._request("GET", f"/trending/{media_type}/{time_window}", params=params)

    # ==================== 配置相关 API ====================

    async def get_configuration(self) -> Dict[str, Any]:
        """
        获取 TMDB 配置信息

        Returns:
            配置信息（包括图片基础 URL 等）
        """
        logger.info("Fetching TMDB configuration")
        return await self._request("GET", "/configuration")

    # ==================== 工具方法 ====================

    def get_poster_url(self, path: Optional[str], size: str = "w500") -> Optional[str]:
        """获取海报 URL"""
        return self._build_image_url(path, size)

    def get_backdrop_url(self, path: Optional[str], size: str = "original") -> Optional[str]:
        """获取背景图 URL"""
        return self._build_image_url(path, size)

    def get_profile_url(self, path: Optional[str], size: str = "w185") -> Optional[str]:
        """获取人物照片 URL"""
        return self._build_image_url(path, size)


# 创建全局客户端实例
tmdb_client = TMDBClient()

