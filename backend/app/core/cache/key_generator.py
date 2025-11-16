"""
缓存键生成器

提供多种缓存键生成策略，支持层次化命名空间
"""
import hashlib
from typing import Dict, Optional


class CacheKeyGenerator:
    """
    增强的缓存键生成器
    
    支持层次化命名空间和多种键生成策略
    """
    
    # 键结构常量
    MAX_KEY_LENGTH = 200
    HASH_PREFIX = "hash"
    
    @staticmethod
    def generate_key(prefix: str, *args, skip_first: bool = False, **kwargs) -> str:
        """
        生成缓存键（向后兼容的方法）

        Args:
            prefix: 缓存键前缀
            *args: 位置参数
            skip_first: 是否跳过第一个参数（用于跳过实例方法的 self）
            **kwargs: 关键字参数

        Returns:
            生成的缓存键
        """
        # 将参数转换为字符串
        key_parts = [prefix]

        # 处理位置参数（如果是实例方法，跳过 self）
        args_to_use = args[1:] if skip_first and args else args
        for arg in args_to_use:
            key_parts.append(str(arg))

        # 处理关键字参数（按键排序以保证一致性）
        for key in sorted(kwargs.keys()):
            value = kwargs[key]
            key_parts.append(f"{key}:{value}")

        # 生成键
        key_string = ":".join(key_parts)

        # 如果键太长，使用哈希
        if len(key_string) > CacheKeyGenerator.MAX_KEY_LENGTH:
            hash_suffix = hashlib.md5(key_string.encode()).hexdigest()
            return f"{prefix}:{CacheKeyGenerator.HASH_PREFIX}:{hash_suffix}"

        return key_string
    
    @staticmethod
    def generate_hierarchical_key(
        service: str,
        entity_type: str,
        identifier: str,
        *args,
        **kwargs
    ) -> str:
        """
        生成层次化缓存键
        
        键结构: {service}:{entity_type}:{identifier}[:params]
        
        Examples:
            - api:movie:tmdb:550
            - user:123:items:status=watching
            - search:book:query_hash:abc123
            - stats:456:overview:period=month
        
        Args:
            service: 服务命名空间 (api, user, search, stats等)
            entity_type: 实体类型 (movie, book, items, profile等)
            identifier: 唯一标识符 (ID, hash等)
            *args: 额外的路径参数
            **kwargs: 查询参数

        Returns:
            层次化缓存键
        """
        # 构建基础键部分
        key_parts = [service, entity_type, identifier]
        
        # 添加额外的路径参数
        for arg in args:
            key_parts.append(str(arg))
        
        # 添加查询参数（按键排序）
        if kwargs:
            params = []
            for key in sorted(kwargs.keys()):
                value = kwargs[key]
                # 过滤 None 值
                if value is not None:
                    params.append(f"{key}={value}")
            if params:
                key_parts.append("&".join(params))
        
        # 生成键
        key_string = ":".join(key_parts)
        
        # 如果键太长，使用哈希但保留前缀
        if len(key_string) > CacheKeyGenerator.MAX_KEY_LENGTH:
            # 保留服务和实体类型作为前缀
            prefix = f"{service}:{entity_type}"
            hash_suffix = hashlib.md5(key_string.encode()).hexdigest()
            return f"{prefix}:{CacheKeyGenerator.HASH_PREFIX}:{hash_suffix}"
        
        return key_string
    
    @staticmethod
    def generate_user_key(
        user_id: int,
        entity_type: str,
        identifier: Optional[str] = None,
        **kwargs
    ) -> str:
        """
        生成用户特定的缓存键
        
        这是 generate_hierarchical_key 的便捷方法，专门用于用户数据
        
        Examples:
            - user:123:profile
            - user:123:items:456
            - user:123:stats:overview
        
        Args:
            user_id: 用户ID
            entity_type: 实体类型 (profile, items, stats等)
            identifier: 可选的实体标识符
            **kwargs: 额外的查询参数

        Returns:
            用户特定的缓存键
        """
        if identifier:
            return CacheKeyGenerator.generate_hierarchical_key(
                "user", str(user_id), entity_type, identifier, **kwargs
            )
        else:
            return CacheKeyGenerator.generate_hierarchical_key(
                "user", str(user_id), entity_type, **kwargs
            )
    
    @staticmethod
    def parse_key(key: str) -> Dict[str, str]:
        """
        解析缓存键，提取各个组成部分
        
        Args:
            key: 缓存键字符串

        Returns:
            包含键组成部分的字典
        """
        parts = key.split(":")
        
        if len(parts) < 2:
            return {
                "service": parts[0] if parts else "",
                "entity_type": "",
                "identifier": "",
                "params": {},
                "is_hashed": False,
                "raw_key": key
            }
        
        result = {
            "service": parts[0],
            "entity_type": parts[1] if len(parts) > 1 else "",
            "identifier": "",
            "params": {},
            "is_hashed": False,
            "raw_key": key
        }
        
        # 检查是否为哈希键
        if len(parts) > 2 and parts[2] == CacheKeyGenerator.HASH_PREFIX:
            result["is_hashed"] = True
            result["hash"] = parts[3] if len(parts) > 3 else ""
            return result
        
        # 提取标识符
        if len(parts) > 2:
            result["identifier"] = parts[2]
        
        # 解析参数（如果有）
        if len(parts) > 3:
            last_part = parts[-1]
            if "=" in last_part:
                params = {}
                for param in last_part.split("&"):
                    if "=" in param:
                        k, v = param.split("=", 1)
                        params[k] = v
                result["params"] = params
                result["path"] = ":".join(parts[3:-1]) if len(parts) > 4 else ""
            else:
                result["path"] = ":".join(parts[3:])
        
        return result

    @staticmethod
    def generate_pattern(prefix: str, pattern: str = "*") -> str:
        """
        生成缓存键匹配模式

        Args:
            prefix: 缓存键前缀
            pattern: 匹配模式

        Returns:
            匹配模式字符串
        """
        return f"{prefix}:{pattern}"
    
    @staticmethod
    def generate_hierarchical_pattern(
        service: str,
        entity_type: Optional[str] = None,
        identifier: Optional[str] = None
    ) -> str:
        """
        生成层次化键的匹配模式
        
        Examples:
            - generate_hierarchical_pattern("user") -> "user:*"
            - generate_hierarchical_pattern("user", "123") -> "user:123:*"
        
        Args:
            service: 服务命名空间
            entity_type: 可选的实体类型
            identifier: 可选的标识符

        Returns:
            匹配模式字符串
        """
        parts = [service]
        
        if entity_type is not None:
            parts.append(str(entity_type))
            
            if identifier is not None:
                parts.append(str(identifier))
        
        parts.append("*")
        return ":".join(parts)
    
    @staticmethod
    def validate_key(key: str) -> bool:
        """
        验证缓存键格式是否正确
        
        Args:
            key: 缓存键字符串

        Returns:
            是否为有效的缓存键
        """
        if not key or not isinstance(key, str):
            return False
        
        # 检查长度
        if len(key) > CacheKeyGenerator.MAX_KEY_LENGTH * 2:
            return False
        
        # 检查是否包含非法字符
        import re
        if not re.match(r'^[a-zA-Z0-9:_\-=&.]+$', key):
            return False
        
        # 检查基本结构（至少包含一个冒号）
        if ":" not in key:
            return False
        
        return True
