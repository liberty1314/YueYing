"""
RAG 向量存储服务 - 管理用户记录的向量化和检索
"""
from typing import List, Dict, Any, Optional
from sqlalchemy.orm import Session
from loguru import logger

from app.core.vector_db import get_vector_db, VectorDBClient
from app.ai.embedding.embedding_service import get_embedding_service, EmbeddingService
from app.models.user_item import UserItem
from app.models.item import Item
from app.models.tag import Tag


class VectorStore:
    """向量存储服务"""
    
    COLLECTION_NAME = "user_items"
    
    def __init__(self):
        # 延迟初始化
        self.vector_db = None
        self.embedding_service = None
        self._collection = None
    
    def _ensure_initialized(self):
        """确保服务已初始化"""
        if self.vector_db is None:
            self.vector_db = get_vector_db()
        if self.embedding_service is None:
            self.embedding_service = get_embedding_service()
    
    @property
    def collection(self):
        """获取或创建collection"""
        self._ensure_initialized()
        if self._collection is None:
            self._collection = self.vector_db.get_or_create_collection(
                name=self.COLLECTION_NAME,
                metadata={"description": "User items with embeddings"}
            )
        return self._collection
    
    def _build_document_text(self, user_item: UserItem, item: Item, tags: List[Tag]) -> str:
        """
        构建用于向量化的文档文本
        
        组合标题、描述、笔记、标签等信息
        """
        parts = []
        
        # 标题
        if item.title:
            parts.append(f"标题: {item.title}")
        
        # 原标题
        if item.original_title:
            parts.append(f"原标题: {item.original_title}")
        
        # 描述
        if item.description:
            parts.append(f"简介: {item.description}")
        
        # 用户笔记
        if user_item.notes:
            parts.append(f"笔记: {user_item.notes}")
        
        # 标签
        if tags:
            tag_names = [tag.name for tag in tags]
            parts.append(f"标签: {', '.join(tag_names)}")
        
        # 类型
        if item.content_type:
            parts.append(f"类型: {item.content_type}")
        
        return " ".join(parts)
    
    async def add_user_item(self, db: Session, user_item: UserItem) -> bool:
        """
        添加用户记录到向量存储
        
        Args:
            db: 数据库会话
            user_item: 用户记录
            
        Returns:
            是否成功
        """
        try:
            # 查询相关数据
            item = db.query(Item).filter(Item.id == user_item.item_id).first()
            if not item:
                logger.warning(f"Item {user_item.item_id} not found for user_item {user_item.id}")
                return False
            
            # 查询标签 - 通过中间表查询实际的Tag对象
            tags = (
                db.query(Tag)
                .join(Tag.user_items)  # Tag -> UserItemTag关系
                .filter(UserItem.id == user_item.id)
                .all()
            )
            
            # 构建文档文本
            document_text = self._build_document_text(user_item, item, tags)
            logger.info(f"Built document for user_item {user_item.id}: {document_text[:200]}...")
            
            # 生成嵌入
            self._ensure_initialized()
            embedding = self.embedding_service.embed_text(document_text)
            
            if not embedding:
                logger.error(f"Failed to generate embedding for user_item {user_item.id}")
                return False
            
            # 构建元数据
            metadata = {
                "user_id": user_item.user_id,
                "item_id": item.id,
                "content_type": item.content_type or "",
                "title": item.title or "",
                "status": user_item.status.value if hasattr(user_item.status, 'value') else (user_item.status or ""),
                "rating": user_item.rating or 0,
            }
            
            # 添加到向量数据库
            self.collection.add(
                ids=[str(user_item.id)],
                embeddings=[embedding],
                documents=[document_text],
                metadatas=[metadata]
            )
            
            logger.info(f"Added user_item {user_item.id} to vector store")
            return True
        except Exception as e:
            logger.error(f"Failed to add user_item {user_item.id} to vector store: {e}")
            return False
    
    async def update_user_item(self, db: Session, user_item: UserItem) -> bool:
        """更新用户记录的向量"""
        try:
            # 先删除旧的
            await self.delete_user_item(user_item.id)
            # 再添加新的
            return await self.add_user_item(db, user_item)
        except Exception as e:
            logger.error(f"Failed to update user_item {user_item.id} in vector store: {e}")
            return False
    
    async def delete_user_item(self, user_item_id: int) -> bool:
        """从向量存储删除用户记录"""
        try:
            self._ensure_initialized()
            self.collection.delete(ids=[str(user_item_id)])
            logger.info(f"Deleted user_item {user_item_id} from vector store")
            return True
        except Exception as e:
            logger.error(f"Failed to delete user_item {user_item_id} from vector store: {e}")
            return False
    
    def search(
        self,
        query: str,
        user_id: int,
        limit: int = 5,
        content_type: Optional[str] = None
    ) -> List[Dict[str, Any]]:
        """
        语义搜索用户记录
        
        Args:
            query: 查询文本
            user_id: 用户ID
            limit: 返回数量
            content_type: 内容类型过滤
            
        Returns:
            搜索结果列表
        """
        try:
            self._ensure_initialized()
            
            # 生成查询嵌入
            query_embedding = self.embedding_service.embed_text(query)
            if not query_embedding:
                logger.error("Failed to generate query embedding")
                return []
            
            # 构建where条件
            where = {"user_id": user_id}
            if content_type:
                where["content_type"] = content_type
            
            logger.info(f"Searching with query='{query[:50]}', user_id={user_id}, where={where}")
            
            # 搜索
            results = self.collection.query(
                query_embeddings=[query_embedding],
                n_results=limit,
                where=where,
                include=["metadatas", "documents", "distances"]
            )
            
            logger.info(f"ChromaDB returned: {len(results.get('ids', [[]])[0]) if results and 'ids' in results else 0} results")
            
            # 格式化结果
            formatted_results = []
            if results and results["ids"] and results["ids"][0]:
                for i, user_item_id in enumerate(results["ids"][0]):
                    distance = results["distances"][0][i]
                    # ChromaDB使用L2距离（欧氏距离的平方），转换为0-1的相似度分数
                    # 使用更温和的转换公式: similarity = 1 / (1 + distance)
                    # 距离0 -> 相似度1, 距离越大相似度越小
                    similarity = 1.0 / (1.0 + distance)
                    
                    formatted_results.append({
                        "user_item_id": int(user_item_id),
                        "metadata": results["metadatas"][0][i],
                        "document": results["documents"][0][i],
                        "distance": distance,
                        "similarity": similarity,
                    })
            
            logger.info(f"Found {len(formatted_results)} results for query: {query[:50]}")
            return formatted_results
        except Exception as e:
            logger.error(f"Failed to search in vector store: {e}", exc_info=True)
            return []
    
    def get_stats(self) -> Dict[str, Any]:
        """获取向量存储统计信息"""
        try:
            self._ensure_initialized()
            count = self.collection.count() if self.collection else 0
            
            # 获取embedding维度，但不强制加载模型
            embedding_dim = 384  # 默认维度
            if self.embedding_service._model is not None:
                try:
                    embedding_dim = self.embedding_service._model.get_sentence_embedding_dimension()
                except:
                    pass
            
            return {
                "total_items": count,
                "collection_name": self.COLLECTION_NAME,
                "embedding_dimension": embedding_dim,
            }
        except Exception as e:
            logger.error(f"Failed to get vector store stats: {e}", exc_info=True)
            return {
                "total_items": 0,
                "collection_name": self.COLLECTION_NAME,
                "embedding_dimension": 384,
            }
    
    async def rebuild_index(self, db: Session, user_id: Optional[int] = None) -> Dict[str, Any]:
        """
        重建索引
        
        Args:
            db: 数据库会话
            user_id: 如果指定，只重建该用户的索引
            
        Returns:
            重建结果统计
        """
        try:
            self._ensure_initialized()
            
            # 如果指定用户，只删除该用户的记录
            if user_id:
                # 查询该用户的所有user_item_id
                user_items = db.query(UserItem).filter(UserItem.user_id == user_id).all()
                for ui in user_items:
                    await self.delete_user_item(ui.id)
            else:
                # 重置整个collection
                self.vector_db.delete_collection(self.COLLECTION_NAME)
                self._collection = None
            
            # 查询需要索引的用户记录
            query = db.query(UserItem)
            if user_id:
                query = query.filter(UserItem.user_id == user_id)
            
            user_items = query.all()
            
            success_count = 0
            error_count = 0
            
            for ui in user_items:
                # 添加到向量存储（使用新的签名）
                if await self.add_user_item(db, ui):
                    success_count += 1
                else:
                    error_count += 1
            
            logger.info(f"Rebuilt index: {success_count} success, {error_count} errors")
            return {
                "success_count": success_count,
                "error_count": error_count,
                "total": len(user_items)
            }
        except Exception as e:
            logger.error(f"Failed to rebuild index: {e}", exc_info=True)
            return {
                "success_count": 0,
                "error_count": 0,
                "total": 0,
                "error": str(e)
            }


# 全局向量存储实例
vector_store = VectorStore()


def get_vector_store() -> VectorStore:
    """获取向量存储实例"""
    return vector_store

