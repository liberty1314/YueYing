"""
缓存配置管理

提供缓存配置的定义、加载、验证和管理功能
"""
from typing import Dict, Optional, Any
from dataclasses import dataclass, field
from enum import Enum

from app.core.logging import logger
from app.core.config import settings


class CacheDataType(str, Enum):
    """缓存数据类型枚举"""
    # 用户相关
    USER_SESSION = "user_session"
    USER_PROFILE = "user_profile"
    USER_ITEMS = "user_items"
    USER_STATS = "user_stats"
    USER_SETTINGS = "user_settings"
    
    # 外部 API
    TMDB_MOVIE = "tmdb_movie"
    TMDB_TV = "tmdb_tv"
    TMDB_SEARCH = "tmdb_search"
    GOOGLE_BOOKS = "google_books"
    BANGUMI_ANIME = "bangumi_anime"
    BANGUMI_GAME = "bangumi_game"
    
    # 搜索和推荐
    SEARCH_RESULTS = "search_results"
    RECOMMENDATIONS = "recommendations"
    
    # 统计和分析
    STATISTICS = "statistics"
    ANALYTICS = "analytics"
    
    # AI 相关
    AI_TAGS = "ai_tags"
    AI_SUMMARY = "ai_summary"
    LLM_RESPONSE = "llm_response"
    
    # 系统配置
    SYSTEM_CONFIG = "system_config"
    API_KEYS = "api_keys"
    
    # 默认
    DEFAULT = "default"


@dataclass
class CacheTTLConfig:
    """缓存 TTL 配置"""
    l1_ttl: int  # L1 (内存) TTL，单位：秒
    l2_ttl: int  # L2 (Redis) TTL，单位：秒
    description: str = ""
    
    def __post_init__(self):
        """验证配置"""
        if self.l1_ttl < 0:
            raise ValueError(f"L1 TTL 不能为负数: {self.l1_ttl}")
        if self.l2_ttl < 0:
            raise ValueError(f"L2 TTL 不能为负数: {self.l2_ttl}")
        if self.l1_ttl > self.l2_ttl:
            logger.warning(
                f"L1 TTL ({self.l1_ttl}s) 大于 L2 TTL ({self.l2_ttl}s)，"
                "这可能导致 L1 缓存比 L2 保留更久"
            )


@dataclass
class CacheConfig:
    """缓存配置"""
    # 内存缓存配置
    l1_max_size: int = 1000
    l1_default_ttl: int = 300  # 5 分钟
    
    # Redis 缓存配置
    l2_default_ttl: int = 3600  # 1 小时
    
    # 数据类型特定配置
    ttl_configs: Dict[CacheDataType, CacheTTLConfig] = field(default_factory=dict)
    
    # 缓存预热配置
    warming_enabled: bool = True
    warming_on_startup: bool = True
    warming_batch_size: int = 100
    
    # 统计配置
    stats_enabled: bool = True
    stats_max_history: int = 10000
    
    def __post_init__(self):
        """初始化默认配置"""
        if not self.ttl_configs:
            self.ttl_configs = self._get_default_ttl_configs()
    
    def _get_default_ttl_configs(self) -> Dict[CacheDataType, CacheTTLConfig]:
        """获取默认 TTL 配置"""
        return {
            # 用户相关 - 中等频率访问
            CacheDataType.USER_SESSION: CacheTTLConfig(
                l1_ttl=600,    # 10 分钟
                l2_ttl=1800,   # 30 分钟
                description="用户会话数据"
            ),
            CacheDataType.USER_PROFILE: CacheTTLConfig(
                l1_ttl=300,    # 5 分钟
                l2_ttl=3600,   # 1 小时
                description="用户资料"
            ),
            CacheDataType.USER_ITEMS: CacheTTLConfig(
                l1_ttl=300,    # 5 分钟
                l2_ttl=1800,   # 30 分钟
                description="用户内容记录"
            ),
            CacheDataType.USER_STATS: CacheTTLConfig(
                l1_ttl=300,    # 5 分钟
                l2_ttl=3600,   # 1 小时
                description="用户统计数据"
            ),
            CacheDataType.USER_SETTINGS: CacheTTLConfig(
                l1_ttl=600,    # 10 分钟
                l2_ttl=3600,   # 1 小时
                description="用户设置"
            ),
            
            # 外部 API - 长时间缓存
            CacheDataType.TMDB_MOVIE: CacheTTLConfig(
                l1_ttl=300,    # 5 分钟
                l2_ttl=86400,  # 24 小时
                description="TMDB 电影数据"
            ),
            CacheDataType.TMDB_TV: CacheTTLConfig(
                l1_ttl=300,    # 5 分钟
                l2_ttl=86400,  # 24 小时
                description="TMDB 电视剧数据"
            ),
            CacheDataType.TMDB_SEARCH: CacheTTLConfig(
                l1_ttl=300,    # 5 分钟
                l2_ttl=3600,   # 1 小时
                description="TMDB 搜索结果"
            ),
            CacheDataType.GOOGLE_BOOKS: CacheTTLConfig(
                l1_ttl=300,    # 5 分钟
                l2_ttl=86400,  # 24 小时
                description="Google Books 数据"
            ),
            CacheDataType.BANGUMI_ANIME: CacheTTLConfig(
                l1_ttl=300,    # 5 分钟
                l2_ttl=86400,  # 24 小时
                description="Bangumi 动画数据"
            ),
            CacheDataType.BANGUMI_GAME: CacheTTLConfig(
                l1_ttl=300,    # 5 分钟
                l2_ttl=86400,  # 24 小时
                description="Bangumi 游戏数据"
            ),
            
            # 搜索和推荐 - 短时间缓存
            CacheDataType.SEARCH_RESULTS: CacheTTLConfig(
                l1_ttl=120,    # 2 分钟
                l2_ttl=600,    # 10 分钟
                description="搜索结果"
            ),
            CacheDataType.RECOMMENDATIONS: CacheTTLConfig(
                l1_ttl=300,    # 5 分钟
                l2_ttl=1800,   # 30 分钟
                description="推荐结果"
            ),
            
            # 统计和分析 - 中等时间缓存
            CacheDataType.STATISTICS: CacheTTLConfig(
                l1_ttl=300,    # 5 分钟
                l2_ttl=3600,   # 1 小时
                description="统计数据"
            ),
            CacheDataType.ANALYTICS: CacheTTLConfig(
                l1_ttl=600,    # 10 分钟
                l2_ttl=7200,   # 2 小时
                description="分析数据"
            ),
            
            # AI 相关 - 长时间缓存
            CacheDataType.AI_TAGS: CacheTTLConfig(
                l1_ttl=600,    # 10 分钟
                l2_ttl=86400,  # 24 小时
                description="AI 生成的标签"
            ),
            CacheDataType.AI_SUMMARY: CacheTTLConfig(
                l1_ttl=600,    # 10 分钟
                l2_ttl=86400,  # 24 小时
                description="AI 生成的摘要"
            ),
            CacheDataType.LLM_RESPONSE: CacheTTLConfig(
                l1_ttl=300,    # 5 分钟
                l2_ttl=3600,   # 1 小时
                description="LLM 响应"
            ),
            
            # 系统配置 - 长时间缓存
            CacheDataType.SYSTEM_CONFIG: CacheTTLConfig(
                l1_ttl=3600,   # 1 小时
                l2_ttl=86400,  # 24 小时
                description="系统配置"
            ),
            CacheDataType.API_KEYS: CacheTTLConfig(
                l1_ttl=1800,   # 30 分钟
                l2_ttl=3600,   # 1 小时
                description="API 密钥配置"
            ),
            
            # 默认配置
            CacheDataType.DEFAULT: CacheTTLConfig(
                l1_ttl=300,    # 5 分钟
                l2_ttl=3600,   # 1 小时
                description="默认缓存配置"
            ),
        }
    
    def get_ttl_config(self, data_type: CacheDataType) -> CacheTTLConfig:
        """
        获取指定数据类型的 TTL 配置
        
        Args:
            data_type: 数据类型

        Returns:
            TTL 配置
        """
        return self.ttl_configs.get(data_type, self.ttl_configs[CacheDataType.DEFAULT])
    
    def set_ttl_config(
        self,
        data_type: CacheDataType,
        l1_ttl: int,
        l2_ttl: int,
        description: str = ""
    ) -> None:
        """
        设置指定数据类型的 TTL 配置
        
        Args:
            data_type: 数据类型
            l1_ttl: L1 TTL（秒）
            l2_ttl: L2 TTL（秒）
            description: 描述
        """
        config = CacheTTLConfig(l1_ttl=l1_ttl, l2_ttl=l2_ttl, description=description)
        self.ttl_configs[data_type] = config
        logger.info(
            f"更新缓存配置: {data_type.value}, "
            f"L1={l1_ttl}s, L2={l2_ttl}s"
        )
    
    def validate(self) -> bool:
        """
        验证配置
        
        Returns:
            配置是否有效
        """
        try:
            # 验证基本配置
            if self.l1_max_size <= 0:
                raise ValueError(f"L1 最大大小必须大于 0: {self.l1_max_size}")
            
            if self.l1_default_ttl < 0:
                raise ValueError(f"L1 默认 TTL 不能为负数: {self.l1_default_ttl}")
            
            if self.l2_default_ttl < 0:
                raise ValueError(f"L2 默认 TTL 不能为负数: {self.l2_default_ttl}")
            
            if self.warming_batch_size <= 0:
                raise ValueError(f"预热批次大小必须大于 0: {self.warming_batch_size}")
            
            if self.stats_max_history <= 0:
                raise ValueError(f"统计最大历史记录数必须大于 0: {self.stats_max_history}")
            
            # 验证所有 TTL 配置
            for data_type, ttl_config in self.ttl_configs.items():
                # CacheTTLConfig 的 __post_init__ 会自动验证
                pass
            
            return True
        
        except Exception as e:
            logger.error(f"缓存配置验证失败: {e}")
            return False
    
    def to_dict(self) -> Dict[str, Any]:
        """
        转换为字典
        
        Returns:
            配置字典
        """
        return {
            "l1_max_size": self.l1_max_size,
            "l1_default_ttl": self.l1_default_ttl,
            "l2_default_ttl": self.l2_default_ttl,
            "warming_enabled": self.warming_enabled,
            "warming_on_startup": self.warming_on_startup,
            "warming_batch_size": self.warming_batch_size,
            "stats_enabled": self.stats_enabled,
            "stats_max_history": self.stats_max_history,
            "ttl_configs": {
                data_type.value: {
                    "l1_ttl": config.l1_ttl,
                    "l2_ttl": config.l2_ttl,
                    "description": config.description,
                }
                for data_type, config in self.ttl_configs.items()
            },
        }


class CacheConfigManager:
    """缓存配置管理器"""
    
    def __init__(self, config: Optional[CacheConfig] = None):
        """
        初始化配置管理器
        
        Args:
            config: 缓存配置，None 则使用默认配置
        """
        self.config = config or self._load_from_env()
        
        # 验证配置
        if not self.config.validate():
            logger.warning("缓存配置验证失败，使用默认配置")
            self.config = CacheConfig()
        
        logger.info("缓存配置管理器已初始化")
    
    def _load_from_env(self) -> CacheConfig:
        """
        从环境变量加载配置
        
        Returns:
            缓存配置
        """
        config = CacheConfig()
        
        # 从环境变量加载（如果存在）
        try:
            # L1 配置
            if hasattr(settings, 'CACHE_L1_MAX_SIZE'):
                config.l1_max_size = int(settings.CACHE_L1_MAX_SIZE)
            
            if hasattr(settings, 'CACHE_L1_DEFAULT_TTL'):
                config.l1_default_ttl = int(settings.CACHE_L1_DEFAULT_TTL)
            
            # L2 配置
            if hasattr(settings, 'CACHE_L2_DEFAULT_TTL'):
                config.l2_default_ttl = int(settings.CACHE_L2_DEFAULT_TTL)
            
            # 预热配置
            if hasattr(settings, 'CACHE_WARMING_ENABLED'):
                config.warming_enabled = settings.CACHE_WARMING_ENABLED.lower() == 'true'
            
            if hasattr(settings, 'CACHE_WARMING_ON_STARTUP'):
                config.warming_on_startup = settings.CACHE_WARMING_ON_STARTUP.lower() == 'true'
            
            if hasattr(settings, 'CACHE_WARMING_BATCH_SIZE'):
                config.warming_batch_size = int(settings.CACHE_WARMING_BATCH_SIZE)
            
            # 统计配置
            if hasattr(settings, 'CACHE_STATS_ENABLED'):
                config.stats_enabled = settings.CACHE_STATS_ENABLED.lower() == 'true'
            
            if hasattr(settings, 'CACHE_STATS_MAX_HISTORY'):
                config.stats_max_history = int(settings.CACHE_STATS_MAX_HISTORY)
            
            logger.info("从环境变量加载缓存配置")
        
        except Exception as e:
            logger.warning(f"从环境变量加载配置失败，使用默认值: {e}")
        
        return config
    
    def get_config(self) -> CacheConfig:
        """
        获取当前配置
        
        Returns:
            缓存配置
        """
        return self.config
    
    def update_config(self, **kwargs) -> bool:
        """
        更新配置
        
        Args:
            **kwargs: 配置参数

        Returns:
            是否更新成功
        """
        try:
            # 更新基本配置
            for key, value in kwargs.items():
                if hasattr(self.config, key):
                    setattr(self.config, key, value)
                    logger.info(f"更新配置: {key}={value}")
            
            # 验证新配置
            if not self.config.validate():
                logger.error("配置验证失败")
                return False
            
            logger.info("配置更新成功")
            return True
        
        except Exception as e:
            logger.error(f"配置更新失败: {e}")
            return False
    
    def reload_config(self) -> bool:
        """
        重新加载配置
        
        Returns:
            是否重新加载成功
        """
        try:
            new_config = self._load_from_env()
            
            if new_config.validate():
                self.config = new_config
                logger.info("配置重新加载成功")
                return True
            else:
                logger.error("新配置验证失败")
                return False
        
        except Exception as e:
            logger.error(f"配置重新加载失败: {e}")
            return False
    
    def get_ttl_for_data_type(self, data_type: CacheDataType) -> tuple[int, int]:
        """
        获取指定数据类型的 TTL
        
        Args:
            data_type: 数据类型

        Returns:
            (l1_ttl, l2_ttl) 元组
        """
        ttl_config = self.config.get_ttl_config(data_type)
        return (ttl_config.l1_ttl, ttl_config.l2_ttl)
    
    def set_ttl_for_data_type(
        self,
        data_type: CacheDataType,
        l1_ttl: int,
        l2_ttl: int,
        description: str = ""
    ) -> bool:
        """
        设置指定数据类型的 TTL
        
        Args:
            data_type: 数据类型
            l1_ttl: L1 TTL（秒）
            l2_ttl: L2 TTL（秒）
            description: 描述

        Returns:
            是否设置成功
        """
        try:
            self.config.set_ttl_config(data_type, l1_ttl, l2_ttl, description)
            return True
        except Exception as e:
            logger.error(f"设置 TTL 失败: {e}")
            return False


# 创建全局配置管理器实例
cache_config_manager = CacheConfigManager()
