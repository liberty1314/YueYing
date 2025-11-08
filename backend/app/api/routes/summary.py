"""
智能总结生成 API 路由
"""
from fastapi import APIRouter, Depends, HTTPException, status, BackgroundTasks
from sqlalchemy.orm import Session
from pydantic import BaseModel, Field
from typing import List, Optional
from datetime import datetime
import asyncio
import logging

from app.core.database import get_db
from app.api.dependencies.auth import get_current_user
from app.models.user import User
from app.ai.summary import get_summary_service
from app.models.summary import Summary, PeriodType
from app.models.background_task import BackgroundTask, TaskStatus, TaskType
from app.core.task_manager import task_manager


logger = logging.getLogger(__name__)
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


class TaskResponse(BaseModel):
    """任务响应"""
    task_id: str
    status: str
    progress: int
    progress_message: Optional[str] = None
    result: Optional[dict] = None
    error_message: Optional[str] = None
    created_at: datetime
    
    class Config:
        from_attributes = True


# ========== API 端点 ==========

@router.post("/generate", response_model=TaskResponse, status_code=status.HTTP_202_ACCEPTED)
async def generate_summary(
    request: GenerateSummaryRequest,
    background_tasks: BackgroundTasks,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    创建生成总结的后台任务（异步）
    
    - **period_type**: week/month/year/custom
    - **start_date**: 开始日期
    - **end_date**: 结束日期
    - **title**: 可选的自定义标题
    
    返回任务ID，客户端可以通过 WebSocket 接收任务完成通知，
    或通过 /summary/tasks/{task_id} 查询任务状态
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
    
    try:
        # 创建后台任务
        task = task_manager.create_task(
            db=db,
            user_id=current_user.id,
            task_type=TaskType.SUMMARY_GENERATION,
            params={
                "period_type": request.period_type,
                "start_date": request.start_date.isoformat(),
                "end_date": request.end_date.isoformat(),
                "title": request.title
            }
        )
        
        # 在后台执行任务（使用 asyncio.create_task 立即启动）
        async def run_summary_task():
            from app.core.database import SessionLocal
            import traceback
            
            logger.info(f"Starting background task for summary generation: {task.task_id}")
            task_db = SessionLocal()
            # 注意：不能直接使用 current_user 对象，需要传递 ID
            user_id_val = current_user.id
            period_type_val = request.period_type
            start_date_val = request.start_date
            end_date_val = request.end_date
            title_val = request.title
            try:
                summary_service = get_summary_service()
                await summary_service.generate_summary_background(
                    db=task_db,
                    task_id=task.task_id,
                    user_id=user_id_val,
                    period_type=period_type_val,
                    start_date=start_date_val,
                    end_date=end_date_val,
                    title=title_val
                )
                logger.info(f"Background task completed: {task.task_id}")
            except Exception as e:
                logger.error(f"Background task failed: {task.task_id}, error: {str(e)}\n{traceback.format_exc()}")
                # 更新任务状态为失败
                try:
                    task_manager.update_task_status(
                        task_db, task.task_id, TaskStatus.FAILED,
                        error_message=str(e)
                    )
                except Exception as update_error:
                    logger.error(f"Failed to update task status: {update_error}")
            finally:
                task_db.close()
        
        # 使用 asyncio.create_task 立即启动任务
        asyncio.create_task(run_summary_task())
        
        return TaskResponse(
            task_id=task.task_id,
            status=task.status if isinstance(task.status, str) else str(task.status),
            progress=task.progress or 0,
            progress_message=task.progress_message,
            created_at=task.created_at
        )
    
    except Exception as e:
        import traceback
        error_detail = f"创建任务失败: {str(e)}\n{traceback.format_exc()}"
        logger.error(error_detail)
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"创建任务失败: {str(e)}"
        )


@router.get("/tasks/{task_id}", response_model=TaskResponse)
def get_task_status(
    task_id: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    查询任务状态
    
    - **task_id**: 任务ID
    """
    task = task_manager.get_task(db, task_id)
    
    if not task:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="任务不存在"
        )
    
    # 验证任务所属用户
    if task.user_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="无权访问此任务"
        )
    
    return TaskResponse(
        task_id=task.task_id,
        status=task.status if isinstance(task.status, str) else str(task.status),
        progress=task.progress or 0,
        progress_message=task.progress_message,
        result=task.result,
        error_message=task.error_message,
        created_at=task.created_at
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

