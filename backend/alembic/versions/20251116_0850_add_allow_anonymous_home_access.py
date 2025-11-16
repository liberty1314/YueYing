"""add allow_anonymous_home_access to system_settings

Revision ID: add_anon_home_access
Revises: db0f5c7317a4
Create Date: 2025-11-16 08:50:00.000000

"""
from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision = 'add_anon_home_access'
down_revision = 'db0f5c7317a4'
branch_labels = None
depends_on = None


def upgrade():
    # 添加 allow_anonymous_home_access 字段
    op.add_column('system_settings', sa.Column('allow_anonymous_home_access', sa.Boolean(), server_default='true', nullable=False, comment='允许未登录用户访问首页'))


def downgrade():
    # 删除 allow_anonymous_home_access 字段
    op.drop_column('system_settings', 'allow_anonymous_home_access')
