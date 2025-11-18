# Implementation Plan

- [x] 1. 创建服务端认证工具模块
  - 创建 `frontend/lib/auth/server-auth.ts` 文件
  - 实现 `getServerSession()` 函数用于服务端获取会话
  - 实现 `isAdmin()` 函数用于检查管理员角色
  - 实现 `isHomeAccessAllowed()` 函数用于首页访问控制
  - 实现重定向辅助函数 `redirectToLogin()` 和 `redirectToHome()`
  - 添加错误处理和日志记录
  - _Requirements: 1.1, 1.2, 2.1, 4.1, 4.2_

- [x] 1.1 编写服务端认证工具的单元测试
  - 测试 `getServerSession()` 在不同场景下的行为
  - 测试 `isAdmin()` 的角色判断逻辑
  - 测试 `isHomeAccessAllowed()` 的系统设置查询逻辑
  - 测试错误处理场景
  - _Requirements: 1.1, 2.1, 4.1, 4.2_

- [x] 2. 创建 Middleware 辅助函数模块
  - 创建 `frontend/lib/auth/middleware-helpers.ts` 文件
  - 定义 `ROUTE_RULES` 配置对象（公开路由、管理员路由）
  - 实现 `isPublicRoute()` 函数用于匹配公开路由
  - 实现 `isAdminRoute()` 函数用于匹配管理员路由
  - 实现 `isHomeRoute()` 函数用于匹配首页
  - 实现 `buildLoginUrl()` 函数用于构建登录重定向 URL
  - _Requirements: 1.2, 3.1, 3.2, 8.1, 8.2_

- [x] 2.1 编写 Middleware 辅助函数的单元测试
  - 测试路由匹配函数的正确性
  - 测试 URL 构建函数
  - 测试边界情况（空路径、特殊字符等）
  - _Requirements: 1.2, 3.2_

- [x] 2.2 编写属性测试：重定向 URL 包含回调参数
  - **Property 2: 重定向 URL 包含回调参数**
  - **Validates: Requirements 1.2**
  - 使用 fast-check 生成随机原始请求路径
  - 验证 `buildLoginUrl()` 返回的 URL 包含正确的 callbackUrl 参数
  - 运行至少 100 次迭代

- [x] 3. 增强 Next.js Middleware 实现
  - 更新 `frontend/middleware.ts` 文件
  - 导入 Middleware 辅助函数
  - 在 `authorized` 回调中实现完整的权限检查逻辑
  - 处理公开路由、受保护路由、管理员路由
  - 处理首页的特殊访问控制逻辑
  - 添加错误处理和日志记录
  - 更新 `matcher` 配置确保覆盖所有必要路由
  - _Requirements: 1.1, 1.2, 1.4, 2.1, 2.2, 2.3, 3.1, 3.2, 4.1, 4.2, 8.4_

- [x] 3.1 编写属性测试：未认证用户访问受保护路由返回重定向
  - **Property 1: 未认证用户访问受保护路由返回重定向**
  - **Validates: Requirements 1.1**
  - 使用 fast-check 生成随机受保护路由路径
  - 模拟未认证请求
  - 验证 Middleware 返回 302 重定向响应

- [x] 3.2 编写属性测试：已认证用户访问受保护路由成功
  - **Property 3: 已认证用户访问受保护路由成功**
  - **Validates: Requirements 1.4**
  - 使用 fast-check 生成随机受保护路由路径和有效 token
  - 验证 Middleware 允许请求通过

- [x] 3.3 编写属性测试：非管理员访问管理员路由被重定向
  - **Property 4: 非管理员访问管理员路由被重定向**
  - **Validates: Requirements 2.1**
  - 使用 fast-check 生成随机管理员路由路径和非管理员 session
  - 验证返回重定向响应

- [x] 3.4 编写属性测试：路由权限规则正确应用
  - **Property 9: 路由权限规则正确应用**
  - **Validates: Requirements 8.4**
  - 使用 fast-check 生成随机路由路径和权限级别组合
  - 验证 Middleware 应用正确的权限检查规则

- [x] 3.5 编写单元测试：特定场景测试
  - 测试未认证用户访问 `/admin` 重定向到 `/login`
  - 测试已认证但非管理员用户访问 `/admin` 重定向到 `/`
  - 测试公开路由（`/login`, `/register`）允许访问
  - _Requirements: 2.2, 2.3_

- [x] 4. 转换 Admin Layout 为 Server Component
  - 更新 `frontend/app/admin/layout.tsx` 文件
  - 移除 `"use client"` 指令
  - 将函数改为 `async`
  - 使用 `getServerSession()` 替换 `useSession()`
  - 使用 `redirect()` 替换 `router.push()`
  - 移除客户端状态管理（`useAuthStore`）
  - 移除 `useEffect` 和 `useState`
  - 实现服务端权限检查逻辑
  - 处理未认证和非管理员的重定向
  - _Requirements: 2.1, 2.2, 2.3, 2.4, 5.1, 5.2, 5.3, 5.5_

- [x] 4.1 编写属性测试：管理员访问管理员路由成功
  - **Property 5: 管理员访问管理员路由成功**
  - **Validates: Requirements 2.4**
  - 使用 fast-check 生成随机管理员路由路径和管理员 session
  - 验证系统允许访问

- [x] 5. 处理 AdminSidebar 客户端组件
  - 检查 `frontend/components/admin/AdminSidebar.tsx` 是否包含客户端交互
  - 如果包含客户端交互，确保已标记为 `"use client"`
  - 如果不包含客户端交互，可以保持为 Server Component
  - 确保 AdminSidebar 可以在 Server Component 中正常使用
  - _Requirements: 5.4_

- [x] 6. 转换首页为 Server Component
  - 更新 `frontend/app/page.tsx` 文件
  - 移除 `"use client"` 指令
  - 将函数改为 `async`
  - 使用 `getServerSession()` 替换 `useSession()`
  - 使用 `isHomeAccessAllowed()` 进行访问控制检查
  - 使用 `redirect()` 处理未授权访问
  - 移除客户端的访问控制检查逻辑（`checkHomeAccess` useEffect）
  - _Requirements: 4.1, 4.2, 4.5_

- [x] 6.1 处理首页数据获取逻辑
  - 评估当前的数据获取方式（客户端 API 调用）
  - 决定数据获取策略：
    - 选项 1: 在 Server Component 中获取数据并传递给 Client Component
    - 选项 2: 将数据获取逻辑保留在 Client Component 中（使用 React Query）
  - 实现选定的策略
  - 确保数据获取不会在权限检查失败时执行
  - _Requirements: 6.1, 6.5_

- [x] 6.2 编写属性测试：首页访问控制遵循系统设置
  - **Property 6-7: 首页访问控制遵循系统设置**
  - **Validates: Requirements 4.1, 4.2**
  - 使用 fast-check 生成随机系统设置（允许/禁止匿名访问）
  - 验证未认证用户的访问控制行为符合设置
  - 测试允许匿名访问的情况
  - 测试禁止匿名访问的情况

- [x] 7. Checkpoint - 确保所有测试通过
  - 确保所有测试通过，如有问题请询问用户

- [x] 8. 简化 ProtectedRoute 组件
  - 更新 `frontend/components/auth/ProtectedRoute.tsx` 文件
  - 添加文档注释说明使用场景（仅用于 Middleware 无法处理的特殊场景）
  - 移除与 Middleware 重复的基本认证检查逻辑
  - 简化实现，假设基本认证已由 Middleware 验证
  - 保留加载状态和重定向逻辑
  - 确保重定向时保留回调参数
  - _Requirements: 7.1, 7.2, 7.3, 7.4, 7.5_

- [x] 8.1 编写属性测试：ProtectedRoute 组件保留回调参数
  - **Property 8: ProtectedRoute 组件保留回调参数**
  - **Validates: Requirements 7.4**
  - 使用 fast-check 生成随机页面路径
  - 验证组件重定向时 URL 包含回调参数

- [x] 9. 添加性能优化：系统设置缓存
  - 在 `frontend/lib/auth/server-auth.ts` 中实现系统设置缓存
  - 使用 Next.js 的 `unstable_cache` 或其他缓存机制
  - 设置合理的缓存过期时间（如 5 分钟）
  - 确保缓存不会影响权限检查的准确性
  - _Requirements: 6.3_

- [x] 10. 添加监控和日志
  - 在 Middleware 中添加权限检查日志
  - 记录权限检查失败的情况（路径、原因、时间戳）
  - 在服务端认证工具中添加错误日志
  - 使用结构化日志格式（JSON）
  - 确保不暴露敏感信息
  - _Requirements: 所有需求_

- [x] 10.1 编写单元测试：错误处理场景
  - 测试系统设置 API 失败时的降级行为
  - 测试 Session 解析失败时的处理
  - 测试 Middleware 异常时的安全默认行为
  - 测试服务端重定向错误的处理
  - _Requirements: 所有需求_

- [x] 11. 更新文档和注释
  - 在 `frontend/middleware.ts` 中添加详细的注释说明权限检查逻辑
  - 在 `frontend/lib/auth/` 目录添加 README 说明使用方法
  - 更新 ProtectedRoute 组件的文档注释
  - 添加迁移指南（如何从客户端权限检查迁移到服务端）
  - _Requirements: 3.5, 7.1, 8.1, 8.2_

- [x] 12. 清理废弃代码
  - 检查并移除不再需要的客户端权限检查代码
  - 移除重复的权限检查逻辑
  - 清理未使用的导入和依赖
  - 确保代码库整洁
  - _Requirements: 3.4, 3.5_

- [x] 13. Final Checkpoint - 确保所有测试通过
  - 所有 105 个测试通过 ✅
