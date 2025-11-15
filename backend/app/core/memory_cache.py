"""
内存 LRU 缓存实现

提供线程安全的 LRU 缓存，支持 TTL 过期和自动驱逐
"""
import time
import threading
from collections import OrderedDict
from typing import Any, Optional, Dict
from dataclasses import dataclass

from app.core.logging import logger
from app.core.cache_stats import CacheStatsCollector


@dataclass
class CacheEntry:
    """缓存条目"""
    value: Any
    expire_at: Optional[float] = None  # Unix 时间戳，None 表示永不过期


class LRUCache:
    """
    线程安全的 LRU 缓存实现
    
    特性：
    - LRU 驱逐策略
    - TTL 过期支持
    - 线程安全
    - O(1) 时间复杂度的 get/set 操作
    """
    
    def __init__(self, max_size: int = 1000, default_ttl: int = 300):
        """
        初始化 LRU 缓存
        
        Args:
            max_size: 最大缓存条目数
            default_ttl: 默认 TTL（秒），None 表示永不过期
        """
        self.max_size = max_size
        self.default_ttl = default_ttl
        self.cache: OrderedDict[str, CacheEntry] = OrderedDict()
        self.lock = threading.Lock()
        self._hits = 0
        self._misses = 0
        self._evictions = 0
        
        logger.info(
            f"LRU 缓存已初始化: max_size={max_size}, default_ttl={default_ttl}s"
        )
    
    def get(self, key: str) -> Optional[Any]:
        """
        获取缓存值
        
        Args:
            key: 缓存键

        Returns:
            缓存值，如果不存在或已过期则返回 None
        """
        with self.lock:
            if key not in self.cache:
                self._misses += 1
                return None
            
            entry = self.cache[key]
            
            # 检查是否过期
            if self._is_expired(entry):
                # 删除过期条目
                del self.cache[key]
                self._misses += 1
                logger.debug(f"LRU 缓存过期: key={key}")
                return None
            
            # 移到末尾（标记为最近使用）
            self.cache.move_to_end(key)
            self._hits += 1
            
            return entry.value
    
    def set(self, key: str, value: Any, ttl: Optional[int] = None) -> None:
        """
        设置缓存值
        
        Args:
            key: 缓存键
            value: 缓存值
            ttl: TTL（秒），None 使用默认值
        """
        with self.lock:
            # 计算过期时间
            if ttl is None:
                ttl = self.default_ttl
            
            expire_at = None
            if ttl is not None and ttl > 0:
                expire_at = time.time() + ttl
            
            # 创建缓存条目
            entry = CacheEntry(value=value, expire_at=expire_at)
            
            # 如果键已存在，先删除（会更新顺序）
            if key in self.cache:
                del self.cache[key]
            
            # 添加新条目
            self.cache[key] = entry
            
            # 检查是否需要驱逐
            self._evict_if_needed()
            
            logger.debug(
                f"LRU 缓存设置: key={key}, ttl={ttl}s, "
                f"size={len(self.cache)}/{self.max_size}"
            )
    
    def delete(self, key: str) -> bool:
        """
        删除缓存键
        
        Args:
            key: 缓存键

        Returns:
            是否成功删除
        """
        with self.lock:
            if key in self.cache:
                del self.cache[key]
                logger.debug(f"LRU 缓存删除: key={key}")
                return True
            return False
    
    def clear(self) -> None:
        """清空所有缓存"""
        with self.lock:
            count = len(self.cache)
            self.cache.clear()
            logger.info(f"LRU 缓存已清空: 删除了 {count} 个条目")
    
    def size(self) -> int:
        """获取当前缓存大小"""
        with self.lock:
            return len(self.cache)
    
    def get_stats(self) -> Dict[str, int]:
        """
        获取缓存统计信息
        
        Returns:
            包含统计信息的字典
        """
        with self.lock:
            total = self._hits + self._misses
            hit_rate = (self._hits / total * 100) if total > 0 else 0.0
            
            return {
                "size": len(self.cache),
                "max_size": self.max_size,
                "hits": self._hits,
                "misses": self._misses,
                "evictions": self._evictions,
                "hit_rate": hit_rate
            }
    
    def _evict_if_needed(self) -> None:
        """
        如果缓存已满，驱逐最旧的条目
        
        注意：此方法必须在持有锁的情况下调用
        """
        while len(self.cache) > self.max_size:
            # OrderedDict 的第一个项是最旧的
            oldest_key = next(iter(self.cache))
            del self.cache[oldest_key]
            self._evictions += 1
            logger.debug(f"LRU 缓存驱逐: key={oldest_key}")
    
    def _is_expired(self, entry: CacheEntry) -> bool:
        """
        检查缓存条目是否过期
        
        Args:
            entry: 缓存条目

        Returns:
            是否过期
        """
        if entry.expire_at is None:
            return False
        return time.time() > entry.expire_at
    
    def cleanup_expired(self) -> int:
        """
        清理所有过期的缓存条目
        
        Returns:
            清理的条目数量
        """
        with self.lock:
            expired_keys = [
                key for key, entry in self.cache.items()
                if self._is_expired(entry)
            ]
            
            for key in expired_keys:
                del self.cache[key]
            
            if expired_keys:
                logger.info(f"LRU 缓存清理: 删除了 {len(expired_keys)} 个过期条目")
            
            return len(expired_keys)


class MemoryCacheManager:
    """
    内存缓存管理器
    
    包装 LRUCache 并集成统计收集
    """
    
    def __init__(
        self,
        max_size: int = 1000,
        default_ttl: int = 300,
        stats_collector: Optional[CacheStatsCollector] = None
    ):
        """
        初始化内存缓存管理器
        
        Args:
            max_size: 最大缓存条目数
            default_ttl: 默认 TTL（秒）
            stats_collector: 统计收集器实例
        """
        self.cache = LRUCache(max_size=max_size, default_ttl=default_ttl)
        self.stats_collector = stats_collector
        
        logger.info(
            f"内存缓存管理器已初始化: max_size={max_size}, "
            f"default_ttl={default_ttl}s"
        )
    
    def get(self, key: str) -> Optional[Any]:
        """
        获取缓存值
        
        Args:
            key: 缓存键

        Returns:
            缓存值，如果不存在或已过期则返回 None
        """
        start_time = time.time()
        value = self.cache.get(key)
        latency_ms = (time.time() - start_time) * 1000
        
        # 记录统计
        if self.stats_collector:
            if value is not None:
                self.stats_collector.record_hit(key, latency_ms)
            else:
                self.stats_collector.record_miss(key)
        
        return value
    
    def set(self, key: str, value: Any, ttl: Optional[int] = None) -> None:
        """
        设置缓存值
        
        Args:
            key: 缓存键
            value: 缓存值
            ttl: TTL（秒），None 使用默认值
        """
        start_time = time.time()
        self.cache.set(key, value, ttl)
        latency_ms = (time.time() - start_time) * 1000
        
        # 记录统计
        if self.stats_collector:
            self.stats_collector.record_set(key, latency_ms)
    
    def delete(self, key: str) -> bool:
        """
        删除缓存键
        
        Args:
            key: 缓存键

        Returns:
            是否成功删除
        """
        result = self.cache.delete(key)
        
        # 记录统计
        if self.stats_collector and result:
            self.stats_collector.record_delete(key)
        
        return result
    
    def clear(self) -> None:
        """清空所有缓存"""
        self.cache.clear()
    
    def size(self) -> int:
        """获取当前缓存大小"""
        return self.cache.size()
    
    def get_stats(self) -> Dict[str, Any]:
        """
        获取缓存统计信息
        
        Returns:
            包含统计信息的字典
        """
        return self.cache.get_stats()
    
    def cleanup_expired(self) -> int:
        """
        清理所有过期的缓存条目
        
        Returns:
            清理的条目数量
        """
        return self.cache.cleanup_expired()


# 创建全局内存缓存管理器实例
memory_cache_manager = MemoryCacheManager()
