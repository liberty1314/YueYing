"""
Bangumi API 路由

提供动漫/游戏等 ACG 内容的搜索和详情查询的 REST API
"""

from typing import Optional, List, Dict, Any
from fastapi import APIRouter, HTTPException, Query, Request, Depends
from sqlalchemy.orm import Session
from loguru import logger

from app.core.database import get_db
from app.api.dependencies.auth import get_current_user
from app.models.user import User
from app.services.external_apis.bangumi import bangumi_client
from app.middleware.rate_limit import limiter
from app.schemas.bangumi import (
    BangumiSearchResult,
    BangumiSubject,
    BangumiSubjectDetail,
    BangumiEpisodeList,
    BangumiEpisode,
    BangumiCalendarItem,
    SimpleSearchResponse,
    SimpleSubjectInfo,
    SimpleEpisodeInfo,
    SubjectSearchRequest,
)

router = APIRouter(prefix="/bangumi", tags=["Bangumi 番组"])


# ==================== 搜索功能 ====================

@router.get(
    "/search",
    response_model=SimpleSearchResponse,
    summary="搜索条目",
    description="通过关键词搜索动漫、游戏、书籍等条目"
)
@limiter.limit("30/minute")
async def search_subjects(
    request: Request,
    keyword: str = Query(..., min_length=1, max_length=200, description="搜索关键词"),
    type: Optional[int] = Query(None, description="条目类型 (1=书籍, 2=动画, 3=音乐, 4=游戏, 6=三次元)"),
    max_results: int = Query(25, ge=1, le=25, description="最大结果数"),
    start: int = Query(0, ge=0, description="起始位置"),
    current_user: User = Depends(get_current_user),
):
    """
    搜索条目

    支持的类型：
    - 1: 书籍
    - 2: 动画
    - 3: 音乐
    - 4: 游戏
    - 6: 三次元
    """
    try:
        result = await bangumi_client.search_subjects(
            keyword=keyword,
            type=type,
            max_results=max_results,
            start=start,
        )

        # 转换为 Pydantic 模型
        search_result = BangumiSearchResult(**result)
        
        # 转换为简化的响应
        simple_response = SimpleSearchResponse.from_search_result(search_result)
        
        logger.info(
            f"Bangumi search successful: keyword='{keyword}', type={type}, "
            f"found {simple_response.total} subjects"
        )
        return simple_response

    except Exception as e:
        logger.error(f"Bangumi search failed: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Search failed: {str(e)}")


@router.get(
    "/search/anime",
    response_model=SimpleSearchResponse,
    summary="搜索动画",
    description="专门搜索动画类型的条目"
)
@limiter.limit("30/minute")
async def search_anime(
    request: Request,
    keyword: str = Query(..., min_length=1, max_length=200, description="搜索关键词"),
    max_results: int = Query(25, ge=1, le=25, description="最大结果数"),
    start: int = Query(0, ge=0, description="起始位置"),
    current_user: User = Depends(get_current_user),
):
    """搜索动画"""
    return await search_subjects(request=request, keyword=keyword, type=2, max_results=max_results, start=start)


@router.get(
    "/search/game",
    response_model=SimpleSearchResponse,
    summary="搜索游戏",
    description="专门搜索游戏类型的条目"
)
@limiter.limit("30/minute")
async def search_game(
    request: Request,
    keyword: str = Query(..., min_length=1, max_length=200, description="搜索关键词"),
    max_results: int = Query(25, ge=1, le=25, description="最大结果数"),
    start: int = Query(0, ge=0, description="起始位置"),
    current_user: User = Depends(get_current_user),
):
    """搜索游戏"""
    return await search_subjects(request=request, keyword=keyword, type=4, max_results=max_results, start=start)


# ==================== 条目详情 ====================

@router.get(
    "/subjects/{subject_id}",
    response_model=BangumiSubject,
    summary="获取条目详情",
    description="根据条目 ID 获取详细信息"
)
@limiter.limit("60/minute")
async def get_subject_details(
    request: Request,
    subject_id: int,
    response_group: str = Query("large", description="返回数据大小 (small, medium, large)"),
    current_user: User = Depends(get_current_user),
):
    """
    获取条目详情

    Args:
        subject_id: 条目 ID
        response_group: 返回数据大小
            - small: 基本信息
            - medium: 中等详细
            - large: 完整详细（包含角色、制作人员等）
    """
    try:
        result = await bangumi_client.get_subject_details(
            subject_id=subject_id,
            response_group=response_group,
        )
        
        # 转换为 Pydantic 模型
        subject = BangumiSubject(**result)
        
        logger.info(f"Bangumi subject details retrieved: id={subject_id}")
        return subject

    except Exception as e:
        logger.error(f"Bangumi subject details retrieval failed: {str(e)}")
        raise HTTPException(
            status_code=404 if "404" in str(e) else 500,
            detail=f"Subject not found: {subject_id}",
        )


@router.get(
    "/subjects/{subject_id}/simple",
    response_model=SimpleSubjectInfo,
    summary="获取条目简要信息",
    description="获取条目的简化信息，适合列表展示"
)
@limiter.limit("60/minute")
async def get_subject_simple(
    request: Request,
    subject_id: int,
    current_user: User = Depends(get_current_user),
):
    """获取条目简要信息"""
    try:
        result = await bangumi_client.get_subject_details(
            subject_id=subject_id,
            response_group="medium",
        )
        
        subject = BangumiSubject(**result)
        simple_info = SimpleSubjectInfo.from_subject(subject)
        
        logger.info(f"Bangumi simple subject info retrieved: id={subject_id}")
        return simple_info

    except Exception as e:
        logger.error(f"Bangumi simple subject info retrieval failed: {str(e)}")
        raise HTTPException(
            status_code=404 if "404" in str(e) else 500,
            detail=f"Subject not found: {subject_id}",
        )


# ==================== 章节/剧集信息 ====================

@router.get(
    "/subjects/{subject_id}/episodes",
    response_model=List[SimpleEpisodeInfo],
    summary="获取章节列表",
    description="获取条目的章节/剧集列表"
)
@limiter.limit("60/minute")
async def get_subject_episodes(
    request: Request,
    subject_id: int,
    type: int = Query(0, description="章节类型 (0=本篇, 1=SP, 2=OP, 3=ED)"),
    offset: int = Query(0, ge=0, description="偏移量"),
    limit: int = Query(100, ge=1, le=100, description="限制数量"),
    current_user: User = Depends(get_current_user),
):
    """
    获取条目的章节/剧集列表

    章节类型：
    - 0: 本篇
    - 1: SP (特别篇)
    - 2: OP (片头曲)
    - 3: ED (片尾曲)
    """
    try:
        result = await bangumi_client.get_subject_episodes(
            subject_id=subject_id,
            type=type,
            offset=offset,
            limit=limit,
        )
        
        # 转换为简化的响应
        episodes = []
        if isinstance(result, dict) and "data" in result:
            episodes = [
                SimpleEpisodeInfo.from_episode(BangumiEpisode(**ep))
                for ep in result["data"]
            ]
        elif isinstance(result, list):
            episodes = [
                SimpleEpisodeInfo.from_episode(BangumiEpisode(**ep))
                for ep in result
            ]
        
        logger.info(
            f"Bangumi episodes retrieved: subject_id={subject_id}, "
            f"type={type}, count={len(episodes)}"
        )
        return episodes

    except Exception as e:
        logger.error(f"Bangumi episodes retrieval failed: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Failed to get episodes: {str(e)}")


@router.get(
    "/episodes/{episode_id}",
    response_model=BangumiEpisode,
    summary="获取章节详情",
    description="根据章节 ID 获取详细信息"
)
@limiter.limit("60/minute")
async def get_episode_details(
    request: Request,
    episode_id: int,
    current_user: User = Depends(get_current_user),
):
    """获取章节/剧集详情"""
    try:
        result = await bangumi_client.get_episode_details(episode_id)
        
        episode = BangumiEpisode(**result)
        
        logger.info(f"Bangumi episode details retrieved: id={episode_id}")
        return episode

    except Exception as e:
        logger.error(f"Bangumi episode details retrieval failed: {str(e)}")
        raise HTTPException(
            status_code=404 if "404" in str(e) else 500,
            detail=f"Episode not found: {episode_id}",
        )


# ==================== 角色和人物信息 ====================

@router.get(
    "/subjects/{subject_id}/characters",
    response_model=List[Dict],
    summary="获取条目角色",
    description="获取条目的角色列表"
)
@limiter.limit("60/minute")
async def get_subject_characters(
    request: Request,
    subject_id: int,
    current_user: User = Depends(get_current_user),
):
    """获取条目的角色列表"""
    try:
        result = await bangumi_client.get_subject_characters(subject_id)
        
        logger.info(f"Bangumi characters retrieved: subject_id={subject_id}")
        return result

    except Exception as e:
        logger.error(f"Bangumi characters retrieval failed: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Failed to get characters: {str(e)}")


@router.get(
    "/subjects/{subject_id}/persons",
    response_model=List[Dict],
    summary="获取制作人员",
    description="获取条目的制作人员列表"
)
@limiter.limit("60/minute")
async def get_subject_persons(
    request: Request,
    subject_id: int,
    current_user: User = Depends(get_current_user),
):
    """获取条目的制作人员列表"""
    try:
        result = await bangumi_client.get_subject_persons(subject_id)
        
        logger.info(f"Bangumi persons retrieved: subject_id={subject_id}")
        return result

    except Exception as e:
        logger.error(f"Bangumi persons retrieval failed: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Failed to get persons: {str(e)}")


# ==================== 每日放送 ====================

@router.get(
    "/calendar",
    response_model=List[BangumiCalendarItem],
    summary="获取每日放送",
    description="获取当前一周的动画放送时间表"
)
@limiter.limit("30/minute")
async def get_calendar(
    request: Request,
    current_user: User = Depends(get_current_user),
):
    """获取每日放送（当前一周的放送时间表）"""
    try:
        result = await bangumi_client.get_calendar()
        
        # 转换为 Pydantic 模型
        calendar = [BangumiCalendarItem(**item) for item in result]
        
        logger.info("Bangumi calendar retrieved")
        return calendar

    except Exception as e:
        logger.error(f"Bangumi calendar retrieval failed: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Failed to get calendar: {str(e)}")

