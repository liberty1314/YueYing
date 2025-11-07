"""
日志中间件

记录所有 API 请求、响应和异常
"""
import time
import traceback
from typing import Callable
from uuid import uuid4

from fastapi import Request, Response
from fastapi.responses import JSONResponse
from loguru import logger
from starlette.middleware.base import BaseHTTPMiddleware
from starlette.types import ASGIApp


class LoggingMiddleware(BaseHTTPMiddleware):
    """API 请求日志中间件"""

    def __init__(self, app: ASGIApp):
        """
        初始化日志中间件

        Args:
            app: ASGI 应用
        """
        super().__init__(app)

    async def dispatch(self, request: Request, call_next: Callable) -> Response:
        """
        处理请求并记录日志

        Args:
            request: 请求对象
            call_next: 下一个中间件或路由处理器

        Returns:
            响应对象
        """
        # 生成请求 ID
        request_id = str(uuid4())
        request.state.request_id = request_id

        # 记录请求开始时间
        start_time = time.time()

        # 获取请求信息
        method = request.method
        url = str(request.url)
        client_host = request.client.host if request.client else "unknown"
        user_agent = request.headers.get("user-agent", "unknown")

        # 记录请求日志
        logger.info(
            f"Request started | {method} {url}",
            extra={
                "request_id": request_id,
                "method": method,
                "url": url,
                "client_host": client_host,
                "user_agent": user_agent,
            },
        )

        try:
            # 处理请求
            response = await call_next(request)

            # 计算请求处理时间
            process_time = time.time() - start_time

            # 添加自定义响应头
            response.headers["X-Request-ID"] = request_id
            response.headers["X-Process-Time"] = f"{process_time:.4f}"

            # 记录响应日志
            logger.info(
                f"Request completed | {method} {url} | "
                f"Status: {response.status_code} | "
                f"Time: {process_time:.4f}s",
                extra={
                    "request_id": request_id,
                    "method": method,
                    "url": url,
                    "status_code": response.status_code,
                    "process_time": process_time,
                },
            )

            return response

        except Exception as exc:
            # 计算请求处理时间
            process_time = time.time() - start_time

            # 获取异常堆栈
            exc_traceback = traceback.format_exc()
            
            # 获取错误信息（避免格式化字符串问题）
            error_msg = str(exc)
            error_type = type(exc).__name__

            # 记录异常日志（使用.format()预先格式化，避免loguru的二次格式化）
            log_message = "Request failed | {} {} | Error: {} | Time: {:.4f}s".format(
                method, url, error_msg.replace('{', '{{').replace('}', '}}'), process_time
            )
            logger.error(log_message)

            # 返回错误响应
            return JSONResponse(
                status_code=500,
                content={
                    "error": "Internal Server Error",
                    "message": str(exc),
                    "request_id": request_id,
                },
                headers={
                    "X-Request-ID": request_id,
                    "X-Process-Time": f"{process_time:.4f}",
                },
            )


class RequestLoggingMiddleware(BaseHTTPMiddleware):
    """
    请求详细日志中间件（可选）
    
    记录请求体、响应体等详细信息（仅用于调试）
    """

    def __init__(self, app: ASGIApp, log_request_body: bool = False, log_response_body: bool = False):
        """
        初始化请求详细日志中间件

        Args:
            app: ASGI 应用
            log_request_body: 是否记录请求体
            log_response_body: 是否记录响应体
        """
        super().__init__(app)
        self.log_request_body = log_request_body
        self.log_response_body = log_response_body

    async def dispatch(self, request: Request, call_next: Callable) -> Response:
        """
        处理请求并记录详细日志

        Args:
            request: 请求对象
            call_next: 下一个中间件或路由处理器

        Returns:
            响应对象
        """
        request_id = getattr(request.state, "request_id", str(uuid4()))

        # 记录请求体（如果启用）
        if self.log_request_body:
            try:
                body = await request.body()
                if body:
                    logger.debug(
                        f"Request body | {request.method} {request.url}",
                        extra={
                            "request_id": request_id,
                            "body": body.decode("utf-8")[:1000],  # 限制长度
                        },
                    )
            except Exception as e:
                logger.warning(f"Failed to read request body: {e}")

        # 处理请求
        response = await call_next(request)

        # 记录响应体（如果启用）
        if self.log_response_body:
            # 注意：这会影响性能，仅用于调试
            logger.debug(
                f"Response | {request.method} {request.url} | Status: {response.status_code}",
                extra={
                    "request_id": request_id,
                    "status_code": response.status_code,
                },
            )

        return response


def log_request_info(request: Request) -> dict:
    """
    提取请求信息用于日志记录

    Args:
        request: 请求对象

    Returns:
        请求信息字典
    """
    return {
        "method": request.method,
        "url": str(request.url),
        "path": request.url.path,
        "query_params": dict(request.query_params),
        "headers": dict(request.headers),
        "client_host": request.client.host if request.client else None,
        "client_port": request.client.port if request.client else None,
    }


def log_response_info(response: Response) -> dict:
    """
    提取响应信息用于日志记录

    Args:
        response: 响应对象

    Returns:
        响应信息字典
    """
    return {
        "status_code": response.status_code,
        "headers": dict(response.headers),
    }


def setup_request_logging(app: ASGIApp, detailed: bool = False) -> None:
    """
    配置请求日志中间件

    Args:
        app: FastAPI 应用
        detailed: 是否启用详细日志（包括请求体/响应体）
    """
    # 添加基础日志中间件
    app.add_middleware(LoggingMiddleware)

    # 添加详细日志中间件（仅开发环境）
    if detailed:
        app.add_middleware(
            RequestLoggingMiddleware,
            log_request_body=True,
            log_response_body=False,
        )

    logger.info("Request logging middleware configured")

