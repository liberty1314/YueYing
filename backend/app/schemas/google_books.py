"""
Google Books API 响应 Schemas

定义 Google Books API 的请求和响应数据结构
"""

from typing import Optional, List
from datetime import date
from pydantic import BaseModel, Field, HttpUrl


# ==================== 书籍信息模型 ====================

class IndustryIdentifier(BaseModel):
    """行业标识符（ISBN等）"""
    
    type: str  # ISBN_10, ISBN_13, ISSN, etc.
    identifier: str


class ImageLinks(BaseModel):
    """图片链接"""
    
    smallThumbnail: Optional[str] = None
    thumbnail: Optional[str] = None
    small: Optional[str] = None
    medium: Optional[str] = None
    large: Optional[str] = None
    extraLarge: Optional[str] = None


class VolumeInfo(BaseModel):
    """书籍卷信息"""
    
    title: str
    subtitle: Optional[str] = None
    authors: Optional[List[str]] = []
    publisher: Optional[str] = None
    publishedDate: Optional[str] = None
    description: Optional[str] = None
    industryIdentifiers: Optional[List[IndustryIdentifier]] = []
    pageCount: Optional[int] = None
    printType: Optional[str] = None
    categories: Optional[List[str]] = []
    averageRating: Optional[float] = None
    ratingsCount: Optional[int] = None
    maturityRating: Optional[str] = None
    language: Optional[str] = None
    previewLink: Optional[str] = None
    infoLink: Optional[str] = None
    canonicalVolumeLink: Optional[str] = None
    imageLinks: Optional[ImageLinks] = None


class SaleInfo(BaseModel):
    """销售信息"""
    
    country: Optional[str] = None
    saleability: Optional[str] = None
    isEbook: Optional[bool] = False
    listPrice: Optional[dict] = None
    retailPrice: Optional[dict] = None
    buyLink: Optional[str] = None


class AccessInfo(BaseModel):
    """访问信息"""
    
    country: Optional[str] = None
    viewability: Optional[str] = None
    embeddable: Optional[bool] = False
    publicDomain: Optional[bool] = False
    textToSpeechPermission: Optional[str] = None
    epub: Optional[dict] = None
    pdf: Optional[dict] = None
    webReaderLink: Optional[str] = None
    accessViewStatus: Optional[str] = None


class SearchInfo(BaseModel):
    """搜索信息"""
    
    textSnippet: Optional[str] = None


class BookVolume(BaseModel):
    """书籍卷（搜索结果项）"""
    
    kind: str
    id: str
    etag: str
    selfLink: str
    volumeInfo: VolumeInfo
    saleInfo: Optional[SaleInfo] = None
    accessInfo: Optional[AccessInfo] = None
    searchInfo: Optional[SearchInfo] = None


class BooksSearchResponse(BaseModel):
    """书籍搜索响应"""
    
    kind: str
    totalItems: int
    items: Optional[List[BookVolume]] = []


# ==================== 请求模型 ====================

class BookSearchRequest(BaseModel):
    """书籍搜索请求"""
    
    query: str = Field(..., min_length=1, max_length=500, description="搜索关键词")
    start_index: int = Field(0, ge=0, description="起始索引")
    max_results: int = Field(10, ge=1, le=40, description="最大结果数")
    lang_restrict: Optional[str] = Field("zh-CN", description="语言限制")
    order_by: str = Field("relevance", description="排序方式 (relevance, newest)")
    print_type: str = Field("all", description="打印类型 (all, books, magazines)")


class ISBNSearchRequest(BaseModel):
    """ISBN 搜索请求"""
    
    isbn: str = Field(..., min_length=10, max_length=13, description="ISBN 号码")


class TitleSearchRequest(BaseModel):
    """标题搜索请求"""
    
    title: str = Field(..., min_length=1, max_length=200, description="书籍标题")
    author: Optional[str] = Field(None, max_length=100, description="作者名（可选）")
    max_results: int = Field(10, ge=1, le=40, description="最大结果数")


class AuthorSearchRequest(BaseModel):
    """作者搜索请求"""
    
    author: str = Field(..., min_length=1, max_length=100, description="作者名")
    start_index: int = Field(0, ge=0, description="起始索引")
    max_results: int = Field(10, ge=1, le=40, description="最大结果数")


class CategorySearchRequest(BaseModel):
    """分类搜索请求"""
    
    category: str = Field(..., min_length=1, max_length=100, description="书籍分类")
    start_index: int = Field(0, ge=0, description="起始索引")
    max_results: int = Field(10, ge=1, le=40, description="最大结果数")


# ==================== 简化的响应模型 ====================

class SimpleBookInfo(BaseModel):
    """简化的书籍信息（用于列表展示）"""
    
    id: str
    title: str
    subtitle: Optional[str] = None
    authors: List[str] = []
    publisher: Optional[str] = None
    published_date: Optional[str] = None
    description: Optional[str] = None
    page_count: Optional[int] = None
    categories: List[str] = []
    average_rating: Optional[float] = None
    ratings_count: Optional[int] = None
    language: Optional[str] = None
    thumbnail: Optional[str] = None
    preview_link: Optional[str] = None
    isbn_10: Optional[str] = None
    isbn_13: Optional[str] = None

    @classmethod
    def from_volume(cls, volume: BookVolume) -> "SimpleBookInfo":
        """从 BookVolume 转换"""
        info = volume.volumeInfo
        
        # 提取 ISBN
        isbn_10 = None
        isbn_13 = None
        if info.industryIdentifiers:
            for identifier in info.industryIdentifiers:
                if identifier.type == "ISBN_10":
                    isbn_10 = identifier.identifier
                elif identifier.type == "ISBN_13":
                    isbn_13 = identifier.identifier
        
        # 获取缩略图
        thumbnail = None
        if info.imageLinks:
            thumbnail = (
                info.imageLinks.thumbnail
                or info.imageLinks.smallThumbnail
            )
        
        return cls(
            id=volume.id,
            title=info.title,
            subtitle=info.subtitle,
            authors=info.authors or [],
            publisher=info.publisher,
            published_date=info.publishedDate,
            description=info.description,
            page_count=info.pageCount,
            categories=info.categories or [],
            average_rating=info.averageRating,
            ratings_count=info.ratingsCount,
            language=info.language,
            thumbnail=thumbnail,
            preview_link=info.previewLink,
            isbn_10=isbn_10,
            isbn_13=isbn_13,
        )


class SimpleBooksSearchResponse(BaseModel):
    """简化的搜索响应"""
    
    total: int
    items: List[SimpleBookInfo]

    @classmethod
    def from_search_response(cls, response: BooksSearchResponse) -> "SimpleBooksSearchResponse":
        """从 BooksSearchResponse 转换"""
        items = []
        if response.items:
            items = [SimpleBookInfo.from_volume(vol) for vol in response.items]
        
        return cls(
            total=response.totalItems,
            items=items,
        )

