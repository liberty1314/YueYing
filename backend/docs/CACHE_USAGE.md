# Redis 缓存系统使用指南

## 📋 概述

本项目提供了完整的 Redis 缓存解决方案，包括：

- **缓存管理器**：同步和异步的缓存操作
- **缓存装饰器**：简化函数结果缓存
- **缓存键生成器**：统一的键命名规范
- **缓存失效策略**：灵活的缓存管理

---

## 🚀 快速开始

### 1. 基础使用

```python
from app.core.cache import cache_manager

# 设置缓存
cache_manager.set("user:123", {"name": "John", "age": 30}, expire=3600)

# 获取缓存
user = cache_manager.get("user:123")

# 删除缓存
cache_manager.delete("user:123")
```

### 2. 使用装饰器

```python
from app.core.cache import cached
from app.utils.cache_keys import CacheKeys, CacheTTL

@cached(prefix=CacheKeys.USER_BY_ID, expire=CacheTTL.LONG)
def get_user_by_id(user_id: int):
    # 这个函数的结果会被自动缓存
    user = db.query(User).filter(User.id == user_id).first()
    return user

# 第一次调用会执行函数并缓存结果
user = get_user_by_id(123)

# 第二次调用会直接从缓存返回
user = get_user_by_id(123)
```

### 3. 异步使用

```python
from app.core.cache import async_cached, async_cache_manager

@async_cached(prefix="user:profile", expire=3600)
async def get_user_profile(user_id: int):
    # 异步函数也可以使用缓存
    user = await db.fetch_user(user_id)
    return user

# 调用异步函数
user = await get_user_profile(123)
```

---

## 📚 详细文档

### CacheManager 类

#### 基本方法

##### get(key: str) -> Optional[Any]

获取缓存值。

```python
value = cache_manager.get("user:123")
```

##### set(key: str, value: Any, expire: int = None) -> bool

设置缓存。

```python
# 设置永久缓存
cache_manager.set("key", "value")

# 设置带过期时间的缓存（秒）
cache_manager.set("key", "value", expire=3600)

# 仅当键不存在时设置（nx=True）
cache_manager.set("key", "value", expire=3600, nx=True)

# 仅当键存在时设置（xx=True）
cache_manager.set("key", "value", xx=True)
```

**支持的数据类型**：
- 字符串
- 数字（int, float）
- 字典
- 列表
- 元组

##### delete(*keys: str) -> int

删除一个或多个缓存键。

```python
# 删除单个键
cache_manager.delete("user:123")

# 删除多个键
cache_manager.delete("user:123", "user:456", "user:789")
```

##### delete_pattern(pattern: str) -> int

根据模式批量删除缓存。

```python
# 删除所有用户缓存
cache_manager.delete_pattern("user:*")

# 删除特定模式的缓存
cache_manager.delete_pattern("tmdb:movie:*")
```

##### exists(*keys: str) -> int

检查键是否存在，返回存在的键数量。

```python
# 检查单个键
if cache_manager.exists("user:123"):
    print("用户缓存存在")

# 检查多个键
count = cache_manager.exists("user:1", "user:2", "user:3")
print(f"存在 {count} 个键")
```

##### expire(key: str, seconds: int) -> bool

设置键的过期时间。

```python
# 设置5分钟后过期
cache_manager.expire("user:123", 300)
```

##### ttl(key: str) -> int

获取键的剩余过期时间（秒）。

```python
ttl = cache_manager.ttl("user:123")
if ttl == -1:
    print("键永不过期")
elif ttl == -2:
    print("键不存在")
else:
    print(f"键将在 {ttl} 秒后过期")
```

##### increment(key: str, amount: int = 1) -> int

增加计数器。

```python
# 增加1
cache_manager.increment("page_views")

# 增加指定量
cache_manager.increment("page_views", 10)
```

##### decrement(key: str, amount: int = 1) -> int

减少计数器。

```python
# 减少1
cache_manager.decrement("items_left")

# 减少指定量
cache_manager.decrement("items_left", 5)
```

---

### 缓存装饰器

#### @cached 装饰器

用于同步函数的缓存装饰器。

**参数**：
- `prefix`: 缓存键前缀（必需）
- `expire`: 过期时间（秒），None 表示永不过期
- `key_builder`: 自定义键生成函数

**基本用法**：

```python
from app.core.cache import cached
from app.utils.cache_keys import CacheKeys, CacheTTL

@cached(prefix=CacheKeys.USER_BY_ID, expire=CacheTTL.LONG)
def get_user(user_id: int):
    return {"id": user_id, "name": "John"}
```

**自定义键生成器**：

```python
def custom_key(user_id: int, include_stats: bool = False):
    # 忽略 include_stats 参数，只用 user_id 生成键
    return f"user:profile:{user_id}"

@cached(prefix="user:profile", key_builder=custom_key)
def get_user_profile(user_id: int, include_stats: bool = False):
    profile = fetch_user_profile(user_id)
    if include_stats:
        profile["stats"] = fetch_stats(user_id)
    return profile
```

**缓存失效**：

```python
@cached(prefix="user", expire=3600)
def get_user(user_id: int):
    return fetch_user_from_db(user_id)

# 使单个缓存失效
get_user.invalidate(123)

# 使所有相关缓存失效
get_user.invalidate_all()
```

#### @async_cached 装饰器

用于异步函数的缓存装饰器。

```python
from app.core.cache import async_cached

@async_cached(prefix="user:async", expire=3600)
async def get_user_async(user_id: int):
    user = await db.fetch_user(user_id)
    return user

# 使用
user = await get_user_async(123)

# 缓存失效
await get_user_async.invalidate(123)
await get_user_async.invalidate_all()
```

---

### CacheKeyGenerator 类

用于生成统一格式的缓存键。

#### generate_key(prefix: str, *args, **kwargs) -> str

生成缓存键。

```python
from app.core.cache import CacheKeyGenerator

# 简单键
key = CacheKeyGenerator.generate_key("user", 123)
# 结果: "user:123"

# 带关键字参数的键
key = CacheKeyGenerator.generate_key("search", "python", page=1, limit=20)
# 结果: "search:python:limit:20:page:1"

# 长键自动使用哈希
long_key = CacheKeyGenerator.generate_key("prefix", *["a" * 50 for _ in range(10)])
# 结果: "prefix:hash:abc123..."
```

#### generate_pattern(prefix: str, pattern: str = "*") -> str

生成缓存键匹配模式。

```python
# 匹配所有用户缓存
pattern = CacheKeyGenerator.generate_pattern("user")
# 结果: "user:*"

# 匹配特定模式
pattern = CacheKeyGenerator.generate_pattern("user", "admin:*")
# 结果: "user:admin:*"
```

---

## 🔑 缓存键规范

### 使用预定义常量

```python
from app.utils.cache_keys import CacheKeys, CacheTTL

# 用户缓存
cache_manager.set(
    f"{CacheKeys.USER_BY_ID}:{user_id}",
    user_data,
    expire=CacheTTL.LONG
)

# API 缓存
cache_manager.set(
    f"{CacheKeys.TMDB_MOVIE}:{movie_id}",
    movie_data,
    expire=CacheTTL.API_CACHE
)
```

### 可用的缓存键前缀

```python
# 用户相关
CacheKeys.USER_BY_ID          # user:id
CacheKeys.USER_BY_EMAIL       # user:email
CacheKeys.USER_SETTINGS       # user:settings

# 内容相关
CacheKeys.ITEM_BY_ID          # item:id
CacheKeys.ITEM_SEARCH         # item:search

# 第三方 API
CacheKeys.TMDB_MOVIE          # tmdb:movie
CacheKeys.DOUBAN_BOOK         # douban:book
CacheKeys.GOOGLE_BOOKS        # google:books

# 统计数据
CacheKeys.STATS_USER          # stats:user
CacheKeys.STATS_SYSTEM        # stats:system

# 限流
CacheKeys.RATE_LIMIT_API      # ratelimit:api
CacheKeys.RATE_LIMIT_USER     # ratelimit:user
```

### 可用的 TTL 常量

```python
CacheTTL.SHORT        # 5分钟
CacheTTL.MEDIUM       # 30分钟
CacheTTL.LONG         # 1小时
CacheTTL.VERY_LONG    # 1天
CacheTTL.API_CACHE    # 1小时（第三方API）
CacheTTL.SESSION      # 7天（用户会话）
CacheTTL.NEVER        # 永不过期
```

---

## 💡 最佳实践

### 1. 使用有意义的缓存键

```python
# ✅ 好的做法
cache_key = f"{CacheKeys.USER_BY_ID}:{user_id}"

# ❌ 避免
cache_key = f"u:{user_id}"
```

### 2. 设置合理的过期时间

```python
# ✅ 使用预定义常量
cache_manager.set(key, value, expire=CacheTTL.LONG)

# ✅ 根据数据特性设置
cache_manager.set(key, frequently_changing_data, expire=CacheTTL.SHORT)
cache_manager.set(key, rarely_changing_data, expire=CacheTTL.VERY_LONG)

# ❌ 避免永久缓存易变数据
cache_manager.set(key, user_activity, expire=None)  # 不推荐
```

### 3. 及时清理缓存

```python
def update_user(user_id: int, data: dict):
    # 更新数据库
    db.update_user(user_id, data)
    
    # 清理相关缓存
    cache_manager.delete(f"{CacheKeys.USER_BY_ID}:{user_id}")
    cache_manager.delete(f"{CacheKeys.USER_SETTINGS}:{user_id}")
```

### 4. 使用装饰器简化代码

```python
# ✅ 使用装饰器
@cached(prefix=CacheKeys.USER_BY_ID, expire=CacheTTL.LONG)
def get_user(user_id: int):
    return db.query_user(user_id)

# ❌ 手动管理缓存（不推荐）
def get_user(user_id: int):
    cache_key = f"user:{user_id}"
    cached = cache_manager.get(cache_key)
    if cached:
        return cached
    user = db.query_user(user_id)
    cache_manager.set(cache_key, user, expire=3600)
    return user
```

### 5. 处理缓存穿透

```python
@cached(prefix="item", expire=CacheTTL.MEDIUM)
def get_item(item_id: int):
    item = db.query(Item).filter(Item.id == item_id).first()
    
    # 即使查询结果为空也缓存，避免缓存穿透
    if item is None:
        return {"_not_found": True}
    
    return item_to_dict(item)
```

### 6. 使用模式匹配批量操作

```python
# 清理某个用户的所有缓存
cache_manager.delete_pattern(f"user:{user_id}:*")

# 清理所有TMDB缓存
cache_manager.delete_pattern(f"{CacheKeys.TMDB_MOVIE}:*")
```

---

## 🧪 测试示例

```python
import pytest
from app.core.cache import cached, cache_manager

def test_cached_function():
    call_count = [0]
    
    @cached(prefix="test", expire=60)
    def expensive_function(x: int):
        call_count[0] += 1
        return x * 2
    
    # 第一次调用
    result1 = expensive_function(5)
    assert result1 == 10
    assert call_count[0] == 1
    
    # 第二次调用（从缓存）
    result2 = expensive_function(5)
    assert result2 == 10
    assert call_count[0] == 1  # 未增加
    
    # 清理
    expensive_function.invalidate(5)
```

---

## ⚠️ 注意事项

### 1. 缓存雪崩

避免大量缓存同时过期：

```python
import random

# ✅ 添加随机过期时间
expire_time = CacheTTL.LONG + random.randint(0, 300)  # ±5分钟
cache_manager.set(key, value, expire=expire_time)
```

### 2. 缓存击穿

对于热点数据，使用锁保护：

```python
from threading import Lock

lock = Lock()

def get_hot_item(item_id: int):
    cache_key = f"hot_item:{item_id}"
    
    # 尝试从缓存获取
    item = cache_manager.get(cache_key)
    if item:
        return item
    
    # 使用锁避免多个请求同时查询数据库
    with lock:
        # 双重检查
        item = cache_manager.get(cache_key)
        if item:
            return item
        
        # 从数据库查询
        item = db.query_item(item_id)
        cache_manager.set(cache_key, item, expire=CacheTTL.LONG)
        return item
```

### 3. 内存管理

定期监控 Redis 内存使用：

```python
def get_cache_stats():
    info = cache_manager.redis.info("memory")
    return {
        "used_memory": info["used_memory_human"],
        "max_memory": info.get("maxmemory_human", "unlimited"),
    }
```

---

## 📊 性能监控

```python
import time
from app.core.logging import logger

def cached_with_monitoring(prefix: str, expire: int = None):
    def decorator(func):
        @functools.wraps(func)
        def wrapper(*args, **kwargs):
            cache_key = CacheKeyGenerator.generate_key(prefix, *args, **kwargs)
            
            # 尝试从缓存获取
            start_time = time.time()
            cached_value = cache_manager.get(cache_key)
            cache_time = time.time() - start_time
            
            if cached_value is not None:
                logger.info(f"Cache HIT: {cache_key} ({cache_time:.4f}s)")
                return cached_value
            
            # 执行函数
            start_time = time.time()
            result = func(*args, **kwargs)
            exec_time = time.time() - start_time
            
            logger.info(f"Cache MISS: {cache_key} (exec: {exec_time:.4f}s)")
            
            # 存入缓存
            if result is not None:
                cache_manager.set(cache_key, result, expire=expire)
            
            return result
        return wrapper
    return decorator
```

---

## 🔗 相关文档

- [Redis 官方文档](https://redis.io/documentation)
- [FastAPI 缓存最佳实践](https://fastapi.tiangolo.com/advanced/middleware/)
- [Python redis-py 文档](https://redis-py.readthedocs.io/)

---

**版本**: v1.0.0  
**更新日期**: 2025年10月24日  
**项目**: 阅影·log（YueYing）

