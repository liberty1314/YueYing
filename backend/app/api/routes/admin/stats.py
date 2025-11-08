"""
管理员统计数据 API 路由
"""
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.api.dependencies.auth import get_current_admin
from app.models.user import User
from app.services.admin_service import admin_service


router = APIRouter(prefix="/stats", tags=["管理员 - 统计"])


@router.get("", summary="获取管理后台统计")
def get_admin_stats(
    current_admin: User = Depends(get_current_admin),
    db: Session = Depends(get_db)
):
    """
    获取管理后台统计数据
    
    返回：
    - 用户统计（总数、活跃数、管理员数、最近注册、角色分布）
    - 内容统计（记录总数、对话数、总结数）
    - 时间戳
    """
    stats = admin_service.get_admin_stats(db)
    return stats

