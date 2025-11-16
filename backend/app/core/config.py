"""
应用配置管理
使用 Pydantic Settings 管理环境变量
"""
from typing import List, Optional
from pydantic import Field, field_validator
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    """应用配置类"""

    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        case_sensitive=True,
        extra="ignore",
    )

    # ====================================
    # 应用基础配置
    # ====================================
    PROJECT_NAME: str = "阅影·log API"
    APP_ENV: str = Field(default="development", alias="APP_ENV")
    DEBUG: bool = Field(default=True, alias="DEBUG")
    SECRET_KEY: str = Field(..., alias="SECRET_KEY")

    # ====================================
    # 数据库配置
    # ====================================
    DATABASE_URL: str = Field(
        ...,
        alias="DATABASE_URL",
        description="PostgreSQL 数据库连接字符串",
    )

    # ====================================
    # Redis 配置
    # ====================================
    REDIS_URL: str = Field(
        ...,
        alias="REDIS_URL",
        description="Redis 连接字符串",
    )

    # ====================================
    # MinIO 配置
    # ====================================
    MINIO_ENDPOINT: str = Field(default="minio:9000", alias="MINIO_ENDPOINT")
    MINIO_ACCESS_KEY: str = Field(default="minioadmin", alias="MINIO_ACCESS_KEY")
    MINIO_SECRET_KEY: str = Field(default="minioadmin123", alias="MINIO_SECRET_KEY")
    MINIO_SECURE: bool = Field(default=False, alias="MINIO_SECURE")

    # ====================================
    # 向量数据库配置
    # ====================================
    VECTOR_DB_PATH: str = Field(default="./data/chromadb", alias="VECTOR_DB_PATH")
    EMBEDDING_MODEL: str = Field(
        default="sentence-transformers/paraphrase-multilingual-MiniLM-L12-v2",
        alias="EMBEDDING_MODEL"
    )

    # ====================================
    # JWT 配置
    # ====================================
    JWT_SECRET_KEY: str = Field(..., alias="JWT_SECRET_KEY")
    JWT_ALGORITHM: str = Field(default="HS256", alias="JWT_ALGORITHM")
    ACCESS_TOKEN_EXPIRE_MINUTES: int = Field(
        default=30, alias="ACCESS_TOKEN_EXPIRE_MINUTES"
    )
    REFRESH_TOKEN_EXPIRE_DAYS: int = Field(
        default=7, alias="REFRESH_TOKEN_EXPIRE_DAYS"
    )

    # ====================================
    # CORS 配置
    # ====================================
    CORS_ORIGINS: str = Field(
        default="http://localhost:3000,http://localhost",
        alias="CORS_ORIGINS",
    )

    @property
    def cors_origins_list(self) -> List[str]:
        """获取 CORS origins 列表"""
        if isinstance(self.CORS_ORIGINS, str):
            return [origin.strip() for origin in self.CORS_ORIGINS.split(",") if origin.strip()]
        return self.CORS_ORIGINS

    # ====================================
    # 第三方 API 配置
    # ====================================
    # TMDB API
    TMDB_API_KEY: Optional[str] = Field(default=None, alias="TMDB_API_KEY")


    # Google Books API
    GOOGLE_BOOKS_API_KEY: Optional[str] = Field(
        default=None, alias="GOOGLE_BOOKS_API_KEY"
    )

    # Bangumi API（番组计划）
    BANGUMI_API_KEY: Optional[str] = Field(
        default=None, alias="BANGUMI_API_KEY"
    )
    BANGUMI_APP_ID: Optional[str] = Field(
        default=None, alias="BANGUMI_APP_ID"
    )

    # ====================================
    # LLM API 配置
    # ====================================
    # 硅基流动 (统一调用多个模型)
    SILICONFLOW_API_KEY: Optional[str] = Field(default=None, alias="SILICONFLOW_API_KEY")
    SILICONFLOW_BASE_URL: str = Field(
        default="https://api.siliconflow.cn/v1", alias="SILICONFLOW_BASE_URL"
    )
    
    # DeepSeek
    DEEPSEEK_API_KEY: Optional[str] = Field(default=None, alias="DEEPSEEK_API_KEY")
    DEEPSEEK_BASE_URL: str = Field(
        default="https://api.deepseek.com", alias="DEEPSEEK_BASE_URL"
    )

    # OpenAI
    OPENAI_API_KEY: Optional[str] = Field(default=None, alias="OPENAI_API_KEY")
    OPENAI_BASE_URL: str = Field(
        default="https://api.openai.com/v1", alias="OPENAI_BASE_URL"
    )

    # Anthropic Claude
    ANTHROPIC_API_KEY: Optional[str] = Field(default=None, alias="ANTHROPIC_API_KEY")
    ANTHROPIC_BASE_URL: str = Field(
        default="https://api.anthropic.com", alias="ANTHROPIC_BASE_URL"
    )

    # 默认 LLM 提供商
    DEFAULT_LLM_PROVIDER: str = Field(default="siliconflow", alias="DEFAULT_LLM_PROVIDER")
    
    # 默认使用的模型
    DEFAULT_LLM_MODEL: str = Field(default="deepseek-ai/DeepSeek-V3", alias="DEFAULT_LLM_MODEL")

    # ====================================
    # 管理员初始化配置
    # ====================================
    ADMIN_USERNAME: Optional[str] = Field(default=None, alias="ADMIN_USERNAME")
    ADMIN_PASSWORD: Optional[str] = Field(default=None, alias="ADMIN_PASSWORD")
    ADMIN_EMAIL: Optional[str] = Field(default=None, alias="ADMIN_EMAIL")

    # ====================================
    # 日志配置
    # ====================================
    LOG_LEVEL: str = Field(default="INFO", alias="LOG_LEVEL")
    LOG_FORMAT: str = Field(default="json", alias="LOG_FORMAT")
    
    # ====================================
    # API 文档配置
    # ====================================
    ENABLE_API_DOCS: bool = Field(default=True, alias="ENABLE_API_DOCS")
    API_DOCS_USERNAME: Optional[str] = Field(default=None, alias="API_DOCS_USERNAME")
    API_DOCS_PASSWORD: Optional[str] = Field(default=None, alias="API_DOCS_PASSWORD")

    # ====================================
    # 速率限制配置
    # ====================================
    RATE_LIMIT_PER_MINUTE: int = Field(
        default=60, alias="RATE_LIMIT_PER_MINUTE"
    )
    RATE_LIMIT_PER_HOUR: int = Field(default=1000, alias="RATE_LIMIT_PER_HOUR")

    # ====================================
    # 文件上传配置
    # ====================================
    MAX_UPLOAD_SIZE_MB: int = Field(default=10, alias="MAX_UPLOAD_SIZE_MB")

    # ====================================
    # 密钥管理配置
    # ====================================
    # 加密主密钥（用于加密存储 API 密钥等敏感信息）
    # 如果不设置，将使用 SECRET_KEY 派生
    ENCRYPTION_KEY: Optional[str] = Field(default=None, alias="ENCRYPTION_KEY")
    
    # 强制从环境变量读取配置并覆盖数据库
    # 当此选项为 True 时，即使数据库有配置，也会使用 .env 的值
    FORCE_ENV_SETTINGS: bool = Field(default=False, alias="FORCE_ENV_SETTINGS")
    
    # ====================================
    # 系统设置配置
    # ====================================
    # 强制从环境变量读取系统设置并覆盖数据库
    FORCE_READ_ENV_SETTINGS: bool = Field(default=False, alias="FORCE_READ_ENV_SETTINGS")
    
    # 系统设置默认值
    DEFAULT_ENABLE_EXPLORE: bool = Field(default=False, alias="DEFAULT_ENABLE_EXPLORE")
    DEFAULT_ALLOW_USER_AI_TAG_SETTINGS: bool = Field(default=True, alias="DEFAULT_ALLOW_USER_AI_TAG_SETTINGS")
    DEFAULT_ALLOW_ANONYMOUS_HOME_ACCESS: bool = Field(default=True, alias="DEFAULT_ALLOW_ANONYMOUS_HOME_ACCESS")

    # ====================================
    # 首页数据缓存配置
    # ====================================
    # 首页数据刷新时间（格式：HH:MM，例如 "01:00" 表示凌晨1点）
    HOME_DATA_REFRESH_TIME: str = Field(default="01:00", alias="HOME_DATA_REFRESH_TIME")
    # 首页数据缓存过期时间（秒），默认 25 小时
    HOME_DATA_CACHE_EXPIRE: int = Field(default=90000, alias="HOME_DATA_CACHE_EXPIRE")


# 创建全局配置实例
settings = Settings()


def validate_required_settings() -> None:
    """
    验证所有必需的环境变量是否已设置
    
    在应用启动时调用此函数，确保关键配置已正确设置
    
    Raises:
        ValueError: 如果缺少必需的环境变量
    """
    from loguru import logger
    
    missing_vars = []
    warnings = []
    
    # 检查必需的配置
    required_checks = [
        ("DATABASE_URL", settings.DATABASE_URL, "数据库连接字符串"),
        ("REDIS_URL", settings.REDIS_URL, "Redis 连接字符串"),
        ("SECRET_KEY", settings.SECRET_KEY, "应用密钥"),
        ("JWT_SECRET_KEY", settings.JWT_SECRET_KEY, "JWT 密钥"),
        ("MINIO_ENDPOINT", settings.MINIO_ENDPOINT, "MinIO 端点"),
        ("MINIO_ACCESS_KEY", settings.MINIO_ACCESS_KEY, "MinIO 访问密钥"),
        ("MINIO_SECRET_KEY", settings.MINIO_SECRET_KEY, "MinIO 密钥"),
    ]
    
    for var_name, var_value, description in required_checks:
        if not var_value:
            missing_vars.append(f"{var_name} ({description})")
    
    # 检查可选但推荐的配置
    optional_checks = [
        ("TMDB_API_KEY", settings.TMDB_API_KEY, "TMDB API 密钥（用于电影/剧集数据）"),
        ("GOOGLE_BOOKS_API_KEY", settings.GOOGLE_BOOKS_API_KEY, "Google Books API 密钥（用于图书数据）"),
        ("BANGUMI_API_KEY", settings.BANGUMI_API_KEY, "Bangumi API 密钥（用于动漫/游戏数据）"),
        ("SILICONFLOW_API_KEY", settings.SILICONFLOW_API_KEY, "SiliconFlow API 密钥（用于 AI 功能）"),
    ]
    
    for var_name, var_value, description in optional_checks:
        if not var_value:
            warnings.append(f"{var_name} ({description})")
    
    # 如果有缺失的必需变量，抛出异常
    if missing_vars:
        error_msg = "缺少必需的环境变量:\n" + "\n".join(f"  - {var}" for var in missing_vars)
        error_msg += "\n\n请在 .env 文件中设置这些变量，参考 .env.example 文件"
        logger.error(error_msg)
        raise ValueError(error_msg)
    
    # 记录警告信息
    if warnings:
        logger.warning("以下可选环境变量未设置，某些功能可能不可用:")
        for warning in warnings:
            logger.warning(f"  - {warning}")
    
    # 验证通过
    logger.info("✓ 所有必需的环境变量验证通过")
    
    # 记录当前配置摘要
    logger.info(f"应用环境: {settings.APP_ENV}")
    logger.info(f"调试模式: {settings.DEBUG}")
    logger.info(f"日志级别: {settings.LOG_LEVEL}")
    logger.info(f"CORS 来源: {settings.CORS_ORIGINS}")
    logger.info(f"默认 LLM 提供商: {settings.DEFAULT_LLM_PROVIDER}")
    logger.info(f"默认 LLM 模型: {settings.DEFAULT_LLM_MODEL}")


