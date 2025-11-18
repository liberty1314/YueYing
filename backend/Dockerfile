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
    pip install -r requirements-dev.txt

# 复制应用代码
COPY . .

# 预下载 embedding 模型（可选，如果下载失败也不会影响镜像构建）
RUN python -c "from sentence_transformers import SentenceTransformer; \
    try: \
        print('Downloading embedding model...'); \
        SentenceTransformer('sentence-transformers/paraphrase-multilingual-MiniLM-L12-v2'); \
        print('Model downloaded successfully'); \
    except Exception as e: \
        print(f'Model download failed (will retry at runtime): {e}')" || true

# 设置启动脚本权限
RUN chmod +x scripts/entrypoint.sh

# 暴露端口
EXPOSE 8000

# 使用启动脚本
ENTRYPOINT ["scripts/entrypoint.sh"]

# 开发环境启动命令（支持热重载）
CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000", "--reload"]

# ====================================
# Stage 3: 生产环境构建
# ====================================
FROM base as builder

# 复制依赖文件
COPY requirements.txt ./

# 安装生产依赖（使用缓存挂载优化）
RUN --mount=type=cache,target=/root/.cache/pip \
    pip install --upgrade pip && \
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
    PATH=/home/appuser/.local/bin:$PATH \
    PYTHONPATH=/app

# 创建非root用户（先创建，以便后续使用正确的权限）
RUN useradd -m -u 1000 appuser

# 安装运行时依赖（最小化安装）
RUN apt-get update && apt-get install -y --no-install-recommends \
    libpq5 \
    curl \
    && rm -rf /var/lib/apt/lists/* \
    && apt-get clean

# 从builder阶段复制Python包（使用正确的用户路径）
COPY --from=builder --chown=appuser:appuser /root/.local /home/appuser/.local

# 复制应用代码
COPY --chown=appuser:appuser . .

# 创建必要的目录
RUN mkdir -p /app/data/chromadb /app/logs && \
    chown -R appuser:appuser /app/data /app/logs

# 设置启动脚本权限
RUN chmod +x scripts/entrypoint.sh

# 切换到非root用户
USER appuser

# 暴露端口
EXPOSE 8000

# 健康检查
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
    CMD curl -f http://localhost:8000/health || exit 1

# 使用启动脚本
ENTRYPOINT ["scripts/entrypoint.sh"]

# 生产环境启动命令（使用多进程）
CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000", "--workers", "4"]

