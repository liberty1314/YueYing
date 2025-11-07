"""
认证服务

处理用户注册、登录、Token 验证等业务逻辑
"""
from datetime import timedelta
from typing import Optional
from sqlalchemy.orm import Session
from fastapi import HTTPException, status
from loguru import logger

from app.core.security import (
    verify_password,
    get_password_hash,
    create_access_token,
    create_refresh_token,
    decode_token,
)
from app.core.config import settings
from app.models.user import User, UserRole
from app.schemas.user import UserRegister, UserLogin, UserCreate, Token, TokenData


class AuthService:
    """认证服务类"""

    @staticmethod
    def register_user(db: Session, user_data: UserRegister) -> User:
        """
        注册新用户

        Args:
            db: 数据库会话
            user_data: 用户注册数据

        Returns:
            创建的用户对象

        Raises:
            HTTPException: 邮箱或用户名已存在
        """
        # 检查邮箱是否已存在
        existing_user = db.query(User).filter(User.email == user_data.email).first()
        if existing_user:
            logger.warning(f"尝试使用已存在的邮箱注册: {user_data.email}")
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="该邮箱已被注册",
            )

        # 检查用户名是否已存在
        existing_username = (
            db.query(User).filter(User.username == user_data.username).first()
        )
        if existing_username:
            logger.warning(f"尝试使用已存在的用户名注册: {user_data.username}")
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="该用户名已被使用",
            )

        # 创建新用户
        hashed_password = get_password_hash(user_data.password)
        db_user = User(
            email=user_data.email,
            username=user_data.username,
            hashed_password=hashed_password,
            is_active=True,
        )

        db.add(db_user)
        db.commit()
        db.refresh(db_user)

        logger.info(f"新用户注册成功: {db_user.email} (ID: {db_user.id})")
        return db_user

    @staticmethod
    def authenticate_user(db: Session, login_data: UserLogin) -> Optional[User]:
        """
        验证用户凭据

        Args:
            db: 数据库会话
            login_data: 登录数据

        Returns:
            验证成功返回用户对象，失败返回 None
        """
        user = db.query(User).filter(User.email == login_data.email).first()

        if not user:
            logger.warning(f"登录失败: 用户不存在 ({login_data.email})")
            return None

        if not verify_password(login_data.password, user.hashed_password):
            logger.warning(f"登录失败: 密码错误 ({login_data.email})")
            return None

        if not user.is_active:
            logger.warning(f"登录失败: 用户已被禁用 ({login_data.email})")
            return None

        logger.info(f"用户登录成功: {user.email} (ID: {user.id})")
        return user

    @staticmethod
    def create_user_tokens(user: User, remember_me: bool = False) -> Token:
        """
        为用户创建访问令牌和刷新令牌

        Args:
            user: 用户对象
            remember_me: 是否启用"记住我"（7天有效期）

        Returns:
            包含 access_token 和 refresh_token 的 Token 对象
        """
        # 根据 remember_me 设置不同的过期时间
        if remember_me:
            # 记住我：7天有效期
            access_token_expires = timedelta(days=7)
            logger.info(f"用户 {user.email} 启用了'记住我'功能，token有效期7天")
        else:
            # 默认：30分钟有效期
            access_token_expires = timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
        
        # 创建 access token
        access_token = create_access_token(
            data={"sub": str(user.id), "email": user.email},
            expires_delta=access_token_expires,
        )

        # 创建 refresh token
        refresh_token = create_refresh_token(
            data={"sub": str(user.id), "email": user.email}
        )

        return Token(
            access_token=access_token,
            refresh_token=refresh_token,
            token_type="bearer",
        )

    @staticmethod
    def refresh_access_token(refresh_token: str) -> str:
        """
        使用刷新令牌生成新的访问令牌

        Args:
            refresh_token: 刷新令牌

        Returns:
            新的访问令牌

        Raises:
            HTTPException: 刷新令牌无效或已过期
        """
        payload = decode_token(refresh_token)

        if not payload:
            logger.warning("Token 刷新失败: 无效的刷新令牌")
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="无效的刷新令牌",
                headers={"WWW-Authenticate": "Bearer"},
            )

        # 验证 token 类型
        token_type = payload.get("type")
        if token_type != "refresh":
            logger.warning("Token 刷新失败: 令牌类型错误")
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="令牌类型错误",
                headers={"WWW-Authenticate": "Bearer"},
            )

        # 创建新的 access token
        user_id = payload.get("sub")
        email = payload.get("email")

        access_token_expires = timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
        new_access_token = create_access_token(
            data={"sub": user_id, "email": email},
            expires_delta=access_token_expires,
        )

        logger.info(f"Token 刷新成功: 用户 ID {user_id}")
        return new_access_token

    @staticmethod
    def get_user_by_id(db: Session, user_id: int) -> Optional[User]:
        """
        根据 ID 获取用户

        Args:
            db: 数据库会话
            user_id: 用户 ID

        Returns:
            用户对象，不存在返回 None
        """
        return db.query(User).filter(User.id == user_id).first()

    @staticmethod
    def get_user_by_email(db: Session, email: str) -> Optional[User]:
        """
        根据邮箱获取用户

        Args:
            db: 数据库会话
            email: 邮箱地址

        Returns:
            用户对象，不存在返回 None
        """
        return db.query(User).filter(User.email == email).first()

    @staticmethod
    def verify_token(token: str) -> TokenData:
        """
        验证并解析 Token

        Args:
            token: JWT token

        Returns:
            Token 数据

        Raises:
            HTTPException: Token 无效或已过期
        """
        payload = decode_token(token)

        if not payload:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="无效的认证凭据",
                headers={"WWW-Authenticate": "Bearer"},
            )

        user_id: str = payload.get("sub")
        email: str = payload.get("email")
        token_type: str = payload.get("type")

        if user_id is None:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="无效的认证凭据",
                headers={"WWW-Authenticate": "Bearer"},
            )

        return TokenData(user_id=int(user_id), email=email, type=token_type)

    @staticmethod
    def change_password(
        db: Session, user: User, old_password: str, new_password: str
    ) -> bool:
        """
        修改用户密码

        Args:
            db: 数据库会话
            user: 用户对象
            old_password: 旧密码
            new_password: 新密码

        Returns:
            修改成功返回 True

        Raises:
            HTTPException: 旧密码错误
        """
        # 验证旧密码
        if not verify_password(old_password, user.hashed_password):
            logger.warning(f"修改密码失败: 旧密码错误 (用户 ID: {user.id})")
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="旧密码错误",
            )

        # 更新密码
        user.hashed_password = get_password_hash(new_password)
        db.commit()

        logger.info(f"用户密码修改成功: {user.email} (ID: {user.id})")
        return True

    @staticmethod
    def initialize_admin(db: Session) -> Optional[User]:
        """
        从环境变量初始化管理员账户
        
        该方法在应用启动时执行，从 .env 文件读取管理员配置：
        - ADMIN_USERNAME: 管理员用户名
        - ADMIN_PASSWORD: 管理员密码（明文，将自动加密）
        - ADMIN_EMAIL: 管理员邮箱（可选）
        
        如果数据库中不存在该用户名，则创建管理员账户；
        如果已存在，则跳过创建。

        Args:
            db: 数据库会话

        Returns:
            创建的管理员用户对象，如果已存在或未配置则返回 None
        """
        # 检查是否配置了管理员信息
        if not settings.ADMIN_USERNAME or not settings.ADMIN_PASSWORD:
            logger.info("未配置管理员账户信息 (ADMIN_USERNAME 或 ADMIN_PASSWORD)，跳过管理员初始化")
            return None
        
        # 检查数据库中是否已存在该用户名
        existing_user = db.query(User).filter(User.username == settings.ADMIN_USERNAME).first()
        
        if existing_user:
            logger.info(f"管理员账户已存在: {settings.ADMIN_USERNAME}，跳过初始化")
            return None
        
        # 准备邮箱地址
        admin_email = settings.ADMIN_EMAIL
        if not admin_email:
            # 如果未配置邮箱，使用默认格式
            admin_email = f"{settings.ADMIN_USERNAME}@admin.local"
        
        # 检查邮箱是否已被使用
        existing_email = db.query(User).filter(User.email == admin_email).first()
        if existing_email:
            logger.warning(
                f"管理员初始化失败: 邮箱 {admin_email} 已被用户 {existing_email.username} 使用"
            )
            return None
        
        # 创建管理员账户
        try:
            hashed_password = get_password_hash(settings.ADMIN_PASSWORD)
            admin_user = User(
                username=settings.ADMIN_USERNAME,
                email=admin_email,
                hashed_password=hashed_password,
                role=UserRole.ADMIN,
                is_active=True,
                is_verified=True,  # 管理员账户默认已验证
                full_name="系统管理员",
            )
            
            db.add(admin_user)
            db.commit()
            db.refresh(admin_user)
            
            logger.info(
                f"✅ 管理员账户初始化成功: {admin_user.username} (ID: {admin_user.id}, Email: {admin_user.email})"
            )
            return admin_user
            
        except Exception as e:
            db.rollback()
            logger.error(f"管理员账户初始化失败: {e}")
            return None


# 创建全局认证服务实例
auth_service = AuthService()

