"""
MinIO 对象存储服务

提供文件上传、下载、删除、URL生成等功能
"""
import io
import uuid
from datetime import timedelta
from pathlib import Path
from typing import BinaryIO, Optional, Tuple, Union
from urllib.parse import urljoin

from minio import Minio
from minio.error import S3Error
from loguru import logger

from app.core.config import settings


class StorageError(Exception):
    """存储服务异常"""
    pass


class StorageClient:
    """MinIO 存储客户端"""

    def __init__(self):
        """初始化 MinIO 客户端"""
        self._client: Optional[Minio] = None
        self._initialized = False

    @property
    def client(self) -> Minio:
        """获取 MinIO 客户端实例"""
        if self._client is None:
            try:
                self._client = Minio(
                    endpoint=settings.MINIO_ENDPOINT,
                    access_key=settings.MINIO_ACCESS_KEY,
                    secret_key=settings.MINIO_SECRET_KEY,
                    secure=settings.MINIO_SECURE,
                )
                logger.info(f"MinIO 客户端初始化成功: {settings.MINIO_ENDPOINT}")
            except Exception as e:
                logger.error(f"MinIO 客户端初始化失败: {e}")
                raise StorageError(f"无法连接到 MinIO 服务: {e}")
        return self._client

    def ensure_bucket_exists(self, bucket_name: str) -> None:
        """
        确保存储桶存在，如果不存在则创建

        Args:
            bucket_name: 存储桶名称
        """
        try:
            if not self.client.bucket_exists(bucket_name):
                self.client.make_bucket(bucket_name)
                logger.info(f"创建存储桶: {bucket_name}")
            else:
                logger.debug(f"存储桶已存在: {bucket_name}")
        except S3Error as e:
            logger.error(f"检查/创建存储桶失败 {bucket_name}: {e}")
            raise StorageError(f"存储桶操作失败: {e}")

    def upload_file(
        self,
        file_data: Union[bytes, BinaryIO],
        object_name: str,
        bucket_name: str,
        content_type: str = "application/octet-stream",
        metadata: Optional[dict] = None,
    ) -> str:
        """
        上传文件到 MinIO

        Args:
            file_data: 文件数据（字节或文件对象）
            object_name: 对象名称（文件路径）
            bucket_name: 存储桶名称
            content_type: 文件MIME类型
            metadata: 文件元数据

        Returns:
            上传后的对象名称

        Raises:
            StorageError: 上传失败时抛出
        """
        try:
            # 确保存储桶存在
            self.ensure_bucket_exists(bucket_name)

            # 处理文件数据
            if isinstance(file_data, bytes):
                file_obj = io.BytesIO(file_data)
                file_size = len(file_data)
            else:
                file_obj = file_data
                # 获取文件大小
                file_obj.seek(0, 2)  # 移动到文件末尾
                file_size = file_obj.tell()
                file_obj.seek(0)  # 回到文件开头

            # 上传文件
            self.client.put_object(
                bucket_name=bucket_name,
                object_name=object_name,
                data=file_obj,
                length=file_size,
                content_type=content_type,
                metadata=metadata or {},
            )

            logger.info(f"文件上传成功: {bucket_name}/{object_name}")
            return object_name

        except S3Error as e:
            logger.error(f"文件上传失败 {bucket_name}/{object_name}: {e}")
            raise StorageError(f"文件上传失败: {e}")
        except Exception as e:
            logger.error(f"文件上传异常 {bucket_name}/{object_name}: {e}")
            raise StorageError(f"文件上传异常: {e}")

    def download_file(
        self,
        object_name: str,
        bucket_name: str,
    ) -> bytes:
        """
        从 MinIO 下载文件

        Args:
            object_name: 对象名称
            bucket_name: 存储桶名称

        Returns:
            文件内容（字节）

        Raises:
            StorageError: 下载失败时抛出
        """
        try:
            response = self.client.get_object(bucket_name, object_name)
            data = response.read()
            response.close()
            response.release_conn()

            logger.info(f"文件下载成功: {bucket_name}/{object_name}")
            return data

        except S3Error as e:
            logger.error(f"文件下载失败 {bucket_name}/{object_name}: {e}")
            raise StorageError(f"文件下载失败: {e}")
        except Exception as e:
            logger.error(f"文件下载异常 {bucket_name}/{object_name}: {e}")
            raise StorageError(f"文件下载异常: {e}")

    def delete_file(
        self,
        object_name: str,
        bucket_name: str,
    ) -> None:
        """
        从 MinIO 删除文件

        Args:
            object_name: 对象名称
            bucket_name: 存储桶名称

        Raises:
            StorageError: 删除失败时抛出
        """
        try:
            self.client.remove_object(bucket_name, object_name)
            logger.info(f"文件删除成功: {bucket_name}/{object_name}")

        except S3Error as e:
            logger.error(f"文件删除失败 {bucket_name}/{object_name}: {e}")
            raise StorageError(f"文件删除失败: {e}")
        except Exception as e:
            logger.error(f"文件删除异常 {bucket_name}/{object_name}: {e}")
            raise StorageError(f"文件删除异常: {e}")

    def file_exists(
        self,
        object_name: str,
        bucket_name: str,
    ) -> bool:
        """
        检查文件是否存在

        Args:
            object_name: 对象名称
            bucket_name: 存储桶名称

        Returns:
            文件是否存在
        """
        try:
            self.client.stat_object(bucket_name, object_name)
            return True
        except S3Error:
            return False
        except Exception as e:
            logger.error(f"检查文件存在性失败 {bucket_name}/{object_name}: {e}")
            return False

    def get_file_url(
        self,
        object_name: str,
        bucket_name: str,
        expires: timedelta = timedelta(hours=1),
    ) -> str:
        """
        生成文件的预签名 URL

        Args:
            object_name: 对象名称
            bucket_name: 存储桶名称
            expires: URL 有效期

        Returns:
            预签名 URL

        Raises:
            StorageError: 生成失败时抛出
        """
        try:
            url = self.client.presigned_get_object(
                bucket_name=bucket_name,
                object_name=object_name,
                expires=expires,
            )
            logger.debug(f"生成预签名 URL: {bucket_name}/{object_name}")
            return url

        except S3Error as e:
            logger.error(f"生成预签名 URL 失败 {bucket_name}/{object_name}: {e}")
            raise StorageError(f"生成 URL 失败: {e}")
        except Exception as e:
            logger.error(f"生成预签名 URL 异常 {bucket_name}/{object_name}: {e}")
            raise StorageError(f"生成 URL 异常: {e}")

    def get_public_url(
        self,
        object_name: str,
        bucket_name: str,
    ) -> str:
        """
        生成文件的公共访问 URL（如果存储桶是公开的）

        Args:
            object_name: 对象名称
            bucket_name: 存储桶名称

        Returns:
            公共访问 URL
        """
        # 构建公共 URL
        protocol = "https" if settings.MINIO_SECURE else "http"
        base_url = f"{protocol}://{settings.MINIO_ENDPOINT}"
        return f"{base_url}/{bucket_name}/{object_name}"

    def list_files(
        self,
        bucket_name: str,
        prefix: Optional[str] = None,
        recursive: bool = True,
    ) -> list:
        """
        列出存储桶中的文件

        Args:
            bucket_name: 存储桶名称
            prefix: 对象名称前缀
            recursive: 是否递归列出

        Returns:
            文件对象列表
        """
        try:
            objects = self.client.list_objects(
                bucket_name=bucket_name,
                prefix=prefix,
                recursive=recursive,
            )
            return [obj.object_name for obj in objects]

        except S3Error as e:
            logger.error(f"列出文件失败 {bucket_name}: {e}")
            raise StorageError(f"列出文件失败: {e}")
        except Exception as e:
            logger.error(f"列出文件异常 {bucket_name}: {e}")
            raise StorageError(f"列出文件异常: {e}")


class StorageManager:
    """存储管理器 - 提供高级文件管理功能"""

    def __init__(self, storage_client: Optional[StorageClient] = None):
        """
        初始化存储管理器

        Args:
            storage_client: 存储客户端实例
        """
        self.storage = storage_client or storage_client_instance

    def generate_unique_filename(
        self,
        original_filename: str,
        prefix: str = "",
    ) -> str:
        """
        生成唯一的文件名

        Args:
            original_filename: 原始文件名
            prefix: 文件名前缀

        Returns:
            唯一文件名
        """
        # 获取文件扩展名
        suffix = Path(original_filename).suffix.lower()

        # 生成 UUID
        unique_id = uuid.uuid4().hex[:12]

        # 构建文件名
        if prefix:
            return f"{prefix}/{unique_id}{suffix}"
        return f"{unique_id}{suffix}"

    def generate_path(
        self,
        file_type: str,
        user_id: Optional[int] = None,
        filename: Optional[str] = None,
    ) -> str:
        """
        生成文件存储路径

        Args:
            file_type: 文件类型 (avatar, cover, poster, etc.)
            user_id: 用户ID
            filename: 文件名

        Returns:
            文件路径
        """
        path_parts = [file_type]

        if user_id:
            path_parts.append(f"user_{user_id}")

        if filename:
            path_parts.append(filename)

        return "/".join(path_parts)

    def upload_with_variants(
        self,
        file_data: bytes,
        filename: str,
        bucket_name: str,
        content_type: str,
        variants: Optional[dict] = None,
    ) -> dict:
        """
        上传文件及其变体（例如缩略图）

        Args:
            file_data: 原始文件数据
            filename: 文件名
            bucket_name: 存储桶名称
            content_type: 文件MIME类型
            variants: 变体配置 {"thumbnail": (200, 200), "medium": (800, 800)}

        Returns:
            包含所有变体URL的字典
        """
        from app.utils.image_processor import ImageProcessor

        result = {}

        # 上传原始文件
        original_path = self.storage.upload_file(
            file_data=file_data,
            object_name=filename,
            bucket_name=bucket_name,
            content_type=content_type,
        )
        result["original"] = original_path

        # 如果是图片且有变体配置，生成并上传变体
        if variants and content_type.startswith("image/"):
            processor = ImageProcessor()

            for variant_name, size in variants.items():
                # 生成变体
                variant_data = processor.resize_image(
                    file_data,
                    max_width=size[0],
                    max_height=size[1],
                )

                # 生成变体文件名
                variant_filename = self._get_variant_filename(filename, variant_name)

                # 上传变体
                variant_path = self.storage.upload_file(
                    file_data=variant_data,
                    object_name=variant_filename,
                    bucket_name=bucket_name,
                    content_type=content_type,
                )
                result[variant_name] = variant_path

        return result

    def _get_variant_filename(self, original_filename: str, variant_name: str) -> str:
        """
        生成变体文件名

        Args:
            original_filename: 原始文件名
            variant_name: 变体名称

        Returns:
            变体文件名
        """
        path = Path(original_filename)
        return f"{path.parent}/{path.stem}_{variant_name}{path.suffix}"


# 创建全局存储客户端实例
storage_client_instance = StorageClient()


def get_storage() -> StorageClient:
    """获取存储客户端（用于依赖注入）"""
    return storage_client_instance


def get_storage_manager() -> StorageManager:
    """获取存储管理器（用于依赖注入）"""
    return StorageManager(storage_client_instance)


