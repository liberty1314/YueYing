# ====================================
# Stage 1: 基础镜像
# ====================================
FROM python:3.11-slim as base

# 设置工作目录
WORKDIR /app

# 设置环境变量
ENV PYTHONUNBUFFERED=1 \
    PYTHONDONTWRITEBYTECODE=1 \
    PIP_NO_CACHE_DIR=1 \
    PIP_DISABLE_PIP_VERSION_CHECK=1

# 安装系统依赖
RUN apt-get update && apt-get install -y --no-install-recommends \
    build-essential \
    curl \
    libpq-dev \
    && rm -rf /var/lib/apt/lists/*

# ====================================
# Stage 2: 开发环境
# ====================================
FROM base as development

# 复制依赖文件
COPY requirements.txt requirements-dev.txt ./

# 安装Python依赖（包括开发依赖）
RUN pip install --upgrade pip && \
    pip install -r requirements.txt && \
    pip install -r requirements-dev.txt

# 复制应用代码
COPY . .

# 暴露端口
EXPOSE 8000

# 开发环境启动命令（支持热重载）
CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000", "--reload"]

# ====================================
# Stage 3: 生产环境构建
# ====================================
FROM base as builder

# 复制依赖文件
COPY requirements.txt ./

# 安装生产依赖
RUN pip install --upgrade pip && \
    pip install --user --no-warn-script-location -r requirements.txt

# ====================================
# Stage 4: 生产环境
# ====================================
FROM python:3.11-slim as production

# 设置工作目录
WORKDIR /app

# 设置环境变量
ENV PYTHONUNBUFFERED=1 \
    PYTHONDONTWRITEBYTECODE=1 \
    PATH=/root/.local/bin:$PATH

# 安装运行时依赖
RUN apt-get update && apt-get install -y --no-install-recommends \
    libpq5 \
    curl \
    && rm -rf /var/lib/apt/lists/*

# 从builder阶段复制Python包
COPY --from=builder /root/.local /root/.local

# 复制应用代码
COPY . .

# 创建非root用户
RUN useradd -m -u 1000 appuser && \
    chown -R appuser:appuser /app

USER appuser

# 暴露端口
EXPOSE 8000

# 健康检查
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
    CMD curl -f http://localhost:8000/health || exit 1

# 生产环境启动命令
CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000", "--workers", "4"]

