"""
内存 LRU 缓存测试
"""
import pytest
import time
import threading
from app.core.memory_cache import LRUCache, MemoryCacheManager, CacheEntry
from app.core.cache_stats import CacheStatsCollector


class TestLRUCache:
    """测试 LRU 缓存"""
    
    def setup_method(self):
        """每个测试方法前执行"""
        self.cache = LRUCache(max_size=5, default_ttl=1)
    
    def test_basic_get_set(self):
        """测试基本的 get/set 操作"""
        self.cache.set("key1", "value1")
        assert self.cache.get("key1") == "value1"
    
    def test_get_nonexistent_key(self):
        """测试获取不存在的键"""
        assert self.cache.get("nonexistent") is None
    
    def test_update_existing_key(self):
        """测试更新已存在的键"""
        self.cache.set("key1", "value1")
        self.cache.set("key1", "value2")
        assert self.cache.get("key1") == "value2"
        assert self.cache.size() == 1
    
    def test_delete_key(self):
        """测试删除键"""
        self.cache.set("key1", "value1")
        assert self.cache.delete("key1") is True
        assert self.cache.get("key1") is None
        assert self.cache.delete("key1") is False
    
    def test_clear(self):
        """测试清空缓存"""
        self.cache.set("key1", "value1")
        self.cache.set("key2", "value2")
        self.cache.clear()
        assert self.cache.size() == 0
        assert self.cache.get("key1") is None
    
    def test_ttl_expiration(self):
        """测试 TTL 过期"""
        self.cache.set("key1", "value1", ttl=0.1)  # 100ms TTL
        assert self.cache.get("key1") == "value1"
        
        # 等待过期
        time.sleep(0.15)
        assert self.cache.get("key1") is None
    
    def test_no_ttl(self):
        """测试无 TTL（永不过期）"""
        cache = LRUCache(max_size=5, default_ttl=None)
        cache.set("key1", "value1")
        
        # 等待一段时间
        time.sleep(0.1)
        assert cache.get("key1") == "value1"
    
    def test_custom_ttl(self):
        """测试自定义 TTL"""
        self.cache.set("key1", "value1", ttl=0.2)
        self.cache.set("key2", "value2", ttl=0.05)
        
        # key2 应该先过期
        time.sleep(0.1)
        assert self.cache.get("key1") == "value1"
        assert self.cache.get("key2") is None
    
    def test_lru_eviction(self):
        """测试 LRU 驱逐"""
        # 填满缓存
        for i in range(5):
            self.cache.set(f"key{i}", f"value{i}")
        
        assert self.cache.size() == 5
        
        # 添加第6个项，应该驱逐 key0（最旧的）
        self.cache.set("key5", "value5")
        
        assert self.cache.size() == 5
        assert self.cache.get("key0") is None  # 被驱逐
        assert self.cache.get("key5") == "value5"
    
    def test_lru_access_order(self):
        """测试 LRU 访问顺序"""
        # 添加5个项
        for i in range(5):
            self.cache.set(f"key{i}", f"value{i}")
        
        # 访问 key0，使其成为最近使用的
        self.cache.get("key0")
        
        # 添加新项，应该驱逐 key1（现在是最旧的）
        self.cache.set("key5", "value5")
        
        assert self.cache.get("key0") == "value0"  # 仍然存在
        assert self.cache.get("key1") is None  # 被驱逐
    
    def test_size(self):
        """测试获取缓存大小"""
        assert self.cache.size() == 0
        
        self.cache.set("key1", "value1")
        assert self.cache.size() == 1
        
        self.cache.set("key2", "value2")
        assert self.cache.size() == 2
        
        self.cache.delete("key1")
        assert self.cache.size() == 1
    
    def test_get_stats(self):
        """测试获取统计信息"""
        self.cache.set("key1", "value1")
        self.cache.get("key1")  # 命中
        self.cache.get("key2")  # 未命中
        
        stats = self.cache.get_stats()
        
        assert stats["size"] == 1
        assert stats["max_size"] == 5
        assert stats["hits"] == 1
        assert stats["misses"] == 1
        assert stats["hit_rate"] == 50.0
    
    def test_cleanup_expired(self):
        """测试清理过期条目"""
        self.cache.set("key1", "value1", ttl=0.05)
        self.cache.set("key2", "value2", ttl=0.05)
        self.cache.set("key3", "value3", ttl=10)
        
        # 等待部分过期
        time.sleep(0.1)
        
        # 清理过期条目
        cleaned = self.cache.cleanup_expired()
        
        assert cleaned == 2
        assert self.cache.size() == 1
        assert self.cache.get("key3") == "value3"
    
    def test_thread_safety(self):
        """测试线程安全"""
        cache = LRUCache(max_size=100, default_ttl=10)
        errors = []
        
        def worker(thread_id):
            try:
                for i in range(100):
                    key = f"key_{thread_id}_{i}"
                    cache.set(key, f"value_{thread_id}_{i}")
                    value = cache.get(key)
                    if value != f"value_{thread_id}_{i}":
                        errors.append(f"Value mismatch for {key}")
            except Exception as e:
                errors.append(str(e))
        
        # 创建多个线程
        threads = [threading.Thread(target=worker, args=(i,)) for i in range(5)]
        
        # 启动所有线程
        for thread in threads:
            thread.start()
        
        # 等待所有线程完成
        for thread in threads:
            thread.join()
        
        # 验证没有错误
        assert len(errors) == 0, f"Errors: {errors}"
    
    def test_concurrent_eviction(self):
        """测试并发驱逐"""
        cache = LRUCache(max_size=50, default_ttl=10)
        
        def worker(thread_id):
            for i in range(100):
                cache.set(f"key_{thread_id}_{i}", f"value_{thread_id}_{i}")
        
        # 创建多个线程，总共会添加超过 max_size 的项
        threads = [threading.Thread(target=worker, args=(i,)) for i in range(3)]
        
        for thread in threads:
            thread.start()
        
        for thread in threads:
            thread.join()
        
        # 验证缓存大小不超过限制
        assert cache.size() <= 50
        
        # 验证驱逐计数器
        stats = cache.get_stats()
        assert stats["evictions"] > 0


class TestMemoryCacheManager:
    """测试内存缓存管理器"""
    
    def setup_method(self):
        """每个测试方法前执行"""
        self.stats_collector = CacheStatsCollector()
        self.manager = MemoryCacheManager(
            max_size=5,
            default_ttl=1,
            stats_collector=self.stats_collector
        )
    
    def test_basic_operations(self):
        """测试基本操作"""
        self.manager.set("key1", "value1")
        assert self.manager.get("key1") == "value1"
        assert self.manager.delete("key1") is True
        assert self.manager.get("key1") is None
    
    def test_stats_integration(self):
        """测试统计集成"""
        self.manager.set("key1", "value1")
        self.manager.get("key1")  # 命中
        self.manager.get("key2")  # 未命中
        
        # 验证统计收集器记录了操作
        stats = self.stats_collector.get_stats()
        assert stats.hits == 1
        assert stats.misses == 1
    
    def test_get_stats(self):
        """测试获取统计信息"""
        self.manager.set("key1", "value1")
        self.manager.get("key1")
        
        stats = self.manager.get_stats()
        assert stats["size"] == 1
        assert stats["hits"] == 1
    
    def test_clear(self):
        """测试清空缓存"""
        self.manager.set("key1", "value1")
        self.manager.set("key2", "value2")
        self.manager.clear()
        assert self.manager.size() == 0
    
    def test_cleanup_expired(self):
        """测试清理过期条目"""
        self.manager.set("key1", "value1", ttl=0.05)
        self.manager.set("key2", "value2", ttl=10)
        
        time.sleep(0.1)
        
        cleaned = self.manager.cleanup_expired()
        assert cleaned == 1
        assert self.manager.size() == 1


class TestCacheEntry:
    """测试缓存条目"""
    
    def test_cache_entry_creation(self):
        """测试创建缓存条目"""
        entry = CacheEntry(value="test", expire_at=time.time() + 10)
        assert entry.value == "test"
        assert entry.expire_at is not None
    
    def test_cache_entry_no_expiry(self):
        """测试无过期时间的缓存条目"""
        entry = CacheEntry(value="test")
        assert entry.value == "test"
        assert entry.expire_at is None


class TestLRUCacheEdgeCases:
    """测试 LRU 缓存边界情况"""
    
    def test_zero_max_size(self):
        """测试最大容量为0"""
        cache = LRUCache(max_size=0, default_ttl=10)
        cache.set("key1", "value1")
        # 应该立即被驱逐
        assert cache.size() == 0
    
    def test_single_item_cache(self):
        """测试单项缓存"""
        cache = LRUCache(max_size=1, default_ttl=10)
        cache.set("key1", "value1")
        assert cache.get("key1") == "value1"
        
        # 添加第二项，第一项应该被驱逐
        cache.set("key2", "value2")
        assert cache.get("key1") is None
        assert cache.get("key2") == "value2"
    
    def test_very_short_ttl(self):
        """测试非常短的 TTL"""
        cache = LRUCache(max_size=5, default_ttl=0.001)  # 1ms
        cache.set("key1", "value1")
        
        # 立即过期
        time.sleep(0.002)
        assert cache.get("key1") is None
    
    def test_large_cache(self):
        """测试大容量缓存"""
        cache = LRUCache(max_size=10000, default_ttl=10)
        
        # 添加大量项
        for i in range(5000):
            cache.set(f"key{i}", f"value{i}")
        
        assert cache.size() == 5000
        
        # 验证可以访问
        assert cache.get("key0") == "value0"
        assert cache.get("key4999") == "value4999"
    
    def test_none_value(self):
        """测试存储 None 值"""
        cache = LRUCache(max_size=5, default_ttl=10)
        cache.set("key1", None)
        
        # None 值应该被存储
        assert cache.get("key1") is None
        # 但键应该存在
        assert cache.size() == 1
    
    def test_complex_values(self):
        """测试复杂值类型"""
        cache = LRUCache(max_size=5, default_ttl=10)
        
        # 字典
        cache.set("dict", {"a": 1, "b": 2})
        assert cache.get("dict") == {"a": 1, "b": 2}
        
        # 列表
        cache.set("list", [1, 2, 3])
        assert cache.get("list") == [1, 2, 3]
        
        # 元组
        cache.set("tuple", (1, 2, 3))
        assert cache.get("tuple") == (1, 2, 3)
        
        # 对象
        class TestObj:
            def __init__(self, value):
                self.value = value
        
        obj = TestObj(42)
        cache.set("obj", obj)
        assert cache.get("obj").value == 42
