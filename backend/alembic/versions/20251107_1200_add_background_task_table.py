"""add_background_task_table

Revision ID: a1b2c3d4e5f6
Revises: 935827bc807c
Create Date: 2025-11-07 12:00:00.000000

"""
from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql

# revision identifiers, used by Alembic.
revision = 'a1b2c3d4e5f6'
down_revision = '935827bc807c'
branch_labels = None
depends_on = None


def upgrade() -> None:
    # 创建任务类型枚举
    task_type_enum = sa.Enum('summary_generation', 'ai_chat', 'data_import', 'data_export', 
                              name='tasktype', create_type=True)
    task_status_enum = sa.Enum('pending', 'processing', 'completed', 'failed', 
                                name='taskstatus', create_type=True)
    
    # 创建后台任务表
    op.create_table('background_tasks',
        sa.Column('id', sa.Integer(), nullable=False),
        sa.Column('task_id', sa.String(length=50), nullable=False),
        sa.Column('task_type', task_type_enum, nullable=False),
        sa.Column('status', task_status_enum, nullable=False),
        sa.Column('user_id', sa.Integer(), nullable=False),
        sa.Column('params', postgresql.JSON(astext_type=sa.Text()), nullable=True),
        sa.Column('result', postgresql.JSON(astext_type=sa.Text()), nullable=True),
        sa.Column('error_message', sa.Text(), nullable=True),
        sa.Column('progress', sa.Integer(), nullable=True),
        sa.Column('progress_message', sa.String(length=200), nullable=True),
        sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.text('now()'), nullable=False),
        sa.Column('started_at', sa.DateTime(timezone=True), nullable=True),
        sa.Column('completed_at', sa.DateTime(timezone=True), nullable=True),
        sa.Column('updated_at', sa.DateTime(timezone=True), server_default=sa.text('now()'), nullable=True),
        sa.PrimaryKeyConstraint('id')
    )
    
    # 创建索引
    op.create_index(op.f('ix_background_tasks_id'), 'background_tasks', ['id'], unique=False)
    op.create_index(op.f('ix_background_tasks_task_id'), 'background_tasks', ['task_id'], unique=True)
    op.create_index(op.f('ix_background_tasks_user_id'), 'background_tasks', ['user_id'], unique=False)


def downgrade() -> None:
    # 删除索引
    op.drop_index(op.f('ix_background_tasks_user_id'), table_name='background_tasks')
    op.drop_index(op.f('ix_background_tasks_task_id'), table_name='background_tasks')
    op.drop_index(op.f('ix_background_tasks_id'), table_name='background_tasks')
    
    # 删除表
    op.drop_table('background_tasks')
    
    # 删除枚举类型
    sa.Enum(name='taskstatus').drop(op.get_bind(), checkfirst=True)
    sa.Enum(name='tasktype').drop(op.get_bind(), checkfirst=True)


