# 项目优化实施任务清单

## 阶段 1：基础优化 ✅

### 1. 依赖管理优化

- [x] 1.1 前端依赖清理
  - 扫描 frontend 目录，识别未使用的依赖包
  - 移除 framer-motion 依赖（未在代码中使用）
  - 验证 react-markdown 和 date-fns 的使用情况
  - 更新 package.json 并运行 pnpm install
  - 运行前端测试确保功能正常
  - _需求: 1.1, 1.2, 1.4_

- [x] 1.2 后端依赖分离
  - 创建 backend/requirements-dev.txt 文件
  - 将开发依赖（pytest, black, isort, mypy, pre-commit）移至 requirements-dev.txt
  - 更新 backend/requirements.txt 只保留生产依赖
  - 更新 backend/Dockerfile 以区分开发和生产依赖安装
  - 验证后端服务启动正常
  - _需求: 1.2, 1.4_

- [x] 1.3 依赖版本升级评估
  - 检查 Next.js 15.x 的破坏性变更文档
  - 检查 FastAPI 0.115.x 的变更日志
  - 创建依赖升级计划文档（列出可升级的依赖及风险）
  - 在开发分支测试关键依赖升级
  - _需求: 1.3_

- [x] 1.4 依赖升级实施
  - 升级前端依赖到最新稳定版本
  - 升级后端依赖到最新稳定版本
  - 运行完整测试套件验证
  - 更新文档说明新版本要求
  - _需求: 1.3, 1.4_

### 2. 配置与安全加固

- [x] 2.1 环境变量迁移
  - 在 .env.example 中添加 FRONTEND_URL 和 BACKEND_URL 变量
  - 更新 docker-compose.yml 使用环境变量替代硬编码的 localhost URL
  - 更新 frontend/hooks/use-log-websocket.ts 使用环境变量
  - 更新 backend/app/main.py 使用 settings.API_URL
  - 验证所有环境（开发、测试）配置正确
  - _需求: 3.1, 3.2_

- [x] 2.2 环境变量验证机制
  - 创建 scripts/validate-env.sh 脚本
  - 在脚本中检查所有必需的环境变量
  - 在 backend/app/core/config.py 中添加启动时验证
  - 更新 README.md 添加环境变量配置说明
  - _需求: 3.2_

- [x] 2.3 API 文档安全加固
  - 为生产环境的 /docs 端点添加可选的基本认证
  - 在 backend/app/main.py 中添加环境判断逻辑
  - 更新部署文档说明如何启用 API 文档保护
  - _需求: 3.3_

- [x] 2.4 速率限制中间件
  - 安装 slowapi 依赖
  - 创建 backend/app/middleware/rate_limit.py
  - 为登录和注册端点添加速率限制
  - 编写速率限制的配置文档
  - _需求: 3.3_

### 3. Docker 镜像优化

- [x] 3.1 前端 Dockerfile 优化
  - 在 next.config.js 中启用 output: 'standalone'
  - 更新 frontend/Dockerfile 使用 standalone 输出
  - 优化依赖安装步骤（使用 --prod 标志）
  - 调整 COPY 指令顺序以优化缓存利用
  - 构建并测试优化后的镜像
  - 记录镜像大小对比数据
  - _需求: 4.1, 4.2, 4.3, 4.4_

- [x] 3.2 后端 Dockerfile 优化
  - 更新 backend/Dockerfile 分离开发和生产依赖
  - 添加 pip 缓存清理步骤
  - 优化层顺序以提高缓存命中率
  - 移除生产镜像中的构建工具
  - 构建并测试优化后的镜像
  - 记录镜像大小对比数据
  - _需求: 4.1, 4.2, 4.3, 4.4_

- [x] 3.3 Docker Compose 配置优化
  - 更新 docker-compose.yml 使用优化后的镜像
  - 添加健康检查配置
  - 优化卷挂载配置
  - 测试完整的 Docker Compose 启动流程
  - _需求: 4.4_

## 阶段 2：代码重构

### 4. 超大文件拆分

- [x] 4.1 拆分 backend/app/core/cache.py 
  - 创建 backend/app/core/cache/ 目录
  - 创建 manager.py（CacheManager 类）
  - 创建 decorators.py（缓存装饰器）
  - 创建 strategies.py（缓存策略）
  - 创建 key_generator.py（键生成器）
  - 创建 invalidation.py（缓存失效逻辑）
  - 创建 __init__.py 导出公共接口
  - 更新所有引用 cache.py 的代码
  - 运行测试确保功能正常
  - _需求: 2.1, 2.2, 2.3, 2.5_

- [x] 4.2 拆分 backend/app/services/user_item_service.py
  - 创建 backend/app/services/user_items/ 目录 ✅
  - 创建 crud.py（基础 CRUD 操作）✅
  - 创建 business.py（业务逻辑）✅
  - 创建 __init__.py 导出 UserItemService ⏳
  - 更新路由文件的导入语句 ⏳
  - 运行测试确保功能正常 ⏳
  - _需求: 2.1, 2.2, 2.3, 2.5_

- [x] 4.3 拆分 backend/app/api/routes/user_items.py
  - 创建 backend/app/api/routes/user_items/ 目录 ✅
  - 创建 crud.py（CRUD 路由）✅
  - 创建 query.py（查询路由）✅
  - 创建 __init__.py 合并路由 ✅
  - 更新主路由注册代码 ✅（无需修改，向后兼容）
  - 运行测试确保所有端点正常 ⏳
  - _需求: 2.1, 2.2, 2.3, 2.5_

- [x] 4.4 拆分 frontend/app/library/[id]/page.tsx
  - [x] 创建 frontend/components/library/detail/ 目录
  - [x] 提取 DetailHeader 组件（ItemDetailHeader.tsx）
  - [x] 提取 DetailContent 组件（ItemDetailContent.tsx）
  - [x] 提取 DetailSections 组件（ItemDetailSections.tsx）
  - [x] 提取 DetailSidebar 组件（ItemDetailSidebar.tsx）
  - [x] 创建 use-item-detail Hook 管理状态和逻辑
  - [x] 更新页面文件使用新组件
  - [ ] 测试详情页功能
  - _需求: 2.1, 2.2, 2.3, 2.5_

- [x] 4.5 拆分 frontend/components/admin/LLMConfigForm.tsx
  - [x] 创建 frontend/components/admin/llm-config/ 目录
  - [x] 提取 BasicConfigFields 组件
  - [x] 提取 AdvancedConfigFields 组件
  - [x] 提取 form-schema（验证规则）
  - [x] 更新主表单组件
  - [x] 保持向后兼容
  - [ ] 测试表单功能
  - _需求: 2.1, 2.2, 2.3, 2.5_

### 5. 重复代码提取

- [x] 5.1 创建后端错误处理工具
  - 创建 backend/app/utils/error_handlers.py
  - 实现 handle_service_error 函数
  - 实现 handle_validation_error 函数
  - 实现 handle_not_found_error 函数
  - 更新路由文件使用新的错误处理函数
  - _需求: 2.4, 2.6_

- [x] 5.2 创建后端查询构建工具
  - 创建 backend/app/utils/query_builders.py
  - 实现 build_filter_query 函数
  - 实现 build_sort_query 函数
  - 实现 build_pagination_query 函数
  - 更新 service 文件使用新的查询构建器
  - _需求: 2.4, 2.6_

- [x] 5.3 创建前端数据获取 Hook
  - 创建 frontend/hooks/use-data-fetch.ts
  - 实现通用的数据获取逻辑
  - 实现加载状态管理
  - 实现错误处理
  - 更新页面组件使用新 Hook
  - _需求: 2.4, 2.6_

- [x] 5.4 创建前端 API 辅助函数
  - 创建 frontend/lib/utils/api-helpers.ts
  - 实现 buildQueryString 函数
  - 实现 handleApiError 函数
  - 实现 transformApiResponse 函数
  - 更新 API 客户端使用新函数
  - _需求: 2.4, 2.6_

### 6. 工具函数库建设

- [x] 6.1 创建前端工具函数库
  - 创建 frontend/lib/utils/date-formatters.ts
  - 创建 frontend/lib/utils/validators.ts
  - 创建 frontend/lib/utils/transformers.ts
  - 创建 frontend/lib/utils/error-handlers.ts
  - 为每个工具函数添加 JSDoc 注释
  - _需求: 2.6_

- [x] 6.2 创建后端工具函数库
  - 创建 backend/app/utils/validators.py ✅
  - 创建 backend/app/utils/transformers.py ✅
  - 创建 backend/app/utils/decorators.py ✅（已通过 error_handlers.py 实现）
  - 为每个工具函数添加文档字符串 ✅
  - _需求: 2.6_

## 阶段 3：质量提升

### 7. 类型系统加强

- [ ] 7.1 前端 TypeScript 配置强化
  - 更新 frontend/tsconfig.json 启用严格模式
  - 修复所有类型错误
  - 为所有组件添加 Props 类型定义
  - 为所有 Hook 添加返回类型定义
  - 运行 type-check 确保无错误
  - _需求: 5.1_

- [ ] 7.2 后端类型注解完善
  - 为所有公共函数添加类型注解
  - 为所有类方法添加类型注解
  - 配置 mypy 进行类型检查
  - 修复所有 mypy 报告的类型错误
  - _需求: 5.1_

### 8. 代码格式化与检查

- [ ] 8.1 前端代码质量工具配置
  - 更新 .eslintrc.json 配置
  - 更新 .prettierrc 配置
  - 运行 eslint --fix 修复所有可自动修复的问题
  - 运行 prettier --write 格式化所有代码
  - 手动修复剩余的 lint 错误
  - _需求: 5.2, 5.4_

- [ ] 8.2 后端代码质量工具配置
  - 配置 backend/.flake8
  - 配置 backend/pyproject.toml（black 和 isort）
  - 运行 black . 格式化所有代码
  - 运行 isort . 排序所有导入
  - 运行 flake8 并修复所有错误
  - _需求: 5.2, 5.4_

- [ ] 8.3 CI/CD 代码质量检查
  - 创建 .github/workflows/code-quality.yml
  - 添加前端 lint 和 type-check 步骤
  - 添加后端 black、isort、flake8 检查步骤
  - 配置 PR 必须通过代码质量检查
  - _需求: 5.4_

### 9. 文档完善

- [ ] 9.1 函数文档注释
  - 为所有新创建的工具函数添加文档注释
  - 为所有重构的服务类添加文档注释
  - 确保文档包含参数、返回值、异常说明
  - 添加使用示例
  - _需求: 5.2_

- [ ] 9.2 API 文档更新
  - 更新 OpenAPI 文档描述
  - 为所有端点添加详细的说明
  - 添加请求和响应示例
  - 更新错误码说明
  - _需求: 5.2_

- [ ] 9.3 项目文档更新
  - 更新 README.md 反映优化后的架构
  - 更新环境变量配置文档
  - 更新 Docker 部署文档
  - 创建代码贡献指南
  - _需求: 5.2_

### 10. 测试覆盖率提升

- [ ] 10.1 前端单元测试
  - 为所有工具函数编写单元测试
  - 为所有自定义 Hook 编写测试
  - 为关键组件编写测试
  - 确保工具函数测试覆盖率 > 90%
  - _需求: 7.1, 7.2, 7.3_

- [ ] 10.2 后端单元测试
  - 为所有工具函数编写单元测试
  - 为所有服务类方法编写测试
  - 为数据模型编写测试
  - 确保核心业务逻辑覆盖率 > 70%
  - _需求: 7.1, 7.2, 7.3_

- [ ] 10.3 API 集成测试
  - 为所有 CRUD 端点编写集成测试
  - 为认证流程编写测试
  - 为复杂业务流程编写测试
  - 确保 API 端点覆盖率 > 80%
  - _需求: 7.2, 7.3_

- [ ] 10.4 测试自动化配置
  - 创建 .github/workflows/test.yml
  - 配置前端测试自动运行
  - 配置后端测试自动运行
  - 集成 Codecov 生成覆盖率报告
  - 配置 PR 必须通过测试
  - _需求: 7.3, 7.5_

## 阶段 4：性能优化

### 11. 前端打包优化

- [ ] 11.1 代码分割实施
  - 识别大型组件（> 100KB）
  - 使用 dynamic import 实现懒加载
  - 为懒加载组件添加 loading 状态
  - 测试页面加载性能
  - _需求: 6.1, 6.2_

- [ ] 11.2 依赖优化
  - 使用 lodash-es 替代 lodash
  - 移除未使用的 UI 组件
  - 配置 Tree Shaking
  - 分析打包产物大小
  - _需求: 6.1, 6.2_

- [ ] 11.3 图片优化
  - 将所有 img 标签替换为 Next.js Image 组件
  - 配置图片格式优化（WebP）
  - 启用图片懒加载
  - 添加图片占位符
  - _需求: 6.2_

- [ ] 11.4 性能监控
  - 集成 Web Vitals 监控
  - 配置性能预算
  - 设置性能基准测试
  - 生成性能报告
  - _需求: 6.5_

### 12. 后端性能优化

- [ ] 12.1 数据库索引优化
  - 分析慢查询日志
  - 为高频查询字段添加索引
  - 创建复合索引
  - 生成数据库迁移
  - 测试查询性能提升
  - _需求: 6.3_

- [ ] 12.2 查询优化
  - 使用 joinedload 避免 N+1 查询
  - 实现查询结果分页
  - 优化复杂查询逻辑
  - 添加查询性能日志
  - _需求: 6.3_

- [ ] 12.3 批量操作优化
  - 使用 bulk_insert_mappings 批量插入
  - 使用 bulk_update_mappings 批量更新
  - 优化批量删除逻辑
  - 测试批量操作性能
  - _需求: 6.3_

### 13. 缓存策略优化

- [ ] 13.1 缓存配置优化
  - 审查所有缓存 TTL 设置
  - 为热数据设置合理的缓存时间
  - 实现缓存预热机制
  - 配置缓存监控
  - _需求: 6.4_

- [ ] 13.2 缓存失效策略
  - 实现主动缓存失效
  - 使用版本号管理缓存
  - 实现缓存标签系统
  - 测试缓存一致性
  - _需求: 6.4_

- [ ] 13.3 多层缓存实施
  - 配置 Nginx 缓存
  - 实现应用层缓存
  - 优化 Redis 缓存策略
  - 测试缓存命中率
  - _需求: 6.4_

## 验收与交付

### 14. 优化验证

- [ ] 14.1 功能回归测试
  - 运行完整的测试套件
  - 手动测试所有关键功能
  - 验证所有 API 端点
  - 检查前端页面渲染
  - _需求: 所有_

- [ ] 14.2 性能基准测试
  - 测量首页加载时间（目标 < 2.5s）
  - 测量 API 平均响应时间（目标 < 200ms）
  - 测量镜像构建时间
  - 记录镜像大小对比
  - _需求: 4.5, 6.5_

- [ ] 14.3 安全审计
  - 运行依赖漏洞扫描
  - 测试认证和授权
  - 检查敏感信息泄露
  - 验证环境变量配置
  - _需求: 3.3_

### 15. 文档与交付

- [ ] 15.1 优化报告生成
  - 汇总所有优化指标
  - 生成前后对比数据
  - 记录遇到的问题和解决方案
  - 提出后续优化建议
  - _需求: 1.5_

- [ ] 15.2 知识转移
  - 编写优化实施文档
  - 更新开发者指南
  - 组织代码审查会议
  - 培训团队成员
  - _需求: 所有_

- [ ] 15.3 部署准备
  - 更新部署脚本
  - 准备回滚方案
  - 编写部署检查清单
  - 通知相关人员
  - _需求: 所有_
