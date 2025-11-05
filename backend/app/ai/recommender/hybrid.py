"""
混合推荐算法
"""
from typing import List, Dict, Tuple
from sqlalchemy.orm import Session
from loguru import logger

from app.ai.recommender.collaborative import CollaborativeRecommender
from app.ai.recommender.content_based import ContentBasedRecommender
from app.ai.recommender.utils import merge_recommendations, normalize_scores


class HybridRecommender:
    """混合推荐系统（结合协同过滤和基于内容的推荐）"""

    def __init__(
        self,
        db: Session,
        collaborative_weight: float = 0.6,
        content_weight: float = 0.4,
    ):
        """
        Args:
            db: 数据库会话
            collaborative_weight: 协同过滤权重
            content_weight: 基于内容权重
        """
        self.db = db
        self.collaborative_weight = collaborative_weight
        self.content_weight = content_weight

        # 初始化推荐器
        self.collaborative_recommender = CollaborativeRecommender(db)
        self.content_recommender = ContentBasedRecommender(db)

        self._model_built = False

    def build_model(self):
        """构建混合推荐模型"""
        logger.info("Building hybrid recommendation model...")

        # 构建协同过滤模型
        self.collaborative_recommender.build_model()

        # 构建基于内容的模型
        self.content_recommender.build_model()

        self._model_built = True
        logger.info("Hybrid recommendation model built successfully")

    def recommend(
        self,
        user_id: int,
        top_k: int = 10,
        exclude_seen: bool = True,
        strategy: str = "weighted",
    ) -> List[Tuple[int, float]]:
        """
        为用户生成混合推荐

        Args:
            user_id: 用户ID
            top_k: 返回前K个推荐
            exclude_seen: 是否排除用户已看过的物品
            strategy: 混合策略
                - "weighted": 加权融合
                - "cascade": 级联推荐（先协同，不够再基于内容）
                - "switch": 根据数据量切换

        Returns:
            [(item_id, score), ...]
        """
        # 确保模型已构建
        if not self._model_built:
            self.build_model()

        if strategy == "weighted":
            return self._weighted_recommendation(user_id, top_k, exclude_seen)
        elif strategy == "cascade":
            return self._cascade_recommendation(user_id, top_k, exclude_seen)
        elif strategy == "switch":
            return self._switch_recommendation(user_id, top_k, exclude_seen)
        else:
            logger.warning(f"Unknown strategy: {strategy}, using weighted")
            return self._weighted_recommendation(user_id, top_k, exclude_seen)

    def _weighted_recommendation(
        self, user_id: int, top_k: int, exclude_seen: bool
    ) -> List[Tuple[int, float]]:
        """
        加权融合推荐

        Args:
            user_id: 用户ID
            top_k: 返回前K个推荐
            exclude_seen: 是否排除用户已看过的物品

        Returns:
            [(item_id, score), ...]
        """
        # 获取协同过滤推荐
        cf_recommendations = self.collaborative_recommender.recommend_dict(
            user_id, top_k=top_k * 2, exclude_seen=exclude_seen
        )

        # 获取基于内容的推荐
        cb_recommendations = self.content_recommender.recommend_dict(
            user_id, top_k=top_k * 2, exclude_seen=exclude_seen
        )

        # 合并推荐
        merged = merge_recommendations(
            cf_recommendations,
            cb_recommendations,
            weight1=self.collaborative_weight,
            weight2=self.content_weight,
        )

        # 排序并返回
        recommendations = sorted(merged.items(), key=lambda x: x[1], reverse=True)
        return recommendations[:top_k]

    def _cascade_recommendation(
        self, user_id: int, top_k: int, exclude_seen: bool
    ) -> List[Tuple[int, float]]:
        """
        级联推荐（先协同过滤，不够再补充基于内容）

        Args:
            user_id: 用户ID
            top_k: 返回前K个推荐
            exclude_seen: 是否排除用户已看过的物品

        Returns:
            [(item_id, score), ...]
        """
        # 先用协同过滤
        cf_recommendations = self.collaborative_recommender.recommend(
            user_id, top_k=top_k, exclude_seen=exclude_seen
        )

        # 如果协同过滤推荐数量够了，直接返回
        if len(cf_recommendations) >= top_k:
            return cf_recommendations[:top_k]

        # 如果不够，用基于内容的推荐补充
        cf_item_ids = {item_id for item_id, _ in cf_recommendations}

        cb_recommendations = self.content_recommender.recommend(
            user_id, top_k=top_k * 2, exclude_seen=exclude_seen
        )

        # 过滤掉协同过滤已推荐的
        cb_filtered = [
            (item_id, score)
            for item_id, score in cb_recommendations
            if item_id not in cf_item_ids
        ]

        # 合并结果
        combined = cf_recommendations + cb_filtered

        return combined[:top_k]

    def _switch_recommendation(
        self, user_id: int, top_k: int, exclude_seen: bool
    ) -> List[Tuple[int, float]]:
        """
        根据数据量自动切换推荐策略

        Args:
            user_id: 用户ID
            top_k: 返回前K个推荐
            exclude_seen: 是否排除用户已看过的物品

        Returns:
            [(item_id, score), ...]
        """
        # 检查用户的评分数量
        from app.models.user_item import UserItem

        user_rating_count = (
            self.db.query(UserItem)
            .filter(
                UserItem.user_id == user_id, UserItem.rating.isnot(None)
            )
            .count()
        )

        # 如果用户评分少于5个，主要使用基于内容的推荐
        if user_rating_count < 5:
            logger.info(
                f"User {user_id} has {user_rating_count} ratings, using content-based"
            )
            return self.content_recommender.recommend(user_id, top_k, exclude_seen)

        # 如果用户评分多于20个，主要使用协同过滤
        elif user_rating_count > 20:
            logger.info(
                f"User {user_id} has {user_rating_count} ratings, using collaborative"
            )
            return self.collaborative_recommender.recommend(user_id, top_k, exclude_seen)

        # 否则使用加权混合
        else:
            logger.info(
                f"User {user_id} has {user_rating_count} ratings, using weighted hybrid"
            )
            return self._weighted_recommendation(user_id, top_k, exclude_seen)

    def get_similar_items(
        self, item_id: int, top_k: int = 10
    ) -> List[Tuple[int, float]]:
        """
        获取相似物品（基于内容）

        Args:
            item_id: 物品ID
            top_k: 返回前K个相似物品

        Returns:
            [(similar_item_id, similarity_score), ...]
        """
        # 确保模型已构建
        if not self._model_built:
            self.build_model()

        return self.content_recommender.get_similar_items(item_id, top_k)

    def get_discover_recommendations(
        self, user_id: int, top_k: int = 20
    ) -> List[Tuple[int, float]]:
        """
        探索发现推荐（更多样性）

        Args:
            user_id: 用户ID
            top_k: 返回前K个推荐

        Returns:
            [(item_id, score), ...]
        """
        # 确保模型已构建
        if not self._model_built:
            self.build_model()

        # 使用级联策略，并且不排除已看过的（可能用户想重温）
        return self._cascade_recommendation(user_id, top_k, exclude_seen=False)

