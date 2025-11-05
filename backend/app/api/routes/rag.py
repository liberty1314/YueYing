"""
RAG API 路由 - 检索增强生成
"""
from fastapi import APIRouter, Depends, HTTPException, status, Query, Body
from sqlalchemy.orm import Session
from typing import List, Optional
from pydantic import BaseModel
from loguru import logger

from app.core.database import get_db
from app.api.dependencies.auth import get_current_user
from app.models.user import User
from app.ai.rag.retriever import get_rag_retriever, RAGRetriever
from app.ai.rag.vector_store import get_vector_store, VectorStore


router = APIRouter(prefix="/rag", tags=["RAG"])


# ====================================
# Pydantic Schemas
# ====================================


class SearchRequest(BaseModel):
    """搜索请求"""
    query: str
    limit: int = 5
    content_type: Optional[str] = None
    min_similarity: float = 0.001  # 降低默认阈值，因为使用exp衰减后相似度较小


class SearchResult(BaseModel):
    """搜索结果"""
    user_item_id: int
    similarity: float
    item: dict
    user_item: dict
    tags: List[dict]


class RebuildIndexRequest(BaseModel):
    """重建索引请求"""
    user_id: Optional[int] = None


class VectorStoreStats(BaseModel):
    """向量存储统计"""
    total_items: int
    collection_name: str
    embedding_dimension: int


# ====================================
# API Routes
# ====================================


@router.post(
    "/search",
    response_model=List[SearchResult],
    summary="语义搜索",
    description="使用语义搜索查询用户记录"
)
def semantic_search(
    request: SearchRequest = Body(...),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
    retriever: RAGRetriever = Depends(get_rag_retriever),
):
    """
    语义搜索用户记录
    """
    try:
        results = retriever.retrieve_relevant_items(
            query=request.query,
            user_id=current_user.id,
            db=db,
            limit=request.limit,
            content_type=request.content_type,
            min_similarity=request.min_similarity,
        )
        return results
    except Exception as e:
        logger.error(f"Error in semantic search for user {current_user.id}: {e}", exc_info=True)
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="语义搜索失败"
        )


@router.post(
    "/build-context",
    summary="构建上下文",
    description="为给定查询构建LLM上下文"
)
def build_context(
    query: str = Body(..., embed=True),
    limit: int = Body(3, embed=True),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
    retriever: RAGRetriever = Depends(get_rag_retriever),
):
    """
    构建查询的上下文
    """
    try:
        context = retriever.build_context(
            query=query,
            user_id=current_user.id,
            db=db,
            limit=limit,
        )
        return {"context": context}
    except Exception as e:
        logger.error(f"Error building context for user {current_user.id}: {e}", exc_info=True)
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="构建上下文失败"
        )


@router.get(
    "/stats",
    response_model=VectorStoreStats,
    summary="向量存储统计",
    description="获取向量存储的统计信息"
)
def get_stats(
    current_user: User = Depends(get_current_user),
    vector_store: VectorStore = Depends(get_vector_store),
):
    """
    获取向量存储统计信息
    """
    try:
        stats = vector_store.get_stats()
        return stats
    except Exception as e:
        logger.error(f"Error getting vector store stats: {e}", exc_info=True)
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="获取统计信息失败"
        )


@router.post(
    "/rebuild-index",
    summary="重建索引",
    description="重建向量索引（管理员功能）"
)
async def rebuild_index(
    request: RebuildIndexRequest = Body(...),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
    vector_store: VectorStore = Depends(get_vector_store),
):
    """
    重建向量索引
    
    注意：这是一个重量级操作
    """
    try:
        # TODO: 添加管理员权限检查
        # if not current_user.is_admin:
        #     raise HTTPException(status_code=403, detail="需要管理员权限")
        
        result = await vector_store.rebuild_index(
            db=db,
            user_id=request.user_id or current_user.id
        )
        return result
    except Exception as e:
        logger.error(f"Error rebuilding index: {e}", exc_info=True)
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="重建索引失败"
        )

