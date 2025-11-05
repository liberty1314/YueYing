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


# 创建全局配置实例
settings = Settings()


