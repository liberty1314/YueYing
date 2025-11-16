"""rename_llm_config_model_to_default_model

Revision ID: db0f5c7317a4
Revises: initial_001
Create Date: 2025-11-16 00:49:37.491178

"""
from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision = 'db0f5c7317a4'
down_revision = 'initial_001'
branch_labels = None
depends_on = None


def upgrade() -> None:
    """重命名 llm_configs.model 为 default_model"""
    op.alter_column('llm_configs', 'model', new_column_name='default_model')


def downgrade() -> None:
    """回滚：重命名 llm_configs.default_model 为 model"""
    op.alter_column('llm_configs', 'default_model', new_column_name='model')


