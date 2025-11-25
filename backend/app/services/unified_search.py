"""
统一搜索服务

整合多个外部API（TMDB、Google Books、Bangumi）的搜索结果，
提供统一的搜索接口和结果格式。
"""

import asyncio
import re
from typing import List, Dict, Any, Optional
from enum import Enum
from loguru import logger

from app.services.external_apis.tmdb import tmdb_client
from app.services.external_apis.google_books import google_books_client
from app.services.external_apis.bangumi import bangumi_client
from app.core.cache import CacheManager
from app.utils.cache_keys import MEDIUM_CACHE_TTL


class ContentType(str, Enum):
    """内容类型枚举"""
    MOVIE = "movie"
    TV = "tv"
    ANIME = "anime"
    BOOK = "book"
    ALL = "all"


class SearchSource(str, Enum):
    """搜索来源枚举"""
    TMDB = "tmdb"
    GOOGLE_BOOKS = "google_books"
    BANGUMI = "bangumi"


class UnifiedSearchService:
    """统一搜索服务"""

    def __init__(self, cache_manager: CacheManager):
        self.cache_manager = cache_manager
        self.tmdb = tmdb_client
        self.google_books = google_books_client
        self.bangumi = bangumi_client

    async def search(
        self,
        query: str,
        content_type: ContentType = ContentType.ALL,
        max_results: int = 20,
        page: int = 1,
        enable_strict_filter: bool = True,
    ) -> Dict[str, Any]:
        """
        统一搜索入口

        Args:
            query: 搜索关键词
            content_type: 内容类型（movie/tv/anime/book/all）
            max_results: 每个来源的最大结果数
            page: 页码
            enable_strict_filter: 是否启用严格标题匹配过滤（默认启用）

        Returns:
            统一格式的搜索结果
        """
        logger.info(
            f"Unified search: query='{query}', type={content_type}, "
            f"max_results={max_results}, page={page}"
        )

        # 根据内容类型决定调用哪些API
        search_tasks = []

        if content_type in [ContentType.MOVIE, ContentType.ALL]:
            search_tasks.append(self._search_tmdb_movies(query, max_results))

        if content_type in [ContentType.TV, ContentType.ALL]:
            search_tasks.append(self._search_tmdb_tv(query, max_results))

        if content_type in [ContentType.ANIME, ContentType.ALL]:
            search_tasks.append(self._search_bangumi_anime(query, max_results))

        if content_type in [ContentType.BOOK, ContentType.ALL]:
            search_tasks.append(self._search_google_books(query, max_results))

        # 并行执行所有搜索任务
        results = await asyncio.gather(*search_tasks, return_exceptions=True)

        # 过滤错误结果
        valid_results = []
        for i, result in enumerate(results):
            if isinstance(result, Exception):
                logger.error(f"Search task {i} failed: {result}")
            else:
                valid_results.extend(result)

        # 去重和排序
        deduplicated_results = self._deduplicate_results(valid_results)
        
        # 严格标题匹配过滤（可选）
        if enable_strict_filter:
            deduplicated_results = self._filter_by_title_match(
                deduplicated_results, query
            )
            logger.info(
                f"Strict filter applied: {len(deduplicated_results)} results remaining"
            )
        
        sorted_results = self._sort_by_relevance(deduplicated_results, query)

        # 分页
        start_idx = (page - 1) * max_results
        end_idx = start_idx + max_results
        paginated_results = sorted_results[start_idx:end_idx]

        return {
            "query": query,
            "content_type": content_type,
            "total": len(sorted_results),
            "page": page,
            "page_size": max_results,
            "total_pages": (len(sorted_results) + max_results - 1) // max_results,
            "results": paginated_results,
        }

    async def _search_tmdb_movies(
        self, query: str, max_results: int
    ) -> List[Dict[str, Any]]:
        """搜索TMDB电影"""
        try:
            response = await self.tmdb.search_movies(query, page=1)
            movies = response.get("results", [])[:max_results]

            return [
                self._normalize_tmdb_movie(movie)
                for movie in movies
            ]
        except Exception as e:
            logger.error(f"TMDB movie search failed: {e}")
            return []

    async def _search_tmdb_tv(
        self, query: str, max_results: int
    ) -> List[Dict[str, Any]]:
        """搜索TMDB电视剧"""
        try:
            response = await self.tmdb.search_tv_shows(query, page=1)
            tv_shows = response.get("results", [])[:max_results]

            return [
                self._normalize_tmdb_tv(tv)
                for tv in tv_shows
            ]
        except Exception as e:
            logger.error(f"TMDB TV search failed: {e}")
            return []

    async def _search_bangumi_anime(
        self, query: str, max_results: int
    ) -> List[Dict[str, Any]]:
        """搜索Bangumi动画"""
        try:
            response = await self.bangumi.search_subjects(
                keyword=query,
                type=2,  # 动画
                max_results=max_results,
            )
            subjects = response.get("list", [])

            return [
                self._normalize_bangumi_subject(subject, "anime")
                for subject in subjects
            ]
        except Exception as e:
            logger.error(f"Bangumi anime search failed: {e}")
            return []

    async def _search_google_books(
        self, query: str, max_results: int
    ) -> List[Dict[str, Any]]:
        """搜索Google Books"""
        try:
            response = await self.google_books.search_books(
                query=query,
                max_results=max_results,
            )
            items = response.get("items", [])

            return [
                self._normalize_google_book(book)
                for book in items
            ]
        except Exception as e:
            logger.error(f"Google Books search failed: {e}")
            return []

    def _normalize_tmdb_movie(self, movie: Dict[str, Any]) -> Dict[str, Any]:
        """标准化TMDB电影数据"""
        return {
            "id": f"tmdb_movie_{movie.get('id')}",
            "external_id": str(movie.get("id")),
            "source": SearchSource.TMDB,
            "content_type": ContentType.MOVIE,
            "title": movie.get("title", ""),
            "original_title": movie.get("original_title"),
            "description": movie.get("overview", ""),
            "poster_url": (
                f"https://image.tmdb.org/t/p/w500{movie['poster_path']}"
                if movie.get("poster_path")
                else None
            ),
            "backdrop_url": (
                f"https://image.tmdb.org/t/p/w1280{movie['backdrop_path']}"
                if movie.get("backdrop_path")
                else None
            ),
            "release_date": movie.get("release_date"),
            "year": (
                movie.get("release_date", "")[:4]
                if movie.get("release_date")
                else None
            ),
            "rating": movie.get("vote_average"),
            "vote_count": movie.get("vote_count"),
            "popularity": movie.get("popularity"),
            "language": movie.get("original_language"),
            "metadata": {
                "adult": movie.get("adult", False),
                "genre_ids": movie.get("genre_ids", []),
            },
        }

    def _normalize_tmdb_tv(self, tv: Dict[str, Any]) -> Dict[str, Any]:
        """标准化TMDB电视剧数据"""
        return {
            "id": f"tmdb_tv_{tv.get('id')}",
            "external_id": str(tv.get("id")),
            "source": SearchSource.TMDB,
            "content_type": ContentType.TV,
            "title": tv.get("name", ""),
            "original_title": tv.get("original_name"),
            "description": tv.get("overview", ""),
            "poster_url": (
                f"https://image.tmdb.org/t/p/w500{tv['poster_path']}"
                if tv.get("poster_path")
                else None
            ),
            "backdrop_url": (
                f"https://image.tmdb.org/t/p/w1280{tv['backdrop_path']}"
                if tv.get("backdrop_path")
                else None
            ),
            "release_date": tv.get("first_air_date"),
            "year": (
                tv.get("first_air_date", "")[:4]
                if tv.get("first_air_date")
                else None
            ),
            "rating": tv.get("vote_average"),
            "vote_count": tv.get("vote_count"),
            "popularity": tv.get("popularity"),
            "language": tv.get("original_language"),
            "metadata": {
                "genre_ids": tv.get("genre_ids", []),
                "origin_country": tv.get("origin_country", []),
            },
        }

    def _normalize_bangumi_subject(
        self, subject: Dict[str, Any], content_type: str
    ) -> Dict[str, Any]:
        """标准化Bangumi条目数据"""
        images = subject.get("images", {})
        rating = subject.get("rating", {})

        return {
            "id": f"bangumi_{subject.get('id')}",
            "external_id": str(subject.get("id")),
            "source": SearchSource.BANGUMI,
            "content_type": content_type,
            "title": subject.get("name_cn") or subject.get("name", ""),
            "original_title": subject.get("name"),
            "description": subject.get("summary", ""),
            "poster_url": images.get("large") or images.get("common"),
            "backdrop_url": images.get("large"),
            "release_date": subject.get("air_date") or subject.get("date"),
            "year": (
                (subject.get("air_date") or subject.get("date", ""))[:4]
                if (subject.get("air_date") or subject.get("date"))
                else None
            ),
            "rating": rating.get("score"),
            "vote_count": rating.get("total"),
            "popularity": subject.get("collection", {}).get("collect", 0),
            "metadata": {
                "type": subject.get("type"),
                "eps": subject.get("eps"),
                "rank": subject.get("rank"),
                "nsfw": subject.get("nsfw", False),
            },
        }

    def _normalize_google_book(self, book: Dict[str, Any]) -> Dict[str, Any]:
        """标准化Google Books数据"""
        volume_info = book.get("volumeInfo", {})
        image_links = volume_info.get("imageLinks", {})

        # 提取ISBN
        isbn = None
        for identifier in volume_info.get("industryIdentifiers", []):
            if identifier.get("type") in ["ISBN_13", "ISBN_10"]:
                isbn = identifier.get("identifier")
                if identifier.get("type") == "ISBN_13":
                    break

        # 提取作者
        authors = volume_info.get("authors", [])
        author = ", ".join(authors) if authors else None

        # 提取出版年份
        published_date = volume_info.get("publishedDate", "")
        year = published_date[:4] if len(published_date) >= 4 else None

        return {
            "id": f"google_books_{book.get('id')}",
            "external_id": book.get("id"),
            "source": SearchSource.GOOGLE_BOOKS,
            "content_type": ContentType.BOOK,
            "title": volume_info.get("title", ""),
            "original_title": volume_info.get("subtitle"),
            "description": volume_info.get("description", ""),
            "poster_url": (
                image_links.get("thumbnail", "").replace("http://", "https://")
                if image_links.get("thumbnail")
                else None
            ),
            "backdrop_url": (
                image_links.get("large", "").replace("http://", "https://")
                if image_links.get("large")
                else None
            ),
            "release_date": published_date,
            "year": year,
            "rating": volume_info.get("averageRating"),
            "vote_count": volume_info.get("ratingsCount"),
            "popularity": None,
            "language": volume_info.get("language"),
            "metadata": {
                "authors": authors,
                "author": author,
                "publisher": volume_info.get("publisher"),
                "isbn": isbn,
                "page_count": volume_info.get("pageCount"),
                "categories": volume_info.get("categories", []),
            },
        }

    def _normalize_text(self, text: str) -> str:
        """
        标准化文本：移除标点符号并转小写
        
        Args:
            text: 原始文本
            
        Returns:
            清理后的文本
        """
        if not text:
            return ""
        
        # 转小写
        text = text.lower()
        
        # 移除所有标点符号和特殊字符，只保留字母、数字、空格和中文字符
        text = re.sub(r'[^\w\s\u4e00-\u9fff]', '', text)
        
        # 移除多余空格
        text = ' '.join(text.split())
        
        return text

    def _filter_by_title_match(
        self, results: List[Dict[str, Any]], query: str
    ) -> List[Dict[str, Any]]:
        """
        严格标题匹配过滤
        
        只保留标题中包含搜索关键词的结果（不区分大小写，移除标点符号）
        
        Args:
            results: 搜索结果列表
            query: 搜索关键词
            
        Returns:
            过滤后的结果列表
        """
        if not results or not query:
            return results
        
        # 标准化搜索关键词
        normalized_query = self._normalize_text(query)
        
        filtered = []
        for result in results:
            # 获取标题和原始标题
            title = result.get("title") or ""
            original_title = result.get("original_title") or ""
            
            # 标准化标题
            normalized_title = self._normalize_text(title)
            normalized_original = self._normalize_text(original_title)
            
            # 检查是否包含关键词
            if (normalized_query in normalized_title or 
                normalized_query in normalized_original):
                filtered.append(result)
        
        logger.info(
            f"Title match filter: {len(results)} -> {len(filtered)} results "
            f"(removed {len(results) - len(filtered)} irrelevant items)"
        )
        
        return filtered

    def _deduplicate_results(
        self, results: List[Dict[str, Any]]
    ) -> List[Dict[str, Any]]:
        """
        去重搜索结果

        基于标题和年份的相似度去重
        """
        if not results:
            return []

        # 使用 id 作为唯一标识
        seen_ids = set()
        deduplicated = []

        for result in results:
            result_id = result.get("id")
            if result_id not in seen_ids:
                seen_ids.add(result_id)
                deduplicated.append(result)

        logger.info(
            f"Deduplicated {len(results)} results to {len(deduplicated)} unique items"
        )
        return deduplicated

    def _sort_by_relevance(
        self, results: List[Dict[str, Any]], query: str
    ) -> List[Dict[str, Any]]:
        """
        按相关性排序搜索结果

        排序因素：
        1. 标题匹配度
        2. 评分
        3. 热度/投票数
        """
        query_lower = query.lower()

        def calculate_score(result: Dict[str, Any]) -> float:
            score = 0.0

            # 标题匹配度（权重最高）
            title = (result.get("title") or "").lower()
            original_title = (result.get("original_title") or "").lower()

            # 完全匹配
            if query_lower == title or query_lower == original_title:
                score += 1000

            # 标题开头匹配
            elif title.startswith(query_lower) or original_title.startswith(
                query_lower
            ):
                score += 500

            # 包含匹配
            elif query_lower in title or query_lower in original_title:
                score += 300

            # 评分（0-10，权重中等）
            rating = result.get("rating")
            if rating:
                score += float(rating) * 10

            # 热度/投票数（权重较低）
            popularity = result.get("popularity")
            if popularity:
                score += min(float(popularity) / 100, 50)

            vote_count = result.get("vote_count")
            if vote_count:
                score += min(float(vote_count) / 1000, 30)

            return score

        sorted_results = sorted(
            results, key=calculate_score, reverse=True
        )

        logger.info(f"Sorted {len(results)} results by relevance")
        return sorted_results


# 创建全局实例
from app.core.cache import cache_manager

unified_search_service = UnifiedSearchService(cache_manager)

