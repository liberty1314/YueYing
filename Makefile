# ====================================
# 阅影·log（YueYing）Makefile
# ====================================

.PHONY: help up down restart logs logs-all build clean test init

# 默认目标
.DEFAULT_GOAL := help

# 颜色定义
BLUE := \033[0;34m
GREEN := \033[0;32m
YELLOW := \033[0;33m
NC := \033[0m # No Color

## help: 显示帮助信息
help:
	@echo "${BLUE}阅影·log（YueYing）- 可用命令:${NC}"
	@echo ""
	@grep -E '^## [a-zA-Z_-]+:.*$$' $(MAKEFILE_LIST) | \
		awk 'BEGIN {FS = "## |:"}; {printf "${GREEN}%-20s${NC} %s\n", $$2, $$3}'

## up: 启动所有服务
up:
	@echo "${BLUE}启动所有服务...${NC}"
	docker-compose up -d
	@echo "${GREEN}✓ 服务已启动${NC}"
	@echo "${YELLOW}前端: http://localhost:3000${NC}"
	@echo "${YELLOW}后端: http://localhost:8000${NC}"
	@echo "${YELLOW}API文档: http://localhost:8000/docs${NC}"

## down: 停止所有服务
down:
	@echo "${BLUE}停止所有服务...${NC}"
	docker-compose down
	@echo "${GREEN}✓ 服务已停止${NC}"

## restart: 重启所有服务
restart:
	@echo "${BLUE}重启所有服务...${NC}"
	docker-compose restart
	@echo "${GREEN}✓ 服务已重启${NC}"

## logs: 查看所有服务日志
logs:
	docker-compose logs -f

## logs-backend: 查看后端日志
logs-backend:
	docker-compose logs -f backend

## logs-frontend: 查看前端日志
logs-frontend:
	docker-compose logs -f frontend

## logs-all: 查看所有服务日志（同 logs）
logs-all: logs

## build: 重新构建所有镜像
build:
	@echo "${BLUE}重新构建镜像...${NC}"
	docker-compose build --no-cache
	@echo "${GREEN}✓ 镜像构建完成${NC}"

## build-backend: 重新构建后端镜像
build-backend:
	@echo "${BLUE}重新构建后端镜像...${NC}"
	docker-compose build --no-cache backend
	@echo "${GREEN}✓ 后端镜像构建完成${NC}"

## build-frontend: 重新构建前端镜像
build-frontend:
	@echo "${BLUE}重新构建前端镜像...${NC}"
	docker-compose build --no-cache frontend
	@echo "${GREEN}✓ 前端镜像构建完成${NC}"

## ps: 查看服务状态
ps:
	docker-compose ps

## init: 初始化项目（首次运行）
init:
	@echo "${BLUE}初始化项目...${NC}"
	@if [ ! -f .env ]; then \
		cp .env.example .env; \
		echo "${GREEN}✓ 创建根目录 .env 文件${NC}"; \
		echo "${YELLOW}⚠ 请编辑 .env 文件并填写必要的配置（API Keys 等）${NC}"; \
	else \
		echo "${YELLOW}根目录 .env 文件已存在，跳过${NC}"; \
	fi
	@echo ""
	@echo "${BLUE}配置说明：${NC}"
	@echo "  - Docker 环境（推荐）：只需配置根目录的 .env 文件"
	@echo "  - 本地开发环境：需要额外配置 backend/.env 和 frontend/.env.local"
	@echo "  - 详细说明请查看：docs/环境变量配置说明.md"
	@echo ""
	@echo "${BLUE}启动基础服务...${NC}"
	docker-compose up -d postgres redis minio
	@echo "${BLUE}等待服务就绪...${NC}"
	@echo "  检查 PostgreSQL..."
	@for i in 1 2 3 4 5 6 7 8 9 10; do \
		if docker-compose exec -T postgres pg_isready -U yueying > /dev/null 2>&1; then \
			echo "${GREEN}  ✓ PostgreSQL 已就绪${NC}"; \
			break; \
		fi; \
		if [ $$i -eq 10 ]; then \
			echo "${YELLOW}  ⚠ PostgreSQL 启动超时，但继续执行${NC}"; \
		else \
			sleep 2; \
		fi; \
	done
	@echo "  检查 Redis..."
	@for i in 1 2 3 4 5; do \
		if docker-compose exec -T redis redis-cli ping > /dev/null 2>&1; then \
			echo "${GREEN}  ✓ Redis 已就绪${NC}"; \
			break; \
		fi; \
		if [ $$i -eq 5 ]; then \
			echo "${YELLOW}  ⚠ Redis 启动超时，但继续执行${NC}"; \
		else \
			sleep 1; \
		fi; \
	done
	@echo "  检查 MinIO..."
	@for i in 1 2 3 4 5; do \
		if docker-compose exec -T minio mc ready local > /dev/null 2>&1; then \
			echo "${GREEN}  ✓ MinIO 已就绪${NC}"; \
			break; \
		fi; \
		if [ $$i -eq 5 ]; then \
			echo "${YELLOW}  ⚠ MinIO 启动超时，但继续执行${NC}"; \
		else \
			sleep 1; \
		fi; \
	done
	@echo "${GREEN}✓ 项目初始化完成${NC}"
	@echo ""
	@echo "${BLUE}下一步：${NC}"
	@echo "  1. 编辑 .env 文件，填写必要的配置"
	@echo "  2. 运行 'make up' 启动所有服务"
	@echo "  3. 运行 'make migrate' 初始化数据库"

## migrate: 运行数据库迁移
migrate:
	@echo "${BLUE}运行数据库迁移...${NC}"
	docker-compose exec backend alembic upgrade head
	@echo "${GREEN}✓ 数据库迁移完成${NC}"

## migrate-create: 创建新的数据库迁移
migrate-create:
	@read -p "迁移描述: " desc; \
	docker-compose exec backend alembic revision --autogenerate -m "$$desc"

## seed: 加载种子数据
seed:
	@echo "${BLUE}加载种子数据...${NC}"
	docker-compose exec backend python scripts/seed_data.py
	@echo "${GREEN}✓ 种子数据加载完成${NC}"

## reset-db: 重置数据库（危险操作！会删除所有数据）
reset-db:
	@echo "${YELLOW}⚠ 警告: 这将删除所有数据库数据！${NC}"
	@read -p "确定继续? 输入 'YES' 确认: " confirm; \
	if [ "$$confirm" = "YES" ]; then \
		echo "${BLUE}重置数据库...${NC}"; \
		docker-compose exec -e AUTO_CONFIRM_RESET=true backend python scripts/reset_db.py; \
		echo "${GREEN}✓ 数据库重置完成${NC}"; \
		echo "${BLUE}运行迁移...${NC}"; \
		docker-compose exec backend alembic upgrade head; \
		echo "${GREEN}✓ 迁移完成${NC}"; \
		echo "${BLUE}加载种子数据...${NC}"; \
		docker-compose exec backend python scripts/seed_data.py; \
		echo "${GREEN}✓ 种子数据加载完成${NC}"; \
	else \
		echo "${YELLOW}已取消${NC}"; \
	fi

## test: 运行测试
test:
	@echo "${BLUE}运行后端测试...${NC}"
	docker-compose exec backend pytest
	@echo "${BLUE}运行前端测试...${NC}"
	docker-compose exec frontend npm test

## test-backend: 运行后端测试
test-backend:
	docker-compose exec backend pytest -v

## test-frontend: 运行前端测试
test-frontend:
	docker-compose exec frontend npm test

## shell-backend: 进入后端容器
shell-backend:
	docker-compose exec backend bash

## shell-frontend: 进入前端容器
shell-frontend:
	docker-compose exec frontend sh

## shell-db: 进入数据库容器
shell-db:
	docker-compose exec postgres psql -U yueying -d yueying

## clean: 清理所有容器和数据卷（危险操作！）
clean:
	@echo "${YELLOW}⚠ 警告: 这将删除所有容器和数据卷！${NC}"
	@read -p "确定继续? [y/N] " confirm; \
	if [ "$$confirm" = "y" ] || [ "$$confirm" = "Y" ]; then \
		echo "${BLUE}清理中...${NC}"; \
		docker-compose down -v; \
		docker system prune -a --volumes --force; \
		echo "${GREEN}✓ 清理完成${NC}"; \
	else \
		echo "${YELLOW}已取消${NC}"; \
	fi

## backup-db: 备份数据库
backup-db:
	@echo "${BLUE}备份数据库...${NC}"
	@mkdir -p backups
	docker-compose exec -T postgres pg_dump -U yueying yueying > backups/yueying_$$(date +%Y%m%d_%H%M%S).sql
	@echo "${GREEN}✓ 数据库备份完成${NC}"

## restore-db: 恢复数据库
restore-db:
	@echo "${BLUE}可用的备份文件:${NC}"
	@ls -1 backups/*.sql 2>/dev/null || echo "${YELLOW}没有找到备份文件${NC}"
	@read -p "输入备份文件路径: " backup; \
	if [ -f "$$backup" ]; then \
		docker-compose exec -T postgres psql -U yueying yueying < "$$backup"; \
		echo "${GREEN}✓ 数据库恢复完成${NC}"; \
	else \
		echo "${YELLOW}备份文件不存在${NC}"; \
	fi

## health: 检查所有服务健康状态
health:
	@echo "${BLUE}检查服务健康状态...${NC}"
	@docker-compose ps

## check-env: 检查环境变量配置
check-env:
	@echo "${BLUE}检查环境变量配置...${NC}"
	@if [ ! -f .env ]; then \
		echo "${YELLOW}✗ .env 文件不存在${NC}"; \
		echo "  运行 'make init' 创建配置文件"; \
		exit 1; \
	fi
	@echo "${GREEN}✓ .env 文件存在${NC}"
	@if grep -q "your-tmdb-api-key" .env; then \
		echo "${YELLOW}⚠ TMDB API Key 未配置（使用占位符）${NC}"; \
	fi
	@if grep -q "your-siliconflow-api-key" .env; then \
		echo "${YELLOW}⚠ SiliconFlow API Key 未配置${NC}"; \
	fi

## validate: 验证项目配置（Makefile 语法、docker-compose 配置等）
validate:
	@echo "${BLUE}验证项目配置...${NC}"
	@echo "  检查 Makefile 语法..."
	@if make -n help > /dev/null 2>&1; then \
		echo "${GREEN}  ✓ Makefile 语法正确${NC}"; \
	else \
		echo "${YELLOW}  ✗ Makefile 语法错误${NC}"; \
		exit 1; \
	fi
	@echo "  检查 docker-compose.yml 配置..."
	@if docker-compose config > /dev/null 2>&1; then \
		echo "${GREEN}  ✓ docker-compose.yml 配置正确${NC}"; \
	else \
		echo "${YELLOW}  ✗ docker-compose.yml 配置错误${NC}"; \
		exit 1; \
	fi
	@echo "  检查 .env 文件..."
	@if [ -f .env ]; then \
		echo "${GREEN}  ✓ .env 文件存在${NC}"; \
	else \
		echo "${YELLOW}  ⚠ .env 文件不存在（运行 'make init' 创建）${NC}"; \
	fi
	@echo "  检查 Docker 环境..."
	@if docker info > /dev/null 2>&1; then \
		echo "${GREEN}  ✓ Docker 运行正常${NC}"; \
	else \
		echo "${YELLOW}  ✗ Docker 未运行或无权限${NC}"; \
		exit 1; \
	fi
	@echo "${GREEN}✓ 所有配置验证通过${NC}"

## deploy: 完整部署流程（构建 -> 启动 -> 迁移 -> 种子数据）
deploy: build up migrate seed
	@echo "${GREEN}✓ 部署完成${NC}"
	@echo ""
	@echo "${BLUE}访问地址：${NC}"
	@echo "${YELLOW}  前端: http://localhost:3000${NC}"
	@echo "${YELLOW}  后端: http://localhost:8000${NC}"
	@echo "${YELLOW}  API文档: http://localhost:8000/docs${NC}"
	@echo ""
	@echo "${BLUE}管理员账号：${NC}"
	@echo "${YELLOW}  用户名: admin${NC}"
	@echo "${YELLOW}  密码: admin123${NC}"

## redeploy: 重新部署（清理 -> 构建 -> 启动 -> 初始化）
redeploy:
	@echo "${YELLOW}⚠ 这将删除所有数据并重新部署！${NC}"
	@read -p "确定继续? [y/N] " confirm; \
	if [ "$$confirm" = "y" ] || [ "$$confirm" = "Y" ]; then \
		$(MAKE) clean && \
		$(MAKE) deploy; \
	else \
		echo "${YELLOW}已取消${NC}"; \
	fi

## quick-start: 快速启动（适用于已初始化的项目）
quick-start: up
	@echo "${GREEN}✓ 服务已启动${NC}"
	@echo "${YELLOW}前端: http://localhost:3000${NC}"
	@echo "${YELLOW}后端: http://localhost:8000${NC}"

## full-restart: 完全重启（停止 -> 重新构建应用服务 -> 启动）
full-restart:
	@echo "${BLUE}执行完全重启...${NC}"
	docker-compose down
	docker-compose build --no-cache backend frontend
	docker-compose up -d
	@echo "${GREEN}✓ 完全重启完成${NC}"
	@echo "${YELLOW}注意: 仅重建了 backend 和 frontend 服务${NC}"
