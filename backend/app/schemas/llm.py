"""
LLM Pydantic Schemas
"""
from typing import List, Optional, Dict, Any, Literal
from pydantic import BaseModel, Field


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

