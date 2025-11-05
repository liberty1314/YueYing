"""
协同过滤推荐算法
"""
import numpy as np
from typing import List, Dict, Tuple, Optional
from sqlalchemy.orm import Session
from loguru import logger

from app.models.user_item import UserItem
from app.models.item import Item
from app.ai.recommender.utils import (
    build_user_item_matrix,
    compute_similarity_matrix,
)


class CollaborativeRecommender:
    """基于用户的协同过滤推荐"""

    def __init__(self, db: Session):
        self.db = db
        self.user_id_map: Dict[int, int] = {}
        self.item_id_map: Dict[int, int] = {}
        self.user_similarity_matrix: Optional[np.ndarray] = None
        self.rating_matrix: Optional[np.ndarray] = None

    def _load_user_items(self) -> List[Tuple[int, int, float]]:
        """
        加载所有用户-物品评分数据

        Returns:
            [(user_id, item_id, rating), ...]
        """
        user_items = (
            self.db.query(UserItem.user_id, UserItem.item_id, UserItem.rating)
            .filter(UserItem.rating.isnot(None))
            .all()
        )

        # 转换为 (user_id, item_id, rating) 元组列表
        data = [(ui.user_id, ui.item_id, float(ui.rating)) for ui in user_items]

        logger.info(f"Loaded {len(data)} user-item ratings")
        return data

    def build_model(self):
        """构建协同过滤模型"""
        # 加载数据
        user_items = self._load_user_items()

        if not user_items:
            logger.warning("No user-item data found, cannot build model")
            return

        # 构建用户-物品矩阵
        self.user_id_map, self.item_id_map, self.rating_matrix = build_user_item_matrix(
            user_items
        )

        # 计算用户相似度矩阵
        if self.rating_matrix.size > 0:
            self.user_similarity_matrix = compute_similarity_matrix(
                self.rating_matrix, similarity_type="user"
            )

        logger.info(
            f"Built collaborative filtering model: "
            f"{len(self.user_id_map)} users, {len(self.item_id_map)} items"
        )

    def get_similar_users(self, user_id: int, top_k: int = 10) -> List[Tuple[int, float]]:
        """
        获取与指定用户最相似的其他用户

        Args:
            user_id: 用户ID
            top_k: 返回前K个相似用户

        Returns:
            [(similar_user_id, similarity_score), ...]
        """
        if self.user_similarity_matrix is None or user_id not in self.user_id_map:
            return []

        user_idx = self.user_id_map[user_id]
        similarities = self.user_similarity_matrix[user_idx]

        # 获取相似用户（排除自己）
        similar_users = []
        for other_user_id, other_idx in self.user_id_map.items():
            if other_user_id != user_id:
                similarity = similarities[other_idx]
                if similarity > 0:
                    similar_users.append((other_user_id, float(similarity)))

        # 按相似度排序
        similar_users.sort(key=lambda x: x[1], reverse=True)

        return similar_users[:top_k]

    def recommend(
        self, user_id: int, top_k: int = 10, exclude_seen: bool = True
    ) -> List[Tuple[int, float]]:
        """
        为用户推荐物品

        Args:
            user_id: 用户ID
            top_k: 返回前K个推荐
            exclude_seen: 是否排除用户已看过的物品

        Returns:
            [(item_id, score), ...]
        """
        # 确保模型已构建
        if self.user_similarity_matrix is None:
            self.build_model()

        if self.user_similarity_matrix is None or user_id not in self.user_id_map:
            logger.warning(f"Cannot recommend for user {user_id}: model not built or user not found")
            return []

        # 获取相似用户
        similar_users = self.get_similar_users(user_id, top_k=20)

        if not similar_users:
            return []

        # 获取用户已看过的物品
        seen_items = set()
        if exclude_seen:
            user_items = (
                self.db.query(UserItem.item_id)
                .filter(UserItem.user_id == user_id)
                .all()
            )
            seen_items = {ui.item_id for ui in user_items}

        # 计算推荐分数
        item_scores: Dict[int, float] = {}

        for similar_user_id, similarity in similar_users:
            # 获取相似用户的评分
            if similar_user_id not in self.user_id_map:
                continue

            similar_user_idx = self.user_id_map[similar_user_id]

            for item_id, item_idx in self.item_id_map.items():
                # 排除已看过的
                if exclude_seen and item_id in seen_items:
                    continue

                rating = self.rating_matrix[similar_user_idx][item_idx]
                if rating > 0:
                    # 加权评分
                    if item_id not in item_scores:
                        item_scores[item_id] = 0
                    item_scores[item_id] += similarity * rating

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

