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
        from app.services.api_key_service import api_key_service
        from app.core.encryption import encryption_service
        
        # 检查是否已存在配置
        existing_count = db.query(ApiKeyConfig).count()
        
        # 检查是否有空的 api_key（NULL）
        null_key_count = db.query(ApiKeyConfig).filter(
            ApiKeyConfig.api_key.is_(None)
        ).count()
        
        if existing_count > 0:
            logger.info(f"✓ API 密钥配置已存在 ({existing_count} 个)")
            
            # 如果有空的 api_key 或设置了强制从环境变量读取，更新数据库配置
            should_update = null_key_count > 0 or settings.FORCE_ENV_SETTINGS
            
            if should_update:
                if null_key_count > 0:
                    logger.info(f"检测到 {null_key_count} 个配置的 API 密钥为空，从环境变量填充...")
                if settings.FORCE_ENV_SETTINGS:
                    logger.info("检测到 FORCE_ENV_SETTINGS=True，从环境变量更新所有 API 密钥配置...")
                
                updated_count = 0
                
                # 更新 TMDB
                if settings.TMDB_API_KEY:
                    tmdb_config = db.query(ApiKeyConfig).filter(
                        ApiKeyConfig.service == ApiKeyService.TMDB
                    ).first()
                    if tmdb_config and (tmdb_config.api_key is None or settings.FORCE_ENV_SETTINGS):
                        tmdb_config.api_key = encryption_service.encrypt(settings.TMDB_API_KEY)
                        logger.info("  ✓ 更新 TMDB API 密钥")
                        updated_count += 1
                
                # 更新 Google Books
                if settings.GOOGLE_BOOKS_API_KEY:
                    books_config = db.query(ApiKeyConfig).filter(
                        ApiKeyConfig.service == ApiKeyService.GOOGLE_BOOKS
                    ).first()
                    if books_config and (books_config.api_key is None or settings.FORCE_ENV_SETTINGS):
                        books_config.api_key = encryption_service.encrypt(settings.GOOGLE_BOOKS_API_KEY)
                        logger.info("  ✓ 更新 Google Books API 密钥")
                        updated_count += 1
                
                # 更新 Bangumi
                if settings.BANGUMI_API_KEY:
                    bangumi_config = db.query(ApiKeyConfig).filter(
                        ApiKeyConfig.service == ApiKeyService.BANGUMI
                    ).first()
                    if bangumi_config and (bangumi_config.api_key is None or settings.FORCE_ENV_SETTINGS):
                        bangumi_config.api_key = encryption_service.encrypt(settings.BANGUMI_API_KEY)
                        logger.info("  ✓ 更新 Bangumi API 密钥")
                        updated_count += 1
                
                if updated_count > 0:
                    db.commit()
                    logger.info(f"✓ 已更新 {updated_count} 个 API 密钥配置")
                else:
                    logger.info("⚠ 环境变量中未配置 API 密钥，跳过更新")
            else:
                logger.info("所有 API 密钥配置完整，跳过更新")
            
            return
        
        # 使用 api_key_service 从环境变量初始化
        logger.info("从环境变量初始化 API 密钥配置...")
        initialized_configs = api_key_service.initialize_from_env(db)
        
        if initialized_configs:
            logger.info(f"✓ API 密钥配置初始化成功 ({len(initialized_configs)} 个)")
        else:
            logger.warning("⚠ 未从环境变量初始化任何 API 密钥配置")
        
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
