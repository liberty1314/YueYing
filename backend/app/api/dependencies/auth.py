"""
认证依赖项

提供用于路由的认证和授权依赖
"""
from typing import Optional
from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.models.user import User
from app.services.auth import auth_service
from app.schemas.user import TokenData

# HTTP Bearer 认证方案
security = HTTPBearer()


def get_current_user(
    credentials: HTTPAuthorizationCredentials = Depends(security),
    db: Session = Depends(get_db),
) -> User:
    """
    获取当前登录用户

    Args:
        credentials: HTTP Bearer 凭据
        db: 数据库会话

    Returns:
        当前用户对象

    Raises:
        HTTPException: 认证失败
    """
    token = credentials.credentials

    # 验证 token
    token_data = auth_service.verify_token(token)

    # 获取用户
    user = auth_service.get_user_by_id(db, user_id=token_data.user_id)

    if user is None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="用户不存在",
            headers={"WWW-Authenticate": "Bearer"},
        )

    if not user.is_active:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="用户已被禁用",
        )

    return user


def get_current_active_user(
    current_user: User = Depends(get_current_user),
) -> User:
    """
    获取当前活跃用户（已验证且未被禁用）

    Args:
        current_user: 当前用户

    Returns:
        当前活跃用户

    Raises:
        HTTPException: 用户已被禁用
    """
    if not current_user.is_active:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="用户已被禁用",
        )
    return current_user


def get_optional_current_user(
    credentials: Optional[HTTPAuthorizationCredentials] = Depends(
        HTTPBearer(auto_error=False)
    ),
    db: Session = Depends(get_db),
) -> Optional[User]:
    """
    获取当前用户（可选）

    如果提供了有效的认证凭据，返回用户对象；否则返回 None
    用于那些既可以匿名访问，也可以登录访问的端点

    Args:
        credentials: HTTP Bearer 凭据（可选）
        db: 数据库会话

    Returns:
        用户对象或 None
    """
    if credentials is None:
        return None

    try:
        token = credentials.credentials
        token_data = auth_service.verify_token(token)
        user = auth_service.get_user_by_id(db, user_id=token_data.user_id)

        if user and user.is_active:
            return user
    except HTTPException:
        return None

    return None

