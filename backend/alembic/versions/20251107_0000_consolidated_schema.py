"""consolidated_schema

Revision ID: consolidated_001
Revises: 
Create Date: 2025-11-07 00:00:00.000000

整合的迁移脚本，包含：
- summaries 表
- background_tasks 表
- api_key_configs 表
- users 表的 last_login_at 字段
- 所有基础索引和初始数据

"""
from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql
from datetime import datetime

# revision identifiers, used by Alembic.
revision = 'consolidated_001'
down_revision = None
branch_labels = None
depends_on = None


def upgrade() -> None:
    """创建所有表结构和基础索引"""
    
    # ========== 1. 创建 summaries 表 ==========
    op.create_table('summaries',
        sa.Column('id', sa.Integer(), nullable=False),
        sa.Column('user_id', sa.Integer(), nullable=False),
        sa.Column('title', sa.String(length=200), nullable=False),
        sa.Column('period_type', sa.Enum('WEEK', 'MONTH', 'YEAR', 'CUSTOM', name='periodtype'), nullable=False),
        sa.Column('start_date', sa.DateTime(), nullable=False),
        sa.Column('end_date', sa.DateTime(), nullable=False),
        sa.Column('summary_text', sa.Text(), nullable=False),
        sa.Column('keywords', postgresql.JSON(astext_type=sa.Text()), nullable=True),
        sa.Column('statistics', postgresql.JSON(astext_type=sa.Text()), nullable=True),
        sa.Column('created_at', sa.DateTime(), nullable=False),
        sa.ForeignKeyConstraint(['user_id'], ['users.id'], ondelete='CASCADE'),
        sa.PrimaryKeyConstraint('id')
    )
    op.create_index(op.f('ix_summaries_id'), 'summaries', ['id'], unique=False)
    op.create_index(op.f('ix_summaries_user_id'), 'summaries', ['user_id'], unique=False)
    
    # ========== 2. 创建 background_tasks 表 ==========
    # 创建枚举类型
    task_type_enum = sa.Enum('summary_generation', 'ai_chat', 'data_import', 'data_export', 
                              name='tasktype', create_type=True)
    task_status_enum = sa.Enum('pending', 'processing', 'completed', 'failed', 
                                name='taskstatus', create_type=True)
    
    op.create_table('background_tasks',
        sa.Column('id', sa.Integer(), nullable=False),
        sa.Column('task_id', sa.String(length=50), nullable=False, comment='任务唯一标识'),
        sa.Column('task_type', task_type_enum, nullable=False, comment='任务类型'),
        sa.Column('status', task_status_enum, nullable=False, comment='任务状态'),
        sa.Column('user_id', sa.Integer(), nullable=False, comment='所属用户ID'),
        sa.Column('params', postgresql.JSON(astext_type=sa.Text()), nullable=True, comment='任务参数'),
        sa.Column('result', postgresql.JSON(astext_type=sa.Text()), nullable=True, comment='任务结果'),
        sa.Column('error_message', sa.Text(), nullable=True, comment='错误信息'),
        sa.Column('progress', sa.Integer(), nullable=True, comment='任务进度（0-100）'),
        sa.Column('progress_message', sa.String(length=200), nullable=True, comment='进度消息'),
        sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.text('now()'), nullable=False),
        sa.Column('started_at', sa.DateTime(timezone=True), nullable=True, comment='开始处理时间'),
        sa.Column('completed_at', sa.DateTime(timezone=True), nullable=True, comment='完成时间'),
        sa.Column('updated_at', sa.DateTime(timezone=True), server_default=sa.text('now()'), nullable=True),
        sa.PrimaryKeyConstraint('id')
    )
    op.create_index(op.f('ix_background_tasks_id'), 'background_tasks', ['id'], unique=False)
    op.create_index(op.f('ix_background_tasks_task_id'), 'background_tasks', ['task_id'], unique=True)
    op.create_index(op.f('ix_background_tasks_user_id'), 'background_tasks', ['user_id'], unique=False)
    
    # ========== 3. 创建 api_key_configs 表 ==========
    op.create_table('api_key_configs',
        sa.Column('id', sa.Integer(), autoincrement=True, nullable=False),
        sa.Column('service', sa.Enum('TMDB', 'GOOGLE_BOOKS', 'BANGUMI', name='apikeyservice'), nullable=False, comment='API 服务类型'),
        sa.Column('api_key', sa.String(length=500), nullable=True, comment='API 密钥（加密存储）'),
        sa.Column('base_url', sa.String(length=500), nullable=True, comment='API 基础 URL'),
        sa.Column('enabled', sa.Boolean(), nullable=False, comment='是否启用'),
        sa.Column('last_tested_at', sa.DateTime(), nullable=True, comment='最后测试时间'),
        sa.Column('test_status', sa.Enum('NOT_TESTED', 'SUCCESS', 'FAILED', name='teststatus'), nullable=False, comment='测试状态'),
        sa.Column('test_message', sa.Text(), nullable=True, comment='测试消息'),
        sa.Column('description', sa.Text(), nullable=True, comment='配置描述'),
        sa.Column('created_at', sa.DateTime(), nullable=False, comment='创建时间'),
        sa.Column('updated_at', sa.DateTime(), nullable=False, comment='更新时间'),
        sa.PrimaryKeyConstraint('id'),
        sa.UniqueConstraint('service')
    )
    op.create_index(op.f('ix_api_key_configs_id'), 'api_key_configs', ['id'], unique=False)
    
    # 插入初始 API 配置数据
    now = datetime.utcnow()
    op.execute(f"""
        INSERT INTO api_key_configs (service, api_key, base_url, enabled, test_status, description, created_at, updated_at)
        VALUES 
        ('TMDB', NULL, 'https://api.themoviedb.org/3', true, 'NOT_TESTED', '电影和电视剧数据库', '{now}', '{now}'),
        ('GOOGLE_BOOKS', NULL, 'https://www.googleapis.com/books/v1', true, 'NOT_TESTED', 'Google 图书数据库', '{now}', '{now}'),
        ('BANGUMI', NULL, 'https://api.bgm.tv', true, 'NOT_TESTED', 'Bangumi 动漫数据库', '{now}', '{now}')
    """)
    
    # ========== 4. 为 users 表添加 last_login_at 字段 ==========
    op.add_column('users', sa.Column('last_login_at', sa.DateTime(), nullable=True, comment='最后登录时间'))


def downgrade() -> None:
    """回滚所有变更"""
    
    # 移除 users 表的字段
    op.drop_column('users', 'last_login_at')
    
    # 删除 api_key_configs 表
    op.drop_index(op.f('ix_api_key_configs_id'), table_name='api_key_configs')
    op.drop_table('api_key_configs')
    
    # 删除 background_tasks 表
    op.drop_index(op.f('ix_background_tasks_user_id'), table_name='background_tasks')
    op.drop_index(op.f('ix_background_tasks_task_id'), table_name='background_tasks')
    op.drop_index(op.f('ix_background_tasks_id'), table_name='background_tasks')
    op.drop_table('background_tasks')
    
    # 删除枚举类型
    sa.Enum(name='taskstatus').drop(op.get_bind(), checkfirst=True)
    sa.Enum(name='tasktype').drop(op.get_bind(), checkfirst=True)
    sa.Enum(name='teststatus').drop(op.get_bind(), checkfirst=True)
    sa.Enum(name='apikeyservice').drop(op.get_bind(), checkfirst=True)
    
    # 删除 summaries 表
    op.drop_index(op.f('ix_summaries_user_id'), table_name='summaries')
    op.drop_index(op.f('ix_summaries_id'), table_name='summaries')
    op.drop_table('summaries')
    sa.Enum(name='periodtype').drop(op.get_bind(), checkfirst=True)
