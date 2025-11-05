"""
基于内容的推荐算法
"""
import numpy as np
from typing import List, Dict, Optional
from sqlalchemy.orm import Session
from loguru import logger

from app.models.item import Item
from app.models.user_item import UserItem
from app.models.tag import Tag
from app.ai.recommender.utils import extract_text_features, cosine_sim


class ContentBasedRecommender:
    """基于内容的推荐"""

    def __init__(self, db: Session):
        self.db = db
        self.item_features: Dict[int, np.ndarray] = {}
        self.item_id_map: Dict[int, int] = {}
        self.feature_matrix: Optional[np.ndarray] = None

    def _extract_item_features(self, item: Item) -> str:
        """
        提取物品特征文本

        Args:
            item: Item对象

        Returns:
            特征文本
        """
        features = []

        # 标题
        if item.title:
            features.append(item.title)

        # 类型
        if item.genres:
            features.extend(item.genres)

        # 描述（取前100字）
        if item.description:
            features.append(item.description[:100])

        # 语言
        if item.language:
            features.append(item.language)

        # 合并为一个字符串
        return " ".join(features)

    def build_model(self):
        """构建基于内容的推荐模型"""
        # 获取所有物品
        items = self.db.query(Item).all()

        if not items:
            logger.warning("No items found, cannot build content-based model")
            return

        # 提取特征
        item_texts = []
        item_ids = []

        for item in items:
            feature_text = self._extract_item_features(item)
            item_texts.append(feature_text)
            item_ids.append(item.id)

        # 构建映射
        self.item_id_map = {item_id: idx for idx, item_id in enumerate(item_ids)}

        # 使用 TF-IDF 提取特征
        self.feature_matrix = extract_text_features(item_texts)

        # 存储每个物品的特征向量
        for item_id, idx in self.item_id_map.items():
            self.item_features[item_id] = self.feature_matrix[idx]

        logger.info(
            f"Built content-based model for {len(self.item_features)} items"
        )

    def get_similar_items(
        self, item_id: int, top_k: int = 10
    ) -> List[tuple[int, float]]:
        """
        获取与指定物品最相似的其他物品

        Args:
            item_id: 物品ID
            top_k: 返回前K个相似物品

        Returns:
            [(similar_item_id, similarity_score), ...]
        """
        if self.feature_matrix is None or item_id not in self.item_id_map:
            return []

        item_idx = self.item_id_map[item_id]
        item_vector = self.feature_matrix[item_idx]

        # 计算与所有其他物品的相似度
        similarities = []

        for other_item_id, other_idx in self.item_id_map.items():
            if other_item_id != item_id:
                other_vector = self.feature_matrix[other_idx]
                similarity = cosine_sim(item_vector, other_vector)
                if similarity > 0:
                    similarities.append((other_item_id, float(similarity)))

        # 按相似度排序
        similarities.sort(key=lambda x: x[1], reverse=True)

        return similarities[:top_k]

    def recommend(
        self, user_id: int, top_k: int = 10, exclude_seen: bool = True
    ) -> List[tuple[int, float]]:
        """
        基于用户历史为用户推荐物品

        Args:
            user_id: 用户ID
            top_k: 返回前K个推荐
            exclude_seen: 是否排除用户已看过的物品

        Returns:
            [(item_id, score), ...]
        """
        # 确保模型已构建
        if self.feature_matrix is None:
            self.build_model()

        if self.feature_matrix is None:
            logger.warning("Content-based model not built")
            return []

        # 获取用户看过的物品（高评分的）
        user_items = (
            self.db.query(UserItem)
            .filter(
                UserItem.user_id == user_id,
                UserItem.rating >= 7,  # 只考虑高评分物品
            )
            .order_by(UserItem.rating.desc())
            .limit(10)
            .all()
        )

        if not user_items:
            logger.info(f"User {user_id} has no high-rated items")
            return []

        # 获取已看过的物品ID（用于排除）
        seen_items = set()
        if exclude_seen:
            all_user_items = (
                self.db.query(UserItem.item_id)
                .filter(UserItem.user_id == user_id)
                .all()
            )
            seen_items = {ui.item_id for ui in all_user_items}

        # 为每个高评分物品找相似物品
        item_scores: Dict[int, float] = {}

        for user_item in user_items:
            similar_items = self.get_similar_items(user_item.item_id, top_k=20)

            # 根据用户对原物品的评分加权
            weight = user_item.rating / 10.0  # 归一化到 0-1

            for similar_item_id, similarity in similar_items:
                # 排除已看过的
                if exclude_seen and similar_item_id in seen_items:
                    continue

                if similar_item_id not in item_scores:
                    item_scores[similar_item_id] = 0

                item_scores[similar_item_id] += similarity * weight

        # 按分数排序
        recommendations = sorted(item_scores.items(), key=lambda x: x[1], reverse=True)

        return recommendations[:top_k]

    def recommend_dict(
        self, user_id: int, top_k: int = 10, exclude_seen: bool = True
    ) -> Dict[int, float]:
        """
        返回字典格式的推荐结果

        Args:
            user_id: 用户ID
            top_k: 返回前K个推荐
            exclude_seen: 是否排除用户已看过的物品

        Returns:
            {item_id: score, ...}
        """
        recommendations = self.recommend(user_id, top_k, exclude_seen)
        return {item_id: score for item_id, score in recommendations}

