"""
文件验证工具

提供文件类型、大小、内容验证等功能
"""
import mimetypes
from pathlib import Path
from typing import List, Optional, Tuple

from loguru import logger


class FileValidationError(Exception):
    """文件验证异常"""
    pass


class FileValidator:
    """文件验证器"""

    # 允许的图片 MIME 类型
    ALLOWED_IMAGE_TYPES = {
        "image/jpeg",
        "image/png",
        "image/gif",
        "image/webp",
        "image/bmp",
    }

    # 允许的图片扩展名
    ALLOWED_IMAGE_EXTENSIONS = {
        ".jpg",
        ".jpeg",
        ".png",
        ".gif",
        ".webp",
        ".bmp",
    }

    # 允许的文档 MIME 类型
    ALLOWED_DOCUMENT_TYPES = {
        "application/pdf",
        "application/msword",
        "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
        "application/vnd.ms-excel",
        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    }

    # 允许的文档扩展名
    ALLOWED_DOCUMENT_EXTENSIONS = {
        ".pdf",
        ".doc",
        ".docx",
        ".xls",
        ".xlsx",
    }

    # 默认最大文件大小 (10MB)
    DEFAULT_MAX_SIZE = 10 * 1024 * 1024

    # 图片最大尺寸
    MAX_IMAGE_WIDTH = 4096
    MAX_IMAGE_HEIGHT = 4096

    def __init__(self):
        """初始化文件验证器"""
        pass

    def validate_file_type(
        self,
        filename: str,
        content_type: str,
        allowed_types: Optional[List[str]] = None,
        allowed_extensions: Optional[List[str]] = None,
    ) -> Tuple[bool, Optional[str]]:
        """
        验证文件类型

        Args:
            filename: 文件名
            content_type: MIME 类型
            allowed_types: 允许的 MIME 类型列表
            allowed_extensions: 允许的扩展名列表

        Returns:
            (是否通过验证, 错误消息)
        """
        # 获取文件扩展名
        file_extension = Path(filename).suffix.lower()

        # 验证 MIME 类型
        if allowed_types:
            if content_type not in allowed_types:
                return False, f"不支持的文件类型: {content_type}"

        # 验证扩展名
        if allowed_extensions:
            if file_extension not in allowed_extensions:
                return False, f"不支持的文件扩展名: {file_extension}"

        logger.debug(f"文件类型验证通过: {filename} ({content_type})")
        return True, None

    def validate_image_file(
        self,
        filename: str,
        content_type: str,
    ) -> Tuple[bool, Optional[str]]:
        """
        验证图片文件类型

        Args:
            filename: 文件名
            content_type: MIME 类型

        Returns:
            (是否通过验证, 错误消息)
        """
        return self.validate_file_type(
            filename=filename,
            content_type=content_type,
            allowed_types=list(self.ALLOWED_IMAGE_TYPES),
            allowed_extensions=list(self.ALLOWED_IMAGE_EXTENSIONS),
        )

    def validate_document_file(
        self,
        filename: str,
        content_type: str,
    ) -> Tuple[bool, Optional[str]]:
        """
        验证文档文件类型

        Args:
            filename: 文件名
            content_type: MIME 类型

        Returns:
            (是否通过验证, 错误消息)
        """
        return self.validate_file_type(
            filename=filename,
            content_type=content_type,
            allowed_types=list(self.ALLOWED_DOCUMENT_TYPES),
            allowed_extensions=list(self.ALLOWED_DOCUMENT_EXTENSIONS),
        )

    def validate_file_size(
        self,
        file_size: int,
        max_size: Optional[int] = None,
    ) -> Tuple[bool, Optional[str]]:
        """
        验证文件大小

        Args:
            file_size: 文件大小（字节）
            max_size: 最大文件大小（字节）

        Returns:
            (是否通过验证, 错误消息)
        """
        max_size = max_size or self.DEFAULT_MAX_SIZE

        if file_size > max_size:
            return False, f"文件过大: {file_size / 1024 / 1024:.2f}MB (最大: {max_size / 1024 / 1024:.2f}MB)"

        if file_size <= 0:
            return False, "文件大小无效"

        logger.debug(f"文件大小验证通过: {file_size / 1024:.2f}KB")
        return True, None

    def validate_image_content(
        self,
        image_data: bytes,
        max_width: Optional[int] = None,
        max_height: Optional[int] = None,
    ) -> Tuple[bool, Optional[str]]:
        """
        验证图片内容（尺寸、格式等）

        Args:
            image_data: 图片数据（字节）
            max_width: 最大宽度
            max_height: 最大高度

        Returns:
            (是否通过验证, 错误消息)
        """
        try:
            from PIL import Image
            import io

            # 打开图片
            img = Image.open(io.BytesIO(image_data))

            # 验证尺寸
            max_width = max_width or self.MAX_IMAGE_WIDTH
            max_height = max_height or self.MAX_IMAGE_HEIGHT

            if img.width > max_width or img.height > max_height:
                return False, (
                    f"图片尺寸过大: {img.width}x{img.height} "
                    f"(最大: {max_width}x{max_height})"
                )

            # 验证格式
            if img.format not in ["JPEG", "PNG", "GIF", "WEBP", "BMP"]:
                return False, f"不支持的图片格式: {img.format}"

            logger.debug(f"图片内容验证通过: {img.width}x{img.height}, {img.format}")
            return True, None

        except Exception as e:
            logger.error(f"图片内容验证失败: {e}")
            return False, f"无效的图片文件: {e}"

    def get_mime_type(self, filename: str) -> str:
        """
        根据文件名获取 MIME 类型

        Args:
            filename: 文件名

        Returns:
            MIME 类型
        """
        mime_type, _ = mimetypes.guess_type(filename)
        return mime_type or "application/octet-stream"

    def is_safe_filename(self, filename: str) -> bool:
        """
        检查文件名是否安全

        Args:
            filename: 文件名

        Returns:
            文件名是否安全
        """
        # 禁止的字符
        forbidden_chars = {"/", "\\", "..", "\x00", ":"}

        # 检查是否包含禁止字符
        for char in forbidden_chars:
            if char in filename:
                logger.warning(f"不安全的文件名: {filename} (包含禁止字符: {char})")
                return False

        return True

    def sanitize_filename(self, filename: str) -> str:
        """
        清理文件名，移除不安全的字符

        Args:
            filename: 原始文件名

        Returns:
            清理后的文件名
        """
        # 移除路径分隔符
        filename = filename.replace("/", "_").replace("\\", "_")

        # 移除其他危险字符
        filename = filename.replace("..", "_").replace("\x00", "")

        # 限制文件名长度
        max_length = 255
        if len(filename) > max_length:
            # 保留扩展名
            path = Path(filename)
            stem = path.stem[:max_length - len(path.suffix)]
            filename = f"{stem}{path.suffix}"

        return filename

    def validate_upload(
        self,
        filename: str,
        content_type: str,
        file_data: bytes,
        file_category: str = "image",
        max_size: Optional[int] = None,
    ) -> Tuple[bool, Optional[str]]:
        """
        综合验证上传文件

        Args:
            filename: 文件名
            content_type: MIME 类型
            file_data: 文件数据
            file_category: 文件类别 (image, document)
            max_size: 最大文件大小

        Returns:
            (是否通过验证, 错误消息)
        """
        # 验证文件名安全性
        if not self.is_safe_filename(filename):
            return False, "文件名包含不安全字符"

        # 验证文件大小
        is_valid, error = self.validate_file_size(len(file_data), max_size)
        if not is_valid:
            return False, error

        # 验证文件类型
        if file_category == "image":
            is_valid, error = self.validate_image_file(filename, content_type)
            if not is_valid:
                return False, error

            # 验证图片内容
            is_valid, error = self.validate_image_content(file_data)
            if not is_valid:
                return False, error

        elif file_category == "document":
            is_valid, error = self.validate_document_file(filename, content_type)
            if not is_valid:
                return False, error

        logger.info(f"文件验证通过: {filename} ({content_type}, {len(file_data)} bytes)")
        return True, None


