"""
字段选择器工具
用于实现 GraphQL 风格的字段选择功能
"""

from typing import Dict, Any, List, Set, Optional
import json
from loguru import logger


class FieldSelector:
    """字段选择器类"""

    # 定义字段的依赖关系
    FIELD_DEPENDENCIES = {
        "id": [],
        "user_id": [],
        "item_id": [],
        "status": [],
        "rating": [],
        "notes": [],
        "started_at": [],
        "completed_at": [],
        "progress": [],
        "created_at": [],
        "updated_at": [],
        # Item 相关字段
        "external_id": ["item"],
        "source": ["item"],
        "content_type": ["item"],
        "title": ["item"],
        "original_title": ["item"],
        "description": ["item"],
        "poster_url": ["item"],
        "backdrop_url": ["item"],
        "release_date": ["item"],
        "year": ["item"],
        "language": ["item"],
        "metadata": ["item"],
    }

    @staticmethod
    def parse_fields(fields_param: Optional[str]) -> Optional[Set[str]]:
        """
        解析字段参数

        Args:
            fields_param: 字段参数字符串，如 "id,title,status,rating"

        Returns:
            字段集合，如果为None则返回所有字段
        """
        if not fields_param:
            return None

        try:
            # 分割字段
            fields = set(field.strip() for field in fields_param.split(",") if field.strip())

            # 验证字段是否存在
            valid_fields = set(FieldSelector.FIELD_DEPENDENCIES.keys())
            invalid_fields = fields - valid_fields

            if invalid_fields:
                logger.warning(f"无效的字段选择: {invalid_fields}")
                # 移除无效字段
                fields = fields & valid_fields

            return fields if fields else None

        except Exception as e:
            logger.error(f"解析字段参数失败: {e}")
            return None

    @staticmethod
    def filter_response_data(
        data: Dict[str, Any],
        selected_fields: Optional[Set[str]]
    ) -> Dict[str, Any]:
        """
        过滤响应数据，只保留选定的字段

        Args:
            data: 原始响应数据
            selected_fields: 选定的字段集合

        Returns:
            过滤后的数据
        """
        if selected_fields is None:
            return data

        filtered_data = {}

        for field in selected_fields:
            if field in data:
                filtered_data[field] = data[field]

            # 处理依赖字段
            dependencies = FieldSelector.FIELD_DEPENDENCIES.get(field, [])
            for dep in dependencies:
                if dep in data:
                    filtered_data[dep] = data[dep]

        return filtered_data

    @staticmethod
    def filter_response_list(
        items: List[Dict[str, Any]],
        selected_fields: Optional[Set[str]]
    ) -> List[Dict[str, Any]]:
        """
        过滤响应列表

        Args:
            items: 响应数据列表
            selected_fields: 选定的字段集合

        Returns:
            过滤后的列表
        """
        if selected_fields is None:
            return items

        return [
            FieldSelector.filter_response_data(item, selected_fields)
            for item in items
        ]

    @staticmethod
    def get_default_fields() -> Set[str]:
        """获取默认字段集合"""
        return {
            "id", "status", "rating", "title", "content_type",
            "created_at", "updated_at"
        }

    @staticmethod
    def get_all_fields() -> Set[str]:
        """获取所有可用字段"""
        return set(FieldSelector.FIELD_DEPENDENCIES.keys())

    @staticmethod
    def validate_fields(fields: Set[str]) -> Set[str]:
        """验证字段并返回有效的字段集合"""
        valid_fields = set(FieldSelector.FIELD_DEPENDENCIES.keys())
        return fields & valid_fields
