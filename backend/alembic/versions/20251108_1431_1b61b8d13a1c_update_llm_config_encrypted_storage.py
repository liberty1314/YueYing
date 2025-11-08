"""update_llm_config_encrypted_storage

Revision ID: 1b61b8d13a1c
Revises: d002e93ff086
Create Date: 2025-11-08 14:31:14.608754

"""
from alembic import op
import sqlalchemy as sa
from sqlalchemy.sql import table, column
from cryptography.fernet import Fernet
import base64
import hashlib
import os


# revision identifiers, used by Alembic.
revision = '1b61b8d13a1c'
down_revision = 'd002e93ff086'
branch_labels = None
depends_on = None


def get_encryption_service():
    """获取加密服务（与 encryption_service 相同的逻辑）"""
    secret_key = os.getenv('SECRET_KEY', 'default-secret-key')
    encryption_key = os.getenv('ENCRYPTION_KEY', secret_key)
    key = hashlib.sha256(encryption_key.encode()).digest()
    return Fernet(base64.urlsafe_b64encode(key))


def upgrade() -> None:
    """
    将现有的 LLM 配置和 API 密钥配置的明文密钥加密
    """
    connection = op.get_bind()
    fernet = get_encryption_service()
    
    # 1. 加密 LLM 配置的 API 密钥
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
    
    # 2. 加密 API 密钥配置
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


def downgrade() -> None:
    """
    回滚不解密密钥，因为解密可能不安全
    如果需要回滚，建议手动处理或重新初始化配置
    """
    print("⚠️  此迁移不支持自动回滚。如需回滚，请手动处理或重新初始化配置。")
    pass
