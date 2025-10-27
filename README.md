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
- **缓存**: Redis 7
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
# 复制环境变量模板
cp .env.example .env

# 编辑 .env 文件，填写必要的配置
# 至少需要配置：
# - SECRET_KEY
# - NEXTAUTH_SECRET
# - 第三方API密钥（TMDB、Google Books等）
# - LLM API密钥（DeepSeek/OpenAI/Claude）
```

### 3️⃣ 启动所有服务

```bash
# 构建并启动所有容器
docker-compose up -d

# 查看服务状态
docker-compose ps

# 查看日志
docker-compose logs -f
```

### 4️⃣ 访问应用

服务启动后，您可以访问：

- **前端应用**: http://localhost:3000
- **后端API**: http://localhost:8000
- **API文档**: http://localhost:8000/docs
- **MinIO控制台**: http://localhost:9001
- **Nginx代理**: http://localhost

### 5️⃣ 初始化数据库

```bash
# 进入后端容器
docker-compose exec backend bash

# 运行数据库迁移
alembic upgrade head

# （可选）加载种子数据
python scripts/seed_data.py
```

## 📦 Docker服务说明

| 服务名 | 端口 | 说明 |
|--------|------|------|
| frontend | 3000 | Next.js前端应用 |
| backend | 8000 | FastAPI后端服务 |
| postgres | 5432 | PostgreSQL数据库 |
| redis | 6379 | Redis缓存 |
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

详细的环境变量配置请参考 `.env.example` 文件。

### 必需的环境变量

- `SECRET_KEY` - 应用密钥（生产环境必须修改）
- `NEXTAUTH_SECRET` - NextAuth密钥
- `POSTGRES_PASSWORD` - 数据库密码
- `REDIS_PASSWORD` - Redis密码

### API密钥

- `TMDB_API_KEY` - TMDB电影数据库API密钥
- `GOOGLE_BOOKS_API_KEY` - Google Books API密钥
- `DEEPSEEK_API_KEY` / `OPENAI_API_KEY` / `ANTHROPIC_API_KEY` - LLM API密钥

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

