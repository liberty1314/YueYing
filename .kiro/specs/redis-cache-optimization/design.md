# Design Document

## Overview

This design document outlines the architecture and implementation approach for optimizing the Redis caching strategy in the YueYing application. The optimization focuses on five key areas: cache usage analysis, improved key design, cache warming, LRU eviction policies, and multi-level caching. The design builds upon the existing cache infrastructure (`backend/app/core/cache.py` and `backend/app/core/redis.py`) while introducing new components for monitoring, warming, and multi-level caching.

## Architecture

### High-Level Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                     Application Layer                        │
│  (Services, API Endpoints, Background Tasks)                 │
└────────────────────┬────────────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────────────┐
│                  Cache Abstraction Layer                     │
│  ┌──────────────────────────────────────────────────────┐  │
│  │         Enhanced Cache Manager                        │  │
│  │  - Multi-level cache coordination                     │  │
│  │  - Cache warming orchestration                        │  │
│  │  - Statistics collection                              │  │
│  └──────────────────────────────────────────────────────┘  │
└────────────┬────────────────────────────┬───────────────────┘
             │                            │
             ▼                            ▼
┌────────────────────────┐   ┌──────────────────────────────┐
│   L1: In-Memory Cache  │   │   L2: Redis Cache            │
│   - LRU eviction       │   │   - Persistent storage       │
│   - Fast access        │   │   - LRU eviction policy      │
│   - Limited size       │   │   - Larger capacity          │
└────────────────────────┘   └──────────────────────────────┘
```

### Component Interaction Flow

```
User Request
    │
    ▼
┌─────────────────────┐
│  Cache Manager      │
│  Check L1 (Memory)  │
└──────┬──────────────┘
       │
       ├─ Hit ──────────────────────────────────┐
       │                                         │
       └─ Miss                                   │
          │                                      │
          ▼                                      │
    ┌─────────────────────┐                     │
    │  Check L2 (Redis)   │                     │
    └──────┬──────────────┘                     │
           │                                     │
           ├─ Hit ─────────────┐                │
           │                   │                │
           └─ Miss             │                │
              │                │                │
              ▼                ▼                │
         ┌─────────────┐  ┌────────────┐       │
         │  Database   │  │ Update L1  │       │
         └──────┬──────┘  └─────┬──────┘       │
                │                │              │
                └────────────────┴──────────────┘
                                 │
                                 ▼
                          Return to User
```

## Components and Interfaces

### 1. Cache Statistics Collector

**Purpose:** Track cache operations and collect performance metrics.

**Location:** `backend/app/core/cache_stats.py`

**Key Classes:**

```python
class CacheStats:
    """Cache statistics data structure"""
    hits: int
    misses: int
    total_operations: int
    hit_rate: float
    key_access_frequency: Dict[str, int]
    operation_latencies: List[float]
    
class CacheStatsCollector:
    """Collects and aggregates cache statistics"""
    
    def record_hit(self, key: str, latency_ms: float) -> None:
        """Record a cache hit"""
        
    def record_miss(self, key: str) -> None:
        """Record a cache miss"""
        
    def get_stats(self, time_window_seconds: int = 3600) -> CacheStats:
        """Get aggregated statistics for a time window"""
        
    def get_top_keys(self, limit: int = 100) -> List[Tuple[str, int]]:
        """Get most frequently accessed keys"""
```

**Integration Points:**
- Integrated into `CacheManager` and `AsyncCacheManager` to track all operations
- Exposes metrics through a monitoring endpoint

### 2. Enhanced Cache Key Generator

**Purpose:** Generate optimized, hierarchical cache keys with improved organization.

**Location:** Enhanced in `backend/app/core/cache.py`

**Key Improvements:**

```python
class CacheKeyGenerator:
    """Enhanced cache key generator with namespace support"""
    
    # Key structure: {service}:{entity_type}:{identifier}:{params}
    # Example: api:user:123:profile
    # Example: search:movie:tmdb:550:details
    
    @staticmethod
    def generate_key(
        service: str,
        entity_type: str,
        identifier: str,
        *args,
        **kwargs
    ) -> str:
        """Generate hierarchical cache key"""
        
    @staticmethod
    def generate_user_key(
        user_id: int,
        entity_type: str,
        identifier: str
    ) -> str:
        """Generate user-specific cache key"""
        
    @staticmethod
    def parse_key(key: str) -> Dict[str, str]:
        """Parse cache key into components"""
```

**Key Patterns:**
- User data: `user:{user_id}:{entity}:{id}`
- External API: `api:{service}:{entity}:{id}`
- Search results: `search:{type}:{query_hash}`
- Statistics: `stats:{user_id}:{type}:{period}`

### 3. Cache Warming Service

**Purpose:** Proactively load frequently accessed data into cache.

**Location:** `backend/app/services/cache_warming.py`

**Key Classes:**

```python
class CacheWarmingStrategy(ABC):
    """Abstract base class for warming strategies"""
    
    @abstractmethod
    async def warm(self, cache_manager: CacheManager) -> int:
        """Execute warming strategy, return number of entries loaded"""

class UserItemsWarmingStrategy(CacheWarmingStrategy):
    """Warm cache with user items data"""
    
class PopularContentWarmingStrategy(CacheWarmingStrategy):
    """Warm cache with popular content"""
    
class CacheWarmingService:
    """Orchestrates cache warming operations"""
    
    def __init__(self, strategies: List[CacheWarmingStrategy]):
        self.strategies = strategies
        
    async def warm_all(self) -> Dict[str, int]:
        """Execute all warming strategies"""
        
    async def warm_specific(self, strategy_name: str) -> int:
        """Execute specific warming strategy"""
```

**Warming Strategies:**
1. **User Items Strategy**: Load recent user items for active users
2. **Popular Content Strategy**: Load frequently accessed movies/books
3. **Statistics Strategy**: Pre-calculate and cache user statistics
4. **Recommendations Strategy**: Pre-generate recommendations for active users

**Scheduling:**
- Startup warming: Execute on application startup
- Scheduled warming: Run via background task (e.g., every 6 hours)
- Manual warming: Trigger via admin API endpoint

### 4. In-Memory Cache Layer (L1)

**Purpose:** Provide ultra-fast access to frequently used data.

**Location:** `backend/app/core/memory_cache.py`

**Key Classes:**

```python
class LRUCache:
    """Thread-safe LRU cache implementation"""
    
    def __init__(self, max_size: int = 1000, default_ttl: int = 300):
        self.max_size = max_size
        self.default_ttl = default_ttl
        self.cache: OrderedDict = OrderedDict()
        self.expiry: Dict[str, float] = {}
        self.lock = threading.Lock()
        
    def get(self, key: str) -> Optional[Any]:
        """Get value from cache, return None if expired or missing"""
        
    def set(self, key: str, value: Any, ttl: Optional[int] = None) -> None:
        """Set value in cache with TTL"""
        
    def delete(self, key: str) -> None:
        """Delete key from cache"""
        
    def clear(self) -> None:
        """Clear all cache entries"""
        
    def _evict_if_needed(self) -> None:
        """Evict oldest entry if cache is full"""
        
    def _is_expired(self, key: str) -> bool:
        """Check if key has expired"""

class MemoryCacheManager:
    """Manages in-memory cache with statistics"""
    
    def __init__(self, max_size: int = 1000):
        self.cache = LRUCache(max_size=max_size)
        self.stats_collector = CacheStatsCollector()
```

**Configuration:**
- Default max size: 1000 entries
- Default TTL: 5 minutes (300 seconds)
- Configurable per-data-type TTL

### 5. Multi-Level Cache Manager

**Purpose:** Coordinate between in-memory and Redis cache layers.

**Location:** Enhanced in `backend/app/core/cache.py`

**Key Classes:**

```python
class MultiLevelCacheManager:
    """Manages multi-level caching with L1 (memory) and L2 (Redis)"""
    
    def __init__(
        self,
        l1_cache: MemoryCacheManager,
        l2_cache: CacheManager,
        stats_collector: CacheStatsCollector
    ):
        self.l1 = l1_cache
        self.l2 = l2_cache
        self.stats = stats_collector
        
    async def get(self, key: str) -> Optional[Any]:
        """
        Get value from cache (L1 -> L2 -> None)
        Promotes L2 hits to L1
        """
        
    async def set(
        self,
        key: str,
        value: Any,
        l1_ttl: Optional[int] = None,
        l2_ttl: Optional[int] = None
    ) -> None:
        """Set value in both cache levels"""
        
    async def delete(self, key: str) -> None:
        """Delete from both cache levels"""
        
    async def delete_pattern(self, pattern: str) -> int:
        """Delete matching keys from both levels"""
```

**Cache Promotion Strategy:**
- L2 hit → Promote to L1 with shorter TTL
- L1 miss + L2 hit → Store in L1
- Both miss → Fetch from DB, store in both levels

### 6. Cache Configuration Manager

**Purpose:** Centralize cache configuration with per-data-type TTL settings.

**Location:** `backend/app/core/cache_config.py`

**Key Classes:**

```python
@dataclass
class CacheConfig:
    """Cache configuration for a data type"""
    l1_ttl: int  # In-memory TTL in seconds
    l2_ttl: int  # Redis TTL in seconds
    enabled: bool = True
    warming_enabled: bool = False

class CacheConfigManager:
    """Manages cache configuration"""
    
    DEFAULT_CONFIGS = {
        "user_items": CacheConfig(l1_ttl=300, l2_ttl=3600, warming_enabled=True),
        "user_profile": CacheConfig(l1_ttl=600, l2_ttl=7200),
        "search_results": CacheConfig(l1_ttl=300, l2_ttl=1800),
        "external_api": CacheConfig(l1_ttl=600, l2_ttl=86400),
        "statistics": CacheConfig(l1_ttl=300, l2_ttl=3600, warming_enabled=True),
        "recommendations": CacheConfig(l1_ttl=600, l2_ttl=7200, warming_enabled=True),
    }
    
    def get_config(self, data_type: str) -> CacheConfig:
        """Get cache configuration for data type"""
        
    def update_config(self, data_type: str, config: CacheConfig) -> None:
        """Update cache configuration"""
```

## Data Models

### Cache Statistics Model

```python
class CacheStatsModel(BaseModel):
    """Cache statistics response model"""
    timestamp: datetime
    time_window_seconds: int
    total_operations: int
    hits: int
    misses: int
    hit_rate: float
    avg_latency_ms: float
    l1_size: int
    l2_memory_mb: float
    top_keys: List[Tuple[str, int]]
```

### Cache Warming Status Model

```python
class CacheWarmingStatus(BaseModel):
    """Cache warming operation status"""
    strategy_name: str
    status: str  # "running", "completed", "failed"
    entries_loaded: int
    duration_seconds: float
    started_at: datetime
    completed_at: Optional[datetime]
    error_message: Optional[str]
```

## Error Handling

### Cache Operation Failures

**Strategy:** Graceful degradation - cache failures should not break application functionality.

**Implementation:**
1. All cache operations wrapped in try-except blocks
2. Log errors with context (key, operation, error details)
3. Return None on cache read failures (fall through to database)
4. Continue execution on cache write failures
5. Increment error counters for monitoring

### Redis Connection Failures

**Strategy:** Automatic retry with exponential backoff.

**Implementation:**
1. Configure Redis client with connection retry settings
2. Implement circuit breaker pattern for repeated failures
3. Fall back to database-only mode if Redis is unavailable
4. Alert administrators on persistent connection failures

### Memory Cache Overflow

**Strategy:** LRU eviction with monitoring.

**Implementation:**
1. Automatically evict oldest entries when max size reached
2. Log eviction events for analysis
3. Monitor eviction rate to detect undersized cache
4. Provide configuration to adjust cache size

## Testing Strategy

### Unit Tests

**Location:** `backend/tests/test_cache_optimization.py`

**Test Coverage:**

1. **Cache Statistics Collector**
   - Test hit/miss recording
   - Test statistics aggregation
   - Test time window filtering
   - Test top keys calculation

2. **Enhanced Key Generator**
   - Test hierarchical key generation
   - Test user-specific keys
   - Test key parsing
   - Test hash generation for long keys

3. **In-Memory Cache (LRU)**
   - Test basic get/set operations
   - Test TTL expiration
   - Test LRU eviction
   - Test thread safety
   - Test cache size limits

4. **Multi-Level Cache Manager**
   - Test L1 hit scenario
   - Test L2 hit with L1 promotion
   - Test cache miss scenario
   - Test invalidation across levels
   - Test pattern-based deletion

5. **Cache Warming Service**
   - Test individual warming strategies
   - Test batch loading
   - Test error handling during warming
   - Test warming scheduling

### Integration Tests

**Test Scenarios:**

1. **End-to-End Cache Flow**
   - Request → L1 miss → L2 miss → DB → Cache population
   - Request → L1 miss → L2 hit → L1 promotion
   - Request → L1 hit → Fast return

2. **Cache Warming Integration**
   - Startup warming execution
   - Scheduled warming via background task
   - Manual warming via API endpoint

3. **Statistics Collection**
   - Statistics accuracy over multiple operations
   - Monitoring endpoint response
   - Performance impact measurement

### Performance Tests

**Benchmarks:**

1. **Cache Hit Rate**
   - Target: >80% hit rate for frequently accessed data
   - Measure: Hit rate over 1-hour window under normal load

2. **Response Time Improvement**
   - Target: 50% reduction in average response time for cached endpoints
   - Measure: Compare response times with/without cache

3. **Memory Usage**
   - Target: L1 cache <100MB, L2 cache <500MB
   - Measure: Monitor memory usage under load

4. **Cache Operation Latency**
   - Target: L1 get <1ms, L2 get <5ms
   - Measure: Average latency for cache operations

## Monitoring and Observability

### Metrics to Track

1. **Cache Performance**
   - Hit rate (overall, per data type)
   - Miss rate
   - Average latency (L1, L2)
   - Operations per second

2. **Resource Usage**
   - L1 cache size (entries, memory)
   - L2 cache memory usage
   - Eviction rate
   - Connection pool usage

3. **Cache Warming**
   - Warming execution time
   - Entries loaded per strategy
   - Warming success/failure rate

### Monitoring Endpoints

```python
# GET /api/admin/cache/stats
# Returns current cache statistics

# GET /api/admin/cache/config
# Returns cache configuration

# POST /api/admin/cache/warm
# Triggers manual cache warming

# DELETE /api/admin/cache/clear
# Clears cache (with optional pattern)
```

### Logging Strategy

**Log Levels:**
- DEBUG: Cache hits/misses, key generation
- INFO: Cache warming completion, configuration changes
- WARNING: High miss rate, eviction rate, slow operations
- ERROR: Connection failures, operation errors

**Log Format:**
```
[timestamp] [level] [component] [operation] key=<key> latency=<ms> result=<hit|miss|error>
```

## Deployment Considerations

### Redis Configuration

**Required Settings:**
```
maxmemory 512mb
maxmemory-policy allkeys-lru
maxmemory-samples 5
```

### Environment Variables

```bash
# Cache configuration
CACHE_L1_MAX_SIZE=1000
CACHE_L1_DEFAULT_TTL=300
CACHE_L2_DEFAULT_TTL=3600

# Cache warming
CACHE_WARMING_ENABLED=true
CACHE_WARMING_SCHEDULE="0 */6 * * *"  # Every 6 hours

# Monitoring
CACHE_STATS_ENABLED=true
CACHE_STATS_WINDOW=3600
```

### Migration Strategy

1. **Phase 1:** Deploy statistics collection (no behavior change)
2. **Phase 2:** Deploy enhanced key generation (backward compatible)
3. **Phase 3:** Deploy in-memory cache layer (opt-in per endpoint)
4. **Phase 4:** Deploy cache warming (manual trigger first)
5. **Phase 5:** Enable automatic warming and full multi-level caching

### Rollback Plan

- Statistics collection: Can be disabled via feature flag
- In-memory cache: Can be bypassed by setting max_size=0
- Cache warming: Can be disabled via configuration
- All changes backward compatible with existing cache keys
