"""
对象存储相关常量

定义存储桶名称、文件路径前缀、文件类型配置等
"""
from enum import Enum


class StorageBucket(str, Enum):
    """存储桶名称"""

    # 用户头像
    AVATARS = "avatars"

    # 用户上传的图片
    USER_IMAGES = "user-images"

    # 电影海报
    MOVIE_POSTERS = "movie-posters"

    # 书籍封面
    BOOK_COVERS = "book-covers"

    # 动漫封面
    ANIME_COVERS = "anime-covers"

    # 系统资源
    SYSTEM = "system"

    # 临时文件
    TEMP = "temp"


class FileType(str, Enum):
    """文件类型"""

    # 头像
    AVATAR = "avatar"

    # 封面
    COVER = "cover"

    # 海报
    POSTER = "poster"

    # 背景
    BACKGROUND = "background"

    # 截图
    SCREENSHOT = "screenshot"

    # 缩略图
    THUMBNAIL = "thumbnail"

    # 其他
    OTHER = "other"


class ImageVariant(str, Enum):
    """图片变体类型"""

    # 原图
    ORIGINAL = "original"

    # 大图 (1920x1080)
    LARGE = "large"

    # 中图 (800x600)
    MEDIUM = "medium"

    # 小图 (400x300)
    SMALL = "small"

    # 缩略图 (200x200)
    THUMBNAIL = "thumbnail"


# 图片变体尺寸配置
IMAGE_VARIANT_SIZES = {
    ImageVariant.LARGE: (1920, 1080),
    ImageVariant.MEDIUM: (800, 600),
    ImageVariant.SMALL: (400, 300),
    ImageVariant.THUMBNAIL: (200, 200),
}


# 文件大小限制（字节）
class FileSizeLimit(int, Enum):
    """文件大小限制"""

    # 头像: 2MB
    AVATAR = 2 * 1024 * 1024

    # 封面/海报: 5MB
    COVER = 5 * 1024 * 1024

    # 背景: 10MB
    BACKGROUND = 10 * 1024 * 1024

    # 截图: 5MB
    SCREENSHOT = 5 * 1024 * 1024

    # 默认: 10MB
    DEFAULT = 10 * 1024 * 1024


# 文件类型与存储桶的映射
FILE_TYPE_BUCKET_MAP = {
    FileType.AVATAR: StorageBucket.AVATARS,
    FileType.COVER: StorageBucket.MOVIE_POSTERS,
    FileType.POSTER: StorageBucket.MOVIE_POSTERS,
    FileType.BACKGROUND: StorageBucket.USER_IMAGES,
    FileType.SCREENSHOT: StorageBucket.USER_IMAGES,
    FileType.THUMBNAIL: StorageBucket.USER_IMAGES,
    FileType.OTHER: StorageBucket.USER_IMAGES,
}


# 文件类型与大小限制的映射
FILE_TYPE_SIZE_LIMIT_MAP = {
    FileType.AVATAR: FileSizeLimit.AVATAR,
    FileType.COVER: FileSizeLimit.COVER,
    FileType.POSTER: FileSizeLimit.COVER,
    FileType.BACKGROUND: FileSizeLimit.BACKGROUND,
    FileType.SCREENSHOT: FileSizeLimit.SCREENSHOT,
    FileType.OTHER: FileSizeLimit.DEFAULT,
}


# 需要生成变体的文件类型
FILE_TYPES_WITH_VARIANTS = {
    FileType.COVER,
    FileType.POSTER,
    FileType.BACKGROUND,
}


# 默认图片变体配置
DEFAULT_IMAGE_VARIANTS = {
    ImageVariant.THUMBNAIL: IMAGE_VARIANT_SIZES[ImageVariant.THUMBNAIL],
    ImageVariant.MEDIUM: IMAGE_VARIANT_SIZES[ImageVariant.MEDIUM],
}


# 海报/封面图片变体配置
POSTER_IMAGE_VARIANTS = {
    ImageVariant.LARGE: IMAGE_VARIANT_SIZES[ImageVariant.LARGE],
    ImageVariant.MEDIUM: IMAGE_VARIANT_SIZES[ImageVariant.MEDIUM],
    ImageVariant.SMALL: IMAGE_VARIANT_SIZES[ImageVariant.SMALL],
    ImageVariant.THUMBNAIL: IMAGE_VARIANT_SIZES[ImageVariant.THUMBNAIL],
}


