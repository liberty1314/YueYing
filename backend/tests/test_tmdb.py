"""
TMDB API 测试

测试 TMDB API 客户端和路由
"""

import pytest
from unittest.mock import AsyncMock, patch, MagicMock
from fastapi.testclient import TestClient

from app.main import app
from app.services.external_apis.tmdb import TMDBClient


@pytest.fixture
def client():
    """测试客户端"""
    return TestClient(app)


@pytest.fixture
def tmdb_client():
    """TMDB 客户端实例"""
    return TMDBClient(api_key="test_api_key")


# ==================== 客户端测试 ====================

class TestTMDBClient:
    """TMDB 客户端测试"""

    @pytest.mark.asyncio
    async def test_init_with_api_key(self):
        """测试使用 API key 初始化"""
        client = TMDBClient(api_key="custom_key")
        assert client.api_key == "custom_key"
        await client.close()

    @pytest.mark.asyncio
    async def test_build_image_url(self, tmdb_client):
        """测试构建图片 URL"""
        url = tmdb_client._build_image_url("/path/to/image.jpg", "w500")
        assert url == "https://image.tmdb.org/t/p/w500/path/to/image.jpg"
        
        # 测试空路径
        url = tmdb_client._build_image_url(None, "w500")
        assert url is None
        
        await tmdb_client.close()

    @pytest.mark.asyncio
    async def test_get_poster_url(self, tmdb_client):
        """测试获取海报 URL"""
        url = tmdb_client.get_poster_url("/poster.jpg")
        assert "w500" in url
        assert "/poster.jpg" in url
        
        await tmdb_client.close()

    @pytest.mark.asyncio
    async def test_get_backdrop_url(self, tmdb_client):
        """测试获取背景图 URL"""
        url = tmdb_client.get_backdrop_url("/backdrop.jpg")
        assert "original" in url
        assert "/backdrop.jpg" in url
        
        await tmdb_client.close()

    @pytest.mark.asyncio
    async def test_context_manager(self):
        """测试异步上下文管理器"""
        async with TMDBClient(api_key="test_key") as client:
            assert client.api_key == "test_key"
            assert client.client is not None


# ==================== API 路由测试 ====================

class TestTMDBRoutes:
    """TMDB API 路由测试"""

    @patch('app.services.external_apis.tmdb.tmdb_client.search_movies')
    def test_search_movies(self, mock_search, client):
        """测试电影搜索路由"""
        # Mock 返回数据
        mock_search.return_value = {
            "page": 1,
            "results": [
                {
                    "id": 550,
                    "title": "搏击俱乐部",
                    "original_title": "Fight Club",
                    "overview": "电影简介",
                    "poster_path": "/poster.jpg",
                    "backdrop_path": "/backdrop.jpg",
                    "release_date": "1999-10-15",
                    "genre_ids": [18, 53],
                    "popularity": 61.416,
                    "vote_average": 8.4,
                    "vote_count": 23000,
                    "adult": False,
                    "original_language": "en",
                    "video": False,
                }
            ],
            "total_pages": 1,
            "total_results": 1,
        }

        response = client.get("/api/tmdb/movies/search?query=搏击俱乐部")
        assert response.status_code == 200
        data = response.json()
        assert data["page"] == 1
        assert len(data["results"]) == 1
        assert data["results"][0]["title"] == "搏击俱乐部"

    @patch('app.services.external_apis.tmdb.tmdb_client.get_movie_details')
    def test_get_movie_details(self, mock_details, client):
        """测试获取电影详情路由"""
        # Mock 返回数据
        mock_details.return_value = {
            "id": 550,
            "title": "搏击俱乐部",
            "original_title": "Fight Club",
            "overview": "电影简介",
            "poster_path": "/poster.jpg",
            "backdrop_path": "/backdrop.jpg",
            "release_date": "1999-10-15",
            "genres": [{"id": 18, "name": "剧情"}, {"id": 53, "name": "惊悚"}],
            "runtime": 139,
            "status": "Released",
            "tagline": "Mischief. Mayhem. Soap.",
            "vote_average": 8.4,
            "vote_count": 23000,
            "budget": 63000000,
            "revenue": 100853753,
            "adult": False,
            "original_language": "en",
            "popularity": 61.416,
            "video": False,
            "homepage": "http://www.foxmovies.com/movies/fight-club",
            "imdb_id": "tt0137523",
            "production_companies": [],
            "production_countries": [],
            "spoken_languages": [],
        }

        response = client.get("/api/tmdb/movies/550")
        assert response.status_code == 200
        data = response.json()
        assert data["id"] == 550
        assert data["title"] == "搏击俱乐部"
        assert data["runtime"] == 139

    @patch('app.services.external_apis.tmdb.tmdb_client.search_tv_shows')
    def test_search_tv_shows(self, mock_search, client):
        """测试剧集搜索路由"""
        # Mock 返回数据
        mock_search.return_value = {
            "page": 1,
            "results": [
                {
                    "id": 1396,
                    "name": "绝命毒师",
                    "original_name": "Breaking Bad",
                    "overview": "剧集简介",
                    "poster_path": "/poster.jpg",
                    "backdrop_path": "/backdrop.jpg",
                    "first_air_date": "2008-01-20",
                    "origin_country": ["US"],
                    "genre_ids": [18, 80],
                    "popularity": 272.119,
                    "vote_average": 8.9,
                    "vote_count": 11000,
                    "original_language": "en",
                }
            ],
            "total_pages": 1,
            "total_results": 1,
        }

        response = client.get("/api/tmdb/tv/search?query=绝命毒师")
        assert response.status_code == 200
        data = response.json()
        assert data["page"] == 1
        assert len(data["results"]) == 1
        assert data["results"][0]["name"] == "绝命毒师"

    @patch('app.services.external_apis.tmdb.tmdb_client.get_tv_details')
    def test_get_tv_details(self, mock_details, client):
        """测试获取剧集详情路由"""
        # Mock 返回数据
        mock_details.return_value = {
            "id": 1396,
            "name": "绝命毒师",
            "original_name": "Breaking Bad",
            "overview": "剧集简介",
            "poster_path": "/poster.jpg",
            "backdrop_path": "/backdrop.jpg",
            "first_air_date": "2008-01-20",
            "last_air_date": "2013-09-29",
            "genres": [{"id": 18, "name": "剧情"}, {"id": 80, "name": "犯罪"}],
            "number_of_episodes": 62,
            "number_of_seasons": 5,
            "status": "Ended",
            "type": "Scripted",
            "vote_average": 8.9,
            "vote_count": 11000,
            "popularity": 272.119,
            "origin_country": ["US"],
            "original_language": "en",
            "homepage": "http://www.amc.com/shows/breaking-bad",
            "in_production": False,
            "languages": ["en", "es"],
            "created_by": [],
            "episode_run_time": [45, 47],
            "networks": [],
            "production_companies": [],
            "production_countries": [],
            "seasons": [],
            "spoken_languages": [],
            "tagline": "All Bad Things Must Come to an End",
        }

        response = client.get("/api/tmdb/tv/1396")
        assert response.status_code == 200
        data = response.json()
        assert data["id"] == 1396
        assert data["name"] == "绝命毒师"
        assert data["number_of_seasons"] == 5

    @patch('app.services.external_apis.tmdb.tmdb_client.get_popular_movies')
    def test_get_popular_movies(self, mock_popular, client):
        """测试获取热门电影路由"""
        mock_popular.return_value = {
            "page": 1,
            "results": [],
            "total_pages": 1,
            "total_results": 0,
        }

        response = client.get("/api/tmdb/movies/popular")
        assert response.status_code == 200
        data = response.json()
        assert data["page"] == 1

    @patch('app.services.external_apis.tmdb.tmdb_client.get_top_rated_movies')
    def test_get_top_rated_movies(self, mock_top_rated, client):
        """测试获取高分电影路由"""
        mock_top_rated.return_value = {
            "page": 1,
            "results": [],
            "total_pages": 1,
            "total_results": 0,
        }

        response = client.get("/api/tmdb/movies/top-rated")
        assert response.status_code == 200
        data = response.json()
        assert data["page"] == 1

    def test_search_movies_invalid_query(self, client):
        """测试无效搜索关键词"""
        response = client.get("/api/tmdb/movies/search?query=")
        assert response.status_code == 422  # Validation error

    def test_search_movies_invalid_page(self, client):
        """测试无效页码"""
        response = client.get("/api/tmdb/movies/search?query=test&page=0")
        assert response.status_code == 422  # Validation error

    @patch('app.services.external_apis.tmdb.tmdb_client.get_configuration')
    def test_get_configuration(self, mock_config, client):
        """测试获取配置路由"""
        mock_config.return_value = {
            "images": {
                "base_url": "http://image.tmdb.org/t/p/",
                "secure_base_url": "https://image.tmdb.org/t/p/",
                "backdrop_sizes": ["w300", "w780", "w1280", "original"],
                "logo_sizes": ["w45", "w92", "w154", "w185", "w300", "w500", "original"],
                "poster_sizes": ["w92", "w154", "w185", "w342", "w500", "w780", "original"],
                "profile_sizes": ["w45", "w185", "h632", "original"],
                "still_sizes": ["w92", "w185", "w300", "original"],
            },
            "change_keys": [],
        }

        response = client.get("/api/tmdb/configuration")
        assert response.status_code == 200
        data = response.json()
        assert "images" in data
        assert "base_url" in data["images"]


# ==================== 集成测试 ====================

@pytest.mark.integration
class TestTMDBIntegration:
    """TMDB API 集成测试（需要真实 API key）"""

    @pytest.mark.asyncio
    async def test_real_movie_search(self):
        """测试真实电影搜索"""
        async with TMDBClient() as client:
            result = await client.search_movies("The Matrix")
            assert result["page"] == 1
            assert len(result["results"]) > 0
            # 检查结果中包含 Matrix 相关电影
            titles = [movie["title"] for movie in result["results"]]
            assert any("Matrix" in title for title in titles)

    @pytest.mark.asyncio
    async def test_real_movie_details(self):
        """测试真实电影详情"""
        async with TMDBClient() as client:
            # The Matrix movie ID
            result = await client.get_movie_details(603)
            assert result["id"] == 603
            # 支持中文或英文标题
            assert "Matrix" in result["title"] or "黑客帝国" in result["title"]
            assert result["runtime"] > 0

    @pytest.mark.asyncio
    async def test_real_tv_search(self):
        """测试真实剧集搜索"""
        async with TMDBClient() as client:
            result = await client.search_tv_shows("Breaking Bad")
            assert result["page"] == 1
            assert len(result["results"]) > 0

    @pytest.mark.asyncio
    async def test_real_tv_details(self):
        """测试真实剧集详情"""
        async with TMDBClient() as client:
            # Breaking Bad TV ID
            result = await client.get_tv_details(1396)
            assert result["id"] == 1396
            # 支持中文或英文标题
            assert "Breaking Bad" in result["name"] or "绝命毒师" in result["name"]
            assert result["number_of_seasons"] > 0

