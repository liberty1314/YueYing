"""
数据验证工具

提供常用的数据验证函数
"""
import re
from typing import Any, Optional
from email_validator import validate_email as validate_email_lib, EmailNotValidError


def is_valid_email(email: str) -> bool:
    """
    验证邮箱格式
    
    Args:
        email: 邮箱地址
    
    Returns:
        是否有效
    
    Examples:
        >>> is_valid_email("user@example.com")
        True
        >>> is_valid_email("invalid")
        False
    """
    try:
        validate_email_lib(email)
        return True
    except EmailNotValidError:
        return False


def is_valid_username(username: str, min_length: int = 3, max_length: int = 20) -> tuple[bool, str]:
    """
    验证用户名格式
    
    Args:
        username: 用户名
        min_length: 最小长度
        max_length: 最大长度
    
    Returns:
        (是否有效, 错误消息)
    
    Examples:
        >>> is_valid_username("user123")
        (True, "")
        >>> is_valid_username("ab")
        (False, "用户名长度必须在 3-20 之间")
    """
    if not username:
        return False, "用户名不能为空"
    
    if len(username) < min_length or len(username) > max_length:
        return False, f"用户名长度必须在 {min_length}-{max_length} 之间"
    
    if not re.match(r'^[a-zA-Z0-9_]+$', username):
        return False, "用户名只能包含字母、数字和下划线"
    
    return True, ""


def is_valid_password(password: str, min_length: int = 8) -> tuple[bool, str]:
    """
    验证密码强度
    
    Args:
        password: 密码
        min_length: 最小长度
    
    Returns:
        (是否有效, 消息)
    
    Examples:
        >>> is_valid_password("Abc123!@#")
        (True, "密码强度：强")
        >>> is_valid_password("123")
        (False, "密码长度至少为 8 位")
    """
    if len(password) < min_length:
        return False, f"密码长度至少为 {min_length} 位"
    
    strength = 0
    
    # 包含小写字母
    if re.search(r'[a-z]', password):
        strength += 1
    # 包含大写字母
    if re.search(r'[A-Z]', password):
        strength += 1
    # 包含数字
    if re.search(r'\d', password):
        strength += 1
    # 包含特殊字符
    if re.search(r'[!@#$%^&*(),.?":{}|<>]', password):
        strength += 1
    
    if strength <= 1:
        return False, "密码强度：弱（建议包含大小写字母、数字和特殊字符）"
    
    if strength == 2:
        return True, "密码强度：中等"
    
    return True, "密码强度：强"


def is_in_range(value: float, min_value: float, max_value: float) -> bool:
    """
    验证数值是否在范围内
    
    Args:
        value: 数值
        min_value: 最小值
        max_value: 最大值
    
    Returns:
        是否在范围内
    
    Examples:
        >>> is_in_range(5, 1, 10)
        True
        >>> is_in_range(15, 1, 10)
        False
    """
    return min_value <= value <= max_value


def validate_rating(rating: float) -> tuple[bool, str]:
    """
    验证评分范围（0-10）
    
    Args:
        rating: 评分
    
    Returns:
        (是否有效, 错误消息)
    
    Examples:
        >>> validate_rating(8.5)
        (True, "")
        >>> validate_rating(11)
        (False, "评分必须在 0-10 之间")
    """
    if not isinstance(rating, (int, float)):
        return False, "评分必须是数字"
    
    if not is_in_range(rating, 0, 10):
        return False, "评分必须在 0-10 之间"
    
    return True, ""


def validate_length(
    text: str,
    min_length: Optional[int] = None,
    max_length: Optional[int] = None
) -> tuple[bool, str]:
    """
    验证字符串长度
    
    Args:
        text: 字符串
        min_length: 最小长度
        max_length: 最大长度
    
    Returns:
        (是否有效, 错误消息)
    
    Examples:
        >>> validate_length("hello", 1, 10)
        (True, "")
        >>> validate_length("hello", 10, 20)
        (False, "长度必须在 10-20 之间")
    """
    length = len(text)
    
    if min_length is not None and length < min_length:
        if max_length is not None:
            return False, f"长度必须在 {min_length}-{max_length} 之间"
        return False, f"长度至少为 {min_length}"
    
    if max_length is not None and length > max_length:
        if min_length is not None:
            return False, f"长度必须在 {min_length}-{max_length} 之间"
        return False, f"长度最多为 {max_length}"
    
    return True, ""


def is_empty(value: Any) -> bool:
    """
    检查值是否为空
    
    Args:
        value: 任意值
    
    Returns:
        是否为空
    
    Examples:
        >>> is_empty("")
        True
        >>> is_empty("  ")
        True
        >>> is_empty("hello")
        False
        >>> is_empty(None)
        True
        >>> is_empty([])
        True
    """
    if value is None:
        return True
    
    if isinstance(value, str):
        return len(value.strip()) == 0
    
    if isinstance(value, (list, dict, tuple, set)):
        return len(value) == 0
    
    return False


def sanitize_string(text: str, max_length: Optional[int] = None) -> str:
    """
    清理字符串（移除多余空格、限制长度）
    
    Args:
        text: 字符串
        max_length: 最大长度
    
    Returns:
        清理后的字符串
    
    Examples:
        >>> sanitize_string("  hello   world  ")
        "hello world"
        >>> sanitize_string("hello world", 5)
        "hello"
    """
    # 移除首尾空格
    text = text.strip()
    
    # 将多个空格替换为单个空格
    text = re.sub(r'\s+', ' ', text)
    
    # 限制长度
    if max_length and len(text) > max_length:
        text = text[:max_length]
    
    return text


def validate_url(url: str) -> tuple[bool, str]:
    """
    验证URL格式
    
    Args:
        url: URL地址
    
    Returns:
        (是否有效, 错误消息)
    
    Examples:
        >>> validate_url("https://example.com")
        (True, "")
        >>> validate_url("invalid")
        (False, "URL格式不正确")
    """
    url_pattern = re.compile(
        r'^https?://'  # http:// or https://
        r'(?:(?:[A-Z0-9](?:[A-Z0-9-]{0,61}[A-Z0-9])?\.)+[A-Z]{2,6}\.?|'  # domain...
        r'localhost|'  # localhost...
        r'\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3})'  # ...or ip
        r'(?::\d+)?'  # optional port
        r'(?:/?|[/?]\S+)$', re.IGNORECASE
    )
    
    if url_pattern.match(url):
        return True, ""
    
    return False, "URL格式不正确"


def validate_content_type(content_type: str) -> tuple[bool, str]:
    """
    验证内容类型
    
    Args:
        content_type: 内容类型
    
    Returns:
        (是否有效, 错误消息)
    
    Examples:
        >>> validate_content_type("movie")
        (True, "")
        >>> validate_content_type("invalid")
        (False, "无效的内容类型")
    """
    valid_types = ["movie", "tv", "anime", "game", "book"]
    
    if content_type not in valid_types:
        return False, f"无效的内容类型，必须是以下之一：{', '.join(valid_types)}"
    
    return True, ""


def validate_status(status: str) -> tuple[bool, str]:
    """
    验证状态
    
    Args:
        status: 状态
    
    Returns:
        (是否有效, 错误消息)
    
    Examples:
        >>> validate_status("watching")
        (True, "")
        >>> validate_status("invalid")
        (False, "无效的状态")
    """
    valid_statuses = ["want_to_watch", "watching", "completed", "on_hold", "dropped"]
    
    if status not in valid_statuses:
        return False, f"无效的状态，必须是以下之一：{', '.join(valid_statuses)}"
    
    return True, ""
