# 数据库脚本

本目录包含数据库初始化和管理脚本。

## 脚本说明

### 1. init_db.py - 数据库初始化

创建所有数据库表。

```bash
# 创建所有表
python scripts/init_db.py

# 删除所有表（危险操作！）
python scripts/init_db.py --drop
```

### 2. seed_data.py - 种子数据

创建开发和测试用的初始数据。

```bash
# 创建种子数据
python scripts/seed_data.py

# 清除所有数据（危险操作！）
python scripts/seed_data.py --clear
```

**种子数据包含**:
- 1个测试用户 (test@yueying.app / password123)
- 1个管理员 (admin@yueying.app / admin123)
- 10个标签
- 3个内容示例（1电影, 1书籍, 1动漫）
- 3条用户记录
- 3个LLM配置

### 3. reset_db.py - 重置数据库

删除所有数据并重新创建种子数据。

```bash
python scripts/reset_db.py
```

⚠️ **警告**: 这将删除所有现有数据！

## 使用 Alembic 迁移

推荐使用 Alembic 进行数据库迁移：

```bash
# 创建迁移
alembic revision --autogenerate -m "Initial schema"

# 应用迁移
alembic upgrade head

# 回滚迁移
alembic downgrade -1

# 查看历史
alembic history
```

## 开发流程

1. **首次设置**:
```bash
# 创建数据库表
alembic upgrade head

# 加载种子数据
python scripts/seed_data.py
```

2. **模型变更**:
```bash
# 创建新迁移
alembic revision --autogenerate -m "Add new fields"

# 应用迁移
alembic upgrade head
```

3. **重置开发环境**:
```bash
# 完全重置
python scripts/reset_db.py
```

## 注意事项

- ⚠️ 删除和重置操作会导致数据丢失
- 🔒 生产环境请谨慎使用这些脚本
- 📝 重要数据请先备份
- 🧪 建议在测试环境先验证

## 常见问题

### 1. 找不到模块错误

确保在项目根目录运行脚本，或设置 PYTHONPATH：

```bash
export PYTHONPATH=$PWD
python scripts/seed_data.py
```

### 2. 数据库连接失败

检查 `.env` 文件中的数据库配置：

```env
DATABASE_URL=postgresql://user:password@localhost:5432/dbname
```

### 3. 迁移冲突

如果遇到迁移冲突，可以重置迁移历史：

```bash
# 删除 alembic/versions/ 下的所有迁移文件
rm alembic/versions/*.py

# 重新生成初始迁移
alembic revision --autogenerate -m "Initial schema"
```

