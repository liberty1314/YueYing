#!/bin/bash
# ====================================
# 后端容器启动脚本
# 自动执行数据库迁移和种子数据加载
# ====================================

set -e

echo "======================================"
echo "阅影·log 后端服务启动中..."
echo "======================================"

# 等待数据库就绪
echo "等待 PostgreSQL 数据库就绪..."
max_retries=30
retry_count=0

while ! python -c "
import psycopg2
import os
import sys
from urllib.parse import urlparse

try:
    db_url = os.environ.get('DATABASE_URL')
    if not db_url:
        print('错误: DATABASE_URL 未设置')
        sys.exit(1)
    
    # 解析数据库 URL
    parsed = urlparse(db_url)
    conn = psycopg2.connect(
        host=parsed.hostname,
        port=parsed.port or 5432,
        user=parsed.username,
        password=parsed.password,
        database=parsed.path[1:],
        connect_timeout=3
    )
    conn.close()
    print('✓ 数据库连接成功')
    sys.exit(0)
except Exception as e:
    print(f'数据库连接失败: {e}')
    sys.exit(1)
" 2>/dev/null; do
    retry_count=$((retry_count + 1))
    if [ $retry_count -ge $max_retries ]; then
        echo "✗ 数据库连接超时，启动失败"
        exit 1
    fi
    echo "  等待中... ($retry_count/$max_retries)"
    sleep 2
done

echo "✓ 数据库已就绪"
echo ""

# 运行数据库迁移
echo "执行数据库迁移..."
if alembic upgrade head; then
    echo "✓ 数据库迁移完成"
else
    echo "✗ 数据库迁移失败"
    exit 1
fi
echo ""

# 加载种子数据
echo "加载种子数据..."
if python scripts/seed_data.py; then
    echo "✓ 种子数据加载完成"
else
    echo "⚠ 种子数据加载失败（可能已存在）"
fi
echo ""

echo "======================================"
echo "后端服务启动完成"
echo "======================================"
echo ""

# 启动应用
exec "$@"
