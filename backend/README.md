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

> **📖 详细配置说明**：
> - Docker 环境：使用根目录的 `.env` 文件（推荐）
> - 本地开发：配置 `backend/.env` 文件
> - 完整文档：[环境变量配置说明](../docs/环境变量配置说明.md)

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

### 数据库初始化与迁移

#### 初始化数据库

```bash
# 方式 1: 使用初始化脚本（推荐，首次部署）
python scripts/init_db.py

# 方式 2: 使用 Alembic 迁移
alembic upgrade head
```

**`init_db.py` 脚本功能**：
- 直接从 SQLAlchemy 模型创建所有表
- 自动测试数据库连接
- 显示创建的表列表
- 适合首次部署或快速初始化

#### 加载种子数据

```bash
# 创建管理员用户和初始化系统设置
python scripts/seed_data.py

# 或使用 Docker
docker-compose exec backend python scripts/seed_data.py

# 或使用 Makefile
make seed
```

**`seed_data.py` 脚本功能**：
- 创建管理员用户（如果不存在）
  - 用户名、密码、邮箱从环境变量读取
  - 默认值：`admin` / `admin123` / `admin@example.com`
- 初始化系统设置
  - 探索功能开关（`DEFAULT_ENABLE_EXPLORE`）
  - 用户 AI 标签设置权限（`DEFAULT_ALLOW_USER_AI_TAG_SETTINGS`）
- 创建 API 密钥配置模板
  - TMDB、Google Books、Bangumi
  - 初始状态为未测试，需要在管理后台填写密钥

**环境变量配置**：
```bash
# .env 文件
ADMIN_USERNAME=admin
ADMIN_PASSWORD=admin123
ADMIN_EMAIL=admin@example.com
DEFAULT_ENABLE_EXPLORE=false
DEFAULT_ALLOW_USER_AI_TAG_SETTINGS=true
```

#### Alembic 迁移管理

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

#### 缓存系统测试

项目包含完整的缓存系统测试套件（123+ 个测试，覆盖率 95%+）：

```bash
# 运行所有缓存测试（推荐）
./scripts/run_all_cache_tests.sh

# 或使用 Python 脚本
python scripts/run_cache_tests.py

# 只运行单元测试
./scripts/run_all_cache_tests.sh --unit

# 只运行集成测试
./scripts/run_all_cache_tests.sh --integration

# 只运行性能测试
./scripts/run_all_cache_tests.sh --performance

# 生成覆盖率报告
./scripts/run_all_cache_tests.sh --coverage
```

**测试覆盖**:
- ✅ 缓存统计测试 (17个测试，100%覆盖率)
- ✅ 内存缓存测试 (28个测试，100%覆盖率)
- ✅ 多级缓存测试 (21个测试，100%覆盖率)
- ✅ 缓存配置测试 (26个测试，100%覆盖率)
- ✅ 缓存预热测试 (13个测试，85%覆盖率)
- ✅ 端到端集成测试 (15+个测试)
- ✅ 性能测试 (15+个测试)

**详细文档**: [缓存测试指南](docs/CACHE_TESTING_GUIDE.md)

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

### 使用 Makefile（推荐）

项目根目录提供了便捷的 Makefile 命令：

```bash
# 验证项目配置
make validate

# 完整部署（构建 -> 启动 -> 迁移 -> 种子数据）
make deploy

# 快速启动（已初始化项目）
make quick-start

# 重新构建后端镜像
make build-backend

# 完全重启（清理缓存 + 重新构建）
make full-restart

# 查看后端日志
make logs-backend

# 进入后端容器
make shell-backend
```

📖 **详细命令说明**：[Makefile 使用指南](../docs/Makefile使用指南.md)

### 手动 Docker 操作

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

## 缓存系统

项目实现了双层缓存架构：

- **L1 缓存（内存 LRU）**: 进程内高速缓存，访问延迟 < 1ms
- **L2 缓存（Redis）**: 分布式缓存，支持多实例共享

### 缓存模块架构

缓存模块已完成模块化重构（2025-11-15），从单一的 1385 行文件拆分为多个职责明确的模块：

```
backend/app/core/cache/
├── __init__.py              # 统一导出接口
├── key_generator.py         # 缓存键生成器
├── manager.py               # 缓存管理器（同步/异步）
├── decorators.py            # 缓存装饰器
└── multi_level.py           # 多级缓存管理器
```

**使用示例：**

```python
from app.core.cache import cached, multi_level_cached

# 简单缓存
@cached(prefix="user", expire=3600)
def get_user(user_id: int):
    return fetch_user_from_db(user_id)

# 多级缓存（热数据）
@multi_level_cached(prefix="data", l1_ttl=300, l2_ttl=3600)
def get_hot_data(id: int):
    return fetch_hot_data(id)
```

**详细文档：** [缓存模块重构文档](docs/cache-refactoring.md)

### 缓存管理 API

系统提供了完整的缓存管理接口（需要管理员权限）：

**缓存统计**：
- `GET /api/admin/cache/stats` - 获取 L1 和 L2 缓存统计（命中率、延迟、内存使用等）
- `GET /api/admin/cache/stats/top-keys` - 获取访问频率最高的缓存键
- `GET /api/admin/cache/info` - 获取缓存系统概览信息

**缓存配置**：
- `GET /api/admin/cache/config` - 获取当前缓存配置
- `PUT /api/admin/cache/config` - 更新缓存配置（TTL、预热设置等）

**缓存操作**：
- `DELETE /api/admin/cache/clear` - 清理缓存（支持模式匹配和分层清理）

**测试脚本**：

项目提供了便捷的测试脚本 `scripts/test_cache_api.sh` 用于测试缓存管理 API：

```bash
# 1. 登录获取 token
./scripts/test_cache_api.sh login

# 2. 设置 token
export TOKEN="your_token_here"

# 3. 获取缓存统计
./scripts/test_cache_api.sh stats

# 4. 获取热门键
./scripts/test_cache_api.sh top-keys 20

# 5. 获取缓存配置
./scripts/test_cache_api.sh config

# 6. 清理特定模式的缓存
./scripts/test_cache_api.sh clear-pattern "tmdb:*"

# 7. 查看所有可用命令
./scripts/test_cache_api.sh help
```

### 缓存预热

系统提供了缓存预热功能，可以在应用启动或定期执行时预加载热点数据：

**预热策略**：
- `user_items`: 预热活跃用户的内容记录
- `popular_content`: 预热热门内容

**预热时机**：
- **启动时预热**: 应用启动时自动执行（可通过 `CACHE_WARMING_ON_STARTUP` 环境变量控制）
- **定时预热**: 每小时自动执行一次（由 APScheduler 调度）
- **手动预热**: 管理员可通过 API 端点随时触发

**预热管理接口**（需要管理员权限）：
- `POST /api/admin/cache-warming/warm` - 手动触发预热
- `GET /api/admin/cache-warming/status` - 获取预热状态
- `GET /api/admin/cache-warming/history` - 获取预热历史
- `GET /api/admin/cache-warming/strategies` - 获取所有预热策略

**环境变量配置**：
- `CACHE_WARMING_ENABLED`: 是否启用缓存预热（默认: true）
- `CACHE_WARMING_ON_STARTUP`: 是否在启动时预热（默认: true）
- `CACHE_WARMING_BATCH_SIZE`: 预热批次大小（默认: 100）

### 多级缓存迁移

✅ **所有核心服务已完成多级缓存迁移** (2025-11-15)

**已迁移服务**：

1. **外部 API 服务**：
   - ✅ TMDB API（电影、剧集搜索和详情）
   - ✅ Google Books API（书籍搜索和详情）
   - ✅ Bangumi API（动漫、游戏搜索和详情）
   - 配置：详情 L1=5分钟/L2=24小时，搜索 L1=5分钟/L2=1小时

2. **用户数据服务**：
   - ✅ 用户项目缓存服务（L1=5分钟/L2=30分钟）
   - ✅ 首页数据缓存服务（L1=5分钟/L2=1小时）
   - 支持自动缓存失效和预热

3. **统计服务**：
   - ✅ 概览统计、类型分布、状态分布
   - ✅ 评分分布、热门标签、年代分布
   - 配置：L1=5分钟/L2=1小时

**性能提升**：
- L1 命中响应: < 1ms（内存访问）
- L2 命中响应: < 10ms（Redis 访问）
- 预期总命中率: 75-95%
- API 调用减少: 80-95%

**测试验证**：
```bash
# 运行多级缓存集成测试
python scripts/test_multi_level_cache_services.py
```

**详细文档**：
- [缓存优化文档](docs/CACHE_OPTIMIZATION.md) - 双层缓存架构、使用指南和最佳实践
- [多级缓存迁移报告](docs/MULTI_LEVEL_CACHE_MIGRATION.md) - 迁移详情和配置说明
- [任务 10 完成总结](docs/TASK_10_COMPLETION_SUMMARY.md) - 详细的迁移说明和配置

## 定时任务

系统使用 APScheduler 管理定时任务，在应用启动时自动启动调度器。

### 已配置的定时任务

1. **首页数据刷新** (`refresh_home_data`)
   - 执行时间：每天凌晨 1:00（可通过 `HOME_DATA_REFRESH_TIME` 环境变量配置）
   - 功能：刷新首页展示的热门内容和推荐数据
   - 缓存时间：由 `HOME_DATA_CACHE_EXPIRE` 环境变量控制

2. **缓存预热** (`cache_warming`)
   - 执行时间：每小时执行一次
   - 功能：预加载热点数据到缓存，提升访问性能
   - 配置：通过 `CACHE_WARMING_ENABLED` 环境变量控制是否启用

### 任务管理

调度器提供了以下管理方法（可通过代码调用）：

```python
from app.core.scheduler import task_scheduler

# 获取所有任务
jobs = task_scheduler.get_jobs()

# 暂停任务
task_scheduler.pause_job("cache_warming")

# 恢复任务
task_scheduler.resume_job("cache_warming")

# 立即执行任务
await task_scheduler.run_job_now("cache_warming")
```

## 相关文档

### 项目文档

**API 文档**：
- [API 认证文档](docs/api-authentication.md) - JWT 认证、端点权限和安全最佳实践 ⭐
- [API 变更日志](docs/API_CHANGELOG.md) - API 重要变更记录

**代码重构**：
- [UserItemService 重构文档](docs/user-item-service-refactoring.md) - 服务拆分进度和使用指南
- [User Items 路由重构文档](docs/user-items-route-refactoring.md) - 路由模块化重构说明 ✅ 已完成

**开发工具**：
- [工具函数库文档](docs/utils-library.md) - 数据验证、转换和错误处理工具 ⭐

**缓存系统**：
- [缓存快速参考](docs/CACHE_QUICK_REFERENCE.md) - 常用命令和配置速查 ⭐
- [缓存优化文档](docs/CACHE_OPTIMIZATION.md) - 双层缓存架构、使用指南和最佳实践
- [多级缓存实现](docs/MULTI_LEVEL_CACHE_IMPLEMENTATION.md) - 技术实现细节
- [多级缓存迁移报告](docs/MULTI_LEVEL_CACHE_MIGRATION.md) - 服务迁移详情
- [缓存迁移总结](docs/CACHE_MIGRATION_SUMMARY.md) - 迁移状态一览
- [缓存管理 API](docs/CACHE_MANAGEMENT_API.md) - 管理接口文档
- [Redis 配置文档](docs/REDIS_CONFIGURATION.md) - Redis 配置、监控和故障排查

**缓存失效管理**：系统提供 `CacheInvalidator` 类用于管理缓存失效
```python
from app.core.cache.invalidation import cache_invalidator

# 失效单个缓存
cache_invalidator.invalidate_by_key("user:123:profile")

# 按模式批量失效
cache_invalidator.invalidate_by_pattern("user:123:*")

# 失效用户所有缓存
cache_invalidator.invalidate_user_cache(123)
```

**性能优化**：
- [数据库优化报告](docs/DATABASE_OPTIMIZATION_REPORT.md) - 数据库性能优化记录
- [性能测试结果](docs/PERFORMANCE_TEST_RESULTS.md) - 性能测试基准和结果

### 外部文档
- [FastAPI 文档](https://fastapi.tiangolo.com/)
- [SQLAlchemy 文档](https://docs.sqlalchemy.org/)
- [Alembic 文档](https://alembic.sqlalchemy.org/)
- [Pytest 文档](https://docs.pytest.org/)


