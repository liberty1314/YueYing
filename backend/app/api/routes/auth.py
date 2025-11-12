"""
认证相关路由

处理用户注册、登录、Token 刷新等
"""
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from loguru import logger
from datetime import datetime

from app.core.database import get_db
from app.schemas.user import (
    UserRegister,
    UserLogin,
    UserResponse,
    Token,
    TokenRefresh,
    PasswordChange,
)
from app.services.auth import auth_service
from app.services.user_items_cache import user_items_cache_service
from app.api.dependencies.auth import get_current_active_user
from app.models.user import User

router = APIRouter(prefix="/auth", tags=["认证"])


@router.post(
    "/register",
    response_model=UserResponse,
    status_code=status.HTTP_201_CREATED,
    summary="用户注册",
    description="创建新用户账户"
)
def register(
    user_data: UserRegister,
    db: Session = Depends(get_db),
):
    """
    用户注册

    创建新用户账户
    """
    user = auth_service.register_user(db, user_data)
    return user


@router.post(
    "/login",
    response_model=Token,
    summary="用户登录",
    description="验证用户凭据并返回访问令牌和刷新令牌"
)
def login(
    login_data: UserLogin,
    db: Session = Depends(get_db),
):
    """
    用户登录

    验证用户凭据并返回访问令牌和刷新令牌
    """
    user = auth_service.authenticate_user(db, login_data)

    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="邮箱或密码错误",
            headers={"WWW-Authenticate": "Bearer"},
        )

    # 注意：last_login_at 将在后续的 API 调用中通过 get_current_user 依赖自动更新
    # 这里不需要手动更新，以避免重复写入

    tokens = auth_service.create_user_tokens(user, remember_me=login_data.remember_me)
    return tokens


@router.post(
    "/refresh",
    response_model=dict,
    summary="刷新令牌",
    description="使用刷新令牌获取新的访问令牌"
)
def refresh_token(
    refresh_data: TokenRefresh,
):
    """
    刷新访问令牌

    使用刷新令牌获取新的访问令牌
    """
    new_access_token = auth_service.refresh_access_token(refresh_data.refresh_token)

    return {
        "access_token": new_access_token,
        "token_type": "bearer",
    }


@router.get(
    "/me",
    response_model=UserResponse,
    summary="获取当前用户信息",
    description="返回当前登录用户的详细信息"
)
def get_current_user_info(
    current_user: User = Depends(get_current_active_user),
):
    """
    获取当前用户信息

    返回当前登录用户的详细信息
    """
    return current_user


@router.post(
    "/change-password",
    response_model=dict,
    summary="修改密码",
    description="修改当前用户的密码"
)
def change_password(
    password_data: PasswordChange,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db),
):
    """
    修改密码

    修改当前用户的密码
    """
    auth_service.change_password(
        db=db,
        user=current_user,
        old_password=password_data.old_password,
        new_password=password_data.new_password,
    )

    logger.info(f"用户 {current_user.email} 修改密码成功")

    return {
        "message": "密码修改成功",
        "success": True,
    }


@router.post(
    "/logout",
    response_model=dict,
    summary="退出登录",
    description="退出登录（客户端应删除本地存储的 token）"
)
async def logout(
    current_user: User = Depends(get_current_active_user),
):
    """
    退出登录

    注意：由于使用 JWT，服务端无法真正注销 token
    客户端应该删除本地存储的 token
    
    退出时会清除用户的记录缓存
    """
    logger.info(f"用户 {current_user.email} 退出登录")
    
    # 清除用户记录缓存
    await user_items_cache_service.clear_user_cache(current_user.id)
    logger.debug(f"已清除用户 {current_user.id} 的记录缓存")

    return {
        "message": "退出登录成功",
        "success": True,
    }

