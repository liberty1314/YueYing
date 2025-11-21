"""
AI 洞察分析 API 路由
"""
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from sqlalchemy import func, desc
from typing import List
from pydantic import BaseModel, Field
from datetime import datetime, timedelta
from loguru import logger

from app.core.database import get_db
from app.api.dependencies.auth import get_current_user
from app.models.user import User
from app.models.user_item import UserItem
from app.models.item import Item


router = APIRouter(prefix="/ai", tags=["AI 洞察"])


# ====================================
# Pydantic Schemas
# ====================================


class Insight(BaseModel):
    """洞察数据"""
    type: str = Field(..., description="洞察类型")
    title: str = Field(..., description="标题")
    description: str = Field(..., description="描述")
    icon: str = Field(..., description="图标")
    priority: str = Field(..., description="优先级")
    metadata: dict = Field(default_factory=dict, description="额外数据")


class InsightsResponse(BaseModel):
    """洞察响应"""
    insights: List[Insight] = Field(..., description="洞察列表")
    generated_at: datetime = Field(..., description="生成时间")


# ====================================
# API Routes
# ====================================


@router.get(
    "/insights",
    response_model=InsightsResponse,
    summary="获取AI洞察分析",
    description="基于用户行为数据生成智能洞察和建议"
)
async def get_ai_insights(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """
    获取AI洞察分析
    
    分析用户的观看习惯、偏好等，提供个性化洞察
    """
    try:
        insights = []
        
        # 1. 观看趋势分析
        trend_insight = await analyze_watch_trend(db, current_user.id)
        if trend_insight:
            insights.append(trend_insight)
        
        # 2. 内容偏好分析
        preference_insight = await analyze_content_preference(db, current_user.id)
        if preference_insight:
            insights.append(preference_insight)
        
        # 3. 推荐建议
        recommendation_insight = await generate_recommendation_insight(db, current_user.id)
        if recommendation_insight:
            insights.append(recommendation_insight)
        
        # 4. 成就里程碑
        achievement_insight = await check_achievements(db, current_user.id)
        if achievement_insight:
            insights.append(achievement_insight)
        
        logger.info(f"Generated {len(insights)} insights for user {current_user.id}")
        
        return InsightsResponse(
            insights=insights,
            generated_at=datetime.now()
        )
        
    except Exception as e:
        logger.error(f"Error generating insights: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"生成洞察失败: {str(e)}"
        )


async def analyze_watch_trend(db: Session, user_id: int) -> Insight | None:
    """分析观看趋势"""
    try:
        # 获取最近两个月的数据
        one_month_ago = datetime.now() - timedelta(days=30)
        two_months_ago = datetime.now() - timedelta(days=60)
        
        # 本月数量
        current_month = db.query(func.count(UserItem.id)).filter(
            UserItem.user_id == user_id,
            UserItem.created_at >= one_month_ago
        ).scalar() or 0
        
        # 上月数量
        previous_month = db.query(func.count(UserItem.id)).filter(
            UserItem.user_id == user_id,
            UserItem.created_at >= two_months_ago,
            UserItem.created_at < one_month_ago
        ).scalar() or 0
        
        if previous_month == 0:
            return None
        
        # 计算增长率
        growth_rate = ((current_month - previous_month) / previous_month) * 100
        
        if abs(growth_rate) < 5:  # 变化小于5%不显示
            return None
        
        if growth_rate > 0:
            return Insight(
                type="trend",
                title="观看趋势上升",
                description=f"你在过去一个月的观看数量比上月增加了 {growth_rate:.0f}%，保持良好的习惯！",
                icon="trending",
                priority="high",
                metadata={"growth_rate": growth_rate, "current_count": current_month}
            )
        else:
            return Insight(
                type="trend",
                title="观看活跃度下降",
                description=f"你在过去一个月的观看数量比上月减少了 {abs(growth_rate):.0f}%，要不要看点新内容？",
                icon="trending",
                priority="medium",
                metadata={"growth_rate": growth_rate, "current_count": current_month}
            )
    except Exception as e:
        logger.error(f"Error analyzing watch trend: {e}")
        return None


async def analyze_content_preference(db: Session, user_id: int) -> Insight | None:
    """分析内容偏好"""
    try:
        # 统计各类型数量
        type_stats = db.query(
            Item.content_type,
            func.count(UserItem.id).label('count')
        ).join(UserItem).filter(
            UserItem.user_id == user_id
        ).group_by(Item.content_type).order_by(desc('count')).all()
        
        if not type_stats:
            return None
        
        total = sum(stat.count for stat in type_stats)
        if total == 0:
            return None
        
        # 获取最喜欢的类型
        top_type = type_stats[0]
        percentage = (top_type.count / total) * 100
        
        type_labels = {
            'movie': '电影',
            'tv': '剧集',
            'anime': '动画',
            'book': '书籍',
            'game': '游戏'
        }
        
        type_name = type_labels.get(top_type.content_type, top_type.content_type)
        
        # 获取第二喜欢的类型（如果有）
        description = f"你最喜欢的类型是{type_name}，占总观看量的 {percentage:.0f}%"
        if len(type_stats) > 1:
            second_type = type_stats[1]
            second_name = type_labels.get(second_type.content_type, second_type.content_type)
            description += f"，其次是{second_name}"
        description += "。我们为你推荐了更多相关内容。"
        
        return Insight(
            type="preference",
            title="偏好类型分析",
            description=description,
            icon="heart",
            priority="medium",
            metadata={"top_type": top_type.content_type, "percentage": percentage}
        )
    except Exception as e:
        logger.error(f"Error analyzing content preference: {e}")
        return None


async def generate_recommendation_insight(db: Session, user_id: int) -> Insight | None:
    """生成推荐建议"""
    try:
        # 获取用户最近喜欢的内容
        recent_items = db.query(Item).join(UserItem).filter(
            UserItem.user_id == user_id,
            UserItem.rating >= 8
        ).order_by(desc(UserItem.updated_at)).limit(5).all()
        
        if not recent_items:
            return None
        
        # 简单的推荐逻辑（实际应该使用推荐系统）
        return Insight(
            type="recommendation",
            title="智能推荐",
            description="基于你的观看历史和评分，我们为你准备了个性化推荐列表，快去推荐页面看看吧！",
            icon="sparkles",
            priority="high",
            metadata={"recent_count": len(recent_items)}
        )
    except Exception as e:
        logger.error(f"Error generating recommendation insight: {e}")
        return None


async def check_achievements(db: Session, user_id: int) -> Insight | None:
    """检查成就里程碑"""
    try:
        # 统计总数
        total_count = db.query(func.count(UserItem.id)).filter(
            UserItem.user_id == user_id
        ).scalar() or 0
        
        # 定义里程碑
        milestones = [10, 25, 50, 100, 200, 500]
        
        for milestone in milestones:
            if total_count >= milestone and total_count < milestone + 10:
                return Insight(
                    type="achievement",
                    title=f"观影里程碑 - {milestone}",
                    description=f"恭喜！你已经收藏了 {total_count} 项内容，继续保持这个节奏！",
                    icon="clock",
                    priority="low",
                    metadata={"milestone": milestone, "total_count": total_count}
                )
        
        return None
    except Exception as e:
        logger.error(f"Error checking achievements: {e}")
        return None
