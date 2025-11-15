"""
缓存统计系统测试
"""
import pytest
import time
from app.core.cache_stats import CacheStatsCollector, CacheStats


class TestCacheStatsCollector:
    """测试缓存统计收集器"""
    
    def setup_method(self):
        """每个测试方法前执行"""
        self.collector = CacheStatsCollector(max_history_size=100)
    
    def test_record_hit(self):
        """测试记录缓存命中"""
        self.collector.record_hit("test_key", latency_ms=1.5)
        
        stats = self.collector.get_stats()
        assert stats.hits == 1
        assert stats.misses == 0
        assert stats.total_operations == 1
        assert stats.hit_rate == 100.0
        assert "test_key" in stats.key_access_frequency
        assert stats.key_access_frequency["test_key"] == 1
    
    def test_record_miss(self):
        """测试记录缓存未命中"""
        self.collector.record_miss("test_key")
        
        stats = self.collector.get_stats()
        assert stats.hits == 0
        assert stats.misses == 1
        assert stats.total_operations == 1
        assert stats.hit_rate == 0.0
        assert "test_key" in stats.key_access_frequency
    
    def test_hit_rate_calculation(self):
        """测试命中率计算"""
        # 记录 7 次命中和 3 次未命中
        for i in range(7):
            self.collector.record_hit(f"key_{i}", latency_ms=1.0)
        
        for i in range(3):
            self.collector.record_miss(f"miss_key_{i}")
        
        stats = self.collector.get_stats()
        assert stats.hits == 7
        assert stats.misses == 3
        assert stats.total_operations == 10
        assert stats.hit_rate == 70.0
    
    def test_latency_tracking(self):
        """测试延迟追踪"""
        latencies = [1.0, 2.0, 3.0, 4.0, 5.0]
        
        for latency in latencies:
            self.collector.record_hit("test_key", latency_ms=latency)
        
        stats = self.collector.get_stats()
        assert len(stats.operation_latencies) == 5
        assert stats.avg_latency_ms == 3.0  # 平均值
    
    def test_key_access_frequency(self):
        """测试键访问频率统计"""
        # 访问不同的键不同次数
        for i in range(5):
            self.collector.record_hit("key_a", latency_ms=1.0)
        
        for i in range(3):
            self.collector.record_hit("key_b", latency_ms=1.0)
        
        self.collector.record_miss("key_c")
        
        stats = self.collector.get_stats()
        assert stats.key_access_frequency["key_a"] == 5
        assert stats.key_access_frequency["key_b"] == 3
        assert stats.key_access_frequency["key_c"] == 1
    
    def test_time_window_filtering(self):
        """测试时间窗口过滤"""
        # 记录一些操作
        self.collector.record_hit("old_key", latency_ms=1.0)
        
        # 等待一小段时间
        time.sleep(0.1)
        
        self.collector.record_hit("new_key", latency_ms=1.0)
        
        # 获取最近 0.05 秒的统计（应该只包含 new_key）
        stats = self.collector.get_stats(time_window_seconds=0.05)
        assert stats.total_operations == 1
        assert "new_key" in stats.key_access_frequency
        assert "old_key" not in stats.key_access_frequency
    
    def test_get_top_keys(self):
        """测试获取热门键"""
        # 创建不同访问频率的键
        access_counts = {
            "key_a": 10,
            "key_b": 5,
            "key_c": 3,
            "key_d": 1
        }
        
        for key, count in access_counts.items():
            for _ in range(count):
                self.collector.record_hit(key, latency_ms=1.0)
        
        # 获取前 3 个热门键
        top_keys = self.collector.get_top_keys(limit=3)
        
        assert len(top_keys) == 3
        assert top_keys[0] == ("key_a", 10)
        assert top_keys[1] == ("key_b", 5)
        assert top_keys[2] == ("key_c", 3)
    
    def test_get_top_keys_with_time_window(self):
        """测试带时间窗口的热门键获取"""
        # 记录旧操作
        for _ in range(5):
            self.collector.record_hit("old_key", latency_ms=1.0)
        
        # 等待
        time.sleep(0.1)
        
        # 记录新操作
        for _ in range(3):
            self.collector.record_hit("new_key", latency_ms=1.0)
        
        # 获取最近 0.05 秒的热门键
        top_keys = self.collector.get_top_keys(limit=10, time_window_seconds=0.05)
        
        # 应该只包含 new_key
        assert len(top_keys) == 1
        assert top_keys[0][0] == "new_key"
    
    def test_get_total_stats(self):
        """测试获取总体统计"""
        self.collector.record_hit("key_1", latency_ms=1.0)
        self.collector.record_hit("key_2", latency_ms=1.0)
        self.collector.record_miss("key_3")
        
        total_stats = self.collector.get_total_stats()
        
        assert total_stats['total_hits'] == 2
        assert total_stats['total_misses'] == 1
        assert total_stats['total_operations'] == 3
        assert total_stats['unique_keys'] == 3
        assert total_stats['history_size'] == 3
    
    def test_record_set_and_delete(self):
        """测试记录设置和删除操作"""
        self.collector.record_set("test_key", latency_ms=2.0)
        self.collector.record_delete("test_key")
        
        total_stats = self.collector.get_total_stats()
        # set 和 delete 操作不计入 hits/misses
        assert total_stats['total_operations'] == 0
        assert total_stats['history_size'] == 2
    
    def test_reset(self):
        """测试重置统计"""
        # 记录一些操作
        self.collector.record_hit("key_1", latency_ms=1.0)
        self.collector.record_miss("key_2")
        
        # 重置
        self.collector.reset()
        
        # 验证已清空
        stats = self.collector.get_stats()
        assert stats.hits == 0
        assert stats.misses == 0
        assert stats.total_operations == 0
        assert len(stats.key_access_frequency) == 0
        
        total_stats = self.collector.get_total_stats()
        assert total_stats['total_hits'] == 0
        assert total_stats['total_misses'] == 0
        assert total_stats['history_size'] == 0
    
    def test_max_history_size(self):
        """测试历史记录大小限制"""
        collector = CacheStatsCollector(max_history_size=10)
        
        # 记录超过限制的操作
        for i in range(20):
            collector.record_hit(f"key_{i}", latency_ms=1.0)
        
        total_stats = collector.get_total_stats()
        # 历史记录应该被限制在 10 条
        assert total_stats['history_size'] == 10
        # 但总命中数应该是 20
        assert total_stats['total_hits'] == 20
    
    def test_concurrent_access(self):
        """测试并发访问（基本线程安全测试）"""
        import threading
        
        def record_operations():
            for i in range(100):
                self.collector.record_hit(f"key_{i % 10}", latency_ms=1.0)
        
        # 创建多个线程
        threads = [threading.Thread(target=record_operations) for _ in range(5)]
        
        # 启动所有线程
        for thread in threads:
            thread.start()
        
        # 等待所有线程完成
        for thread in threads:
            thread.join()
        
        # 验证总操作数
        total_stats = self.collector.get_total_stats()
        assert total_stats['total_hits'] == 500  # 5 threads * 100 operations


class TestCacheStats:
    """测试 CacheStats 数据结构"""
    
    def test_calculate_hit_rate_with_operations(self):
        """测试有操作时的命中率计算"""
        stats = CacheStats(hits=8, misses=2, total_operations=10)
        stats.calculate_hit_rate()
        
        assert stats.hit_rate == 80.0
    
    def test_calculate_hit_rate_no_operations(self):
        """测试无操作时的命中率计算"""
        stats = CacheStats()
        stats.calculate_hit_rate()
        
        assert stats.hit_rate == 0.0
    
    def test_calculate_avg_latency(self):
        """测试平均延迟计算"""
        stats = CacheStats(operation_latencies=[1.0, 2.0, 3.0, 4.0, 5.0])
        stats.calculate_avg_latency()
        
        assert stats.avg_latency_ms == 3.0
    
    def test_calculate_avg_latency_no_data(self):
        """测试无延迟数据时的平均延迟计算"""
        stats = CacheStats()
        stats.calculate_avg_latency()
        
        assert stats.avg_latency_ms == 0.0
