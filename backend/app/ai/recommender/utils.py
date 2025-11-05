"""
推荐系统工具函数
"""
import numpy as np
from typing import List, Dict, Tuple
from sklearn.metrics.pairwise import cosine_similarity
from sklearn.feature_extraction.text import TfidfVectorizer
from loguru import logger


def cosine_sim(vec1: np.ndarray, vec2: np.ndarray) -> float:
    """
    计算两个向量的余弦相似度

    Args:
        vec1: 向量1
        vec2: 向量2

    Returns:
        余弦相似度 (0-1)
    """
    if len(vec1) == 0 or len(vec2) == 0:
        return 0.0

    similarity = cosine_similarity(vec1.reshape(1, -1), vec2.reshape(1, -1))[0][0]
    return float(similarity)


def build_user_item_matrix(
    user_items: List[Tuple[int, int, float]]
) -> Tuple[Dict[int, int], Dict[int, int], np.ndarray]:
    """
    构建用户-物品评分矩阵

    Args:
        user_items: [(user_id, item_id, rating), ...]

    Returns:
        (user_id_map, item_id_map, matrix)
    """
    if not user_items:
        return {}, {}, np.array([])

    # 创建映射
    user_ids = sorted(set(uid for uid, _, _ in user_items))
    item_ids = sorted(set(iid for _, iid, _ in user_items))

    user_id_map = {uid: idx for idx, uid in enumerate(user_ids)}
    item_id_map = {iid: idx for idx, iid in enumerate(item_ids)}

    # 构建矩阵
    matrix = np.zeros((len(user_ids), len(item_ids)))

    for user_id, item_id, rating in user_items:
        user_idx = user_id_map[user_id]
        item_idx = item_id_map[item_id]
        matrix[user_idx][item_idx] = rating

    return user_id_map, item_id_map, matrix


def compute_similarity_matrix(matrix: np.ndarray, similarity_type: str = "user") -> np.ndarray:
    """
    计算相似度矩阵

    Args:
        matrix: 用户-物品矩阵
        similarity_type: "user" 或 "item"

    Returns:
        相似度矩阵
    """
    if matrix.size == 0:
        return np.array([])

    if similarity_type == "user":
        # 用户相似度：计算行之间的相似度
        similarity_matrix = cosine_similarity(matrix)
    elif similarity_type == "item":
        # 物品相似度：计算列之间的相似度
        similarity_matrix = cosine_similarity(matrix.T)
    else:
        raise ValueError(f"Invalid similarity_type: {similarity_type}")

    return similarity_matrix


def extract_text_features(texts: List[str]) -> np.ndarray:
    """
    使用 TF-IDF 提取文本特征

    Args:
        texts: 文本列表

    Returns:
        TF-IDF 特征矩阵
    """
    if not texts:
        return np.array([])

    # 过滤空文本
    texts = [t if t else "" for t in texts]

    vectorizer = TfidfVectorizer(
        max_features=100,
        stop_words=None,  # 中文停用词需要自定义
        ngram_range=(1, 2),
        min_df=1,
    )

    try:
        tfidf_matrix = vectorizer.fit_transform(texts)
        return tfidf_matrix.toarray()
    except Exception as e:
        logger.error(f"Failed to extract text features: {e}")
        # 返回零矩阵
        return np.zeros((len(texts), 10))


def normalize_scores(scores: Dict[int, float]) -> Dict[int, float]:
    """
    归一化评分到 0-1 范围

    Args:
        scores: {item_id: score, ...}

    Returns:
        归一化后的评分
    """
    if not scores:
        return {}

    values = list(scores.values())
    min_val = min(values)
    max_val = max(values)

    if max_val == min_val:
        # 所有值相同，返回 0.5
        return {k: 0.5 for k in scores.keys()}

    normalized = {
        item_id: (score - min_val) / (max_val - min_val)
        for item_id, score in scores.items()
    }

    return normalized


def merge_recommendations(
    rec1: Dict[int, float],
    rec2: Dict[int, float],
    weight1: float = 0.5,
    weight2: float = 0.5,
) -> Dict[int, float]:
    """
    合并两个推荐结果

    Args:
        rec1: 推荐结果1 {item_id: score}
        rec2: 推荐结果2 {item_id: score}
        weight1: 权重1
        weight2: 权重2

    Returns:
        合并后的推荐结果
    """
    merged = {}

    # 归一化
    rec1_norm = normalize_scores(rec1) if rec1 else {}
    rec2_norm = normalize_scores(rec2) if rec2 else {}

    # 合并
    all_items = set(rec1_norm.keys()) | set(rec2_norm.keys())

    for item_id in all_items:
        score1 = rec1_norm.get(item_id, 0)
        score2 = rec2_norm.get(item_id, 0)
        merged[item_id] = weight1 * score1 + weight2 * score2

    return merged

