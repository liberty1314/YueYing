"""
AI助手API路由
"""
from fastapi import APIRouter, Depends, HTTPException, status, Body
from fastapi.responses import StreamingResponse
from sqlalchemy.orm import Session
from typing import List, Optional
from pydantic import BaseModel
from loguru import logger

from app.core.database import get_db
from app.api.dependencies.auth import get_current_user
from app.models.user import User
from app.ai.assistant.assistant_service import get_assistant_service, AssistantService


router = APIRouter(prefix="/assistant", tags=["AI Assistant"])


# ====================================
# Pydantic Schemas
# ====================================

class ChatRequest(BaseModel):
    """聊天请求"""
    message: str
    conversation_id: Optional[int] = None
    stream: bool = False


class ChatResponse(BaseModel):
    """聊天响应"""
    conversation_id: int
    message: str
    context_items: int = 0


class ConversationItem(BaseModel):
    """对话项"""
    id: int
    title: str
    created_at: str
    updated_at: Optional[str] = None
    message_count: int = 0


class MessageItem(BaseModel):
    """消息项"""
    id: int
    role: str
    content: str
    created_at: str


class ConversationDetail(BaseModel):
    """对话详情"""
    id: int
    title: str
    created_at: str
    updated_at: Optional[str] = None
    messages: List[MessageItem]


class ReviewRequest(BaseModel):
    """回顾生成请求"""
    period: str = "month"  # month或year


# ====================================
# API Routes
# ====================================

@router.post(
    "/chat",
    response_model=ChatResponse,
    summary="AI聊天",
    description="与AI助手对话"
)
async def chat(
    request: ChatRequest = Body(...),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
    assistant: AssistantService = Depends(get_assistant_service),
):
    """
    发送消息给AI助手并获取回复
    """
    try:
        if not request.message or not request.message.strip():
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="消息不能为空"
            )
        
        result = await assistant.chat(
            db=db,
            user_id=current_user.id,
            conversation_id=request.conversation_id,
            message=request.message,
            stream=request.stream
        )
        
        # 如果是流式响应
        if request.stream:
            async def generate():
                async for chunk in result["stream"]:
                    yield chunk
            
            return StreamingResponse(
                generate(),
                media_type="text/event-stream"
            )
        
        # 更新对话标题
        await assistant.update_conversation_title(
            db=db,
            conversation_id=result["conversation_id"],
            user_id=current_user.id
        )
        
        return ChatResponse(**result)
        
    except Exception as e:
        logger.error(f"Error in chat for user {current_user.id}: {e}", exc_info=True)
        # 在开发环境返回详细错误信息
        import traceback
        error_detail = f"处理消息失败: {str(e)}\n{traceback.format_exc()}"
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=error_detail[:500]  # 限制长度
        )


@router.get(
    "/conversations",
    response_model=List[ConversationItem],
    summary="获取对话列表",
    description="获取用户的所有对话"
)
def get_conversations(
    limit: int = 20,
    offset: int = 0,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
    assistant: AssistantService = Depends(get_assistant_service),
):
    """
    获取用户的对话列表
    """
    try:
        conversations = assistant.get_conversations(
            db=db,
            user_id=current_user.id,
            limit=limit,
            offset=offset
        )
        
        result = []
        for conv in conversations:
            result.append(ConversationItem(
                id=conv.id,
                title=conv.title,
                created_at=conv.created_at.isoformat() if conv.created_at else "",
                updated_at=conv.updated_at.isoformat() if conv.updated_at else None,
                message_count=len(conv.messages) if conv.messages else 0
            ))
        
        return result
        
    except Exception as e:
        logger.error(f"Error getting conversations for user {current_user.id}: {e}", exc_info=True)
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="获取对话列表失败"
        )


@router.get(
    "/conversations/{conversation_id}",
    response_model=ConversationDetail,
    summary="获取对话详情",
    description="获取对话的所有消息"
)
def get_conversation(
    conversation_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
    assistant: AssistantService = Depends(get_assistant_service),
):
    """
    获取对话详情和所有消息
    """
    try:
        messages = assistant.get_conversation_messages(
            db=db,
            conversation_id=conversation_id,
            user_id=current_user.id
        )
        
        if messages is None:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="对话不存在"
            )
        
        # 获取对话信息
        from app.models.conversation import Conversation
        conversation = db.query(Conversation).filter(
            Conversation.id == conversation_id
        ).first()
        
        return ConversationDetail(
            id=conversation.id,
            title=conversation.title,
            created_at=conversation.created_at.isoformat() if conversation.created_at else "",
            updated_at=conversation.updated_at.isoformat() if conversation.updated_at else None,
            messages=[
                MessageItem(
                    id=msg.id,
                    role=msg.role,
                    content=msg.content,
                    created_at=msg.created_at.isoformat() if msg.created_at else ""
                )
                for msg in messages
            ]
        )
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error getting conversation {conversation_id}: {e}", exc_info=True)
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="获取对话详情失败"
        )


@router.delete(
    "/conversations/{conversation_id}",
    summary="删除对话",
    description="删除指定对话及其所有消息"
)
def delete_conversation(
    conversation_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
    assistant: AssistantService = Depends(get_assistant_service),
):
    """
    删除对话
    """
    try:
        success = assistant.delete_conversation(
            db=db,
            conversation_id=conversation_id,
            user_id=current_user.id
        )
        
        if not success:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="对话不存在"
            )
        
        return {"success": True, "message": "对话已删除"}
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error deleting conversation {conversation_id}: {e}", exc_info=True)
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="删除对话失败"
        )


@router.post(
    "/review",
    summary="生成回顾",
    description="生成用户的月度或年度回顾"
)
async def generate_review(
    request: ReviewRequest = Body(...),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
    assistant: AssistantService = Depends(get_assistant_service),
):
    """
    生成个性化回顾
    """
    try:
        if request.period not in ["month", "year"]:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="period必须是'month'或'year'"
            )
        
        review = await assistant.generate_review(
            db=db,
            user_id=current_user.id,
            period=request.period
        )
        
        return {
            "period": request.period,
            "review": review
        }
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error generating review for user {current_user.id}: {e}", exc_info=True)
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="生成回顾失败"
        )

