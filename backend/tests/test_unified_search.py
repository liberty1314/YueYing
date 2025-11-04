"""
统一搜索服务测试

测试统一搜索服务的各项功能，包括并行API调用、结果合并、去重和排序
"""

import pytest
from unittest.mock import AsyncMock, patch, MagicMock

from app.services.unified_search import (
    UnifiedSearchService,
    ContentType,
    SearchSource,
)
from app.schemas.unified_search import UnifiedSearchResponse


# ==================== 测试数据 ====================

MOCK_TMDB_MOVIE_RESULT = {
    "results": [
        {
            "id": 550,
            "title": "搏击俱乐部",
            "original_title": "Fight Club",
            "overview": "一个抑郁的上班族和一个颓废的肥皂制造商...",
            "poster_path": "/pB8BM7pdSp6B6Ih7QZ4DrQ3PmJK.jpg",
            "backdrop_path": "/fCayJrkfRaCRCTh8GqN30f8oyQF.jpg",
            "release_date": "1999-10-15",
            "vote_average": 8.4,
            "vote_count": 26000,
            "popularity": 61.416,
            "original_language": "en",
            "adult": False,
            "genre_ids": [18, 53],
        }
    ]
}

MOCK_TMDB_TV_RESULT = {
    "results": [
        {
            "id": 1399,
            "name": "权力的游戏",
            "original_name": "Game of Thrones",
            "overview": "七个王国争夺铁王座...",
            "poster_path": "/u3bZgnGQ9T01sWNhyveQz0wH0Hl.jpg",
            "first_air_date": "2011-04-17",
            "vote_average": 8.3,
            "vote_count": 11504,
            "popularity": 369.594,
            "original_language": "en",
            "genre_ids": [18, 10765],
            "origin_country": ["US"],
        }
    ]
}

MOCK_BANGUMI_ANIME_RESULT = {
    "results": 1,
    "list": [
        {
            "id": 12345,
            "type": 2,
            "name": "鬼灭之刃",
            "name_cn": "鬼灭之刃",
            "summary": "讲述了主人公炭治郎...",
            "images": {
                "large": "https://lain.bgm.tv/pic/cover/l/12/34/12345.jpg",
                "common": "https://lain.bgm.tv/pic/cover/c/12/34/12345.jpg",
            },
            "air_date": "2019-04-06",
            "rating": {"score": 8.5, "total": 50000},
            "collection": {"collect": 40000},
            "eps": 26,
            "rank": 100,
        }
    ],
}

MOCK_GOOGLE_BOOKS_RESULT = {
    "items": [
        {
            "id": "abc123",
            "volumeInfo": {
                "title": "Python编程：从入门到实践",
                "subtitle": "第2版",
                "authors": ["埃里克·马瑟斯"],
                "publisher": "人民邮电出版社",
                "publishedDate": "2020-01",
                "description": "本书是一本针对所有层次的Python读者而作的...",
                "industryIdentifiers": [
                    {"type": "ISBN_13", "identifier": "9787115428028"}
                ],
                "pageCount": 459,
                "categories": ["Computers"],
                "averageRating": 4.5,
                "ratingsCount": 1500,
                "imageLinks": {
                    "thumbnail": "http://books.google.com/books/content?id=abc123&printsec=frontcover&img=1&zoom=1",
                    "smallThumbnail": "http://books.google.com/books/content?id=abc123&printsec=frontcover&img=1&zoom=5",
                },
                "language": "zh-CN",
            },
        }
    ]
}


# ==================== 服务测试 ====================


class TestUnifiedSearchService:
    """统一搜索服务测试"""

    @pytest.fixture
    def service(self):
        """创建测试服务实例"""
        from app.core.cache import cache_manager

        return UnifiedSearchService(cache_manager)

    @pytest.mark.asyncio
    async def test_search_all_types(self, service):
        """测试搜索所有类型"""
        with patch.object(
            service.tmdb, "search_movies", new_callable=AsyncMock
        ) as mock_movie, patch.object(
            service.tmdb, "search_tv_shows", new_callable=AsyncMock
        ) as mock_tv, patch.object(
            service.bangumi, "search_subjects", new_callable=AsyncMock
        ) as mock_bangumi, patch.object(
            service.google_books, "search_books", new_callable=AsyncMock
        ) as mock_books:

            mock_movie.return_value = MOCK_TMDB_MOVIE_RESULT
            mock_tv.return_value = MOCK_TMDB_TV_RESULT
            mock_bangumi.return_value = MOCK_BANGUMI_ANIME_RESULT
            mock_books.return_value = MOCK_GOOGLE_BOOKS_RESULT

            result = await service.search(
                query="测试", content_type=ContentType.ALL, max_results=20, page=1
            )

            assert result["query"] == "测试"
            assert result["content_type"] == ContentType.ALL
            assert result["total"] >= 4  # 至少有4个结果（每个来源1个）
            assert len(result["results"]) >= 4
            assert result["page"] == 1

            # 验证所有API都被调用了
            mock_movie.assert_called_once()
            mock_tv.assert_called_once()
            assert mock_bangumi.call_count == 1  # anime
            mock_books.assert_called_once()

    @pytest.mark.asyncio
    async def test_search_movie_only(self, service):
        """测试只搜索电影"""
        with patch.object(
            service.tmdb, "search_movies", new_callable=AsyncMock
        ) as mock_movie, patch.object(
            service.tmdb, "search_tv_shows", new_callable=AsyncMock
        ) as mock_tv:

            mock_movie.return_value = MOCK_TMDB_MOVIE_RESULT

            result = await service.search(
                query="搏击俱乐部", content_type=ContentType.MOVIE, max_results=20, page=1
            )

            assert result["query"] == "搏击俱乐部"
            assert result["content_type"] == ContentType.MOVIE
            assert len(result["results"]) >= 1

            # 只调用电影搜索
            mock_movie.assert_called_once()
            mock_tv.assert_not_called()

    @pytest.mark.asyncio
    async def test_normalize_tmdb_movie(self, service):
        """测试TMDB电影数据标准化"""
        movie = MOCK_TMDB_MOVIE_RESULT["results"][0]
        normalized = service._normalize_tmdb_movie(movie)

        assert normalized["id"] == "tmdb_movie_550"
        assert normalized["external_id"] == "550"
        assert normalized["source"] == SearchSource.TMDB
        assert normalized["content_type"] == ContentType.MOVIE
        assert normalized["title"] == "搏击俱乐部"
        assert normalized["original_title"] == "Fight Club"
        assert normalized["year"] == "1999"
        assert normalized["rating"] == 8.4
        assert "https://image.tmdb.org/t/p/w500" in normalized["poster_url"]

    @pytest.mark.asyncio
    async def test_normalize_google_book(self, service):
        """测试Google Books数据标准化"""
        book = MOCK_GOOGLE_BOOKS_RESULT["items"][0]
        normalized = service._normalize_google_book(book)

        assert normalized["id"] == "google_books_abc123"
        assert normalized["external_id"] == "abc123"
        assert normalized["source"] == SearchSource.GOOGLE_BOOKS
        assert normalized["content_type"] == ContentType.BOOK
        assert normalized["title"] == "Python编程：从入门到实践"
        assert normalized["year"] == "2020"
        assert normalized["rating"] == 4.5
        assert normalized["metadata"]["isbn"] == "9787115428028"
        assert "https://" in normalized["poster_url"]  # HTTP转HTTPS

    @pytest.mark.asyncio
    async def test_normalize_bangumi_subject(self, service):
        """测试Bangumi数据标准化"""
        subject = MOCK_BANGUMI_ANIME_RESULT["list"][0]
        normalized = service._normalize_bangumi_subject(subject, "anime")

        assert normalized["id"] == "bangumi_12345"
        assert normalized["external_id"] == "12345"
        assert normalized["source"] == SearchSource.BANGUMI
        assert normalized["content_type"] == "anime"
        assert normalized["title"] == "鬼灭之刃"
        assert normalized["year"] == "2019"
        assert normalized["rating"] == 8.5

    def test_deduplicate_results(self, service):
        """测试结果去重"""
        results = [
            {"id": "tmdb_movie_1", "title": "电影1"},
            {"id": "tmdb_movie_2", "title": "电影2"},
            {"id": "tmdb_movie_1", "title": "电影1"},  # 重复
            {"id": "tmdb_movie_3", "title": "电影3"},
        ]

        deduplicated = service._deduplicate_results(results)

        assert len(deduplicated) == 3
        ids = [r["id"] for r in deduplicated]
        assert "tmdb_movie_1" in ids
        assert "tmdb_movie_2" in ids
        assert "tmdb_movie_3" in ids

    def test_sort_by_relevance(self, service):
        """测试相关性排序"""
        results = [
            {
                "id": "1",
                "title": "Python高级编程",
                "rating": 7.0,
                "popularity": 100,
            },
            {
                "id": "2",
                "title": "Python编程",
                "rating": 8.0,
                "popularity": 200,
            },
            {"id": "3", "title": "编程入门", "rating": 6.0, "popularity": 50},
        ]

        sorted_results = service._sort_by_relevance(results, "Python编程")

        # "Python编程"应该排在第一位（标题完全匹配）
        assert sorted_results[0]["id"] == "2"
        assert sorted_results[0]["title"] == "Python编程"

    @pytest.mark.asyncio
    async def test_pagination(self, service):
        """测试分页功能"""
        with patch.object(
            service.tmdb, "search_movies", new_callable=AsyncMock
        ) as mock_movie:

            # 模拟返回多个结果
            mock_movie.return_value = {
                "results": [
                    {"id": i, "title": f"电影{i}", "overview": "", "vote_average": 7.0, "poster_path": None}
                    for i in range(1, 31)  # 30个结果
                ]
            }

            # 第1页，每页10个
            result_page1 = await service.search(
                query="电影", content_type=ContentType.MOVIE, max_results=10, page=1
            )

            assert result_page1["page"] == 1
            assert result_page1["page_size"] == 10
            assert len(result_page1["results"]) == 10
            assert result_page1["total_pages"] == 1  # API限制了max_results，所以只有10个结果

            # 第2页（由于只有10个结果，第2页应该是空的）
            result_page2 = await service.search(
                query="电影", content_type=ContentType.MOVIE, max_results=10, page=2
            )

            assert result_page2["page"] == 2
            assert len(result_page2["results"]) == 0  # 第2页没有结果

    @pytest.mark.asyncio
    async def test_handle_api_error(self, service):
        """测试API错误处理"""
        with patch.object(
            service.tmdb, "search_movies", new_callable=AsyncMock
        ) as mock_movie:

            # 模拟API错误
            mock_movie.side_effect = Exception("TMDB API error")

            # 应该继续执行，不抛出异常
            result = await service.search(
                query="测试", content_type=ContentType.MOVIE, max_results=20, page=1
            )

            # 结果应该为空（因为唯一的来源失败了）
            assert result["total"] == 0
            assert len(result["results"]) == 0


# ==================== API 路由测试 ====================


class TestUnifiedSearchRoutes:
    """统一搜索API路由测试"""

    def test_unified_search_route(self, client):
        """测试统一搜索路由"""
        with patch(
            "app.services.unified_search.unified_search_service.search",
            new_callable=AsyncMock,
        ) as mock_search:

            mock_search.return_value = {
                "query": "Python",
                "content_type": "all",
                "total": 2,
                "page": 1,
                "page_size": 20,
                "total_pages": 1,
                "results": [
                    {
                        "id": "google_books_abc123",
                        "external_id": "abc123",
                        "source": "google_books",
                        "content_type": "book",
                        "title": "Python编程",
                        "original_title": None,
                        "description": "Python入门书籍",
                        "poster_url": None,
                        "backdrop_url": None,
                        "release_date": "2020-01",
                        "year": "2020",
                        "rating": 4.5,
                        "vote_count": 1000,
                        "popularity": None,
                        "language": "zh-CN",
                        "metadata": {},
                    }
                ],
            }

            response = client.get("/api/search?q=Python&type=all&page=1&page_size=20")

            assert response.status_code == 200
            data = response.json()
            assert data["query"] == "Python"
            assert data["total"] == 2
            assert len(data["results"]) == 1
            assert data["results"][0]["title"] == "Python编程"

    def test_search_with_content_type_filter(self, client):
        """测试内容类型筛选"""
        with patch(
            "app.services.unified_search.unified_search_service.search",
            new_callable=AsyncMock,
        ) as mock_search:

            mock_search.return_value = {
                "query": "权力的游戏",
                "content_type": "tv",
                "total": 1,
                "page": 1,
                "page_size": 20,
                "total_pages": 1,
                "results": [],
            }

            response = client.get("/api/search?q=权力的游戏&type=tv")

            assert response.status_code == 200
            data = response.json()
            assert data["content_type"] == "tv"

    def test_search_stats_route(self, client):
        """测试搜索统计路由"""
        with patch(
            "app.services.unified_search.unified_search_service.search",
            new_callable=AsyncMock,
        ) as mock_search:

            mock_search.return_value = {
                "query": "测试",
                "content_type": "all",
                "total": 3,
                "page": 1,
                "page_size": 100,
                "total_pages": 1,
                "results": [
                    {"source": "tmdb", "content_type": "movie"},
                    {"source": "tmdb", "content_type": "tv"},
                    {"source": "google_books", "content_type": "book"},
                ],
            }

            response = client.get("/api/search/stats?q=测试")

            assert response.status_code == 200
            data = response.json()
            assert data["total_results"] == 3
            assert "tmdb" in data["results_by_source"]
            assert "google_books" in data["results_by_source"]
            assert "movie" in data["results_by_type"]
            assert "tv" in data["results_by_type"]
            assert "book" in data["results_by_type"]

    def test_invalid_query(self, client):
        """测试无效查询"""
        # 空查询
        response = client.get("/api/search?q=")
        assert response.status_code == 422  # Validation error


if __name__ == "__main__":
    pytest.main([__file__, "-v"])

