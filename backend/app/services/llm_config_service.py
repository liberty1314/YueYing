"""
LLM 配置服务层（统一配置管理）
"""
from typing import Optional, Dict, Any
from sqlalchemy.orm import Session
from loguru import logger
import time

from app.models.llm_config import LLMConfig, LLMProvider
from app.schemas.llm import LLMConfigCreate, LLMConfigUpdate
from app.core.exceptions import NotFoundError
from app.core.config import settings
from app.core.encryption import encryption_service
from app.clients.llm.siliconflow import SiliconFlowClient
from app.clients.llm.openai_compatible import OpenAICompatibleClient


class LLMConfigCache:
    """LLM 配置内存缓存"""
    _cache: Optional[Dict[str, Any]] = None
    _last_update: float = 0
    _cache_ttl: int = 300  # 缓存 5 分钟
    
    @classmethod
    def get(cls) -> Optional[Dict[str, Any]]:
        """获取缓存的配置"""
        if cls._cache and (time.time() - cls._last_update < cls._cache_ttl):
            return cls._cache.copy()
        return None
    
    @classmethod
    def set(cls, config: Dict[str, Any]):
        """设置缓存"""
        cls._cache = config.copy()
        cls._last_update = time.time()
    
    @classmethod
    def clear(cls):
        """清除缓存"""
        cls._cache = None
        cls._last_update = 0


class LLMConfigService:
    """LLM 配置服务类（统一配置管理）"""

    @staticmethod
    def get_provider_presets() -> Dict[str, Dict[str, Any]]:
        """
        获取所有提供商的预设配置（从环境变量）
        """
        return {
            "siliconflow": {
                "base_url": settings.SILICONFLOW_BASE_URL,
                "api_key": settings.SILICONFLOW_API_KEY or "",
                "default_model": "deepseek-ai/DeepSeek-V3",
                "description": "硅基流动 API，支持多个 LLM 模型（DeepSeek/Qwen/Llama 等）",
            },
            "deepseek": {
                "base_url": settings.DEEPSEEK_BASE_URL,
                "api_key": settings.DEEPSEEK_API_KEY or "",
                "default_model": "deepseek-chat",
                "description": "DeepSeek 官方 API",
            },
            "openai": {
                "base_url": settings.OPENAI_BASE_URL,
                "api_key": settings.OPENAI_API_KEY or "",
                "default_model": "gpt-4",
                "description": "OpenAI 官方 API",
            },
            "claude": {
                "base_url": settings.ANTHROPIC_BASE_URL,
                "api_key": settings.ANTHROPIC_API_KEY or "",
                "default_model": "claude-3-opus-20240229",
                "description": "Anthropic Claude 官方 API",
            },
        }

    @staticmethod
    def _load_config_with_priority(db: Session) -> Dict[str, Any]:
        """
        统一配置加载逻辑：
        1. 检查是否强制使用环境变量
        2. 从数据库加载（如果存在且未强制使用环境变量）
        3. 从环境变量加载（作为默认值或强制覆盖）
        4. 解密密钥
        
        Returns:
            配置字典（包含解密后的密钥）
        """
        # 检查缓存
        cached_config = LLMConfigCache.get()
        if cached_config:
            logger.debug("从缓存加载 LLM 配置")
            return cached_config
        
        config_dict = None
        
        # 步骤 1: 检查是否强制使用环境变量
        force_env = settings.FORCE_ENV_SETTINGS
        
        # 步骤 2: 如果不强制使用环境变量，尝试从数据库加载
        if not force_env:
            db_config = db.query(LLMConfig).first()
            if db_config:
                logger.info("从数据库加载 LLM 配置")
                config_dict = {
                    "provider": db_config.provider.value,
                    "api_key": encryption_service.decrypt(db_config.api_key),  # 解密
                    "base_url": db_config.base_url,
                    "default_model": db_config.default_model,
                    "temperature": db_config.temperature,
                    "max_tokens": db_config.max_tokens,
                    "top_p": db_config.top_p,
                    "enabled": db_config.enabled,
                    "auto_tag_enabled": db_config.auto_tag_enabled,
                    "description": db_config.description,
                }
        
        # 步骤 3: 如果数据库没有配置或强制使用环境变量，从 .env 加载
        if config_dict is None or force_env:
            provider = settings.DEFAULT_LLM_PROVIDER.lower()
            presets = LLMConfigService.get_provider_presets()
            
            if provider in presets:
                preset = presets[provider]
                config_dict = {
                    "provider": provider,
                    "api_key": preset["api_key"],  # 环境变量中的密钥是明文
                    "base_url": preset["base_url"],
                    "default_model": preset.get("default_model", settings.DEFAULT_LLM_MODEL),
                    "temperature": 0.7,
                    "max_tokens": None,
                    "top_p": 1.0,
                    "enabled": True,
                    "auto_tag_enabled": False,
                    "description": preset.get("description", ""),
                }
                log_msg = "强制从环境变量加载 LLM 配置" if force_env else "从环境变量加载 LLM 配置（数据库无配置）"
                logger.info(f"{log_msg}: provider={provider}")
        
        # 步骤 4: 缓存配置
        if config_dict:
            LLMConfigCache.set(config_dict)
        
        return config_dict

    @staticmethod
    def initialize_from_env(db: Session) -> Optional[LLMConfig]:
        """
        从环境变量初始化 LLM 配置
        仅在数据库中没有配置时执行
        """
        # 检查是否已有配置
        existing_config = db.query(LLMConfig).first()
        if existing_config:
            logger.info("LLM 配置已存在，跳过初始化")
            return existing_config

        # 获取默认提供商的配置
        provider = settings.DEFAULT_LLM_PROVIDER.lower()
        presets = LLMConfigService.get_provider_presets()
        
        if provider not in presets:
            logger.warning(f"未知的 LLM 提供商: {provider}")
            return None
        
        preset = presets[provider]
        
        # 检查是否有 API 密钥
        if not preset["api_key"]:
            logger.warning(f"未配置 {provider.upper()} 的 API 密钥，跳过初始化")
            return None

        # 创建配置（加密密钥）
        try:
            config_data = LLMConfigCreate(
                provider=provider,
                api_key=preset["api_key"],  # 将在 create_config 中加密
                base_url=preset["base_url"],
                default_model=preset.get("default_model", settings.DEFAULT_LLM_MODEL),
                temperature=0.7,
                max_tokens=None,
                top_p=1.0,
                enabled=True,
                auto_tag_enabled=False,
                description=preset.get("description", ""),
            )
            
            # 加密 API 密钥
            encrypted_api_key = encryption_service.encrypt(config_data.api_key)
            
            config = LLMConfig(
                provider=LLMProvider(config_data.provider),
                api_key=encrypted_api_key,  # 存储加密后的密钥
                base_url=config_data.base_url,
                default_model=config_data.default_model,
                temperature=config_data.temperature,
                max_tokens=config_data.max_tokens,
                top_p=config_data.top_p,
                enabled=config_data.enabled,
                auto_tag_enabled=config_data.auto_tag_enabled,
                description=config_data.description,
            )
            
            db.add(config)
            db.commit()
            db.refresh(config)
            
            # 清除缓存
            LLMConfigCache.clear()
            
            logger.info(f"✅ 从环境变量初始化 LLM 配置: provider={provider}")
            return config
            
        except Exception as e:
            logger.error(f"初始化 LLM 配置失败: {e}")
            db.rollback()
            return None

    @staticmethod
    def get_config(db: Session) -> Optional[Dict[str, Any]]:
        """
        获取当前 LLM 配置（使用统一加载逻辑）
        
        Returns:
            配置字典（包含解密后的密钥）
        """
        return LLMConfigService._load_config_with_priority(db)
    
    @staticmethod
    def get_config_from_db(db: Session) -> Optional[LLMConfig]:
        """
        直接从数据库获取 LLM 配置对象（不解密）
        用于需要访问 id、created_at、updated_at 等字段的场景
        
        Returns:
            LLMConfig ORM 对象
        """
        return db.query(LLMConfig).first()

    @staticmethod
    def create_config(db: Session, config_data: LLMConfigCreate) -> LLMConfig:
        """
        创建 LLM 配置（加密存储密钥）
        """
        # 检查是否已存在配置
        existing_config = db.query(LLMConfig).first()
        if existing_config:
            # 如果存在，则更新而不是创建
            return LLMConfigService.update_config(db, config_data.model_dump())

        # 加密 API 密钥
        encrypted_api_key = encryption_service.encrypt(config_data.api_key)
        
        config = LLMConfig(
            provider=LLMProvider(config_data.provider),
            api_key=encrypted_api_key,  # 存储加密后的密钥
            base_url=config_data.base_url,
            default_model=config_data.default_model,
            temperature=config_data.temperature,
            max_tokens=config_data.max_tokens,
            top_p=config_data.top_p,
            enabled=config_data.enabled,
            auto_tag_enabled=config_data.auto_tag_enabled,
            description=config_data.description,
        )
        
        db.add(config)
        db.commit()
        db.refresh(config)
        
        # 清除缓存
        LLMConfigCache.clear()
        
        logger.info(f"Created LLM config: provider={config.provider}")
        return config

    @staticmethod
    def update_config(db: Session, update_data: dict) -> LLMConfig:
        """
        更新 LLM 配置（加密存储密钥）
        """
        config = db.query(LLMConfig).first()
        if not config:
            raise NotFoundError("LLM 配置不存在")

        # 更新字段
        for key, value in update_data.items():
            # 跳过空值和不存在的字段
            if not hasattr(config, key):
                continue
            # 对于 api_key，空字符串表示不更新
            if key == "api_key":
                if value:  # 只有非空时才更新
                    setattr(config, key, encryption_service.encrypt(value))
            # 对于 provider，需要转换为枚举类型
            elif key == "provider":
                if value is not None:
                    setattr(config, key, LLMProvider(value))
            elif value is not None:
                setattr(config, key, value)

        db.add(config)
        db.commit()
        db.refresh(config)
        
        # 清除缓存
        LLMConfigCache.clear()
        
        logger.info(f"Updated LLM config: provider={config.provider}")
        return config

    @staticmethod
    def delete_config(db: Session) -> bool:
        """
        删除 LLM 配置
        """
        config = db.query(LLMConfig).first()
        if not config:
            return False

        db.delete(config)
        db.commit()
        
        # 清除缓存
        LLMConfigCache.clear()
        
        logger.info("Deleted LLM config")
        return True

    @staticmethod
    def mask_api_key(api_key: Optional[str]) -> Optional[str]:
        """
        脱敏 API 密钥
        """
        return encryption_service.mask(api_key)

    @staticmethod
    async def test_connection(
        provider: str,
        api_key: str,
        base_url: Optional[str] = None,
        model: Optional[str] = None,
    ) -> tuple[bool, str, Optional[float]]:
        """
        测试 LLM API 连接

        Returns:
            (success, message, latency)
        """
        try:
            provider_lower = provider.lower()
            
            # 根据提供商选择客户端
            if provider_lower == "siliconflow":
                client = SiliconFlowClient(
                    api_key=api_key,
                    base_url=base_url or "https://api.siliconflow.cn/v1",
                )
                test_model = model or "deepseek-ai/DeepSeek-V3"
                
            elif provider_lower == "deepseek":
                client = OpenAICompatibleClient(
                    api_key=api_key,
                    base_url=base_url or "https://api.deepseek.com",
                )
                test_model = model or "deepseek-chat"
                
            elif provider_lower == "openai":
                client = OpenAICompatibleClient(
                    api_key=api_key,
                    base_url=base_url or "https://api.openai.com/v1",
                )
                test_model = model or "gpt-3.5-turbo"
                
            elif provider_lower == "claude":
                # Claude 使用不同的 API 格式，暂时返回提示
                return False, "Claude API 测试功能开发中", None
                
            else:
                return False, f"不支持的提供商: {provider}", None

            # 测试消息
            test_messages = [
                {"role": "user", "content": "Hello"}
            ]

            # 记录开始时间
            start_time = time.time()

            # 发送测试请求
            result = await client.chat_completion(
                messages=test_messages,
                model=test_model,
                temperature=0.7,
                max_tokens=10,
            )

            # 计算延迟
            latency = time.time() - start_time

            # 检查响应
            if result and "content" in result:
                logger.info(
                    f"LLM connection test successful: provider={provider}, "
                    f"model={test_model}, latency={latency:.2f}s"
                )
                return True, "连接测试成功", round(latency, 2)
            else:
                return False, "响应格式错误", None

        except Exception as e:
            logger.error(f"LLM connection test failed: {e}")
            error_msg = str(e)
            if "401" in error_msg or "Unauthorized" in error_msg:
                return False, "API 密钥无效", None
            elif "403" in error_msg or "Forbidden" in error_msg:
                return False, "API 密钥权限不足", None
            elif "timeout" in error_msg.lower():
                return False, "连接超时", None
            else:
                return False, f"连接失败: {error_msg}", None
