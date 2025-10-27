"""
缓存系统单元测试
"""
import pytest
import time
from app.core.cache import (
    CacheKeyGenerator,
    CacheManager,
    AsyncCacheManager,
    cached,
    async_cached,
    cache_manager,
    async_cache_manager,
)


class TestCacheKeyGenerator:
    """测试缓存键生成器"""

    def test_generate_simple_key(self):
        """测试生成简单键"""
        key = CacheKeyGenerator.generate_key("user", 123)
        assert key == "user:123"

    def test_generate_key_with_kwargs(self):
        """测试生成带关键字参数的键"""
        key = CacheKeyGenerator.generate_key("user", 123, role="admin")
        assert key == "user:123:role:admin"

    def test_generate_key_with_multiple_kwargs(self):
        """测试生成多个关键字参数的键（按字母序）"""
        key = CacheKeyGenerator.generate_key(
            "search", query="python", page=1, limit=20
        )
        # 关键字参数按字母排序
        assert "search" in key
        assert "limit:20" in key
        assert "page:1" in key
        assert "query:python" in key

    def test_generate_long_key_uses_hash(self):
        """测试长键使用哈希"""
        long_args = ["a" * 50 for _ in range(10)]
        key = CacheKeyGenerator.generate_key("prefix", *long_args)
        # 长键应该使用哈希
        assert "hash:" in key
        assert len(key) < 300

    def test_generate_pattern(self):
        """测试生成模式"""
        pattern = CacheKeyGenerator.generate_pattern("user")
        assert pattern == "user:*"

        pattern = CacheKeyGenerator.generate_pattern("user", "admin:*")
        assert pattern == "user:admin:*"


class TestCacheManager:
    """测试缓存管理器"""

    @pytest.fixture(autouse=True)
    def setup(self):
        """每个测试前清理缓存"""
        cache_manager.delete_pattern("test:*")
        yield
        cache_manager.delete_pattern("test:*")

    def test_set_and_get_string(self):
        """测试设置和获取字符串"""
        key = "test:string"
        value = "hello world"

        assert cache_manager.set(key, value)
        assert cache_manager.get(key) == value

    def test_set_and_get_dict(self):
        """测试设置和获取字典"""
        key = "test:dict"
        value = {"name": "John", "age": 30}

        assert cache_manager.set(key, value)
        result = cache_manager.get(key)
        assert result == value

    def test_set_and_get_list(self):
        """测试设置和获取列表"""
        key = "test:list"
        value = [1, 2, 3, 4, 5]

        assert cache_manager.set(key, value)
        result = cache_manager.get(key)
        assert result == value

    def test_get_nonexistent_key(self):
        """测试获取不存在的键"""
        result = cache_manager.get("test:nonexistent")
        assert result is None

    def test_set_with_expire(self):
        """测试设置带过期时间的缓存"""
        key = "test:expire"
        value = "will expire"

        assert cache_manager.set(key, value, expire=1)
        assert cache_manager.get(key) == value

        # 等待过期
        time.sleep(1.1)
        assert cache_manager.get(key) is None

    def test_delete_single_key(self):
        """测试删除单个键"""
        key = "test:delete"
        cache_manager.set(key, "value")

        assert cache_manager.delete(key) == 1
        assert cache_manager.get(key) is None

    def test_delete_multiple_keys(self):
        """测试删除多个键"""
        keys = ["test:delete1", "test:delete2", "test:delete3"]
        for key in keys:
            cache_manager.set(key, "value")

        deleted = cache_manager.delete(*keys)
        assert deleted == 3

        for key in keys:
            assert cache_manager.get(key) is None

    def test_delete_pattern(self):
        """测试根据模式删除"""
        keys = ["test:pattern:1", "test:pattern:2", "test:pattern:3"]
        for key in keys:
            cache_manager.set(key, "value")

        deleted = cache_manager.delete_pattern("test:pattern:*")
        assert deleted == 3

    def test_exists(self):
        """测试检查键是否存在"""
        key = "test:exists"

        assert cache_manager.exists(key) == 0

        cache_manager.set(key, "value")
        assert cache_manager.exists(key) == 1

    def test_expire(self):
        """测试设置过期时间"""
        key = "test:expire_later"
        cache_manager.set(key, "value")

        assert cache_manager.expire(key, 1)
        assert cache_manager.get(key) == "value"

        time.sleep(1.1)
        assert cache_manager.get(key) is None

    def test_ttl(self):
        """测试获取TTL"""
        key = "test:ttl"

        # 不存在的键
        assert cache_manager.ttl(key) == -2

        # 永不过期的键
        cache_manager.set(key, "value")
        assert cache_manager.ttl(key) == -1

        # 有过期时间的键
        cache_manager.set(key, "value", expire=10)
        ttl = cache_manager.ttl(key)
        assert 0 < ttl <= 10

    def test_increment(self):
        """测试增加计数器"""
        key = "test:counter"

        # 第一次增加
        assert cache_manager.increment(key) == 1

        # 再次增加
        assert cache_manager.increment(key) == 2

        # 增加指定量
        assert cache_manager.increment(key, 5) == 7

    def test_decrement(self):
        """测试减少计数器"""
        key = "test:counter"
        cache_manager.set(key, 10)

        assert cache_manager.decrement(key) == 9
        assert cache_manager.decrement(key, 5) == 4


class TestCachedDecorator:
    """测试缓存装饰器"""

    @pytest.fixture(autouse=True)
    def setup(self):
        """每个测试前清理缓存"""
        cache_manager.delete_pattern("test:*")
        yield
        cache_manager.delete_pattern("test:*")

    def test_cached_function(self):
        """测试缓存函数"""
        call_count = [0]

        @cached(prefix="test:func", expire=60)
        def get_value(x: int):
            call_count[0] += 1
            return x * 2

        # 第一次调用，应该执行函数
        result1 = get_value(5)
        assert result1 == 10
        assert call_count[0] == 1

        # 第二次调用，应该从缓存获取
        result2 = get_value(5)
        assert result2 == 10
        assert call_count[0] == 1  # 函数未被再次调用

        # 不同参数，应该执行函数
        result3 = get_value(10)
        assert result3 == 20
        assert call_count[0] == 2

    def test_cached_invalidate(self):
        """测试缓存失效"""
        call_count = [0]

        @cached(prefix="test:inv", expire=60)
        def get_value(x: int):
            call_count[0] += 1
            return x * 2

        # 第一次调用
        result1 = get_value(5)
        assert result1 == 10
        assert call_count[0] == 1

        # 使缓存失效
        get_value.invalidate(5)

        # 再次调用，应该重新执行
        result2 = get_value(5)
        assert result2 == 10
        assert call_count[0] == 2

    def test_cached_invalidate_all(self):
        """测试失效所有缓存"""
        call_count = [0]

        @cached(prefix="test:inv_all", expire=60)
        def get_value(x: int):
            call_count[0] += 1
            return x * 2

        # 多次调用
        get_value(1)
        get_value(2)
        get_value(3)
        assert call_count[0] == 3

        # 使所有缓存失效
        get_value.invalidate_all()

        # 再次调用，应该重新执行
        get_value(1)
        get_value(2)
        get_value(3)
        assert call_count[0] == 6

    def test_cached_with_custom_key_builder(self):
        """测试自定义键生成器"""
        call_count = [0]

        def custom_key(user_id: int, **kwargs):
            return f"test:custom:{user_id}"

        @cached(prefix="test:custom", expire=60, key_builder=custom_key)
        def get_user(user_id: int, **kwargs):
            call_count[0] += 1
            return {"id": user_id, "name": "John"}

        # 第一次调用
        result1 = get_user(123, extra="ignored")
        assert result1["id"] == 123
        assert call_count[0] == 1

        # 使用相同user_id，即使extra参数不同，也应该从缓存获取
        result2 = get_user(123, extra="different")
        assert result2["id"] == 123
        assert call_count[0] == 1  # 未重新调用


@pytest.mark.asyncio
class TestAsyncCacheManager:
    """测试异步缓存管理器"""

    @pytest.fixture(autouse=True)
    async def setup(self):
        """每个测试前清理缓存"""
        await async_cache_manager.delete_pattern("test:*")
        yield
        await async_cache_manager.delete_pattern("test:*")

    async def test_async_set_and_get(self):
        """测试异步设置和获取"""
        key = "test:async"
        value = {"async": True}

        assert await async_cache_manager.set(key, value)
        result = await async_cache_manager.get(key)
        assert result == value

    async def test_async_delete(self):
        """测试异步删除"""
        key = "test:async_del"
        await async_cache_manager.set(key, "value")

        deleted = await async_cache_manager.delete(key)
        assert deleted == 1
        assert await async_cache_manager.get(key) is None


@pytest.mark.asyncio
class TestAsyncCachedDecorator:
    """测试异步缓存装饰器"""

    @pytest.fixture(autouse=True)
    async def setup(self):
        """每个测试前清理缓存"""
        await async_cache_manager.delete_pattern("test:*")
        yield
        await async_cache_manager.delete_pattern("test:*")

    async def test_async_cached_function(self):
        """测试异步缓存函数"""
        call_count = [0]

        @async_cached(prefix="test:async_func", expire=60)
        async def get_value(x: int):
            call_count[0] += 1
            return x * 2

        # 第一次调用
        result1 = await get_value(5)
        assert result1 == 10
        assert call_count[0] == 1

        # 第二次调用，从缓存获取
        result2 = await get_value(5)
        assert result2 == 10
        assert call_count[0] == 1

    async def test_async_cached_invalidate(self):
        """测试异步缓存失效"""
        call_count = [0]

        @async_cached(prefix="test:async_inv", expire=60)
        async def get_value(x: int):
            call_count[0] += 1
            return x * 2

        # 第一次调用
        await get_value(5)
        assert call_count[0] == 1

        # 使缓存失效
        await get_value.invalidate(5)

        # 再次调用
        await get_value(5)
        assert call_count[0] == 2

