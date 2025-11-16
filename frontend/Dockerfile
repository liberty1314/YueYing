# ====================================
# Stage 1: 依赖安装
# ====================================
FROM node:20-alpine AS deps

# 安装 pnpm
RUN corepack enable && corepack prepare pnpm@latest --activate

# 设置工作目录
WORKDIR /app

# 复制package文件
COPY package.json pnpm-lock.yaml* ./

# 安装依赖
RUN pnpm install --frozen-lockfile

# ====================================
# Stage 2: 开发环境
# ====================================
FROM node:20-alpine AS development

# 设置工作目录
WORKDIR /app

# 复制依赖
COPY --from=deps /app/node_modules ./node_modules

# 复制应用代码
COPY . .

# 暴露端口
EXPOSE 3000

# 设置环境变量
ENV PORT=3000 \
    NODE_ENV=development

# 安装 pnpm
RUN corepack enable && corepack prepare pnpm@latest --activate

# 开发环境启动命令（支持热重载）
CMD ["pnpm", "run", "dev"]

# ====================================
# Stage 3: 构建器
# ====================================
FROM node:20-alpine AS builder

# 设置工作目录
WORKDIR /app

# 安装 pnpm
RUN corepack enable && corepack prepare pnpm@latest --activate

# 复制依赖
COPY --from=deps /app/node_modules ./node_modules

# 复制应用代码
COPY . .

# 设置环境变量（构建时）
ENV NEXT_TELEMETRY_DISABLED=1 \
    NODE_ENV=production

# 构建应用
RUN pnpm run build

# ====================================
# Stage 4: 生产环境
# ====================================
FROM node:20-alpine AS production

# 设置工作目录
WORKDIR /app

# 设置环境变量
ENV NODE_ENV=production \
    NEXT_TELEMETRY_DISABLED=1 \
    PORT=3000 \
    HOSTNAME="0.0.0.0"

# 创建非root用户
RUN addgroup --system --gid 1001 nodejs && \
    adduser --system --uid 1001 nextjs

# 复制public文件夹（如果存在）
COPY --from=builder --chown=nextjs:nodejs /app/public ./public

# 复制构建输出（standalone 模式）
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

# 切换到非root用户
USER nextjs

# 暴露端口
EXPOSE 3000

# 健康检查
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
    CMD node -e "require('http').get('http://localhost:3000/api/health', (r) => {process.exit(r.statusCode === 200 ? 0 : 1)})"

# 生产环境启动命令
CMD ["node", "server.js"]

