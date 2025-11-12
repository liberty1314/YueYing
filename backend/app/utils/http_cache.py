"""
HTTP缓存工具函数
"""

import hashlib
import json
from typing import Any, Optional
from fastapi import Request, Response
from fastapi.responses import JSONResponse

# 使用高性能JSON响应（如果可用）
try:
    import orjson

    class ORJSONResponse(JSONResponse):
        def render(self, content) -> bytes:
            return orjson.dumps(
                content,
                option=orjson.OPT_NON_STR_KEYS | orjson.OPT_SERIALIZE_NUMPY
            )
except ImportError:
    ORJSONResponse = JSONResponse


def generate_etag(data: Any) -> str:
    """
    生成数据的ETag

    Args:
        data: 要生成ETag的数据

    Returns:
        ETag字符串
    """
    try:
        # 将数据转换为JSON字符串
        if isinstance(data, (dict, list)):
            content = json.dumps(data, sort_keys=True, default=str)
        else:
            content = str(data)

        # 生成MD5哈希
        etag = hashlib.md5(content.encode('utf-8')).hexdigest()
        return f'"{etag}"'
    except Exception:
        # 如果序列化失败，使用时间戳作为fallback
        import time
        return f'"{int(time.time())}"'


def check_etag_match(request: Request, etag: str) -> bool:
    """
    检查客户端的If-None-Match是否与ETag匹配

    Args:
        request: FastAPI请求对象
        etag: 当前资源的ETag

    Returns:
        是否匹配（返回304）
    """
    if_none_match = request.headers.get("If-None-Match")
    if not if_none_match:
        return False

    # 处理多个ETag的情况 (ETag1, ETag2, ...)
    client_etags = [tag.strip() for tag in if_none_match.split(",")]

    # 检查是否匹配（包括通配符）
    return etag in client_etags or "*" in client_etags


def create_conditional_response(
    request: Request,
    data: Any,
    status_code: int = 200,
    cache_control: str = "private, max-age=300"
) -> Response:
    """
    创建带条件请求支持的响应

    Args:
        request: FastAPI请求对象
        data: 响应数据
        status_code: HTTP状态码
        cache_control: Cache-Control头

    Returns:
        FastAPI响应对象
    """
    etag = generate_etag(data)

    # 检查条件请求
    if check_etag_match(request, etag):
        # 返回304 Not Modified
        response = Response(status_code=304)
        response.headers["ETag"] = etag
        response.headers["Cache-Control"] = cache_control
        return response

    # 返回完整响应
    response = ORJSONResponse(content=data, status_code=status_code)
    response.headers["ETag"] = etag
    response.headers["Cache-Control"] = cache_control

    return response
