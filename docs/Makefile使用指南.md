# Makefile 使用指南

本文档详细介绍项目中所有可用的 Makefile 命令及其使用场景。

## 📋 目录

- [快速参考](#快速参考)
- [项目初始化](#项目初始化)
- [服务管理](#服务管理)
- [日志查看](#日志查看)
- [镜像构建](#镜像构建)
- [数据库操作](#数据库操作)
- [测试](#测试)
- [容器操作](#容器操作)
- [部署相关](#部署相关)
- [清理与维护](#清理与维护)

## 快速参考

```bash
# 查看所有可用命令及说明
make help
```

## 项目初始化

### `make init`

**用途**：首次运行项目时的初始化操作

**执行内容**：
1. 检查并创建 `.env` 文件（从 `.env.example` 复制）
2. 启动基础服务（PostgreSQL、Redis、MinIO）
3. 等待数据库就绪（最多 60 秒）

**使用场景**：
- 首次克隆项目后
- 重新配置环境时

**示例**：
```bash
make init
```

**注意事项**：
- 如果 `.env` 文件已存在，会跳过创建步骤
- 初始化后需要编辑 `.env` 文件填写必要的配置
- 完成后需要运行 `make up` 启动所有服务

## 服务管理

### `make up`

**用途**：启动所有服务

**执行内容**：
- 启动所有 Docker 容器（后台运行）
- 显示服务访问地址

**使用场景**：
- 日常开发启动
- 部署后启动服务

**示例**：
```bash
make up
```

**输出示例**：
```
启动所有服务...
✓ 服务已启动
前端: http://localhost:3000
后端: http://localhost:8000
API文档: http://localhost:8000/docs
```

---

### `make down`

**用途**：停止所有服务

**执行内容**：
- 停止并删除所有容器
- 保留数据卷（数据不会丢失）

**使用场景**：
- 结束开发工作
- 需要释放系统资源

**示例**：
```bash
make down
```

---

### `make restart`

**用途**：重启所有服务

**执行内容**：
- 重启所有正在运行的容器
- 不重新构建镜像

**使用场景**：
- 配置文件修改后
- 服务出现异常需要重启

**示例**：
```bash
make restart
```

---

### `make quick-start`

**用途**：快速启动（适用于已初始化的项目）

**执行内容**：
- 启动所有服务
- 显示访问地址

**使用场景**：
- 项目已完成初始化
- 日常快速启动

**示例**：
```bash
make quick-start
```

---

### `make ps`

**用途**：查看服务状态

**执行内容**：
- 显示所有容器的运行状态
- 显示端口映射信息

**使用场景**：
- 检查服务是否正常运行
- 查看端口占用情况

**示例**：
```bash
make ps
```

## 日志查看

### `make logs`

**用途**：查看所有服务的实时日志

**执行内容**：
- 实时显示所有容器的日志输出
- 支持 Ctrl+C 退出

**使用场景**：
- 调试问题
- 监控服务运行状态

**示例**：
```bash
make logs
```

---

### `make logs-backend`

**用途**：查看后端服务日志

**示例**：
```bash
make logs-backend
```

---

### `make logs-frontend`

**用途**：查看前端服务日志

**示例**：
```bash
make logs-frontend
```

## 镜像构建

### `make build`

**用途**：重新构建所有镜像（不使用缓存）

**执行内容**：
- 强制重新构建前端和后端镜像
- 不使用 Docker 缓存层

**使用场景**：
- 依赖包更新后
- 代码重大变更后
- 构建缓存导致问题时

**示例**：
```bash
make build
```

**注意事项**：
- 构建时间较长（5-15 分钟）
- 会下载所有依赖包

---

### `make build-backend`

**用途**：仅重新构建后端镜像

**使用场景**：
- 后端代码或依赖更新
- 后端 Dockerfile 修改

**示例**：
```bash
make build-backend
```

---

### `make build-frontend`

**用途**：仅重新构建前端镜像

**使用场景**：
- 前端代码或依赖更新
- 前端 Dockerfile 修改

**示例**：
```bash
make build-frontend
```

---

### `make full-restart`

**用途**：完全重启（停止 -> 清理缓存 -> 重新构建 -> 启动）

**执行内容**：
1. 停止所有服务
2. 强制重新构建后端和前端镜像
3. 启动所有服务

**使用场景**：
- 代码或配置重大变更
- 需要彻底刷新环境
- 解决缓存导致的问题

**示例**：
```bash
make full-restart
```

**注意事项**：
- 执行时间较长
- 数据不会丢失（数据卷保留）

## 数据库操作

### `make init-db`

**用途**：初始化数据库（首次部署推荐）

**执行内容**：
- 直接从 SQLAlchemy 模型创建所有表
- 显示创建的表列表

**使用场景**：
- 首次部署项目
- 数据库完全重置后

**示例**：
```bash
make init-db
```

**与 `make migrate` 的区别**：
- `init-db`：直接创建表，适合首次部署
- `migrate`：应用迁移脚本，适合版本升级

---

### `make migrate`

**用途**：运行数据库迁移

**执行内容**：
- 应用所有待执行的 Alembic 迁移脚本
- 更新数据库到最新版本

**使用场景**：
- 开发环境数据库更新
- 版本升级时

**示例**：
```bash
make migrate
```

---

### `make migrate-create`

**用途**：创建新的数据库迁移

**执行内容**：
- 提示输入迁移描述
- 自动生成迁移脚本

**使用场景**：
- 数据模型变更后
- 需要创建新的迁移脚本

**示例**：
```bash
make migrate-create
# 输入描述: 添加用户头像字段
```

---

### `make seed`

**用途**：加载种子数据

**执行内容**：
- 创建管理员用户
- 初始化系统设置
- 创建 API 密钥配置模板

**使用场景**：
- 首次部署后
- 数据库重置后

**示例**：
```bash
make seed
```

**种子数据包括**：
- 管理员用户（从环境变量读取）
- 系统设置默认值
- API 密钥配置（TMDB、Google Books、Bangumi）

---

### `make reset-db`

**用途**：重置数据库（危险操作！会删除所有数据）

**执行内容**：
1. 提示确认（需要输入 'YES'）
2. 执行数据库重置脚本（删除所有表和枚举类型）
3. 运行数据库迁移（创建表结构）
4. 加载种子数据

**使用场景**：
- 开发环境需要完全重置数据库
- 数据库结构出现问题需要重建
- 迁移脚本整合后的初始化

**示例**：
```bash
make reset-db
# 提示: ⚠ 警告: 这将删除所有数据库数据！
# 确定继续? 输入 'YES' 确认: YES
```

**警告**：
- ⚠️ 会删除所有数据库表和数据
- ⚠️ 会删除所有枚举类型
- ⚠️ 操作不可逆，请提前备份重要数据
- ⚠️ 仅适用于开发环境，生产环境禁止使用

**与其他命令的区别**：
- `reset-db`：删除所有表和枚举，然后重新创建（最彻底）
- `migrate`：仅应用迁移脚本（增量更新）
- `clean`：删除所有容器和数据卷（包括数据库文件）

---

### `make backup-db`

**用途**：备份数据库

**执行内容**：
- 导出 PostgreSQL 数据库
- 保存到 `backups/` 目录
- 文件名包含时间戳

**使用场景**：
- 重要操作前备份
- 定期数据备份

**示例**：
```bash
make backup-db
```

**备份文件位置**：
```
backups/yueying_20241115_143022.sql
```

---

### `make restore-db`

**用途**：恢复数据库

**执行内容**：
- 列出可用的备份文件
- 提示选择要恢复的备份
- 恢复数据库

**使用场景**：
- 数据丢失后恢复
- 回滚到之前的状态

**示例**：
```bash
make restore-db
# 输入备份文件路径: backups/yueying_20241115_143022.sql
```

---

### `make shell-db`

**用途**：进入数据库容器的 psql 命令行

**使用场景**：
- 直接执行 SQL 查询
- 数据库调试

**示例**：
```bash
make shell-db
# 进入 psql 后可以执行 SQL 命令
```

## 测试

### `make test`

**用途**：运行所有测试（后端 + 前端）

**执行内容**：
- 运行后端 pytest 测试
- 运行前端 npm 测试

**使用场景**：
- 代码提交前
- CI/CD 流程中

**示例**：
```bash
make test
```

---

### `make test-backend`

**用途**：运行后端测试

**示例**：
```bash
make test-backend
```

---

### `make test-frontend`

**用途**：运行前端测试

**示例**：
```bash
make test-frontend
```

## 容器操作

### `make shell-backend`

**用途**：进入后端容器的 bash 终端

**使用场景**：
- 调试后端代码
- 手动执行 Python 脚本
- 查看容器内文件

**示例**：
```bash
make shell-backend
# 进入容器后可以执行任何 bash 命令
```

---

### `make shell-frontend`

**用途**：进入前端容器的 sh 终端

**使用场景**：
- 调试前端代码
- 手动执行 npm 命令
- 查看容器内文件

**示例**：
```bash
make shell-frontend
```

## 部署相关

### `make deploy`

**用途**：完整部署流程（一键部署）

**执行内容**：
1. 重新构建所有镜像（`make build`）
2. 启动所有服务（`make up`）
3. 运行数据库迁移（`make migrate`）
4. 加载种子数据（`make seed`）
5. 显示访问地址和管理员账号

**使用场景**：
- 首次部署项目
- 完整重新部署

**示例**：
```bash
make deploy
```

**输出示例**：
```
✓ 部署完成

访问地址：
  前端: http://localhost:3000
  后端: http://localhost:8000
  API文档: http://localhost:8000/docs

管理员账号：
  用户名: admin
  密码: admin123
```

**注意事项**：
- 执行时间较长（10-20 分钟）
- 适合首次部署或完整重置

---

### `make redeploy`

**用途**：重新部署（清理所有数据并重新部署）

**执行内容**：
1. 提示确认（危险操作）
2. 清理所有容器和数据卷（`make clean`）
3. 执行完整部署（`make deploy`）

**使用场景**：
- 需要完全重置环境
- 数据库结构重大变更

**示例**：
```bash
make redeploy
# 提示: ⚠ 这将删除所有数据并重新部署！
# 确定继续? [y/N] y
```

**警告**：
- ⚠️ 会删除所有数据（包括数据库、Redis、MinIO）
- ⚠️ 操作不可逆，请提前备份重要数据

---

### `make check-env`

**用途**：检查环境变量配置

**执行内容**：
- 检查 `.env` 文件是否存在
- 检查关键 API Key 是否配置

**使用场景**：
- 部署前检查配置
- 排查配置问题

**示例**：
```bash
make check-env
```

**输出示例**：
```
检查环境变量配置...
✓ .env 文件存在
⚠ TMDB API Key 未配置（使用占位符）
⚠ SiliconFlow API Key 未配置
```

## 清理与维护

### `make clean`

**用途**：清理所有容器、数据卷和 Docker 系统缓存

**执行内容**：
- 提示确认（危险操作）
- 停止并删除所有容器
- 删除所有数据卷
- 清理 Docker 系统缓存（未使用的镜像、容器、网络、构建缓存）

**使用场景**：
- 完全重置环境
- 释放磁盘空间
- 清理 Docker 构建缓存

**示例**：
```bash
make clean
# 提示: ⚠ 警告: 这将删除所有容器和数据卷！
# 确定继续? [y/N] y
```

**警告**：
- ⚠️ 会删除所有数据（数据库、Redis、MinIO）
- ⚠️ 会删除所有 Docker 镜像和构建缓存
- ⚠️ 操作不可逆，请提前备份重要数据
- ⚠️ 清理后需要重新构建镜像（耗时较长）

---

### `make health`

**用途**：检查所有服务健康状态

**执行内容**：
- 显示所有容器的运行状态
- 等同于 `make ps`

**使用场景**：
- 检查服务是否正常
- 故障排查

**示例**：
```bash
make health
```

## 常见使用场景

### 场景 1：首次部署项目

```bash
# 1. 初始化项目
make init

# 2. 编辑 .env 文件，填写必要配置
vim .env

# 3. 一键部署
make deploy
```

### 场景 2：日常开发

```bash
# 启动服务
make quick-start

# 查看日志
make logs-backend

# 进入后端容器调试
make shell-backend

# 停止服务
make down
```

### 场景 3：代码更新后重新部署

```bash
# 方式 1：仅重启（代码小改动）
make restart

# 方式 2：重新构建并启动（依赖更新）
make full-restart

# 方式 3：完全重新部署（重大变更）
make deploy
```

### 场景 4：数据库迁移

```bash
# 1. 修改模型后创建迁移
make migrate-create

# 2. 应用迁移
make migrate

# 3. 如果出错，恢复备份
make restore-db
```

### 场景 5：数据库完全重置（开发环境）

```bash
# 1. 备份当前数据（可选）
make backup-db

# 2. 重置数据库
make reset-db

# 这将：
# - 删除所有表和枚举类型
# - 运行最新的迁移脚本
# - 加载种子数据
```

### 场景 6：故障排查

```bash
# 1. 检查服务状态
make health

# 2. 查看日志
make logs

# 3. 进入容器检查
make shell-backend

# 4. 检查环境配置
make check-env
```

## 技巧与最佳实践

### 1. 使用 `make help` 快速查找命令

```bash
make help
```

### 2. 重要操作前先备份

```bash
make backup-db
```

### 3. 定期清理 Docker 缓存

```bash
# 清理未使用的镜像
docker image prune -a

# 清理未使用的卷
docker volume prune
```

### 4. 查看详细日志

```bash
# 查看最近 100 行日志
docker-compose logs --tail=100 backend

# 查看特定时间的日志
docker-compose logs --since 2024-11-15T10:00:00 backend
```

### 5. 组合使用命令

```bash
# 备份后重新部署
make backup-db && make redeploy

# 构建并启动特定服务
make build-backend && docker-compose up -d backend
```

## 故障排查

### 问题：`make init` 数据库启动超时

**解决方案**：
```bash
# 手动检查数据库状态
docker-compose ps postgres

# 查看数据库日志
docker-compose logs postgres

# 手动等待数据库就绪
docker-compose exec postgres pg_isready -U yueying
```

### 问题：`make deploy` 失败

**解决方案**：
```bash
# 1. 检查环境配置
make check-env

# 2. 查看失败的服务日志
make logs

# 3. 尝试分步执行
make build
make up
make init-db
make seed
```

### 问题：端口被占用

**解决方案**：
```bash
# 查看端口占用
lsof -i :3000
lsof -i :8000

# 修改 .env 文件中的端口配置
vim .env
```

## 总结

Makefile 提供了便捷的命令来管理整个项目的生命周期：

- **初始化**：`make init`
- **日常开发**：`make quick-start` / `make down`
- **部署**：`make deploy`
- **维护**：`make backup-db` / `make health`
- **调试**：`make logs` / `make shell-backend`

建议优先使用 Makefile 命令，它们封装了最佳实践并提供了友好的输出信息。
