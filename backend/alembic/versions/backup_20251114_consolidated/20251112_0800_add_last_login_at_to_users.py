"""add_last_login_at_to_users

Revision ID: 20251112_0800
Revises: 1b61b8d13a1c
Create Date: 2025-11-12 08:00:00.000000

"""
from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision = '20251112_0800'
down_revision = '1b61b8d13a1c'
branch_labels = None
depends_on = None


def upgrade() -> None:
    """添加 last_login_at 字段到 users 表"""
    op.add_column('users', sa.Column('last_login_at', sa.DateTime(), nullable=True, comment='最后登录时间'))


def downgrade() -> None:
    """移除 last_login_at 字段"""
    op.drop_column('users', 'last_login_at')
