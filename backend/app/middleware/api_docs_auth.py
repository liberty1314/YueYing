"""
API 文档认证中间件

为 API 文档端点添加可选的基本认证保护
"""
import base64
from fastapi import Request, HTTPException, status
from fastapi.responses import Response
from starlette.middleware.base import BaseHTTPMiddleware
from loguru import logger

from app.core.config import settings


class APIDocsAuthMiddleware(BaseHTTPMiddleware):
    """
    API 文档认证中间件
    
    如果配置了 API_DOCS_USERNAME 和 API_DOCS_PASSWORD，
    则要求访问 /docs、/redoc 和 /openapi.json 时进行基本认证
    """
    
    PROTECTED_PATHS = ["/docs", "/redoc", "/openapi.json"]
    
    async def dispatch(self, request: Request, call_next):
        """处理请求"""
        # 检查是否是受保护的路径
        if not any(request.url.path.startswith(path) for path in self.PROTECTED_PATHS):
            return await call_next(request)
        
        # 如果未配置认证，直接放行
        if not settings.API_DOCS_USERNAME or not settings.API_DOCS_PASSWORD:
            return await call_next(request)
        
        # 检查 Authorization 头
        auth_header = request.headers.get("Authorization")
        
        if not auth_header or not auth_header.startswith("Basic "):
            return self._unauthorized_response()
        
        try:
            # 解码 Base64 编码的凭据
            encoded_credentials = auth_header.split(" ")[1]
            decoded_credentials = base64.b64decode(encoded_credentials).decode("utf-8")
            username, password = decoded_credentials.split(":", 1)
            
            # 验证凭据
            if username == settings.API_DOCS_USERNAME and password == settings.API_DOCS_PASSWORD:
                return await call_next(request)
            else:
                logger.warning(f"API 文档认证失败: 用户名或密码错误 (用户: {username})")
                return self._unauthorized_response()
                
        except Exception as e:
            logger.error(f"API 文档认证错误: {e}")
            return self._unauthorized_response()
    
    def _unauthorized_response(self) -> Response:
        """返回 401 未授权响应"""
        return Response(
            content="需要认证才能访问 API 文档",
            status_code=status.HTTP_401_UNAUTHORIZED,
            headers={"WWW-Authenticate": 'Basic realm="API Documentation"'},
        )
