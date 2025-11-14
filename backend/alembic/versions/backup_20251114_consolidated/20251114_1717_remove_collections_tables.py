"""remove collections tables

Revision ID: 20251114_1717
Revises: 20251112_1600
Create Date: 2025-11-14 17:17:00.000000

"""
from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision = '20251114_1717'
down_revision = '20251112_1600'
branch_labels = None
depends_on = None


def upgrade() -> None:
    """删除未使用的 collections 和 collection_items 表"""
    
    # 1. 删除性能索引（如果存在）
    op.drop_index('ix_collection_items_collection_id_sort_order', table_name='collection_items')
    op.drop_index('ix_collections_user_id_is_public', table_name='collections')
    
    # 2. 删除基础索引
    op.drop_index('ix_collection_items_user_item_id', table_name='collection_items')
    op.drop_index('ix_collection_items_id', table_name='collection_items')
    op.drop_index('ix_collection_items_collection_id', table_name='collection_items')
    
    # 3. 删除 collection_items 表（子表先删除）
    op.drop_table('collection_items')
    
    # 4. 删除 collections 表的索引
    op.drop_index('ix_collections_user_id', table_name='collections')
    op.drop_index('ix_collections_id', table_name='collections')
    
    # 5. 删除 collections 表
    op.drop_table('collections')


def downgrade() -> None:
    """恢复 collections 和 collection_items 表（如果需要回滚）"""
    
    # 1. 重建 collections 表
    op.create_table('collections',
        sa.Column('id', sa.Integer(), autoincrement=True, nullable=False),
        sa.Column('user_id', sa.Integer(), nullable=False),
        sa.Column('name', sa.String(length=200), nullable=False),
        sa.Column('description', sa.Text(), nullable=True),
        sa.Column('cover_url', sa.String(length=1000), nullable=True),
        sa.Column('is_public', sa.Boolean(), nullable=False),
        sa.Column('sort_order', sa.Integer(), nullable=False),
        sa.Column('created_at', sa.DateTime(), nullable=False),
        sa.Column('updated_at', sa.DateTime(), nullable=False),
        sa.ForeignKeyConstraint(['user_id'], ['users.id'], ondelete='CASCADE'),
        sa.PrimaryKeyConstraint('id')
    )
    op.create_index('ix_collections_id', 'collections', ['id'], unique=False)
    op.create_index('ix_collections_user_id', 'collections', ['user_id'], unique=False)
    
    # 2. 重建 collection_items 表
    op.create_table('collection_items',
        sa.Column('id', sa.Integer(), autoincrement=True, nullable=False),
        sa.Column('collection_id', sa.Integer(), nullable=False),
        sa.Column('user_item_id', sa.Integer(), nullable=False),
        sa.Column('sort_order', sa.Integer(), nullable=False),
        sa.Column('created_at', sa.DateTime(), nullable=False),
        sa.Column('updated_at', sa.DateTime(), nullable=False),
        sa.ForeignKeyConstraint(['collection_id'], ['collections.id'], ondelete='CASCADE'),
        sa.ForeignKeyConstraint(['user_item_id'], ['user_items.id'], ondelete='CASCADE'),
        sa.PrimaryKeyConstraint('id')
    )
    op.create_index('ix_collection_items_collection_id', 'collection_items', ['collection_id'], unique=False)
    op.create_index('ix_collection_items_id', 'collection_items', ['id'], unique=False)
    op.create_index('ix_collection_items_user_item_id', 'collection_items', ['user_item_id'], unique=False)
    
    # 3. 重建性能索引
    op.create_index('ix_collections_user_id_is_public', 'collections', ['user_id', 'is_public'], unique=False)
    op.create_index('ix_collection_items_collection_id_sort_order', 'collection_items', ['collection_id', 'sort_order'], unique=False)
