"""
LLM Pydantic Schemas
"""
from typing import List, Optional, Dict, Any, Literal
from pydantic import BaseModel, Field
import enum


class Message(BaseModel):
    """聊天消息"""
    role: Literal["system", "user", "assistant"] = Field(..., description="消息角色")
    content: str = Field(..., description="消息内容")


class ChatCompletionRequest(BaseModel):
    """聊天完成请求"""
    model: str = Field(..., description="模型名称")
    messages: List[Message] = Field(..., description="消息列表")
    temperature: float = Field(0.7, ge=0, le=2, description="温度参数")
    max_tokens: Optional[int] = Field(None, description="最大生成token数")
    top_p: float = Field(1.0, ge=0, le=1, description="nucleus sampling参数")
    stream: bool = Field(False, description="是否流式输出")


class ChatCompletionResponse(BaseModel):
    """聊天完成响应"""
    id: str = Field(..., description="响应ID")
    model: str = Field(..., description="模型名称")
    content: str = Field(..., description="生成的内容")
    usage: Dict[str, int] = Field(..., description="token使用情况")
    finish_reason: str = Field(..., description="完成原因")


class ModelInfo(BaseModel):
    """模型信息"""
    id: str = Field(..., description="模型ID")
    name: str = Field(..., description="模型名称")
    provider: str = Field(..., description="提供商")
    description: Optional[str] = Field(None, description="模型描述")
    context_length: Optional[int] = Field(None, description="上下文长度")
    max_output_tokens: Optional[int] = Field(None, description="最大输出token")


class ModelListResponse(BaseModel):
    """模型列表响应"""
    models: List[ModelInfo] = Field(..., description="模型列表")
    total: int = Field(..., description="总数")


# ====================================
# LLM 配置 Schemas
# ====================================


class LLMProvider(str, enum.Enum):
    """LLM 提供商"""
    siliconflow = "siliconflow"
    deepseek = "deepseek"
    openai = "openai"
    claude = "claude"


class LLMConfigBase(BaseModel):
    """LLM 配置基类"""
    provider: LLMProvider = Field(..., description="LLM 提供商")
    api_key: Optional[str] = Field(None, description="API 密钥")
    base_url: Optional[str] = Field(None, description="API 基础 URL")
    default_model: Optional[str] = Field(None, description="默认模型")
    temperature: float = Field(0.7, ge=0, le=2, description="温度参数")
    max_tokens: Optional[int] = Field(None, description="最大生成token数")
    top_p: float = Field(1.0, ge=0, le=1, description="nucleus sampling参数")
    enabled: bool = Field(True, description="是否启用")
    auto_tag_enabled: bool = Field(False, description="是否启用自动标签")
    description: Optional[str] = Field(None, description="配置描述")


class LLMConfigCreate(LLMConfigBase):
    """创建 LLM 配置"""
    pass


class LLMConfigUpdate(BaseModel):
    """更新 LLM 配置"""
    provider: Optional[LLMProvider] = None
    api_key: Optional[str] = None
    base_url: Optional[str] = None
    default_model: Optional[str] = None
    temperature: Optional[float] = Field(None, ge=0, le=2)
    max_tokens: Optional[int] = None
    top_p: Optional[float] = Field(None, ge=0, le=1)
    enabled: Optional[bool] = None
    auto_tag_enabled: Optional[bool] = None
    description: Optional[str] = None


class LLMConfigResponse(LLMConfigBase):
    """LLM 配置响应"""
    id: int
    created_at: str
    updated_at: str
    
    # 隐藏敏感信息
    api_key: Optional[str] = Field(None, description="API 密钥（已脱敏）")
    
    class Config:
        from_attributes = True


class LLMConfigTestRequest(BaseModel):
    """LLM 配置测试请求"""
    provider: LLMProvider
    api_key: str
    base_url: Optional[str] = None
    model: Optional[str] = None


class LLMConfigTestResponse(BaseModel):
    """LLM 配置测试响应"""
    success: bool
    message: str
    latency: Optional[float] = Field(None, description="响应延迟（秒）")

