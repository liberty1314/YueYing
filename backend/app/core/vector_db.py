"""
向量数据库配置和客户端
"""
import chromadb
from chromadb.config import Settings
from loguru import logger
from typing import Optional, List, Dict, Any
from pathlib import Path

from app.core.config import settings


class VectorDBClient:
    """向量数据库客户端（ChromaDB）"""
    
    _instance: Optional["VectorDBClient"] = None
    _client: Optional[chromadb.ClientAPI] = None
    
    def __new__(cls):
        if cls._instance is None:
            cls._instance = super().__new__(cls)
        return cls._instance
    
    def __init__(self):
        # 延迟初始化，只在实际使用时初始化
        pass
    
    def _initialize_client(self):
        """初始化ChromaDB客户端"""
        try:
            # 使用持久化存储
            persist_directory = getattr(settings, 'VECTOR_DB_PATH', './data/chromadb')
            Path(persist_directory).mkdir(parents=True, exist_ok=True)
            
            self._client = chromadb.PersistentClient(
                path=persist_directory,
                settings=Settings(
                    anonymized_telemetry=False,
                    allow_reset=True,
                )
            )
            logger.info(f"ChromaDB client initialized at {persist_directory}")
        except Exception as e:
            logger.error(f"Failed to initialize ChromaDB client: {e}")
            raise
    
    @property
    def client(self) -> chromadb.ClientAPI:
        """获取ChromaDB客户端"""
        if self._client is None:
            self._initialize_client()
        return self._client
    
    def get_or_create_collection(
        self,
        name: str,
        metadata: Optional[Dict[str, Any]] = None,
        embedding_function: Optional[Any] = None,
    ):
        """获取或创建Collection"""
        try:
            collection = self.client.get_or_create_collection(
                name=name,
                metadata=metadata or {},
                embedding_function=embedding_function,
            )
            logger.info(f"Collection '{name}' ready")
            return collection
        except Exception as e:
            logger.error(f"Failed to get/create collection '{name}': {e}")
            raise
    
    def delete_collection(self, name: str):
        """删除Collection"""
        try:
            self.client.delete_collection(name=name)
            logger.info(f"Collection '{name}' deleted")
        except Exception as e:
            logger.error(f"Failed to delete collection '{name}': {e}")
            raise
    
    def list_collections(self) -> List[str]:
        """列出所有Collections"""
        try:
            collections = self.client.list_collections()
            return [c.name for c in collections]
        except Exception as e:
            logger.error(f"Failed to list collections: {e}")
            return []
    
    def reset(self):
        """重置数据库（慎用！）"""
        try:
            self.client.reset()
            logger.warning("ChromaDB reset - all data deleted!")
        except Exception as e:
            logger.error(f"Failed to reset ChromaDB: {e}")
            raise
    
    def get_collection_stats(self, collection_name: str) -> Dict[str, Any]:
        """获取Collection统计信息"""
        try:
            collection = self.client.get_collection(collection_name)
            count = collection.count()
            return {
                "name": collection_name,
                "count": count,
                "metadata": collection.metadata,
            }
        except Exception as e:
            logger.error(f"Failed to get stats for collection '{collection_name}': {e}")
            return {
                "name": collection_name,
                "count": 0,
                "error": str(e),
            }


# 全局向量数据库客户端实例
vector_db_client = VectorDBClient()


def get_vector_db() -> VectorDBClient:
    """获取向量数据库客户端"""
    return vector_db_client

