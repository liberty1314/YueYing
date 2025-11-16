"""
数据库种子数据脚本
创建管理员用户和初始化系统设置
"""
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).parent.parent))

from sqlalchemy.orm import Session
from app.core.database import SessionLocal
from app.core.config import settings
from app.core.security import get_password_hash
from app.core.logging import setup_logging
from app.models.user import User, UserRole
from app.models.system_settings import SystemSettings
from app.models.api_key_config import ApiKeyConfig, ApiKeyService, TestStatus
from datetime import datetime

logger = setup_logging()


def seed_admin_user(db: Session):
    """创建管理员用户"""
    try:
        # 检查是否已存在管理员
        existing_admin = db.query(User).filter(User.role == UserRole.ADMIN).first()
        if existing_admin:
            logger.info(f"✓ 管理员用户已存在: {existing_admin.username}")
            return existing_admin
        
        # 从环境变量获取管理员信息
        admin_username = settings.ADMIN_USERNAME or "admin"
        admin_password = settings.ADMIN_PASSWORD or "admin123"
        admin_email = settings.ADMIN_EMAIL or "admin@example.com"
        
        # 创建管理员用户
        admin_user = User(
            username=admin_username,
            email=admin_email,
            hashed_password=get_password_hash(admin_password),
            full_name="系统管理员",
            role=UserRole.ADMIN,
            is_active=True,
            is_verified=True
        )
        
        db.add(admin_user)
        db.commit()
        db.refresh(admin_user)
        
        logger.info(f"✓ 管理员用户创建成功:")
        logger.info(f"  用户名: {admin_username}")
        logger.info(f"  邮箱: {admin_email}")
        logger.info(f"  密码: {admin_password}")
        
        return admin_user
        
    except Exception as e:
        logger.error(f"✗ 创建管理员用户失败: {e}")
        db.rollback()
        raise


def seed_system_settings(db: Session):
    """初始化系统设置"""
    try:
        # 检查是否已存在系统设置
        existing_settings = db.query(SystemSettings).first()
        if existing_settings:
            logger.info("✓ 系统设置已存在")
            return existing_settings
        
        # 创建默认系统设置
        system_settings = SystemSettings(
            enable_explore=settings.DEFAULT_ENABLE_EXPLORE,
            allow_user_ai_tag_settings=settings.DEFAULT_ALLOW_USER_AI_TAG_SETTINGS
        )
        
        db.add(system_settings)
        db.commit()
        db.refresh(system_settings)
        
        logger.info("✓ 系统设置初始化成功:")
        logger.info(f"  探索功能: {'启用' if system_settings.enable_explore else '禁用'}")
        logger.info(f"  用户 AI 标签设置: {'允许' if system_settings.allow_user_ai_tag_settings else '禁止'}")
        
        return system_settings
        
    except Exception as e:
        logger.error(f"✗ 初始化系统设置失败: {e}")
        db.rollback()
        raise


def seed_api_key_configs(db: Session):
    """初始化 API 密钥配置"""
    try:
        # 检查是否已存在配置
        existing_count = db.query(ApiKeyConfig).count()
        if existing_count > 0:
            logger.info(f"✓ API 密钥配置已存在 ({existing_count} 个)")
            return
        
        # 创建默认 API 配置
        configs = [
            ApiKeyConfig(
                service=ApiKeyService.TMDB,
                api_key=None,
                base_url="https://api.themoviedb.org/3",
                enabled=True,
                test_status=TestStatus.NOT_TESTED,
                description="电影和电视剧数据库"
            ),
            ApiKeyConfig(
                service=ApiKeyService.GOOGLE_BOOKS,
                api_key=None,
                base_url="https://www.googleapis.com/books/v1",
                enabled=True,
                test_status=TestStatus.NOT_TESTED,
                description="Google 图书数据库"
            ),
            ApiKeyConfig(
                service=ApiKeyService.BANGUMI,
                api_key=None,
                base_url="https://api.bgm.tv",
                enabled=True,
                test_status=TestStatus.NOT_TESTED,
                description="Bangumi 动漫数据库"
            )
        ]
        
        for config in configs:
            db.add(config)
        
        db.commit()
        
        logger.info(f"✓ API 密钥配置初始化成功 ({len(configs)} 个)")
        
    except Exception as e:
        logger.error(f"✗ 初始化 API 密钥配置失败: {e}")
        db.rollback()
        raise


def main():
    """主函数"""
    logger.info("开始初始化种子数据...")
    
    db = SessionLocal()
    try:
        # 创建管理员用户
        seed_admin_user(db)
        
        # 初始化系统设置
        seed_system_settings(db)
        
        # 初始化 API 密钥配置
        seed_api_key_configs(db)
        
        logger.info("✓ 种子数据初始化完成")
        return True
        
    except Exception as e:
        logger.error(f"✗ 种子数据初始化失败: {e}")
        import traceback
        traceback.print_exc()
        return False
        
    finally:
        db.close()


if __name__ == "__main__":
    success = main()
    sys.exit(0 if success else 1)
