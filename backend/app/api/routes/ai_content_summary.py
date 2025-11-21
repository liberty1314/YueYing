"""
AI 内容摘要 API 路由
"""
from fastapi import APIRouter, Depends, HTTPException, status, Body
from sqlalchemy.orm import Session
from typing import Optional
from pydantic import BaseModel, Field
from loguru import logger

from app.core.database import get_db
from app.api.dependencies.auth import get_current_user
from app.models.user import User
from app.models.item import Item
from app.models.user_item import UserItem
from app.services.llm_service import LLMService


router = APIRouter(prefix="/ai", tags=["AI 内容摘要"])


# ====================================
# Pydantic Schemas
# ====================================


class ContentSummaryRequest(BaseModel):
    """内容摘要请求"""
    item_id: int = Field(..., description="内容项ID")
    user_item_id: Optional[int] = Field(None, description="用户记录ID(可选)")
    language: str = Field("zh", description="摘要语言")


class ContentSummaryResponse(BaseModel):
    """内容摘要响应"""
    summary: str = Field(..., description="生成的摘要")
    item_id: int = Field(..., description="内容项ID")
    highlights: list[str] = Field(default_factory=list, description="关键亮点")


class SummaryFeedbackRequest(BaseModel):
    """摘要反馈请求"""
    item_id: int = Field(..., description="内容项ID")
    summary: str = Field(..., description="摘要内容")
    is_positive: bool = Field(..., description="是否正面反馈")
    feedback_text: Optional[str] = Field(None, description="反馈文本")


# ====================================
# API Routes
# ====================================


@router.post(
    "/content-summary",
    response_model=ContentSummaryResponse,
    summary="生成内容AI摘要",
    description="为单条内容生成AI摘要，包含关键亮点提取"
)
async def generate_content_summary(
    request: ContentSummaryRequest = Body(...),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """
    生成内容AI摘要
    
    根据内容的标题、简介等信息，使用LLM生成简洁准确的摘要
    """
    try:
        # 获取内容项
        item = db.query(Item).filter(Item.id == request.item_id).first()
        if not item:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="内容不存在"
            )
        
        # 如果提供了user_item_id，验证用户权限
        if request.user_item_id:
            user_item = db.query(UserItem).filter(
                UserItem.id == request.user_item_id,
                UserItem.user_id == current_user.id
            ).first()
            if not user_item:
                raise HTTPException(
                    status_code=status.HTTP_404_NOT_FOUND,
                    detail="用户记录不存在"
                )
        
        # 构建摘要生成提示词
        prompt = f"""请为以下内容生成一段简洁的摘要（3-5句话）和3个关键亮点。

标题: {item.title}
原标题: {item.original_title or '无'}
类型: {item.content_type}
简介: {item.overview or '无'}

请用中文回答，格式如下：
摘要: [你的摘要内容]
亮点:
1. [亮点1]
2. [亮点2]
3. [亮点3]
"""
        
        # 调用LLM生成摘要
        messages = [
            {"role": "system", "content": "你是一个专业的内容摘要生成助手。"},
            {"role": "user", "content": prompt}
        ]
        
        response = await LLMService.chat_completion(
            messages=messages,
            max_tokens=500,
            temperature=0.7
        )
        
        # 解析响应
        content = response.get("content", "").strip()
        
        # 提取摘要和亮点
        summary_text = ""
        highlights = []
        
        lines = content.split('\n')
        in_highlights = False
        
        for line in lines:
            line = line.strip()
            if line.startswith('摘要:'):
                summary_text = line.replace('摘要:', '').strip()
            elif line.startswith('亮点:'):
                in_highlights = True
            elif in_highlights and line and (line[0].isdigit() or line.startswith('-')):
                # 移除序号
                highlight = line.lstrip('0123456789.-) ').strip()
                if highlight:
                    highlights.append(highlight)
        
        # 如果没有成功解析，使用原始简介作为后备
        if not summary_text and item.overview:
            summary_text = item.overview[:200] + ('...' if len(item.overview) > 200 else '')
        
        if not summary_text:
            summary_text = f"《{item.title}》是一部{item.content_type}作品。"
        
        logger.info(f"Generated summary for item {item.id}: {len(summary_text)} chars")
        
        return ContentSummaryResponse(
            summary=summary_text,
            item_id=item.id,
            highlights=highlights
        )
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error generating content summary: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"生成摘要失败: {str(e)}"
        )


@router.post(
    "/summary/feedback",
    summary="提交摘要反馈",
    description="用户对AI生成的摘要提供反馈"
)
async def submit_summary_feedback(
    request: SummaryFeedbackRequest = Body(...),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """
    提交摘要反馈
    
    记录用户对AI摘要的评价，用于改进摘要质量
    """
    try:
        # 验证内容项存在
        item = db.query(Item).filter(Item.id == request.item_id).first()
        if not item:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="内容不存在"
            )
        
        # TODO: 将反馈保存到数据库（需要创建feedback表）
        # 暂时记录到日志
        logger.info(
            f"Summary feedback from user {current_user.id} for item {request.item_id}: "
            f"{'positive' if request.is_positive else 'negative'} - {request.feedback_text}"
        )
        
        return {
            "message": "反馈已提交",
            "item_id": request.item_id,
            "is_positive": request.is_positive
        }
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error submitting feedback: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"提交反馈失败: {str(e)}"
        )
