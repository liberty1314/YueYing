"""
自定义异常类
"""


class NotFoundError(Exception):
    """资源未找到异常"""
    pass


class ConflictError(Exception):
    """资源冲突异常（如重复创建）"""
    pass


class ValidationError(Exception):
    """数据验证异常"""
    pass


class UnauthorizedError(Exception):
    """未授权异常"""
    pass


class ForbiddenError(Exception):
    """禁止访问异常"""
    pass


class APIError(Exception):
    """外部 API 调用异常"""
    pass


class ConfigurationError(Exception):
    """配置错误异常"""
    pass

