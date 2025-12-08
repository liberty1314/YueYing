"""remove_default_library_status_from_user_settings

Revision ID: 92383805e2db
Revises: f9e403884273
Create Date: 2025-12-08 11:49:34.399823

"""
from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision = '92383805e2db'
down_revision = 'f9e403884273'
branch_labels = None
depends_on = None


def upgrade() -> None:
    # 删除 default_library_status 字段
    op.drop_column('user_settings', 'default_library_status')


def downgrade() -> None:
    # 恢复 default_library_status 字段
    op.add_column('user_settings', sa.Column('default_library_status', sa.String(length=50), server_default='want_to_watch', nullable=False, comment='我的记录页面默认筛选状态'))


