"""
缓存性能测试

测试缓存系统的性能指标：
- 缓存命中率
- 响应时间
- 内存使用
- 缓存操作延迟
- 高并发性能
"""
import pytest
import asyncio
import time
import statistics
from typing import List

try:
    import psutil
    PSUTIL_AVAILABLE = True
except ImportError:
    PSUTIL_AVAILABLE = False

from app.core.cache import (
    multi_level_cache_manager,
    async_multi_level_cache_manager,
)
from app.core.cache_stats import cache_stats_collector


class TestCachePerformance:
    """缓存性能基准测试"""
    
    def test_l1_cache_latency(self):
        """测试 L1 缓存延迟（应该 < 1ms）"""
        key = "perf:l1:latency"
        value = {"data": "test" * 100}  # 较大的数据
        
        # 设置缓存
        multi_level_cache_manager.set(key, value)
        
        # 预热
        for _ in range(10):
            multi_level_cache_manager.get(key)
        
        # 测量延迟
        latencies = []
        for _ in range(1000):
            start = time.perf_counter()
            multi_level_cache_manager.get(key)
            end = time.perf_counter()
            latencies.append((end - start) * 1000)  # 转换为毫秒
        
        avg_latency = statistics.mean(latencies)
        p95_latency = statistics.quantiles(latencies, n=20)[18]  # 95th percentile
        p99_latency = statistics.quantiles(latencies, n=100)[98]  # 99th percentile
        
        print(f"\nL1 缓存延迟统计:")
        print(f"  平均: {avg_latency:.4f}ms")
        print(f"  P95: {p95_latency:.4f}ms")
        print(f"  P99: {p99_latency:.4f}ms")
        
        # L1 缓存应该非常快
        assert avg_latency < 1.0, f"L1 平均延迟过高: {avg_latency}ms"
        assert p95_latency < 2.0, f"L1 P95 延迟过高: {p95_latency}ms"
    
    @pytest.mark.asyncio
    async def test_l2_cache_latency(self):
        """测试 L2 缓存延迟（应该 < 10ms）"""
        key = "perf:l2:latency"
        value = {"data": "test" * 100}
        
        # 设置到 L2
        await async_multi_level_cache_manager.l2.set(key, value)
        
        # 清除 L1 以确保从 L2 读取
        async_multi_level_cache_manager.clear()
        
        # 预热
        for _ in range(10):
            await async_multi_level_cache_manager.l2.get(key)
        
        # 测量延迟
        latencies = []
        for _ in range(100):
            start = time.perf_counter()
            await async_multi_level_cache_manager.l2.get(key)
            end = time.perf_counter()
            latencies.append((end - start) * 1000)
        
        avg_latency = statistics.mean(latencies)
        p95_latency = statistics.quantiles(latencies, n=20)[18]
        
        print(f"\nL2 缓存延迟统计:")
        print(f"  平均: {avg_latency:.4f}ms")
        print(f"  P95: {p95_latency:.4f}ms")
        
        # L2 缓存应该在 10ms 以内
        assert avg_latency < 10.0, f"L2 平均延迟过高: {avg_latency}ms"
    
    def test_cache_hit_rate(self):
        """测试缓存命中率"""
        cache_stats_collector.reset()
        
        # 设置测试数据
        keys = [f"perf:hit_rate:{i}" for i in range(100)]
        for key in keys:
            multi_level_cache_manager.set(key, {"id": key})
        
        # 模拟访问模式：80% 访问热门数据，20% 访问冷数据
        hot_keys = keys[:20]  # 前 20 个是热门键
        cold_keys = keys[20:]  # 其余是冷数据
        
        # 执行访问
        for _ in range(1000):
            import random
            if random.random() < 0.8:
                # 80% 访问热门数据
                key = random.choice(hot_keys)
            else:
                # 20% 访问冷数据或不存在的键
                if random.random() < 0.5:
                    key = random.choice(cold_keys)
                else:
                    key = f"perf:hit_rate:nonexistent:{random.randint(1000, 2000)}"
            
            multi_level_cache_manager.get(key)
        
        # 获取统计
        stats = cache_stats_collector.get_stats()
        hit_rate = stats['hit_rate']
        
        print(f"\n缓存命中率: {hit_rate:.2%}")
        print(f"总命中: {stats['total_hits']}")
        print(f"总未命中: {stats['total_misses']}")
        
        # 命中率应该 > 70%（因为 80% 访问热门数据）
        assert hit_rate > 0.70, f"命中率过低: {hit_rate:.2%}"
    
    @pytest.mark.skipif(not PSUTIL_AVAILABLE, reason="psutil not installed")
    def test_memory_usage(self):
        """测试内存使用"""
        import os
        process = psutil.Process(os.getpid())
        
        # 记录初始内存
        initial_memory = process.memory_info().rss / 1024 / 1024  # MB
        
        # 清除缓存
        multi_level_cache_manager.clear()
        
        # 填充缓存
        num_items = 1000
        for i in range(num_items):
            key = f"perf:memory:{i}"
            value = {
                "id": i,
                "data": "x" * 1000,  # 每个条目约 1KB
                "metadata": {"created": time.time()}
            }
            multi_level_cache_manager.set(key, value)
        
        # 记录填充后内存
        filled_memory = process.memory_info().rss / 1024 / 1024  # MB
        memory_increase = filled_memory - initial_memory
        
        print(f"\n内存使用统计:")
        print(f"  初始内存: {initial_memory:.2f}MB")
        print(f"  填充后内存: {filled_memory:.2f}MB")
        print(f"  增加: {memory_increase:.2f}MB")
        print(f"  每条目: {memory_increase / num_items * 1024:.2f}KB")
        
        # 内存增加应该合理（每条目 < 10KB）
        assert memory_increase / num_items < 10, "内存使用过高"
    
    @pytest.mark.asyncio
    async def test_throughput(self):
        """测试吞吐量（每秒操作数）"""
        key_prefix = "perf:throughput"
        num_operations = 10000
        
        # 设置测试数据
        for i in range(100):
            await async_multi_level_cache_manager.set(
                f"{key_prefix}:{i}",
                {"id": i}
            )
        
        # 测量读取吞吐量
        start = time.perf_counter()
        for _ in range(num_operations):
            import random
            key = f"{key_prefix}:{random.randint(0, 99)}"
            await async_multi_level_cache_manager.get(key)
        end = time.perf_counter()
        
        duration = end - start
        throughput = num_operations / duration
        
        print(f"\n吞吐量统计:")
        print(f"  操作数: {num_operations}")
        print(f"  耗时: {duration:.2f}s")
        print(f"  吞吐量: {throughput:.0f} ops/s")
        
        # 吞吐量应该 > 10000 ops/s
        assert throughput > 10000, f"吞吐量过低: {throughput:.0f} ops/s"


class TestConcurrentPerformance:
    """并发性能测试"""
    
    @pytest.mark.asyncio
    async def test_concurrent_read_performance(self):
        """测试并发读取性能"""
        key = "perf:concurrent:read"
        value = {"data": "test" * 100}
        
        # 设置缓存
        await async_multi_level_cache_manager.set(key, value)
        
        # 并发读取
        num_concurrent = 100
        num_operations = 100
        
        async def read_worker():
            for _ in range(num_operations):
                await async_multi_level_cache_manager.get(key)
        
        start = time.perf_counter()
        await asyncio.gather(*[read_worker() for _ in range(num_concurrent)])
        end = time.perf_counter()
        
        duration = end - start
        total_ops = num_concurrent * num_operations
        throughput = total_ops / duration
        
        print(f"\n并发读取性能:")
        print(f"  并发数: {num_concurrent}")
        print(f"  每个协程操作数: {num_operations}")
        print(f"  总操作数: {total_ops}")
        print(f"  耗时: {duration:.2f}s")
        print(f"  吞吐量: {throughput:.0f} ops/s")
        
        # 并发吞吐量应该很高
        assert throughput > 5000, f"并发吞吐量过低: {throughput:.0f} ops/s"
    
    @pytest.mark.asyncio
    async def test_concurrent_write_performance(self):
        """测试并发写入性能"""
        key_prefix = "perf:concurrent:write"
        num_concurrent = 50
        num_operations = 50
        
        async def write_worker(worker_id: int):
            for i in range(num_operations):
                key = f"{key_prefix}:{worker_id}:{i}"
                await async_multi_level_cache_manager.set(
                    key,
                    {"worker": worker_id, "op": i}
                )
        
        start = time.perf_counter()
        await asyncio.gather(*[write_worker(i) for i in range(num_concurrent)])
        end = time.perf_counter()
        
        duration = end - start
        total_ops = num_concurrent * num_operations
        throughput = total_ops / duration
        
        print(f"\n并发写入性能:")
        print(f"  并发数: {num_concurrent}")
        print(f"  每个协程操作数: {num_operations}")
        print(f"  总操作数: {total_ops}")
        print(f"  耗时: {duration:.2f}s")
        print(f"  吞吐量: {throughput:.0f} ops/s")
        
        # 并发写入吞吐量
        assert throughput > 1000, f"并发写入吞吐量过低: {throughput:.0f} ops/s"
    
    @pytest.mark.asyncio
    async def test_mixed_workload_performance(self):
        """测试混合工作负载性能（读写混合）"""
        key_prefix = "perf:mixed"
        num_workers = 50
        operations_per_worker = 100
        
        # 预填充一些数据
        for i in range(50):
            await async_multi_level_cache_manager.set(
                f"{key_prefix}:{i}",
                {"id": i}
            )
        
        async def mixed_worker(worker_id: int):
            import random
            for i in range(operations_per_worker):
                if random.random() < 0.7:  # 70% 读取
                    key = f"{key_prefix}:{random.randint(0, 49)}"
                    await async_multi_level_cache_manager.get(key)
                else:  # 30% 写入
                    key = f"{key_prefix}:{worker_id}:{i}"
                    await async_multi_level_cache_manager.set(
                        key,
                        {"worker": worker_id, "op": i}
                    )
        
        start = time.perf_counter()
        await asyncio.gather(*[mixed_worker(i) for i in range(num_workers)])
        end = time.perf_counter()
        
        duration = end - start
        total_ops = num_workers * operations_per_worker
        throughput = total_ops / duration
        
        print(f"\n混合工作负载性能:")
        print(f"  并发数: {num_workers}")
        print(f"  每个协程操作数: {operations_per_worker}")
        print(f"  总操作数: {total_ops}")
        print(f"  读写比例: 70:30")
        print(f"  耗时: {duration:.2f}s")
        print(f"  吞吐量: {throughput:.0f} ops/s")
        
        assert throughput > 2000, f"混合负载吞吐量过低: {throughput:.0f} ops/s"


class TestCacheScalability:
    """缓存可扩展性测试"""
    
    def test_large_dataset_performance(self):
        """测试大数据集性能"""
        num_items = 10000
        key_prefix = "perf:large"
        
        # 写入大量数据
        start = time.perf_counter()
        for i in range(num_items):
            key = f"{key_prefix}:{i}"
            multi_level_cache_manager.set(key, {"id": i, "data": f"value_{i}"})
        write_duration = time.perf_counter() - start
        
        # 随机读取
        import random
        start = time.perf_counter()
        for _ in range(num_items):
            key = f"{key_prefix}:{random.randint(0, num_items - 1)}"
            multi_level_cache_manager.get(key)
        read_duration = time.perf_counter() - start
        
        write_throughput = num_items / write_duration
        read_throughput = num_items / read_duration
        
        print(f"\n大数据集性能:")
        print(f"  数据集大小: {num_items}")
        print(f"  写入耗时: {write_duration:.2f}s")
        print(f"  写入吞吐量: {write_throughput:.0f} ops/s")
        print(f"  读取耗时: {read_duration:.2f}s")
        print(f"  读取吞吐量: {read_throughput:.0f} ops/s")
        
        # 性能应该保持稳定
        assert write_throughput > 5000, "写入吞吐量过低"
        assert read_throughput > 10000, "读取吞吐量过低"
    
    def test_cache_eviction_performance(self):
        """测试缓存淘汰性能"""
        # 设置较小的缓存大小
        from app.core.memory_cache import LRUCache
        small_cache = LRUCache(max_size=100, default_ttl=60)
        
        # 写入超过容量的数据
        num_items = 500
        start = time.perf_counter()
        for i in range(num_items):
            small_cache.set(f"evict:{i}", {"id": i})
        duration = time.perf_counter() - start
        
        throughput = num_items / duration
        
        print(f"\n缓存淘汰性能:")
        print(f"  缓存容量: 100")
        print(f"  写入数量: {num_items}")
        print(f"  耗时: {duration:.2f}s")
        print(f"  吞吐量: {throughput:.0f} ops/s")
        
        # 验证缓存大小
        assert small_cache.size() <= 100, "缓存大小超过限制"
        
        # 淘汰不应该显著影响性能
        assert throughput > 1000, "淘汰时性能下降过多"


class TestCacheComparison:
    """缓存对比测试（多级 vs 单级）"""
    
    @pytest.mark.asyncio
    async def test_multi_level_vs_single_level(self):
        """对比多级缓存和单级缓存的性能"""
        key = "perf:comparison"
        value = {"data": "test" * 100}
        
        # 测试多级缓存
        await async_multi_level_cache_manager.set(key, value)
        
        start = time.perf_counter()
        for _ in range(1000):
            await async_multi_level_cache_manager.get(key)
        multi_level_duration = time.perf_counter() - start
        
        # 测试单级缓存（仅 L2）
        await async_multi_level_cache_manager.l2.set(key, value)
        async_multi_level_cache_manager.clear()  # 清除 L1
        
        start = time.perf_counter()
        for _ in range(1000):
            await async_multi_level_cache_manager.l2.get(key)
        single_level_duration = time.perf_counter() - start
        
        speedup = single_level_duration / multi_level_duration
        
        print(f"\n多级 vs 单级缓存:")
        print(f"  多级缓存耗时: {multi_level_duration:.4f}s")
        print(f"  单级缓存耗时: {single_level_duration:.4f}s")
        print(f"  加速比: {speedup:.2f}x")
        
        # 多级缓存应该更快
        assert speedup > 2, f"多级缓存加速不明显: {speedup:.2f}x"


if __name__ == "__main__":
    pytest.main([__file__, "-v", "--tb=short", "-s"])  # -s 显示 print 输出
