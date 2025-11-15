"""
缓存配置管理测试
"""
import pytest
from unittest.mock import Mock, patch

from app.core.cache_config import (
    CacheDataType,
    CacheTTLConfig,
    CacheConfig,
    CacheConfigManager,
)


class TestCacheTTLConfig:
    """测试 CacheTTLConfig"""
    
    def test_valid_config(self):
        """测试有效配置"""
        config = CacheTTLConfig(l1_ttl=300, l2_ttl=3600, description="测试")
        assert config.l1_ttl == 300
        assert config.l2_ttl == 3600
        assert config.description == "测试"
    
    def test_negative_l1_ttl(self):
        """测试负数 L1 TTL"""
        with pytest.raises(ValueError):
            CacheTTLConfig(l1_ttl=-1, l2_ttl=3600)
    
    def test_negative_l2_ttl(self):
        """测试负数 L2 TTL"""
        with pytest.raises(ValueError):
            CacheTTLConfig(l1_ttl=300, l2_ttl=-1)
    
    def test_l1_greater_than_l2(self):
        """测试 L1 TTL 大于 L2 TTL（应该警告但不报错）"""
        # 这应该成功创建，但会记录警告
        config = CacheTTLConfig(l1_ttl=3600, l2_ttl=300)
        assert config.l1_ttl == 3600
        assert config.l2_ttl == 300


class TestCacheConfig:
    """测试 CacheConfig"""
    
    def test_default_config(self):
        """测试默认配置"""
        config = CacheConfig()
        
        assert config.l1_max_size == 1000
        assert config.l1_default_ttl == 300
        assert config.l2_default_ttl == 3600
        assert config.warming_enabled is True
        assert config.stats_enabled is True
        assert len(config.ttl_configs) > 0
    
    def test_custom_config(self):
        """测试自定义配置"""
        config = CacheConfig(
            l1_max_size=2000,
            l1_default_ttl=600,
            l2_default_ttl=7200,
            warming_enabled=False,
        )
        
        assert config.l1_max_size == 2000
        assert config.l1_default_ttl == 600
        assert config.l2_default_ttl == 7200
        assert config.warming_enabled is False
    
    def test_get_ttl_config(self):
        """测试获取 TTL 配置"""
        config = CacheConfig()
        
        # 获取已定义的类型
        user_session_config = config.get_ttl_config(CacheDataType.USER_SESSION)
        assert user_session_config.l1_ttl == 600
        assert user_session_config.l2_ttl == 1800
        
        # 获取默认类型
        default_config = config.get_ttl_config(CacheDataType.DEFAULT)
        assert default_config.l1_ttl == 300
        assert default_config.l2_ttl == 3600
    
    def test_set_ttl_config(self):
        """测试设置 TTL 配置"""
        config = CacheConfig()
        
        # 设置新配置
        config.set_ttl_config(
            CacheDataType.USER_PROFILE,
            l1_ttl=600,
            l2_ttl=7200,
            description="自定义配置"
        )
        
        # 验证设置
        profile_config = config.get_ttl_config(CacheDataType.USER_PROFILE)
        assert profile_config.l1_ttl == 600
        assert profile_config.l2_ttl == 7200
        assert profile_config.description == "自定义配置"
    
    def test_validate_valid_config(self):
        """测试验证有效配置"""
        config = CacheConfig()
        assert config.validate() is True
    
    def test_validate_invalid_l1_max_size(self):
        """测试验证无效的 L1 最大大小"""
        config = CacheConfig(l1_max_size=0)
        assert config.validate() is False
    
    def test_validate_invalid_l1_default_ttl(self):
        """测试验证无效的 L1 默认 TTL"""
        config = CacheConfig(l1_default_ttl=-1)
        assert config.validate() is False
    
    def test_validate_invalid_warming_batch_size(self):
        """测试验证无效的预热批次大小"""
        config = CacheConfig(warming_batch_size=0)
        assert config.validate() is False
    
    def test_to_dict(self):
        """测试转换为字典"""
        config = CacheConfig()
        config_dict = config.to_dict()
        
        assert isinstance(config_dict, dict)
        assert "l1_max_size" in config_dict
        assert "l1_default_ttl" in config_dict
        assert "l2_default_ttl" in config_dict
        assert "ttl_configs" in config_dict
        assert isinstance(config_dict["ttl_configs"], dict)
    
    def test_all_data_types_have_config(self):
        """测试所有数据类型都有配置"""
        config = CacheConfig()
        
        # 检查所有枚举值都有配置
        for data_type in CacheDataType:
            ttl_config = config.get_ttl_config(data_type)
            assert ttl_config is not None
            assert ttl_config.l1_ttl >= 0
            assert ttl_config.l2_ttl >= 0


class TestCacheConfigManager:
    """测试 CacheConfigManager"""
    
    def test_init_with_default_config(self):
        """测试使用默认配置初始化"""
        manager = CacheConfigManager()
        assert manager.config is not None
        assert isinstance(manager.config, CacheConfig)
    
    def test_init_with_custom_config(self):
        """测试使用自定义配置初始化"""
        custom_config = CacheConfig(l1_max_size=2000)
        manager = CacheConfigManager(config=custom_config)
        assert manager.config.l1_max_size == 2000
    
    def test_get_config(self):
        """测试获取配置"""
        manager = CacheConfigManager()
        config = manager.get_config()
        assert isinstance(config, CacheConfig)
    
    def test_update_config(self):
        """测试更新配置"""
        manager = CacheConfigManager()
        
        # 更新配置
        success = manager.update_config(
            l1_max_size=2000,
            l1_default_ttl=600
        )
        
        assert success is True
        assert manager.config.l1_max_size == 2000
        assert manager.config.l1_default_ttl == 600
    
    def test_update_config_invalid(self):
        """测试更新无效配置"""
        manager = CacheConfigManager()
        
        # 尝试设置无效值
        success = manager.update_config(l1_max_size=-1)
        
        assert success is False
    
    def test_get_ttl_for_data_type(self):
        """测试获取数据类型的 TTL"""
        manager = CacheConfigManager()
        
        l1_ttl, l2_ttl = manager.get_ttl_for_data_type(CacheDataType.USER_SESSION)
        
        assert l1_ttl == 600
        assert l2_ttl == 1800
    
    def test_set_ttl_for_data_type(self):
        """测试设置数据类型的 TTL"""
        manager = CacheConfigManager()
        
        success = manager.set_ttl_for_data_type(
            CacheDataType.USER_PROFILE,
            l1_ttl=900,
            l2_ttl=7200,
            description="更新的配置"
        )
        
        assert success is True
        
        l1_ttl, l2_ttl = manager.get_ttl_for_data_type(CacheDataType.USER_PROFILE)
        assert l1_ttl == 900
        assert l2_ttl == 7200
    
    def test_set_ttl_for_data_type_invalid(self):
        """测试设置无效的 TTL"""
        manager = CacheConfigManager()
        
        success = manager.set_ttl_for_data_type(
            CacheDataType.USER_PROFILE,
            l1_ttl=-1,
            l2_ttl=3600
        )
        
        assert success is False
    
    @patch('app.core.cache_config.settings')
    def test_load_from_env(self, mock_settings):
        """测试从环境变量加载"""
        # 模拟环境变量
        mock_settings.CACHE_L1_MAX_SIZE = "2000"
        mock_settings.CACHE_L1_DEFAULT_TTL = "600"
        mock_settings.CACHE_L2_DEFAULT_TTL = "7200"
        mock_settings.CACHE_WARMING_ENABLED = "false"
        mock_settings.CACHE_STATS_ENABLED = "true"
        
        manager = CacheConfigManager()
        
        assert manager.config.l1_max_size == 2000
        assert manager.config.l1_default_ttl == 600
        assert manager.config.l2_default_ttl == 7200
        assert manager.config.warming_enabled is False
        assert manager.config.stats_enabled is True


class TestCacheDataType:
    """测试 CacheDataType 枚举"""
    
    def test_all_types_are_strings(self):
        """测试所有类型都是字符串"""
        for data_type in CacheDataType:
            assert isinstance(data_type.value, str)
    
    def test_unique_values(self):
        """测试所有值都是唯一的"""
        values = [dt.value for dt in CacheDataType]
        assert len(values) == len(set(values))
    
    def test_specific_types_exist(self):
        """测试特定类型存在"""
        assert CacheDataType.USER_SESSION
        assert CacheDataType.TMDB_MOVIE
        assert CacheDataType.SEARCH_RESULTS
        assert CacheDataType.AI_TAGS
        assert CacheDataType.DEFAULT
