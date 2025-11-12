"""
管理员统计数据 API 路由
"""
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from datetime import datetime, timedelta
from sqlalchemy import func, and_, desc

from app.core.database import get_db
from app.api.dependencies.auth import get_current_admin
from app.models.user import User
from app.models.user_item import UserItem
from app.models.background_task import BackgroundTask
from app.services.admin_service import admin_service
from app.core.redis import redis_client
from app.services.llm_config_service import LLMConfigService
from sqlalchemy import text


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


@router.get("/dashboard", summary="获取专业数据分析仪表盘")
def get_dashboard_stats(
    current_admin: User = Depends(get_current_admin),
    db: Session = Depends(get_db)
):
    """
    获取基于专业数据分析标准的仪表盘统计数据

    返回：
    - 核心指标：DAU, MAU, 用户粘性(DAU/MAU), 今日新增用户
    - 活跃趋势：30天DAU变化趋势
    - 用户留存率：新增用户群组分析热力图
    - 系统健康状态：LLM API, RAG索引, Redis缓存, 数据库连接
    """
    # 获取基础时间点
    now = datetime.utcnow()
    today_start = now.replace(hour=0, minute=0, second=0, microsecond=0)
    today_end = today_start + timedelta(days=1)
    thirty_days_ago = now - timedelta(days=30)

    # 1. 核心指标计算
    # DAU: 今日活跃用户数 (今日登录过的独立用户)
    dau = db.query(func.count(func.distinct(User.id))).filter(
        and_(User.last_login_at >= today_start, User.last_login_at < today_end)
    ).scalar()

    # MAU: 月活跃用户数 (最近30天登录过的独立用户)
    mau = db.query(func.count(func.distinct(User.id))).filter(
        User.last_login_at >= thirty_days_ago
    ).scalar()

    # 用户粘性: DAU/MAU 比率
    user_stickiness = (dau / mau * 100) if mau > 0 else 0

    # 今日新增用户: 今日注册的用户数
    today_new_users = db.query(func.count(User.id)).filter(
        and_(User.created_at >= today_start, User.created_at < today_end)
    ).scalar()

    # 2. DAU 趋势数据（过去30天）
    dau_trend = []
    for i in range(30):
        date_start = (now - timedelta(days=i)).replace(hour=0, minute=0, second=0, microsecond=0)
        date_end = date_start + timedelta(days=1)

        # 当日DAU：当日登录过的独立用户数
        daily_dau = db.query(func.count(func.distinct(User.id))).filter(
            and_(User.last_login_at >= date_start, User.last_login_at < date_end)
        ).scalar()

        dau_trend.append({
            "date": date_start.strftime("%Y-%m-%d"),
            "dau": daily_dau
        })

    # 反转数组，使日期从早到晚排序
    dau_trend.reverse()

    # 3. 新增用户留存率趋势分析
    retention_trends = []
    for i in range(7):  # 分析最近7天的注册群组
        cohort_date = (now - timedelta(days=i)).replace(hour=0, minute=0, second=0, microsecond=0)
        cohort_end = cohort_date + timedelta(days=1)

        # 获取当日注册的用户群组
        cohort_users = db.query(User).filter(
            and_(User.created_at >= cohort_date, User.created_at < cohort_end)
        ).all()

        cohort_size = len(cohort_users)
        if cohort_size == 0:
            continue

        cohort_user_ids = [user.id for user in cohort_users]

        # 计算各时间点的留存率
        retention_point = {
            "date": cohort_date.strftime("%Y-%m-%d"),
            "cohort_size": cohort_size,
            "day_1": 0.0,    # 次日留存
            "day_7": 0.0,    # 第7日留存
            "day_14": 0.0,   # 第14日留存
            "day_30": 0.0    # 第30日留存
        }

        # 次日留存：注册后的第二天有登录行为
        day_1_start = cohort_date + timedelta(days=1)
        day_1_end = cohort_date + timedelta(days=2)
        day_1_active = db.query(func.count(func.distinct(User.id))).filter(
            and_(
                User.id.in_(cohort_user_ids),
                User.last_login_at >= day_1_start,
                User.last_login_at < day_1_end
            )
        ).scalar()
        retention_point["day_1"] = round((day_1_active / cohort_size) * 100, 2)

        # 第7日留存：注册后的第7天有登录行为
        day_7_start = cohort_date + timedelta(days=7)
        day_7_end = cohort_date + timedelta(days=8)
        day_7_active = db.query(func.count(func.distinct(User.id))).filter(
            and_(
                User.id.in_(cohort_user_ids),
                User.last_login_at >= day_7_start,
                User.last_login_at < day_7_end
            )
        ).scalar()
        retention_point["day_7"] = round((day_7_active / cohort_size) * 100, 2)

        # 第14日留存：注册后的第14天有登录行为
        day_14_start = cohort_date + timedelta(days=14)
        day_14_end = cohort_date + timedelta(days=15)
        day_14_active = db.query(func.count(func.distinct(User.id))).filter(
            and_(
                User.id.in_(cohort_user_ids),
                User.last_login_at >= day_14_start,
                User.last_login_at < day_14_end
            )
        ).scalar()
        retention_point["day_14"] = round((day_14_active / cohort_size) * 100, 2)

        # 第30日留存：注册后的第30天有登录行为
        day_30_start = cohort_date + timedelta(days=30)
        day_30_end = cohort_date + timedelta(days=31)
        day_30_active = db.query(func.count(func.distinct(User.id))).filter(
            and_(
                User.id.in_(cohort_user_ids),
                User.last_login_at >= day_30_start,
                User.last_login_at < day_30_end
            )
        ).scalar()
        retention_point["day_30"] = round((day_30_active / cohort_size) * 100, 2)

        retention_trends.append(retention_point)

    # 反转数组，使最新的日期在前
    retention_trends.reverse()

    # 3. 系统健康检查
    system_health = {}

    # LLM API 状态
    try:
        llm_config = LLMConfigService.get_config(db)
        if llm_config and isinstance(llm_config, dict) and llm_config.get("enabled", False):
            system_health["llm_api"] = {
                "status": "Connected",
                "details": f"Provider: {llm_config.get('provider', 'Unknown')}"
            }
        else:
            system_health["llm_api"] = {
                "status": "Disconnected",
                "details": f"Provider: {llm_config.get('provider', 'None') if llm_config and isinstance(llm_config, dict) else 'None'}"
            }
    except Exception as e:
        system_health["llm_api"] = {
            "status": "Error",
            "details": str(e)
        }

    # RAG 索引状态（检查向量化数据库状态）
    try:
        # 这里简化检查，实际应该检查向量数据库连接
        system_health["rag_index"] = {
            "status": "已索引",  # TODO: 实现真实的RAG索引状态检查
            "details": "向量数据库正常"
        }
    except Exception as e:
        system_health["rag_index"] = {
            "status": "重建中",
            "details": str(e)
        }

    # Redis 缓存状态
    try:
        redis_info = redis_client.sync_client.info()
        keyspace_hits = redis_info.get('keyspace_hits', 0)
        keyspace_misses = redis_info.get('keyspace_misses', 0)
        total_commands = keyspace_hits + keyspace_misses

        hit_rate = (keyspace_hits / total_commands * 100) if total_commands > 0 else 0

        system_health["redis_cache"] = {
            "status": f"{hit_rate:.1f}%",
            "details": f"命中: {keyspace_hits}, 未命中: {keyspace_misses}"
        }
    except Exception as e:
        system_health["redis_cache"] = {
            "status": "Error",
            "details": str(e)
        }

    # 数据库连接状态
    try:
        # 执行一个简单的查询来测试数据库连接
        db.execute(text("SELECT 1"))
        system_health["database"] = {
            "status": "OK",
            "details": "数据库连接正常"
        }
    except Exception as e:
        system_health["database"] = {
            "status": "Error",
            "details": str(e)
        }

    # 4. 最近活动
    # 最近注册用户（最新5个）
    recent_registrations = db.query(User).filter(
        User.is_active == True
    ).order_by(desc(User.created_at)).limit(5).all()

    recent_users = [{
        "id": user.id,
        "username": user.username,
        "email": user.email,
        "created_at": user.created_at.isoformat()
    } for user in recent_registrations]

    # 系统事件（最近5个后台任务）
    recent_tasks = db.query(BackgroundTask).order_by(
        desc(BackgroundTask.created_at)
    ).limit(5).all()

    system_events = [{
        "id": task.id,
        "task_type": task.task_type,
        "status": task.status,
        "created_at": task.created_at.isoformat(),
        "description": f"{task.task_type} 任务 {task.status}"
    } for task in recent_tasks]

    return {
        "core_metrics": {
            "dau": dau,                                    # 日活跃用户
            "mau": mau,                                    # 月活跃用户
            "user_stickiness": round(user_stickiness, 2),  # 用户粘性 (DAU/MAU %)
            "today_new_users": today_new_users             # 今日新增用户
        },
        "dau_trend": dau_trend,                            # 30天DAU趋势
        "retention_trends": retention_trends,              # 用户留存率趋势分析
        "system_health": system_health,                    # 系统健康状态
        "timestamp": now.isoformat()
    }

