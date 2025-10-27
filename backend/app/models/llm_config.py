"""
LLM 配置模型
"""
from sqlalchemy import Column, String, Integer, Float, Boolean, JSON, Text

from app.models.base import BaseModel


class LLMConfig(BaseModel):
    """LLM 配置表"""

    __tablename__ = "llm_configs"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    provider = Column(String(50), nullable=False, unique=True, index=True)
    # provider: deepseek, openai, claude
    api_key = Column(Text, nullable=False)  # 加密存储
    base_url = Column(String(500), nullable=True)
    model_name = Column(String(100), nullable=True)
    is_active = Column(Boolean, nullable=False, default=False)
    is_default = Column(Boolean, nullable=False, default=False)

    # 模型参数
    temperature = Column(Float, nullable=False, default=0.7)
    max_tokens = Column(Integer, nullable=False, default=2000)
    top_p = Column(Float, nullable=False, default=1.0)

    # 额外配置（JSON格式）
    extra_config = Column(JSON, nullable=True)

    def __repr__(self):
        return f"<LLMConfig(id={self.id}, provider='{self.provider}', is_default={self.is_default})>"

