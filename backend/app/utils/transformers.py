"""
数据转换工具

提供常用的数据转换函数
"""
from typing import Any, Dict, List, Optional, TypeVar
from datetime import datetime
import re

T = TypeVar('T')


def to_int(value: Any, default: int = 0) -> int:
    """
    转换为整数
    
    Args:
        value: 任意值
        default: 默认值
    
    Returns:
        整数
    
    Examples:
        >>> to_int("123")
        123
        >>> to_int("abc", 0)
        0
    """
    try:
        return int(value)
    except (ValueError, TypeError):
        return default


def to_float(value: Any, default: float = 0.0) -> float:
    """
    转换为浮点数
    
    Args:
        value: 任意值
        default: 默认值
    
    Returns:
        浮点数
    
    Examples:
        >>> to_float("123.45")
        123.45
        >>> to_float("abc", 0.0)
        0.0
    """
    try:
        return float(value)
    except (ValueError, TypeError):
        return default


def to_bool(value: Any) -> bool:
    """
    转换为布尔值
    
    Args:
        value: 任意值
    
    Returns:
        布尔值
    
    Examples:
        >>> to_bool("true")
        True
        >>> to_bool("false")
        False
        >>> to_bool(1)
        True
        >>> to_bool(0)
        False
    """
    if isinstance(value, bool):
        return value
    
    if isinstance(value, str):
        return value.lower() in ('true', '1', 'yes', 'on')
    
    if isinstance(value, (int, float)):
        return value != 0
    
    return bool(value)


def to_snake_case(text: str) -> str:
    """
    转换为下划线命名
    
    Args:
        text: 字符串
    
    Returns:
        下划线命名字符串
    
    Examples:
        >>> to_snake_case("helloWorld")
        "hello_world"
        >>> to_snake_case("HelloWorld")
        "hello_world"
    """
    # 在大写字母前插入下划线
    text = re.sub('(.)([A-Z][a-z]+)', r'\1_\2', text)
    # 在小写字母和大写字母之间插入下划线
    text = re.sub('([a-z0-9])([A-Z])', r'\1_\2', text)
    # 转换为小写
    return text.lower()


def to_camel_case(text: str) -> str:
    """
    转换为驼峰命名
    
    Args:
        text: 字符串
    
    Returns:
        驼峰命名字符串
    
    Examples:
        >>> to_camel_case("hello_world")
        "helloWorld"
        >>> to_camel_case("hello-world")
        "helloWorld"
    """
    components = re.split(r'[-_]', text)
    return components[0] + ''.join(x.title() for x in components[1:])


def truncate_string(text: str, max_length: int, suffix: str = "...") -> str:
    """
    截断字符串
    
    Args:
        text: 字符串
        max_length: 最大长度
        suffix: 后缀
    
    Returns:
        截断后的字符串
    
    Examples:
        >>> truncate_string("Hello World", 5)
        "Hello..."
        >>> truncate_string("Hello", 10)
        "Hello"
    """
    if len(text) <= max_length:
        return text
    
    return text[:max_length] + suffix


def strip_html_tags(html: str) -> str:
    """
    移除HTML标签
    
    Args:
        html: HTML字符串
    
    Returns:
        纯文本
    
    Examples:
        >>> strip_html_tags("<p>Hello</p>")
        "Hello"
        >>> strip_html_tags("<div>Hello <b>World</b></div>")
        "Hello World"
    """
    return re.sub(r'<[^>]+>', '', html)


def format_number(num: float, decimals: Optional[int] = None) -> str:
    """
    格式化数字（添加千分位）
    
    Args:
        num: 数字
        decimals: 小数位数
    
    Returns:
        格式化后的字符串
    
    Examples:
        >>> format_number(1234567)
        "1,234,567"
        >>> format_number(1234.5678, 2)
        "1,234.57"
    """
    if decimals is not None:
        num = round(num, decimals)
        return f"{num:,.{decimals}f}"
    
    if isinstance(num, int):
        return f"{num:,}"
    
    return f"{num:,}"


def dict_to_snake_case(data: Dict[str, Any]) -> Dict[str, Any]:
    """
    将字典的键转换为下划线命名
    
    Args:
        data: 字典
    
    Returns:
        转换后的字典
    
    Examples:
        >>> dict_to_snake_case({"firstName": "John", "lastName": "Doe"})
        {"first_name": "John", "last_name": "Doe"}
    """
    return {to_snake_case(k): v for k, v in data.items()}


def dict_to_camel_case(data: Dict[str, Any]) -> Dict[str, Any]:
    """
    将字典的键转换为驼峰命名
    
    Args:
        data: 字典
    
    Returns:
        转换后的字典
    
    Examples:
        >>> dict_to_camel_case({"first_name": "John", "last_name": "Doe"})
        {"firstName": "John", "lastName": "Doe"}
    """
    return {to_camel_case(k): v for k, v in data.items()}


def flatten_dict(data: Dict[str, Any], parent_key: str = '', sep: str = '.') -> Dict[str, Any]:
    """
    展平嵌套字典
    
    Args:
        data: 嵌套字典
        parent_key: 父键
        sep: 分隔符
    
    Returns:
        展平后的字典
    
    Examples:
        >>> flatten_dict({"a": {"b": {"c": 1}}})
        {"a.b.c": 1}
    """
    items: List[tuple] = []
    
    for k, v in data.items():
        new_key = f"{parent_key}{sep}{k}" if parent_key else k
        
        if isinstance(v, dict):
            items.extend(flatten_dict(v, new_key, sep=sep).items())
        else:
            items.append((new_key, v))
    
    return dict(items)


def group_by(items: List[T], key: str) -> Dict[Any, List[T]]:
    """
    按键分组
    
    Args:
        items: 项目列表
        key: 分组键
    
    Returns:
        分组后的字典
    
    Examples:
        >>> items = [
        ...     {"type": "movie", "name": "A"},
        ...     {"type": "book", "name": "B"},
        ...     {"type": "movie", "name": "C"}
        ... ]
        >>> group_by(items, "type")
        {"movie": [...], "book": [...]}
    """
    groups: Dict[Any, List[T]] = {}
    
    for item in items:
        if isinstance(item, dict):
            group_key = item.get(key)
        else:
            group_key = getattr(item, key, None)
        
        if group_key not in groups:
            groups[group_key] = []
        
        groups[group_key].append(item)
    
    return groups


def remove_none_values(data: Dict[str, Any]) -> Dict[str, Any]:
    """
    移除字典中的 None 值
    
    Args:
        data: 字典
    
    Returns:
        移除 None 值后的字典
    
    Examples:
        >>> remove_none_values({"a": 1, "b": None, "c": 3})
        {"a": 1, "c": 3}
    """
    return {k: v for k, v in data.items() if v is not None}


def remove_empty_values(data: Dict[str, Any]) -> Dict[str, Any]:
    """
    移除字典中的空值（None, "", [], {}）
    
    Args:
        data: 字典
    
    Returns:
        移除空值后的字典
    
    Examples:
        >>> remove_empty_values({"a": 1, "b": None, "c": "", "d": []})
        {"a": 1}
    """
    def is_empty(value):
        if value is None:
            return True
        if isinstance(value, str) and value == "":
            return True
        if isinstance(value, (list, dict)) and len(value) == 0:
            return True
        return False
    
    return {k: v for k, v in data.items() if not is_empty(v)}


def merge_dicts(*dicts: Dict[str, Any]) -> Dict[str, Any]:
    """
    合并多个字典
    
    Args:
        *dicts: 字典列表
    
    Returns:
        合并后的字典
    
    Examples:
        >>> merge_dicts({"a": 1}, {"b": 2}, {"c": 3})
        {"a": 1, "b": 2, "c": 3}
    """
    result = {}
    for d in dicts:
        result.update(d)
    return result


def chunk_list(items: List[T], chunk_size: int) -> List[List[T]]:
    """
    将列表分块
    
    Args:
        items: 列表
        chunk_size: 块大小
    
    Returns:
        分块后的列表
    
    Examples:
        >>> chunk_list([1, 2, 3, 4, 5], 2)
        [[1, 2], [3, 4], [5]]
    """
    return [items[i:i + chunk_size] for i in range(0, len(items), chunk_size)]


def unique_list(items: List[T]) -> List[T]:
    """
    列表去重（保持顺序）
    
    Args:
        items: 列表
    
    Returns:
        去重后的列表
    
    Examples:
        >>> unique_list([1, 2, 2, 3, 3, 3])
        [1, 2, 3]
    """
    seen = set()
    result = []
    
    for item in items:
        if item not in seen:
            seen.add(item)
            result.append(item)
    
    return result
