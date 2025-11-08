"""
后台任务模型
用于追踪异步任务的状态和结果
"""
from sqlalchemy import Column, Integer, String, DateTime, Text, JSON
from sqlalchemy.sql import func
from datetime import datetime
import enum

from app.models.base import Base


class TaskStatus(str, enum.Enum):
    """任务状态枚举"""
    PENDING = "pending"         # 待处理
    PROCESSING = "processing"   # 处理中
    COMPLETED = "completed"     # 已完成
    FAILED = "failed"           # 失败


class TaskType(str, enum.Enum):
    """任务类型枚举"""
    SUMMARY_GENERATION = "summary_generation"   # 总结生成
    AI_CHAT = "ai_chat"                         # AI 聊天
    DATA_IMPORT = "data_import"                 # 数据导入
    DATA_EXPORT = "data_export"                 # 数据导出


class BackgroundTask(Base):
    """后台任务表"""
    
    __tablename__ = "background_tasks"
    
    id = Column(Integer, primary_key=True, index=True)
    task_id = Column(String(50), unique=True, index=True, nullable=False, comment="任务唯一标识")
    task_type = Column(String(50), nullable=False, comment="任务类型")
    status = Column(String(20), default="pending", nullable=False, comment="任务状态")
    
    user_id = Column(Integer, nullable=False, index=True, comment="所属用户ID")
    
    # 任务参数和结果
    params = Column(JSON, comment="任务参数")
    result = Column(JSON, comment="任务结果")
    error_message = Column(Text, comment="错误信息")
    
    # 进度跟踪
    progress = Column(Integer, default=0, comment="任务进度（0-100）")
    progress_message = Column(String(200), comment="进度消息")
    
    # 时间戳
    created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)
    started_at = Column(DateTime(timezone=True), comment="开始处理时间")
    completed_at = Column(DateTime(timezone=True), comment="完成时间")
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())
    
    def __repr__(self):
        return f"<BackgroundTask(id={self.id}, task_id={self.task_id}, type={self.task_type}, status={self.status})>"
    
    def to_dict(self):
        """转换为字典格式"""
        return {
            "id": self.id,
            "task_id": self.task_id,
            "task_type": self.task_type.value if isinstance(self.task_type, TaskType) else self.task_type,
            "status": self.status.value if isinstance(self.status, TaskStatus) else self.status,
            "user_id": self.user_id,
            "params": self.params,
            "result": self.result,
            "error_message": self.error_message,
            "progress": self.progress,
            "progress_message": self.progress_message,
            "created_at": self.created_at.isoformat() if self.created_at else None,
            "started_at": self.started_at.isoformat() if self.started_at else None,
            "completed_at": self.completed_at.isoformat() if self.completed_at else None,
            "updated_at": self.updated_at.isoformat() if self.updated_at else None,
        }


