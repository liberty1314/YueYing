# 阅影·log - 后端 API

这是阅影·log的后端 API 服务，使用 FastAPI 构建。

## 技术栈

- **框架**: FastAPI
- **语言**: Python 3.11+
- **数据库**: PostgreSQL + SQLAlchemy
- **缓存**: Redis
- **数据迁移**: Alembic
- **认证**: JWT
- **测试**: Pytest

## 开发指南

### 安装依赖

```bash
# 创建虚拟环境
python -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate

# 安装生产依赖
pip install -r requirements.txt

# 安装开发依赖
pip install -r requirements-dev.txt
```

### 配置环境变量

```bash
cp .env.example .env
# 编辑 .env 并填写必要的配置
```

### 运行开发服务器

```bash
# 方式 1: 直接运行
python -m uvicorn app.main:app --reload

# 方式 2: 使用 main.py
python app/main.py

# 方式 3: 使用 Docker
docker-compose up backend
```

API 将在 http://localhost:8000 启动。

### 数据库迁移

```bash
# 初始化 Alembic（仅首次）
alembic init alembic

# 创建迁移
alembic revision --autogenerate -m "描述"

# 应用迁移
alembic upgrade head

# 回滚迁移
alembic downgrade -1

# 查看历史
alembic history
```

### 运行测试

```bash
# 运行所有测试
pytest

# 运行特定测试
pytest tests/test_main.py

# 生成覆盖率报告
pytest --cov=app --cov-report=html

# 运行单元测试
pytest -m unit

# 运行集成测试
pytest -m integration
```

### 代码质量

```bash
# 类型检查
mypy app

# 代码检查
flake8 app
pylint app

# 代码格式化
black app
isort app
```

## 项目结构

```
backend/
├── app/
│   ├── main.py              # FastAPI 应用入口
│   ├── core/                # 核心配置
│   │   ├── config.py        # 配置管理
│   │   ├── database.py      # 数据库连接
│   │   ├── redis.py         # Redis 连接
│   │   ├── security.py      # 安全功能（JWT等）
│   │   └── logging.py       # 日志配置
│   ├── api/                 # API 路由
│   ├── models/              # SQLAlchemy 模型
│   ├── schemas/             # Pydantic 模型
│   ├── services/            # 业务逻辑
│   ├── utils/               # 工具函数
│   ├── middleware/          # 中间件
│   ├── integrations/        # 第三方集成
│   └── ai/                  # AI 模块
├── tests/                   # 测试
├── alembic/                 # 数据库迁移
├── scripts/                 # 脚本
├── requirements.txt         # 生产依赖
├── requirements-dev.txt     # 开发依赖
├── pytest.ini               # Pytest 配置
└── alembic.ini              # Alembic 配置
```

## API 文档

启动服务器后，访问以下地址查看 API 文档：

- **Swagger UI**: http://localhost:8000/docs
- **ReDoc**: http://localhost:8000/redoc
- **OpenAPI JSON**: http://localhost:8000/openapi.json

## 环境变量

查看 `.env.example` 了解所有可用的环境变量。

### 必需的环境变量

- `SECRET_KEY` - 应用密钥
- `JWT_SECRET_KEY` - JWT 密钥
- `DATABASE_URL` - 数据库连接字符串
- `REDIS_URL` - Redis 连接字符串

## Docker 部署

```bash
# 构建镜像
docker build -t yueying-backend .

# 运行容器
docker run -p 8000:8000 --env-file .env yueying-backend

# 使用 docker-compose
cd ..
docker-compose up backend
```

## 开发规范

1. **代码风格**: 遵循 PEP 8
2. **类型提示**: 使用 type hints
3. **文档字符串**: 使用 Google 风格
4. **测试覆盖率**: 目标 >80%
5. **提交信息**: 使用语义化提交

## 相关文档

- [FastAPI 文档](https://fastapi.tiangolo.com/)
- [SQLAlchemy 文档](https://docs.sqlalchemy.org/)
- [Alembic 文档](https://alembic.sqlalchemy.org/)
- [Pytest 文档](https://docs.pytest.org/)


