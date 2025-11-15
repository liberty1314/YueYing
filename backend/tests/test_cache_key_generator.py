"""
缓存键生成器测试
"""
import pytest
from app.core.cache import CacheKeyGenerator
from app.core.cache_key_utils import (
    CacheKeyPattern,
    CacheKeyValidator,
    CacheKeyMigrator
)


class TestCacheKeyGenerator:
    """测试缓存键生成器"""
    
    def test_generate_key_basic(self):
        """测试基本键生成"""
        key = CacheKeyGenerator.generate_key("test", "123", "456")
        assert key == "test:123:456"
    
    def test_generate_key_with_kwargs(self):
        """测试带关键字参数的键生成"""
        key = CacheKeyGenerator.generate_key(
            "test", "123",
            status="active",
            type="user"
        )
        # 关键字参数按字母顺序排列
        assert key == "test:123:status:active:type:user"
    
    def test_generate_key_long_hash(self):
        """测试长键自动哈希"""
        # 生成一个超长的键
        long_value = "x" * 300
        key = CacheKeyGenerator.generate_key("test", long_value)
        
        # 应该被哈希
        assert key.startswith("test:hash:")
        assert len(key) < 100  # 哈希后的键应该更短
    
    def test_generate_hierarchical_key_basic(self):
        """测试层次化键生成 - 基本用法"""
        key = CacheKeyGenerator.generate_hierarchical_key(
            "api", "movie", "550"
        )
        assert key == "api:movie:550"
    
    def test_generate_hierarchical_key_with_args(self):
        """测试层次化键生成 - 带额外参数"""
        key = CacheKeyGenerator.generate_hierarchical_key(
            "api", "movie", "tmdb", "550"
        )
        assert key == "api:movie:tmdb:550"
    
    def test_generate_hierarchical_key_with_kwargs(self):
        """测试层次化键生成 - 带查询参数"""
        key = CacheKeyGenerator.generate_hierarchical_key(
            "search", "movie", "query_abc",
            page=1,
            limit=20
        )
        assert key == "search:movie:query_abc:limit=20&page=1"
    
    def test_generate_hierarchical_key_filter_none(self):
        """测试层次化键生成 - 过滤 None 值"""
        key = CacheKeyGenerator.generate_hierarchical_key(
            "user", "123", "items",
            status="watching",
            type=None
        )
        assert key == "user:123:items:status=watching"
        assert "type" not in key
    
    def test_generate_hierarchical_key_long_hash(self):
        """测试层次化键生成 - 长键哈希保留前缀"""
        long_value = "x" * 300
        key = CacheKeyGenerator.generate_hierarchical_key(
            "api", "movie", long_value
        )
        
        # 应该被哈希，但保留服务和实体类型前缀
        assert key.startswith("api:movie:hash:")
    
    def test_generate_user_key_basic(self):
        """测试用户键生成 - 基本用法"""
        key = CacheKeyGenerator.generate_user_key(123, "profile")
        assert key == "user:123:profile"
    
    def test_generate_user_key_with_identifier(self):
        """测试用户键生成 - 带标识符"""
        key = CacheKeyGenerator.generate_user_key(123, "items", "456")
        assert key == "user:123:items:456"
    
    def test_generate_user_key_with_params(self):
        """测试用户键生成 - 带参数"""
        key = CacheKeyGenerator.generate_user_key(
            123, "items",
            status="watching",
            sort="date"
        )
        assert key == "user:123:items:sort=date&status=watching"
    
    def test_parse_key_basic(self):
        """测试键解析 - 基本结构"""
        result = CacheKeyGenerator.parse_key("api:movie:550")
        
        assert result["service"] == "api"
        assert result["entity_type"] == "movie"
        assert result["identifier"] == "550"
        assert result["is_hashed"] is False
    
    def test_parse_key_with_params(self):
        """测试键解析 - 带参数"""
        result = CacheKeyGenerator.parse_key(
            "search:movie:query:limit=20&page=1"
        )
        
        assert result["service"] == "search"
        assert result["entity_type"] == "movie"
        assert result["identifier"] == "query"
        assert result["params"] == {"limit": "20", "page": "1"}
    
    def test_parse_key_hashed(self):
        """测试键解析 - 哈希键"""
        result = CacheKeyGenerator.parse_key(
            "api:movie:hash:abc123def456"
        )
        
        assert result["service"] == "api"
        assert result["entity_type"] == "movie"
        assert result["is_hashed"] is True
        assert result["hash"] == "abc123def456"
    
    def test_parse_key_invalid(self):
        """测试键解析 - 无效键"""
        result = CacheKeyGenerator.parse_key("invalid")
        
        assert result["service"] == "invalid"
        assert result["entity_type"] == ""
        assert result["identifier"] == ""
    
    def test_generate_pattern_basic(self):
        """测试模式生成 - 基本用法"""
        pattern = CacheKeyGenerator.generate_pattern("test")
        assert pattern == "test:*"
    
    def test_generate_pattern_custom(self):
        """测试模式生成 - 自定义模式"""
        pattern = CacheKeyGenerator.generate_pattern("test", "123:*")
        assert pattern == "test:123:*"
    
    def test_generate_hierarchical_pattern_service_only(self):
        """测试层次化模式生成 - 仅服务"""
        pattern = CacheKeyGenerator.generate_hierarchical_pattern("user")
        assert pattern == "user:*"
    
    def test_generate_hierarchical_pattern_with_entity(self):
        """测试层次化模式生成 - 服务和实体"""
        pattern = CacheKeyGenerator.generate_hierarchical_pattern("user", "123")
        assert pattern == "user:123:*"
    
    def test_generate_hierarchical_pattern_full(self):
        """测试层次化模式生成 - 完整路径"""
        pattern = CacheKeyGenerator.generate_hierarchical_pattern(
            "user", "123", "items"
        )
        assert pattern == "user:123:items:*"
    
    def test_validate_key_valid(self):
        """测试键验证 - 有效键"""
        assert CacheKeyGenerator.validate_key("api:movie:550") is True
        assert CacheKeyGenerator.validate_key("user:123:profile") is True
        assert CacheKeyGenerator.validate_key("search:book:query=test") is True
    
    def test_validate_key_invalid_empty(self):
        """测试键验证 - 空键"""
        assert CacheKeyGenerator.validate_key("") is False
        assert CacheKeyGenerator.validate_key(None) is False
    
    def test_validate_key_invalid_no_colon(self):
        """测试键验证 - 缺少冒号"""
        assert CacheKeyGenerator.validate_key("invalid") is False
    
    def test_validate_key_invalid_characters(self):
        """测试键验证 - 非法字符"""
        assert CacheKeyGenerator.validate_key("test:key:with spaces") is False
        assert CacheKeyGenerator.validate_key("test:key:with中文") is False
    
    def test_validate_key_too_long(self):
        """测试键验证 - 过长"""
        long_key = "test:" + "x" * 500
        assert CacheKeyGenerator.validate_key(long_key) is False


class TestCacheKeyPattern:
    """测试缓存键模式匹配工具"""
    
    def test_match_pattern_exact(self):
        """测试精确匹配"""
        assert CacheKeyPattern.match_pattern("test:123", "test:123") is True
        assert CacheKeyPattern.match_pattern("test:123", "test:456") is False
    
    def test_match_pattern_wildcard_star(self):
        """测试通配符 * 匹配"""
        assert CacheKeyPattern.match_pattern("test:123:abc", "test:*") is True
        assert CacheKeyPattern.match_pattern("test:123:abc", "test:123:*") is True
        assert CacheKeyPattern.match_pattern("user:456:profile", "user:*:profile") is True
    
    def test_match_pattern_wildcard_question(self):
        """测试通配符 ? 匹配"""
        assert CacheKeyPattern.match_pattern("test:1", "test:?") is True
        assert CacheKeyPattern.match_pattern("test:12", "test:?") is False
        assert CacheKeyPattern.match_pattern("test:12", "test:??") is True
    
    def test_extract_service(self):
        """测试提取服务命名空间"""
        assert CacheKeyPattern.extract_service("api:movie:550") == "api"
        assert CacheKeyPattern.extract_service("user:123:profile") == "user"
        assert CacheKeyPattern.extract_service("invalid") == "invalid"
    
    def test_extract_entity_type(self):
        """测试提取实体类型"""
        assert CacheKeyPattern.extract_entity_type("api:movie:550") == "movie"
        assert CacheKeyPattern.extract_entity_type("user:123:profile") == "123"
        assert CacheKeyPattern.extract_entity_type("invalid") is None
    
    def test_extract_user_id(self):
        """测试提取用户ID"""
        assert CacheKeyPattern.extract_user_id("user:123:profile") == 123
        assert CacheKeyPattern.extract_user_id("user:456:items:789") == 456
        assert CacheKeyPattern.extract_user_id("api:movie:550") is None
        assert CacheKeyPattern.extract_user_id("user:abc:profile") is None
    
    def test_group_keys_by_service(self):
        """测试按服务分组"""
        keys = [
            "api:movie:1",
            "api:movie:2",
            "user:123:profile",
            "user:456:items",
            "search:book:query"
        ]
        
        groups = CacheKeyPattern.group_keys_by_service(keys)
        
        assert len(groups) == 3
        assert len(groups["api"]) == 2
        assert len(groups["user"]) == 2
        assert len(groups["search"]) == 1
    
    def test_group_keys_by_entity(self):
        """测试按实体类型分组"""
        keys = [
            "api:movie:1",
            "api:movie:2",
            "api:book:3",
            "user:123:profile",
            "user:456:profile"
        ]
        
        groups = CacheKeyPattern.group_keys_by_entity(keys)
        
        # 注意：对于用户键，第二部分是用户ID，所以会被当作实体类型
        # 这是预期行为，因为 extract_entity_type 只是简单地提取第二部分
        assert len(groups) == 4  # movie, book, 123, 456
        assert len(groups["movie"]) == 2
        assert len(groups["book"]) == 1
        assert len(groups["123"]) == 1
        assert len(groups["456"]) == 1


class TestCacheKeyValidator:
    """测试缓存键验证工具"""
    
    def test_validate_service_valid(self):
        """测试验证有效的服务命名空间"""
        assert CacheKeyValidator.validate_service("user") is True
        assert CacheKeyValidator.validate_service("api") is True
        assert CacheKeyValidator.validate_service("search") is True
    
    def test_validate_service_invalid(self):
        """测试验证无效的服务命名空间"""
        assert CacheKeyValidator.validate_service("unknown") is False
        assert CacheKeyValidator.validate_service("invalid") is False
    
    def test_validate_key_format_valid(self):
        """测试验证有效的键格式"""
        is_valid, error = CacheKeyValidator.validate_key_format("api:movie:550")
        assert is_valid is True
        assert error is None
    
    def test_validate_key_format_empty(self):
        """测试验证空键"""
        is_valid, error = CacheKeyValidator.validate_key_format("")
        assert is_valid is False
        assert "empty" in error.lower()
    
    def test_validate_key_format_too_long(self):
        """测试验证过长的键"""
        long_key = "test:" + "x" * 300
        is_valid, error = CacheKeyValidator.validate_key_format(long_key)
        assert is_valid is False
        assert "too long" in error.lower()
    
    def test_validate_key_format_invalid_chars(self):
        """测试验证包含非法字符的键"""
        is_valid, error = CacheKeyValidator.validate_key_format("test:key with spaces")
        assert is_valid is False
        assert "invalid characters" in error.lower()
    
    def test_validate_key_format_no_colon(self):
        """测试验证缺少冒号的键"""
        is_valid, error = CacheKeyValidator.validate_key_format("invalid")
        assert is_valid is False
        assert "colon" in error.lower()
    
    def test_validate_keys_batch(self):
        """测试批量验证键"""
        keys = [
            "api:movie:550",  # 有效
            "user:123:profile",  # 有效
            "invalid",  # 无效 - 缺少冒号
            "test:key with spaces",  # 无效 - 非法字符
        ]
        
        result = CacheKeyValidator.validate_keys(keys)
        
        assert len(result["valid"]) == 2
        assert len(result["invalid"]) == 2
        assert result["valid"][0] == "api:movie:550"
        assert result["valid"][1] == "user:123:profile"


class TestCacheKeyMigrator:
    """测试缓存键迁移工具"""
    
    def test_migrate_user_items(self):
        """测试迁移用户项目键"""
        old_key = "user_items:123:filter:status=watching"
        new_key = CacheKeyMigrator.migrate_old_to_hierarchical(old_key)
        assert new_key == "user:123:items:filter:status=watching"
    
    def test_migrate_user_profile(self):
        """测试迁移用户资料键"""
        old_key = "user_profile:456"
        new_key = CacheKeyMigrator.migrate_old_to_hierarchical(old_key)
        assert new_key == "user:456:profile"
    
    def test_migrate_tmdb_movie(self):
        """测试迁移 TMDB 电影键"""
        old_key = "tmdb_movie:550"
        new_key = CacheKeyMigrator.migrate_old_to_hierarchical(old_key)
        assert new_key == "api:movie:tmdb:550"
    
    def test_migrate_google_books(self):
        """测试迁移 Google Books 键"""
        old_key = "google_books:abc123"
        new_key = CacheKeyMigrator.migrate_old_to_hierarchical(old_key)
        assert new_key == "api:book:google:abc123"
    
    def test_migrate_search(self):
        """测试迁移搜索键"""
        old_key = "search_movie:query_hash"
        new_key = CacheKeyMigrator.migrate_old_to_hierarchical(old_key)
        assert new_key == "search:movie:query_hash"
    
    def test_migrate_stats(self):
        """测试迁移统计键"""
        old_key = "stats_overview:789"
        new_key = CacheKeyMigrator.migrate_old_to_hierarchical(old_key)
        assert new_key == "stats:789:overview"
    
    def test_migrate_unknown_format(self):
        """测试迁移未知格式的键"""
        old_key = "unknown_format:123"
        new_key = CacheKeyMigrator.migrate_old_to_hierarchical(old_key)
        assert new_key is None
    
    def test_generate_migration_plan(self):
        """测试生成迁移计划"""
        old_keys = [
            "user_items:123:filter",
            "tmdb_movie:550",
            "unknown_format:abc",
            "user_profile:456"
        ]
        
        plan = CacheKeyMigrator.generate_migration_plan(old_keys)
        
        assert plan["total"] == 4
        assert plan["migratable_count"] == 3
        assert plan["non_migratable_count"] == 1
        assert len(plan["migratable"]) == 3
        assert len(plan["non_migratable"]) == 1
    
    def test_suggest_new_key_format_migratable(self):
        """测试建议新格式 - 可迁移的键"""
        old_key = "user_items:123:filter"
        suggestion = CacheKeyMigrator.suggest_new_key_format(old_key)
        assert suggestion == "user:123:items:filter"
    
    def test_suggest_new_key_format_unknown(self):
        """测试建议新格式 - 未知格式的键"""
        old_key = "unknown:format:123"
        suggestion = CacheKeyMigrator.suggest_new_key_format(old_key)
        assert suggestion.startswith("cache:")


class TestCacheKeyGeneratorIntegration:
    """测试缓存键生成器集成场景"""
    
    def test_user_workflow(self):
        """测试用户相关的完整工作流"""
        user_id = 123
        
        # 生成用户资料键
        profile_key = CacheKeyGenerator.generate_user_key(user_id, "profile")
        assert profile_key == "user:123:profile"
        
        # 生成用户项目列表键
        items_key = CacheKeyGenerator.generate_user_key(
            user_id, "items",
            status="watching",
            sort="date"
        )
        assert "user:123:items" in items_key
        assert "status=watching" in items_key
        
        # 生成用户统计键
        stats_key = CacheKeyGenerator.generate_user_key(user_id, "stats")
        assert stats_key == "user:123:stats"
        
        # 生成删除模式
        pattern = CacheKeyGenerator.generate_hierarchical_pattern("user", str(user_id))
        assert pattern == "user:123:*"
    
    def test_api_workflow(self):
        """测试外部 API 相关的完整工作流"""
        # TMDB 电影详情
        movie_key = CacheKeyGenerator.generate_hierarchical_key(
            "api", "movie", "tmdb", "550"
        )
        assert movie_key == "api:movie:tmdb:550"
        
        # Google Books 搜索
        search_key = CacheKeyGenerator.generate_hierarchical_key(
            "api", "book", "google", "search",
            q="python",
            page=1
        )
        assert "api:book:google:search" in search_key
        
        # 解析键
        parsed = CacheKeyGenerator.parse_key(movie_key)
        assert parsed["service"] == "api"
        assert parsed["entity_type"] == "movie"
    
    def test_search_workflow(self):
        """测试搜索相关的完整工作流"""
        import hashlib
        
        # 生成查询哈希
        query = "science fiction movies"
        query_hash = hashlib.md5(query.encode()).hexdigest()[:8]
        
        # 生成搜索结果键
        search_key = CacheKeyGenerator.generate_hierarchical_key(
            "search", "movie", query_hash,
            page=1,
            limit=20
        )
        
        assert "search:movie" in search_key
        assert query_hash in search_key
        
        # 验证键
        assert CacheKeyGenerator.validate_key(search_key) is True
