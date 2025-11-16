"""
统一错误处理装饰器

提供一致的API错误响应格式和日志记录
"""
from functools import wraps
from typing import Callable, Optional, Type, Union
from fastapi import HTTPException, status
from loguru import logger
from sqlalchemy.exc import SQLAlchemyError, IntegrityError
from pydantic import ValidationError


class APIError(Exception):
    """自定义API错误基类"""
    def __init__(
        self,
        message: str,
        status_code: int = status.HTTP_500_INTERNAL_SERVER_ERROR,
        error_code: Optional[str] = None,
        details: Optional[dict] = None
    ):
        self.message = message
        self.status_code = status_code
        self.error_code = error_code or "INTERNAL_ERROR"
        self.details = details or {}
        super().__init__(self.message)


class NotFoundError(APIError):
    """资源未找到错误"""
    def __init__(self, message: str = "资源未找到", details: Optional[dict] = None):
        super().__init__(
            message=message,
            status_code=status.HTTP_404_NOT_FOUND,
            error_code="NOT_FOUND",
            details=details
        )


class ValidationError(APIError):
    """数据验证错误"""
    def __init__(self, message: str = "数据验证失败", details: Optional[dict] = None):
        super().__init__(
            message=message,
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            error_code="VALIDATION_ERROR",
            details=details
        )


class UnauthorizedError(APIError):
    """未授权错误"""
    def __init__(self, message: str = "未授权访问", details: Optional[dict] = None):
        super().__init__(
            message=message,
            status_code=status.HTTP_401_UNAUTHORIZED,
            error_code="UNAUTHORIZED",
            details=details
        )


class ForbiddenError(APIError):
    """禁止访问错误"""
    def __init__(self, message: str = "禁止访问", details: Optional[dict] = None):
        super().__init__(
            message=message,
            status_code=status.HTTP_403_FORBIDDEN,
            error_code="FORBIDDEN",
            details=details
        )


class ConflictError(APIError):
    """资源冲突错误"""
    def __init__(self, message: str = "资源冲突", details: Optional[dict] = None):
        super().__init__(
            message=message,
            status_code=status.HTTP_409_CONFLICT,
            error_code="CONFLICT",
            details=details
        )


def handle_api_errors(
    error_message: Optional[str] = None,
    log_level: str = "error",
    include_traceback: bool = False
):
    """
    API错误处理装饰器
    
    统一处理API端点的异常，提供一致的错误响应格式
    
    Args:
        error_message: 自定义错误消息（可选）
        log_level: 日志级别 (debug, info, warning, error, critical)
        include_traceback: 是否在响应中包含堆栈跟踪（仅开发环境）
    
    Usage:
        @router.get("/items")
        @handle_api_errors("获取项目列表失败")
        async def get_items():
            ...
    
    Returns:
        装饰后的函数
    """
    def decorator(func: Callable):
        @wraps(func)
        async def async_wrapper(*args, **kwargs):
            try:
                return await func(*args, **kwargs)
            
            except APIError as e:
                # 自定义API错误
                log_func = getattr(logger, log_level)
                log_func(f"{error_message or func.__name__}: {e.message}")
                
                raise HTTPException(
                    status_code=e.status_code,
                    detail={
                        "error": e.error_code,
                        "message": e.message,
                        "details": e.details
                    }
                )
            
            except HTTPException:
                # FastAPI的HTTPException直接抛出
                raise
            
            except IntegrityError as e:
                # 数据库完整性错误（如唯一约束冲突）
                logger.error(f"{error_message or func.__name__}: Database integrity error - {str(e)}")
                
                raise HTTPException(
                    status_code=status.HTTP_409_CONFLICT,
                    detail={
                        "error": "CONFLICT",
                        "message": "数据冲突，可能是重复的记录",
                        "details": {"db_error": str(e.orig) if hasattr(e, 'orig') else str(e)}
                    }
                )
            
            except SQLAlchemyError as e:
                # 其他数据库错误
                logger.error(f"{error_message or func.__name__}: Database error - {str(e)}")
                
                raise HTTPException(
                    status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                    detail={
                        "error": "DATABASE_ERROR",
                        "message": "数据库操作失败",
                        "details": {"db_error": str(e)}
                    }
                )
            
            except ValidationError as e:
                # Pydantic验证错误
                logger.warning(f"{error_message or func.__name__}: Validation error - {str(e)}")
                
                raise HTTPException(
                    status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
                    detail={
                        "error": "VALIDATION_ERROR",
                        "message": "数据验证失败",
                        "details": {"validation_errors": str(e)}
                    }
                )
            
            except Exception as e:
                # 未预期的错误
                logger.exception(f"{error_message or func.__name__}: Unexpected error - {str(e)}")
                
                error_detail = {
                    "error": "INTERNAL_ERROR",
                    "message": error_message or "操作失败",
                    "details": {}
                }
                
                # 在开发环境中包含详细错误信息
                if include_traceback:
                    import traceback
                    error_detail["details"]["traceback"] = traceback.format_exc()
                    error_detail["details"]["exception_type"] = type(e).__name__
                    error_detail["details"]["exception_message"] = str(e)
                
                raise HTTPException(
                    status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                    detail=error_detail
                )
        
        @wraps(func)
        def sync_wrapper(*args, **kwargs):
            try:
                return func(*args, **kwargs)
            
            except APIError as e:
                log_func = getattr(logger, log_level)
                log_func(f"{error_message or func.__name__}: {e.message}")
                
                raise HTTPException(
                    status_code=e.status_code,
                    detail={
                        "error": e.error_code,
                        "message": e.message,
                        "details": e.details
                    }
                )
            
            except HTTPException:
                raise
            
            except IntegrityError as e:
                logger.error(f"{error_message or func.__name__}: Database integrity error - {str(e)}")
                
                raise HTTPException(
                    status_code=status.HTTP_409_CONFLICT,
                    detail={
                        "error": "CONFLICT",
                        "message": "数据冲突，可能是重复的记录",
                        "details": {"db_error": str(e.orig) if hasattr(e, 'orig') else str(e)}
                    }
                )
            
            except SQLAlchemyError as e:
                logger.error(f"{error_message or func.__name__}: Database error - {str(e)}")
                
                raise HTTPException(
                    status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                    detail={
                        "error": "DATABASE_ERROR",
                        "message": "数据库操作失败",
                        "details": {"db_error": str(e)}
                    }
                )
            
            except Exception as e:
                logger.exception(f"{error_message or func.__name__}: Unexpected error - {str(e)}")
                
                error_detail = {
                    "error": "INTERNAL_ERROR",
                    "message": error_message or "操作失败",
                    "details": {}
                }
                
                if include_traceback:
                    import traceback
                    error_detail["details"]["traceback"] = traceback.format_exc()
                    error_detail["details"]["exception_type"] = type(e).__name__
                    error_detail["details"]["exception_message"] = str(e)
                
                raise HTTPException(
                    status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                    detail=error_detail
                )
        
        # 根据函数类型返回对应的wrapper
        import asyncio
        if asyncio.iscoroutinefunction(func):
            return async_wrapper
        else:
            return sync_wrapper
    
    return decorator


def handle_not_found(resource_name: str = "资源"):
    """
    资源未找到错误处理装饰器
    
    Usage:
        @router.get("/items/{item_id}")
        @handle_not_found("项目")
        async def get_item(item_id: int):
            item = get_item_from_db(item_id)
            if not item:
                raise NotFoundError(f"项目 {item_id} 不存在")
            return item
    """
    return handle_api_errors(
        error_message=f"{resource_name}未找到",
        log_level="warning"
    )


def handle_validation_errors(operation: str = "操作"):
    """
    数据验证错误处理装饰器
    
    Usage:
        @router.post("/items")
        @handle_validation_errors("创建项目")
        async def create_item(item: ItemCreate):
            ...
    """
    return handle_api_errors(
        error_message=f"{operation}数据验证失败",
        log_level="warning"
    )


# 便捷的错误抛出函数
def raise_not_found(message: str, details: Optional[dict] = None):
    """抛出404错误"""
    raise NotFoundError(message, details)


def raise_validation_error(message: str, details: Optional[dict] = None):
    """抛出422验证错误"""
    raise ValidationError(message, details)


def raise_unauthorized(message: str = "未授权访问", details: Optional[dict] = None):
    """抛出401未授权错误"""
    raise UnauthorizedError(message, details)


def raise_forbidden(message: str = "禁止访问", details: Optional[dict] = None):
    """抛出403禁止访问错误"""
    raise ForbiddenError(message, details)


def raise_conflict(message: str = "资源冲突", details: Optional[dict] = None):
    """抛出409冲突错误"""
    raise ConflictError(message, details)
