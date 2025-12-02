"""add_timestamps_to_user_items

Revision ID: e1ac83b46865
Revises: 7fa2d15a6805
Create Date: 2025-12-01 10:31:51.362011

"""
from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision = 'e1ac83b46865'
down_revision = '7fa2d15a6805'
branch_labels = None
depends_on = None


def upgrade() -> None:
    # 检查字段是否已存在，如果不存在则添加
    conn = op.get_bind()
    inspector = sa.inspect(conn)
    columns = [col['name'] for col in inspector.get_columns('user_items')]
    
    if 'created_at' not in columns:
        op.add_column('user_items', sa.Column('created_at', sa.DateTime(), nullable=False, server_default=sa.text('CURRENT_TIMESTAMP'), comment='创建时间'))
    
    if 'updated_at' not in columns:
        op.add_column('user_items', sa.Column('updated_at', sa.DateTime(), nullable=False, server_default=sa.text('CURRENT_TIMESTAMP'), comment='更新时间'))
    
    # 为现有记录设置合理的时间戳
    # 使用 watched_date 作为参考，如果没有则使用当前时间
    if 'created_at' not in columns or 'updated_at' not in columns:
        op.execute("""
            UPDATE user_items 
            SET created_at = COALESCE(watched_date::timestamp, CURRENT_TIMESTAMP),
                updated_at = COALESCE(watched_date::timestamp, CURRENT_TIMESTAMP)
            WHERE created_at IS NULL OR updated_at IS NULL
        """)


def downgrade() -> None:
    # 删除时间戳字段
    op.drop_column('user_items', 'updated_at')
    op.drop_column('user_items', 'created_at')


