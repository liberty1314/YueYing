# Implementation Plan

- [x] 1. 项目初始化与基础配置
  - 创建新的 Next.js 15 项目，使用 TypeScript 和 App Router
  - 配置 pnpm 作为包管理器
  - 设置 ESLint、Prettier 和 TypeScript 严格模式
  - 配置路径别名 (@/) 用于清晰的导入
  - _Requirements: 1.1, 1.2, 1.3, 1.4, 1.5, 14.2, 14.3_

- [x] 1.1 编写项目配置验证测试
  - 验证 Next.js 版本 ≥ 15
  - 验证 TypeScript 严格模式已启用
  - 验证 pnpm-lock.yaml 存在
  - _Requirements: 1.1, 1.2, 1.4_

- [x] 2. 目录结构搭建
  - 创建 src/ 目录结构
  - 建立 components/、lib/、hooks/、stores/、types/ 目录
  - 创建 app/ 路由目录结构（auth、library、explore 等）
  - 设置 public/ 静态资源目录
  - _Requirements: 2.1, 2.2, 2.3, 2.4_

- [x] 3. Docker 环境配置
  - 创建多阶段 Dockerfile（deps、development、builder、production）
  - 配置工作目录为 /app，暴露端口 3000
  - 更新 docker-compose.yml 中的前端服务配置
  - 创建 .env.example 文件，文档化所有环境变量
  - _Requirements: 3.1, 3.2, 3.3, 3.4, 3.5, 4.4_

- [x] 3.1 编写 Docker 配置验证测试
  - 验证 Dockerfile 包含多阶段构建
  - 验证 WORKDIR 设置为 /app
  - 验证 EXPOSE 3000
  - _Requirements: 3.1, 3.2, 3.4_

- [x] 4. Material-UI 集成与主题系统
  - 安装 MUI v6 及相关依赖（@mui/material、@emotion/react、@emotion/styled）
  - 创建 Apple 风格主题配置（src/lib/theme/index.ts）
  - 配置 light 和 dark 主题模式
  - 定义自定义设计令牌（颜色、字体、间距、圆角）
  - 在 app/layout.tsx 中集成 ThemeProvider 和 CssBaseline
  - _Requirements: 5.1, 5.2, 5.3, 5.4, 5.5_

- [x] 4.1 编写主题系统属性测试
  - **Property 3: Theme Mode Switching**
  - **Validates: Requirements 5.4**

- [x] 5. Tailwind CSS 集成与配置
  - 安装 Tailwind CSS v3 和 PostCSS
  - 配置 tailwind.config.ts，定义与 MUI 匹配的设计令牌
  - 配置 PostCSS 处理 Tailwind 指令
  - 设置 important: '#__next' 避免与 MUI 冲突
  - 禁用 Tailwind preflight 以兼容 MUI
  - _Requirements: 6.1, 6.2, 6.3, 6.5_

- [x] 5.1 编写样式系统集成测试
  - 验证 Tailwind 和 MUI 样式不冲突
  - 验证自定义设计令牌正确应用
  - _Requirements: 6.2, 6.3_

- [x] 6. GSAP 动画引擎集成
  - 安装 GSAP v3 和 ScrollTrigger 插件
  - 创建动画工具函数（src/lib/animations/utils.ts）
  - 实现 fadeIn、parallax、pageTransition 等常用动画
  - 创建 useGsapAnimation 自定义 Hook
  - 配置性能优化设置（limitCallbacks、syncInterval）
  - _Requirements: 7.1, 7.2, 7.3, 7.5_

- [x] 6.1 编写动画性能测试
  - 验证 GSAP 和 ScrollTrigger 正确注册
  - 验证动画工具函数存在
  - _Requirements: 7.1, 7.2, 7.5_

- [x] 7. 状态管理架构
  - 安装 Zustand 和 Axios
  - 创建 authStore（用户认证状态）
  - 创建 uiStore（主题、侧边栏、加载状态）
  - 创建 libraryStore（用户库筛选、排序、视图模式）
  - 实现客户端缓存管理器（src/lib/cache/cacheManager.ts）
  - _Requirements: 8.1, 8.2, 8.3_

- [x] 7.1 编写状态管理属性测试
  - **Property 4: API Response Caching**
  - **Validates: Requirements 8.4**

- [x] 8. API 客户端层实现
  - 创建 Axios 封装的 API 客户端（src/lib/api/client.ts）
  - 实现请求/响应拦截器（token 注入、错误处理）
  - 配置从环境变量读取 API URL
  - 实现统一的错误处理（ApiError 类）
  - 创建 API 端点模块（auth、userItems、tags、stats 等）
  - _Requirements: 4.1, 4.2, 4.3, 4.5, 8.3_

- [x] 8.1 编写 API 客户端属性测试
  - **Property 1: Environment Variable Configuration**
  - **Validates: Requirements 4.3**

- [x] 8.2 编写 API 错误处理属性测试
  - **Property 2: API Error Handling Consistency**
  - **Validates: Requirements 4.5**

- [x] 8.3 编写加载和错误状态属性测试
  - **Property 5: Loading and Error State Consistency**
  - **Validates: Requirements 8.5**

- [x] 9. 设计系统基础组件开发
  - 创建 AppleButton 组件（primary、secondary、ghost、text 变体）
  - 创建 AppleCard 组件（elevated、outlined、glass 变体）
  - 创建 AppleInput 组件（带标签、错误提示、装饰器）
  - 创建 Typography 组件（h1-h6、body1-body2）
  - 创建 Loading 和 Skeleton 组件
  - _Requirements: 9.5_

- [x] 9.1 编写基础组件单元测试
  - 测试 Button 的各种变体和状态
  - 测试 Card 的悬停效果
  - 测试 Input 的验证和错误显示
  - _Requirements: 9.5_

- [x] 9.2 编写触摸目标可访问性属性测试
  - **Property 7: Touch Target Accessibility**
  - **Validates: Requirements 10.5**

- [x] 10. 布局组件开发
  - 创建 AppLayout 组件（包含 Navbar 和 Sidebar）
  - 创建 Navbar 组件（透明、固定、响应式）
  - 创建 Sidebar 组件（抽屉式、导航项）
  - 创建 Container 组件（响应式容器）
  - 实现响应式断点系统（mobile、tablet、desktop）
  - _Requirements: 10.1, 10.2, 10.3_

- [x] 10.1 编写响应式布局属性测试
  - **Property 6: Responsive Layout Adaptation**
  - **Validates: Requirements 10.2, 10.4**

- [x] 11. 错误处理系统
  - 创建 ErrorBoundary 组件
  - 创建 ErrorAlert 组件（显示友好的错误消息）
  - 实现全局错误处理器
  - 配置 401 错误自动跳转登录
  - _Requirements: 4.5_

- [x] 11.1 编写错误处理单元测试
  - 测试 ErrorBoundary 捕获错误
  - 测试 ErrorAlert 显示错误消息
  - 测试 401 自动跳转
  - _Requirements: 4.5_

- [x] 12. 动画与交互效果实现
  - 实现页面过渡动画
  - 实现滚动视差效果
  - 实现卡片悬停动画
  - 实现微交互反馈（hover、focus、loading）
  - 实现 prefers-reduced-motion 支持
  - _Requirements: 11.1, 11.2, 11.3, 11.5_

- [x] 12.1 编写动画可访问性属性测试
  - **Property 8: Motion Preference Respect**
  - **Validates: Requirements 11.5**

- [x] 13. 用户认证功能实现
  - 创建登录页面（/app/(auth)/login/page.tsx）
  - 创建注册页面（/app/(auth)/register/page.tsx）
  - 实现登录表单（React Hook Form + Zod 验证）
  - 实现注册表单
  - 实现 token 存储和刷新逻辑
  - 实现路由守卫（ProtectedRoute 组件）
  - _Requirements: 12.2_

- [x] 13.1 编写认证功能属性测试
  - **Property 9: Authentication Feature Parity**
  - **Validates: Requirements 12.2**

- [x] 14. 用户库功能实现
  - 创建库列表页面（/app/library/page.tsx）
  - 实现 ItemCard 组件（显示用户项目）
  - 实现 FilterPanel 组件（类型、状态、标签筛选）
  - 实现 SortSelector 组件（排序选项）
  - 实现 ViewToggle 组件（网格/列表视图切换）
  - 实现 GridView 和 ListView 组件
  - _Requirements: 12.3_

- [x] 15. 用户库 CRUD 操作
  - 实现添加项目功能（QuickAddForm）
  - 实现编辑项目功能（EditForm）
  - 实现删除项目功能（DeleteConfirmDialog）
  - 实现项目详情查看（ItemDetailDialog）
  - 集成 AI 标签生成功能
  - _Requirements: 12.3_

- [x] 15.1 编写 CRUD 操作属性测试
  - **Property 10: CRUD Operations Feature Parity**
  - **Validates: Requirements 12.3**

- [x] 16. 搜索和探索功能
  - 创建搜索页面（/app/explore/page.tsx）
  - 实现 SearchBar 组件（实时搜索、历史记录）
  - 实现 ContentTypeFilter 组件（电影、电视、动漫、游戏、书籍）
  - 实现 SearchResults 组件（分页、加载状态）
  - 实现 SearchCard 组件（搜索结果卡片）
  - 集成外部 API（TMDB、Google Books、Bangumi）
  - _Requirements: 12.3_

- [x] 16.1 编写搜索功能单元测试
  - 测试搜索输入和防抖
  - 测试筛选器功能
  - 测试分页
  - _Requirements: 12.3_

- [x] 17. 推荐功能实现
  - 创建推荐页面（/app/discover/page.tsx）
  - 实现 RecommendationCard 组件
  - 实现 RecommendationList 组件
  - 实现 SimilarItemsSection 组件
  - 集成后端推荐 API
  - _Requirements: 12.3_

- [x] 18. 统计分析功能
  - 创建统计页面（/app/stats/page.tsx）
  - 实现 OverviewCards 组件（总数、平均评分等）
  - 实现 TypeDistributionChart 组件（类型分布饼图）
  - 实现 RatingDistributionChart 组件（评分分布柱状图）
  - 实现 TimeTrendChart 组件（时间趋势折线图）
  - 实现 TopTagsCloud 组件（标签云）
  - _Requirements: 12.3_

- [x] 18.1 编写统计图表单元测试
  - 测试图表数据渲染
  - 测试空数据状态
  - _Requirements: 12.3_

- [x] 19. AI 助手功能
  - 创建助手页面（/app/assistant/page.tsx）
  - 实现聊天界面组件
  - 实现消息列表组件
  - 实现输入框组件
  - 集成 WebSocket 实时通信
  - 集成后端 RAG API
  - _Requirements: 12.3_

- [x] 20. 用户设置功能
  - 创建设置页面（/app/settings/page.tsx）
  - 实现通用设置（主题、语言）
  - 实现 AI 设置（/app/settings/ai/page.tsx）
  - 实现个人信息编辑
  - 实现密码修改
  - _Requirements: 12.3_

- [x] 21. 管理后台功能
  - 创建管理后台布局（/app/admin/layout.tsx）
  - 实现用户管理页面（/app/admin/users/page.tsx）
  - 实现 LLM 配置页面（/app/admin/llm-config/page.tsx）
  - 实现 API 密钥管理页面（/app/admin/api-keys/page.tsx）
  - 实现系统日志页面（/app/admin/logs/page.tsx）
  - 实现系统设置页面（/app/admin/system/page.tsx）
  - _Requirements: 12.3_

- [x] 21.1 编写管理后台单元测试
  - 测试用户管理 CRUD
  - 测试配置更新
  - _Requirements: 12.3_

- [x] 22. 性能优化实施
  - 实现路由级代码分割（dynamic imports）
  - 优化图片加载（Next.js Image 组件）
  - 实现字体优化（next/font）
  - 配置路由预加载（usePrefetchRoutes）
  - 实现虚拟滚动（长列表优化）
  - _Requirements: 13.2, 13.3, 13.4_

- [x] 22.1 运行 Lighthouse 性能测试
  - 验证性能评分 ≥ 90
  - _Requirements: 13.1_

- [x] 23. API 兼容性验证
  - 验证所有 API 请求格式与后端契约匹配
  - 测试认证流程（登录、注册、token 刷新）
  - 测试用户库 CRUD 操作
  - 测试搜索和推荐功能
  - 测试 WebSocket 连接
  - _Requirements: 12.4_

- [x] 23.1 编写 API 兼容性属性测试
  - **Property 11: Backend API Compatibility**
  - **Validates: Requirements 12.4**

- [x] 24. 组件文档与展示页面
  - 创建组件展示页面（/app/components/page.tsx）
  - 为每个设计系统组件添加 JSDoc 注释
  - 创建组件使用示例
  - 编写设计系统文档（README.md）
  - _Requirements: 15.2, 15.3_

- [ ] 25. 开发工具配置
  - 配置 Git hooks（husky + lint-staged）
  - 配置 pre-commit 钩子（运行 lint 和 type-check）
  - 添加 npm scripts（dev、build、start、test、lint、format）
  - 配置 VS Code 推荐设置和扩展
  - _Requirements: 14.1, 14.4, 14.5_

- [x] 26. 测试框架配置
  - 安装 Vitest、@testing-library/react、fast-check
  - 配置 vitest.config.ts
  - 创建测试设置文件（src/test/setup.ts）
  - 配置测试覆盖率报告
  - _Requirements: Testing Strategy_

- [x] 27. 环境变量和配置
  - 完善 .env.example 文件
  - 创建 .env.development 和 .env.production 示例
  - 文档化所有环境变量的用途
  - 验证环境变量在 Docker 中正确传递
  - _Requirements: 4.1, 4.2, 4.3, 4.4_

- [x] 28. Docker 部署测试
  - 构建开发环境镜像并测试
  - 构建生产环境镜像并测试
  - 验证 docker-compose up 正常启动
  - 验证前后端通信正常
  - 验证热重载在开发环境中工作
  - _Requirements: 3.5_

- [ ] 29. 最终检查点 - 确保所有测试通过
  - 运行所有单元测试
  - 运行所有属性测试
  - 检查测试覆盖率 ≥ 80%
  - 修复所有失败的测试
  - 验证所有核心功能正常工作
