"""
管理员用户管理 API 路由
"""
from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session
from pydantic import BaseModel, Field, EmailStr
from typing import List, Optional
from datetime import datetime

from app.core.database import get_db
from app.api.dependencies.auth import get_current_admin
from app.models.user import User
from app.services.admin_service import admin_service


router = APIRouter(prefix="/users", tags=["管理员 - 用户"])


# ========== 请求/响应模型 ==========

class UserResponse(BaseModel):
    """用户响应模型"""
    id: int
    email: str
    username: Optional[str]
    full_name: Optional[str]
    avatar_url: Optional[str]
    role: str
    is_active: bool
    is_verified: bool
    created_at: datetime
    updated_at: datetime
    
    class Config:
        from_attributes = True


class UserListResponse(BaseModel):
    """用户列表响应"""
    users: List[UserResponse]
    total: int
    page: int
    page_size: int


class UserUpdateRequest(BaseModel):
    """用户更新请求"""
    email: Optional[EmailStr] = None
    username: Optional[str] = None
    full_name: Optional[str] = None
    role: Optional[str] = Field(None, pattern="^(user|admin)$")
    is_active: Optional[bool] = None


class CreateAdminRequest(BaseModel):
    """创建管理员请求"""
    email: EmailStr
    password: str = Field(..., min_length=6)
    username: Optional[str] = None
    full_name: Optional[str] = None


# ========== API 端点 ==========

@router.get("", response_model=UserListResponse, summary="获取用户列表")
def list_users(
    page: int = Query(1, ge=1, description="页码"),
    page_size: int = Query(20, ge=1, le=100, description="每页数量"),
    search: Optional[str] = Query(None, description="搜索关键词"),
    role: Optional[str] = Query(None, pattern="^(user|admin)$", description="角色筛选"),
    is_active: Optional[bool] = Query(None, description="状态筛选"),
    sort_by: str = Query("created_at", description="排序字段"),
    sort_desc: bool = Query(True, description="降序排序"),
    current_admin: User = Depends(get_current_admin),
    db: Session = Depends(get_db)
):
    """
    获取用户列表
    
    - **page**: 页码（从1开始）
    - **page_size**: 每页数量（1-100）
    - **search**: 搜索关键词（匹配邮箱、用户名、全名）
    - **role**: 角色筛选（user/admin）
    - **is_active**: 状态筛选
    - **sort_by**: 排序字段
    - **sort_desc**: 是否降序
    """
    skip = (page - 1) * page_size
    
    users, total = admin_service.list_users(
        db=db,
        skip=skip,
        limit=page_size,
        search=search,
        role=role,
        is_active=is_active,
        sort_by=sort_by,
        sort_desc=sort_desc
    )
    
    return UserListResponse(
        users=[UserResponse.model_validate(u) for u in users],
        total=total,
        page=page,
        page_size=page_size
    )


@router.get("/{user_id}", response_model=UserResponse, summary="获取用户详情")
def get_user_detail(
    user_id: int,
    current_admin: User = Depends(get_current_admin),
    db: Session = Depends(get_db)
):
    """
    获取用户详情
    
    - **user_id**: 用户ID
    """
    user = admin_service.get_user_detail(db, user_id)
    
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"用户 {user_id} 不存在"
        )
    
    return UserResponse.model_validate(user)


@router.put("/{user_id}", response_model=UserResponse, summary="更新用户")
def update_user(
    user_id: int,
    update_data: UserUpdateRequest,
    current_admin: User = Depends(get_current_admin),
    db: Session = Depends(get_db)
):
    """
    更新用户信息
    
    - **user_id**: 用户ID
    - **update_data**: 更新数据
    """
    # 防止管理员修改自己的角色和状态
    if user_id == current_admin.id:
        if update_data.role and update_data.role != current_admin.role.value:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="不能修改自己的角色"
            )
        if update_data.is_active is not None and not update_data.is_active:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="不能禁用自己的账号"
            )
    
    try:
        user = admin_service.update_user(
            db=db,
            user_id=user_id,
            email=update_data.email,
            username=update_data.username,
            full_name=update_data.full_name,
            role=update_data.role,
            is_active=update_data.is_active
        )
        return UserResponse.model_validate(user)
    
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e)
        )


@router.post("/{user_id}/toggle-status", response_model=UserResponse, summary="切换用户状态")
def toggle_user_status(
    user_id: int,
    current_admin: User = Depends(get_current_admin),
    db: Session = Depends(get_db)
):
    """
    切换用户状态（激活/禁用）
    
    - **user_id**: 用户ID
    """
    # 防止管理员禁用自己
    if user_id == current_admin.id:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="不能切换自己的状态"
        )
    
    try:
        user = admin_service.toggle_user_status(db, user_id)
        return UserResponse.model_validate(user)
    
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=str(e)
        )


@router.delete("/{user_id}", status_code=status.HTTP_204_NO_CONTENT, summary="删除用户")
def delete_user(
    user_id: int,
    hard_delete: bool = Query(False, description="是否硬删除"),
    current_admin: User = Depends(get_current_admin),
    db: Session = Depends(get_db)
):
    """
    删除用户
    
    - **user_id**: 用户ID
    - **hard_delete**: 是否硬删除（默认软删除，即禁用账号）
    """
    # 防止管理员删除自己
    if user_id == current_admin.id:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="不能删除自己的账号"
        )
    
    success = admin_service.delete_user(db, user_id, hard_delete=hard_delete)
    
    if not success:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"用户 {user_id} 不存在"
        )
    
    return None


@router.post("/create-admin", response_model=UserResponse, status_code=status.HTTP_201_CREATED, summary="创建管理员")
def create_admin_user(
    admin_data: CreateAdminRequest,
    current_admin: User = Depends(get_current_admin),
    db: Session = Depends(get_db)
):
    """
    创建管理员账号
    
    - **admin_data**: 管理员数据
    """
    try:
        user = admin_service.create_admin_user(
            db=db,
            email=admin_data.email,
            password=admin_data.password,
            username=admin_data.username,
            full_name=admin_data.full_name
        )
        return UserResponse.model_validate(user)
    
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e)
        )

