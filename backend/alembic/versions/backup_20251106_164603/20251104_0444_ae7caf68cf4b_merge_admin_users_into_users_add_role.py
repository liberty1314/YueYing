"""merge_admin_users_into_users_add_role

合并 admin_users 表到 users 表，添加 role 字段

Revision ID: ae7caf68cf4b
Revises: fa5f55d0067b
Create Date: 2025-11-04 04:44:38.068529

"""
from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql


# revision identifiers, used by Alembic.
revision = 'ae7caf68cf4b'
down_revision = 'fa5f55d0067b'
branch_labels = None
depends_on = None


def upgrade() -> None:
    # 1. 创建角色枚举类型
    role_enum = postgresql.ENUM('user', 'moderator', 'admin', 'super_admin', name='userrole')
    role_enum.create(op.get_bind(), checkfirst=True)
    
    # 2. 给 users 表添加 role 字段（默认为 'user'）
    op.add_column('users', sa.Column('role', sa.Enum('user', 'moderator', 'admin', 'super_admin', name='userrole'), nullable=False, server_default='user'))
    op.create_index(op.f('ix_users_role'), 'users', ['role'], unique=False)
    
    # 3. 迁移 admin_users 数据到 users 表
    # 首先获取 admin_users 的数据并插入到 users 表
    # 注意：我们需要处理可能的 email 冲突
    connection = op.get_bind()
    
    # 获取 admin_users 数据
    admin_users = connection.execute(sa.text("""
        SELECT id, email, username, hashed_password, full_name, role, is_active, avatar_url, created_at, updated_at
        FROM admin_users
    """)).fetchall()
    
    # 迁移每个管理员用户
    for admin_user in admin_users:
        # 检查该 email 是否已存在于 users 表
        existing_user = connection.execute(sa.text("""
            SELECT id FROM users WHERE email = :email
        """), {"email": admin_user[1]}).fetchone()
        
        if existing_user:
            # 如果存在，更新为管理员角色
            connection.execute(sa.text("""
                UPDATE users 
                SET role = :role, 
                    username = COALESCE(:username, username),
                    full_name = COALESCE(:full_name, full_name),
                    avatar_url = COALESCE(:avatar_url, avatar_url),
                    updated_at = :updated_at
                WHERE email = :email
            """), {
                "role": admin_user[5],  # role from admin_users
                "username": admin_user[2],
                "full_name": admin_user[4],
                "avatar_url": admin_user[7],
                "updated_at": admin_user[9],
                "email": admin_user[1]
            })
        else:
            # 如果不存在，插入新记录
            connection.execute(sa.text("""
                INSERT INTO users (email, username, hashed_password, full_name, role, is_active, is_verified, avatar_url, created_at, updated_at)
                VALUES (:email, :username, :hashed_password, :full_name, :role, :is_active, false, :avatar_url, :created_at, :updated_at)
            """), {
                "email": admin_user[1],
                "username": admin_user[2],
                "hashed_password": admin_user[3],
                "full_name": admin_user[4],
                "role": admin_user[5],
                "is_active": admin_user[6],
                "avatar_url": admin_user[7],
                "created_at": admin_user[8],
                "updated_at": admin_user[9]
            })
    
    # 4. 删除 admin_users 表
    op.drop_index(op.f('ix_admin_users_username'), table_name='admin_users')
    op.drop_index(op.f('ix_admin_users_role'), table_name='admin_users')
    op.drop_index(op.f('ix_admin_users_id'), table_name='admin_users')
    op.drop_index(op.f('ix_admin_users_email'), table_name='admin_users')
    op.drop_table('admin_users')
    
    # 5. 删除旧的 adminrole 枚举类型
    old_admin_role_enum = postgresql.ENUM(name='adminrole')
    old_admin_role_enum.drop(op.get_bind(), checkfirst=True)


def downgrade() -> None:
    # 注意：降级会丢失数据，仅用于开发环境
    
    # 1. 重新创建 admin_users 表
    op.create_table('admin_users',
        sa.Column('id', sa.INTEGER(), autoincrement=True, nullable=False),
        sa.Column('email', sa.VARCHAR(length=255), autoincrement=False, nullable=False),
        sa.Column('username', sa.VARCHAR(length=50), autoincrement=False, nullable=False),
        sa.Column('hashed_password', sa.VARCHAR(length=255), autoincrement=False, nullable=False),
        sa.Column('full_name', sa.VARCHAR(length=100), autoincrement=False, nullable=True),
        sa.Column('role', postgresql.ENUM('super_admin', 'admin', 'moderator', name='adminrole'), autoincrement=False, nullable=False),
        sa.Column('is_active', sa.BOOLEAN(), autoincrement=False, nullable=False),
        sa.Column('avatar_url', sa.VARCHAR(length=500), autoincrement=False, nullable=True),
        sa.Column('created_at', postgresql.TIMESTAMP(timezone=True), server_default=sa.text('now()'), autoincrement=False, nullable=False),
        sa.Column('updated_at', postgresql.TIMESTAMP(timezone=True), server_default=sa.text('now()'), autoincrement=False, nullable=False),
        sa.PrimaryKeyConstraint('id', name='admin_users_pkey')
    )
    op.create_index(op.f('ix_admin_users_email'), 'admin_users', ['email'], unique=True)
    op.create_index(op.f('ix_admin_users_id'), 'admin_users', ['id'], unique=False)
    op.create_index(op.f('ix_admin_users_role'), 'admin_users', ['role'], unique=False)
    op.create_index(op.f('ix_admin_users_username'), 'admin_users', ['username'], unique=True)
    
    # 2. 将管理员用户从 users 表迁移回 admin_users 表
    connection = op.get_bind()
    admin_users = connection.execute(sa.text("""
        SELECT id, email, username, hashed_password, full_name, role, is_active, avatar_url, created_at, updated_at
        FROM users
        WHERE role IN ('admin', 'super_admin', 'moderator')
    """)).fetchall()
    
    for admin_user in admin_users:
        connection.execute(sa.text("""
            INSERT INTO admin_users (email, username, hashed_password, full_name, role, is_active, avatar_url, created_at, updated_at)
            VALUES (:email, :username, :hashed_password, :full_name, :role, :is_active, :avatar_url, :created_at, :updated_at)
        """), {
            "email": admin_user[1],
            "username": admin_user[2],
            "hashed_password": admin_user[3],
            "full_name": admin_user[4],
            "role": admin_user[5],
            "is_active": admin_user[6],
            "avatar_url": admin_user[7],
            "created_at": admin_user[8],
            "updated_at": admin_user[9]
        })
    
    # 3. 从 users 表删除 role 字段
    op.drop_index(op.f('ix_users_role'), table_name='users')
    op.drop_column('users', 'role')
    
    # 4. 删除 userrole 枚举类型
    userrole_enum = postgresql.ENUM(name='userrole')
    userrole_enum.drop(op.get_bind(), checkfirst=True)


