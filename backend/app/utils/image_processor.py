"""
图片处理工具

提供图片压缩、缩略图生成、格式转换等功能
"""
import io
from typing import Optional, Tuple

from PIL import Image, ImageOps
from loguru import logger


class ImageProcessingError(Exception):
    """图片处理异常"""
    pass


class ImageProcessor:
    """图片处理器"""

    # 支持的图片格式
    SUPPORTED_FORMATS = {"JPEG", "PNG", "GIF", "WEBP", "BMP"}

    # 默认压缩质量
    DEFAULT_QUALITY = 85

    # 默认缩略图尺寸
    DEFAULT_THUMBNAIL_SIZE = (200, 200)

    def __init__(self):
        """初始化图片处理器"""
        pass

    def compress_image(
        self,
        image_data: bytes,
        quality: int = DEFAULT_QUALITY,
        output_format: Optional[str] = None,
    ) -> bytes:
        """
        压缩图片

        Args:
            image_data: 图片数据（字节）
            quality: 压缩质量 (1-100)
            output_format: 输出格式 (JPEG, PNG, WEBP等)

        Returns:
            压缩后的图片数据

        Raises:
            ImageProcessingError: 处理失败时抛出
        """
        try:
            # 打开图片
            img = Image.open(io.BytesIO(image_data))

            # 确定输出格式
            if output_format is None:
                output_format = img.format or "JPEG"

            # 转换 RGBA 到 RGB (JPEG 不支持透明度)
            if output_format.upper() == "JPEG" and img.mode in ("RGBA", "LA", "P"):
                # 创建白色背景
                background = Image.new("RGB", img.size, (255, 255, 255))
                if img.mode == "P":
                    img = img.convert("RGBA")
                background.paste(img, mask=img.split()[-1] if img.mode == "RGBA" else None)
                img = background

            # 压缩图片
            output = io.BytesIO()
            img.save(
                output,
                format=output_format,
                quality=quality,
                optimize=True,
            )

            compressed_data = output.getvalue()
            logger.debug(
                f"图片压缩成功: {len(image_data)} bytes -> {len(compressed_data)} bytes "
                f"({len(compressed_data) / len(image_data) * 100:.1f}%)"
            )

            return compressed_data

        except Exception as e:
            logger.error(f"图片压缩失败: {e}")
            raise ImageProcessingError(f"图片压缩失败: {e}")

    def create_thumbnail(
        self,
        image_data: bytes,
        size: Tuple[int, int] = DEFAULT_THUMBNAIL_SIZE,
        quality: int = DEFAULT_QUALITY,
    ) -> bytes:
        """
        生成缩略图

        Args:
            image_data: 图片数据（字节）
            size: 缩略图尺寸 (width, height)
            quality: 压缩质量 (1-100)

        Returns:
            缩略图数据

        Raises:
            ImageProcessingError: 处理失败时抛出
        """
        try:
            # 打开图片
            img = Image.open(io.BytesIO(image_data))

            # 确定输出格式
            output_format = img.format or "JPEG"

            # 自动旋转图片（根据 EXIF 信息）
            img = ImageOps.exif_transpose(img)

            # 转换 RGBA 到 RGB (如果输出格式是 JPEG)
            if output_format.upper() == "JPEG" and img.mode in ("RGBA", "LA", "P"):
                background = Image.new("RGB", img.size, (255, 255, 255))
                if img.mode == "P":
                    img = img.convert("RGBA")
                background.paste(img, mask=img.split()[-1] if img.mode == "RGBA" else None)
                img = background

            # 生成缩略图（保持宽高比）
            img.thumbnail(size, Image.Resampling.LANCZOS)

            # 保存缩略图
            output = io.BytesIO()
            img.save(
                output,
                format=output_format,
                quality=quality,
                optimize=True,
            )

            thumbnail_data = output.getvalue()
            logger.debug(
                f"缩略图生成成功: {img.size} -> {size}, "
                f"{len(image_data)} bytes -> {len(thumbnail_data)} bytes"
            )

            return thumbnail_data

        except Exception as e:
            logger.error(f"缩略图生成失败: {e}")
            raise ImageProcessingError(f"缩略图生成失败: {e}")

    def resize_image(
        self,
        image_data: bytes,
        max_width: Optional[int] = None,
        max_height: Optional[int] = None,
        quality: int = DEFAULT_QUALITY,
    ) -> bytes:
        """
        调整图片尺寸（保持宽高比）

        Args:
            image_data: 图片数据（字节）
            max_width: 最大宽度
            max_height: 最大高度
            quality: 压缩质量 (1-100)

        Returns:
            调整后的图片数据

        Raises:
            ImageProcessingError: 处理失败时抛出
        """
        try:
            # 打开图片
            img = Image.open(io.BytesIO(image_data))

            # 确定输出格式
            output_format = img.format or "JPEG"

            # 自动旋转图片
            img = ImageOps.exif_transpose(img)

            # 计算新尺寸
            width, height = img.size

            if max_width and width > max_width:
                ratio = max_width / width
                width = max_width
                height = int(height * ratio)

            if max_height and height > max_height:
                ratio = max_height / height
                height = max_height
                width = int(width * ratio)

            # 调整尺寸
            if (width, height) != img.size:
                img = img.resize((width, height), Image.Resampling.LANCZOS)

            # 转换 RGBA 到 RGB (如果输出格式是 JPEG)
            if output_format.upper() == "JPEG" and img.mode in ("RGBA", "LA", "P"):
                background = Image.new("RGB", img.size, (255, 255, 255))
                if img.mode == "P":
                    img = img.convert("RGBA")
                background.paste(img, mask=img.split()[-1] if img.mode == "RGBA" else None)
                img = background

            # 保存图片
            output = io.BytesIO()
            img.save(
                output,
                format=output_format,
                quality=quality,
                optimize=True,
            )

            resized_data = output.getvalue()
            logger.debug(
                f"图片调整成功: {img.size} -> ({width}, {height}), "
                f"{len(image_data)} bytes -> {len(resized_data)} bytes"
            )

            return resized_data

        except Exception as e:
            logger.error(f"图片调整失败: {e}")
            raise ImageProcessingError(f"图片调整失败: {e}")

    def convert_format(
        self,
        image_data: bytes,
        target_format: str,
        quality: int = DEFAULT_QUALITY,
    ) -> bytes:
        """
        转换图片格式

        Args:
            image_data: 图片数据（字节）
            target_format: 目标格式 (JPEG, PNG, WEBP等)
            quality: 压缩质量 (1-100)

        Returns:
            转换后的图片数据

        Raises:
            ImageProcessingError: 处理失败时抛出
        """
        try:
            # 验证目标格式
            target_format = target_format.upper()
            if target_format not in self.SUPPORTED_FORMATS:
                raise ImageProcessingError(
                    f"不支持的图片格式: {target_format}。"
                    f"支持的格式: {', '.join(self.SUPPORTED_FORMATS)}"
                )

            # 打开图片
            img = Image.open(io.BytesIO(image_data))

            # 转换 RGBA 到 RGB (如果目标格式是 JPEG)
            if target_format == "JPEG" and img.mode in ("RGBA", "LA", "P"):
                background = Image.new("RGB", img.size, (255, 255, 255))
                if img.mode == "P":
                    img = img.convert("RGBA")
                background.paste(img, mask=img.split()[-1] if img.mode == "RGBA" else None)
                img = background

            # 保存为目标格式
            output = io.BytesIO()
            img.save(
                output,
                format=target_format,
                quality=quality,
                optimize=True,
            )

            converted_data = output.getvalue()
            logger.debug(
                f"图片格式转换成功: {img.format} -> {target_format}, "
                f"{len(image_data)} bytes -> {len(converted_data)} bytes"
            )

            return converted_data

        except ImageProcessingError:
            raise
        except Exception as e:
            logger.error(f"图片格式转换失败: {e}")
            raise ImageProcessingError(f"图片格式转换失败: {e}")

    def get_image_info(self, image_data: bytes) -> dict:
        """
        获取图片信息

        Args:
            image_data: 图片数据（字节）

        Returns:
            图片信息字典

        Raises:
            ImageProcessingError: 处理失败时抛出
        """
        try:
            img = Image.open(io.BytesIO(image_data))

            return {
                "format": img.format,
                "mode": img.mode,
                "width": img.width,
                "height": img.height,
                "size": len(image_data),
            }

        except Exception as e:
            logger.error(f"获取图片信息失败: {e}")
            raise ImageProcessingError(f"获取图片信息失败: {e}")


