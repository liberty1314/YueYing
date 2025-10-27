"""
基础模型类
提供通用字段和方法
"""
from datetime import datetime
from sqlalchemy import Column, DateTime
from sqlalchemy.ext.declarative import declared_attr

from app.core.database import Base


class TimestampMixin:
    """时间戳 Mixin"""

    @declared_attr
    def created_at(cls):
        return Column(DateTime, default=datetime.utcnow, nullable=False)

    @declared_attr
    def updated_at(cls):
        return Column(
            DateTime,
            default=datetime.utcnow,
            onupdate=datetime.utcnow,
            nullable=False,
        )


class BaseModel(Base, TimestampMixin):
    """基础模型类"""

    __abstract__ = True

    def to_dict(self):
        """转换为字典"""
        return {
            c.name: getattr(self, c.name)
            for c in self.__table__.columns
        }

