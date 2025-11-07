#!/usr/bin/env python3
"""
预下载 Embedding 模型脚本

在容器构建或首次启动时执行，确保模型文件已下载
"""
import os
import sys
from loguru import logger

# 设置日志
logger.remove()
logger.add(sys.stdout, level="INFO")

def download_model():
    """下载 embedding 模型"""
    try:
        model_name = os.environ.get(
            "EMBEDDING_MODEL", 
            "sentence-transformers/paraphrase-multilingual-MiniLM-L12-v2"
        )
        
        logger.info(f"开始下载 Embedding 模型: {model_name}")
        
        # 尝试使用国内镜像
        hf_endpoint = os.environ.get("HF_ENDPOINT")
        if hf_endpoint:
            logger.info(f"使用 HuggingFace 镜像: {hf_endpoint}")
        
        from sentence_transformers import SentenceTransformer
        
        # 下载模型
        model = SentenceTransformer(model_name)
        dimension = model.get_sentence_embedding_dimension()
        
        logger.info(f"✅ 模型下载成功！维度: {dimension}")
        logger.info(f"模型缓存位置: ~/.cache/huggingface/hub")
        
        return True
        
    except Exception as e:
        logger.error(f"❌ 模型下载失败: {e}")
        logger.warning("应用仍可启动，但在首次使用时会尝试重新下载")
        return False

if __name__ == "__main__":
    success = download_model()
    sys.exit(0 if success else 1)

