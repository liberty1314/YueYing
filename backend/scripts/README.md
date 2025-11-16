# 数据库脚本使用说明

本目录包含用于数据库管理的实用脚本。

## 可用脚本

### 1. init_db.py - 数据库初始化

直接从 SQLAlchemy 模型创建所有表结构（不使用 Alembic 迁移）。

**使用场景**：
- 快速开发测试
- 不需要迁移历史的场景

**使用方法**：
```bash
# Docker 环境
docker-compose exec backend python scripts/init_db.py

# 本地环境
cd backend
python scripts/init_db.py
```

**注意**：此脚本不会删除现有表，如果表已存在会跳过创建。

---

### 2. seed_data.py - 种子数据加载

创建初始数据，包括：
- 管理员用户（默认：admin/admin123）
- 系统设置（默认配置）
- API 密钥配置（TMDB、Google Books、Bangumi）

**使用场景**：
- 首次部署后初始化数据
- 重置数据库后恢复基础配置

**使用方法**：
```bash
# Docker 环境（推荐）
make seed

# 或直接执行
docker-compose exec backend python scripts/seed_data.py

# 本地环境
cd backend
python scripts/seed_data.py
```

**环境变量**（可选）：
- `ADMIN_USERNAME`: 管理员用户名（默认：admin）
- `ADMIN_PASSWORD`: 管理员密码（默认：admin123）
- `ADMIN_EMAIL`: 管理员邮箱（默认：admin@example.com）

---

### 3. reset_db.py - 数据库重置 ⚠️

**危险操作！** 完全重置数据库，删除所有表、枚举类型和数据。

**使用场景**：
- 开发环境需要清空数据库
- 迁移脚本出现问题需要重新开始
- 测试新的数据库架构

**使用方法**：

#### 方式 1：使用 Makefile（推荐）
```bash
make reset-db
```
此命令会：
1. 提示确认（需要输入 'YES'）
2. 重置数据库（删除所有表和枚举）
3. 运行 Alembic 迁移
4. 加载种子数据

#### 方式 2：直接执行脚本
```bash
# Docker 环境
docker-compose exec backend python scripts/reset_db.py

# 本地环境
cd backend
python scripts/reset_db.py
```

**安全机制**：
- 生产环境禁止执行（检查 `APP_ENV` 环境变量）
- 需要手动输入 'YES' 确认（除非设置 `AUTO_CONFIRM_RESET=true`）
- 会显示详细的警告信息

**执行流程**：
1. 删除所有现有表（使用 CASCADE）
2. 删除所有枚举类型
3. 重新创建表结构（从 SQLAlchemy 模型）

**注意事项**：
- ⚠️ 此操作不可逆，所有数据将永久丢失
- 建议先备份数据库：`make backup-db`
- 仅在开发/测试环境使用
- 重置后需要运行迁移和种子数据脚本

---

## 完整的数据库初始化流程

### 首次部署

```bash
# 1. 启动基础服务
make init

# 2. 启动所有服务
make up

# 3. 运行数据库迁移
make migrate

# 4. 加载种子数据
make seed
```

### 重置数据库（开发环境）

```bash
# 方式 1：一键重置（推荐）
make reset-db

# 方式 2：手动步骤
docker-compose exec backend python scripts/reset_db.py
make migrate
make seed
```

### 备份和恢复

```bash
# 备份数据库
make backup-db

# 恢复数据库
make restore-db
```

---

## 常见问题

### Q: reset_db.py 和 init_db.py 有什么区别？

**A**: 
- `reset_db.py`: 先删除所有表和枚举，然后重新创建（完全清空）
- `init_db.py`: 只创建不存在的表，不删除现有数据

### Q: 为什么重置后还需要运行迁移？

**A**: `reset_db.py` 使用 SQLAlchemy 模型创建表结构，但 Alembic 需要知道当前的迁移状态。运行 `alembic upgrade head` 会更新 `alembic_version` 表，确保迁移历史正确。

### Q: 可以在生产环境使用 reset_db.py 吗？

**A**: **绝对不可以！** 脚本会检查 `APP_ENV` 环境变量，如果是 `production` 会拒绝执行。生产环境应该使用迁移脚本进行数据库变更。

### Q: 如何创建新的迁移脚本？

**A**: 
```bash
# 自动生成迁移脚本
make migrate-create

# 或手动指定描述
docker-compose exec backend alembic revision --autogenerate -m "描述"
```

---

## 脚本依赖

所有脚本依赖以下模块：
- SQLAlchemy: ORM 和数据库操作
- Alembic: 数据库迁移管理
- app.core.config: 应用配置
- app.core.database: 数据库连接
- app.core.logging: 日志记录
- app.models.*: 所有数据模型

确保在运行脚本前，所有依赖已正确安装。
