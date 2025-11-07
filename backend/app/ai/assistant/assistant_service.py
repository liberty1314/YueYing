"""
AI助手服务 - 处理用户对话和查询
"""
from typing import List, Dict, Any, Optional
from sqlalchemy.orm import Session
from loguru import logger

from app.ai.rag.retriever import RAGRetriever, get_rag_retriever
from app.clients.llm.siliconflow import SiliconFlowClient  # 使用现有的LLM客户端
from app.ai.prompts.assistant import build_conversation_prompt, build_review_prompt
from app.models.conversation import Conversation, ConversationMessage
from app.models.user import User


class AssistantService:
    """AI助手服务"""
    
    def __init__(self):
        self.rag_retriever = None
        self.llm_client = None
        self.default_model = None
    
    def _ensure_initialized(self):
        """确保服务已初始化"""
        if self.rag_retriever is None:
            self.rag_retriever = get_rag_retriever()
        if self.llm_client is None:
            # 获取LLM配置并初始化客户端
            from app.core.database import SessionLocal
            from app.models.llm_config import LLMConfig
            db = SessionLocal()
            try:
                # 查询第一个可用的配置
                config = db.query(LLMConfig).filter(LLMConfig.enabled == True).first()
                if config:
                    self.llm_client = SiliconFlowClient(
                        api_key=config.api_key,
                        base_url=config.base_url
                    )
                    # 保存默认模型以便后续使用
                    self.default_model = config.default_model
                    logger.info(f"Initialized LLM client with provider: {config.provider}, model: {config.default_model}")
                else:
                    logger.warning("No active LLM config found")
                    self.llm_client = None
            except Exception as e:
                logger.error(f"Failed to initialize LLM client: {e}")
                self.llm_client = None
            finally:
                db.close()
    
    async def chat(
        self,
        db: Session,
        user_id: int,
        conversation_id: Optional[int],
        message: str,
        stream: bool = False
    ) -> Dict[str, Any]:
        """
        处理用户消息并返回AI回复
        
        Args:
            db: 数据库会话
            user_id: 用户ID
            conversation_id: 对话ID（可选，新对话则为None）
            message: 用户消息
            stream: 是否流式返回
            
        Returns:
            包含回复和对话信息的字典
        """
        try:
            self._ensure_initialized()
            
            # 1. 获取或创建对话
            conversation = await self._get_or_create_conversation(
                db, user_id, conversation_id
            )
            
            # 2. 保存用户消息
            user_message = ConversationMessage(
                conversation_id=conversation.id,
                role="user",
                content=message
            )
            db.add(user_message)
            db.commit()
            db.refresh(user_message)
            
            # 3. 使用RAG检索相关信息
            context = await self._build_context(db, user_id, message)
            
            # 4. 获取对话历史
            history = await self._get_conversation_history(db, conversation.id)
            
            # 5. 构建Prompt
            messages = build_conversation_prompt(message, context, history)
            
            # 6. 调用LLM
            if not self.llm_client:
                # 如果没有LLM配置，返回基于上下文的简单回复
                assistant_reply = f"根据您的记录：\n\n{context}\n\n暂时无法提供智能回复，请配置LLM服务。"
                
                # 保存回复
                assistant_message = ConversationMessage(
                    conversation_id=conversation.id,
                    role="assistant",
                    content=assistant_reply
                )
                db.add(assistant_message)
                db.commit()
                
                return {
                    "conversation_id": conversation.id,
                    "message": assistant_reply,
                    "context_items": len(context.split("\n\n")) if context else 0
                }
            
            if stream:
                # 流式响应
                return {
                    "conversation_id": conversation.id,
                    "stream": self._stream_response(db, conversation.id, messages)
                }
            else:
                # 非流式响应
                response = await self.llm_client.chat_completion(
                    model=self.default_model,
                    messages=messages,
                    temperature=0.7,
                    max_tokens=1000
                )
                
                assistant_reply = response.get("content", "抱歉，我无法回答这个问题。")
                
                # 7. 保存AI回复
                assistant_message = ConversationMessage(
                    conversation_id=conversation.id,
                    role="assistant",
                    content=assistant_reply,
                    message_metadata={"model": response.get("model"), "tokens": response.get("usage")}
                )
                db.add(assistant_message)
                db.commit()
                
                return {
                    "conversation_id": conversation.id,
                    "message": assistant_reply,
                    "context_items": len(context.split("\n\n")) if context else 0
                }
                
        except Exception as e:
            db.rollback()
            logger.error(f"Error in assistant chat: {e}", exc_info=True)
            raise
    
    async def _get_or_create_conversation(
        self,
        db: Session,
        user_id: int,
        conversation_id: Optional[int]
    ) -> Conversation:
        """获取或创建对话"""
        if conversation_id:
            conversation = db.query(Conversation).filter(
                Conversation.id == conversation_id,
                Conversation.user_id == user_id
            ).first()
            if conversation:
                return conversation
        
        # 创建新对话
        conversation = Conversation(
            user_id=user_id,
            title="新对话"  # 后续可以基于首条消息生成标题
        )
        db.add(conversation)
        db.commit()
        db.refresh(conversation)
        
        return conversation
    
    async def _build_context(
        self,
        db: Session,
        user_id: int,
        query: str
    ) -> str:
        """使用RAG构建上下文"""
        try:
            context = self.rag_retriever.build_context(
                query=query,
                user_id=user_id,
                db=db,
                limit=5
            )
            return context
        except Exception as e:
            logger.error(f"Error building context: {e}", exc_info=True)
            return "暂无相关记录。"
    
    async def _get_conversation_history(
        self,
        db: Session,
        conversation_id: int,
        limit: int = 10
    ) -> List[Dict[str, str]]:
        """获取对话历史"""
        messages = db.query(ConversationMessage).filter(
            ConversationMessage.conversation_id == conversation_id
        ).order_by(
            ConversationMessage.created_at.desc()
        ).limit(limit).all()
        
        # 反转顺序，从旧到新
        messages.reverse()
        
        return [
            {
                "role": msg.role,
                "content": msg.content
            }
            for msg in messages[:-1]  # 排除刚刚添加的用户消息
        ]
    
    async def _stream_response(
        self,
        db: Session,
        conversation_id: int,
        messages: List[Dict[str, str]]
    ):
        """流式响应生成器"""
        full_response = ""
        
        async for chunk in self.llm_client.chat_completion_stream(
            messages=messages,
            temperature=0.7,
            max_tokens=1000
        ):
            content = chunk.get("content", "")
            full_response += content
            yield content
        
        # 保存完整回复
        assistant_message = ConversationMessage(
            conversation_id=conversation_id,
            role="assistant",
            content=full_response
        )
        db.add(assistant_message)
        db.commit()
    
    async def generate_review(
        self,
        db: Session,
        user_id: int,
        period: str = "month"
    ) -> str:
        """
        生成用户回顾
        
        Args:
            db: 数据库会话
            user_id: 用户ID
            period: 时间周期 (month/year)
            
        Returns:
            生成的回顾文本
        """
        try:
            self._ensure_initialized()
            
            # 获取统计数据
            from app.services.stats_service import StatsService
            stats = StatsService.get_overview_stats(db, user_id)
            
            # 获取高评分内容
            from app.models.user_item import UserItem
            highlights = db.query(UserItem).filter(
                UserItem.user_id == user_id,
                UserItem.rating >= 8
            ).order_by(
                UserItem.rating.desc()
            ).limit(10).all()
            
            highlights_data = [
                {
                    "title": h.item.title if h.item else "未知",
                    "content_type": h.item.content_type if h.item else "unknown",
                    "rating": h.rating or 0
                }
                for h in highlights
            ]
            
            # 构建回顾Prompt
            prompt = build_review_prompt(period, stats, highlights_data)
            
            # 调用LLM生成回顾
            messages = [
                {"role": "system", "content": "你是一个善于总结和回顾的助手，能够生成温暖、有深度的个人回顾。"},
                {"role": "user", "content": prompt}
            ]
            
            response = await self.llm_client.chat_completion(
                messages=messages,
                temperature=0.8,  # 稍高的温度让回顾更有创意
                max_tokens=1500
            )
            
            return response.get("content", "无法生成回顾，请稍后再试。")
            
        except Exception as e:
            logger.error(f"Error generating review: {e}", exc_info=True)
            return "生成回顾时出错，请稍后再试。"
    
    def get_conversations(
        self,
        db: Session,
        user_id: int,
        limit: int = 20,
        offset: int = 0
    ) -> List[Conversation]:
        """获取用户的对话列表"""
        return db.query(Conversation).filter(
            Conversation.user_id == user_id
        ).order_by(
            Conversation.updated_at.desc()
        ).offset(offset).limit(limit).all()
    
    def get_conversation_messages(
        self,
        db: Session,
        conversation_id: int,
        user_id: int
    ) -> Optional[List[ConversationMessage]]:
        """获取对话的所有消息"""
        conversation = db.query(Conversation).filter(
            Conversation.id == conversation_id,
            Conversation.user_id == user_id
        ).first()
        
        if not conversation:
            return None
        
        return db.query(ConversationMessage).filter(
            ConversationMessage.conversation_id == conversation_id
        ).order_by(
            ConversationMessage.created_at.asc()
        ).all()
    
    def delete_conversation(
        self,
        db: Session,
        conversation_id: int,
        user_id: int
    ) -> bool:
        """删除对话"""
        conversation = db.query(Conversation).filter(
            Conversation.id == conversation_id,
            Conversation.user_id == user_id
        ).first()
        
        if not conversation:
            return False
        
        db.delete(conversation)
        db.commit()
        return True
    
    async def update_conversation_title(
        self,
        db: Session,
        conversation_id: int,
        user_id: int
    ):
        """
        基于首条消息自动生成对话标题
        """
        try:
            messages = self.get_conversation_messages(db, conversation_id, user_id)
            if not messages or len(messages) < 2:
                return
            
            first_user_message = next(
                (m for m in messages if m.role == "user"),
                None
            )
            
            if first_user_message:
                conversation = db.query(Conversation).filter(
                    Conversation.id == conversation_id
                ).first()
                
                if conversation and conversation.title == "新对话":
                    # 生成简短标题
                    title = first_user_message.content[:30]
                    if len(first_user_message.content) > 30:
                        title += "..."
                    
                    conversation.title = title
                    db.commit()
                    
        except Exception as e:
            logger.error(f"Error updating conversation title: {e}")


def get_assistant_service() -> AssistantService:
    """获取Assistant服务实例"""
    return AssistantService()

