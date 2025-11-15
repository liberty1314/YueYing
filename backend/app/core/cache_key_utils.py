"""
缓存键工具函数

提供键模式匹配、验证和迁移功能
"""
import re
from typing import List, Dict, Optional, Tuple
from app.core.logging import logger


class CacheKeyPattern:
    """缓存键模式匹配工具"""
    
    @staticmethod
    def match_pattern(key: str, pattern: str) -> bool:
        """
        检查键是否匹配给定的模式
        
        支持 Redis 风格的通配符:
        - * 匹配任意数量的字符
        - ? 匹配单个字符
        - [abc] 匹配括号内的任意字符
        
        Args:
            key: 缓存键
            pattern: 匹配模式

        Returns:
            是否匹配
        """
        # 将 Redis 模式转换为正则表达式
        regex_pattern = pattern.replace("*", ".*").replace("?", ".")
        regex_pattern = f"^{regex_pattern}$"
        
        try:
            return bool(re.match(regex_pattern, key))
        except re.error:
            logger.error(f"Invalid pattern: {pattern}")
            return False
    
    @staticmethod
    def extract_service(key: str) -> Optional[str]:
        """
        从键中提取服务命名空间
        
        Args:
            key: 缓存键

        Returns:
            服务命名空间，如果无法提取则返回 None
        """
        parts = key.split(":", 1)
        return parts[0] if parts else None
    
    @staticmethod
    def extract_entity_type(key: str) -> Optional[str]:
        """
        从键中提取实体类型
        
        Args:
            key: 缓存键

        Returns:
            实体类型，如果无法提取则返回 None
        """
        parts = key.split(":")
        return parts[1] if len(parts) > 1 else None
    
    @staticmethod
    def extract_user_id(key: str) -> Optional[int]:
        """
        从用户键中提取用户ID
        
        Args:
            key: 用户缓存键 (格式: user:{user_id}:...)

        Returns:
            用户ID，如果无法提取则返回 None
        """
        parts = key.split(":")
        if len(parts) >= 2 and parts[0] == "user":
            try:
                return int(parts[1])
            except ValueError:
                return None
        return None
    
    @staticmethod
    def group_keys_by_service(keys: List[str]) -> Dict[str, List[str]]:
        """
        按服务命名空间分组键
        
        Args:
            keys: 缓存键列表

        Returns:
            按服务分组的键字典
        """
        groups: Dict[str, List[str]] = {}
        
        for key in keys:
            service = CacheKeyPattern.extract_service(key)
            if service:
                if service not in groups:
                    groups[service] = []
                groups[service].append(key)
        
        return groups
    
    @staticmethod
    def group_keys_by_entity(keys: List[str]) -> Dict[str, List[str]]:
        """
        按实体类型分组键
        
        Args:
            keys: 缓存键列表

        Returns:
            按实体类型分组的键字典
        """
        groups: Dict[str, List[str]] = {}
        
        for key in keys:
            entity = CacheKeyPattern.extract_entity_type(key)
            if entity:
                if entity not in groups:
                    groups[entity] = []
                groups[entity].append(key)
        
        return groups


class CacheKeyValidator:
    """缓存键验证工具"""
    
    # 允许的服务命名空间
    VALID_SERVICES = {
        "user", "api", "search", "stats", "cache", 
        "session", "temp", "lock", "queue"
    }
    
    # 键长度限制
    MAX_KEY_LENGTH = 200
    MAX_HASHED_KEY_LENGTH = 400
    
    @staticmethod
    def validate_service(service: str) -> bool:
        """
        验证服务命名空间是否有效
        
        Args:
            service: 服务命名空间

        Returns:
            是否有效
        """
        return service in CacheKeyValidator.VALID_SERVICES
    
    @staticmethod
    def validate_key_format(key: str) -> Tuple[bool, Optional[str]]:
        """
        验证键格式
        
        Args:
            key: 缓存键

        Returns:
            (是否有效, 错误消息)
        """
        if not key:
            return False, "Key cannot be empty"
        
        if not isinstance(key, str):
            return False, "Key must be a string"
        
        # 检查长度
        if "hash:" in key:
            if len(key) > CacheKeyValidator.MAX_HASHED_KEY_LENGTH:
                return False, f"Hashed key too long (max {CacheKeyValidator.MAX_HASHED_KEY_LENGTH})"
        else:
            if len(key) > CacheKeyValidator.MAX_KEY_LENGTH:
                return False, f"Key too long (max {CacheKeyValidator.MAX_KEY_LENGTH})"
        
        # 检查字符
        if not re.match(r'^[a-zA-Z0-9:_\-=&.]+$', key):
            return False, "Key contains invalid characters"
        
        # 检查结构
        if ":" not in key:
            return False, "Key must contain at least one colon separator"
        
        parts = key.split(":")
        if len(parts) < 2:
            return False, "Key must have at least service and entity type"
        
        # 验证服务命名空间
        service = parts[0]
        if not CacheKeyValidator.validate_service(service):
            logger.warning(f"Unknown service namespace: {service}")
        
        return True, None
    
    @staticmethod
    def validate_keys(keys: List[str]) -> Dict[str, List[str]]:
        """
        批量验证键
        
        Args:
            keys: 缓存键列表

        Returns:
            包含有效键和无效键的字典
        """
        valid_keys = []
        invalid_keys = []
        
        for key in keys:
            is_valid, error = CacheKeyValidator.validate_key_format(key)
            if is_valid:
                valid_keys.append(key)
            else:
                invalid_keys.append((key, error))
                logger.debug(f"Invalid key: {key}, reason: {error}")
        
        return {
            "valid": valid_keys,
            "invalid": invalid_keys
        }


class CacheKeyMigrator:
    """缓存键迁移工具"""
    
    @staticmethod
    def migrate_old_to_hierarchical(old_key: str) -> Optional[str]:
        """
        将旧格式的键迁移到新的层次化格式
        
        旧格式示例:
        - user_items:123:filter:status=watching
        - tmdb_movie:550
        - stats_overview:456
        
        新格式示例:
        - user:123:items:status=watching
        - api:movie:tmdb:550
        - stats:456:overview
        
        Args:
            old_key: 旧格式的缓存键

        Returns:
            新格式的缓存键，如果无法迁移则返回 None
        """
        # 定义迁移规则
        migration_rules = [
            # 用户相关
            (r'^user_items:(\d+):(.+)$', r'user:\1:items:\2'),
            (r'^user_profile:(\d+)$', r'user:\1:profile'),
            (r'^user_stats:(\d+):(.+)$', r'user:\1:stats:\2'),
            
            # 外部 API
            (r'^tmdb_movie:(.+)$', r'api:movie:tmdb:\1'),
            (r'^tmdb_tv:(.+)$', r'api:tv:tmdb:\1'),
            (r'^google_books:(.+)$', r'api:book:google:\1'),
            (r'^bangumi:(.+)$', r'api:anime:bangumi:\1'),
            
            # 搜索
            (r'^search_(.+):(.+)$', r'search:\1:\2'),
            
            # 统计
            (r'^stats_(.+):(\d+)$', r'stats:\2:\1'),
        ]
        
        for pattern, replacement in migration_rules:
            match = re.match(pattern, old_key)
            if match:
                new_key = re.sub(pattern, replacement, old_key)
                logger.debug(f"Migrated key: {old_key} -> {new_key}")
                return new_key
        
        logger.warning(f"No migration rule found for key: {old_key}")
        return None
    
    @staticmethod
    def generate_migration_plan(
        old_keys: List[str]
    ) -> Dict[str, Dict[str, any]]:
        """
        生成键迁移计划
        
        Args:
            old_keys: 旧格式的缓存键列表

        Returns:
            迁移计划字典，包含可迁移和不可迁移的键
        """
        migratable = []
        non_migratable = []
        
        for old_key in old_keys:
            new_key = CacheKeyMigrator.migrate_old_to_hierarchical(old_key)
            if new_key:
                migratable.append({
                    "old_key": old_key,
                    "new_key": new_key
                })
            else:
                non_migratable.append(old_key)
        
        return {
            "migratable": migratable,
            "non_migratable": non_migratable,
            "total": len(old_keys),
            "migratable_count": len(migratable),
            "non_migratable_count": len(non_migratable)
        }
    
    @staticmethod
    def suggest_new_key_format(old_key: str) -> str:
        """
        为旧键建议新的格式
        
        Args:
            old_key: 旧格式的缓存键

        Returns:
            建议的新格式键
        """
        # 尝试自动迁移
        new_key = CacheKeyMigrator.migrate_old_to_hierarchical(old_key)
        if new_key:
            return new_key
        
        # 如果无法自动迁移，提供通用建议
        parts = old_key.split(":")
        if len(parts) >= 2:
            # 假设第一部分是类型，第二部分是ID
            return f"cache:{parts[0]}:{':'.join(parts[1:])}"
        
        return f"cache:unknown:{old_key}"
