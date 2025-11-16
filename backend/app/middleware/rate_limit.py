"""
速率限制中间件

使用 SlowAPI 为 API 端点添加速率限制，防止滥用和暴力破解
"""
from slowapi import Limiter, _rate_limit_exceeded_handler
from slowapi.util import get_remote_address
from slowapi.errors import RateLimitExceeded
from fastapi import Request
from loguru import logger

from app.core.config import settings


# 创建速率限制器
limiter = Limiter(
    key_func=get_remote_address,
    default_limits=[
        f"{settings.RATE_LIMIT_PER_MINUTE}/minute",
        f"{settings.RATE_LIMIT_PER_HOUR}/hour"
    ],
    storage_uri=settings.REDIS_URL,
    strategy="fixed-window",
)


def get_rate_limiter() -> Limiter:
    """获取速率限制器实例"""
    return limiter


# 自定义速率限制装饰器
def rate_limit_auth(limit: str = "5/minute"):
    """
    认证端点的速率限制装饰器
    
    Args:
        limit: 速率限制字符串，例如 "5/minute" 或 "20/hour"
    
    Usage:
        @router.post("/login")
        @rate_limit_auth("5/minute")
        async def login(...):
            ...
    """
    return limiter.limit(limit)


def rate_limit_api(limit: str = None):
    """
    通用 API 端点的速率限制装饰器
    
    Args:
        limit: 速率限制字符串，如果为 None 则使用默认限制
    
    Usage:
        @router.get("/items")
        @rate_limit_api("100/minute")
        async def get_items(...):
            ...
    """
    if limit:
        return limiter.limit(limit)
    return limiter.limit(
        f"{settings.RATE_LIMIT_PER_MINUTE}/minute",
        f"{settings.RATE_LIMIT_PER_HOUR}/hour"
    )


# 速率限制异常处理器
async def rate_limit_handler(request: Request, exc: RateLimitExceeded):
    """
    处理速率限制超出异常
    
    返回友好的错误消息和重试时间
    """
    logger.warning(
        f"速率限制触发: {request.client.host} 访问 {request.url.path} "
        f"超出限制 {exc.detail}"
    )
    
    return {
        "error": "rate_limit_exceeded",
        "message": "请求过于频繁，请稍后再试",
        "detail": exc.detail,
        "retry_after": getattr(exc, "retry_after", None),
    }


# 配置说明
"""
速率限制配置说明：

1. 全局默认限制：
   - 每分钟: RATE_LIMIT_PER_MINUTE (默认 60)
   - 每小时: RATE_LIMIT_PER_HOUR (默认 1000)

2. 认证端点限制（防止暴力破解）：
   - 登录: 5 次/分钟
   - 注册: 3 次/分钟
   - 密码重置: 3 次/分钟

3. 自定义限制示例：
   - 搜索: 30 次/分钟
   - 文件上传: 10 次/分钟
   - AI 功能: 20 次/分钟

4. 存储：
   - 使用 Redis 存储速率限制计数器
   - 自动过期，不占用过多内存

5. 策略：
   - fixed-window: 固定时间窗口
   - 简单高效，适合大多数场景

6. 豁免：
   - 健康检查端点不受限制
   - 静态文件不受限制
   - 可以为特定 IP 或用户设置白名单
"""
