"""
HTTP缓存中间件
实现ETag和Cache-Control头
"""

import hashlib
from typing import Callable
from fastapi import Request, Response
from fastapi.responses import JSONResponse
from starlette.middleware.base import BaseHTTPMiddleware
from loguru import logger


class HTTPCacheMiddleware(BaseHTTPMiddleware):
    """HTTP缓存中间件"""

    def __init__(self, app, cacheable_endpoints=None):
        super().__init__(app)
        # 默认可缓存的端点
        self.cacheable_endpoints = cacheable_endpoints or [
            "/api/search",  # 搜索结果
            "/api/recommendations",  # 推荐结果
            "/api/stats",  # 统计数据
        ]

    async def dispatch(self, request: Request, call_next: Callable) -> Response:
        """处理请求和响应"""
        # 检查是否为GET请求且为可缓存端点
        is_cacheable = (
            request.method == "GET" and
            any(endpoint in request.url.path for endpoint in self.cacheable_endpoints)
        )

        if is_cacheable:
            # 检查If-None-Match头
            if_none_match = request.headers.get("If-None-Match")
            if if_none_match:
                # 这里可以实现更复杂的ETag检查逻辑
                # 现在简化处理，直接继续请求
                pass

        # 调用下一个中间件/路由
        response = await call_next(request)

        # 只为成功的GET响应添加缓存头
        if is_cacheable and response.status_code == 200:
            await self._add_cache_headers(request, response)

        return response

    async def _add_cache_headers(self, request: Request, response: Response):
        """添加缓存相关的响应头"""
        try:
            # 生成ETag
            etag = await self._generate_etag(response)
            response.headers["ETag"] = etag

            # 根据端点类型设置不同的Cache-Control
            path = request.url.path

            if "/search" in path:
                # 搜索结果：缓存5分钟
                response.headers["Cache-Control"] = "public, max-age=300"
            elif "/recommendations" in path:
                # 推荐结果：缓存10分钟
                response.headers["Cache-Control"] = "private, max-age=600"
            elif "/stats" in path:
                # 统计数据：缓存1分钟
                response.headers["Cache-Control"] = "private, max-age=60"
            else:
                # 默认：缓存5分钟
                response.headers["Cache-Control"] = "private, max-age=300"

            # 添加Last-Modified（可选）
            import datetime
            response.headers["Last-Modified"] = datetime.datetime.utcnow().strftime(
                "%a, %d %b %Y %H:%M:%S GMT"
            )

        except Exception as e:
            logger.warning(f"Failed to add cache headers: {e}")

    async def _generate_etag(self, response: Response) -> str:
        """生成ETag"""
        try:
            # 获取响应内容
            if hasattr(response, 'body'):
                content = response.body
            elif hasattr(response, 'content'):
                content = response.content
            else:
                # 对于流式响应，使用路径和时间戳
                import time
                content = f"{response.url}:{int(time.time())}".encode()

            # 生成MD5哈希作为ETag
            etag = hashlib.md5(content).hexdigest()
            return f'"{etag}"'

        except Exception as e:
            logger.warning(f"Failed to generate ETag: {e}")
            # 返回弱ETag
            import time
            return f'W/"{int(time.time())}"'


def add_cache_headers(response: Response, cache_type: str = "private", max_age: int = 300):
    """
    手动为响应添加缓存头

    Args:
        response: FastAPI响应对象
        cache_type: 缓存类型 ("public", "private", "no-cache")
        max_age: 缓存时间（秒）
    """
    try:
        response.headers["Cache-Control"] = f"{cache_type}, max-age={max_age}"

        # 生成简单的ETag
        import time
        etag_value = str(int(time.time()))
        response.headers["ETag"] = f'"{etag_value}"'

        # 添加Last-Modified
        import datetime
        response.headers["Last-Modified"] = datetime.datetime.utcnow().strftime(
            "%a, %d %b %Y %H:%M:%S GMT"
        )

    except Exception as e:
        logger.warning(f"Failed to add cache headers manually: {e}")
