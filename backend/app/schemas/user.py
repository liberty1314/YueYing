"""
用户相关的 Pydantic Schemas
"""
from datetime import datetime
from typing import Optional
from pydantic import BaseModel, EmailStr, Field, validator


# ====================================
# 用户注册
# ====================================


class UserRegister(BaseModel):
    """用户注册请求"""

    email: EmailStr = Field(..., description="邮箱地址")
    username: str = Field(..., min_length=3, max_length=50, description="用户名")
    password: str = Field(..., min_length=6, max_length=100, description="密码")

    @validator("username")
    def username_alphanumeric(cls, v):
        """验证用户名只包含字母、数字、下划线和连字符"""
        if not v.replace("_", "").replace("-", "").isalnum():
            raise ValueError("用户名只能包含字母、数字、下划线和连字符")
        return v


# ====================================
# 用户登录
# ====================================


class UserLogin(BaseModel):
    """用户登录请求"""

    email: EmailStr = Field(..., description="邮箱地址")
    password: str = Field(..., description="密码")


class Token(BaseModel):
    """Token 响应"""

    access_token: str = Field(..., description="访问令牌")
    refresh_token: str = Field(..., description="刷新令牌")
    token_type: str = Field(default="bearer", description="令牌类型")


class TokenRefresh(BaseModel):
    """Token 刷新请求"""

    refresh_token: str = Field(..., description="刷新令牌")


# ====================================
# 用户信息
# ====================================


class UserBase(BaseModel):
    """用户基础信息"""

    email: EmailStr
    username: str
    is_active: bool = True


class UserCreate(UserBase):
    """创建用户（内部使用）"""

    password: str


class UserUpdate(BaseModel):
    """更新用户信息"""

    username: Optional[str] = Field(None, min_length=3, max_length=50)
    email: Optional[EmailStr] = None
    full_name: Optional[str] = Field(None, max_length=100)
    avatar_url: Optional[str] = None

    @validator("username")
    def username_alphanumeric(cls, v):
        """验证用户名"""
        if v and not v.replace("_", "").replace("-", "").isalnum():
            raise ValueError("用户名只能包含字母、数字、下划线和连字符")
        return v


class UserResponse(UserBase):
    """用户响应"""

    id: int
    full_name: Optional[str] = None
    avatar_url: Optional[str] = None
    is_verified: bool = False
    role: str = "user"  # 用户角色：user 或 admin
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True  # Pydantic v2 (orm_mode in v1)


class UserInDB(UserBase):
    """数据库中的用户（包含密码哈希）"""

    id: int
    hashed_password: str
    full_name: Optional[str] = None
    avatar_url: Optional[str] = None
    is_verified: bool = False
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True


# ====================================
# 密码相关
# ====================================


class PasswordChange(BaseModel):
    """修改密码请求"""

    old_password: str = Field(..., description="旧密码")
    new_password: str = Field(..., min_length=6, max_length=100, description="新密码")


class PasswordReset(BaseModel):
    """重置密码请求"""

    email: EmailStr = Field(..., description="邮箱地址")


class PasswordResetConfirm(BaseModel):
    """确认重置密码"""

    token: str = Field(..., description="重置令牌")
    new_password: str = Field(..., min_length=6, max_length=100, description="新密码")


# ====================================
# Token 数据
# ====================================


class TokenData(BaseModel):
    """Token 中的数据"""

    user_id: Optional[int] = None
    email: Optional[str] = None
    type: Optional[str] = None  # "access" or "refresh"

