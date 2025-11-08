"""
管理员服务 - 用户管理和后台统计
"""
from typing import List, Optional, Tuple
from sqlalchemy.orm import Session
from sqlalchemy import func, or_, and_
from datetime import datetime, timedelta
from loguru import logger

from app.models.user import User, UserRole
from app.models.user_item import UserItem
from app.models.conversation import Conversation
from app.models.summary import Summary
from app.services.auth import auth_service
from app.schemas.user import UserRegister


class AdminService:
    """管理员服务"""
    
    @staticmethod
    def create_admin_user(
        db: Session,
        email: str,
        password: str,
        username: Optional[str] = None,
        full_name: Optional[str] = None
    ) -> User:
        """
        创建管理员账号
        
        Args:
            db: 数据库会话
            email: 邮箱
            password: 密码
            username: 用户名（可选）
            full_name: 全名（可选）
        
        Returns:
            创建的管理员用户
        """
        # 检查邮箱是否已存在
        existing_user = db.query(User).filter(User.email == email).first()
        if existing_user:
            raise ValueError(f"邮箱 {email} 已存在")
        
        # 创建用户数据
        user_data = UserRegister(
            email=email,
            password=password,
            username=username,
            full_name=full_name
        )
        
        # 使用 auth_service 创建用户
        user = auth_service.register_user(db, user_data)
        
        # 设置为管理员
        user.role = UserRole.ADMIN
        db.commit()
        db.refresh(user)
        
        logger.info(f"Created admin user: {email}")
        return user
    
    @staticmethod
    def list_users(
        db: Session,
        skip: int = 0,
        limit: int = 20,
        search: Optional[str] = None,
        role: Optional[str] = None,
        is_active: Optional[bool] = None,
        sort_by: str = "created_at",
        sort_desc: bool = True
    ) -> Tuple[List[User], int]:
        """
        获取用户列表
        
        Args:
            db: 数据库会话
            skip: 跳过的记录数
            limit: 返回的记录数
            search: 搜索关键词（匹配邮箱、用户名、全名）
            role: 角色筛选
            is_active: 状态筛选
            sort_by: 排序字段
            sort_desc: 是否降序
        
        Returns:
            (用户列表, 总数)
        """
        query = db.query(User)
        
        # 搜索过滤
        if search:
            search_pattern = f"%{search}%"
            query = query.filter(
                or_(
                    User.email.ilike(search_pattern),
                    User.username.ilike(search_pattern),
                    User.full_name.ilike(search_pattern)
                )
            )
        
        # 角色过滤
        if role:
            try:
                role_enum = UserRole(role)
                query = query.filter(User.role == role_enum)
            except ValueError:
                pass
        
        # 状态过滤
        if is_active is not None:
            query = query.filter(User.is_active == is_active)
        
        # 获取总数
        total = query.count()
        
        # 排序
        sort_column = getattr(User, sort_by, User.created_at)
        if sort_desc:
            query = query.order_by(sort_column.desc())
        else:
            query = query.order_by(sort_column.asc())
        
        # 分页
        users = query.offset(skip).limit(limit).all()
        
        return users, total
    
    @staticmethod
    def get_user_detail(db: Session, user_id: int) -> Optional[User]:
        """
        获取用户详情
        
        Args:
            db: 数据库会话
            user_id: 用户ID
        
        Returns:
            用户对象或None
        """
        return db.query(User).filter(User.id == user_id).first()
    
    @staticmethod
    def update_user(
        db: Session,
        user_id: int,
        email: Optional[str] = None,
        username: Optional[str] = None,
        full_name: Optional[str] = None,
        role: Optional[str] = None,
        is_active: Optional[bool] = None
    ) -> User:
        """
        更新用户信息
        
        Args:
            db: 数据库会话
            user_id: 用户ID
            email: 新邮箱
            username: 新用户名
            full_name: 新全名
            role: 新角色
            is_active: 新状态
        
        Returns:
            更新后的用户
        """
        user = db.query(User).filter(User.id == user_id).first()
        if not user:
            raise ValueError(f"用户 {user_id} 不存在")
        
        # 更新邮箱（检查唯一性）
        if email and email != user.email:
            existing = db.query(User).filter(
                User.email == email,
                User.id != user_id
            ).first()
            if existing:
                raise ValueError(f"邮箱 {email} 已被使用")
            user.email = email
        
        # 更新用户名（检查唯一性）
        if username and username != user.username:
            existing = db.query(User).filter(
                User.username == username,
                User.id != user_id
            ).first()
            if existing:
                raise ValueError(f"用户名 {username} 已被使用")
            user.username = username
        
        # 更新其他字段
        if full_name is not None:
            user.full_name = full_name
        
        if role:
            try:
                user.role = UserRole(role)
            except ValueError:
                raise ValueError(f"无效的角色: {role}")
        
        if is_active is not None:
            user.is_active = is_active
        
        user.updated_at = datetime.utcnow()
        db.commit()
        db.refresh(user)
        
        logger.info(f"Updated user {user_id}: email={email}, username={username}, role={role}, is_active={is_active}")
        return user
    
    @staticmethod
    def toggle_user_status(db: Session, user_id: int) -> User:
        """
        切换用户状态（激活/禁用）
        
        Args:
            db: 数据库会话
            user_id: 用户ID
        
        Returns:
            更新后的用户
        """
        user = db.query(User).filter(User.id == user_id).first()
        if not user:
            raise ValueError(f"用户 {user_id} 不存在")
        
        user.is_active = not user.is_active
        user.updated_at = datetime.utcnow()
        db.commit()
        db.refresh(user)
        
        status_text = "激活" if user.is_active else "禁用"
        logger.info(f"{status_text}用户 {user_id}: {user.email}")
        
        return user
    
    @staticmethod
    def delete_user(db: Session, user_id: int, hard_delete: bool = False) -> bool:
        """
        删除用户
        
        Args:
            db: 数据库会话
            user_id: 用户ID
            hard_delete: 是否硬删除（默认软删除）
        
        Returns:
            是否删除成功
        """
        user = db.query(User).filter(User.id == user_id).first()
        if not user:
            return False
        
        if hard_delete:
            # 硬删除：从数据库中完全删除
            db.delete(user)
            logger.warning(f"Hard deleted user {user_id}: {user.email}")
        else:
            # 软删除：设置为禁用状态
            user.is_active = False
            user.updated_at = datetime.utcnow()
            logger.info(f"Soft deleted (disabled) user {user_id}: {user.email}")
        
        db.commit()
        return True
    
    @staticmethod
    def get_admin_stats(db: Session) -> dict:
        """
        获取管理后台统计数据
        
        Args:
            db: 数据库会话
        
        Returns:
            统计数据字典
        """
        # 用户统计
        total_users = db.query(func.count(User.id)).scalar()
        active_users = db.query(func.count(User.id)).filter(User.is_active == True).scalar()
        admin_users = db.query(func.count(User.id)).filter(User.role == UserRole.ADMIN).scalar()
        
        # 最近注册用户（最近7天）
        seven_days_ago = datetime.utcnow() - timedelta(days=7)
        new_users_7d = db.query(func.count(User.id)).filter(
            User.created_at >= seven_days_ago
        ).scalar()
        
        # 内容统计
        total_items = db.query(func.count(UserItem.id)).scalar()
        total_conversations = db.query(func.count(Conversation.id)).scalar()
        total_summaries = db.query(func.count(Summary.id)).scalar()
        
        # 最近活跃用户（最近30天有记录的用户）
        thirty_days_ago = datetime.utcnow() - timedelta(days=30)
        active_users_30d = db.query(func.count(func.distinct(UserItem.user_id))).filter(
            UserItem.created_at >= thirty_days_ago
        ).scalar()
        
        # 用户角色分布
        role_distribution = {}
        for role in UserRole:
            count = db.query(func.count(User.id)).filter(User.role == role).scalar()
            role_distribution[role.value] = count
        
        return {
            "users": {
                "total": total_users,
                "active": active_users,
                "admin": admin_users,
                "new_7d": new_users_7d,
                "active_30d": active_users_30d,
                "role_distribution": role_distribution
            },
            "content": {
                "total_items": total_items,
                "total_conversations": total_conversations,
                "total_summaries": total_summaries
            },
            "timestamp": datetime.utcnow().isoformat()
        }


# 全局实例
admin_service = AdminService()

