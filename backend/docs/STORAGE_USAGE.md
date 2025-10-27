# MinIO 对象存储服务使用指南

本文档详细介绍如何使用 MinIO 对象存储服务进行文件上传、下载、图片处理等操作。

## 目录

- [核心组件](#核心组件)
- [快速开始](#快速开始)
- [存储客户端 (StorageClient)](#存储客户端-storageclient)
- [存储管理器 (StorageManager)](#存储管理器-storagemanager)
- [图片处理器 (ImageProcessor)](#图片处理器-imageprocessor)
- [文件验证器 (FileValidator)](#文件验证器-filevalidator)
- [存储配置常量](#存储配置常量)
- [完整示例](#完整示例)
- [最佳实践](#最佳实践)
- [故障排查](#故障排查)

---

## 核心组件

### 1. StorageClient
底层 MinIO 客户端封装，提供基础存储操作。

### 2. StorageManager
高级存储管理器，提供文件路径生成、多变体上传等功能。

### 3. ImageProcessor
图片处理工具，支持压缩、缩略图生成、格式转换等。

### 4. FileValidator
文件验证工具，确保上传文件的安全性和合法性。

### 5. Storage Keys
存储相关常量，包括存储桶名称、文件类型、尺寸配置等。

---

## 快速开始

### 基本配置

确保在 `.env` 文件中配置了 MinIO 相关环境变量：

```bash
# MinIO 配置
MINIO_ENDPOINT=minio:9000
MINIO_ACCESS_KEY=minioadmin
MINIO_SECRET_KEY=minioadmin123
MINIO_SECURE=false
```

### 简单上传示例

```python
from app.core.storage import get_storage

# 获取存储客户端
storage = get_storage()

# 上传文件
file_data = b"Hello, MinIO!"
object_name = storage.upload_file(
    file_data=file_data,
    object_name="test/hello.txt",
    bucket_name="my-bucket",
    content_type="text/plain",
)

print(f"文件已上传: {object_name}")
```

---

## 存储客户端 (StorageClient)

### 初始化

```python
from app.core.storage import StorageClient

storage = StorageClient()
```

### 确保存储桶存在

```python
# 如果存储桶不存在，会自动创建
storage.ensure_bucket_exists("avatars")
```

### 上传文件

#### 从字节上传

```python
file_data = b"file content"
object_name = storage.upload_file(
    file_data=file_data,
    object_name="path/to/file.txt",
    bucket_name="my-bucket",
    content_type="text/plain",
    metadata={"author": "John Doe"},
)
```

#### 从文件对象上传

```python
with open("image.jpg", "rb") as f:
    object_name = storage.upload_file(
        file_data=f,
        object_name="images/photo.jpg",
        bucket_name="user-images",
        content_type="image/jpeg",
    )
```

### 下载文件

```python
data = storage.download_file(
    object_name="images/photo.jpg",
    bucket_name="user-images",
)

# 保存到本地
with open("downloaded.jpg", "wb") as f:
    f.write(data)
```

### 删除文件

```python
storage.delete_file(
    object_name="images/photo.jpg",
    bucket_name="user-images",
)
```

### 检查文件是否存在

```python
exists = storage.file_exists(
    object_name="images/photo.jpg",
    bucket_name="user-images",
)

if exists:
    print("文件存在")
```

### 生成文件 URL

#### 预签名 URL（临时访问）

```python
from datetime import timedelta

url = storage.get_file_url(
    object_name="images/photo.jpg",
    bucket_name="user-images",
    expires=timedelta(hours=1),  # 1小时后过期
)

print(f"临时访问 URL: {url}")
```

#### 公共 URL（永久访问）

```python
url = storage.get_public_url(
    object_name="images/photo.jpg",
    bucket_name="user-images",
)

print(f"公共访问 URL: {url}")
```

### 列出文件

```python
# 列出存储桶中的所有文件
files = storage.list_files(
    bucket_name="user-images",
)

# 列出指定前缀的文件
files = storage.list_files(
    bucket_name="user-images",
    prefix="user_123/",
    recursive=True,
)

for file in files:
    print(file)
```

---

## 存储管理器 (StorageManager)

### 初始化

```python
from app.core.storage import get_storage_manager

manager = get_storage_manager()
```

### 生成唯一文件名

```python
# 生成唯一文件名
filename = manager.generate_unique_filename("photo.jpg")
# 输出: "a1b2c3d4e5f6.jpg"

# 带前缀的唯一文件名
filename = manager.generate_unique_filename(
    "photo.jpg",
    prefix="avatars",
)
# 输出: "avatars/a1b2c3d4e5f6.jpg"
```

### 生成存储路径

```python
# 基本路径
path = manager.generate_path(
    file_type="avatar",
    user_id=123,
    filename="profile.jpg",
)
# 输出: "avatar/user_123/profile.jpg"

# 无用户 ID
path = manager.generate_path(
    file_type="poster",
    filename="movie.jpg",
)
# 输出: "poster/movie.jpg"
```

### 上传文件及其变体

```python
# 上传图片并自动生成缩略图和多个尺寸变体
with open("large_image.jpg", "rb") as f:
    image_data = f.read()

results = manager.upload_with_variants(
    file_data=image_data,
    filename="images/photo.jpg",
    bucket_name="user-images",
    content_type="image/jpeg",
    variants={
        "thumbnail": (200, 200),
        "medium": (800, 600),
        "large": (1920, 1080),
    },
)

# 结果包含所有变体的路径
print(results)
# {
#     "original": "images/photo.jpg",
#     "thumbnail": "images/photo_thumbnail.jpg",
#     "medium": "images/photo_medium.jpg",
#     "large": "images/photo_large.jpg",
# }
```

---

## 图片处理器 (ImageProcessor)

### 初始化

```python
from app.utils.image_processor import ImageProcessor

processor = ImageProcessor()
```

### 压缩图片

```python
with open("large_image.jpg", "rb") as f:
    image_data = f.read()

# 压缩图片（质量 85）
compressed = processor.compress_image(
    image_data=image_data,
    quality=85,
)

# 压缩并转换格式
compressed = processor.compress_image(
    image_data=image_data,
    quality=85,
    output_format="WEBP",
)
```

### 生成缩略图

```python
# 生成 200x200 的缩略图（保持宽高比）
thumbnail = processor.create_thumbnail(
    image_data=image_data,
    size=(200, 200),
    quality=85,
)

# 保存缩略图
with open("thumbnail.jpg", "wb") as f:
    f.write(thumbnail)
```

### 调整图片尺寸

```python
# 限制最大宽度和高度（保持宽高比）
resized = processor.resize_image(
    image_data=image_data,
    max_width=1920,
    max_height=1080,
    quality=90,
)
```

### 转换图片格式

```python
# 转换为 PNG
png_data = processor.convert_format(
    image_data=image_data,
    target_format="PNG",
    quality=95,
)

# 转换为 WEBP
webp_data = processor.convert_format(
    image_data=image_data,
    target_format="WEBP",
    quality=85,
)
```

### 获取图片信息

```python
info = processor.get_image_info(image_data)

print(info)
# {
#     "format": "JPEG",
#     "mode": "RGB",
#     "width": 1920,
#     "height": 1080,
#     "size": 524288,  # 字节
# }
```

---

## 文件验证器 (FileValidator)

### 初始化

```python
from app.utils.file_validator import FileValidator

validator = FileValidator()
```

### 验证图片文件

```python
is_valid, error = validator.validate_image_file(
    filename="photo.jpg",
    content_type="image/jpeg",
)

if is_valid:
    print("图片文件类型合法")
else:
    print(f"验证失败: {error}")
```

### 验证文档文件

```python
is_valid, error = validator.validate_document_file(
    filename="document.pdf",
    content_type="application/pdf",
)
```

### 验证文件大小

```python
is_valid, error = validator.validate_file_size(
    file_size=len(file_data),
    max_size=10 * 1024 * 1024,  # 10MB
)

if not is_valid:
    print(f"文件过大: {error}")
```

### 验证图片内容

```python
is_valid, error = validator.validate_image_content(
    image_data=image_data,
    max_width=4096,
    max_height=4096,
)

if not is_valid:
    print(f"图片内容验证失败: {error}")
```

### 综合验证上传文件

```python
is_valid, error = validator.validate_upload(
    filename="photo.jpg",
    content_type="image/jpeg",
    file_data=image_data,
    file_category="image",  # or "document"
    max_size=5 * 1024 * 1024,  # 5MB
)

if not is_valid:
    raise ValueError(f"文件验证失败: {error}")
```

### 文件名安全检查

```python
# 检查文件名是否安全
is_safe = validator.is_safe_filename("photo.jpg")  # True
is_safe = validator.is_safe_filename("../../../etc/passwd")  # False

# 清理文件名
safe_filename = validator.sanitize_filename("../photo.jpg")
# 输出: "__photo.jpg"
```

---

## 存储配置常量

### 存储桶名称

```python
from app.utils.storage_keys import StorageBucket

# 使用预定义的存储桶名称
bucket = StorageBucket.AVATARS  # "avatars"
bucket = StorageBucket.MOVIE_POSTERS  # "movie-posters"
bucket = StorageBucket.BOOK_COVERS  # "book-covers"
```

### 文件类型

```python
from app.utils.storage_keys import FileType

file_type = FileType.AVATAR  # "avatar"
file_type = FileType.POSTER  # "poster"
file_type = FileType.COVER  # "cover"
```

### 图片变体尺寸

```python
from app.utils.storage_keys import IMAGE_VARIANT_SIZES, ImageVariant

# 获取缩略图尺寸
thumbnail_size = IMAGE_VARIANT_SIZES[ImageVariant.THUMBNAIL]
# (200, 200)

# 获取中图尺寸
medium_size = IMAGE_VARIANT_SIZES[ImageVariant.MEDIUM]
# (800, 600)
```

### 文件大小限制

```python
from app.utils.storage_keys import FileSizeLimit

max_size = FileSizeLimit.AVATAR  # 2MB
max_size = FileSizeLimit.COVER  # 5MB
```

---

## 完整示例

### 示例 1: 上传用户头像

```python
from app.core.storage import get_storage, get_storage_manager
from app.utils.file_validator import FileValidator
from app.utils.image_processor import ImageProcessor
from app.utils.storage_keys import (
    StorageBucket,
    FileType,
    FileSizeLimit,
    ImageVariant,
    IMAGE_VARIANT_SIZES,
)

def upload_user_avatar(user_id: int, file_data: bytes, filename: str):
    """上传用户头像"""
    
    # 1. 验证文件
    validator = FileValidator()
    is_valid, error = validator.validate_upload(
        filename=filename,
        content_type="image/jpeg",
        file_data=file_data,
        file_category="image",
        max_size=FileSizeLimit.AVATAR,
    )
    
    if not is_valid:
        raise ValueError(f"文件验证失败: {error}")
    
    # 2. 处理图片
    processor = ImageProcessor()
    
    # 压缩原图
    compressed = processor.compress_image(file_data, quality=90)
    
    # 生成缩略图
    thumbnail = processor.create_thumbnail(
        compressed,
        size=IMAGE_VARIANT_SIZES[ImageVariant.THUMBNAIL],
    )
    
    # 3. 上传文件
    manager = get_storage_manager()
    storage = get_storage()
    
    # 生成唯一文件名
    unique_filename = manager.generate_unique_filename(filename, prefix=f"user_{user_id}")
    
    # 上传原图
    original_path = storage.upload_file(
        file_data=compressed,
        object_name=unique_filename,
        bucket_name=StorageBucket.AVATARS,
        content_type="image/jpeg",
    )
    
    # 上传缩略图
    thumbnail_filename = manager._get_variant_filename(unique_filename, "thumbnail")
    thumbnail_path = storage.upload_file(
        file_data=thumbnail,
        object_name=thumbnail_filename,
        bucket_name=StorageBucket.AVATARS,
        content_type="image/jpeg",
    )
    
    # 4. 生成访问 URL
    from datetime import timedelta
    
    original_url = storage.get_file_url(
        object_name=original_path,
        bucket_name=StorageBucket.AVATARS,
        expires=timedelta(days=7),
    )
    
    thumbnail_url = storage.get_file_url(
        object_name=thumbnail_path,
        bucket_name=StorageBucket.AVATARS,
        expires=timedelta(days=7),
    )
    
    return {
        "original": {
            "path": original_path,
            "url": original_url,
        },
        "thumbnail": {
            "path": thumbnail_path,
            "url": thumbnail_url,
        },
    }
```

### 示例 2: 上传电影海报（多个变体）

```python
from app.utils.storage_keys import POSTER_IMAGE_VARIANTS

def upload_movie_poster(movie_id: int, file_data: bytes, filename: str):
    """上传电影海报（生成多个尺寸变体）"""
    
    # 1. 验证文件
    validator = FileValidator()
    is_valid, error = validator.validate_upload(
        filename=filename,
        content_type="image/jpeg",
        file_data=file_data,
        file_category="image",
        max_size=FileSizeLimit.COVER,
    )
    
    if not is_valid:
        raise ValueError(f"文件验证失败: {error}")
    
    # 2. 上传文件及其变体
    manager = get_storage_manager()
    
    unique_filename = manager.generate_path(
        file_type=FileType.POSTER,
        filename=f"movie_{movie_id}.jpg",
    )
    
    results = manager.upload_with_variants(
        file_data=file_data,
        filename=unique_filename,
        bucket_name=StorageBucket.MOVIE_POSTERS,
        content_type="image/jpeg",
        variants=POSTER_IMAGE_VARIANTS,
    )
    
    # 3. 生成所有变体的 URL
    storage = get_storage()
    from datetime import timedelta
    
    urls = {}
    for variant_name, variant_path in results.items():
        urls[variant_name] = storage.get_file_url(
            object_name=variant_path,
            bucket_name=StorageBucket.MOVIE_POSTERS,
            expires=timedelta(days=30),
        )
    
    return {
        "paths": results,
        "urls": urls,
    }
```

### 示例 3: FastAPI 上传端点

```python
from fastapi import APIRouter, UploadFile, File, HTTPException
from app.core.storage import get_storage_manager
from app.utils.file_validator import FileValidator
from app.utils.storage_keys import StorageBucket, FileSizeLimit

router = APIRouter()

@router.post("/upload/avatar")
async def upload_avatar(
    user_id: int,
    file: UploadFile = File(...),
):
    """上传用户头像"""
    
    # 读取文件
    file_data = await file.read()
    
    # 验证文件
    validator = FileValidator()
    is_valid, error = validator.validate_upload(
        filename=file.filename,
        content_type=file.content_type,
        file_data=file_data,
        file_category="image",
        max_size=FileSizeLimit.AVATAR,
    )
    
    if not is_valid:
        raise HTTPException(status_code=400, detail=error)
    
    # 上传文件
    try:
        result = upload_user_avatar(user_id, file_data, file.filename)
        return {
            "success": True,
            "data": result,
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
```

---

## 最佳实践

### 1. 文件命名规范

```python
# ✅ 好的做法：使用唯一文件名
filename = manager.generate_unique_filename("photo.jpg", prefix=f"user_{user_id}")

# ❌ 避免：直接使用用户上传的文件名
# filename = user_uploaded_filename  # 可能冲突或包含恶意字符
```

### 2. 始终验证文件

```python
# ✅ 好的做法：上传前验证文件
is_valid, error = validator.validate_upload(...)
if not is_valid:
    raise ValueError(error)

# ❌ 避免：直接上传未验证的文件
# storage.upload_file(...)  # 危险！
```

### 3. 适当使用图片压缩

```python
# ✅ 好的做法：根据用途选择合适的压缩质量
compressed = processor.compress_image(image_data, quality=85)  # 平衡质量和大小

# ❌ 避免：过度压缩导致质量损失
# compressed = processor.compress_image(image_data, quality=10)  # 质量太低
```

### 4. 为不同场景生成合适的变体

```python
# ✅ 好的做法：为列表页生成缩略图，详情页使用原图
variants = {
    "thumbnail": (200, 200),  # 列表页
    "medium": (800, 600),     # 预览
}

# ❌ 避免：所有场景都使用原图
# 浪费带宽和加载时间
```

### 5. 设置合理的 URL 过期时间

```python
# ✅ 好的做法：根据文件类型设置过期时间
# 用户头像：7天（经常访问）
avatar_url = storage.get_file_url(..., expires=timedelta(days=7))

# 临时文件：1小时
temp_url = storage.get_file_url(..., expires=timedelta(hours=1))

# ❌ 避免：所有文件都使用相同的过期时间
```

### 6. 错误处理

```python
# ✅ 好的做法：捕获并处理异常
try:
    storage.upload_file(...)
except StorageError as e:
    logger.error(f"上传失败: {e}")
    # 通知用户或重试

# ❌ 避免：忽略异常
# storage.upload_file(...)  # 可能静默失败
```

---

## 故障排查

### 问题 1: 无法连接到 MinIO

**症状**：`StorageError: 无法连接到 MinIO 服务`

**解决方案**：
1. 检查 MinIO 服务是否正在运行：`docker ps | grep minio`
2. 验证环境变量配置：`MINIO_ENDPOINT`, `MINIO_ACCESS_KEY`, `MINIO_SECRET_KEY`
3. 检查网络连接和防火墙设置

### 问题 2: 文件上传失败

**症状**：`StorageError: 文件上传失败`

**解决方案**：
1. 检查存储桶是否存在
2. 验证访问密钥是否正确
3. 检查文件大小是否超过限制
4. 查看 MinIO 服务器日志

### 问题 3: 图片处理失败

**症状**：`ImageProcessingError: 图片压缩失败`

**解决方案**：
1. 确认 Pillow 库已正确安装
2. 验证输入数据是否为有效的图片格式
3. 检查图片是否损坏
4. 尝试使用不同的输出格式

### 问题 4: URL 访问被拒绝

**症状**：访问预签名 URL 时返回 403 Forbidden

**解决方案**：
1. 检查 URL 是否已过期
2. 验证存储桶访问策略
3. 确认文件确实存在
4. 重新生成 URL

---

## 相关文档

- [MinIO 官方文档](https://min.io/docs/)
- [Pillow 文档](https://pillow.readthedocs.io/)
- [FastAPI 文件上传](https://fastapi.tiangolo.com/tutorial/request-files/)

---

**更新日期**: 2025-01-24  
**版本**: 1.0.0


