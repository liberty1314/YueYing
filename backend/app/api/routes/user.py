"""
用户头像上传 API 路由
"""
from fastapi import APIRouter, Depends, UploadFile, File, HTTPException, status
from sqlalchemy.orm import Session
from loguru import logger

from app.core.database import get_db
from app.api.dependencies.auth import get_current_user
from app.models.user import User
from app.schemas.user import UserResponse
from app.services.avatar_service import avatar_service


router = APIRouter(prefix="/user", tags=["用户"])


@router.post(
    "/avatar",
    response_model=UserResponse,
    summary="上传头像",
    description="上传并更新用户头像。仅支持 JPG/PNG/WEBP 格式，最大 2MB。",
)
async def upload_avatar(
    file: UploadFile = File(..., description="头像图片文件"),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """
    上传用户头像
    
    - 支持的格式: JPG, PNG, WEBP
    - 最大文件大小: 2MB
    - 图片会自动调整为 400x400 像素
    - 自动删除该用户之前的头像
    """
    try:
        # 保存头像并获取URL
        avatar_url = await avatar_service.save_avatar(file, current_user.id)
        
        # 更新用户的头像URL
        current_user.avatar_url = avatar_url
        db.commit()
        db.refresh(current_user)
        
        logger.info(f"用户 {current_user.id} ({current_user.email}) 更新了头像")
        
        return current_user
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"上传头像失败 (用户 {current_user.id}): {e}")
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="上传头像失败"
        )


@router.delete(
    "/avatar",
    response_model=UserResponse,
    summary="删除头像",
    description="删除用户头像，恢复为默认头像",
)
async def delete_avatar(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """
    删除用户头像
    
    删除头像文件并将数据库中的头像URL设置为 None
    """
    try:
        # 删除头像文件
        if current_user.avatar_url:
            avatar_service.delete_avatar(current_user.avatar_url)
        
        # 更新数据库
        current_user.avatar_url = None
        db.commit()
        db.refresh(current_user)
        
        logger.info(f"用户 {current_user.id} ({current_user.email}) 删除了头像")
        
        return current_user
        
    except Exception as e:
        logger.error(f"删除头像失败 (用户 {current_user.id}): {e}")
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="删除头像失败"
        )
