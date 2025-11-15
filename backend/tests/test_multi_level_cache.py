"""
多级缓存协调测试
"""
import pytest
import time
import asyncio
from unittest.mock import Mock, patch

from app.core.memory_cache import MemoryCacheManager
from app.core.cache_stats import CacheStatsCollector


class TestMultiLevelCacheManager:
    """测试多级缓存管理器（同步版本）"""
    
    def setup_method(self):
        """每个测试方法前执行"""
        # 延迟导入避免循环依赖
        from app.core.cache import CacheManager, MultiLevelCacheManager
        
        self.l1_cache = MemoryCacheManager(max_size=10, default_ttl=5)
        self.l2_cache = CacheManager()
        self.stats_collector = CacheStatsCollector()
        
        self.manager = MultiLevelCacheManager(
            l1_cache=self.l1_cache,
            l2_cache=self.l2_cache,
            stats_collector=self.stats_collector
        )
    
    def teardown_method(self):
        """每个测试方法后执行"""
        # 清理测试数据
        self.l1_cache.clear()
        self.l2_cache.delete_pattern("*test*")
    
    def test_l1_hit(self):
        """测试 L1 缓存命中"""
        # 直接设置到 L1
        self.l1_cache.set("test:key1", "value1")
        
        # 获取应该从 L1 命中
        result = self.manager.get("test:key1")
        assert result == "value1"
    
    def test_l2_hit_and_promotion(self):
        """测试 L2 命中并提升到 L1"""
        # 只设置到 L2
        self.l2_cache.set("test:key2", "value2", expire=60)
        
        # 确保 L1 中没有
        assert self.l1_cache.get("test:key2") is None
        
        # 获取应该从 L2 命中并提升到 L1
        result = self.manager.get("test:key2")
        assert result == "value2"
        
        # 验证已提升到 L1
        assert self.l1_cache.get("test:key2") == "value2"
    
    def test_complete_miss(self):
        """测试完全未命中"""
        result = self.manager.get("test:nonexistent")
        assert result is None
    
    def test_set_both_levels(self):
        """测试设置到两层缓存"""
        self.manager.set("test:key3", "value3", l1_ttl=10, l2_ttl=60)
        
        # 验证两层都有数据
        assert self.l1_cache.get("test:key3") == "value3"
        assert self.l2_cache.get("test:key3") == "value3"
    
    def test_delete_both_levels(self):
        """测试从两层删除"""
        # 设置到两层
        self.manager.set("test:key4", "value4")
        
        # 验证两层都有数据
        assert self.l1_cache.get("test:key4") == "value4"
        assert self.l2_cache.get("test:key4") == "value4"
        
        # 删除
        self.manager.delete("test:key4")
        
        # 验证两层都没有数据
        assert self.l1_cache.get("test:key4") is None
        assert self.l2_cache.get("test:key4") is None
    
    def test_delete_pattern(self):
        """测试模式删除"""
        # 设置多个键
        self.manager.set("test:pattern:1", "value1")
        self.manager.set("test:pattern:2", "value2")
        self.manager.set("test:other", "value3")
        
        # 模式删除
        count = self.manager.delete_pattern("test:pattern:*")
        
        # 验证删除了正确的键
        assert count >= 0
        assert self.l2_cache.get("test:pattern:1") is None
        assert self.l2_cache.get("test:pattern:2") is None
        assert self.l2_cache.get("test:other") == "value3"
    
    def test_clear_l1(self):
        """测试清空 L1"""
        self.manager.set("test:key5", "value5")
        
        # 清空 L1
        self.manager.clear()
        
        # L1 应该被清空，L2 保持不变
        assert self.l1_cache.get("test:key5") is None
        assert self.l2_cache.get("test:key5") == "value5"
    
    def test_different_ttl(self):
        """测试不同的 TTL 设置"""
        # 设置不同的 TTL
        self.manager.set("test:ttl", "value", l1_ttl=1, l2_ttl=10)
        
        # 立即检查，两层都应该有数据
        assert self.l1_cache.get("test:ttl") == "value"
        assert self.l2_cache.get("test:ttl") == "value"
        
        # 等待 L1 过期
        time.sleep(1.1)
        
        # L1 应该过期，L2 仍然有效
        assert self.l1_cache.get("test:ttl") is None
        assert self.l2_cache.get("test:ttl") == "value"
        
        # 通过多级缓存获取，应该从 L2 获取并提升到 L1
        result = self.manager.get("test:ttl")
        assert result == "value"
        assert self.l1_cache.get("test:ttl") == "value"


@pytest.mark.asyncio
class TestAsyncMultiLevelCacheManager:
    """测试异步多级缓存管理器"""
    
    async def asyncSetup(self):
        """异步设置"""
        from app.core.cache import AsyncCacheManager, AsyncMultiLevelCacheManager
        
        self.l1_cache = MemoryCacheManager(max_size=10, default_ttl=5)
        self.l2_cache = AsyncCacheManager()
        self.stats_collector = CacheStatsCollector()
        
        self.manager = AsyncMultiLevelCacheManager(
            l1_cache=self.l1_cache,
            l2_cache=self.l2_cache,
            stats_collector=self.stats_collector
        )
    
    async def asyncTeardown(self):
        """异步清理"""
        self.l1_cache.clear()
        await self.l2_cache.delete_pattern("*test*")
    
    @pytest.fixture(autouse=True)
    async def setup_and_teardown(self):
        """自动执行设置和清理"""
        await self.asyncSetup()
        yield
        await self.asyncTeardown()
    
    async def test_async_l1_hit(self):
        """测试异步 L1 缓存命中"""
        self.l1_cache.set("test:async_key1", "value1")
        
        result = await self.manager.get("test:async_key1")
        assert result == "value1"
    
    async def test_async_l2_hit_and_promotion(self):
        """测试异步 L2 命中并提升到 L1"""
        await self.l2_cache.set("test:async_key2", "value2", expire=60)
        
        # 确保 L1 中没有
        assert self.l1_cache.get("test:async_key2") is None
        
        # 获取应该从 L2 命中并提升到 L1
        result = await self.manager.get("test:async_key2")
        assert result == "value2"
        
        # 验证已提升到 L1
        assert self.l1_cache.get("test:async_key2") == "value2"
    
    async def test_async_complete_miss(self):
        """测试异步完全未命中"""
        result = await self.manager.get("test:async_nonexistent")
        assert result is None
    
    async def test_async_set_both_levels(self):
        """测试异步设置到两层缓存"""
        await self.manager.set("test:async_key3", "value3", l1_ttl=10, l2_ttl=60)
        
        # 验证两层都有数据
        assert self.l1_cache.get("test:async_key3") == "value3"
        assert await self.l2_cache.get("test:async_key3") == "value3"
    
    async def test_async_delete_both_levels(self):
        """测试异步从两层删除"""
        await self.manager.set("test:async_key4", "value4")
        
        # 删除
        await self.manager.delete("test:async_key4")
        
        # 验证两层都没有数据
        assert self.l1_cache.get("test:async_key4") is None
        assert await self.l2_cache.get("test:async_key4") is None


class TestMultiLevelCacheDecorator:
    """测试多级缓存装饰器"""
    
    def setup_method(self):
        """每个测试方法前执行"""
        # 重置全局缓存管理器
        from app.core.cache import multi_level_cache_manager
        multi_level_cache_manager.clear()
        multi_level_cache_manager.l2.delete_pattern("*test*")
    
    def test_multi_level_cached_decorator(self):
        """测试多级缓存装饰器"""
        from app.core.cache import multi_level_cached
        
        call_count = 0
        
        @multi_level_cached(prefix="test", l1_ttl=5, l2_ttl=60)
        def expensive_function(x: int) -> str:
            nonlocal call_count
            call_count += 1
            return f"result_{x}"
        
        # 第一次调用，应该执行函数
        result1 = expensive_function(1)
        assert result1 == "result_1"
        assert call_count == 1
        
        # 第二次调用，应该从缓存获取
        result2 = expensive_function(1)
        assert result2 == "result_1"
        assert call_count == 1
        
        # 不同参数，应该执行函数
        result3 = expensive_function(2)
        assert result3 == "result_2"
        assert call_count == 2
    
    def test_multi_level_cached_invalidate(self):
        """测试多级缓存失效"""
        from app.core.cache import multi_level_cached
        
        call_count = 0
        
        @multi_level_cached(prefix="test", l1_ttl=5, l2_ttl=60)
        def cached_function(x: int) -> str:
            nonlocal call_count
            call_count += 1
            return f"result_{x}"
        
        # 调用并缓存
        result1 = cached_function(1)
        assert call_count == 1
        
        # 使缓存失效
        cached_function.invalidate(1)
        
        # 再次调用，应该重新执行
        result2 = cached_function(1)
        assert result2 == "result_1"
        assert call_count == 2
    
    def test_multi_level_cached_invalidate_all(self):
        """测试多级缓存全部失效"""
        from app.core.cache import multi_level_cached
        
        call_count = 0
        
        @multi_level_cached(prefix="test", l1_ttl=5, l2_ttl=60)
        def cached_function(x: int) -> str:
            nonlocal call_count
            call_count += 1
            return f"result_{x}"
        
        # 调用多个参数
        cached_function(1)
        cached_function(2)
        assert call_count == 2
        
        # 使所有缓存失效
        cached_function.invalidate_all()
        
        # 再次调用，应该重新执行
        cached_function(1)
        cached_function(2)
        assert call_count == 4


@pytest.mark.asyncio
class TestAsyncMultiLevelCacheDecorator:
    """测试异步多级缓存装饰器"""
    
    async def asyncSetup(self):
        """异步设置"""
        from app.core.cache import async_multi_level_cache_manager
        async_multi_level_cache_manager.clear()
        await async_multi_level_cache_manager.l2.delete_pattern("*test*")
    
    @pytest.fixture(autouse=True)
    async def setup_and_teardown(self):
        """自动执行设置和清理"""
        await self.asyncSetup()
        yield
        await self.asyncSetup()
    
    async def test_async_multi_level_cached_decorator(self):
        """测试异步多级缓存装饰器"""
        from app.core.cache import async_multi_level_cached
        
        call_count = 0
        
        @async_multi_level_cached(prefix="async_test", l1_ttl=5, l2_ttl=60)
        async def async_expensive_function(x: int) -> str:
            nonlocal call_count
            call_count += 1
            await asyncio.sleep(0.01)
            return f"async_result_{x}"
        
        # 第一次调用
        result1 = await async_expensive_function(1)
        assert result1 == "async_result_1"
        assert call_count == 1
        
        # 第二次调用，应该从缓存获取
        result2 = await async_expensive_function(1)
        assert result2 == "async_result_1"
        assert call_count == 1
    
    async def test_async_multi_level_cached_invalidate(self):
        """测试异步多级缓存失效"""
        from app.core.cache import async_multi_level_cached
        
        call_count = 0
        
        @async_multi_level_cached(prefix="async_test", l1_ttl=5, l2_ttl=60)
        async def async_cached_function(x: int) -> str:
            nonlocal call_count
            call_count += 1
            return f"async_result_{x}"
        
        # 调用并缓存
        await async_cached_function(1)
        assert call_count == 1
        
        # 使缓存失效
        await async_cached_function.invalidate(1)
        
        # 再次调用
        await async_cached_function(1)
        assert call_count == 2


class TestMultiLevelCacheIntegration:
    """测试多级缓存集成场景"""
    
    def setup_method(self):
        """每个测试方法前执行"""
        from app.core.cache import CacheManager, MultiLevelCacheManager
        
        self.l1_cache = MemoryCacheManager(max_size=5, default_ttl=2)
        self.l2_cache = CacheManager()
        
        self.manager = MultiLevelCacheManager(
            l1_cache=self.l1_cache,
            l2_cache=self.l2_cache
        )
    
    def teardown_method(self):
        """每个测试方法后执行"""
        self.l1_cache.clear()
        self.l2_cache.delete_pattern("*test*")
    
    def test_l1_eviction_l2_promotion(self):
        """测试 L1 驱逐后从 L2 提升"""
        # 填满 L1 缓存（max_size=5）
        for i in range(5):
            self.manager.set(f"test:key{i}", f"value{i}")
        
        # 添加第6个项，应该驱逐 L1 中的第一个
        self.manager.set("test:key5", "value5")
        
        # key0 应该从 L1 被驱逐，但在 L2 中仍然存在
        assert self.l1_cache.get("test:key0") is None
        assert self.l2_cache.get("test:key0") == "value0"
        
        # 通过多级缓存获取 key0，应该从 L2 提升到 L1
        result = self.manager.get("test:key0")
        assert result == "value0"
        assert self.l1_cache.get("test:key0") == "value0"
    
    def test_l1_expiry_l2_promotion(self):
        """测试 L1 过期后从 L2 提升"""
        # 设置不同的 TTL
        self.manager.set("test:expiry", "value", l1_ttl=1, l2_ttl=10)
        
        # 等待 L1 过期
        time.sleep(1.1)
        
        # L1 应该过期，L2 仍然有效
        assert self.l1_cache.get("test:expiry") is None
        assert self.l2_cache.get("test:expiry") == "value"
        
        # 通过多级缓存获取，应该从 L2 提升到 L1
        result = self.manager.get("test:expiry")
        assert result == "value"
        assert self.l1_cache.get("test:expiry") == "value"
    
    def test_cache_hierarchy_performance(self):
        """测试缓存层次性能"""
        # 设置数据
        self.manager.set("test:perf", "value")
        
        # 多次获取，应该都从 L1 获取
        start_time = time.time()
        for _ in range(100):
            result = self.manager.get("test:perf")
            assert result == "value"
        l1_time = time.time() - start_time
        
        # 清空 L1，只从 L2 获取
        self.l1_cache.clear()
        
        start_time = time.time()
        for _ in range(100):
            result = self.l2_cache.get("test:perf")
            assert result == "value"
        l2_time = time.time() - start_time
        
        # 验证逻辑正确性
        assert l1_time >= 0
        assert l2_time >= 0
