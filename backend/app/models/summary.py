"""
Summary 模型 - 用户总结记录
"""
from sqlalchemy import Column, Integer, String, Text, DateTime, ForeignKey, Enum as SQLEnum
from sqlalchemy.dialects.postgresql import JSON
from sqlalchemy.orm import relationship
from datetime import datetime
import enum

from app.models.base import Base


class PeriodType(str, enum.Enum):
    """时期类型"""
    WEEK = "week"
    MONTH = "month"
    YEAR = "year"
    CUSTOM = "custom"


class Summary(Base):
    """用户总结记录"""
    __tablename__ = "summaries"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    title = Column(String(200), nullable=False)  # 总结标题
    period_type = Column(SQLEnum(PeriodType), nullable=False, default=PeriodType.MONTH)  # 时期类型
    start_date = Column(DateTime, nullable=False)  # 开始日期
    end_date = Column(DateTime, nullable=False)  # 结束日期
    summary_text = Column(Text, nullable=False)  # LLM生成的总结文本
    keywords = Column(JSON, nullable=True)  # 关键词列表 [{"word": "科幻", "count": 10}, ...]
    statistics = Column(JSON, nullable=True)  # 统计数据快照
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)

    # 关系
    user = relationship("User", back_populates="summaries")

    def __repr__(self):
        return f"<Summary {self.id}: {self.title}>"

