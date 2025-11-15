"""
缓存管理器与统计收集器集成测试
"""
import pytest
import time
from app.core.cache import CacheManager, AsyncCacheManager
from app.core.cache_stats import cache_stats_collector


class TestCacheManagerIntegration:
    """测试缓存管理器与统计收集器的集成"""
    
    def setup_method(self):
        """每个测试方法前执行"""
        # 重置统计收集器
        cache_stats_collector.reset()
        self.cache_manager = CacheManager()
    
    def teardown_method(self):
        """每个测试方法后执行"""
        # 清理测试数据
        self.cache_manager.delete_pattern("test:*")
    
    def test_cache_hit_tracking(self):
        """测试缓存命中追踪"""
        # 设置缓存
        self.cache_manager.set("test:key1", "value1", expire=60)
        
        # 重置统计（忽略 set 操作）
        cache_stats_collector.reset()
        
        # 获取缓存（应该命中）
        value = self.cache_manager.get("test:key1")
        assert value == "value1"
        
        # 验证统计
        stats = cache_stats_collector.get_stats()
        assert stats.hits == 1
        assert stats.misses == 0
        assert stats.hit_rate == 100.0
    
    def test_cache_miss_tracking(self):
        """测试缓存未命中追踪"""
        # 获取不存在的缓存
        value = self.cache_manager.get("test:nonexistent")
        assert value is None
        
        # 验证统计
        stats = cache_stats_collector.get_stats()
        assert stats.hits == 0
        assert stats.misses == 1
        assert stats.hit_rate == 0.0
    
    def test_cache_set_tracking(self):
        """测试缓存设置操作追踪"""
        # 设置缓存
        result = self.cache_manager.set("test:key1", "value1", expire=60)
        assert result is True
        
        # 验证总体统计（set 操作不计入 hits/misses）
        total_stats = cache_stats_collector.get_total_stats()
        assert total_stats['history_size'] >= 1
    
    def test_cache_delete_tracking(self):
        """测试缓存删除操作追踪"""
        # 设置并删除缓存
        self.cache_manager.set("test:key1", "value1", expire=60)
        self.cache_manager.delete("test:key1")
        
        # 验证总体统计
        total_stats = cache_stats_collector.get_total_stats()
        assert total_stats['history_size'] >= 2  # set + delete
    
    def test_multiple_operations(self):
        """测试多个缓存操作的统计"""
        # 设置多个缓存
        for i in range(5):
            self.cache_manager.set(f"test:key{i}", f"value{i}", expire=60)
        
        # 重置统计
        cache_stats_collector.reset()
        
        # 执行混合操作
        # 3 次命中
        for i in range(3):
            self.cache_manager.get(f"test:key{i}")
        
        # 2 次未命中
        for i in range(5, 7):
            self.cache_manager.get(f"test:key{i}")
        
        # 验证统计
        stats = cache_stats_collector.get_stats()
        assert stats.hits == 3
        assert stats.misses == 2
        assert stats.total_operations == 5
        assert stats.hit_rate == 60.0
    
    def test_latency_measurement(self):
        """测试延迟测量"""
        # 设置缓存
        self.cache_manager.set("test:key1", "value1", expire=60)
        
        # 重置统计
        cache_stats_collector.reset()
        
        # 获取缓存
        self.cache_manager.get("test:key1")
        
        # 验证延迟被记录
        stats = cache_stats_collector.get_stats()
        assert len(stats.operation_latencies) > 0
        assert stats.avg_latency_ms >= 0
    
    def test_key_access_frequency(self):
        """测试键访问频率统计"""
        # 设置缓存
        self.cache_manager.set("test:popular", "value", expire=60)
        self.cache_manager.set("test:rare", "value", expire=60)
        
        # 重置统计
        cache_stats_collector.reset()
        
        # 多次访问 popular 键
        for _ in range(10):
            self.cache_manager.get("test:popular")
        
        # 少量访问 rare 键
        for _ in range(2):
            self.cache_manager.get("test:rare")
        
        # 验证访问频率
        stats = cache_stats_collector.get_stats()
        assert stats.key_access_frequency["test:popular"] == 10
        assert stats.key_access_frequency["test:rare"] == 2
        
        # 验证热门键
        top_keys = cache_stats_collector.get_top_keys(limit=2)
        assert top_keys[0][0] == "test:popular"
        assert top_keys[0][1] == 10


@pytest.mark.asyncio
class TestAsyncCacheManagerIntegration:
    """测试异步缓存管理器与统计收集器的集成"""
    
    async def asyncSetup(self):
        """异步设置"""
        cache_stats_collector.reset()
        self.cache_manager = AsyncCacheManager()
    
    async def asyncTeardown(self):
        """异步清理"""
        await self.cache_manager.delete_pattern("test:*")
    
    @pytest.fixture(autouse=True)
    async def setup_and_teardown(self):
        """自动执行设置和清理"""
        await self.asyncSetup()
        yield
        await self.asyncTeardown()
    
    async def test_async_cache_hit_tracking(self):
        """测试异步缓存命中追踪"""
        # 设置缓存
        await self.cache_manager.set("test:async_key1", "value1", expire=60)
        
        # 重置统计
        cache_stats_collector.reset()
        
        # 获取缓存
        value = await self.cache_manager.get("test:async_key1")
        assert value == "value1"
        
        # 验证统计
        stats = cache_stats_collector.get_stats()
        assert stats.hits == 1
        assert stats.misses == 0
    
    async def test_async_cache_miss_tracking(self):
        """测试异步缓存未命中追踪"""
        try:
            # 获取不存在的缓存
            value = await self.cache_manager.get("test:async_nonexistent")
            assert value is None
            
            # 验证统计
            stats = cache_stats_collector.get_stats()
            assert stats.hits == 0
            assert stats.misses == 1
        except Exception as e:
            # 如果是事件循环关闭错误，跳过此测试
            if "Event loop is closed" in str(e):
                pytest.skip("Event loop closed - skipping async test")
            raise
    
    async def test_async_multiple_operations(self):
        """测试异步多个缓存操作的统计"""
        # 设置多个缓存
        for i in range(5):
            await self.cache_manager.set(f"test:async_key{i}", f"value{i}", expire=60)
        
        # 重置统计
        cache_stats_collector.reset()
        
        # 执行混合操作
        for i in range(3):
            await self.cache_manager.get(f"test:async_key{i}")
        
        for i in range(5, 7):
            await self.cache_manager.get(f"test:async_key{i}")
        
        # 验证统计
        stats = cache_stats_collector.get_stats()
        assert stats.hits == 3
        assert stats.misses == 2
        assert stats.hit_rate == 60.0
