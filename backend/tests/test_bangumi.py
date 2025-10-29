"""
Bangumi API 集成测试

测试 Bangumi API 客户端和路由功能
"""

import pytest
from unittest.mock import AsyncMock, patch, MagicMock
from httpx import Response

from app.services.external_apis.bangumi import BangumiClient
from app.schemas.bangumi import (
    BangumiSearchResult,
    BangumiSubject,
    SimpleSearchResponse,
    BangumiEpisode,
)


# ==================== 测试数据 ====================

MOCK_SEARCH_RESPONSE = {
    "results": 2,
    "list": [
        {
            "id": 12345,
            "type": 2,
            "name": "鬼灭之刃",
            "name_cn": "鬼灭之刃",
            "summary": "讲述了主人公炭治郎为了寻找杀害家人的鬼...",
            "eps": 26,
            "eps_count": 26,
            "air_date": "2019-04-06",
            "air_weekday": 6,
            "images": {
                "large": "https://lain.bgm.tv/pic/cover/l/12/34/12345_abcde.jpg",
                "common": "https://lain.bgm.tv/pic/cover/c/12/34/12345_abcde.jpg",
                "medium": "https://lain.bgm.tv/pic/cover/m/12/34/12345_abcde.jpg",
                "small": "https://lain.bgm.tv/pic/cover/s/12/34/12345_abcde.jpg",
                "grid": "https://lain.bgm.tv/pic/cover/g/12/34/12345_abcde.jpg",
            },
            "rating": {
                "total": 50000,
                "count": {
                    "1": 100,
                    "2": 200,
                    "3": 500,
                    "4": 2000,
                    "5": 10000,
                    "6": 15000,
                    "7": 12000,
                    "8": 8000,
                    "9": 1500,
                    "10": 700,
                },
                "score": 8.5,
            },
            "rank": 100,
            "collection": {
                "wish": 5000,
                "collect": 40000,
                "doing": 3000,
                "on_hold": 1500,
                "dropped": 500,
            },
            "url": "https://bgm.tv/subject/12345",
        },
        {
            "id": 67890,
            "type": 2,
            "name": "进击的巨人",
            "name_cn": "进击的巨人",
            "summary": "人类与巨人的战斗故事...",
            "eps": 25,
            "air_date": "2013-04-07",
            "images": {
                "large": "https://lain.bgm.tv/pic/cover/l/67/89/67890_xyz.jpg",
            },
            "rating": {"total": 60000, "count": {}, "score": 8.8},
            "rank": 50,
        },
    ],
}

MOCK_SUBJECT_RESPONSE = {
    "id": 12345,
    "type": 2,
    "name": "鬼灭之刃",
    "name_cn": "鬼灭之刃",
    "summary": "讲述了主人公炭治郎为了寻找杀害家人的鬼，踏上成为鬼杀队队员的道路...",
    "eps": 26,
    "air_date": "2019-04-06",
    "air_weekday": 6,
    "images": {
        "large": "https://lain.bgm.tv/pic/cover/l/12/34/12345_abcde.jpg",
        "common": "https://lain.bgm.tv/pic/cover/c/12/34/12345_abcde.jpg",
    },
    "rating": {"total": 50000, "count": {}, "score": 8.5},
    "rank": 100,
    "collection": {
        "wish": 5000,
        "collect": 40000,
        "doing": 3000,
        "on_hold": 1500,
        "dropped": 500,
    },
    "url": "https://bgm.tv/subject/12345",
}

MOCK_EPISODES_RESPONSE = {
    "total": 26,
    "limit": 100,
    "offset": 0,
    "data": [
        {
            "id": 111111,
            "type": 0,
            "name": "残酷",
            "name_cn": "第1话 残酷",
            "sort": 1.0,
            "ep": 1,
            "airdate": "2019-04-06",
            "comment": 500,
            "duration": "00:24:00",
            "desc": "第1话",
            "disc": 1,
        },
        {
            "id": 111112,
            "type": 0,
            "name": "育手鬼",
            "name_cn": "第2话 育手鬼",
            "sort": 2.0,
            "ep": 2,
            "airdate": "2019-04-13",
            "comment": 450,
            "duration": "00:24:00",
            "desc": "第2话",
            "disc": 1,
        },
    ],
}

MOCK_CALENDAR_RESPONSE = [
    {
        "weekday": {"en": "Saturday", "cn": "星期六", "ja": "土曜日", "id": 6},
        "items": [
            {
                "id": 12345,
                "type": 2,
                "name": "鬼灭之刃",
                "name_cn": "鬼灭之刃",
                "summary": "",
                "images": {"large": "https://lain.bgm.tv/pic/cover/l/12/34/12345_abcde.jpg"},
                "air_date": "2019-04-06",
                "air_weekday": 6,
            }
        ],
    }
]


# ==================== 客户端测试 ====================


class TestBangumiClient:
    """Bangumi 客户端测试"""

    @pytest.fixture
    def client(self):
        """创建测试客户端"""
        return BangumiClient(api_key="test-api-key")

    @pytest.mark.asyncio
    async def test_client_initialization(self, client):
        """测试客户端初始化"""
        assert client.api_key == "test-api-key"
        assert client.BASE_URL == "https://api.bgm.tv"

    @pytest.mark.asyncio
    async def test_context_manager(self):
        """测试异步上下文管理器"""
        async with BangumiClient(api_key="test-key") as client:
            assert client is not None
            assert client.api_key == "test-key"

    @pytest.mark.asyncio
    async def test_search_subjects(self, client):
        """测试搜索条目"""
        with patch.object(client, "_request", new_callable=AsyncMock) as mock_request:
            mock_request.return_value = MOCK_SEARCH_RESPONSE

            result = await client.search_subjects(
                keyword="鬼灭之刃",
                type=2,
                max_results=25,
            )

            assert result["results"] == 2
            assert len(result["list"]) == 2
            assert result["list"][0]["name"] == "鬼灭之刃"

            # 验证调用参数
            mock_request.assert_called_once()
            call_args = mock_request.call_args
            assert call_args[0][0] == "GET"
            assert "鬼灭之刃" in call_args[0][1]

    @pytest.mark.asyncio
    async def test_get_subject_details(self, client):
        """测试获取条目详情"""
        with patch.object(client, "_request", new_callable=AsyncMock) as mock_request:
            mock_request.return_value = MOCK_SUBJECT_RESPONSE

            result = await client.get_subject_details(12345)

            assert result["id"] == 12345
            assert result["name"] == "鬼灭之刃"
            assert result["type"] == 2

            # 验证调用参数
            mock_request.assert_called_once()
            call_args = mock_request.call_args
            assert "12345" in call_args[0][1]

    @pytest.mark.asyncio
    async def test_get_subject_episodes(self, client):
        """测试获取章节列表"""
        with patch.object(client, "_request", new_callable=AsyncMock) as mock_request:
            mock_request.return_value = MOCK_EPISODES_RESPONSE

            result = await client.get_subject_episodes(12345)

            assert result["total"] == 26
            assert len(result["data"]) == 2
            assert result["data"][0]["name"] == "残酷"

    @pytest.mark.asyncio
    async def test_get_calendar(self, client):
        """测试获取每日放送"""
        with patch.object(client, "_request", new_callable=AsyncMock) as mock_request:
            mock_request.return_value = MOCK_CALENDAR_RESPONSE

            result = await client.get_calendar()

            assert len(result) == 1
            assert result[0]["weekday"]["cn"] == "星期六"
            assert len(result[0]["items"]) == 1

    def test_get_image_url(self, client):
        """测试图片 URL 生成"""
        # 测试完整 URL
        full_url = "https://lain.bgm.tv/pic/cover/l/12/34/12345.jpg"
        assert client.get_image_url(full_url) == full_url

        # 测试路径转换
        path = "/pic/cover/l/12/34/12345.jpg"
        expected = "https://lain.bgm.tv/pic/cover/l/12/34/12345.jpg"
        assert client.get_image_url(path, "large") == expected

        # 测试尺寸替换
        path_medium = "/pic/cover/m/12/34/12345.jpg"
        expected_large = "https://lain.bgm.tv/pic/cover/l/12/34/12345.jpg"
        assert client.get_image_url(path_medium, "large") == expected_large

        # 测试空路径
        assert client.get_image_url("") == ""

    def test_get_subject_type_name(self, client):
        """测试类型名称获取"""
        assert client.get_subject_type_name(1) == "书籍"
        assert client.get_subject_type_name(2) == "动画"
        assert client.get_subject_type_name(3) == "音乐"
        assert client.get_subject_type_name(4) == "游戏"
        assert client.get_subject_type_name(6) == "三次元"
        assert client.get_subject_type_name(99) == "未知"


# ==================== API 路由测试 ====================


class TestBangumiRoutes:
    """Bangumi API 路由测试"""

    def test_search_subjects_route(self, client):
        """测试搜索条目路由"""
        with patch(
            "app.api.routes.bangumi.bangumi_client.search_subjects",
            new_callable=AsyncMock,
        ) as mock_search:
            mock_search.return_value = MOCK_SEARCH_RESPONSE

            response = client.get(
                "/api/bangumi/search",
                params={"keyword": "鬼灭之刃", "type": 2, "max_results": 25},
            )

            assert response.status_code == 200
            data = response.json()
            assert data["total"] == 2
            assert len(data["items"]) == 2
            assert data["items"][0]["name"] == "鬼灭之刃"

    def test_search_anime_route(self, client):
        """测试搜索动画路由"""
        with patch(
            "app.api.routes.bangumi.bangumi_client.search_subjects",
            new_callable=AsyncMock,
        ) as mock_search:
            mock_search.return_value = MOCK_SEARCH_RESPONSE

            response = client.get(
                "/api/bangumi/search/anime",
                params={"keyword": "鬼灭之刃"},
            )

            assert response.status_code == 200
            data = response.json()
            assert data["total"] == 2

    def test_get_subject_details_route(self, client):
        """测试获取条目详情路由"""
        with patch(
            "app.api.routes.bangumi.bangumi_client.get_subject_details",
            new_callable=AsyncMock,
        ) as mock_get:
            mock_get.return_value = MOCK_SUBJECT_RESPONSE

            response = client.get("/api/bangumi/subjects/12345")

            assert response.status_code == 200
            data = response.json()
            assert data["id"] == 12345
            assert data["name"] == "鬼灭之刃"

    def test_get_subject_episodes_route(self, client):
        """测试获取章节列表路由"""
        with patch(
            "app.api.routes.bangumi.bangumi_client.get_subject_episodes",
            new_callable=AsyncMock,
        ) as mock_get:
            mock_get.return_value = MOCK_EPISODES_RESPONSE

            response = client.get("/api/bangumi/subjects/12345/episodes")

            assert response.status_code == 200
            data = response.json()
            assert len(data) == 2
            assert data[0]["name"] == "残酷"

    def test_get_calendar_route(self, client):
        """测试获取每日放送路由"""
        with patch(
            "app.api.routes.bangumi.bangumi_client.get_calendar",
            new_callable=AsyncMock,
        ) as mock_get:
            mock_get.return_value = MOCK_CALENDAR_RESPONSE

            response = client.get("/api/bangumi/calendar")

            assert response.status_code == 200
            data = response.json()
            assert len(data) == 1
            assert len(data[0]["items"]) == 1


# ==================== Schema 测试 ====================


class TestBangumiSchemas:
    """Bangumi Schemas 测试"""

    def test_search_result_schema(self):
        """测试搜索结果 Schema"""
        result = BangumiSearchResult(**MOCK_SEARCH_RESPONSE)

        assert result.results == 2
        assert len(result.list) == 2
        assert result.list[0].name == "鬼灭之刃"

    def test_subject_schema(self):
        """测试条目 Schema"""
        subject = BangumiSubject(**MOCK_SUBJECT_RESPONSE)

        assert subject.id == 12345
        assert subject.name == "鬼灭之刃"
        assert subject.type == 2
        assert subject.rating.score == 8.5

    def test_simple_search_response(self):
        """测试简化的搜索响应"""
        result = BangumiSearchResult(**MOCK_SEARCH_RESPONSE)
        simple_response = SimpleSearchResponse.from_search_result(result)

        assert simple_response.total == 2
        assert len(simple_response.items) == 2
        assert simple_response.items[0].name == "鬼灭之刃"
        assert simple_response.items[0].type_name == "动画"
        assert simple_response.items[0].rating_score == 8.5

    def test_episode_schema(self):
        """测试章节 Schema"""
        ep_data = MOCK_EPISODES_RESPONSE["data"][0]
        episode = BangumiEpisode(**ep_data)

        assert episode.id == 111111
        assert episode.name == "残酷"
        assert episode.sort == 1.0
        assert episode.ep == 1


# ==================== 集成测试（可选）====================


@pytest.mark.integration
@pytest.mark.asyncio
class TestBangumiIntegration:
    """Bangumi API 集成测试（需要真实 API Key）
    
    使用 pytest -m integration 运行集成测试
    """

    @pytest.mark.skip(reason="需要真实的 Bangumi API Key")
    async def test_real_search(self):
        """测试真实的搜索请求"""
        async with BangumiClient() as client:
            result = await client.search_subjects("鬼灭之刃", type=2, max_results=5)
            assert result["results"] > 0
            assert "list" in result

    @pytest.mark.skip(reason="需要真实的 Bangumi API Key")
    async def test_real_subject_details(self):
        """测试真实的详情请求"""
        async with BangumiClient() as client:
            # 使用一个已知的条目 ID
            result = await client.get_subject_details(12345)
            assert "id" in result

    @pytest.mark.skip(reason="需要真实的 Bangumi API Key")
    async def test_real_calendar(self):
        """测试真实的每日放送请求"""
        async with BangumiClient() as client:
            result = await client.get_calendar()
            assert isinstance(result, list)
            assert len(result) == 7  # 一周7天


if __name__ == "__main__":
    pytest.main([__file__, "-v"])

