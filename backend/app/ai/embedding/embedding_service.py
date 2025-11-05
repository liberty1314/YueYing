"""
文本嵌入服务 - 使用 Sentence Transformers
"""
from typing import List, Union, Optional
from sentence_transformers import SentenceTransformer
from loguru import logger
import numpy as np

from app.core.config import settings


class EmbeddingService:
    """文本嵌入服务"""
    
    _instance: Optional["EmbeddingService"] = None
    _model: Optional[SentenceTransformer] = None
    
    def __new__(cls):
        if cls._instance is None:
            cls._instance = super().__new__(cls)
        return cls._instance
    
    def __init__(self):
        # 不在初始化时加载模型，延迟到实际使用时
        pass
    
    def _load_model(self):
        """加载嵌入模型"""
        try:
            model_name = settings.EMBEDDING_MODEL
            logger.info(f"Loading embedding model: {model_name}")
            self._model = SentenceTransformer(model_name)
            logger.info(f"Embedding model loaded successfully, dimension: {self._model.get_sentence_embedding_dimension()}")
        except Exception as e:
            logger.error(f"Failed to load embedding model: {e}")
            raise
    
    @property
    def model(self) -> SentenceTransformer:
        """获取模型"""
        if self._model is None:
            self._load_model()
        return self._model
    
    @property
    def embedding_dimension(self) -> int:
        """获取嵌入向量维度"""
        return self.model.get_sentence_embedding_dimension()
    
    def embed_text(self, text: str) -> List[float]:
        """
        将单个文本转换为嵌入向量
        
        Args:
            text: 输入文本
            
        Returns:
            嵌入向量
        """
        try:
            if not text or not text.strip():
                # 返回零向量
                return [0.0] * self.embedding_dimension
            
            embedding = self.model.encode(text, convert_to_tensor=False)
            return embedding.tolist()
        except Exception as e:
            logger.error(f"Failed to embed text: {e}")
            return [0.0] * self.embedding_dimension
    
    def embed_texts(self, texts: List[str], batch_size: int = 32) -> List[List[float]]:
        """
        批量将文本转换为嵌入向量
        
        Args:
            texts: 文本列表
            batch_size: 批处理大小
            
        Returns:
            嵌入向量列表
        """
        try:
            if not texts:
                return []
            
            # 过滤空文本
            processed_texts = [text if text and text.strip() else "" for text in texts]
            
            embeddings = self.model.encode(
                processed_texts,
                batch_size=batch_size,
                convert_to_tensor=False,
                show_progress_bar=len(processed_texts) > 100,
            )
            
            return embeddings.tolist()
        except Exception as e:
            logger.error(f"Failed to embed texts in batch: {e}")
            # 返回零向量列表
            return [[0.0] * self.embedding_dimension for _ in texts]
    
    def compute_similarity(
        self,
        embedding1: Union[List[float], np.ndarray],
        embedding2: Union[List[float], np.ndarray]
    ) -> float:
        """
        计算两个嵌入向量的余弦相似度
        
        Args:
            embedding1: 第一个嵌入向量
            embedding2: 第二个嵌入向量
            
        Returns:
            余弦相似度 (0-1)
        """
        try:
            vec1 = np.array(embedding1) if isinstance(embedding1, list) else embedding1
            vec2 = np.array(embedding2) if isinstance(embedding2, list) else embedding2
            
            norm1 = np.linalg.norm(vec1)
            norm2 = np.linalg.norm(vec2)
            
            if norm1 == 0 or norm2 == 0:
                return 0.0
            
            similarity = np.dot(vec1, vec2) / (norm1 * norm2)
            return float(similarity)
        except Exception as e:
            logger.error(f"Failed to compute similarity: {e}")
            return 0.0


# 全局嵌入服务实例
embedding_service = EmbeddingService()


def get_embedding_service() -> EmbeddingService:
    """获取嵌入服务实例"""
    return embedding_service

