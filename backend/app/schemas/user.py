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
    remember_me: bool = Field(default=False, description="记住我（7天有效期）")


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
    is_admin: bool = False  # 是否为管理员（将从 role 字段计算）
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True  # Pydantic v2 (orm_mode in v1)
        
    @validator('is_admin', pre=True, always=True)
    def compute_is_admin(cls, v, values):
        """根据 role 字段计算 is_admin"""
        # 如果 v 是方法，调用它
        if callable(v):
            return v()
        # 如果已经是布尔值，直接返回
        if isinstance(v, bool):
            return v
        # 否则根据 role 判断
        role = values.get('role', 'user')
        return role == 'admin' or str(role).endswith('ADMIN')
    
    @validator('role', pre=True)
    def convert_role_enum(cls, v):
        """转换 UserRole 枚举为字符串"""
        if hasattr(v, 'value'):
            return v.value
        return str(v)


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

