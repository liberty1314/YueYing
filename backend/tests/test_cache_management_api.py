"""
缓存管理 API 测试

测试管理员缓存管理端点
"""
import pytest
from fastapi.testclient import TestClient
from unittest.mock import Mock, patch, MagicMock

from app.main import app
from app.models.user import User
from app.api.dependencies.auth import get_current_admin


@pytest.fixture
def admin_user():
    """创建管理员用户"""
    user = Mock(spec=User)
    user.id = 1
    user.username = "admin"
    user.email = "admin@example.com"
    user.is_admin = lambda: True
    user.is_active = True
    return user


@pytest.fixture
def client(admin_user):
    """创建测试客户端，覆盖认证依赖"""
    def override_get_current_admin():
        return admin_user
    
    app.dependency_overrides[get_current_admin] = override_get_current_admin
    client = TestClient(app)
    yield client
    app.dependency_overrides.clear()


class TestCacheStatsEndpoints:
    """测试缓存统计端点"""
    
    @patch("app.api.routes.admin.cache_management.memory_cache_manager")
    @patch("app.api.routes.admin.cache_management.cache_stats_collector")
    def test_get_cache_stats(
        self,
        mock_stats_collector,
        mock_memory_cache,
        client
    ):
        """测试获取缓存统计"""
        # Mock L1 统计
        mock_memory_cache.get_stats.return_value = {
            "size": 100,
            "max_size": 1000,
            "hit_rate": 0.85,
            "hits": 850,
            "misses": 150,
        }
        
        # Mock L2 统计
        mock_stats_obj = Mock()
        mock_stats_obj.hit_rate = 0.75
        mock_stats_obj.avg_latency_ms = 2.5
        mock_stats_obj.total_operations = 1000
        mock_stats_obj.hits = 750
        mock_stats_obj.misses = 150
        mock_stats_obj.sets = 80
        mock_stats_obj.deletes = 20
        mock_stats_collector.get_stats.return_value = mock_stats_obj
        
        response = client.get("/api/admin/cache/stats")
        
        assert response.status_code == 200
        data = response.json()
        
        assert "l1_stats" in data
        assert "l2_stats" in data
        assert "time_window_seconds" in data
        
        assert data["l1_stats"]["size"] == 100
        assert data["l2_stats"]["hit_rate"] == 0.75
    
    @patch("app.api.routes.admin.cache_management.cache_stats_collector")
    def test_get_top_keys(
        self,
        mock_stats_collector,
        client
    ):
        """测试获取热门键"""
        mock_stats_collector.get_top_keys.return_value = [
            ("user:123:items", 500),
            ("tmdb:movie:456", 300),
            ("stats:user:789", 200),
        ]
        
        response = client.get("/api/admin/cache/stats/top-keys?limit=3")
        
        assert response.status_code == 200
        data = response.json()
        
        assert "top_keys" in data
        assert len(data["top_keys"]) == 3
        assert data["top_keys"][0]["key"] == "user:123:items"
        assert data["top_keys"][0]["count"] == 500


class TestCacheConfigEndpoints:
    """测试缓存配置端点"""
    
    @patch("app.api.routes.admin.cache_management.cache_config_manager")
    def test_get_cache_config(
        self,
        mock_config_manager,
        client
    ):
        """测试获取缓存配置"""
        mock_config = Mock()
        mock_config.to_dict.return_value = {
            "l1_max_size": 1000,
            "l1_default_ttl": 300,
            "l2_default_ttl": 3600,
            "warming_enabled": True,
            "warming_on_startup": True,
            "warming_batch_size": 100,
            "stats_enabled": True,
            "stats_max_history": 10000,
            "ttl_configs": {},
        }
        mock_config_manager.get_config.return_value = mock_config
        
        response = client.get("/api/admin/cache/config")
        
        assert response.status_code == 200
        data = response.json()
        
        assert data["l1_max_size"] == 1000
        assert data["warming_enabled"] is True
    
    @patch("app.api.routes.admin.cache_management.cache_config_manager")
    def test_update_cache_config(
        self,
        mock_config_manager,
        client
    ):
        """测试更新缓存配置"""
        mock_config_manager.update_config.return_value = True
        
        mock_config = Mock()
        mock_config.to_dict.return_value = {
            "l1_max_size": 2000,
            "l1_default_ttl": 300,
            "l2_default_ttl": 3600,
            "warming_enabled": True,
            "warming_on_startup": True,
            "warming_batch_size": 100,
            "stats_enabled": True,
            "stats_max_history": 10000,
            "ttl_configs": {},
        }
        mock_config_manager.get_config.return_value = mock_config
        
        response = client.put(
            "/api/admin/cache/config",
            json={"l1_max_size": 2000}
        )
        
        assert response.status_code == 200
        data = response.json()
        
        assert data["message"] == "配置更新成功"
        assert "config" in data


class TestCacheManagementEndpoints:
    """测试缓存管理端点"""
    
    @patch("app.api.routes.admin.cache_management.multi_level_cache_manager")
    def test_clear_cache_with_pattern(
        self,
        mock_cache_manager,
        client
    ):
        """测试按模式清理缓存"""
        mock_cache_manager.delete_pattern.return_value = 50
        
        response = client.request(
            "DELETE",
            "/api/admin/cache/clear",
            json={
                "pattern": "user:*",
                "clear_l1": True,
                "clear_l2": True
            }
        )
        
        assert response.status_code == 200
        data = response.json()
        
        assert "已清理匹配" in data["message"]
        assert data["keys_deleted"] == 50
    
    @patch("app.api.routes.admin.cache_management.multi_level_cache_manager")
    def test_clear_all_cache(
        self,
        mock_cache_manager,
        client
    ):
        """测试清理所有缓存"""
        mock_l2 = Mock()
        mock_l2.delete_pattern.return_value = 100
        mock_cache_manager.l2 = mock_l2
        
        response = client.request(
            "DELETE",
            "/api/admin/cache/clear",
            json={
                "clear_l1": True,
                "clear_l2": True
            }
        )
        
        assert response.status_code == 200
        data = response.json()
        
        assert "已清理所有缓存" in data["message"]
    
    @patch("app.api.routes.admin.cache_management.cache_config_manager")
    @patch("app.api.routes.admin.cache_management.memory_cache_manager")
    def test_get_cache_info(
        self,
        mock_memory_cache,
        mock_config_manager,
        client
    ):
        """测试获取缓存系统信息"""
        mock_config = Mock()
        mock_config.l1_max_size = 1000
        mock_config.l1_default_ttl = 300
        mock_config.l2_default_ttl = 3600
        mock_config.warming_enabled = True
        mock_config.stats_enabled = True
        mock_config.ttl_configs = {}
        mock_config_manager.get_config.return_value = mock_config
        
        mock_memory_cache.get_stats.return_value = {
            "size": 100,
            "max_size": 1000,
        }
        
        response = client.get("/api/admin/cache/info")
        
        assert response.status_code == 200
        data = response.json()
        
        assert "cache_layers" in data
        assert "features" in data
        assert data["cache_layers"]["l1"]["type"] == "Memory LRU"
        assert data["features"]["multi_level"] is True
