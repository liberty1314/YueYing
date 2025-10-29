"""
Google Books API 路由

提供书籍搜索和详情查询的 REST API
"""

from typing import Optional
from fastapi import APIRouter, HTTPException, Query
from loguru import logger

from app.services.external_apis.google_books import google_books_client
from app.schemas.google_books import (
    BooksSearchResponse,
    BookVolume,
    SimpleBooksSearchResponse,
    BookSearchRequest,
    ISBNSearchRequest,
    TitleSearchRequest,
    AuthorSearchRequest,
    CategorySearchRequest,
)

router = APIRouter(prefix="/google-books", tags=["Google Books"])


# ==================== 书籍搜索 ====================

@router.get(
    "/search",
    response_model=SimpleBooksSearchResponse,
    summary="搜索书籍",
    description="通过关键词搜索书籍，支持高级搜索语法（标题、作者、出版社、主题、ISBN等）"
)
async def search_books(
    query: str = Query(..., min_length=1, max_length=500, description="搜索关键词"),
    start_index: int = Query(0, ge=0, description="起始索引"),
    max_results: int = Query(10, ge=1, le=40, description="最大结果数"),
    lang_restrict: Optional[str] = Query("zh-CN", description="语言限制"),
    order_by: str = Query("relevance", description="排序方式 (relevance, newest)"),
    print_type: str = Query("all", description="打印类型 (all, books, magazines)"),
):
    """
    搜索书籍

    支持高级搜索语法：
    - intitle: 标题搜索 (intitle:Python)
    - inauthor: 作者搜索 (inauthor:Martin)
    - inpublisher: 出版社搜索 (inpublisher:O'Reilly)
    - subject: 主题搜索 (subject:Fiction)
    - isbn: ISBN搜索 (isbn:9780596517748)
    """
    try:
        result = await google_books_client.search_books(
            query=query,
            start_index=start_index,
            max_results=max_results,
            langRestrict=lang_restrict,
            order_by=order_by,
            print_type=print_type,
        )

        # 转换为 Pydantic 模型
        search_response = BooksSearchResponse(**result)
        
        # 转换为简化的响应
        simple_response = SimpleBooksSearchResponse.from_search_response(search_response)
        
        logger.info(f"Books search successful: query='{query}', found {simple_response.total} books")
        return simple_response

    except Exception as e:
        logger.error(f"Books search failed: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Search failed: {str(e)}")


@router.get(
    "/search/isbn",
    response_model=SimpleBooksSearchResponse,
    summary="通过 ISBN 搜索",
    description="通过 ISBN 号码搜索书籍，支持 ISBN-10 和 ISBN-13 格式"
)
async def search_by_isbn(
    isbn: str = Query(..., min_length=10, max_length=13, description="ISBN 号码"),
):
    """
    通过 ISBN 搜索书籍

    支持 ISBN-10 和 ISBN-13 格式
    """
    try:
        result = await google_books_client.search_by_isbn(isbn)
        
        # 转换为 Pydantic 模型
        search_response = BooksSearchResponse(**result)
        simple_response = SimpleBooksSearchResponse.from_search_response(search_response)
        
        logger.info(f"ISBN search successful: isbn={isbn}, found {simple_response.total} books")
        return simple_response

    except Exception as e:
        logger.error(f"ISBN search failed: {str(e)}")
        raise HTTPException(status_code=500, detail=f"ISBN search failed: {str(e)}")


@router.get(
    "/search/title",
    response_model=SimpleBooksSearchResponse,
    summary="通过标题搜索",
    description="通过书籍标题搜索，可选择性地指定作者进行精确筛选"
)
async def search_by_title(
    title: str = Query(..., min_length=1, max_length=200, description="书籍标题"),
    author: Optional[str] = Query(None, max_length=100, description="作者名（可选）"),
    max_results: int = Query(10, ge=1, le=40, description="最大结果数"),
):
    """
    通过标题和作者搜索书籍
    """
    try:
        result = await google_books_client.search_by_title(
            title=title,
            author=author,
            max_results=max_results,
        )
        
        # 转换为 Pydantic 模型
        search_response = BooksSearchResponse(**result)
        simple_response = SimpleBooksSearchResponse.from_search_response(search_response)
        
        logger.info(
            f"Title search successful: title='{title}', author='{author}', "
            f"found {simple_response.total} books"
        )
        return simple_response

    except Exception as e:
        logger.error(f"Title search failed: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Title search failed: {str(e)}")


@router.get(
    "/search/author",
    response_model=SimpleBooksSearchResponse,
    summary="通过作者搜索",
    description="通过作者姓名搜索该作者的所有书籍"
)
async def search_by_author(
    author: str = Query(..., min_length=1, max_length=100, description="作者名"),
    start_index: int = Query(0, ge=0, description="起始索引"),
    max_results: int = Query(10, ge=1, le=40, description="最大结果数"),
):
    """
    通过作者搜索书籍
    """
    try:
        result = await google_books_client.search_by_author(
            author=author,
            start_index=start_index,
            max_results=max_results,
        )
        
        # 转换为 Pydantic 模型
        search_response = BooksSearchResponse(**result)
        simple_response = SimpleBooksSearchResponse.from_search_response(search_response)
        
        logger.info(f"Author search successful: author='{author}', found {simple_response.total} books")
        return simple_response

    except Exception as e:
        logger.error(f"Author search failed: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Author search failed: {str(e)}")


@router.get(
    "/search/category",
    response_model=SimpleBooksSearchResponse,
    summary="通过分类搜索",
    description="通过书籍分类或主题搜索相关书籍"
)
async def search_by_category(
    category: str = Query(..., min_length=1, max_length=100, description="书籍分类"),
    start_index: int = Query(0, ge=0, description="起始索引"),
    max_results: int = Query(10, ge=1, le=40, description="最大结果数"),
):
    """
    通过分类/主题搜索书籍
    """
    try:
        result = await google_books_client.search_by_category(
            category=category,
            start_index=start_index,
            max_results=max_results,
        )
        
        # 转换为 Pydantic 模型
        search_response = BooksSearchResponse(**result)
        simple_response = SimpleBooksSearchResponse.from_search_response(search_response)
        
        logger.info(
            f"Category search successful: category='{category}', "
            f"found {simple_response.total} books"
        )
        return simple_response

    except Exception as e:
        logger.error(f"Category search failed: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Category search failed: {str(e)}")


# ==================== 书籍详情 ====================

@router.get(
    "/volumes/{volume_id}",
    response_model=BookVolume,
    summary="获取书籍详情",
    description="根据 Google Books 卷 ID 获取书籍的完整详细信息"
)
async def get_volume_details(volume_id: str):
    """
    获取书籍详情

    Args:
        volume_id: Google Books 卷 ID
    """
    try:
        result = await google_books_client.get_volume_details(volume_id)
        
        # 转换为 Pydantic 模型
        volume = BookVolume(**result)
        
        logger.info(f"Volume details retrieved: id={volume_id}")
        return volume

    except Exception as e:
        logger.error(f"Volume details retrieval failed: {str(e)}")
        raise HTTPException(
            status_code=404 if "404" in str(e) else 500,
            detail=f"Volume not found: {volume_id}",
        )

