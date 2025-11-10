"""
日志配置
使用 loguru 进行结构化日志记录
"""
import sys
from loguru import logger
from app.core.config import settings


def setup_logging():
    """配置日志系统"""
    # 移除默认的 logger
    logger.remove()

    # 根据环境配置日志格式
    if settings.LOG_FORMAT == "json":
        # 生产环境使用 JSON 格式（简化以避免格式化冲突）
        log_format = (
            '<green>{time:YYYY-MM-DD HH:mm:ss.SSS}</green> | '
            '<level>{level: <8}</level> | '
            '{name}:{function}:{line} | '
            '<level>{message}</level>'
        )
    else:
        # 开发环境使用可读格式
        log_format = (
            "<green>{time:YYYY-MM-DD HH:mm:ss.SSS}</green> | "
            "<level>{level: <8}</level> | "
            "<cyan>{name}</cyan>:<cyan>{function}</cyan>:<cyan>{line}</cyan> | "
            "<level>{message}</level>"
        )

    # 添加控制台输出
    logger.add(
        sys.stdout,
        format=log_format,
        level=settings.LOG_LEVEL,
        colorize=settings.LOG_FORMAT != "json",
    )

    # 添加文件输出（开发和生产环境都写入）
    # 确保 logs 目录存在
    import os
    os.makedirs("logs", exist_ok=True)
    
    logger.add(
        "logs/app.log",
        format=log_format,
        level=settings.LOG_LEVEL,
        rotation="500 MB" if not settings.DEBUG else "100 MB",  # 开发环境使用较小的轮转大小
        retention="10 days" if not settings.DEBUG else "3 days",  # 开发环境保留较短时间
        compression="zip" if not settings.DEBUG else None,  # 开发环境不压缩
    )

    return logger


