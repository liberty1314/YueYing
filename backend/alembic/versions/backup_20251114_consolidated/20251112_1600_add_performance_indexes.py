"""add_performance_indexes

Revision ID: 20251112_1600
Revises: 20251112_0800
Create Date: 2025-11-12 16:00:00.000000

"""
from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision = '20251112_1600'
down_revision = '20251112_0800'
branch_labels = None
depends_on = None


def upgrade() -> None:
    """添加性能优化索引"""

    # user_items 表的性能索引
    # 复合索引：用户ID + 状态（用于状态筛选查询）
    op.create_index('ix_user_items_user_id_status', 'user_items', ['user_id', 'status'], unique=False)

    # 复合索引：用户ID + 项目ID（用于唯一性检查和JOIN查询）
    op.create_index('ix_user_items_user_id_item_id', 'user_items', ['user_id', 'item_id'], unique=False)

    # 复合索引：用户ID + 创建时间（用于时间排序）
    op.create_index('ix_user_items_user_id_created_at', 'user_items', ['user_id', 'created_at'], unique=False)

    # 复合索引：用户ID + 更新时间（用于时间排序）
    op.create_index('ix_user_items_user_id_updated_at', 'user_items', ['user_id', 'updated_at'], unique=False)

    # 复合索引：用户ID + 评分（用于评分范围查询）
    op.create_index('ix_user_items_user_id_rating', 'user_items', ['user_id', 'rating'], unique=False)

    # items 表的性能索引
    # 复合索引：内容类型 + 年份（用于类型和年份筛选）
    op.create_index('ix_items_content_type_year', 'items', ['content_type', 'year'], unique=False)

    # 复合索引：内容类型 + 发行年份（用于类型和发行年份筛选）
    op.create_index('ix_items_content_type_release_year', 'items', ['content_type', 'release_year'], unique=False)

    # 复合索引：数据源 + 外部ID（虽然已有唯一约束，但添加索引以优化查询）
    op.create_index('ix_items_source_external_id', 'items', ['source', 'external_id'], unique=False)

    # 复合索引：标题 + 内容类型（用于标题搜索优化）
    op.create_index('ix_items_title_content_type', 'items', ['title', 'content_type'], unique=False)

    # tags 表的性能索引
    # 复合索引：用户ID + 类型（用于用户标签类型筛选）
    op.create_index('ix_tags_user_id_type', 'tags', ['user_id', 'type'], unique=False)

    # 复合索引：用户ID + 名称（用于用户标签搜索）
    op.create_index('ix_tags_user_id_name', 'tags', ['user_id', 'name'], unique=False)

    # user_item_tags 表的性能索引
    # 复合索引：用户项目ID + 标签ID（用于标签关联查询）
    op.create_index('ix_user_item_tags_user_item_id_tag_id', 'user_item_tags', ['user_item_id', 'tag_id'], unique=False)

    # 复合索引：标签ID + 用户项目ID（用于标签统计查询）
    op.create_index('ix_user_item_tags_tag_id_user_item_id', 'user_item_tags', ['tag_id', 'user_item_id'], unique=False)

    # collections 表的性能索引
    # 复合索引：用户ID + 是否公开（用于用户集合筛选）
    op.create_index('ix_collections_user_id_is_public', 'collections', ['user_id', 'is_public'], unique=False)

    # collection_items 表的性能索引
    # 复合索引：集合ID + 排序顺序（用于集合项目排序）
    op.create_index('ix_collection_items_collection_id_sort_order', 'collection_items', ['collection_id', 'sort_order'], unique=False)


def downgrade() -> None:
    """移除性能优化索引"""

    # 移除所有添加的索引
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

    op.drop_index('ix_collections_user_id_is_public', table_name='collections')
    op.drop_index('ix_collection_items_collection_id_sort_order', table_name='collection_items')
