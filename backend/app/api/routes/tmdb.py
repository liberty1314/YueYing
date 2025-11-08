"""
TMDB API 路由

提供电影和剧集的搜索与详情查询接口
"""

from fastapi import APIRouter, HTTPException, Query, status
from typing import Optional

from app.services.external_apis.tmdb import tmdb_client
from app.schemas.tmdb import (
    TMDBMovieSearchResponse,
    TMDBMovieDetail,
    TMDBTVShowSearchResponse,
    TMDBTVShowDetail,
    TMDBSearchRequest,
)
from loguru import logger

router = APIRouter(prefix="/tmdb", tags=["TMDB 影视"])


# ==================== 电影相关路由 ====================

@router.get(
    "/movies/search",
    response_model=TMDBMovieSearchResponse,
    summary="搜索电影",
    description="通过关键词搜索电影，支持分页和年份过滤"
)
async def search_movies(
    query: str = Query(..., min_length=1, max_length=200, description="搜索关键词"),
    page: int = Query(1, ge=1, le=500, description="页码"),
    language: str = Query("zh-CN", description="语言"),
    year: Optional[int] = Query(None, description="年份过滤"),
):
    """
    搜索电影
    
    通过关键词搜索电影，支持分页和年份过滤
    """
    try:
        logger.info(f"Searching movies: query='{query}', page={page}, year={year}")
        result = await tmdb_client.search_movies(
            query=query,
            page=page,
            language=language,
            year=year,
        )
        return result
    except Exception as e:
        logger.error(f"Error searching movies: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"搜索电影失败: {str(e)}",
        )


@router.get(
    "/movies/popular",
    response_model=TMDBMovieSearchResponse,
    summary="获取热门电影",
    description="获取当前热门的电影列表"
)
async def get_popular_movies(
    page: int = Query(1, ge=1, le=500, description="页码"),
    language: str = Query("zh-CN", description="语言"),
    region: Optional[str] = Query(None, description="地区代码"),
):
    """
    获取热门电影
    
    获取当前热门的电影列表
    """
    try:
        logger.info(f"Fetching popular movies: page={page}, region={region}")
        result = await tmdb_client.get_popular_movies(
            page=page,
            language=language,
            region=region,
        )
        return result
    except Exception as e:
        logger.error(f"Error fetching popular movies: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"获取热门电影失败: {str(e)}",
        )


@router.get(
    "/movies/top-rated",
    response_model=TMDBMovieSearchResponse,
    summary="获取高分电影",
    description="获取评分最高的电影列表"
)
async def get_top_rated_movies(
    page: int = Query(1, ge=1, le=500, description="页码"),
    language: str = Query("zh-CN", description="语言"),
    region: Optional[str] = Query(None, description="地区代码"),
):
    """
    获取高分电影
    
    获取评分最高的电影列表
    """
    try:
        logger.info(f"Fetching top rated movies: page={page}, region={region}")
        result = await tmdb_client.get_top_rated_movies(
            page=page,
            language=language,
            region=region,
        )
        return result
    except Exception as e:
        logger.error(f"Error fetching top rated movies: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"获取高分电影失败: {str(e)}",
        )


@router.get(
    "/movies/{movie_id}",
    response_model=dict,
    summary="获取电影详情",
    description="根据电影 ID 获取详细信息，可附加演职人员、视频等数据"
)
async def get_movie_details(
    movie_id: int,
    language: str = Query("zh-CN", description="语言"),
    append_to_response: Optional[str] = Query(
        None,
        description="附加响应数据，逗号分隔 (credits,videos,images)",
    ),
):
    """
    获取电影详情
    
    根据电影 ID 获取详细信息，可选择附加演职人员、视频等数据
    """
    try:
        logger.info(f"Fetching movie details: id={movie_id}, language={language}")
        result = await tmdb_client.get_movie_details(
            movie_id=movie_id,
            language=language,
            append_to_response=append_to_response,
        )
        return result
    except Exception as e:
        logger.error(f"Error fetching movie details: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"获取电影详情失败: {str(e)}",
        )


@router.get(
    "/movies/{movie_id}/credits",
    response_model=dict,
    summary="获取电影演职人员",
    description="获取电影的演员和工作人员信息"
)
async def get_movie_credits(
    movie_id: int,
    language: str = Query("zh-CN", description="语言"),
):
    """
    获取电影演职人员
    
    获取电影的演员和工作人员信息
    """
    try:
        logger.info(f"Fetching movie credits: id={movie_id}")
        result = await tmdb_client.get_movie_credits(
            movie_id=movie_id,
            language=language,
        )
        return result
    except Exception as e:
        logger.error(f"Error fetching movie credits: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"获取演职人员失败: {str(e)}",
        )


@router.get(
    "/movies/{movie_id}/videos",
    response_model=dict,
    summary="获取电影视频",
    description="获取电影的预告片、花絮等视频"
)
async def get_movie_videos(
    movie_id: int,
    language: str = Query("zh-CN", description="语言"),
):
    """
    获取电影视频
    
    获取电影的预告片、花絮等视频
    """
    try:
        logger.info(f"Fetching movie videos: id={movie_id}")
        result = await tmdb_client.get_movie_videos(
            movie_id=movie_id,
            language=language,
        )
        return result
    except Exception as e:
        logger.error(f"Error fetching movie videos: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"获取视频失败: {str(e)}",
        )


# ==================== 剧集相关路由 ====================

@router.get(
    "/tv/search",
    response_model=TMDBTVShowSearchResponse,
    summary="搜索剧集",
    description="通过关键词搜索剧集，支持分页和年份过滤"
)
async def search_tv_shows(
    query: str = Query(..., min_length=1, max_length=200, description="搜索关键词"),
    page: int = Query(1, ge=1, le=500, description="页码"),
    language: str = Query("zh-CN", description="语言"),
    first_air_date_year: Optional[int] = Query(None, description="首播年份过滤"),
):
    """
    搜索剧集
    
    通过关键词搜索剧集，支持分页和年份过滤
    """
    try:
        logger.info(f"Searching TV shows: query='{query}', page={page}")
        result = await tmdb_client.search_tv_shows(
            query=query,
            page=page,
            language=language,
            first_air_date_year=first_air_date_year,
        )
        return result
    except Exception as e:
        logger.error(f"Error searching TV shows: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"搜索剧集失败: {str(e)}",
        )


@router.get(
    "/tv/popular",
    response_model=TMDBTVShowSearchResponse,
    summary="获取热门剧集",
    description="获取当前热门的剧集列表"
)
async def get_popular_tv_shows(
    page: int = Query(1, ge=1, le=500, description="页码"),
    language: str = Query("zh-CN", description="语言"),
):
    """
    获取热门剧集
    
    获取当前热门的剧集列表
    """
    try:
        logger.info(f"Fetching popular TV shows: page={page}")
        result = await tmdb_client.get_popular_tv_shows(
            page=page,
            language=language,
        )
        return result
    except Exception as e:
        logger.error(f"Error fetching popular TV shows: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"获取热门剧集失败: {str(e)}",
        )


@router.get(
    "/tv/top-rated",
    response_model=TMDBTVShowSearchResponse,
    summary="获取高分剧集",
    description="获取评分最高的剧集列表"
)
async def get_top_rated_tv_shows(
    page: int = Query(1, ge=1, le=500, description="页码"),
    language: str = Query("zh-CN", description="语言"),
):
    """
    获取高分剧集
    
    获取评分最高的剧集列表
    """
    try:
        logger.info(f"Fetching top rated TV shows: page={page}")
        result = await tmdb_client.get_top_rated_tv_shows(
            page=page,
            language=language,
        )
        return result
    except Exception as e:
        logger.error(f"Error fetching top rated TV shows: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"获取高分剧集失败: {str(e)}",
        )


@router.get(
    "/tv/{tv_id}",
    response_model=dict,
    summary="获取剧集详情",
    description="根据剧集 ID 获取详细信息，可附加演职人员、视频等数据"
)
async def get_tv_details(
    tv_id: int,
    language: str = Query("zh-CN", description="语言"),
    append_to_response: Optional[str] = Query(
        None,
        description="附加响应数据，逗号分隔 (credits,videos,images)",
    ),
):
    """
    获取剧集详情
    
    根据剧集 ID 获取详细信息，可选择附加演职人员、视频等数据
    """
    try:
        logger.info(f"Fetching TV show details: id={tv_id}, language={language}")
        result = await tmdb_client.get_tv_details(
            tv_id=tv_id,
            language=language,
            append_to_response=append_to_response,
        )
        return result
    except Exception as e:
        logger.error(f"Error fetching TV show details: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"获取剧集详情失败: {str(e)}",
        )


@router.get(
    "/tv/{tv_id}/credits",
    response_model=dict,
    summary="获取剧集演职人员",
    description="获取剧集的演员和工作人员信息"
)
async def get_tv_credits(
    tv_id: int,
    language: str = Query("zh-CN", description="语言"),
):
    """
    获取剧集演职人员
    
    获取剧集的演员和工作人员信息
    """
    try:
        logger.info(f"Fetching TV show credits: id={tv_id}")
        result = await tmdb_client.get_tv_credits(
            tv_id=tv_id,
            language=language,
        )
        return result
    except Exception as e:
        logger.error(f"Error fetching TV show credits: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"获取演职人员失败: {str(e)}",
        )


@router.get(
    "/tv/{tv_id}/season/{season_number}",
    response_model=dict,
    summary="获取剧集季度详情",
    description="获取剧集某一季的详细信息"
)
async def get_tv_season_details(
    tv_id: int,
    season_number: int,
    language: str = Query("zh-CN", description="语言"),
):
    """
    获取剧集季度详情
    
    获取剧集某一季的详细信息
    """
    try:
        logger.info(f"Fetching TV season details: tv_id={tv_id}, season={season_number}")
        result = await tmdb_client.get_tv_season_details(
            tv_id=tv_id,
            season_number=season_number,
            language=language,
        )
        return result
    except Exception as e:
        logger.error(f"Error fetching TV season details: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"获取季度详情失败: {str(e)}",
        )


# ==================== 趋势相关路由 ====================

@router.get(
    "/trending/{media_type}/{time_window}",
    response_model=dict,
    summary="获取趋势内容",
    description="获取今日或本周的趋势电影/剧集"
)
async def get_trending(
    media_type: str,  # all, movie, tv
    time_window: str,  # day, week
    page: int = Query(1, ge=1, le=500, description="页码"),
    language: str = Query("zh-CN", description="语言"),
):
    """
    获取趋势内容
    
    - media_type: all (全部), movie (电影), tv (剧集)
    - time_window: day (今日), week (本周)
    """
    try:
        logger.info(f"Fetching trending {media_type} for {time_window}")
        result = await tmdb_client.get_trending(
            media_type=media_type,
            time_window=time_window,
            page=page,
            language=language,
        )
        return result
    except Exception as e:
        logger.error(f"Error fetching trending: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"获取趋势失败: {str(e)}",
        )


# ==================== 配置相关路由 ====================

@router.get(
    "/configuration",
    response_model=dict,
    summary="获取 TMDB 配置",
    description="获取 TMDB 的配置信息，包括图片基础 URL 等"
)
async def get_configuration():
    """
    获取 TMDB 配置
    
    获取 TMDB 的配置信息，包括图片基础 URL 等
    """
    try:
        logger.info("Fetching TMDB configuration")
        result = await tmdb_client.get_configuration()
        return result
    except Exception as e:
        logger.error(f"Error fetching TMDB configuration: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"获取配置失败: {str(e)}",
        )

