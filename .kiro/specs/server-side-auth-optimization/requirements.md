# Requirements Document

## Introduction

本文档定义了服务端权限检查优化功能的需求。当前系统存在多套重复的前端权限检查逻辑，导致用户访问受保护页面时出现"先加载再重定向"的卡顿体验。本功能旨在通过将权限检查迁移到服务端（Next.js Middleware 和 Server Components），消除客户端重定向延迟，提升页面跳转的流畅度。

## Glossary

- **System**: 阅影·log (YueYing) 前端应用系统
- **Middleware**: Next.js 中间件，在请求到达页面组件之前执行的服务端代码
- **Server Component**: Next.js 服务端组件，在服务器端渲染的 React 组件
- **Client Component**: Next.js 客户端组件，在浏览器端渲染的 React 组件
- **Protected Route**: 受保护路由，需要用户认证才能访问的页面路径
- **Admin Route**: 管理员路由，需要管理员权限才能访问的页面路径
- **Session**: 用户会话，包含用户认证状态和用户信息
- **Loading Flash**: 加载闪烁，指页面先显示加载状态再重定向的视觉问题
- **ProtectedRoute Component**: 客户端权限保护组件，用于包裹需要认证的页面内容
- **NextAuth**: Next.js 的认证库，用于处理用户认证和会话管理

## Requirements

### Requirement 1

**User Story:** 作为系统用户，我希望访问受保护页面时能够立即重定向到登录页，而不是先看到加载状态，以获得更流畅的用户体验。

#### Acceptance Criteria

1. WHEN 未认证用户访问受保护路由 THEN THE System SHALL 在服务端执行权限检查并返回 302 重定向响应
2. WHEN 未认证用户被重定向到登录页 THEN THE System SHALL 在重定向 URL 中包含原始请求路径作为回调参数
3. WHEN 服务端权限检查执行 THEN THE System SHALL 不渲染受保护页面的任何组件
4. WHEN 已认证用户访问受保护路由 THEN THE System SHALL 允许请求通过并渲染页面内容
5. WHEN 服务端权限检查失败 THEN THE System SHALL 确保客户端不执行任何 API 请求

### Requirement 2

**User Story:** 作为系统管理员，我希望访问管理后台时能够在服务端验证管理员权限，避免客户端加载延迟，以提升管理体验。

#### Acceptance Criteria

1. WHEN 非管理员用户访问管理员路由 THEN THE System SHALL 在服务端检查用户角色并返回重定向响应
2. WHEN 未认证用户访问管理员路由 THEN THE System SHALL 重定向到登录页
3. WHEN 已认证但非管理员用户访问管理员路由 THEN THE System SHALL 重定向到首页
4. WHEN 管理员用户访问管理员路由 THEN THE System SHALL 允许访问并渲染管理后台布局
5. WHEN 管理员路由权限检查执行 THEN THE System SHALL 不显示加载状态组件

### Requirement 3

**User Story:** 作为开发人员，我希望系统使用统一的权限检查机制，避免重复逻辑，以提高代码可维护性。

#### Acceptance Criteria

1. WHEN 系统执行权限检查 THEN THE System SHALL 使用 Middleware 作为主要的服务端权限验证入口
2. WHEN Middleware 配置受保护路由 THEN THE System SHALL 定义清晰的路由匹配规则
3. WHEN 客户端组件需要权限检查 THEN THE System SHALL 仅在特殊场景下使用 ProtectedRoute Component
4. WHEN 多个页面需要相同的权限检查 THEN THE System SHALL 避免在每个页面重复实现权限逻辑
5. WHEN 权限检查逻辑更新 THEN THE System SHALL 确保所有受保护路由自动应用新逻辑

### Requirement 4

**User Story:** 作为系统用户，我希望首页能够根据系统设置决定是否需要登录访问，并且权限检查在服务端完成，以避免页面闪烁。

#### Acceptance Criteria

1. WHEN 系统设置允许匿名访问首页 THEN THE System SHALL 允许未认证用户访问首页
2. WHEN 系统设置不允许匿名访问首页 THEN THE System SHALL 在服务端重定向未认证用户到登录页
3. WHEN 首页权限检查执行 THEN THE System SHALL 在服务端查询系统设置
4. WHEN 首页权限检查完成 THEN THE System SHALL 不在客户端显示权限检查的加载状态
5. WHEN 已认证用户访问首页 THEN THE System SHALL 直接渲染首页内容而不检查系统设置

### Requirement 5

**User Story:** 作为开发人员，我希望将 Admin Layout 转换为 Server Component，以便在服务端执行权限检查和数据获取，提升性能。

#### Acceptance Criteria

1. WHEN Admin Layout 组件渲染 THEN THE System SHALL 在服务端执行权限检查
2. WHEN Admin Layout 需要用户会话信息 THEN THE System SHALL 使用服务端会话获取方法
3. WHEN Admin Layout 权限检查失败 THEN THE System SHALL 使用 Next.js redirect 函数执行服务端重定向
4. WHEN Admin Layout 包含客户端交互组件 THEN THE System SHALL 将这些组件标记为 Client Component
5. WHEN Admin Layout 渲染 THEN THE System SHALL 不使用客户端状态管理库获取认证状态

### Requirement 6

**User Story:** 作为系统用户，我希望系统减少不必要的 API 请求，特别是在权限检查失败时，以节省网络资源和提升响应速度。

#### Acceptance Criteria

1. WHEN 用户访问受保护页面 THEN THE System SHALL 在权限检查通过前不执行任何数据获取 API 请求
2. WHEN 服务端权限检查失败 THEN THE System SHALL 不加载页面组件的客户端代码
3. WHEN 首页权限检查执行 THEN THE System SHALL 避免重复调用系统设置 API
4. WHEN 用户会话状态已知 THEN THE System SHALL 不重复验证用户认证状态
5. WHEN 页面组件加载 THEN THE System SHALL 确保权限检查已在服务端完成

### Requirement 7

**User Story:** 作为开发人员，我希望保留 ProtectedRoute 组件用于特殊的客户端权限场景，但简化其实现，以保持代码灵活性。

#### Acceptance Criteria

1. WHEN ProtectedRoute Component 使用 THEN THE System SHALL 仅在 Middleware 无法处理的场景下使用
2. WHEN ProtectedRoute Component 检查权限 THEN THE System SHALL 假设基本认证已由 Middleware 验证
3. WHEN ProtectedRoute Component 渲染 THEN THE System SHALL 提供清晰的加载状态反馈
4. WHEN ProtectedRoute Component 重定向 THEN THE System SHALL 保留原始请求路径作为回调参数
5. WHEN ProtectedRoute Component 更新 THEN THE System SHALL 移除与 Middleware 重复的权限检查逻辑

### Requirement 8

**User Story:** 作为系统架构师，我希望系统的权限检查机制具有良好的可扩展性，以便未来添加新的权限规则时能够轻松实现。

#### Acceptance Criteria

1. WHEN 新的受保护路由添加 THEN THE System SHALL 通过配置 Middleware matcher 自动应用权限检查
2. WHEN 新的权限规则定义 THEN THE System SHALL 在 Middleware 的 authorized 回调中集中实现
3. WHEN 权限检查逻辑复杂化 THEN THE System SHALL 支持将权限检查逻辑提取为独立的工具函数
4. WHEN 不同路由需要不同权限级别 THEN THE System SHALL 在 Middleware 中根据路径模式应用不同的检查规则
5. WHEN 权限检查需要外部数据 THEN THE System SHALL 支持在服务端异步获取权限相关数据
