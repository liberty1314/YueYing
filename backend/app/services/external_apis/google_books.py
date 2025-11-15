"""
Google Books API 客户端

Google Books API 集成
提供书籍的搜索和详情获取功能
"""

import httpx
from typing import Optional, Dict, Any, List
from loguru import logger
from sqlalchemy.orm import Session

from app.core.config import settings
from app.core.cache import async_multi_level_cached
from app.utils.cache_keys import GOOGLE_BOOKS_SEARCH_TTL, GOOGLE_BOOKS_DETAIL_TTL


class GoogleBooksClient:
    """Google Books API 客户端"""

    BASE_URL = "https://www.googleapis.com/books/v1"

    def __init__(self, api_key: Optional[str] = None, db: Optional[Session] = None):
        """
        初始化 Google Books 客户端

        Args:
            api_key: Google Books API 密钥，如果不提供则从配置中读取
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
                self.api_key = api_key_service.get_decrypted_key(db, ApiKeyService.GOOGLE_BOOKS)
                if self.api_key:
                    logger.debug("Google Books: 使用数据库中的 API 密钥")
            except Exception as e:
                logger.warning(f"Google Books: 从数据库读取密钥失败: {e}")
                self.api_key = settings.GOOGLE_BOOKS_API_KEY
        else:
            self.api_key = settings.GOOGLE_BOOKS_API_KEY
        
        if not self.api_key:
            logger.warning("Google Books API key not configured")

        self.client = httpx.AsyncClient(
            base_url=self.BASE_URL,
            timeout=30.0,
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
        # 添加 API key 到参数
        if params is None:
            params = {}
        
        if self.api_key:
            params["key"] = self.api_key

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
            logger.error(f"Google Books API request failed: {method} {endpoint} - {str(e)}")
            raise

    # ==================== 书籍搜索 ====================

    @async_multi_level_cached(prefix="google_books:search", l1_ttl=300, l2_ttl=3600)
    async def search_books(
        self,
        query: str,
        start_index: int = 0,
        max_results: int = 10,
        langRestrict: Optional[str] = "zh-CN",
        order_by: str = "relevance",
        print_type: str = "all",
    ) -> Dict[str, Any]:
        """
        搜索书籍

        Args:
            query: 搜索关键词，支持高级搜索语法
                  - intitle: 标题搜索 (intitle:Python)
                  - inauthor: 作者搜索 (inauthor:Martin)
                  - inpublisher: 出版社搜索 (inpublisher:O'Reilly)
                  - subject: 主题搜索 (subject:Fiction)
                  - isbn: ISBN搜索 (isbn:9780596517748)
            start_index: 起始索引（分页）
            max_results: 最大结果数（1-40）
            langRestrict: 语言限制 (zh-CN, en, etc.)
            order_by: 排序方式 (relevance, newest)
            print_type: 打印类型 (all, books, magazines)

        Returns:
            搜索结果
        """
        params = {
            "q": query,
            "startIndex": start_index,
            "maxResults": min(max_results, 40),  # Google Books 限制最多 40
            "orderBy": order_by,
            "printType": print_type,
        }

        if langRestrict:
            params["langRestrict"] = langRestrict

        logger.info(
            f"Searching books: query='{query}', startIndex={start_index}, "
            f"maxResults={max_results}, lang={langRestrict}"
        )
        return await self._request("GET", "/volumes", params=params)

    @async_multi_level_cached(prefix="google_books:volume", l1_ttl=300, l2_ttl=86400)
    async def get_volume_details(self, volume_id: str) -> Dict[str, Any]:
        """
        获取书籍详情

        Args:
            volume_id: 书籍卷 ID

        Returns:
            书籍详细信息
        """
        logger.info(f"Fetching book details: id={volume_id}")
        return await self._request("GET", f"/volumes/{volume_id}")

    async def search_by_isbn(self, isbn: str) -> Dict[str, Any]:
        """
        通过 ISBN 搜索书籍

        Args:
            isbn: ISBN 号码（10位或13位）

        Returns:
            搜索结果
        """
        logger.info(f"Searching book by ISBN: {isbn}")
        return await self.search_books(f"isbn:{isbn}", max_results=1)

    async def search_by_title(
        self,
        title: str,
        author: Optional[str] = None,
        max_results: int = 10,
    ) -> Dict[str, Any]:
        """
        通过标题和作者搜索书籍

        Args:
            title: 书籍标题
            author: 作者名（可选）
            max_results: 最大结果数

        Returns:
            搜索结果
        """
        query = f"intitle:{title}"
        if author:
            query += f"+inauthor:{author}"

        logger.info(f"Searching book by title: title='{title}', author='{author}'")
        return await self.search_books(query, max_results=max_results)

    async def search_by_author(
        self,
        author: str,
        start_index: int = 0,
        max_results: int = 10,
    ) -> Dict[str, Any]:
        """
        通过作者搜索书籍

        Args:
            author: 作者名
            start_index: 起始索引
            max_results: 最大结果数

        Returns:
            搜索结果
        """
        logger.info(f"Searching books by author: '{author}'")
        return await self.search_books(
            f"inauthor:{author}",
            start_index=start_index,
            max_results=max_results,
        )

    async def search_by_category(
        self,
        category: str,
        start_index: int = 0,
        max_results: int = 10,
    ) -> Dict[str, Any]:
        """
        通过分类搜索书籍

        Args:
            category: 书籍分类/主题
            start_index: 起始索引
            max_results: 最大结果数

        Returns:
            搜索结果
        """
        logger.info(f"Searching books by category: '{category}'")
        return await self.search_books(
            f"subject:{category}",
            start_index=start_index,
            max_results=max_results,
        )

    # ==================== 书架功能（需要用户认证）====================

    async def get_my_bookshelves(self, user_id: str = "me") -> Dict[str, Any]:
        """
        获取用户书架列表（需要 OAuth 认证）

        Args:
            user_id: 用户 ID，默认 "me" 表示当前用户

        Returns:
            书架列表

        Note:
            此功能需要 OAuth 2.0 认证，当前实现暂不支持
        """
        logger.warning("OAuth authentication required for bookshelves access")
        raise NotImplementedError("OAuth authentication not implemented yet")

    # ==================== 工具方法 ====================

    def extract_isbn_from_identifiers(
        self, identifiers: List[Dict[str, str]]
    ) -> Optional[str]:
        """
        从标识符列表中提取 ISBN

        Args:
            identifiers: 标识符列表

        Returns:
            ISBN 号码（优先返回 ISBN_13，其次 ISBN_10）
        """
        isbn_13 = None
        isbn_10 = None

        for identifier in identifiers:
            if identifier.get("type") == "ISBN_13":
                isbn_13 = identifier.get("identifier")
            elif identifier.get("type") == "ISBN_10":
                isbn_10 = identifier.get("identifier")

        return isbn_13 or isbn_10

    def get_thumbnail_url(
        self, image_links: Dict[str, str], prefer_large: bool = True
    ) -> Optional[str]:
        """
        获取书籍封面图片 URL

        Args:
            image_links: 图片链接字典
            prefer_large: 是否优先使用大图

        Returns:
            图片 URL
        """
        if not image_links:
            return None

        # 按优先级返回
        if prefer_large:
            return (
                image_links.get("extraLarge")
                or image_links.get("large")
                or image_links.get("medium")
                or image_links.get("small")
                or image_links.get("thumbnail")
                or image_links.get("smallThumbnail")
            )
        else:
            return (
                image_links.get("thumbnail")
                or image_links.get("smallThumbnail")
                or image_links.get("small")
                or image_links.get("medium")
            )


# 创建全局客户端实例
google_books_client = GoogleBooksClient()

