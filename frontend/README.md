# YueYing Frontend

基于 Next.js 15 的现代化前端应用，采用 Apple 风格设计美学。

## 技术栈

- **框架**: Next.js 15 (App Router)
- **语言**: TypeScript (严格模式)
- **UI 库**: Material-UI v6
- **样式**: Tailwind CSS v4
- **动画**: GSAP v3
- **状态管理**: Zustand
- **表单**: React Hook Form + Zod
- **测试**: Vitest + Testing Library + fast-check

## 开发指南

### 环境要求

- Node.js 20+
- pnpm 8+

### 快速开始

```bash
# 1. 安装依赖
pnpm install

# 2. 配置环境变量
cp .env.example .env.local
# 编辑 .env.local，设置必要的环境变量

# 3. 验证环境变量配置
pnpm verify-env

# 4. 启动开发服务器
pnpm dev
```

### 环境变量配置

本项目使用环境变量进行配置。详细说明请参考：

- **[环境变量文档](./ENV_VARIABLES.md)** - 完整的环境变量说明和配置指南
- `.env.example` - 环境变量示例文件
- `.env.development` - 开发环境配置模板
- `.env.production` - 生产环境配置模板

#### 必需的环境变量

```bash
# 客户端 API 地址
NEXT_PUBLIC_API_URL=http://localhost:8000/api

# 服务器端 API 地址
API_URL=http://backend:8000/api

# NextAuth 密钥
NEXTAUTH_SECRET=your-secret-key-change-in-production
```

#### 验证环境变量

运行验证脚本检查环境变量配置：

```bash
pnpm verify-env
```

### 可用脚本

- `pnpm dev` - 启动开发服务器
- `pnpm build` - 构建生产版本
- `pnpm start` - 启动生产服务器
- `pnpm lint` - 运行 ESLint
- `pnpm lint:fix` - 自动修复 ESLint 错误
- `pnpm type-check` - TypeScript 类型检查
- `pnpm format` - 格式化代码
- `pnpm format:check` - 检查代码格式
- `pnpm test` - 运行测试（监听模式）
- `pnpm test:run` - 运行测试（单次）
- `pnpm test:coverage` - 运行测试并生成覆盖率报告
- `pnpm verify-env` - 验证环境变量配置

## 项目结构

```
src/
├── app/              # Next.js App Router
├── components/       # React 组件
│   ├── ui/          # 基础 UI 组件
│   ├── layout/      # 布局组件
│   ├── features/    # 功能组件
│   └── shared/      # 共享组件
├── lib/             # 工具函数和 API 客户端
│   ├── api/        # API 客户端
│   ├── theme/      # MUI 主题配置
│   ├── animations/ # GSAP 动画工具
│   └── utils/      # 辅助函数
├── hooks/           # 自定义 React Hooks
├── stores/          # Zustand 状态管理
├── types/           # TypeScript 类型定义
└── test/            # 测试工具和配置
```

## 设计系统

本项目采用 Apple 风格设计系统，详见：

- [设计系统文档](./DESIGN_SYSTEM.md)
- [组件使用指南](./COMPONENT_USAGE_GUIDE.md)
- [组件文档总结](./COMPONENT_DOCUMENTATION_SUMMARY.md)

## 测试

测试框架配置和指南详见 [TESTING.md](./TESTING.md)。

## Docker 部署

### 开发环境

```bash
# 使用 docker-compose
docker-compose up frontend

# 或手动构建
docker build --target development -t yueying-frontend:dev .
docker run -p 3000:3000 \
  -e NEXT_PUBLIC_API_URL=http://localhost:8000/api \
  -e API_URL=http://backend:8000/api \
  yueying-frontend:dev
```

### 生产环境

```bash
# 构建生产镜像（传递构建参数）
docker build \
  --target production \
  --build-arg NEXT_PUBLIC_API_URL=https://your-domain.com/api \
  --build-arg NEXT_PUBLIC_WS_URL=wss://your-domain.com \
  -t yueying-frontend:prod .

# 运行生产容器
docker run -p 3000:3000 \
  -e API_URL=http://backend:8000/api \
  -e NEXTAUTH_SECRET=your-production-secret \
  -e NEXTAUTH_URL=https://your-domain.com \
  yueying-frontend:prod
```

### 验证 Docker 环境变量

```bash
# 进入容器
docker-compose exec frontend sh

# 查看环境变量
env | grep -E "API_URL|NEXT_PUBLIC|NEXTAUTH"

# 运行验证脚本
pnpm verify-env
```

## 故障排查

### API 连接问题

如果遇到 API 连接失败：

1. 检查环境变量配置：`pnpm verify-env`
2. 确认后端服务运行：`curl http://localhost:8000/api/health`
3. 检查 CORS 配置
4. 查看浏览器控制台错误信息

### 认证问题

如果遇到认证失败：

1. 确认 `NEXTAUTH_SECRET` 已设置
2. 确认 `NEXTAUTH_URL` 与访问地址一致
3. 清除浏览器 Cookie 和缓存
4. 检查后端 JWT 配置

### 环境变量未生效

如果环境变量未生效：

1. 确认文件名正确（`.env.local` 而不是 `.env`）
2. 重启开发服务器
3. 清除 Next.js 缓存：`rm -rf .next && pnpm dev`
4. Docker 环境：重新构建容器

详细的故障排查指南请参考 [ENV_VARIABLES.md](./ENV_VARIABLES.md)。

## 贡献指南

1. Fork 本仓库
2. 创建特性分支 (`git checkout -b feature/AmazingFeature`)
3. 提交更改 (`git commit -m 'Add some AmazingFeature'`)
4. 推送到分支 (`git push origin feature/AmazingFeature`)
5. 开启 Pull Request

## 许可证

[MIT License](LICENSE)
