# ====================================
# Stage 1: Dependencies
# ====================================
FROM node:20-alpine AS deps

# 启用 corepack 并安装 pnpm
RUN corepack enable && corepack prepare pnpm@latest --activate

WORKDIR /app

# 复制依赖文件
COPY package.json pnpm-lock.yaml* ./

# 安装依赖
RUN pnpm install --frozen-lockfile

# ====================================
# Stage 2: Development
# ====================================
FROM node:20-alpine AS development

WORKDIR /app

# 启用 pnpm
RUN corepack enable && corepack prepare pnpm@latest --activate

# 复制依赖
COPY --from=deps /app/node_modules ./node_modules

# 复制源代码
COPY . .

# 暴露端口
EXPOSE 3000

ENV PORT=3000 \
    NODE_ENV=development

# 开发命令
CMD ["pnpm", "run", "dev"]

# ====================================
# Stage 3: Builder
# ====================================
FROM node:20-alpine AS builder

WORKDIR /app

RUN corepack enable && corepack prepare pnpm@latest --activate

# 复制依赖和源代码
COPY --from=deps /app/node_modules ./node_modules
COPY . .

# 构建时环境变量
# 注意：NEXT_PUBLIC_* 变量需要在构建时设置
ENV NEXT_TELEMETRY_DISABLED=1 \
    NODE_ENV=production

# 构建时可以通过 --build-arg 传递这些变量
ARG NEXT_PUBLIC_API_URL
ARG NEXT_PUBLIC_WS_URL
ARG NEXT_PUBLIC_DEBUG=false
ARG NEXT_PUBLIC_ENABLE_ANALYTICS=false

# 将 ARG 转换为 ENV 以便构建时使用
ENV NEXT_PUBLIC_API_URL=${NEXT_PUBLIC_API_URL} \
    NEXT_PUBLIC_WS_URL=${NEXT_PUBLIC_WS_URL} \
    NEXT_PUBLIC_DEBUG=${NEXT_PUBLIC_DEBUG} \
    NEXT_PUBLIC_ENABLE_ANALYTICS=${NEXT_PUBLIC_ENABLE_ANALYTICS}

# 构建应用
RUN pnpm run build

# ====================================
# Stage 4: Production
# ====================================
FROM node:20-alpine AS production

WORKDIR /app

ENV NODE_ENV=production \
    NEXT_TELEMETRY_DISABLED=1 \
    PORT=3000 \
    HOSTNAME="0.0.0.0"

# 创建非 root 用户
RUN addgroup --system --gid 1001 nodejs && \
    adduser --system --uid 1001 nextjs

# 复制构建产物
COPY --from=builder --chown=nextjs:nodejs /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

USER nextjs

EXPOSE 3000

# 健康检查
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
    CMD node -e "require('http').get('http://localhost:3000', (r) => {process.exit(r.statusCode === 200 ? 0 : 1)})"

CMD ["node", "server.js"]
