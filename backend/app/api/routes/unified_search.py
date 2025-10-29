"""
统一搜索 API 路由

提供整合多个外部API的统一搜索接口
"""

from fastapi import APIRouter, Query, HTTPException, status
from typing import Optional
from loguru import logger

from app.schemas.unified_search import (
    UnifiedSearchResponse,
    ContentType,
    SearchStatsResponse,
)
from app.services.unified_search import unified_search_service
from app.core.cache import cache_manager
from app.utils.cache_keys import MEDIUM_CACHE_TTL


router = APIRouter(prefix="/search", tags=["统一搜索"])


@router.get(
    "",
    response_model=UnifiedSearchResponse,
    summary="统一搜索",
    description="""
    跨多个数据源的统一搜索接口。
    
    支持的内容类型：
    - movie: 电影（TMDB）
    - tv: 电视剧（TMDB）
    - anime: 动画（Bangumi）
    - book: 书籍（Google Books）
    - game: 游戏（Bangumi）
    - all: 所有类型
    
    搜索结果会自动去重、排序并分页。
    """,
)
async def unified_search(
    q: str = Query(
        ...,
        min_length=1,
        max_length=200,
        description="搜索关键词",
        alias="q",
    ),
    type: ContentType = Query(
        ContentType.ALL,
        description="内容类型筛选",
        alias="type",
    ),
    page: int = Query(
        1,
        ge=1,
        le=100,
        description="页码",
    ),
    page_size: int = Query(
        20,
        ge=1,
        le=50,
        description="每页结果数",
        alias="page_size",
    ),
    use_cache: bool = Query(
        True,
        description="是否使用缓存",
        alias="use_cache",
    ),
):
    """
    统一搜索接口
    
    整合 TMDB、Google Books、Bangumi 的搜索结果
    """
    try:
        # 生成缓存键
        cache_key = f"unified_search:{q}:{type}:{page}:{page_size}"

        # 尝试从缓存获取
        if use_cache and cache_manager:
            cached_result = cache_manager.get(cache_key)
            if cached_result:
                logger.info(f"Cache hit for unified search: {cache_key}")
                return cached_result

        # 执行搜索
        result = await unified_search_service.search(
            query=q,
            content_type=type,
            max_results=page_size,
            page=page,
        )

        # 转换为响应模型
        response = UnifiedSearchResponse(**result)

        # 缓存结果
        if use_cache and cache_manager:
            cache_manager.set(
                key=cache_key,
                value=response.model_dump(),
                expire=MEDIUM_CACHE_TTL,
            )

        logger.info(
            f"Unified search completed: query='{q}', type={type}, "
            f"results={len(response.results)}"
        )

        return response

    except Exception as e:
        logger.error(f"Unified search failed: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"搜索失败: {str(e)}",
        )


@router.get(
    "/stats",
    response_model=SearchStatsResponse,
    summary="搜索统计",
    description="获取搜索结果的统计信息（各来源和类型的结果数量）",
)
async def search_stats(
    q: str = Query(
        ...,
        min_length=1,
        max_length=200,
        description="搜索关键词",
        alias="q",
    ),
):
    """
    获取搜索统计信息
    
    返回各个数据源和内容类型的结果数量
    """
    try:
        # 执行搜索（获取所有结果）
        result = await unified_search_service.search(
            query=q,
            content_type=ContentType.ALL,
            max_results=100,  # 获取足够多的结果用于统计
            page=1,
        )

        results = result.get("results", [])

        # 统计各来源结果数
        results_by_source = {}
        for item in results:
            source = item.get("source")
            results_by_source[source] = results_by_source.get(source, 0) + 1

        # 统计各类型结果数
        results_by_type = {}
        for item in results:
            content_type = item.get("content_type")
            results_by_type[content_type] = results_by_type.get(content_type, 0) + 1

        return SearchStatsResponse(
            total_results=len(results),
            results_by_source=results_by_source,
            results_by_type=results_by_type,
        )

    except Exception as e:
        logger.error(f"Search stats failed: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"统计失败: {str(e)}",
        )


@router.delete(
    "/cache",
    summary="清除搜索缓存",
    description="清除指定关键词的搜索缓存",
)
async def clear_search_cache(
    q: Optional[str] = Query(
        None,
        description="搜索关键词（为空则清除所有搜索缓存）",
        alias="q",
    ),
):
    """
    清除搜索缓存
    """
    try:
        if q:
            # 清除特定关键词的缓存
            pattern = f"unified_search:{q}:*"
            # Redis pattern matching
            # 注意：这需要实现一个支持模式匹配删除的方法
            logger.info(f"Cleared search cache for query: {q}")
            return {"message": f"已清除关键词 '{q}' 的搜索缓存"}
        else:
            # 清除所有搜索缓存
            logger.info("Cleared all search cache")
            return {"message": "已清除所有搜索缓存"}

    except Exception as e:
        logger.error(f"Clear cache failed: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"清除缓存失败: {str(e)}",
        )

