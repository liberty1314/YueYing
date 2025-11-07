"""
智能总结生成 API 路由
"""
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from pydantic import BaseModel, Field
from typing import List, Optional
from datetime import datetime

from app.core.database import get_db
from app.api.dependencies.auth import get_current_user
from app.models.user import User
from app.ai.summary import get_summary_service
from app.models.summary import Summary, PeriodType


router = APIRouter(prefix="/summary", tags=["summary"])


# ========== 请求/响应模型 ==========

class GenerateSummaryRequest(BaseModel):
    """生成总结请求"""
    period_type: str = Field(..., description="时期类型: week/month/year/custom")
    start_date: datetime = Field(..., description="开始日期")
    end_date: datetime = Field(..., description="结束日期")
    title: Optional[str] = Field(None, description="自定义标题")


class KeywordItem(BaseModel):
    """关键词项"""
    word: str
    count: int


class SummaryResponse(BaseModel):
    """总结响应"""
    id: int
    title: str
    period_type: str
    start_date: datetime
    end_date: datetime
    summary_text: str
    keywords: List[KeywordItem]
    statistics: dict
    created_at: datetime
    
    class Config:
        from_attributes = True


class SummaryListResponse(BaseModel):
    """总结列表响应"""
    summaries: List[SummaryResponse]
    total: int
    page: int
    page_size: int


# ========== API 端点 ==========

@router.post("/generate", response_model=SummaryResponse, status_code=status.HTTP_201_CREATED)
async def generate_summary(
    request: GenerateSummaryRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    生成新的智能总结
    
    - **period_type**: week/month/year/custom
    - **start_date**: 开始日期
    - **end_date**: 结束日期
    - **title**: 可选的自定义标题
    """
    # 验证时期类型
    valid_types = ["week", "month", "year", "custom"]
    if request.period_type not in valid_types:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"无效的时期类型，必须是: {', '.join(valid_types)}"
        )
    
    # 验证日期范围
    if request.start_date >= request.end_date:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="开始日期必须早于结束日期"
        )
    
    # 生成总结
    try:
        summary_service = get_summary_service()
        summary = await summary_service.generate_summary(
            db=db,
            user_id=current_user.id,
            period_type=request.period_type,
            start_date=request.start_date,
            end_date=request.end_date,
            title=request.title
        )
        
        # 安全处理 period_type：统一转换为字符串
        try:
            if hasattr(summary.period_type, 'value'):
                period_type_str = summary.period_type.value
            else:
                period_type_str = str(summary.period_type)
        except:
            period_type_str = str(summary.period_type)
        
        return SummaryResponse(
            id=summary.id,
            title=summary.title,
            period_type=period_type_str,
            start_date=summary.start_date,
            end_date=summary.end_date,
            summary_text=summary.summary_text,
            keywords=[KeywordItem(**kw) for kw in (summary.keywords or [])],
            statistics=summary.statistics or {},
            created_at=summary.created_at
        )
    
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e)
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"生成总结时发生错误: {str(e)}"
        )


@router.get("", response_model=SummaryListResponse)
def get_summaries(
    page: int = 1,
    page_size: int = 20,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    获取用户的历史总结列表
    
    - **page**: 页码（从1开始）
    - **page_size**: 每页数量
    """
    if page < 1:
        page = 1
    if page_size < 1 or page_size > 100:
        page_size = 20
    
    skip = (page - 1) * page_size
    
    summary_service = get_summary_service()
    summaries, total = summary_service.get_user_summaries(
        db=db,
        user_id=current_user.id,
        skip=skip,
        limit=page_size
    )
    
    # 辅助函数：安全获取 period_type 字符串
    def get_period_type_str(period_type):
        try:
            if hasattr(period_type, 'value'):
                return period_type.value
            return str(period_type)
        except:
            return str(period_type)
    
    return SummaryListResponse(
        summaries=[
            SummaryResponse(
                id=s.id,
                title=s.title,
                period_type=get_period_type_str(s.period_type),
                start_date=s.start_date,
                end_date=s.end_date,
                summary_text=s.summary_text,
                keywords=[KeywordItem(**kw) for kw in (s.keywords or [])],
                statistics=s.statistics or {},
                created_at=s.created_at
            )
            for s in summaries
        ],
        total=total,
        page=page,
        page_size=page_size
    )


@router.get("/{summary_id}", response_model=SummaryResponse)
def get_summary_detail(
    summary_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    获取总结详情
    
    - **summary_id**: 总结ID
    """
    summary_service = get_summary_service()
    summary = summary_service.get_summary_detail(
        db=db,
        summary_id=summary_id,
        user_id=current_user.id
    )
    
    if not summary:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="总结不存在"
        )
    
    # 安全处理 period_type：统一转换为字符串
    try:
        if hasattr(summary.period_type, 'value'):
            period_type_str = summary.period_type.value
        else:
            period_type_str = str(summary.period_type)
    except:
        period_type_str = str(summary.period_type)
    
    return SummaryResponse(
        id=summary.id,
        title=summary.title,
        period_type=period_type_str,
        start_date=summary.start_date,
        end_date=summary.end_date,
        summary_text=summary.summary_text,
        keywords=[KeywordItem(**kw) for kw in (summary.keywords or [])],
        statistics=summary.statistics or {},
        created_at=summary.created_at
    )


@router.delete("/{summary_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_summary(
    summary_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    删除总结
    
    - **summary_id**: 总结ID
    """
    summary_service = get_summary_service()
    success = summary_service.delete_summary(
        db=db,
        summary_id=summary_id,
        user_id=current_user.id
    )
    
    if not success:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="总结不存在"
        )
    
    return None

