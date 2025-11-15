"""
缓存统计收集系统
"""
import time
from typing import Dict, List, Tuple, Optional
from dataclasses import dataclass, field
from collections import defaultdict, deque
from threading import Lock
import statistics

from app.core.logging import logger


@dataclass
class CacheStats:
    """缓存统计数据结构"""
    hits: int = 0
    misses: int = 0
    total_operations: int = 0
    hit_rate: float = 0.0
    key_access_frequency: Dict[str, int] = field(default_factory=dict)
    operation_latencies: List[float] = field(default_factory=list)
    avg_latency_ms: float = 0.0
    
    def calculate_hit_rate(self) -> None:
        """计算缓存命中率"""
        if self.total_operations > 0:
            self.hit_rate = (self.hits / self.total_operations) * 100
        else:
            self.hit_rate = 0.0
    
    def calculate_avg_latency(self) -> None:
        """计算平均延迟"""
        if self.operation_latencies:
            self.avg_latency_ms = statistics.mean(self.operation_latencies)
        else:
            self.avg_latency_ms = 0.0


@dataclass
class CacheOperation:
    """缓存操作记录"""
    key: str
    operation_type: str  # 'hit', 'miss', 'set', 'delete'
    timestamp: float
    latency_ms: float = 0.0


class CacheStatsCollector:
    """
    缓存统计收集器
    
    收集和聚合缓存操作统计信息，支持时间窗口查询
    """
    
    def __init__(self, max_history_size: int = 10000):
        """
        初始化统计收集器
        
        Args:
            max_history_size: 最大历史记录数量
        """
        self._hits: int = 0
        self._misses: int = 0
        self._key_access_count: Dict[str, int] = defaultdict(int)
        self._operation_history: deque = deque(maxlen=max_history_size)
        self._lock = Lock()
        
        logger.info(f"缓存统计收集器已初始化，最大历史记录数: {max_history_size}")
    
    def record_hit(self, key: str, latency_ms: float = 0.0) -> None:
        """
        记录缓存命中
        
        Args:
            key: 缓存键
            latency_ms: 操作延迟（毫秒）
        """
        with self._lock:
            self._hits += 1
            self._key_access_count[key] += 1
            
            operation = CacheOperation(
                key=key,
                operation_type='hit',
                timestamp=time.time(),
                latency_ms=latency_ms
            )
            self._operation_history.append(operation)
            
            logger.debug(f"记录缓存命中: key={key}, latency={latency_ms:.2f}ms")
    
    def record_miss(self, key: str) -> None:
        """
        记录缓存未命中
        
        Args:
            key: 缓存键
        """
        with self._lock:
            self._misses += 1
            self._key_access_count[key] += 1
            
            operation = CacheOperation(
                key=key,
                operation_type='miss',
                timestamp=time.time()
            )
            self._operation_history.append(operation)
            
            logger.debug(f"记录缓存未命中: key={key}")
    
    def record_set(self, key: str, latency_ms: float = 0.0) -> None:
        """
        记录缓存设置操作
        
        Args:
            key: 缓存键
            latency_ms: 操作延迟（毫秒）
        """
        with self._lock:
            operation = CacheOperation(
                key=key,
                operation_type='set',
                timestamp=time.time(),
                latency_ms=latency_ms
            )
            self._operation_history.append(operation)
            
            logger.debug(f"记录缓存设置: key={key}, latency={latency_ms:.2f}ms")
    
    def record_delete(self, key: str) -> None:
        """
        记录缓存删除操作
        
        Args:
            key: 缓存键
        """
        with self._lock:
            operation = CacheOperation(
                key=key,
                operation_type='delete',
                timestamp=time.time()
            )
            self._operation_history.append(operation)
            
            logger.debug(f"记录缓存删除: key={key}")
    
    def get_stats(self, time_window_seconds: int = 3600) -> CacheStats:
        """
        获取聚合统计信息
        
        Args:
            time_window_seconds: 时间窗口（秒），默认1小时
        
        Returns:
            CacheStats: 统计数据
        """
        with self._lock:
            current_time = time.time()
            cutoff_time = current_time - time_window_seconds
            
            # 过滤时间窗口内的操作
            recent_operations = [
                op for op in self._operation_history
                if op.timestamp >= cutoff_time
            ]
            
            # 统计命中和未命中
            hits = sum(1 for op in recent_operations if op.operation_type == 'hit')
            misses = sum(1 for op in recent_operations if op.operation_type == 'miss')
            total_operations = hits + misses
            
            # 统计键访问频率
            key_frequency: Dict[str, int] = defaultdict(int)
            for op in recent_operations:
                if op.operation_type in ('hit', 'miss'):
                    key_frequency[op.key] += 1
            
            # 收集操作延迟
            latencies = [
                op.latency_ms for op in recent_operations
                if op.latency_ms > 0
            ]
            
            # 创建统计对象
            stats = CacheStats(
                hits=hits,
                misses=misses,
                total_operations=total_operations,
                key_access_frequency=dict(key_frequency),
                operation_latencies=latencies
            )
            
            # 计算派生指标
            stats.calculate_hit_rate()
            stats.calculate_avg_latency()
            
            logger.debug(
                f"获取缓存统计: 时间窗口={time_window_seconds}s, "
                f"命中率={stats.hit_rate:.2f}%, "
                f"平均延迟={stats.avg_latency_ms:.2f}ms"
            )
            
            return stats
    
    def get_top_keys(self, limit: int = 100, time_window_seconds: Optional[int] = None) -> List[Tuple[str, int]]:
        """
        获取访问频率最高的键
        
        Args:
            limit: 返回的键数量限制
            time_window_seconds: 时间窗口（秒），None 表示全部历史
        
        Returns:
            List[Tuple[str, int]]: 键和访问次数的列表，按访问次数降序排列
        """
        with self._lock:
            if time_window_seconds is None:
                # 使用全部历史数据
                key_counts = dict(self._key_access_count)
            else:
                # 使用时间窗口内的数据
                current_time = time.time()
                cutoff_time = current_time - time_window_seconds
                
                key_counts: Dict[str, int] = defaultdict(int)
                for op in self._operation_history:
                    if op.timestamp >= cutoff_time and op.operation_type in ('hit', 'miss'):
                        key_counts[op.key] += 1
            
            # 排序并返回前 N 个
            sorted_keys = sorted(
                key_counts.items(),
                key=lambda x: x[1],
                reverse=True
            )[:limit]
            
            logger.debug(f"获取热门键: 返回前 {limit} 个")
            
            return sorted_keys
    
    def get_total_stats(self) -> Dict[str, int]:
        """
        获取总体统计信息（不受时间窗口限制）
        
        Returns:
            Dict[str, int]: 包含总命中数、总未命中数等
        """
        with self._lock:
            return {
                'total_hits': self._hits,
                'total_misses': self._misses,
                'total_operations': self._hits + self._misses,
                'unique_keys': len(self._key_access_count),
                'history_size': len(self._operation_history)
            }
    
    def reset(self) -> None:
        """重置所有统计数据"""
        with self._lock:
            self._hits = 0
            self._misses = 0
            self._key_access_count.clear()
            self._operation_history.clear()
            
            logger.info("缓存统计数据已重置")


# 创建全局统计收集器实例
cache_stats_collector = CacheStatsCollector()
