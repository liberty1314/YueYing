"""
Bangumi API 客户端（番组计划）

Bangumi API 集成，提供动漫、游戏等 ACG 内容的搜索和详情获取功能
中文支持优秀，适合中文用户使用
"""

import httpx
from typing import Optional, Dict, Any, List
from loguru import logger

from app.core.config import settings
from app.core.cache import async_cached
from app.utils.cache_keys import (
    BANGUMI_SEARCH_TTL,
    BANGUMI_SUBJECT_DETAIL_TTL,
    BANGUMI_CALENDAR_TTL,
)


class BangumiClient:
    """Bangumi API 客户端
    
    文档: https://bangumi.github.io/api/
    """

    BASE_URL = "https://api.bgm.tv"

    def __init__(self, api_key: Optional[str] = None, app_id: Optional[str] = None):
        """
        初始化 Bangumi 客户端

        Args:
            api_key: Bangumi API 密钥（用于认证）
            app_id: Bangumi App ID（替代方案）
        """
        # Bangumi 使用 api_key 或 app_id 进行认证
        self.api_key = api_key or settings.BANGUMI_API_KEY
        self.app_id = app_id or settings.BANGUMI_APP_ID
        
        if not self.api_key and not self.app_id:
            logger.warning("Bangumi API key or App ID not configured")

        self.client = httpx.AsyncClient(
            base_url=self.BASE_URL,
            timeout=30.0,
            headers={
                "User-Agent": "YueYing/1.0 (https://yueying.app)",
                "Accept": "application/json",
            },
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

    async def _request(
        self,
        method: str,
        endpoint: str,
        params: Optional[Dict[str, Any]] = None,
        **kwargs,
    ) -> Any:
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
        # 添加认证参数
        if params is None:
            params = {}

        # 优先使用 api_key，其次使用 app_id
        if self.api_key:
            params["access_token"] = self.api_key
        elif self.app_id:
            params["app_id"] = self.app_id

        try:
            response = await self.client.request(
                method=method,
                url=endpoint,
                params=params,
                **kwargs,
            )
            response.raise_for_status()
            return response.json()
        except httpx.HTTPError as e:
            logger.error(f"Bangumi API request failed: {method} {endpoint} - {str(e)}")
            raise

    # ==================== 搜索功能 ====================

    @async_cached(prefix="bangumi:search", expire=BANGUMI_SEARCH_TTL)
    async def search_subjects(
        self,
        keyword: str,
        type: Optional[int] = None,
        response_group: str = "small",
        max_results: int = 25,
        start: int = 0,
    ) -> Dict[str, Any]:
        """
        搜索条目（Subject）

        Args:
            keyword: 搜索关键词
            type: 条目类型
                  - 1: 书籍
                  - 2: 动画
                  - 3: 音乐
                  - 4: 游戏
                  - 6: 三次元
            response_group: 返回数据大小 (small, medium, large)
            max_results: 最大结果数 (1-25)
            start: 起始位置（分页）

        Returns:
            搜索结果
        """
        params = {
            "type": type,
            "responseGroup": response_group,
            "max_results": min(max_results, 25),  # Bangumi 限制最多 25
            "start": start,
        }

        # 移除 None 值
        params = {k: v for k, v in params.items() if v is not None}

        logger.info(
            f"Searching subjects: keyword='{keyword}', type={type}, "
            f"max_results={max_results}, start={start}"
        )
        return await self._request("GET", f"/search/subject/{keyword}", params=params)

    # ==================== 条目详情 ====================

    @async_cached(prefix="bangumi:subject", expire=BANGUMI_SUBJECT_DETAIL_TTL)
    async def get_subject_details(
        self, subject_id: int, response_group: str = "large"
    ) -> Dict[str, Any]:
        """
        获取条目详情

        Args:
            subject_id: 条目 ID
            response_group: 返回数据大小 (small, medium, large)

        Returns:
            条目详细信息
        """
        params = {"responseGroup": response_group}

        logger.info(f"Fetching subject details: id={subject_id}")
        return await self._request("GET", f"/v0/subjects/{subject_id}", params=params)

    async def get_subject(self, subject_id: int) -> Dict[str, Any]:
        """
        获取条目基本信息（兼容旧版 API）

        Args:
            subject_id: 条目 ID

        Returns:
            条目基本信息
        """
        logger.info(f"Fetching subject: id={subject_id}")
        return await self._request("GET", f"/subject/{subject_id}")

    # ==================== 章节/剧集信息 ====================

    @async_cached(prefix="bangumi:episodes", expire=BANGUMI_SUBJECT_DETAIL_TTL)
    async def get_subject_episodes(
        self, subject_id: int, type: int = 0, offset: int = 0, limit: int = 100
    ) -> Dict[str, Any]:
        """
        获取条目的章节/剧集列表

        Args:
            subject_id: 条目 ID
            type: 章节类型
                  - 0: 本篇
                  - 1: SP
                  - 2: OP
                  - 3: ED
            offset: 偏移量
            limit: 限制数量 (最大 100)

        Returns:
            章节列表
        """
        params = {"type": type, "offset": offset, "limit": min(limit, 100)}

        logger.info(f"Fetching episodes: subject_id={subject_id}, type={type}")
        return await self._request(
            "GET", f"/v0/episodes", params={**params, "subject_id": subject_id}
        )

    async def get_episode_details(self, episode_id: int) -> Dict[str, Any]:
        """
        获取章节/剧集详情

        Args:
            episode_id: 章节 ID

        Returns:
            章节详细信息
        """
        logger.info(f"Fetching episode details: id={episode_id}")
        return await self._request("GET", f"/v0/episodes/{episode_id}")

    # ==================== 角色信息 ====================

    @async_cached(prefix="bangumi:characters", expire=BANGUMI_SUBJECT_DETAIL_TTL)
    async def get_subject_characters(self, subject_id: int) -> List[Dict[str, Any]]:
        """
        获取条目的角色列表

        Args:
            subject_id: 条目 ID

        Returns:
            角色列表
        """
        logger.info(f"Fetching characters: subject_id={subject_id}")
        return await self._request("GET", f"/v0/subjects/{subject_id}/characters")

    async def get_character_details(self, character_id: int) -> Dict[str, Any]:
        """
        获取角色详情

        Args:
            character_id: 角色 ID

        Returns:
            角色详细信息
        """
        logger.info(f"Fetching character details: id={character_id}")
        return await self._request("GET", f"/v0/characters/{character_id}")

    # ==================== 人物信息 ====================

    @async_cached(prefix="bangumi:persons", expire=BANGUMI_SUBJECT_DETAIL_TTL)
    async def get_subject_persons(self, subject_id: int) -> List[Dict[str, Any]]:
        """
        获取条目的制作人员列表

        Args:
            subject_id: 条目 ID

        Returns:
            制作人员列表
        """
        logger.info(f"Fetching persons: subject_id={subject_id}")
        return await self._request("GET", f"/v0/subjects/{subject_id}/persons")

    async def get_person_details(self, person_id: int) -> Dict[str, Any]:
        """
        获取人物详情

        Args:
            person_id: 人物 ID

        Returns:
            人物详细信息
        """
        logger.info(f"Fetching person details: id={person_id}")
        return await self._request("GET", f"/v0/persons/{person_id}")

    # ==================== 每日放送 ====================

    @async_cached(prefix="bangumi:calendar", expire=BANGUMI_CALENDAR_TTL)
    async def get_calendar(self) -> List[Dict[str, Any]]:
        """
        获取每日放送（当前一周的放送时间表）

        Returns:
            放送时间表列表
        """
        logger.info("Fetching calendar")
        return await self._request("GET", "/calendar")

    # ==================== 工具方法 ====================

    def get_image_url(self, image_path: str, size: str = "large") -> str:
        """
        获取图片 URL

        Args:
            image_path: 图片路径（如：/data/images/cover/l/...)
            size: 图片尺寸
                  - large: 大图
                  - common: 普通
                  - medium: 中等
                  - small: 小图
                  - grid: 网格

        Returns:
            完整的图片 URL
        """
        if not image_path:
            return ""

        # 如果已经是完整 URL，直接返回
        if image_path.startswith("http"):
            return image_path

        # 替换尺寸标识
        size_map = {"large": "/l/", "common": "/c/", "medium": "/m/", "small": "/s/", "grid": "/g/"}

        for s, prefix in size_map.items():
            if prefix in image_path:
                # 已经包含尺寸标识，替换为目标尺寸
                for old_prefix in size_map.values():
                    image_path = image_path.replace(old_prefix, size_map[size])
                break

        # 拼接完整 URL
        return f"https://lain.bgm.tv{image_path}"

    def get_subject_type_name(self, type_id: int) -> str:
        """
        获取条目类型名称

        Args:
            type_id: 类型 ID

        Returns:
            类型名称
        """
        type_names = {
            1: "书籍",
            2: "动画",
            3: "音乐",
            4: "游戏",
            6: "三次元",
        }
        return type_names.get(type_id, "未知")


# 创建全局客户端实例
bangumi_client = BangumiClient()

