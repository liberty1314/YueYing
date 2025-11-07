"""add training config table

Revision ID: add_training_config
Revises: 
Create Date: 2024-01-15 10:00:00.000000

"""
from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql

# revision identifiers, used by Alembic.
revision = 'add_training_config'
down_revision = None
depends_on = None


def upgrade():
    op.create_table(
        'training_configs',
        sa.Column('id', sa.Integer(), nullable=False),
        sa.Column('enabled', sa.Boolean(), nullable=False, comment='是否启用自动训练'),
        sa.Column('epochs', sa.Integer(), nullable=False, comment='训练轮数'),
        sa.Column('components', sa.Integer(), nullable=False, comment='潜在特征维度'),
        sa.Column('learning_rate', sa.Float(), nullable=False, comment='学习率'),
        sa.Column('loss_function', sa.String(length=20), nullable=False, comment='损失函数'),
        sa.Column('num_threads', sa.Integer(), nullable=False, comment='线程数'),
        sa.Column('schedule_cron', sa.String(length=100), nullable=False, comment='Cron 表达式'),
        sa.Column('min_interactions', sa.Integer(), nullable=False, comment='最小交互数量'),
        sa.Column('model_dir', sa.String(length=500), nullable=False, comment='模型保存目录'),
        sa.Column('last_train_time', sa.DateTime(), nullable=True, comment='最后训练时间'),
        sa.Column('last_train_status', sa.String(length=20), nullable=True, comment='最后训练状态'),
        sa.Column('last_train_metrics', postgresql.JSON(astext_type=sa.Text()), nullable=True, comment='最后训练指标'),
        sa.Column('last_train_error', sa.Text(), nullable=True, comment='最后训练错误'),
        sa.Column('created_at', sa.DateTime(), server_default=sa.text('now()'), nullable=False),
        sa.Column('updated_at', sa.DateTime(), server_default=sa.text('now()'), nullable=False),
        sa.PrimaryKeyConstraint('id')
    )
    op.create_index(op.f('ix_training_configs_id'), 'training_configs', ['id'], unique=False)
    
    # 插入默认配置
    op.execute("""
        INSERT INTO training_configs (enabled, epochs, components, learning_rate, loss_function, num_threads, schedule_cron, min_interactions, model_dir)
        VALUES (false, 20, 30, 0.05, 'warp', 4, '0 2 * * *', 100, './models/recommender')
    """)


def downgrade():
    op.drop_index(op.f('ix_training_configs_id'), table_name='training_configs')
    op.drop_table('training_configs')
