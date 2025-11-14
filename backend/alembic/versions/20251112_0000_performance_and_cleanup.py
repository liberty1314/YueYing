"""performance_and_cleanup

Revision ID: consolidated_002
Revises: consolidated_001
Create Date: 2025-11-12 00:00:00.000000

整合的迁移脚本，包含：
- 加密现有的 LLM 配置和 API 密钥
- 添加所有性能优化索引（不包括已删除的 collections 表）

"""
from alembic import op
import sqlalchemy as sa
from sqlalchemy.sql import table, column
from cryptography.fernet import Fernet
import base64
import hashlib
import os

# revision identifiers, used by Alembic.
revision = 'consolidated_002'
down_revision = 'consolidated_001'
branch_labels = None
depends_on = None


def get_encryption_service():
    """获取加密服务（与 encryption_service 相同的逻辑）"""
    secret_key = os.getenv('SECRET_KEY', 'default-secret-key')
    encryption_key = os.getenv('ENCRYPTION_KEY', secret_key)
    key = hashlib.sha256(encryption_key.encode()).digest()
    return Fernet(base64.urlsafe_b64encode(key))


def upgrade() -> None:
    """加密配置并添加性能索引"""
    
    # ========== 1. 加密现有的配置密钥 ==========
    connection = op.get_bind()
    fernet = get_encryption_service()
    
    # 1.1 加密 LLM 配置的 API 密钥
    llm_configs_table = table(
        'llm_configs',
        column('id', sa.Integer),
        column('api_key', sa.String),
    )
    
    # 读取所有 LLM 配置
    llm_configs = connection.execute(
        sa.select(llm_configs_table.c.id, llm_configs_table.c.api_key)
    ).fetchall()
    
    # 加密每个密钥
    for config_id, api_key in llm_configs:
        if api_key:
            try:
                # 尝试解密，如果成功说明已经加密过了
                fernet.decrypt(api_key.encode())
                print(f"LLM 配置 {config_id} 的 API 密钥已加密，跳过")
            except Exception:
                # 解密失败说明是明文，需要加密
                encrypted_key = fernet.encrypt(api_key.encode()).decode()
                connection.execute(
                    sa.update(llm_configs_table)
                    .where(llm_configs_table.c.id == config_id)
                    .values(api_key=encrypted_key)
                )
                print(f"✅ 已加密 LLM 配置 {config_id} 的 API 密钥")
    
    # 1.2 加密 API 密钥配置
    api_key_configs_table = table(
        'api_key_configs',
        column('id', sa.Integer),
        column('api_key', sa.String),
    )
    
    # 读取所有 API 密钥配置
    api_key_configs = connection.execute(
        sa.select(api_key_configs_table.c.id, api_key_configs_table.c.api_key)
    ).fetchall()
    
    # 加密每个密钥
    for config_id, api_key in api_key_configs:
        if api_key:
            try:
                # 尝试解密，如果成功说明已经加密过了
                fernet.decrypt(api_key.encode())
                print(f"API 密钥配置 {config_id} 已加密，跳过")
            except Exception:
                # 解密失败说明是明文，需要加密
                encrypted_key = fernet.encrypt(api_key.encode()).decode()
                connection.execute(
                    sa.update(api_key_configs_table)
                    .where(api_key_configs_table.c.id == config_id)
                    .values(api_key=encrypted_key)
                )
                print(f"✅ 已加密 API 密钥配置 {config_id}")
    
    # ========== 2. 添加性能优化索引 ==========
    
    # 2.1 user_items 表的性能索引
    op.create_index('ix_user_items_user_id_status', 'user_items', ['user_id', 'status'], unique=False)
    op.create_index('ix_user_items_user_id_item_id', 'user_items', ['user_id', 'item_id'], unique=False)
    op.create_index('ix_user_items_user_id_created_at', 'user_items', ['user_id', 'created_at'], unique=False)
    op.create_index('ix_user_items_user_id_updated_at', 'user_items', ['user_id', 'updated_at'], unique=False)
    op.create_index('ix_user_items_user_id_rating', 'user_items', ['user_id', 'rating'], unique=False)
    
    # 2.2 items 表的性能索引
    op.create_index('ix_items_content_type_year', 'items', ['content_type', 'year'], unique=False)
    op.create_index('ix_items_content_type_release_year', 'items', ['content_type', 'release_year'], unique=False)
    op.create_index('ix_items_source_external_id', 'items', ['source', 'external_id'], unique=False)
    op.create_index('ix_items_title_content_type', 'items', ['title', 'content_type'], unique=False)
    
    # 2.3 tags 表的性能索引
    op.create_index('ix_tags_user_id_type', 'tags', ['user_id', 'type'], unique=False)
    op.create_index('ix_tags_user_id_name', 'tags', ['user_id', 'name'], unique=False)
    
    # 2.4 user_item_tags 表的性能索引
    op.create_index('ix_user_item_tags_user_item_id_tag_id', 'user_item_tags', ['user_item_id', 'tag_id'], unique=False)
    op.create_index('ix_user_item_tags_tag_id_user_item_id', 'user_item_tags', ['tag_id', 'user_item_id'], unique=False)
    
    # 注意：不创建 collections 相关的索引，因为这些表已被删除


def downgrade() -> None:
    """回滚性能索引（不回滚加密）"""
    
    # 移除性能优化索引
    op.drop_index('ix_user_items_user_id_status', table_name='user_items')
    op.drop_index('ix_user_items_user_id_item_id', table_name='user_items')
    op.drop_index('ix_user_items_user_id_created_at', table_name='user_items')
    op.drop_index('ix_user_items_user_id_updated_at', table_name='user_items')
    op.drop_index('ix_user_items_user_id_rating', table_name='user_items')
    
    op.drop_index('ix_items_content_type_year', table_name='items')
    op.drop_index('ix_items_content_type_release_year', table_name='items')
    op.drop_index('ix_items_source_external_id', table_name='items')
    op.drop_index('ix_items_title_content_type', table_name='items')
    
    op.drop_index('ix_tags_user_id_type', table_name='tags')
    op.drop_index('ix_tags_user_id_name', table_name='tags')
    
    op.drop_index('ix_user_item_tags_user_item_id_tag_id', table_name='user_item_tags')
    op.drop_index('ix_user_item_tags_tag_id_user_item_id', table_name='user_item_tags')
    
    # 注意：不回滚加密操作，因为解密可能不安全
    print("⚠️  加密操作不支持自动回滚。如需回滚，请手动处理或重新初始化配置。")
