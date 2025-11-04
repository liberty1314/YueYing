"""
AI 标签生成服务
"""
from typing import List, Optional, Dict, Any
from sqlalchemy.orm import Session
from loguru import logger
import re

from app.ai.prompts.tag_generation import TagGenerationPrompts
from app.services.llm_service import LLMService
from app.services.tag_service import TagService
from app.models.tag import TagType
from app.models.item import Item
from app.models.user_item import UserItem


class TagGenerator:
    """AI 标签生成器"""

    @staticmethod
    def normalize_tags(tags: List[str]) -> List[str]:
        """
        标签标准化和去重

        Args:
            tags: 原始标签列表

        Returns:
            标准化后的标签列表
        """
        normalized = []
        seen = set()

        for tag in tags:
            # 去除空白字符
            tag = tag.strip()

            # 跳过空标签
            if not tag:
                continue

            # 去除标点符号
            tag = re.sub(r'[，。！？、；：""''【】《》（）\s]+', '', tag)

            # 限制长度（2-8个字符）
            if len(tag) < 2 or len(tag) > 8:
                continue

            # 转换为小写进行去重比较
            tag_lower = tag.lower()
            if tag_lower not in seen:
                seen.add(tag_lower)
                normalized.append(tag)

        return normalized[:10]  # 最多返回10个标签

    @staticmethod
    def parse_tags_from_response(response: str) -> List[str]:
        """
        从 LLM 响应中解析标签

        Args:
            response: LLM 响应文本

        Returns:
            标签列表
        """
        # 移除可能的前缀（如 "标签："）
        response = re.sub(r'^.*?[:：]\s*', '', response.strip())

        # 按逗号或顿号分隔
        tags = re.split(r'[,，、\n]+', response)

        # 标准化
        return TagGenerator.normalize_tags(tags)

    @staticmethod
    async def generate_tags_for_content(
        db: Session,
        user_id: int,
        user_item_id: int,
        include_notes: bool = True,
        model: Optional[str] = None,
    ) -> List[str]:
        """
        为单个内容生成标签

        Args:
            db: 数据库会话
            user_id: 用户ID
            user_item_id: 用户记录ID
            include_notes: 是否包含用户笔记
            model: 使用的模型

        Returns:
            生成的标签列表
        """
        # 查询用户记录
        user_item = db.query(UserItem).filter(
            UserItem.id == user_item_id,
            UserItem.user_id == user_id
        ).first()

        if not user_item:
            raise ValueError(f"用户记录不存在: {user_item_id}")

        # 查询关联的内容
        item = db.query(Item).filter(Item.id == user_item.item_id).first()

        if not item:
            raise ValueError(f"内容不存在: {user_item.item_id}")

        # 构建 Prompt
        user_notes = user_item.notes if include_notes else None

        prompt = TagGenerationPrompts.build_content_tags_prompt(
            content_type=item.content_type,
            title=item.title,
            description=item.description,
            user_notes=user_notes,
            genres=item.genres,
        )

        # 调用 LLM
        messages = [
            {"role": "system", "content": TagGenerationPrompts.SYSTEM_PROMPT},
            {"role": "user", "content": prompt},
        ]

        logger.info(f"Generating tags for user_item {user_item_id}: {item.title}")

        try:
            result = await LLMService.chat_completion(
                messages=messages,
                model=model,
                temperature=0.8,  # 较高的温度以获得更多样的标签
                max_tokens=100,
            )

            # 解析标签
            tags = TagGenerator.parse_tags_from_response(result["content"])

            logger.info(f"Generated {len(tags)} tags: {tags}")
            return tags

        except Exception as e:
            logger.error(f"Failed to generate tags: {e}")
            raise

    @staticmethod
    async def generate_and_save_tags(
        db: Session,
        user_id: int,
        user_item_id: int,
        include_notes: bool = True,
        model: Optional[str] = None,
    ) -> Dict[str, Any]:
        """
        生成标签并自动保存到数据库

        Args:
            db: 数据库会话
            user_id: 用户ID
            user_item_id: 用户记录ID
            include_notes: 是否包含用户笔记
            model: 使用的模型

        Returns:
            生成结果字典
        """
        # 生成标签
        tag_names = await TagGenerator.generate_tags_for_content(
            db=db,
            user_id=user_id,
            user_item_id=user_item_id,
            include_notes=include_notes,
            model=model,
        )

        # 创建或获取标签，并关联到用户记录
        created_tags = []
        tag_ids = []

        for tag_name in tag_names:
            # 使用 get_or_create_tag 创建标签
            tag = TagService.get_or_create_tag(
                db=db,
                user_id=user_id,
                tag_name=tag_name,
                tag_type=TagType.CUSTOM,
            )
            created_tags.append(tag)
            tag_ids.append(tag.id)

        # 关联标签到用户记录
        added_tags = TagService.add_tags_to_user_item(
            db=db,
            user_id=user_id,
            user_item_id=user_item_id,
            tag_ids=tag_ids,
        )

        return {
            "user_item_id": user_item_id,
            "tags": [{"id": tag.id, "name": tag.name} for tag in created_tags],
            "total": len(created_tags),
        }

    @staticmethod
    async def batch_generate_tags(
        db: Session,
        user_id: int,
        user_item_ids: List[int],
        model: Optional[str] = None,
    ) -> List[Dict[str, Any]]:
        """
        批量生成标签

        Args:
            db: 数据库会话
            user_id: 用户ID
            user_item_ids: 用户记录ID列表
            model: 使用的模型

        Returns:
            生成结果列表
        """
        results = []

        for user_item_id in user_item_ids:
            try:
                result = await TagGenerator.generate_and_save_tags(
                    db=db,
                    user_id=user_id,
                    user_item_id=user_item_id,
                    include_notes=True,
                    model=model,
                )
                results.append(result)
            except Exception as e:
                logger.error(f"Failed to generate tags for user_item {user_item_id}: {e}")
                results.append({
                    "user_item_id": user_item_id,
                    "error": str(e),
                    "tags": [],
                    "total": 0,
                })

        return results

    @staticmethod
    async def regenerate_tags(
        db: Session,
        user_id: int,
        user_item_id: int,
        feedback: Optional[str] = None,
        model: Optional[str] = None,
    ) -> Dict[str, Any]:
        """
        重新生成标签（可选反馈优化）

        Args:
            db: 数据库会话
            user_id: 用户ID
            user_item_id: 用户记录ID
            feedback: 用户反馈
            model: 使用的模型

        Returns:
            生成结果字典
        """
        # 先删除现有的 AI 生成标签
        existing_tags = TagService.get_user_item_tags(db, user_id, user_item_id)

        for tag in existing_tags:
            if tag.is_auto:  # 只删除 AI 生成的标签
                TagService.remove_tag_from_user_item(db, user_id, user_item_id, tag.id)

        # 重新生成标签
        return await TagGenerator.generate_and_save_tags(
            db=db,
            user_id=user_id,
            user_item_id=user_item_id,
            include_notes=True,
            model=model,
        )

