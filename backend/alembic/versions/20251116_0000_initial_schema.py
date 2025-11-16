"""initial_schema

完整的数据库初始化脚本
整合了所有历史迁移的累积效果

Revision ID: initial_001
Revises: 
Create Date: 2025-11-16 00:00:00.000000

包含的表结构：
- users: 用户表（包含角色字段）
- items: 内容项表（电影、电视剧、动漫、书籍等）
- user_items: 用户内容记录表
- tags: 标签表（用户级别）
- user_item_tags: 用户内容标签关联表
- llm_configs: LLM 配置表
- api_key_configs: API 密钥配置表
- summaries: 摘要表
- background_tasks: 后台任务表
- conversations: 对话表
- conversation_messages: 对话消息表
- user_settings: 用户设置表
- system_settings: 系统设置表

"""
from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql
from datetime import datetime

# revision identifiers, used by Alembic.
revision = 'initial_001'
down_revision = None
branch_labels = None
depends_on = None


def upgrade() -> None:
    """创建所有表结构、索引和初始数据"""
    
    # ========== 1. 创建枚举类型 ==========
    # 注意：不在这里预先创建枚举，让 SQLAlchemy 在创建表时自动创建
    
    # ========== 2. 创建 users 表 ==========
    op.create_table('users',
        sa.Column('id', sa.Integer(), autoincrement=True, nullable=False, comment='用户ID'),
        sa.Column('email', sa.String(length=255), nullable=False, comment='邮箱'),
        sa.Column('username', sa.String(length=50), nullable=True, comment='用户名'),
        sa.Column('hashed_password', sa.String(length=255), nullable=False, comment='密码哈希'),
        sa.Column('full_name', sa.String(length=100), nullable=True, comment='全名'),
        sa.Column('avatar_url', sa.String(length=500), nullable=True, comment='头像URL'),
        sa.Column('role', postgresql.ENUM('user', 'moderator', 'admin', 'super_admin', name='userrole'), 
                  nullable=False, server_default='user', comment='用户角色'),
        sa.Column('is_active', sa.Boolean(), nullable=False, server_default='true', comment='是否激活'),
        sa.Column('is_verified', sa.Boolean(), nullable=False, server_default='false', comment='是否验证'),
        sa.Column('last_login_at', sa.DateTime(), nullable=True, comment='最后登录时间'),
        sa.Column('created_at', sa.DateTime(), nullable=False, server_default=sa.text('now()'), comment='创建时间'),
        sa.Column('updated_at', sa.DateTime(), nullable=False, server_default=sa.text('now()'), comment='更新时间'),
        sa.PrimaryKeyConstraint('id')
    )
    op.create_index(op.f('ix_users_id'), 'users', ['id'], unique=False)
    op.create_index(op.f('ix_users_email'), 'users', ['email'], unique=True)
    op.create_index(op.f('ix_users_username'), 'users', ['username'], unique=True)
    op.create_index(op.f('ix_users_role'), 'users', ['role'], unique=False)
    
    # ========== 3. 创建 items 表 ==========
    op.create_table('items',
        sa.Column('id', sa.Integer(), autoincrement=True, nullable=False, comment='条目ID'),
        sa.Column('external_id', sa.String(length=255), nullable=False, comment='外部数据源ID'),
        sa.Column('source', sa.String(length=50), nullable=False, comment='数据源'),
        sa.Column('content_type', sa.String(length=50), nullable=False, comment='内容类型'),
        sa.Column('type', postgresql.ENUM('MOVIE', 'TV_SERIES', 'ANIME', 'BOOK', name='itemtype'), 
                  nullable=True, comment='条目类型'),
        sa.Column('title', sa.String(length=500), nullable=False, comment='标题'),
        sa.Column('original_title', sa.String(length=500), nullable=True, comment='原始标题'),
        sa.Column('description', sa.Text(), nullable=True, comment='简介描述'),
        sa.Column('poster_url', sa.String(length=1000), nullable=True, comment='海报图URL'),
        sa.Column('backdrop_url', sa.String(length=1000), nullable=True, comment='背景图URL'),
        sa.Column('cover_url', sa.String(length=1000), nullable=True, comment='封面图URL'),
        sa.Column('release_date', sa.String(length=50), nullable=True, comment='发布日期'),
        sa.Column('release_year', sa.Integer(), nullable=True, comment='发行年份'),
        sa.Column('year', sa.String(length=10), nullable=True, comment='年份字符串'),
        sa.Column('director', sa.String(length=255), nullable=True, comment='导演'),
        sa.Column('author', sa.String(length=255), nullable=True, comment='作者'),
        sa.Column('cast', sa.Text(), nullable=True, comment='演员列表'),
        sa.Column('genres', sa.Text(), nullable=True, comment='类型列表'),
        sa.Column('duration', sa.Integer(), nullable=True, comment='时长或页数'),
        sa.Column('language', sa.String(length=50), nullable=True, comment='语言'),
        sa.Column('country', sa.String(length=100), nullable=True, comment='国家/地区'),
        sa.Column('extra_data', postgresql.JSON(astext_type=sa.Text()), nullable=True, comment='额外元数据'),
        sa.Column('external_ids', postgresql.JSON(astext_type=sa.Text()), nullable=True, comment='外部平台ID映射'),
        sa.Column('external_ratings', postgresql.JSON(astext_type=sa.Text()), nullable=True, comment='外部平台评分'),
        sa.Column('created_at', sa.DateTime(), nullable=False, server_default=sa.text('now()'), comment='创建时间'),
        sa.Column('updated_at', sa.DateTime(), nullable=False, server_default=sa.text('now()'), comment='更新时间'),
        sa.PrimaryKeyConstraint('id'),
        sa.UniqueConstraint('external_id', 'source', name='uix_external_id_source')
    )
    op.create_index(op.f('ix_items_id'), 'items', ['id'], unique=False)
    op.create_index(op.f('ix_items_external_id'), 'items', ['external_id'], unique=False)
    op.create_index(op.f('ix_items_source'), 'items', ['source'], unique=False)
    op.create_index(op.f('ix_items_content_type'), 'items', ['content_type'], unique=False)
    op.create_index(op.f('ix_items_type'), 'items', ['type'], unique=False)
    op.create_index(op.f('ix_items_title'), 'items', ['title'], unique=False)
    op.create_index(op.f('ix_items_release_year'), 'items', ['release_year'], unique=False)
    
    # ========== 4. 创建 user_items 表 ==========
    op.create_table('user_items',
        sa.Column('id', sa.Integer(), autoincrement=True, nullable=False, comment='记录ID'),
        sa.Column('user_id', sa.Integer(), nullable=False, comment='用户ID'),
        sa.Column('item_id', sa.Integer(), nullable=False, comment='条目ID'),
        sa.Column('status', sa.String(length=50), nullable=False, server_default='want_to_watch', comment='观看状态'),
        sa.Column('rating', sa.Integer(), nullable=True, comment='个人评分'),
        sa.Column('notes', sa.Text(), nullable=True, comment='个人笔记'),
        sa.Column('started_at', sa.String(length=50), nullable=True, comment='开始日期'),
        sa.Column('completed_at', sa.String(length=50), nullable=True, comment='完成日期'),
        sa.Column('watched_date', sa.Date(), nullable=True, comment='观看完成日期'),
        sa.Column('progress', sa.Integer(), nullable=True, comment='观看进度'),
        sa.Column('is_favorite', sa.Integer(), nullable=False, server_default='0', comment='是否收藏'),
        sa.Column('created_at', sa.DateTime(), nullable=False, server_default=sa.text('now()'), comment='创建时间'),
        sa.Column('updated_at', sa.DateTime(), nullable=False, server_default=sa.text('now()'), comment='更新时间'),
        sa.ForeignKeyConstraint(['item_id'], ['items.id'], ondelete='CASCADE'),
        sa.ForeignKeyConstraint(['user_id'], ['users.id'], ondelete='CASCADE'),
        sa.PrimaryKeyConstraint('id')
    )
    op.create_index(op.f('ix_user_items_id'), 'user_items', ['id'], unique=False)
    op.create_index(op.f('ix_user_items_user_id'), 'user_items', ['user_id'], unique=False)
    op.create_index(op.f('ix_user_items_item_id'), 'user_items', ['item_id'], unique=False)
    op.create_index(op.f('ix_user_items_status'), 'user_items', ['status'], unique=False)
    op.create_index(op.f('ix_user_items_watched_date'), 'user_items', ['watched_date'], unique=False)
    
    # ========== 5. 创建 tags 表 ==========
    op.create_table('tags',
        sa.Column('id', sa.Integer(), autoincrement=True, nullable=False, comment='标签ID'),
        sa.Column('user_id', sa.Integer(), nullable=False, comment='用户ID'),
        sa.Column('name', sa.String(length=100), nullable=False, comment='标签名称'),
        sa.Column('type', postgresql.ENUM('EMOTION', 'THEME', 'STYLE', 'CUSTOM', name='tagtype'), 
                  nullable=False, server_default='CUSTOM', comment='标签类型'),
        sa.Column('is_auto', sa.Boolean(), nullable=False, server_default='false', comment='是否自动生成'),
        sa.Column('color', sa.String(length=20), nullable=True, comment='标签颜色'),
        sa.Column('description', sa.String(length=500), nullable=True, comment='标签描述'),
        sa.Column('created_at', sa.DateTime(), nullable=False, server_default=sa.text('now()'), comment='创建时间'),
        sa.Column('updated_at', sa.DateTime(), nullable=False, server_default=sa.text('now()'), comment='更新时间'),
        sa.ForeignKeyConstraint(['user_id'], ['users.id'], ondelete='CASCADE'),
        sa.PrimaryKeyConstraint('id'),
        sa.UniqueConstraint('user_id', 'name', name='uix_user_tag_name')
    )
    op.create_index(op.f('ix_tags_id'), 'tags', ['id'], unique=False)
    op.create_index(op.f('ix_tags_user_id'), 'tags', ['user_id'], unique=False)
    op.create_index(op.f('ix_tags_name'), 'tags', ['name'], unique=False)
    op.create_index(op.f('ix_tags_type'), 'tags', ['type'], unique=False)
    
    # ========== 6. 创建 user_item_tags 表 ==========
    op.create_table('user_item_tags',
        sa.Column('id', sa.Integer(), autoincrement=True, nullable=False, comment='关联ID'),
        sa.Column('user_item_id', sa.Integer(), nullable=False, comment='用户记录ID'),
        sa.Column('tag_id', sa.Integer(), nullable=False, comment='标签ID'),
        sa.Column('created_at', sa.DateTime(), nullable=False, server_default=sa.text('now()'), comment='创建时间'),
        sa.Column('updated_at', sa.DateTime(), nullable=False, server_default=sa.text('now()'), comment='更新时间'),
        sa.ForeignKeyConstraint(['tag_id'], ['tags.id'], ondelete='CASCADE'),
        sa.ForeignKeyConstraint(['user_item_id'], ['user_items.id'], ondelete='CASCADE'),
        sa.PrimaryKeyConstraint('id'),
        sa.UniqueConstraint('user_item_id', 'tag_id', name='uix_user_item_tag')
    )
    op.create_index(op.f('ix_user_item_tags_id'), 'user_item_tags', ['id'], unique=False)
    op.create_index(op.f('ix_user_item_tags_user_item_id'), 'user_item_tags', ['user_item_id'], unique=False)
    op.create_index(op.f('ix_user_item_tags_tag_id'), 'user_item_tags', ['tag_id'], unique=False)
    
    # ========== 7. 创建 item_tags 表（已废弃，保留兼容性） ==========
    op.create_table('item_tags',
        sa.Column('id', sa.Integer(), autoincrement=True, nullable=False, comment='关系ID'),
        sa.Column('item_id', sa.Integer(), nullable=False, comment='条目ID'),
        sa.Column('tag_id', sa.Integer(), nullable=False, comment='标签ID'),
        sa.Column('created_at', sa.DateTime(), nullable=False, server_default=sa.text('now()'), comment='创建时间'),
        sa.Column('updated_at', sa.DateTime(), nullable=False, server_default=sa.text('now()'), comment='更新时间'),
        sa.ForeignKeyConstraint(['item_id'], ['items.id'], ondelete='CASCADE'),
        sa.ForeignKeyConstraint(['tag_id'], ['tags.id'], ondelete='CASCADE'),
        sa.PrimaryKeyConstraint('id')
    )
    op.create_index(op.f('ix_item_tags_id'), 'item_tags', ['id'], unique=False)
    op.create_index(op.f('ix_item_tags_item_id'), 'item_tags', ['item_id'], unique=False)
    op.create_index(op.f('ix_item_tags_tag_id'), 'item_tags', ['tag_id'], unique=False)
    
    # ========== 8. 创建 llm_configs 表 ==========
    op.create_table('llm_configs',
        sa.Column('id', sa.Integer(), autoincrement=True, nullable=False, comment='配置ID'),
        sa.Column('provider', postgresql.ENUM('siliconflow', 'deepseek', 'openai', 'claude', 
                                              name='llmprovider'), 
                  nullable=False, server_default='siliconflow', comment='LLM提供商'),
        sa.Column('api_key', sa.String(length=500), nullable=True, comment='API密钥'),
        sa.Column('base_url', sa.String(length=500), nullable=True, comment='API基础URL'),
        sa.Column('model', sa.String(length=200), nullable=True, comment='默认模型'),
        sa.Column('temperature', sa.Float(), nullable=True, comment='温度参数'),
        sa.Column('max_tokens', sa.Integer(), nullable=True, comment='最大token数'),
        sa.Column('top_p', sa.Float(), nullable=True, server_default='1.0', comment='top_p参数'),
        sa.Column('enabled', sa.Boolean(), nullable=False, server_default='true', comment='是否启用'),
        sa.Column('auto_tag_enabled', sa.Boolean(), nullable=False, server_default='false', comment='是否启用自动标签'),
        sa.Column('is_default', sa.Boolean(), nullable=True, server_default='false', comment='是否默认'),
        sa.Column('description', sa.Text(), nullable=True, comment='配置描述'),
        sa.Column('extra_config', postgresql.JSON(astext_type=sa.Text()), nullable=True, comment='额外配置'),
        sa.Column('created_at', sa.DateTime(), nullable=False, server_default=sa.text('now()'), comment='创建时间'),
        sa.Column('updated_at', sa.DateTime(), nullable=False, server_default=sa.text('now()'), comment='更新时间'),
        sa.PrimaryKeyConstraint('id')
    )
    op.create_index(op.f('ix_llm_configs_id'), 'llm_configs', ['id'], unique=False)
    op.create_index(op.f('ix_llm_configs_provider'), 'llm_configs', ['provider'], unique=False)
    
    # ========== 9. 创建 api_key_configs 表 ==========
    op.create_table('api_key_configs',
        sa.Column('id', sa.Integer(), autoincrement=True, nullable=False, comment='配置ID'),
        sa.Column('service', postgresql.ENUM('TMDB', 'GOOGLE_BOOKS', 'BANGUMI', name='apikeyservice'), 
                  nullable=False, comment='API服务类型'),
        sa.Column('api_key', sa.String(length=500), nullable=True, comment='API密钥'),
        sa.Column('base_url', sa.String(length=500), nullable=True, comment='API基础URL'),
        sa.Column('enabled', sa.Boolean(), nullable=False, server_default='true', comment='是否启用'),
        sa.Column('last_tested_at', sa.DateTime(), nullable=True, comment='最后测试时间'),
        sa.Column('test_status', postgresql.ENUM('NOT_TESTED', 'SUCCESS', 'FAILED', name='teststatus'), 
                  nullable=False, server_default='NOT_TESTED', comment='测试状态'),
        sa.Column('test_message', sa.Text(), nullable=True, comment='测试消息'),
        sa.Column('description', sa.Text(), nullable=True, comment='配置描述'),
        sa.Column('created_at', sa.DateTime(), nullable=False, server_default=sa.text('now()'), comment='创建时间'),
        sa.Column('updated_at', sa.DateTime(), nullable=False, server_default=sa.text('now()'), comment='更新时间'),
        sa.PrimaryKeyConstraint('id'),
        sa.UniqueConstraint('service', name='uq_api_key_configs_service')
    )
    op.create_index(op.f('ix_api_key_configs_id'), 'api_key_configs', ['id'], unique=False)
    
    # 插入默认 API 配置数据
    op.execute("""
        INSERT INTO api_key_configs (service, api_key, base_url, enabled, test_status, description, created_at, updated_at)
        VALUES 
        ('TMDB', NULL, 'https://api.themoviedb.org/3', true, 'NOT_TESTED', '电影和电视剧数据库', now(), now()),
        ('GOOGLE_BOOKS', NULL, 'https://www.googleapis.com/books/v1', true, 'NOT_TESTED', 'Google 图书数据库', now(), now()),
        ('BANGUMI', NULL, 'https://api.bgm.tv', true, 'NOT_TESTED', '番组计划数据库', now(), now())
    """)
    
    # ========== 10. 创建 summaries 表 ==========
    op.create_table('summaries',
        sa.Column('id', sa.Integer(), autoincrement=True, nullable=False, comment='总结ID'),
        sa.Column('user_id', sa.Integer(), nullable=False, comment='用户ID'),
        sa.Column('title', sa.String(length=200), nullable=False, comment='总结标题'),
        sa.Column('period_type', postgresql.ENUM('WEEK', 'MONTH', 'YEAR', 'CUSTOM', name='periodtype'), 
                  nullable=False, server_default='MONTH', comment='时期类型'),
        sa.Column('start_date', sa.DateTime(), nullable=False, comment='开始日期'),
        sa.Column('end_date', sa.DateTime(), nullable=False, comment='结束日期'),
        sa.Column('summary_text', sa.Text(), nullable=False, comment='总结文本'),
        sa.Column('keywords', postgresql.JSON(astext_type=sa.Text()), nullable=True, comment='关键词列表'),
        sa.Column('statistics', postgresql.JSON(astext_type=sa.Text()), nullable=True, comment='统计数据快照'),
        sa.Column('created_at', sa.DateTime(), nullable=False, server_default=sa.text('now()'), comment='创建时间'),
        sa.ForeignKeyConstraint(['user_id'], ['users.id'], ondelete='CASCADE'),
        sa.PrimaryKeyConstraint('id')
    )
    op.create_index(op.f('ix_summaries_id'), 'summaries', ['id'], unique=False)
    op.create_index(op.f('ix_summaries_user_id'), 'summaries', ['user_id'], unique=False)
    
    # ========== 11. 创建 background_tasks 表 ==========
    op.create_table('background_tasks',
        sa.Column('id', sa.Integer(), autoincrement=True, nullable=False, comment='任务ID'),
        sa.Column('task_id', sa.String(length=50), nullable=False, comment='任务唯一标识'),
        sa.Column('task_type', sa.String(length=50), nullable=False, comment='任务类型'),
        sa.Column('status', sa.String(length=20), nullable=False, server_default='pending', comment='任务状态'),
        sa.Column('user_id', sa.Integer(), nullable=False, comment='所属用户ID'),
        sa.Column('params', postgresql.JSON(astext_type=sa.Text()), nullable=True, comment='任务参数'),
        sa.Column('result', postgresql.JSON(astext_type=sa.Text()), nullable=True, comment='任务结果'),
        sa.Column('error_message', sa.Text(), nullable=True, comment='错误信息'),
        sa.Column('progress', sa.Integer(), nullable=True, server_default='0', comment='任务进度'),
        sa.Column('progress_message', sa.String(length=200), nullable=True, comment='进度消息'),
        sa.Column('created_at', sa.DateTime(timezone=True), nullable=False, server_default=sa.text('now()'), comment='创建时间'),
        sa.Column('started_at', sa.DateTime(timezone=True), nullable=True, comment='开始处理时间'),
        sa.Column('completed_at', sa.DateTime(timezone=True), nullable=True, comment='完成时间'),
        sa.Column('updated_at', sa.DateTime(timezone=True), nullable=False, server_default=sa.text('now()'), comment='更新时间'),
        sa.PrimaryKeyConstraint('id')
    )
    op.create_index(op.f('ix_background_tasks_id'), 'background_tasks', ['id'], unique=False)
    op.create_index(op.f('ix_background_tasks_task_id'), 'background_tasks', ['task_id'], unique=True)
    op.create_index(op.f('ix_background_tasks_user_id'), 'background_tasks', ['user_id'], unique=False)
    
    # ========== 12. 创建 conversations 表 ==========
    op.create_table('conversations',
        sa.Column('id', sa.Integer(), autoincrement=True, nullable=False, comment='对话ID'),
        sa.Column('user_id', sa.Integer(), nullable=False, comment='用户ID'),
        sa.Column('title', sa.String(length=200), nullable=True, comment='会话标题'),
        sa.Column('created_at', sa.DateTime(), nullable=False, server_default=sa.text('now()'), comment='创建时间'),
        sa.Column('updated_at', sa.DateTime(), nullable=False, server_default=sa.text('now()'), comment='更新时间'),
        sa.ForeignKeyConstraint(['user_id'], ['users.id'], ondelete='CASCADE'),
        sa.PrimaryKeyConstraint('id')
    )
    op.create_index(op.f('ix_conversations_id'), 'conversations', ['id'], unique=False)
    op.create_index(op.f('ix_conversations_user_id'), 'conversations', ['user_id'], unique=False)
    
    # ========== 13. 创建 conversation_messages 表 ==========
    op.create_table('conversation_messages',
        sa.Column('id', sa.Integer(), autoincrement=True, nullable=False, comment='消息ID'),
        sa.Column('conversation_id', sa.Integer(), nullable=False, comment='对话ID'),
        sa.Column('role', sa.String(length=20), nullable=False, comment='角色'),
        sa.Column('content', sa.Text(), nullable=False, comment='消息内容'),
        sa.Column('message_metadata', postgresql.JSON(astext_type=sa.Text()), nullable=True, comment='消息元数据'),
        sa.Column('created_at', sa.DateTime(), nullable=False, server_default=sa.text('now()'), comment='创建时间'),
        sa.ForeignKeyConstraint(['conversation_id'], ['conversations.id'], ondelete='CASCADE'),
        sa.PrimaryKeyConstraint('id')
    )
    op.create_index(op.f('ix_conversation_messages_id'), 'conversation_messages', ['id'], unique=False)
    op.create_index(op.f('ix_conversation_messages_conversation_id'), 'conversation_messages', ['conversation_id'], unique=False)
    
    # ========== 14. 创建 user_settings 表 ==========
    op.create_table('user_settings',
        sa.Column('id', sa.Integer(), autoincrement=True, nullable=False, comment='设置ID'),
        sa.Column('user_id', sa.Integer(), nullable=False, comment='用户ID'),
        sa.Column('auto_generate_tags', sa.Boolean(), nullable=False, server_default='false', comment='自动生成标签'),
        sa.Column('created_at', sa.DateTime(), nullable=False, server_default=sa.text('now()'), comment='创建时间'),
        sa.Column('updated_at', sa.DateTime(), nullable=False, server_default=sa.text('now()'), comment='更新时间'),
        sa.ForeignKeyConstraint(['user_id'], ['users.id'], ondelete='CASCADE'),
        sa.PrimaryKeyConstraint('id'),
        sa.UniqueConstraint('user_id', name='uq_user_settings_user_id')
    )
    op.create_index(op.f('ix_user_settings_id'), 'user_settings', ['id'], unique=False)
    op.create_index(op.f('ix_user_settings_user_id'), 'user_settings', ['user_id'], unique=True)
    
    # ========== 15. 创建 system_settings 表 ==========
    op.create_table('system_settings',
        sa.Column('id', sa.Integer(), autoincrement=True, nullable=False, comment='设置ID'),
        sa.Column('enable_explore', sa.Boolean(), nullable=False, server_default='false', comment='启用探索功能'),
        sa.Column('allow_user_ai_tag_settings', sa.Boolean(), nullable=False, server_default='true', comment='允许用户设置AI标签'),
        sa.Column('created_at', sa.DateTime(), nullable=False, server_default=sa.text('now()'), comment='创建时间'),
        sa.Column('updated_at', sa.DateTime(), nullable=False, server_default=sa.text('now()'), comment='更新时间'),
        sa.PrimaryKeyConstraint('id')
    )
    op.create_index(op.f('ix_system_settings_id'), 'system_settings', ['id'], unique=False)


def downgrade() -> None:
    """删除所有表和枚举类型"""
    
    # 删除表（按依赖关系逆序）
    op.drop_table('system_settings')
    op.drop_table('user_settings')
    op.drop_table('conversation_messages')
    op.drop_table('conversations')
    op.drop_table('background_tasks')
    op.drop_table('summaries')
    op.drop_table('api_key_configs')
    op.drop_table('llm_configs')
    op.drop_table('item_tags')
    op.drop_table('user_item_tags')
    op.drop_table('tags')
    op.drop_table('user_items')
    op.drop_table('items')
    op.drop_table('users')
    
    # 删除枚举类型
    sa.Enum(name='teststatus').drop(op.get_bind(), checkfirst=True)
    sa.Enum(name='apikeyservice').drop(op.get_bind(), checkfirst=True)
    sa.Enum(name='taskstatus').drop(op.get_bind(), checkfirst=True)
    sa.Enum(name='tasktype').drop(op.get_bind(), checkfirst=True)
    sa.Enum(name='periodtype').drop(op.get_bind(), checkfirst=True)
    sa.Enum(name='llmprovider').drop(op.get_bind(), checkfirst=True)
    sa.Enum(name='tagtype').drop(op.get_bind(), checkfirst=True)
    sa.Enum(name='itemstatus').drop(op.get_bind(), checkfirst=True)
    sa.Enum(name='itemtype').drop(op.get_bind(), checkfirst=True)
    sa.Enum(name='userrole').drop(op.get_bind(), checkfirst=True)
