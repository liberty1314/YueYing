"""
对象存储服务测试

测试 MinIO 存储客户端、文件验证器和图片处理器
"""
import io
import pytest
from unittest.mock import MagicMock, patch, PropertyMock
from datetime import timedelta

from app.core.storage import (
    StorageClient,
    StorageManager,
    StorageError,
)
from app.utils.file_validator import FileValidator, FileValidationError
from app.utils.image_processor import ImageProcessor, ImageProcessingError
from app.utils.storage_keys import (
    StorageBucket,
    FileType,
    ImageVariant,
    FILE_TYPE_BUCKET_MAP,
    IMAGE_VARIANT_SIZES,
)


# ====================================
# FileValidator 测试
# ====================================


class TestFileValidator:
    """文件验证器测试"""

    def test_validate_image_file_valid(self):
        """测试验证合法的图片文件"""
        validator = FileValidator()

        is_valid, error = validator.validate_image_file(
            filename="test.jpg",
            content_type="image/jpeg",
        )

        assert is_valid is True
        assert error is None

    def test_validate_image_file_invalid_extension(self):
        """测试验证非法扩展名"""
        validator = FileValidator()

        is_valid, error = validator.validate_image_file(
            filename="test.exe",
            content_type="image/jpeg",
        )

        assert is_valid is False
        assert "扩展名" in error

    def test_validate_image_file_invalid_mime(self):
        """测试验证非法 MIME 类型"""
        validator = FileValidator()

        is_valid, error = validator.validate_image_file(
            filename="test.jpg",
            content_type="application/pdf",
        )

        assert is_valid is False
        assert "类型" in error

    def test_validate_file_size_valid(self):
        """测试验证合法的文件大小"""
        validator = FileValidator()

        is_valid, error = validator.validate_file_size(
            file_size=1024 * 1024,  # 1MB
            max_size=10 * 1024 * 1024,  # 10MB
        )

        assert is_valid is True
        assert error is None

    def test_validate_file_size_too_large(self):
        """测试文件过大"""
        validator = FileValidator()

        is_valid, error = validator.validate_file_size(
            file_size=20 * 1024 * 1024,  # 20MB
            max_size=10 * 1024 * 1024,  # 10MB
        )

        assert is_valid is False
        assert "过大" in error

    def test_validate_file_size_zero(self):
        """测试文件大小为0"""
        validator = FileValidator()

        is_valid, error = validator.validate_file_size(
            file_size=0,
        )

        assert is_valid is False
        assert "无效" in error

    def test_is_safe_filename(self):
        """测试安全的文件名"""
        validator = FileValidator()

        assert validator.is_safe_filename("test.jpg") is True
        assert validator.is_safe_filename("my-image_123.png") is True
        assert validator.is_safe_filename("../../../etc/passwd") is False
        assert validator.is_safe_filename("test/file.jpg") is False
        assert validator.is_safe_filename("test\\file.jpg") is False

    def test_sanitize_filename(self):
        """测试清理文件名"""
        validator = FileValidator()

        assert validator.sanitize_filename("test.jpg") == "test.jpg"
        assert validator.sanitize_filename("../test.jpg") == "__test.jpg"
        assert validator.sanitize_filename("test/file.jpg") == "test_file.jpg"
        assert validator.sanitize_filename("test\\file.jpg") == "test_file.jpg"

    def test_get_mime_type(self):
        """测试获取 MIME 类型"""
        validator = FileValidator()

        assert validator.get_mime_type("test.jpg") == "image/jpeg"
        assert validator.get_mime_type("test.png") == "image/png"
        assert validator.get_mime_type("test.pdf") == "application/pdf"


# ====================================
# ImageProcessor 测试
# ====================================


class TestImageProcessor:
    """图片处理器测试"""

    @pytest.fixture
    def sample_image_data(self):
        """创建示例图片数据"""
        from PIL import Image

        img = Image.new("RGB", (800, 600), color=(255, 0, 0))
        output = io.BytesIO()
        img.save(output, format="JPEG")
        return output.getvalue()

    @pytest.fixture
    def sample_png_image_data(self):
        """创建示例 PNG 图片数据（带透明度）"""
        from PIL import Image

        img = Image.new("RGBA", (800, 600), color=(255, 0, 0, 128))
        output = io.BytesIO()
        img.save(output, format="PNG")
        return output.getvalue()

    def test_compress_image(self, sample_image_data):
        """测试图片压缩"""
        processor = ImageProcessor()

        compressed = processor.compress_image(
            image_data=sample_image_data,
            quality=50,
        )

        assert len(compressed) < len(sample_image_data)
        assert len(compressed) > 0

    def test_compress_image_with_format_conversion(self, sample_png_image_data):
        """测试图片压缩并转换格式"""
        processor = ImageProcessor()

        compressed = processor.compress_image(
            image_data=sample_png_image_data,
            quality=85,
            output_format="JPEG",
        )

        assert len(compressed) > 0

        # 验证输出格式
        from PIL import Image
        img = Image.open(io.BytesIO(compressed))
        assert img.format == "JPEG"
        assert img.mode == "RGB"  # JPEG 不支持透明度

    def test_create_thumbnail(self, sample_image_data):
        """测试生成缩略图"""
        processor = ImageProcessor()

        thumbnail = processor.create_thumbnail(
            image_data=sample_image_data,
            size=(200, 200),
        )

        assert len(thumbnail) > 0
        assert len(thumbnail) < len(sample_image_data)

        # 验证尺寸
        from PIL import Image
        img = Image.open(io.BytesIO(thumbnail))
        assert img.width <= 200
        assert img.height <= 200

    def test_resize_image(self, sample_image_data):
        """测试调整图片尺寸"""
        processor = ImageProcessor()

        resized = processor.resize_image(
            image_data=sample_image_data,
            max_width=400,
            max_height=300,
        )

        assert len(resized) > 0

        # 验证尺寸
        from PIL import Image
        img = Image.open(io.BytesIO(resized))
        assert img.width <= 400
        assert img.height <= 300

    def test_resize_image_no_change(self, sample_image_data):
        """测试调整图片尺寸（尺寸不变）"""
        processor = ImageProcessor()

        resized = processor.resize_image(
            image_data=sample_image_data,
            max_width=1000,
            max_height=1000,
        )

        assert len(resized) > 0

    def test_convert_format(self, sample_image_data):
        """测试转换图片格式"""
        processor = ImageProcessor()

        converted = processor.convert_format(
            image_data=sample_image_data,
            target_format="PNG",
        )

        assert len(converted) > 0

        # 验证格式
        from PIL import Image
        img = Image.open(io.BytesIO(converted))
        assert img.format == "PNG"

    def test_convert_format_unsupported(self, sample_image_data):
        """测试转换到不支持的格式"""
        processor = ImageProcessor()

        with pytest.raises(ImageProcessingError) as exc_info:
            processor.convert_format(
                image_data=sample_image_data,
                target_format="INVALID",
            )

        assert "不支持的图片格式" in str(exc_info.value)

    def test_get_image_info(self, sample_image_data):
        """测试获取图片信息"""
        processor = ImageProcessor()

        info = processor.get_image_info(sample_image_data)

        assert info["format"] == "JPEG"
        assert info["width"] == 800
        assert info["height"] == 600
        assert info["size"] == len(sample_image_data)

    def test_get_image_info_invalid(self):
        """测试获取无效图片信息"""
        processor = ImageProcessor()

        with pytest.raises(ImageProcessingError):
            processor.get_image_info(b"invalid image data")


# ====================================
# StorageClient 测试
# ====================================


class TestStorageClient:
    """存储客户端测试"""

    @pytest.fixture
    def mock_minio_client(self):
        """Mock MinIO 客户端"""
        with patch("app.core.storage.Minio") as mock:
            client = MagicMock()
            mock.return_value = client
            yield client

    @pytest.fixture
    def storage_client(self, mock_minio_client):
        """创建存储客户端实例"""
        client = StorageClient()
        # 强制初始化客户端
        _ = client.client
        return client

    def test_ensure_bucket_exists_create(self, storage_client, mock_minio_client):
        """测试创建不存在的存储桶"""
        mock_minio_client.bucket_exists.return_value = False

        storage_client.ensure_bucket_exists("test-bucket")

        mock_minio_client.bucket_exists.assert_called_once_with("test-bucket")
        mock_minio_client.make_bucket.assert_called_once_with("test-bucket")

    def test_ensure_bucket_exists_already_exists(self, storage_client, mock_minio_client):
        """测试存储桶已存在"""
        mock_minio_client.bucket_exists.return_value = True

        storage_client.ensure_bucket_exists("test-bucket")

        mock_minio_client.bucket_exists.assert_called_once_with("test-bucket")
        mock_minio_client.make_bucket.assert_not_called()

    def test_upload_file_success(self, storage_client, mock_minio_client):
        """测试成功上传文件"""
        mock_minio_client.bucket_exists.return_value = True

        file_data = b"test file content"
        object_name = storage_client.upload_file(
            file_data=file_data,
            object_name="test.txt",
            bucket_name="test-bucket",
            content_type="text/plain",
        )

        assert object_name == "test.txt"
        mock_minio_client.put_object.assert_called_once()

    def test_upload_file_with_file_object(self, storage_client, mock_minio_client):
        """测试使用文件对象上传"""
        mock_minio_client.bucket_exists.return_value = True

        file_obj = io.BytesIO(b"test file content")
        object_name = storage_client.upload_file(
            file_data=file_obj,
            object_name="test.txt",
            bucket_name="test-bucket",
        )

        assert object_name == "test.txt"
        mock_minio_client.put_object.assert_called_once()

    def test_download_file_success(self, storage_client, mock_minio_client):
        """测试成功下载文件"""
        mock_response = MagicMock()
        mock_response.read.return_value = b"file content"
        mock_minio_client.get_object.return_value = mock_response

        data = storage_client.download_file(
            object_name="test.txt",
            bucket_name="test-bucket",
        )

        assert data == b"file content"
        mock_minio_client.get_object.assert_called_once_with("test-bucket", "test.txt")
        mock_response.close.assert_called_once()
        mock_response.release_conn.assert_called_once()

    def test_delete_file_success(self, storage_client, mock_minio_client):
        """测试成功删除文件"""
        storage_client.delete_file(
            object_name="test.txt",
            bucket_name="test-bucket",
        )

        mock_minio_client.remove_object.assert_called_once_with("test-bucket", "test.txt")

    def test_file_exists_true(self, storage_client, mock_minio_client):
        """测试文件存在"""
        mock_minio_client.stat_object.return_value = MagicMock()

        exists = storage_client.file_exists(
            object_name="test.txt",
            bucket_name="test-bucket",
        )

        assert exists is True
        mock_minio_client.stat_object.assert_called_once_with("test-bucket", "test.txt")

    def test_file_exists_false(self, storage_client, mock_minio_client):
        """测试文件不存在"""
        from minio.error import S3Error

        mock_minio_client.stat_object.side_effect = S3Error(
            code="NoSuchKey",
            message="Object does not exist",
            resource="test.txt",
            request_id="1234",
            host_id="5678",
            response=MagicMock(),
        )

        exists = storage_client.file_exists(
            object_name="test.txt",
            bucket_name="test-bucket",
        )

        assert exists is False

    def test_get_file_url(self, storage_client, mock_minio_client):
        """测试生成预签名 URL"""
        mock_minio_client.presigned_get_object.return_value = "https://example.com/test.txt"

        url = storage_client.get_file_url(
            object_name="test.txt",
            bucket_name="test-bucket",
            expires=timedelta(hours=1),
        )

        assert url == "https://example.com/test.txt"
        mock_minio_client.presigned_get_object.assert_called_once()

    def test_get_public_url(self, storage_client):
        """测试生成公共 URL"""
        url = storage_client.get_public_url(
            object_name="test.txt",
            bucket_name="test-bucket",
        )

        assert "test-bucket" in url
        assert "test.txt" in url

    def test_list_files(self, storage_client, mock_minio_client):
        """测试列出文件"""
        mock_obj1 = MagicMock()
        mock_obj1.object_name = "file1.txt"
        mock_obj2 = MagicMock()
        mock_obj2.object_name = "file2.txt"

        mock_minio_client.list_objects.return_value = [mock_obj1, mock_obj2]

        files = storage_client.list_files(
            bucket_name="test-bucket",
            prefix="test/",
        )

        assert files == ["file1.txt", "file2.txt"]
        mock_minio_client.list_objects.assert_called_once()


# ====================================
# StorageManager 测试
# ====================================


class TestStorageManager:
    """存储管理器测试"""

    @pytest.fixture
    def mock_storage_client(self):
        """Mock 存储客户端"""
        return MagicMock(spec=StorageClient)

    @pytest.fixture
    def storage_manager(self, mock_storage_client):
        """创建存储管理器实例"""
        return StorageManager(mock_storage_client)

    def test_generate_unique_filename(self, storage_manager):
        """测试生成唯一文件名"""
        filename = storage_manager.generate_unique_filename("test.jpg")

        assert filename.endswith(".jpg")
        assert len(filename) > 4  # UUID + extension

    def test_generate_unique_filename_with_prefix(self, storage_manager):
        """测试生成带前缀的唯一文件名"""
        filename = storage_manager.generate_unique_filename(
            "test.jpg",
            prefix="avatars",
        )

        assert filename.startswith("avatars/")
        assert filename.endswith(".jpg")

    def test_generate_path(self, storage_manager):
        """测试生成文件路径"""
        path = storage_manager.generate_path(
            file_type="avatar",
            user_id=123,
            filename="test.jpg",
        )

        assert path == "avatar/user_123/test.jpg"

    def test_generate_path_no_user_id(self, storage_manager):
        """测试生成文件路径（无用户ID）"""
        path = storage_manager.generate_path(
            file_type="poster",
            filename="movie.jpg",
        )

        assert path == "poster/movie.jpg"

    def test_get_variant_filename(self, storage_manager):
        """测试生成变体文件名"""
        variant_filename = storage_manager._get_variant_filename(
            "test/image.jpg",
            "thumbnail",
        )

        assert variant_filename == "test/image_thumbnail.jpg"


# ====================================
# 集成测试
# ====================================


class TestStorageIntegration:
    """存储服务集成测试"""

    def test_file_upload_workflow(self):
        """测试完整的文件上传流程"""
        # 创建示例图片
        from PIL import Image

        img = Image.new("RGB", (800, 600), color=(255, 0, 0))
        output = io.BytesIO()
        img.save(output, format="JPEG")
        image_data = output.getvalue()

        # 验证文件
        validator = FileValidator()
        is_valid, error = validator.validate_upload(
            filename="test.jpg",
            content_type="image/jpeg",
            file_data=image_data,
            file_category="image",
        )

        assert is_valid is True
        assert error is None

        # 压缩图片
        processor = ImageProcessor()
        compressed = processor.compress_image(image_data, quality=85)

        assert len(compressed) > 0

        # 生成缩略图
        thumbnail = processor.create_thumbnail(image_data, size=(200, 200))

        assert len(thumbnail) > 0
        assert len(thumbnail) < len(compressed)

    def test_image_processing_pipeline(self):
        """测试图片处理管道"""
        from PIL import Image

        # 创建大图
        img = Image.new("RGB", (2000, 1500), color=(0, 255, 0))
        output = io.BytesIO()
        img.save(output, format="PNG")
        image_data = output.getvalue()

        processor = ImageProcessor()

        # 调整尺寸
        resized = processor.resize_image(
            image_data,
            max_width=1920,
            max_height=1080,
        )

        # 转换格式
        converted = processor.convert_format(
            resized,
            target_format="JPEG",
            quality=90,
        )

        # 生成缩略图
        thumbnail = processor.create_thumbnail(
            converted,
            size=(200, 200),
        )

        assert len(thumbnail) > 0
        assert len(thumbnail) < len(converted)
        assert len(converted) < len(image_data)


