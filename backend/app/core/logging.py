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
        # 生产环境使用 JSON 格式
        log_format = (
            "{{"
            '"time": "{{time:YYYY-MM-DD HH:mm:ss.SSS}}", '
            '"level": "{{level}}", '
            '"message": "{{message}}", '
            '"file": "{{file}}", '
            '"function": "{{function}}", '
            '"line": {{line}}'
            "}}"
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

    # 添加文件输出（如果是生产环境）
    if not settings.DEBUG:
        logger.add(
            "logs/app.log",
            format=log_format,
            level=settings.LOG_LEVEL,
            rotation="500 MB",  # 文件大小达到 500MB 时轮转
            retention="10 days",  # 保留 10 天的日志
            compression="zip",  # 压缩旧日志
        )

    return logger


