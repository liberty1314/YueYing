"""
统一的错误处理工具

提供可复用的错误处理函数，减少路由中的重复代码
"""
from fastapi import HTTPException, status
from sqlalchemy.exc import SQLAlchemyError, IntegrityError
from pydantic import ValidationError
from loguru import logger
from typing import Any, Optional, Callable
import functools


def handle_service_error(
    error: Exception,
    default_message: str = "操作失败",
    log_error: bool = True
) -> HTTPException:
    """
    处理服务层错误，转换为适当的 HTTP 异常
    
    Args:
        error: 捕获的异常
        default_message: 默认错误消息
        log_error: 是否记录错误日志
    
    Returns:
        HTTPException: 格式化的 HTTP 异常
    
    Examples:
        try:
            result = service.do_something()
        except Exception as e:
            raise handle_service_error(e, "无法执行操作")
    """
    if log_error:
        logger.error(f"Service error: {type(error).__name__}: {str(error)}")
    
    # 数据库完整性错误（如唯一约束冲突）
    if isinstance(error, IntegrityError):
        return HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="数据冲突，该记录可能已存在"
        )
    
    # 其他数据库错误
    if isinstance(error, SQLAlchemyError):
        return HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="数据库操作失败"
        )
    
    # 验证错误
    if isinstance(error, ValidationError):
        return HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail=str(error)
        )
    
    # HTTP 异常直接返回
    if isinstance(error, HTTPException):
        return error
    
    # 其他未知错误
    return HTTPException(
        status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
        detail=default_message
    )


def handle_validation_error(
    error: ValidationError,
    context: str = ""
) -> HTTPException:
    """
    处理 Pydantic 验证错误
    
    Args:
        error: Pydantic 验证错误
        context: 错误上下文描述
    
    Returns:
        HTTPException: 格式化的验证错误异常
    
    Examples:
        try:
            data = UserCreate(**request_data)
        except ValidationError as e:
            raise handle_validation_error(e, "用户注册")
    """
    logger.warning(f"Validation error in {context}: {error}")
    
    # 提取错误详情
    errors = []
    for err in error.errors():
        field = " -> ".join(str(loc) for loc in err["loc"])
        message = err["msg"]
        errors.append(f"{field}: {message}")
    
    return HTTPException(
        status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
        detail={
            "message": "数据验证失败",
            "errors": errors
        }
    )


def handle_not_found_error(
    resource_type: str,
    resource_id: Any,
    additional_info: Optional[str] = None
) -> HTTPException:
    """
    处理资源未找到错误
    
    Args:
        resource_type: 资源类型（如 "用户", "记录"）
        resource_id: 资源ID
        additional_info: 额外信息
    
    Returns:
        HTTPException: 404 错误
    
    Examples:
        if not user:
            raise handle_not_found_error("用户", user_id)
    """
    message = f"{resource_type} (ID: {resource_id}) 不存在"
    if additional_info:
        message += f" - {additional_info}"
    
    logger.warning(f"Resource not found: {message}")
    
    return HTTPException(
        status_code=status.HTTP_404_NOT_FOUND,
        detail=message
    )


def handle_permission_error(
    action: str,
    resource: str = "",
    reason: Optional[str] = None
) -> HTTPException:
    """
    处理权限错误
    
    Args:
        action: 尝试执行的操作
        resource: 资源描述
        reason: 拒绝原因
    
    Returns:
        HTTPException: 403 错误
    
    Examples:
        if user.id != item.user_id:
            raise handle_permission_error("修改", "该记录")
    """
    message = f"无权{action}"
    if resource:
        message += f" {resource}"
    if reason:
        message += f": {reason}"
    
    logger.warning(f"Permission denied: {message}")
    
    return HTTPException(
        status_code=status.HTTP_403_FORBIDDEN,
        detail=message
    )


def with_error_handling(
    default_message: str = "操作失败",
    log_errors: bool = True
):
    """
    装饰器：为函数添加统一的错误处理
    
    Args:
        default_message: 默认错误消息
        log_errors: 是否记录错误
    
    Returns:
        装饰器函数
    
    Examples:
        @with_error_handling("无法获取用户列表")
        async def get_users(db: Session):
            return db.query(User).all()
    """
    def decorator(func: Callable):
        @functools.wraps(func)
        async def async_wrapper(*args, **kwargs):
            try:
                return await func(*args, **kwargs)
            except HTTPException:
                raise
            except Exception as e:
                raise handle_service_error(e, default_message, log_errors)
        
        @functools.wraps(func)
        def sync_wrapper(*args, **kwargs):
            try:
                return func(*args, **kwargs)
            except HTTPException:
                raise
            except Exception as e:
                raise handle_service_error(e, default_message, log_errors)
        
        # 根据函数类型返回对应的包装器
        if functools.iscoroutinefunction(func):
            return async_wrapper
        else:
            return sync_wrapper
    
    return decorator


def create_error_response(
    status_code: int,
    message: str,
    details: Optional[dict] = None
) -> dict:
    """
    创建标准化的错误响应
    
    Args:
        status_code: HTTP 状态码
        message: 错误消息
        details: 额外的错误详情
    
    Returns:
        标准化的错误响应字典
    
    Examples:
        return create_error_response(400, "参数错误", {"field": "email"})
    """
    response = {
        "error": True,
        "status_code": status_code,
        "message": message
    }
    
    if details:
        response["details"] = details
    
    return response


# 常用错误快捷方式
def bad_request(message: str = "请求参数错误") -> HTTPException:
    """400 错误"""
    return HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=message)


def unauthorized(message: str = "未授权") -> HTTPException:
    """401 错误"""
    return HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail=message,
        headers={"WWW-Authenticate": "Bearer"}
    )


def forbidden(message: str = "禁止访问") -> HTTPException:
    """403 错误"""
    return HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail=message)


def not_found(message: str = "资源不存在") -> HTTPException:
    """404 错误"""
    return HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=message)


def conflict(message: str = "资源冲突") -> HTTPException:
    """409 错误"""
    return HTTPException(status_code=status.HTTP_409_CONFLICT, detail=message)


def internal_error(message: str = "服务器内部错误") -> HTTPException:
    """500 错误"""
    return HTTPException(
        status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
        detail=message
    )
