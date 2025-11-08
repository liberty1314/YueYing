"""
后台任务管理器
结合 Redis 和数据库管理任务状态
"""
import uuid
import json
from typing import Optional, Dict, Any
from datetime import datetime, timedelta
from sqlalchemy.orm import Session
import asyncio
import logging

from app.core.redis import redis_client
from app.models.background_task import BackgroundTask, TaskStatus, TaskType
from app.core.websocket import ws_manager

logger = logging.getLogger(__name__)


class TaskManager:
    """任务管理器"""
    
    def __init__(self):
        self.redis = redis_client.sync_client
        self.redis_prefix = "task:"
        self.redis_ttl = 86400  # Redis 中任务状态保存 24 小时
    
    def create_task(
        self,
        db: Session,
        user_id: int,
        task_type: TaskType,
        params: Optional[Dict[str, Any]] = None
    ) -> BackgroundTask:
        """
        创建新任务
        
        Args:
            db: 数据库会话
            user_id: 用户 ID
            task_type: 任务类型
            params: 任务参数
        
        Returns:
            创建的任务对象
        """
        task_id = str(uuid.uuid4())
        
        # 创建数据库记录
        task = BackgroundTask(
            task_id=task_id,
            task_type=task_type.value if isinstance(task_type, TaskType) else task_type,
            status=TaskStatus.PENDING.value,
            user_id=user_id,
            params=params or {}
        )
        
        db.add(task)
        db.commit()
        db.refresh(task)
        
        # 同步到 Redis
        self._sync_to_redis(task)
        
        logger.info(f"Task created: {task_id} (type={task_type}, user={user_id})")
        return task
    
    def get_task(self, db: Session, task_id: str) -> Optional[BackgroundTask]:
        """
        获取任务信息（优先从 Redis 读取）
        
        Args:
            db: 数据库会话
            task_id: 任务 ID
        
        Returns:
            任务对象，不存在则返回 None
        """
        # 先尝试从 Redis 读取
        redis_key = f"{self.redis_prefix}{task_id}"
        cached_data = self.redis.get(redis_key)
        
        if cached_data:
            try:
                data = json.loads(cached_data)
                # 从数据库重新加载以获取完整对象
                task = db.query(BackgroundTask).filter(
                    BackgroundTask.task_id == task_id
                ).first()
                return task
            except Exception as e:
                logger.error(f"Failed to parse cached task: {e}")
        
        # Redis 中没有，从数据库读取
        task = db.query(BackgroundTask).filter(
            BackgroundTask.task_id == task_id
        ).first()
        
        if task:
            self._sync_to_redis(task)
        
        return task
    
    def update_task_status(
        self,
        db: Session,
        task_id: str,
        status: TaskStatus,
        progress: Optional[int] = None,
        progress_message: Optional[str] = None,
        result: Optional[Dict[str, Any]] = None,
        error_message: Optional[str] = None
    ) -> Optional[BackgroundTask]:
        """
        更新任务状态
        
        Args:
            db: 数据库会话
            task_id: 任务 ID
            status: 新状态
            progress: 进度（0-100）
            progress_message: 进度消息
            result: 任务结果
            error_message: 错误信息
        
        Returns:
            更新后的任务对象
        """
        task = db.query(BackgroundTask).filter(
            BackgroundTask.task_id == task_id
        ).first()
        
        if not task:
            logger.warning(f"Task not found: {task_id}")
            return None
        
        # 更新状态
        task.status = status.value if isinstance(status, TaskStatus) else status
        
        if progress is not None:
            task.progress = progress
        
        if progress_message is not None:
            task.progress_message = progress_message
        
        if result is not None:
            task.result = result
        
        if error_message is not None:
            task.error_message = error_message
        
        # 更新时间戳
        if status == TaskStatus.PROCESSING and not task.started_at:
            task.started_at = datetime.utcnow()
        
        if status in [TaskStatus.COMPLETED, TaskStatus.FAILED]:
            task.completed_at = datetime.utcnow()
        
        db.commit()
        db.refresh(task)
        
        # 同步到 Redis
        self._sync_to_redis(task)
        
        logger.info(f"Task updated: {task_id} (status={status}, progress={progress})")
        return task
    
    async def notify_task_update(self, task: BackgroundTask):
        """
        通过 WebSocket 通知任务更新
        
        Args:
            task: 任务对象
        """
        message = {
            "type": "task_update",
            "data": task.to_dict()
        }
        
        await ws_manager.send_personal_message(message, task.user_id)
        logger.debug(f"Task update notification sent: {task.task_id}")
    
    def _sync_to_redis(self, task: BackgroundTask):
        """
        将任务状态同步到 Redis
        
        Args:
            task: 任务对象
        """
        redis_key = f"{self.redis_prefix}{task.task_id}"
        
        try:
            task_data = task.to_dict()
            self.redis.set(
                redis_key,
                json.dumps(task_data),
                ex=self.redis_ttl
            )
        except Exception as e:
            logger.error(f"Failed to sync task to Redis: {e}")
    
    def cleanup_old_tasks(self, db: Session, days: int = 30):
        """
        清理旧任务（数据库）
        
        Args:
            db: 数据库会话
            days: 保留天数
        """
        cutoff_date = datetime.utcnow() - timedelta(days=days)
        
        deleted_count = db.query(BackgroundTask).filter(
            BackgroundTask.created_at < cutoff_date,
            BackgroundTask.status.in_([TaskStatus.COMPLETED, TaskStatus.FAILED])
        ).delete()
        
        db.commit()
        
        logger.info(f"Cleaned up {deleted_count} old tasks")
        return deleted_count


# 全局任务管理器实例
task_manager = TaskManager()


