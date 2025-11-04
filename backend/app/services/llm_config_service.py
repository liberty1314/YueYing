"""
LLM 配置服务层
"""
from typing import Optional, Dict, Any
from sqlalchemy.orm import Session
from loguru import logger
import time

from app.models.llm_config import LLMConfig, LLMProvider
from app.schemas.llm import LLMConfigCreate, LLMConfigUpdate
from app.core.exceptions import NotFoundError
from app.core.config import settings
from app.clients.llm.siliconflow import SiliconFlowClient
from app.clients.llm.openai_compatible import OpenAICompatibleClient


class LLMConfigService:
    """LLM 配置服务类"""

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

        # 创建配置
        try:
            config_data = LLMConfigCreate(
                provider=provider,
                api_key=preset["api_key"],
                base_url=preset["base_url"],
                default_model=preset.get("default_model", settings.DEFAULT_LLM_MODEL),
                temperature=0.7,
                max_tokens=None,
                top_p=1.0,
                enabled=True,
                auto_tag_enabled=False,
                description=preset.get("description", ""),
            )
            
            config = LLMConfig(**config_data.model_dump())
            db.add(config)
            db.commit()
            db.refresh(config)
            
            logger.info(f"✅ 从环境变量初始化 LLM 配置: provider={provider}")
            return config
            
        except Exception as e:
            logger.error(f"初始化 LLM 配置失败: {e}")
            db.rollback()
            return None

    @staticmethod
    def get_config(db: Session) -> Optional[LLMConfig]:
        """
        获取当前 LLM 配置（单例）
        """
        config = db.query(LLMConfig).first()
        return config

    @staticmethod
    def create_config(db: Session, config_data: LLMConfigCreate) -> LLMConfig:
        """
        创建 LLM 配置
        """
        # 检查是否已存在配置
        existing_config = db.query(LLMConfig).first()
        if existing_config:
            # 如果存在，则更新而不是创建
            return LLMConfigService.update_config(db, config_data.model_dump())

        config = LLMConfig(**config_data.model_dump())
        db.add(config)
        db.commit()
        db.refresh(config)
        logger.info(f"Created LLM config: provider={config.provider}")
        return config

    @staticmethod
    def update_config(db: Session, update_data: dict) -> LLMConfig:
        """
        更新 LLM 配置
        """
        config = db.query(LLMConfig).first()
        if not config:
            raise NotFoundError("LLM 配置不存在")

        # 更新字段
        for key, value in update_data.items():
            if value is not None and hasattr(config, key):
                setattr(config, key, value)

        db.add(config)
        db.commit()
        db.refresh(config)
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
        logger.info("Deleted LLM config")
        return True

    @staticmethod
    def mask_api_key(api_key: Optional[str]) -> Optional[str]:
        """
        脱敏 API 密钥
        """
        if not api_key or len(api_key) < 8:
            return None
        return f"{api_key[:4]}{'*' * (len(api_key) - 8)}{api_key[-4:]}"

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

