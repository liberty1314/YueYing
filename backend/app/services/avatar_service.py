"""
头像上传服务
"""
import os
import uuid
from pathlib import Path
from typing import Optional
from fastapi import UploadFile, HTTPException, status
from PIL import Image
from io import BytesIO
from loguru import logger

from app.core.config import settings


class AvatarService:
    """头像上传和管理服务"""
    
    # 允许的图片格式
    ALLOWED_EXTENSIONS = {"jpg", "jpeg", "png", "webp"}
    ALLOWED_CONTENT_TYPES = {
        "image/jpeg",
        "image/png", 
        "image/webp"
    }
    
    # 文件大小限制 (2MB)
    MAX_FILE_SIZE = 2 * 1024 * 1024
    
    # 头像尺寸
    AVATAR_SIZE = (400, 400)
    
    @staticmethod
    def get_upload_dir() -> Path:
        """获取上传目录路径"""
        # 使用后端根目录下的 uploads/avatars
        # 找到 backend 目录
        current_file = Path(__file__)
        backend_dir = current_file.parent.parent.parent  # app/services/avatar_service.py -> backend/
        upload_dir = backend_dir / "uploads" / "avatars"
        upload_dir.mkdir(parents=True, exist_ok=True)
        return upload_dir
    
    @staticmethod
    def validate_image_file(file: UploadFile) -> None:
        """
        验证上传的图片文件
        
        Args:
            file: 上传的文件对象
            
        Raises:
            HTTPException: 如果文件不符合要求
        """
        # 检查文件类型
        if file.content_type not in AvatarService.ALLOWED_CONTENT_TYPES:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"不支持的文件类型。仅支持: {', '.join(AvatarService.ALLOWED_EXTENSIONS)}"
            )
        
        # 检查文件扩展名
        if file.filename:
            ext = file.filename.rsplit(".", 1)[-1].lower() if "." in file.filename else ""
            if ext not in AvatarService.ALLOWED_EXTENSIONS:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail=f"不支持的文件扩展名。仅支持: {', '.join(AvatarService.ALLOWED_EXTENSIONS)}"
                )
    
    @staticmethod
    async def save_avatar(file: UploadFile, user_id: int) -> str:
        """
        保存用户头像
        
        Args:
            file: 上传的文件对象
            user_id: 用户ID
            
        Returns:
            str: 头像的访问URL
            
        Raises:
            HTTPException: 如果保存失败
        """
        try:
            # 验证文件
            AvatarService.validate_image_file(file)
            
            # 读取文件内容
            contents = await file.read()
            
            # 检查文件大小
            if len(contents) > AvatarService.MAX_FILE_SIZE:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail=f"文件大小超过限制 ({AvatarService.MAX_FILE_SIZE / 1024 / 1024}MB)"
                )
            
            # 使用 Pillow 打开图片并验证
            try:
                image = Image.open(BytesIO(contents))
                image.verify()  # 验证图片完整性
                
                # 重新打开图片进行处理 (verify会关闭文件)
                image = Image.open(BytesIO(contents))
                
                # 转换为RGB模式 (处理RGBA等格式)
                if image.mode in ("RGBA", "LA", "P"):
                    # 创建白色背景
                    background = Image.new("RGB", image.size, (255, 255, 255))
                    if image.mode == "P":
                        image = image.convert("RGBA")
                    background.paste(image, mask=image.split()[-1] if image.mode in ("RGBA", "LA") else None)
                    image = background
                elif image.mode != "RGB":
                    image = image.convert("RGB")
                
                # 调整大小 (保持比例，裁剪为正方形)
                image.thumbnail(AvatarService.AVATAR_SIZE, Image.Resampling.LANCZOS)
                
                # 创建正方形画布
                final_image = Image.new("RGB", AvatarService.AVATAR_SIZE, (255, 255, 255))
                offset = ((AvatarService.AVATAR_SIZE[0] - image.width) // 2,
                         (AvatarService.AVATAR_SIZE[1] - image.height) // 2)
                final_image.paste(image, offset)
                
            except Exception as e:
                logger.error(f"图片处理失败: {e}")
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail="无效的图片文件"
                )
            
            # 生成唯一文件名
            file_ext = "jpg"  # 统一保存为jpg格式
            filename = f"avatar_{user_id}_{uuid.uuid4().hex[:8]}.{file_ext}"
            
            # 获取上传目录
            upload_dir = AvatarService.get_upload_dir()
            file_path = upload_dir / filename
            
            # 删除该用户之前的头像文件
            AvatarService.delete_old_avatars(user_id, upload_dir)
            
            # 保存处理后的图片
            final_image.save(file_path, "JPEG", quality=90, optimize=True)
            
            # 返回访问URL
            avatar_url = f"/uploads/avatars/{filename}"
            logger.info(f"用户 {user_id} 的头像已保存: {avatar_url}")
            
            return avatar_url
            
        except HTTPException:
            raise
        except Exception as e:
            logger.error(f"保存头像失败: {e}")
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="保存头像失败"
            )
    
    @staticmethod
    def delete_old_avatars(user_id: int, upload_dir: Path) -> None:
        """
        删除用户的旧头像文件
        
        Args:
            user_id: 用户ID
            upload_dir: 上传目录
        """
        try:
            pattern = f"avatar_{user_id}_*"
            for old_file in upload_dir.glob(pattern):
                try:
                    old_file.unlink()
                    logger.debug(f"已删除旧头像: {old_file}")
                except Exception as e:
                    logger.warning(f"删除旧头像失败 {old_file}: {e}")
        except Exception as e:
            logger.warning(f"清理旧头像时出错: {e}")
    
    @staticmethod
    def delete_avatar(avatar_url: Optional[str]) -> None:
        """
        删除头像文件
        
        Args:
            avatar_url: 头像URL
        """
        if not avatar_url:
            return
        
        try:
            # 从URL提取文件名
            if avatar_url.startswith("/uploads/avatars/"):
                filename = avatar_url.split("/")[-1]
                upload_dir = AvatarService.get_upload_dir()
                file_path = upload_dir / filename
                
                if file_path.exists():
                    file_path.unlink()
                    logger.info(f"已删除头像: {file_path}")
        except Exception as e:
            logger.warning(f"删除头像失败 {avatar_url}: {e}")


avatar_service = AvatarService()
