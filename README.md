# 阅影·log（YueYing） - AI驱动的个人娱乐记录平台

<div align="center">

**一个智能、私密的电影、动漫、电视剧和书籍记录工具**

[![License](https://img.shields.io/badge/license-MIT-blue.svg)](LICENSE)
[![Docker](https://img.shields.io/badge/docker-ready-brightgreen.svg)](docker-compose.yml)
[![PRs Welcome](https://img.shields.io/badge/PRs-welcome-brightgreen.svg)](CONTRIBUTING.md)

</div>

## 📖 项目简介

阅影·log是一款以AI驱动为核心的个人娱乐内容记录平台，帮助用户记录、整理和回顾观影和阅读历史。通过深度集成AI能力，提供：

- 🤖 **智能标签生成** - AI自动提取情绪、主题和风格标签
- 🎯 **个性化推荐** - 基于观看历史的深度推荐算法
- 💬 **AI对话助手** - 自然语言查询和智能回顾生成
- 🔒 **隐私至上** - 纯个人工具，数据完全私密
- 🎨 **现代化UI** - 简洁优雅的用户界面

## 🏗️ 技术架构

### 前端
- **框架**: Next.js 14 (App Router)
- **语言**: TypeScript
- **样式**: Tailwind CSS + shadcn/ui
- **状态管理**: Zustand + React Query
- **认证**: NextAuth.js

### 后端
- **框架**: FastAPI (Python)
- **ORM**: SQLAlchemy + Alembic
- **数据验证**: Pydantic
- **认证**: JWT

### 数据库与缓存
- **数据库**: PostgreSQL 16
- **缓存**: Redis 7 (LRU驱逐策略，支持自定义配置)
  - L1 缓存（内存 LRU）：< 1ms 延迟
  - L2 缓存（Redis）：< 10ms 延迟
  - 模块化架构，支持多种缓存策略
- **对象存储**: MinIO

### AI能力
- **LLM提供商**: DeepSeek / OpenAI / Claude (可切换)
- **推荐算法**: 协同过滤 + 内容推荐

### 基础设施
- **容器化**: Docker + Docker Compose
- **反向代理**: Nginx
- **CI/CD**: GitHub Actions

## 🚀 快速开始

### 前置要求

- Docker >= 20.10
- Docker Compose >= 2.0
- Git

### 1️⃣ 克隆项目

```bash
git clone https://github.com/yourusername/yueying.git
cd yueying
```

### 2️⃣ 配置环境变量

```bash
# 使用 Makefile 快速初始化（推荐）
make init

# 或手动复制环境变量模板
cp .env.example .env

# 编辑 .env 文件，填写必要的配置
vim .env
```

> **提示**：`make init` 命令会自动启动基础服务（PostgreSQL、Redis、MinIO）并等待数据库就绪（最多等待 60 秒）。

**必需配置：**
- `SECRET_KEY` - 应用密钥
- `JWT_SECRET_KEY` - JWT 密钥
- `NEXTAUTH_SECRET` - NextAuth 密钥
- 数据库密码（`POSTGRES_PASSWORD`、`REDIS_PASSWORD`、`MINIO_ROOT_PASSWORD`）

**可选配置（启用更多功能）：**
- 第三方 API 密钥（TMDB、Google Books、Bangumi）
- LLM API 密钥（用于 AI 功能）

📚 **详细配置说明：** [docs/环境变量配置说明.md](docs/环境变量配置说明.md)  
📖 **Makefile 使用指南：** [docs/Makefile使用指南.md](docs/Makefile使用指南.md) ⭐ 推荐阅读

### 3️⃣ 一键部署（推荐）

```bash
# 完整部署流程：构建 -> 启动 -> 迁移数据库 -> 加载种子数据
make deploy
```

这个命令会自动完成所有部署步骤，部署完成后会显示访问地址和管理员账号信息。

### 3️⃣ 手动部署（分步骤）

如果需要更细粒度的控制，可以分步执行：

#### a. 启动所有服务

```bash
# 使用 Makefile（推荐）
make up

# 或直接使用 Docker Compose
docker-compose up -d

# 查看服务状态
make ps
# 或
docker-compose ps
```

#### b. 初始化数据库

```bash
# 方式 1: 使用初始化脚本（推荐，首次部署）
make init-db
# 或
docker-compose exec backend python scripts/init_db.py

# 方式 2: 使用 Alembic 迁移（开发环境）
make migrate
# 或
docker-compose exec backend alembic upgrade head
```

**说明**：
- `init_db.py`: 直接从 SQLAlchemy 模型创建所有表，适合首次部署或快速初始化
- `alembic upgrade head`: 应用数据库迁移，适合开发环境和版本升级

#### c. 加载种子数据（可选）

```bash
# 创建管理员用户和初始化系统设置
make seed
# 或
docker-compose exec backend python scripts/seed_data.py
```

**种子数据包括**：
- 管理员用户（用户名、密码从环境变量读取）
- 系统设置默认值
- API 密钥配置模板（TMDB、Google Books、Bangumi）

**默认管理员账户**（可在 `.env` 中配置）：
- 用户名：`admin`（`ADMIN_USERNAME`）
- 密码：`admin123`（`ADMIN_PASSWORD`）
- 邮箱：`admin@example.com`（`ADMIN_EMAIL`）

### 4️⃣ 访问应用

服务启动后，您可以访问：

- **前端应用**: http://localhost:3000
- **后端API**: http://localhost:8000
- **API文档**: http://localhost:8000/docs
- **MinIO控制台**: http://localhost:9001
- **Nginx代理**: http://localhost

## 📦 Docker服务说明

| 服务名 | 端口 | 说明 |
|--------|------|------|
| frontend | 3000 | Next.js前端应用 |
| backend | 8000 | FastAPI后端服务 |
| postgres | 5432 | PostgreSQL数据库 |
| redis | 6379 | Redis缓存（支持LRU驱逐和自定义配置） |
| minio | 9000, 9001 | MinIO对象存储 |
| nginx | 80, 443 | Nginx反向代理 |

## 🛠️ 开发指南

### 前端开发

```bash
# 进入前端目录
cd frontend

# 安装依赖
npm install

# 启动开发服务器
npm run dev

# 类型检查
npm run type-check

# 代码检查
npm run lint

# 构建
npm run build
```

### 后端开发

```bash
# 进入后端目录
cd backend

# 创建虚拟环境
python -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate

# 安装依赖
pip install -r requirements.txt
pip install -r requirements-dev.txt

# 启动开发服务器
uvicorn app.main:app --reload

# 运行测试
pytest

# 代码格式化
black .
isort .

# 类型检查
mypy .
```

### 数据库迁移

```bash
# 创建新的迁移
alembic revision --autogenerate -m "描述"

# 应用迁移
alembic upgrade head

# 回滚迁移
alembic downgrade -1

# 查看迁移历史
alembic history
```

## 🧪 测试

### 后端测试

```bash
# 运行所有测试
docker-compose exec backend pytest

# 运行特定测试文件
docker-compose exec backend pytest tests/test_api.py

# 生成覆盖率报告
docker-compose exec backend pytest --cov=app --cov-report=html
```

### 前端测试

```bash
# 运行单元测试
docker-compose exec frontend npm test

# 运行E2E测试
docker-compose exec frontend npm run test:e2e
```

## 📊 项目结构

```
yueying/
├── backend/                  # FastAPI后端
│   ├── app/
│   │   ├── api/             # API路由
│   │   ├── core/            # 核心配置
│   │   ├── models/          # 数据模型
│   │   ├── schemas/         # Pydantic模型
│   │   ├── services/        # 业务逻辑
│   │   ├── ai/              # AI模块
│   │   └── main.py          # 应用入口
│   ├── tests/               # 测试
│   ├── alembic/             # 数据库迁移
│   ├── Dockerfile
│   └── requirements.txt
├── frontend/                 # Next.js前端
│   ├── app/                 # 页面和路由
│   ├── components/          # React组件
│   ├── lib/                 # 工具函数
│   ├── public/              # 静态资源
│   ├── styles/              # 样式文件
│   ├── Dockerfile
│   └── package.json
├── nginx/                    # Nginx配置
│   ├── nginx.conf
│   └── conf.d/
├── docs/                     # 项目文档
├── docker-compose.yml        # Docker Compose配置
├── .env.example             # 环境变量模板
└── README.md                # 项目说明
```

## 🔧 常用命令

### 使用 Makefile（推荐）

项目提供了便捷的 Makefile 命令，简化日常操作：

```bash
# 查看所有可用命令
make help

# 项目初始化（首次运行）
make init                    # 创建 .env 文件并启动基础服务

# 服务管理
make up                      # 启动所有服务
make down                    # 停止所有服务
make restart                 # 重启所有服务
make ps                      # 查看服务状态
make quick-start             # 快速启动（已初始化项目）

# 日志查看
make logs                    # 查看所有服务日志
make logs-all                # 查看所有服务日志（同 logs）
make logs-backend            # 查看后端日志
make logs-frontend           # 查看前端日志

# 构建相关
make build                   # 重新构建所有镜像
make build-backend           # 重新构建后端镜像
make build-frontend          # 重新构建前端镜像
make full-restart            # 完全重启（清理缓存 + 重新构建）

# 数据库操作
make init-db                 # 初始化数据库（首次部署推荐）
make migrate                 # 运行数据库迁移
make migrate-create          # 创建新的迁移
make seed                    # 加载种子数据
make backup-db               # 备份数据库
make restore-db              # 恢复数据库

# 测试
make test                    # 运行所有测试
make test-backend            # 运行后端测试
make test-frontend           # 运行前端测试

# 容器操作
make shell-backend           # 进入后端容器
make shell-frontend          # 进入前端容器
make shell-db                # 进入数据库容器

# 部署相关
make check-env               # 检查环境变量配置
make validate                # 验证项目配置（Makefile、docker-compose、Docker 环境）
make deploy                  # 完整部署（构建 -> 启动 -> 初始化）
make redeploy                # 重新部署（清理 -> 构建 -> 启动 -> 初始化）

# 清理
make clean                   # 清理所有容器和数据卷（危险操作！）

# 健康检查
make health                  # 检查所有服务健康状态
```

### 直接使用 Docker Compose

```bash
# 启动所有服务
docker-compose up -d

# 停止所有服务
docker-compose down

# 重启特定服务
docker-compose restart backend

# 查看服务日志
docker-compose logs -f backend

# 进入容器
docker-compose exec backend bash

# 重新构建镜像
docker-compose build --no-cache

# 清理所有数据（危险操作！）
docker-compose down -v
```

## 🐛 故障排查

### 服务无法启动

```bash
# 检查所有容器状态
docker-compose ps

# 查看特定服务日志
docker-compose logs backend

# 检查端口占用
netstat -tuln | grep 3000
```

### 数据库连接失败

```bash
# 确保PostgreSQL容器健康
docker-compose ps postgres

# 检查数据库连接
docker-compose exec postgres psql -U yueying -d yueying -c "SELECT 1;"
```

### 热重载不工作

确保在 `docker-compose.yml` 中正确挂载了volume，并且使用 `--reload` 参数启动服务。

## 📝 环境变量说明

### 配置方式

**Docker 环境（推荐）：** 只需配置根目录的 `.env` 文件

**本地开发环境：** 需要分别配置 `backend/.env` 和 `frontend/.env.local`

### 必需的环境变量

- `SECRET_KEY` - 应用密钥（生产环境必须修改）
- `JWT_SECRET_KEY` - JWT 密钥
- `NEXTAUTH_SECRET` - NextAuth 密钥
- `POSTGRES_PASSWORD` - 数据库密码
- `REDIS_PASSWORD` - Redis 密码
- `MINIO_ROOT_PASSWORD` - MinIO 密码

### 可选的环境变量

**第三方 API（探索功能）：**
- `TMDB_API_KEY` - TMDB 电影数据库 API 密钥
- `GOOGLE_BOOKS_API_KEY` - Google Books API 密钥
- `BANGUMI_API_KEY` - Bangumi（番组计划）API 密钥

**LLM API（AI 功能）：**
- `SILICONFLOW_API_KEY` - 硅基流动 API（推荐）
- `DEEPSEEK_API_KEY` - DeepSeek API
- `OPENAI_API_KEY` - OpenAI API
- `ANTHROPIC_API_KEY` - Anthropic Claude API

**系统配置：**
- `REDIS_MAX_MEMORY` - Redis 最大内存限制（默认: 512mb）
- `LOG_LEVEL` - 日志级别（默认: INFO）
- `RATE_LIMIT_PER_MINUTE` - 每分钟请求限制（默认: 60）

📚 **完整配置说明：** [docs/环境变量配置说明.md](docs/环境变量配置说明.md)

## 🔒 安全建议

1. **生产环境部署前**：
   - 修改所有默认密码
   - 使用强密钥（至少32位随机字符）
   - 启用HTTPS（配置SSL证书）
   - 配置防火墙规则

2. **API密钥管理**：
   - 不要将 `.env` 文件提交到版本控制
   - 使用环境变量或密钥管理服务
   - 定期轮换API密钥

3. **数据备份**：
   - 定期备份PostgreSQL数据
   - 备份MinIO对象存储数据
   - 备份配置文件

## 📄 许可证

本项目采用 MIT 许可证。详见 [LICENSE](LICENSE) 文件。

## 🤝 贡献指南

欢迎贡献代码！请阅读 [CONTRIBUTING.md](CONTRIBUTING.md) 了解详细信息。

## 📮 联系方式

- **Issues**: [GitHub Issues](https://github.com/yourusername/yueying/issues)
- **Discussions**: [GitHub Discussions](https://github.com/yourusername/yueying/discussions)

## 🙏 致谢

感谢以下开源项目：

- [Next.js](https://nextjs.org/)
- [FastAPI](https://fastapi.tiangolo.com/)
- [PostgreSQL](https://www.postgresql.org/)
- [Redis](https://redis.io/)
- [MinIO](https://min.io/)
- [shadcn/ui](https://ui.shadcn.com/)

---

<div align="center">
  Made with ❤️ by the YueYing Team
</div>

