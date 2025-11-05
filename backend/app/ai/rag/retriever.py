"""
RAG 检索服务 - 语义搜索和上下文构建
"""
from typing import List, Dict, Any, Optional
from sqlalchemy.orm import Session
from loguru import logger

from app.ai.rag.vector_store import get_vector_store, VectorStore
from app.models.user_item import UserItem
from app.models.item import Item
from app.models.tag import Tag, UserItemTag


class RAGRetriever:
    """RAG检索器"""
    
    def __init__(self):
        # 延迟初始化
        self.vector_store = None
    
    def _ensure_initialized(self):
        """确保向量存储已初始化"""
        if self.vector_store is None:
            self.vector_store = get_vector_store()
    
    def retrieve_relevant_items(
        self,
        query: str,
        user_id: int,
        db: Session,
        limit: int = 5,
        content_type: Optional[str] = None,
        min_similarity: float = 0.001,  # 降低默认阈值
    ) -> List[Dict[str, Any]]:
        """
        检索与查询相关的用户记录
        
        Args:
            query: 查询文本
            user_id: 用户ID
            db: 数据库会话
            limit: 返回数量
            content_type: 内容类型过滤
            min_similarity: 最小相似度阈值
            
        Returns:
            相关记录列表（包含完整信息）
        """
        try:
            self._ensure_initialized()
            # 向量搜索
            search_results = self.vector_store.search(
                query=query,
                user_id=user_id,
                limit=limit * 2,  # 多检索一些，然后过滤
                content_type=content_type
            )
            
            # 过滤低相似度结果
            filtered_results = [
                r for r in search_results
                if r.get("similarity", 0) >= min_similarity
            ][:limit]
            
            # 获取完整的用户记录信息
            enriched_results = []
            for result in filtered_results:
                user_item_id = result["user_item_id"]
                
                # 查询完整记录
                user_item = db.query(UserItem).filter(UserItem.id == user_item_id).first()
                if not user_item:
                    continue
                
                item = db.query(Item).filter(Item.id == user_item.item_id).first()
                if not item:
                    continue
                
                # 查询标签 - 通过中间表查询实际的Tag对象
                tags = (
                    db.query(Tag)
                    .join(UserItemTag, UserItemTag.tag_id == Tag.id)
                    .filter(UserItemTag.user_item_id == user_item.id)
                    .all()
                )
                
                enriched_results.append({
                    "user_item_id": user_item_id,
                    "similarity": result["similarity"],
                    "item": {
                        "id": item.id,
                        "title": item.title,
                        "original_title": item.original_title,
                        "content_type": item.content_type,
                        "description": item.description,
                    },
                    "user_item": {
                        "status": user_item.status.value if hasattr(user_item.status, 'value') else user_item.status,
                        "rating": user_item.rating,
                        "notes": user_item.notes,
                        "created_at": user_item.created_at.isoformat() if hasattr(user_item, 'created_at') and user_item.created_at else None,
                        "updated_at": user_item.updated_at.isoformat() if hasattr(user_item, 'updated_at') and user_item.updated_at else None,
                    },
                    "tags": [{"id": tag.id, "name": tag.name} for tag in tags],
                })
            
            logger.info(f"Retrieved {len(enriched_results)} relevant items for query: {query[:50]}")
            return enriched_results
        except Exception as e:
            logger.error(f"Failed to retrieve relevant items: {e}")
            return []
    
    def build_context(
        self,
        query: str,
        user_id: int,
        db: Session,
        limit: int = 3,
    ) -> str:
        """
        为LLM构建上下文
        
        Args:
            query: 查询文本
            user_id: 用户ID
            db: 数据库会话
            limit: 检索数量
            
        Returns:
            格式化的上下文文本
        """
        try:
            self._ensure_initialized()
            # 检索相关记录
            relevant_items = self.retrieve_relevant_items(
                query=query,
                user_id=user_id,
                db=db,
                limit=limit,
            )
            
            if not relevant_items:
                return "未找到相关记录。"
            
            # 构建上下文
            context_parts = ["以下是用户的相关记录：\n"]
            
            for i, item_data in enumerate(relevant_items, 1):
                item = item_data["item"]
                user_item = item_data["user_item"]
                tags = item_data["tags"]
                
                context_parts.append(f"\n{i}. {item['title']}")
                if item.get("original_title"):
                    context_parts.append(f" ({item['original_title']})")
                
                context_parts.append(f"\n   类型: {item.get('content_type', '未知')}")
                
                if user_item.get("status"):
                    context_parts.append(f"\n   状态: {user_item['status']}")
                
                if user_item.get("rating"):
                    context_parts.append(f"\n   评分: {user_item['rating']}/10")
                
                if tags:
                    tag_names = [tag["name"] for tag in tags]
                    context_parts.append(f"\n   标签: {', '.join(tag_names)}")
                
                if user_item.get("notes"):
                    notes = user_item["notes"][:200]  # 限制长度
                    context_parts.append(f"\n   笔记: {notes}")
                
                context_parts.append("")  # 空行分隔
            
            context = "".join(context_parts)
            logger.debug(f"Built context ({len(context)} chars) for query: {query[:50]}")
            return context
        except Exception as e:
            logger.error(f"Failed to build context: {e}")
            return "无法构建上下文。"


# 全局检索器实例
rag_retriever = RAGRetriever()


def get_rag_retriever() -> RAGRetriever:
    """获取RAG检索器实例"""
    return rag_retriever

