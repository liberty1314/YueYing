"""
智能总结生成服务
"""
from typing import List, Dict, Any, Optional
from sqlalchemy.orm import Session
from sqlalchemy import func, and_
from datetime import datetime, timedelta
from loguru import logger
import json
import re
from collections import Counter

from app.models.summary import Summary, PeriodType
from app.models.user_item import UserItem, ItemStatus
from app.models.tag import Tag, UserItemTag
from app.models.item import Item
from app.models.background_task import BackgroundTask, TaskStatus, TaskType
from app.clients.llm.siliconflow import SiliconFlowClient
from app.ai.prompts.summary import (
    SUMMARY_SYSTEM_PROMPT,
    build_summary_prompt,
    build_keyword_extraction_prompt
)
from app.models.llm_config import LLMConfig
from app.core.task_manager import task_manager
from app.core.websocket import ws_manager


class SummaryService:
    """智能总结生成服务"""
    
    def __init__(self):
        self.llm_client = None
        self.default_model = None
    
    def _ensure_llm_initialized(self, db: Session):
        """确保LLM客户端已初始化"""
        if self.llm_client is None:
            config = db.query(LLMConfig).filter(LLMConfig.enabled == True).first()
            if config:
                self.llm_client = SiliconFlowClient(
                    api_key=config.api_key,
                    base_url=config.base_url
                )
                self.default_model = config.default_model
                logger.info(f"Initialized LLM client for summary generation: {config.provider}")
            else:
                logger.warning("No active LLM config found for summary generation")
                raise ValueError("未配置可用的 LLM 服务")
    
    def _prepare_summary_data(
        self,
        db: Session,
        user_id: int,
        start_date: datetime,
        end_date: datetime
    ) -> Dict[str, Any]:
        """
        准备总结数据
        
        Args:
            db: 数据库会话
            user_id: 用户ID
            start_date: 开始日期
            end_date: 结束日期
        
        Returns:
            统计数据字典
        """
        # 确保日期范围涵盖整天（扩展到23:59:59）
        end_date_inclusive = end_date.replace(hour=23, minute=59, second=59, microsecond=999999)
        
        # 查询时间范围内的用户记录
        user_items = db.query(UserItem).join(Item).filter(
            and_(
                UserItem.user_id == user_id,
                UserItem.created_at >= start_date,
                UserItem.created_at <= end_date_inclusive
            )
        ).all()
        
        if not user_items:
            logger.warning(f"No items found for user {user_id} between {start_date} and {end_date_inclusive}")
            return {
                "total_items": 0,
                "avg_rating": 0,
                "type_distribution": {},
                "status_distribution": {},
                "top_tags": [],
                "high_rated_items": [],
                "recent_items": []
            }
        
        # 基本统计
        total_items = len(user_items)
        ratings = [ui.rating for ui in user_items if ui.rating is not None]
        avg_rating = sum(ratings) / len(ratings) if ratings else 0
        
        # 类型分布
        type_dist = {}
        for ui in user_items:
            if ui.item and ui.item.type:
                item_type = ui.item.type.value if hasattr(ui.item.type, 'value') else str(ui.item.type)
            else:
                item_type = "未知"
            type_dist[item_type] = type_dist.get(item_type, 0) + 1
        
        # 状态分布
        status_dist = {}
        for ui in user_items:
            if ui.status:
                status = ui.status.value if hasattr(ui.status, 'value') else str(ui.status)
            else:
                status = "未知"
            status_dist[status] = status_dist.get(status, 0) + 1
        
        # 标签统计
        tag_counts = db.query(
            Tag.name,
            func.count(UserItemTag.id).label("count")
        ).join(UserItemTag, UserItemTag.tag_id == Tag.id).join(
            UserItem, UserItem.id == UserItemTag.user_item_id
        ).filter(
            and_(
                UserItem.user_id == user_id,
                UserItem.created_at >= start_date,
                UserItem.created_at <= end_date_inclusive
            )
        ).group_by(Tag.name).order_by(func.count(UserItemTag.id).desc()).limit(10).all()
        
        top_tags = [{"name": name, "count": count} for name, count in tag_counts]
        
        # 高分作品（评分 >= 4）
        high_rated = []
        for ui in user_items:
            if ui.rating and ui.rating >= 4.0:
                if ui.item and ui.item.type:
                    item_type = ui.item.type.value if hasattr(ui.item.type, 'value') else str(ui.item.type)
                else:
                    item_type = "未知"
                high_rated.append({
                    "title": ui.item.title if ui.item else "未知",
                    "rating": ui.rating,
                    "type": item_type
                })
        high_rated.sort(key=lambda x: x["rating"], reverse=True)
        
        # 最近记录
        recent = sorted(user_items, key=lambda x: x.created_at, reverse=True)[:10]
        recent_items = [
            {
                "title": ui.item.title if ui.item else "未知",
                "rating": ui.rating,
                "created_at": ui.created_at.isoformat() if ui.created_at else None
            }
            for ui in recent
        ]
        
        return {
            "total_items": total_items,
            "avg_rating": round(avg_rating, 2),
            "type_distribution": type_dist,
            "status_distribution": status_dist,
            "top_tags": top_tags,
            "high_rated_items": high_rated[:10],
            "recent_items": recent_items
        }
    
    def _extract_keywords(
        self,
        db: Session,
        user_id: int,
        start_date: datetime,
        end_date: datetime
    ) -> List[Dict[str, Any]]:
        """
        提取关键词
        
        使用简单的词频统计方法，标签权重最高
        """
        # 确保日期范围涵盖整天（扩展到23:59:59）
        end_date_inclusive = end_date.replace(hour=23, minute=59, second=59, microsecond=999999)
        
        # 查询时间范围内的用户记录
        user_items = db.query(UserItem).join(Item).filter(
            and_(
                UserItem.user_id == user_id,
                UserItem.created_at >= start_date,
                UserItem.created_at <= end_date_inclusive
            )
        ).all()
        
        if not user_items:
            return []
        
        # 收集文本
        keyword_counter = Counter()
        
        # 1. 标签（权重 x3）
        for ui in user_items:
            tags = db.query(Tag).join(UserItemTag).filter(
                UserItemTag.user_item_id == ui.id
            ).all()
            for tag in tags:
                keyword_counter[tag.name] += 3
        
        # 2. 标题中的关键词（权重 x2）
        for ui in user_items:
            if ui.item and ui.item.title:
                # 简单的中文分词：提取2-4个字的词组
                title = ui.item.title
                words = self._extract_chinese_words(title)
                for word in words:
                    keyword_counter[word] += 2
        
        # 3. 笔记中的关键词（权重 x1）
        for ui in user_items:
            if ui.notes:
                words = self._extract_chinese_words(ui.notes)
                for word in words:
                    keyword_counter[word] += 1
        
        # 过滤掉过短的词和停用词
        stopwords = {"的", "了", "在", "是", "有", "和", "与", "及", "等", "个", "这", "那", "我", "你", "他", "她"}
        filtered_keywords = [
            (word, count)
            for word, count in keyword_counter.items()
            if len(word) >= 2 and word not in stopwords
        ]
        
        # 按频率排序，取前20个
        filtered_keywords.sort(key=lambda x: x[1], reverse=True)
        keywords = [
            {"word": word, "count": count}
            for word, count in filtered_keywords[:20]
        ]
        
        return keywords
    
    def _extract_chinese_words(self, text: str, min_len: int = 2, max_len: int = 4) -> List[str]:
        """
        简单的中文词语提取（使用滑动窗口）
        """
        if not text:
            return []
        
        # 提取中文字符
        chinese_chars = re.findall(r'[\u4e00-\u9fff]+', text)
        
        words = []
        for chars in chinese_chars:
            # 使用滑动窗口提取词语
            for length in range(min_len, max_len + 1):
                for i in range(len(chars) - length + 1):
                    word = chars[i:i+length]
                    words.append(word)
        
        return words
    
    async def _generate_summary_text(
        self,
        db: Session,
        period_type: str,
        start_date: datetime,
        end_date: datetime,
        statistics: Dict[str, Any]
    ) -> str:
        """
        调用LLM生成总结文本
        """
        self._ensure_llm_initialized(db)
        
        # 构建提示
        prompt = build_summary_prompt(period_type, start_date, end_date, statistics)
        
        # 调用LLM
        try:
            response = await self.llm_client.chat_completion(
                model=self.default_model,
                messages=[
                    {"role": "system", "content": SUMMARY_SYSTEM_PROMPT},
                    {"role": "user", "content": prompt}
                ],
                temperature=0.7,
                max_tokens=2000
            )
            
            summary_text = response.get("content", "").strip()
            if not summary_text:
                raise ValueError("LLM返回了空的总结文本")
            
            return summary_text
        
        except Exception as e:
            logger.error(f"Failed to generate summary text: {e}")
            raise ValueError(f"生成总结失败: {str(e)}")
    
    async def generate_summary(
        self,
        db: Session,
        user_id: int,
        period_type: str,
        start_date: datetime,
        end_date: datetime,
        title: Optional[str] = None
    ) -> Summary:
        """
        生成用户总结
        
        Args:
            db: 数据库会话
            user_id: 用户ID
            period_type: 时期类型
            start_date: 开始日期
            end_date: 结束日期
            title: 自定义标题（可选）
        
        Returns:
            生成的总结对象
        """
        logger.info(f"Generating summary for user {user_id}: {period_type} ({start_date} - {end_date})")
        
        # 1. 准备数据
        statistics = self._prepare_summary_data(db, user_id, start_date, end_date)
        
        if statistics["total_items"] == 0:
            raise ValueError("所选时间范围内没有记录，无法生成总结")
        
        # 2. 提取关键词
        keywords = self._extract_keywords(db, user_id, start_date, end_date)
        
        # 3. 生成总结文本
        summary_text = await self._generate_summary_text(
            db, period_type, start_date, end_date, statistics
        )
        
        # 4. 生成标题
        if not title:
            period_names = {
                "week": "本周",
                "month": "本月",
                "year": f"{start_date.year}年",
                "custom": f"{start_date.strftime('%m月%d日')}-{end_date.strftime('%m月%d日')}"
            }
            title = f"{period_names.get(period_type, '自定义')}的总结"
        
        # 5. 保存到数据库
        summary = Summary(
            user_id=user_id,
            title=title,
            period_type=PeriodType(period_type),
            start_date=start_date,
            end_date=end_date,
            summary_text=summary_text,
            keywords=keywords,
            statistics=statistics
        )
        
        db.add(summary)
        db.commit()
        db.refresh(summary)
        
        logger.info(f"Successfully generated summary {summary.id} for user {user_id}")
        return summary
    
    async def generate_summary_background(
        self,
        db: Session,
        task_id: str,
        user_id: int,
        period_type: str,
        start_date: datetime,
        end_date: datetime,
        title: Optional[str] = None
    ):
        """
        在后台生成用户总结（异步任务）
        
        Args:
            db: 数据库会话
            task_id: 任务ID
            user_id: 用户ID
            period_type: 时期类型
            start_date: 开始日期
            end_date: 结束日期
            title: 自定义标题（可选）
        """
        try:
            # 更新任务状态为处理中
            task_manager.update_task_status(
                db, task_id, TaskStatus.PROCESSING,
                progress=10, progress_message="正在准备数据..."
            )
            await task_manager.notify_task_update(
                task_manager.get_task(db, task_id)
            )
            
            # 1. 准备数据
            statistics = self._prepare_summary_data(db, user_id, start_date, end_date)
            
            if statistics["total_items"] == 0:
                raise ValueError("所选时间范围内没有记录，无法生成总结")
            
            # 更新进度
            task_manager.update_task_status(
                db, task_id, TaskStatus.PROCESSING,
                progress=30, progress_message="正在提取关键词..."
            )
            await task_manager.notify_task_update(
                task_manager.get_task(db, task_id)
            )
            
            # 2. 提取关键词
            keywords = self._extract_keywords(db, user_id, start_date, end_date)
            
            # 更新进度
            task_manager.update_task_status(
                db, task_id, TaskStatus.PROCESSING,
                progress=50, progress_message="正在生成总结文本..."
            )
            await task_manager.notify_task_update(
                task_manager.get_task(db, task_id)
            )
            
            # 3. 生成总结文本
            summary_text = await self._generate_summary_text(
                db, period_type, start_date, end_date, statistics
            )
            
            # 更新进度
            task_manager.update_task_status(
                db, task_id, TaskStatus.PROCESSING,
                progress=80, progress_message="正在保存总结..."
            )
            await task_manager.notify_task_update(
                task_manager.get_task(db, task_id)
            )
            
            # 4. 生成标题
            if not title:
                period_names = {
                    "week": "本周",
                    "month": "本月",
                    "year": f"{start_date.year}年",
                    "custom": f"{start_date.strftime('%m月%d日')}-{end_date.strftime('%m月%d日')}"
                }
                title = f"{period_names.get(period_type, '自定义')}的总结"
            
            # 5. 保存到数据库
            summary = Summary(
                user_id=user_id,
                title=title,
                period_type=PeriodType(period_type),
                start_date=start_date,
                end_date=end_date,
                summary_text=summary_text,
                keywords=keywords,
                statistics=statistics
            )
            
            db.add(summary)
            db.commit()
            db.refresh(summary)
            
            # 更新任务状态为完成
            task_manager.update_task_status(
                db, task_id, TaskStatus.COMPLETED,
                progress=100, progress_message="总结生成完成",
                result={"summary_id": summary.id}
            )
            
            # 发送 WebSocket 通知
            await task_manager.notify_task_update(
                task_manager.get_task(db, task_id)
            )
            
            logger.info(f"Successfully generated summary {summary.id} for user {user_id} in background")
            
        except Exception as e:
            logger.error(f"Failed to generate summary in background: {e}")
            
            # 更新任务状态为失败
            task_manager.update_task_status(
                db, task_id, TaskStatus.FAILED,
                error_message=str(e)
            )
            
            # 发送 WebSocket 通知
            await task_manager.notify_task_update(
                task_manager.get_task(db, task_id)
            )
    
    def get_user_summaries(
        self,
        db: Session,
        user_id: int,
        skip: int = 0,
        limit: int = 20
    ) -> tuple[List[Summary], int]:
        """
        获取用户的历史总结列表
        
        Args:
            db: 数据库会话
            user_id: 用户ID
            skip: 跳过的记录数
            limit: 返回的记录数
        
        Returns:
            (总结列表, 总数)
        """
        query = db.query(Summary).filter(Summary.user_id == user_id)
        total = query.count()
        
        summaries = query.order_by(Summary.created_at.desc()).offset(skip).limit(limit).all()
        
        return summaries, total
    
    def get_summary_detail(
        self,
        db: Session,
        summary_id: int,
        user_id: int
    ) -> Optional[Summary]:
        """
        获取总结详情
        
        Args:
            db: 数据库会话
            summary_id: 总结ID
            user_id: 用户ID（用于权限检查）
        
        Returns:
            总结对象或None
        """
        return db.query(Summary).filter(
            and_(
                Summary.id == summary_id,
                Summary.user_id == user_id
            )
        ).first()
    
    def delete_summary(
        self,
        db: Session,
        summary_id: int,
        user_id: int
    ) -> bool:
        """
        删除总结
        
        Args:
            db: 数据库会话
            summary_id: 总结ID
            user_id: 用户ID（用于权限检查）
        
        Returns:
            是否删除成功
        """
        summary = self.get_summary_detail(db, summary_id, user_id)
        if not summary:
            return False
        
        db.delete(summary)
        db.commit()
        
        logger.info(f"Deleted summary {summary_id} for user {user_id}")
        return True


# 全局实例
_summary_service = None

def get_summary_service() -> SummaryService:
    """获取总结服务实例"""
    global _summary_service
    if _summary_service is None:
        _summary_service = SummaryService()
    return _summary_service

