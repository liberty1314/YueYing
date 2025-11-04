"""
LLM 配置数据模型
"""
from sqlalchemy import Column, String, Integer, Float, Boolean, Text, Enum
from sqlalchemy.orm import relationship
import enum

from app.models.base import BaseModel


class LLMProvider(str, enum.Enum):
    """LLM 提供商枚举"""

    SILICONFLOW = "siliconflow"
    DEEPSEEK = "deepseek"
    OPENAI = "openai"
    CLAUDE = "claude"


class LLMConfig(BaseModel):
    """LLM 配置表（全局单例配置）"""

    __tablename__ = "llm_configs"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    
    # 提供商配置
    provider = Column(
        Enum(LLMProvider),
        nullable=False,
        default=LLMProvider.SILICONFLOW,
        comment="LLM 提供商"
    )
    
    # API 配置
    api_key = Column(String(500), nullable=True, comment="API 密钥（加密存储）")
    base_url = Column(String(500), nullable=True, comment="API 基础 URL")
    
    # 模型配置
    default_model = Column(String(200), nullable=True, comment="默认使用的模型")
    
    # 生成参数
    temperature = Column(Float, nullable=False, default=0.7, comment="温度参数")
    max_tokens = Column(Integer, nullable=True, comment="最大生成 token 数")
    top_p = Column(Float, nullable=False, default=1.0, comment="nucleus sampling 参数")
    
    # 功能开关
    enabled = Column(Boolean, nullable=False, default=True, comment="是否启用")
    auto_tag_enabled = Column(Boolean, nullable=False, default=False, comment="是否启用自动标签")
    
    # 备注
    description = Column(Text, nullable=True, comment="配置描述")

    def __repr__(self):
        return f"<LLMConfig(id={self.id}, provider='{self.provider}', model='{self.default_model}')>"
