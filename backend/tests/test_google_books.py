"""
Google Books API 集成测试

测试 Google Books API 客户端和路由功能
"""

import pytest
from unittest.mock import AsyncMock, patch, MagicMock
from httpx import Response

from app.services.external_apis.google_books import GoogleBooksClient
from app.schemas.google_books import (
    BooksSearchResponse,
    BookVolume,
    SimpleBooksSearchResponse,
)


# ==================== 测试数据 ====================

MOCK_SEARCH_RESPONSE = {
    "kind": "books#volumes",
    "totalItems": 2,
    "items": [
        {
            "kind": "books#volume",
            "id": "test-volume-1",
            "etag": "test-etag",
            "selfLink": "https://www.googleapis.com/books/v1/volumes/test-volume-1",
            "volumeInfo": {
                "title": "Python编程：从入门到实践",
                "authors": ["埃里克·马瑟斯"],
                "publisher": "人民邮电出版社",
                "publishedDate": "2016-07",
                "description": "Python编程入门经典",
                "industryIdentifiers": [
                    {"type": "ISBN_13", "identifier": "9787115428028"},
                    {"type": "ISBN_10", "identifier": "7115428026"},
                ],
                "pageCount": 459,
                "categories": ["计算机"],
                "averageRating": 4.5,
                "ratingsCount": 100,
                "language": "zh-CN",
                "imageLinks": {
                    "smallThumbnail": "http://example.com/small.jpg",
                    "thumbnail": "http://example.com/thumb.jpg",
                },
                "previewLink": "http://books.google.com/preview",
            },
        },
        {
            "kind": "books#volume",
            "id": "test-volume-2",
            "etag": "test-etag-2",
            "selfLink": "https://www.googleapis.com/books/v1/volumes/test-volume-2",
            "volumeInfo": {
                "title": "流畅的Python",
                "authors": ["卢西亚诺·拉马略"],
                "publisher": "人民邮电出版社",
                "publishedDate": "2017-05",
                "description": "Python高级编程",
                "pageCount": 770,
                "language": "zh-CN",
            },
        },
    ],
}

MOCK_VOLUME_RESPONSE = {
    "kind": "books#volume",
    "id": "test-volume-1",
    "etag": "test-etag",
    "selfLink": "https://www.googleapis.com/books/v1/volumes/test-volume-1",
    "volumeInfo": {
        "title": "Python编程：从入门到实践",
        "authors": ["埃里克·马瑟斯"],
        "publisher": "人民邮电出版社",
        "publishedDate": "2016-07",
        "description": "Python编程入门经典",
        "industryIdentifiers": [
            {"type": "ISBN_13", "identifier": "9787115428028"},
        ],
        "pageCount": 459,
        "categories": ["计算机"],
        "averageRating": 4.5,
        "ratingsCount": 100,
        "language": "zh-CN",
        "previewLink": "http://books.google.com/preview",
    },
}


# ==================== 客户端测试 ====================


class TestGoogleBooksClient:
    """Google Books 客户端测试"""

    @pytest.fixture
    def client(self):
        """创建测试客户端"""
        return GoogleBooksClient(api_key="test-api-key")

    @pytest.mark.asyncio
    async def test_client_initialization(self, client):
        """测试客户端初始化"""
        assert client.api_key == "test-api-key"
        assert client.BASE_URL == "https://www.googleapis.com/books/v1"

    @pytest.mark.asyncio
    async def test_context_manager(self):
        """测试异步上下文管理器"""
        async with GoogleBooksClient(api_key="test-key") as client:
            assert client is not None
            assert client.api_key == "test-key"

    @pytest.mark.asyncio
    async def test_search_books(self, client):
        """测试搜索书籍"""
        with patch.object(client, "_request", new_callable=AsyncMock) as mock_request:
            mock_request.return_value = MOCK_SEARCH_RESPONSE

            result = await client.search_books(
                query="Python编程",
                start_index=0,
                max_results=10,
            )

            assert result["totalItems"] == 2
            assert len(result["items"]) == 2
            assert result["items"][0]["volumeInfo"]["title"] == "Python编程：从入门到实践"

            # 验证调用参数
            mock_request.assert_called_once()
            call_args = mock_request.call_args
            assert call_args[0][0] == "GET"
            assert call_args[0][1] == "/volumes"
            assert call_args[1]["params"]["q"] == "Python编程"

    @pytest.mark.asyncio
    async def test_get_volume_details(self, client):
        """测试获取书籍详情"""
        with patch.object(client, "_request", new_callable=AsyncMock) as mock_request:
            mock_request.return_value = MOCK_VOLUME_RESPONSE

            result = await client.get_volume_details("test-volume-1")

            assert result["id"] == "test-volume-1"
            assert result["volumeInfo"]["title"] == "Python编程：从入门到实践"

            # 验证调用参数
            mock_request.assert_called_once_with("GET", "/volumes/test-volume-1")

    @pytest.mark.asyncio
    async def test_search_by_isbn(self, client):
        """测试 ISBN 搜索"""
        with patch.object(client, "search_books", new_callable=AsyncMock) as mock_search:
            mock_search.return_value = MOCK_SEARCH_RESPONSE

            result = await client.search_by_isbn("9787115428028")

            assert result["totalItems"] == 2
            mock_search.assert_called_once_with("isbn:9787115428028", max_results=1)

    @pytest.mark.asyncio
    async def test_search_by_title(self, client):
        """测试标题搜索"""
        with patch.object(client, "search_books", new_callable=AsyncMock) as mock_search:
            mock_search.return_value = MOCK_SEARCH_RESPONSE

            result = await client.search_by_title(
                title="Python编程",
                author="马瑟斯",
                max_results=10,
            )

            assert result["totalItems"] == 2
            mock_search.assert_called_once()
            call_args = mock_search.call_args
            assert "intitle:Python编程" in call_args[0][0]
            assert "inauthor:马瑟斯" in call_args[0][0]

    @pytest.mark.asyncio
    async def test_search_by_author(self, client):
        """测试作者搜索"""
        with patch.object(client, "search_books", new_callable=AsyncMock) as mock_search:
            mock_search.return_value = MOCK_SEARCH_RESPONSE

            result = await client.search_by_author("埃里克·马瑟斯")

            assert result["totalItems"] == 2
            mock_search.assert_called_once()
            call_args = mock_search.call_args
            assert "inauthor:埃里克·马瑟斯" in call_args[0][0]

    @pytest.mark.asyncio
    async def test_search_by_category(self, client):
        """测试分类搜索"""
        with patch.object(client, "search_books", new_callable=AsyncMock) as mock_search:
            mock_search.return_value = MOCK_SEARCH_RESPONSE

            result = await client.search_by_category("计算机")

            assert result["totalItems"] == 2
            mock_search.assert_called_once()
            call_args = mock_search.call_args
            assert "subject:计算机" in call_args[0][0]

    def test_extract_isbn(self, client):
        """测试提取 ISBN"""
        identifiers = [
            {"type": "ISBN_13", "identifier": "9787115428028"},
            {"type": "ISBN_10", "identifier": "7115428026"},
        ]

        isbn = client.extract_isbn_from_identifiers(identifiers)
        assert isbn == "9787115428028"  # 优先返回 ISBN_13

        # 测试只有 ISBN_10
        identifiers = [{"type": "ISBN_10", "identifier": "7115428026"}]
        isbn = client.extract_isbn_from_identifiers(identifiers)
        assert isbn == "7115428026"

        # 测试空列表
        isbn = client.extract_isbn_from_identifiers([])
        assert isbn is None

    def test_get_thumbnail_url(self, client):
        """测试获取缩略图 URL"""
        image_links = {
            "smallThumbnail": "http://example.com/small.jpg",
            "thumbnail": "http://example.com/thumb.jpg",
            "large": "http://example.com/large.jpg",
        }

        # 测试优先大图
        url = client.get_thumbnail_url(image_links, prefer_large=True)
        assert url == "http://example.com/large.jpg"

        # 测试优先小图
        url = client.get_thumbnail_url(image_links, prefer_large=False)
        assert url == "http://example.com/thumb.jpg"

        # 测试空字典
        url = client.get_thumbnail_url({})
        assert url is None


# ==================== API 路由测试 ====================


class TestGoogleBooksRoutes:
    """Google Books API 路由测试"""

    def test_search_books_route(self, client):
        """测试搜索书籍路由"""
        with patch(
            "app.api.routes.google_books.google_books_client.search_books",
            new_callable=AsyncMock,
        ) as mock_search:
            mock_search.return_value = MOCK_SEARCH_RESPONSE

            response = client.get(
                "/api/google-books/search",
                params={"query": "Python编程", "max_results": 10},
            )

            assert response.status_code == 200
            data = response.json()
            assert data["total"] == 2
            assert len(data["items"]) == 2
            assert data["items"][0]["title"] == "Python编程：从入门到实践"

    def test_search_by_isbn_route(self, client):
        """测试 ISBN 搜索路由"""
        with patch(
            "app.api.routes.google_books.google_books_client.search_by_isbn",
            new_callable=AsyncMock,
        ) as mock_search:
            mock_search.return_value = MOCK_SEARCH_RESPONSE

            response = client.get(
                "/api/google-books/search/isbn",
                params={"isbn": "9787115428028"},
            )

            assert response.status_code == 200
            data = response.json()
            assert data["total"] == 2

    def test_search_by_title_route(self, client):
        """测试标题搜索路由"""
        with patch(
            "app.api.routes.google_books.google_books_client.search_by_title",
            new_callable=AsyncMock,
        ) as mock_search:
            mock_search.return_value = MOCK_SEARCH_RESPONSE

            response = client.get(
                "/api/google-books/search/title",
                params={"title": "Python编程", "author": "马瑟斯"},
            )

            assert response.status_code == 200
            data = response.json()
            assert data["total"] == 2

    def test_get_volume_details_route(self, client):
        """测试获取书籍详情路由"""
        with patch(
            "app.api.routes.google_books.google_books_client.get_volume_details",
            new_callable=AsyncMock,
        ) as mock_get:
            mock_get.return_value = MOCK_VOLUME_RESPONSE

            response = client.get("/api/google-books/volumes/test-volume-1")

            assert response.status_code == 200
            data = response.json()
            assert data["id"] == "test-volume-1"
            assert data["volumeInfo"]["title"] == "Python编程：从入门到实践"


# ==================== Schema 测试 ====================


class TestGoogleBooksSchemas:
    """Google Books Schemas 测试"""

    def test_books_search_response_schema(self):
        """测试搜索响应 Schema"""
        response = BooksSearchResponse(**MOCK_SEARCH_RESPONSE)
        
        assert response.kind == "books#volumes"
        assert response.totalItems == 2
        assert len(response.items) == 2
        assert response.items[0].volumeInfo.title == "Python编程：从入门到实践"

    def test_book_volume_schema(self):
        """测试书籍卷 Schema"""
        volume = BookVolume(**MOCK_VOLUME_RESPONSE)
        
        assert volume.id == "test-volume-1"
        assert volume.volumeInfo.title == "Python编程：从入门到实践"
        assert volume.volumeInfo.authors == ["埃里克·马瑟斯"]
        assert volume.volumeInfo.pageCount == 459

    def test_simple_books_search_response(self):
        """测试简化的搜索响应"""
        response = BooksSearchResponse(**MOCK_SEARCH_RESPONSE)
        simple_response = SimpleBooksSearchResponse.from_search_response(response)
        
        assert simple_response.total == 2
        assert len(simple_response.items) == 2
        assert simple_response.items[0].title == "Python编程：从入门到实践"
        assert simple_response.items[0].isbn_13 == "9787115428028"
        assert simple_response.items[0].isbn_10 == "7115428026"
        assert simple_response.items[0].thumbnail == "http://example.com/thumb.jpg"


# ==================== 集成测试（可选）====================


@pytest.mark.integration
@pytest.mark.asyncio
class TestGoogleBooksIntegration:
    """Google Books API 集成测试（需要真实 API Key）
    
    使用 pytest -m integration 运行集成测试
    """

    @pytest.mark.skip(reason="需要真实的 Google Books API Key")
    async def test_real_search(self):
        """测试真实的搜索请求"""
        async with GoogleBooksClient() as client:
            result = await client.search_books("Python编程", max_results=5)
            assert result["totalItems"] > 0
            assert "items" in result

    @pytest.mark.skip(reason="需要真实的 Google Books API Key")
    async def test_real_volume_details(self):
        """测试真实的详情请求"""
        async with GoogleBooksClient() as client:
            # 先搜索获取一个真实的 volume ID
            search_result = await client.search_books("Python", max_results=1)
            if search_result["totalItems"] > 0:
                volume_id = search_result["items"][0]["id"]
                result = await client.get_volume_details(volume_id)
                assert "volumeInfo" in result


if __name__ == "__main__":
    pytest.main([__file__, "-v"])

