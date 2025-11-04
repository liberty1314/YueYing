"""simplify_user_roles_to_user_and_admin

Revision ID: 42196f5525fe
Revises: 1180bba91402
Create Date: 2025-11-04 04:55:58.975051

"""
from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql

# revision identifiers, used by Alembic.
revision = '42196f5525fe'
down_revision = '1180bba91402'
branch_labels = None
depends_on = None


def upgrade() -> None:
    # 1. 将所有 moderator 和 super_admin 角色转换为 admin
    connection = op.get_bind()
    connection.execute(sa.text("""
        UPDATE users 
        SET role = 'admin' 
        WHERE role IN ('moderator', 'super_admin')
    """))
    
    # 2. 修改枚举类型：从 ('user', 'moderator', 'admin', 'super_admin') 改为 ('user', 'admin')
    # PostgreSQL 不支持直接修改枚举，需要创建新类型并转换
    
    # 创建新的枚举类型
    op.execute("CREATE TYPE userrole_new AS ENUM ('user', 'admin')")
    
    # 删除列的默认值
    op.execute("ALTER TABLE users ALTER COLUMN role DROP DEFAULT")
    
    # 转换列类型
    op.execute("""
        ALTER TABLE users 
        ALTER COLUMN role TYPE userrole_new 
        USING role::text::userrole_new
    """)
    
    # 重新设置默认值
    op.execute("ALTER TABLE users ALTER COLUMN role SET DEFAULT 'user'::userrole_new")
    
    # 删除旧的枚举类型
    op.execute("DROP TYPE userrole")
    
    # 重命名新类型为原名称
    op.execute("ALTER TYPE userrole_new RENAME TO userrole")


def downgrade() -> None:
    # 降级：恢复包含四个角色的枚举
    # 注意：已转换为 admin 的用户将保持为 admin，无法恢复原来的 moderator 或 super_admin
    
    # 创建包含四个角色的枚举类型
    op.execute("CREATE TYPE userrole_new AS ENUM ('user', 'moderator', 'admin', 'super_admin')")
    
    # 删除列的默认值
    op.execute("ALTER TABLE users ALTER COLUMN role DROP DEFAULT")
    
    # 转换列类型
    op.execute("""
        ALTER TABLE users 
        ALTER COLUMN role TYPE userrole_new 
        USING role::text::userrole_new
    """)
    
    # 重新设置默认值
    op.execute("ALTER TABLE users ALTER COLUMN role SET DEFAULT 'user'::userrole_new")
    
    # 删除旧的枚举类型
    op.execute("DROP TYPE userrole")
    
    # 重命名新类型为原名称
    op.execute("ALTER TYPE userrole_new RENAME TO userrole")


