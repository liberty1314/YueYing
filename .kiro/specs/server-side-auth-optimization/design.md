# Design Document

## Overview

本设计文档描述了服务端权限检查优化功能的技术实现方案。该功能旨在通过将权限检查从客户端迁移到服务端，消除"先加载再重定向"的用户体验问题，提升页面跳转的流畅度，并减少不必要的 API 请求。

核心设计理念：
- **服务端优先**：在 Next.js Middleware 和 Server Components 中执行权限检查
- **统一入口**：使用 Middleware 作为主要的权限验证层
- **渐进增强**：保留客户端权限组件用于特殊场景
- **性能优化**：避免不必要的组件渲染和 API 请求

## Architecture

### 权限检查层次结构

```
请求流程：
1. 用户请求 → Next.js Middleware (服务端)
   ├─ 检查 session token
   ├─ 匹配路由规则
   └─ 决定：允许通过 / 重定向

2. 通过 Middleware → Server Component (服务端)
   ├─ 获取 session 数据
   ├─ 执行细粒度权限检查（如管理员角色）
   └─ 决定：渲染内容 / 服务端重定向

3. Server Component → Client Component (客户端)
   └─ 渲染交互式 UI（权限已验证）
```

### 组件架构

```
frontend/
├── middleware.ts                    # 主要权限检查入口
├── app/
│   ├── admin/
│   │   └── layout.tsx              # Server Component (管理员权限)
│   ├── page.tsx                    # Server Component (首页访问控制)
│   └── ...                         # 其他受保护页面
├── components/
│   └── auth/
│       └── ProtectedRoute.tsx      # Client Component (特殊场景)
└── lib/
    └── auth/
        ├── server-auth.ts          # 服务端认证工具函数
        └── middleware-helpers.ts   # Middleware 辅助函数
```

## Components and Interfaces

### 1. Next.js Middleware 增强

**文件**: `frontend/middleware.ts`

**职责**:
- 作为所有请求的第一道权限检查
- 验证用户 session token
- 根据路由规则决定是否允许访问
- 处理公开路由、受保护路由和管理员路由

**接口**:
```typescript
// Middleware 配置
export const config = {
  matcher: string[]  // 路由匹配规则
}

// Middleware 函数
export default withAuth(
  middleware: (req: NextRequest) => NextResponse,
  options: {
    callbacks: {
      authorized: (params: {
        token: JWT | null
        req: NextRequest
      }) => boolean
    },
    pages: {
      signIn: string
    }
  }
)
```

**路由规则**:
- 公开路由: `/login`, `/register`
- 首页: `/` (需要查询系统设置)
- 管理员路由: `/admin/*` (需要管理员角色)
- 其他路由: 需要认证

### 2. 服务端认证工具模块

**文件**: `frontend/lib/auth/server-auth.ts`

**职责**:
- 提供服务端获取 session 的工具函数
- 提供角色检查函数（如 isAdmin）
- 提供系统设置查询函数（用于首页访问控制）

**接口**:
```typescript
// 获取服务端 session
export async function getServerSession(): Promise<Session | null>

// 检查是否为管理员
export async function isAdmin(session: Session | null): Promise<boolean>

// 检查首页是否允许匿名访问
export async function isHomeAccessAllowed(session: Session | null): Promise<boolean>

// 服务端重定向辅助函数
export function redirectToLogin(callbackUrl?: string): never
export function redirectToHome(): never
```

### 3. Middleware 辅助函数模块

**文件**: `frontend/lib/auth/middleware-helpers.ts`

**职责**:
- 提供路由匹配辅助函数
- 提供权限检查辅助函数
- 集中管理路由规则配置

**接口**:
```typescript
// 路由规则配置
export const ROUTE_RULES = {
  public: string[]      // 公开路由
  admin: string[]       // 管理员路由
  protected: string[]   // 受保护路由（可选，默认所有非公开路由）
}

// 路由匹配函数
export function isPublicRoute(pathname: string): boolean
export function isAdminRoute(pathname: string): boolean
export function isHomeRoute(pathname: string): boolean

// 构建重定向 URL
export function buildLoginUrl(callbackUrl: string): string
```

### 4. Admin Layout (Server Component)

**文件**: `frontend/app/admin/layout.tsx`

**职责**:
- 在服务端验证管理员权限
- 渲染管理后台布局
- 处理未授权访问

**实现**:
```typescript
// Server Component (移除 "use client")
export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const session = await getServerSession()
  
  // 服务端权限检查
  if (!session) {
    redirect('/login?callbackUrl=/admin')
  }
  
  if (!await isAdmin(session)) {
    redirect('/')
  }
  
  // 权限验证通过，渲染布局
  return (
    <>
      <AdminSidebar />
      <main className="ml-64 min-h-[calc(100vh-4rem)] bg-background">
        <div className="container mx-auto p-6 max-w-5xl">
          {children}
        </div>
      </main>
    </>
  )
}
```

**注意**: AdminSidebar 如果包含客户端交互，需要标记为 Client Component。

### 5. 首页 (Server Component)

**文件**: `frontend/app/page.tsx`

**职责**:
- 在服务端检查首页访问权限
- 根据系统设置决定是否允许匿名访问
- 渲染首页内容

**实现**:
```typescript
// Server Component (移除 "use client")
export default async function HomePage() {
  const session = await getServerSession()
  
  // 服务端访问控制检查
  if (!session) {
    const allowed = await isHomeAccessAllowed(null)
    if (!allowed) {
      redirect('/login')
    }
  }
  
  // 权限验证通过，渲染首页
  // 注意：数据获取逻辑需要在服务端完成或使用 Client Component
  return <HomeContent />
}
```

**数据获取策略**:
- 选项 1: 在 Server Component 中获取数据并传递给 Client Component
- 选项 2: 将数据获取逻辑移到 Client Component 中（使用 React Query）

### 6. ProtectedRoute Component (简化版)

**文件**: `frontend/components/auth/ProtectedRoute.tsx`

**职责**:
- 仅用于 Middleware 无法处理的特殊客户端权限场景
- 提供加载状态反馈
- 处理客户端权限检查

**使用场景**:
- 动态权限检查（基于用户数据）
- 需要客户端状态的权限判断
- 嵌套在其他 Client Component 中的权限保护

**简化原则**:
- 假设基本认证已由 Middleware 验证
- 移除与 Middleware 重复的逻辑
- 专注于特殊场景的权限检查

## Data Models

### Session 数据结构

```typescript
interface Session {
  user: {
    id: string
    username: string
    email: string
    is_admin: boolean
    is_active: boolean
  }
  expires: string
}
```

### 系统设置数据结构

```typescript
interface SystemSettings {
  allow_anonymous_home_access: boolean
  // 其他系统设置...
}
```

### 路由规则配置

```typescript
interface RouteRules {
  public: string[]      // 公开路由列表
  admin: string[]       // 管理员路由模式
  protected: string[]   // 受保护路由模式（可选）
}
```


## Correctness Properties

*A property is a characteristic or behavior that should hold true across all valid executions of a system-essentially, a formal statement about what the system should do. Properties serve as the bridge between human-readable specifications and machine-verifiable correctness guarantees.*

基于需求分析，以下是可测试的正确性属性：

### Property 1: 未认证用户访问受保护路由返回重定向

*For any* 受保护路由路径和未认证请求，Middleware 应返回 302 重定向响应
**Validates: Requirements 1.1**

### Property 2: 重定向 URL 包含回调参数

*For any* 原始请求路径，当未认证用户被重定向时，重定向 URL 应包含原始路径作为 callbackUrl 参数
**Validates: Requirements 1.2**

### Property 3: 已认证用户访问受保护路由成功

*For any* 受保护路由路径和有效的认证 token，Middleware 应允许请求通过（返回 200 或允许继续）
**Validates: Requirements 1.4**

### Property 4: 非管理员访问管理员路由被重定向

*For any* 管理员路由路径和非管理员 session，系统应返回重定向响应
**Validates: Requirements 2.1**

### Property 5: 管理员访问管理员路由成功

*For any* 管理员路由路径和管理员 session，系统应允许访问
**Validates: Requirements 2.4**

### Property 6: 首页访问控制遵循系统设置（允许匿名）

*For any* 未认证用户，当系统设置允许匿名访问首页时，系统应允许访问首页
**Validates: Requirements 4.1**

### Property 7: 首页访问控制遵循系统设置（禁止匿名）

*For any* 未认证用户，当系统设置不允许匿名访问首页时，系统应重定向到登录页
**Validates: Requirements 4.2**

### Property 8: ProtectedRoute 组件保留回调参数

*For any* 使用 ProtectedRoute 组件的页面，当组件执行重定向时，应在重定向 URL 中保留原始请求路径作为回调参数
**Validates: Requirements 7.4**

### Property 9: 路由权限规则正确应用

*For any* 路由路径和权限级别组合，Middleware 应根据路径模式应用正确的权限检查规则
**Validates: Requirements 8.4**

## Error Handling

### 1. Session 获取失败

**场景**: 服务端无法获取或解析 session token

**处理策略**:
- 将用户视为未认证
- 执行相应的重定向逻辑
- 记录错误日志（不暴露给用户）

### 2. 系统设置 API 调用失败

**场景**: 首页访问控制需要查询系统设置，但 API 调用失败

**处理策略**:
- 使用安全的默认值（默认不允许匿名访问）
- 记录错误日志
- 对已认证用户不受影响

**实现**:
```typescript
async function isHomeAccessAllowed(session: Session | null): Promise<boolean> {
  if (session) {
    return true  // 已认证用户总是允许
  }
  
  try {
    const settings = await getSystemSettings()
    return settings.allow_anonymous_home_access
  } catch (error) {
    console.error('Failed to fetch system settings:', error)
    return false  // 安全默认值：不允许匿名访问
  }
}
```

### 3. Middleware 执行异常

**场景**: Middleware 中的权限检查逻辑抛出异常

**处理策略**:
- 捕获异常并记录
- 返回安全的默认响应（重定向到登录页）
- 避免暴露内部错误信息

**实现**:
```typescript
export default withAuth(
  function middleware(req) {
    try {
      // 权限检查逻辑
      return NextResponse.next()
    } catch (error) {
      console.error('Middleware error:', error)
      return NextResponse.redirect(new URL('/login', req.url))
    }
  },
  // ...
)
```

### 4. 服务端重定向失败

**场景**: Server Component 中调用 `redirect()` 函数失败

**处理策略**:
- Next.js 的 `redirect()` 会抛出特殊的错误来触发重定向
- 不应捕获这个错误
- 其他错误应该被捕获并处理

**实现**:
```typescript
export default async function AdminLayout({ children }) {
  try {
    const session = await getServerSession()
    
    if (!session) {
      redirect('/login?callbackUrl=/admin')  // 这会抛出特殊错误
    }
    
    // 其他逻辑...
  } catch (error) {
    // 不要捕获 redirect 错误
    if (error instanceof Error && error.message === 'NEXT_REDIRECT') {
      throw error
    }
    
    // 处理其他错误
    console.error('Admin layout error:', error)
    redirect('/')
  }
}
```

### 5. 角色检查失败

**场景**: 无法确定用户是否为管理员

**处理策略**:
- 使用安全的默认值（视为非管理员）
- 记录错误日志
- 重定向到安全的页面（首页）

## Testing Strategy

本功能采用双重测试策略，结合单元测试和基于属性的测试，以确保全面的测试覆盖。

### 单元测试

单元测试用于验证特定场景和边界情况：

**测试范围**:
1. **Middleware 辅助函数测试**
   - 测试路由匹配函数（`isPublicRoute`, `isAdminRoute`, `isHomeRoute`）
   - 测试 URL 构建函数（`buildLoginUrl`）
   - 测试边界情况（空路径、特殊字符等）

2. **服务端认证工具测试**
   - 测试 `getServerSession` 在不同场景下的行为
   - 测试 `isAdmin` 函数的角色判断逻辑
   - 测试 `isHomeAccessAllowed` 的系统设置查询逻辑

3. **特定场景测试**
   - 未认证用户访问 `/admin` 应重定向到 `/login`
   - 已认证但非管理员用户访问 `/admin` 应重定向到 `/`
   - 系统设置为允许匿名访问时，未认证用户可以访问首页

4. **错误处理测试**
   - 系统设置 API 失败时的降级行为
   - Session 解析失败时的处理
   - Middleware 异常时的安全默认行为

### 基于属性的测试 (Property-Based Testing)

基于属性的测试用于验证系统在各种输入下的通用正确性：

**测试框架**: 使用 `fast-check` 库（JavaScript/TypeScript 的 PBT 库）

**测试配置**: 每个属性测试运行至少 100 次迭代

**测试范围**:

1. **Property 1: 未认证用户访问受保护路由返回重定向**
   - 生成器：随机受保护路由路径
   - 验证：Middleware 返回 302 重定向响应
   - 标签：`**Feature: server-side-auth-optimization, Property 1: 未认证用户访问受保护路由返回重定向**`

2. **Property 2: 重定向 URL 包含回调参数**
   - 生成器：随机原始请求路径
   - 验证：重定向 URL 包含正确的 callbackUrl 参数
   - 标签：`**Feature: server-side-auth-optimization, Property 2: 重定向 URL 包含回调参数**`

3. **Property 3: 已认证用户访问受保护路由成功**
   - 生成器：随机受保护路由路径 + 有效 token
   - 验证：Middleware 允许请求通过
   - 标签：`**Feature: server-side-auth-optimization, Property 3: 已认证用户访问受保护路由成功**`

4. **Property 4: 非管理员访问管理员路由被重定向**
   - 生成器：随机管理员路由路径 + 非管理员 session
   - 验证：返回重定向响应
   - 标签：`**Feature: server-side-auth-optimization, Property 4: 非管理员访问管理员路由被重定向**`

5. **Property 5: 管理员访问管理员路由成功**
   - 生成器：随机管理员路由路径 + 管理员 session
   - 验证：允许访问
   - 标签：`**Feature: server-side-auth-optimization, Property 5: 管理员访问管理员路由成功**`

6. **Property 6-7: 首页访问控制遵循系统设置**
   - 生成器：随机系统设置（允许/禁止匿名访问）
   - 验证：访问控制行为符合设置
   - 标签：`**Feature: server-side-auth-optimization, Property 6-7: 首页访问控制遵循系统设置**`

7. **Property 8: ProtectedRoute 组件保留回调参数**
   - 生成器：随机页面路径
   - 验证：重定向 URL 包含回调参数
   - 标签：`**Feature: server-side-auth-optimization, Property 8: ProtectedRoute 组件保留回调参数**`

8. **Property 9: 路由权限规则正确应用**
   - 生成器：随机路由路径 + 权限级别组合
   - 验证：应用正确的权限检查规则
   - 标签：`**Feature: server-side-auth-optimization, Property 9: 路由权限规则正确应用**`

**生成器设计**:
- 路径生成器：生成有效的 URL 路径（包括嵌套路径、查询参数等）
- Session 生成器：生成有效的 session 对象（包括管理员和非管理员）
- Token 生成器：生成有效和无效的 JWT token
- 系统设置生成器：生成不同的系统设置组合

**测试隔离**:
- 使用 mock 隔离外部依赖（NextAuth、系统设置 API）
- 每个测试独立运行，不共享状态
- 使用测试数据库或 mock 数据

### 集成测试

虽然不是本 spec 的重点，但建议进行以下集成测试：

1. **端到端权限流程测试**
   - 使用 Playwright 或 Cypress
   - 测试完整的用户登录和访问流程
   - 验证页面不会出现 Loading 闪烁

2. **性能测试**
   - 测量权限检查的响应时间
   - 验证 API 请求数量减少
   - 测量页面加载时间改善

## Implementation Notes

### 1. Next.js 版本要求

- 需要 Next.js 13+ (App Router)
- 需要 NextAuth.js v4+
- 确保 `next-auth/middleware` 可用

### 2. 服务端组件迁移注意事项

**从 Client Component 迁移到 Server Component**:

1. 移除 `"use client"` 指令
2. 将 `useSession()` 替换为 `getServerSession()`
3. 将 `useRouter()` 的 `router.push()` 替换为 `redirect()`
4. 将客户端状态管理（Zustand）替换为服务端数据获取
5. 将需要客户端交互的子组件标记为 Client Component

**数据获取策略**:
- 选项 1: 在 Server Component 中获取数据，传递给 Client Component
- 选项 2: 使用 Server Actions 进行数据变更
- 选项 3: 在 Client Component 中使用 React Query 获取数据

### 3. Middleware 性能优化

**缓存策略**:
- 考虑缓存系统设置查询结果（用于首页访问控制）
- 使用 Next.js 的 `unstable_cache` 或 Redis 缓存
- 设置合理的缓存过期时间（如 5 分钟）

**示例**:
```typescript
import { unstable_cache } from 'next/cache'

const getSystemSettings = unstable_cache(
  async () => {
    const response = await fetch(`${API_URL}/system-settings/public`)
    return response.json()
  },
  ['system-settings'],
  { revalidate: 300 }  // 5 分钟缓存
)
```

### 4. 渐进式迁移策略

为了降低风险，建议采用渐进式迁移：

**阶段 1**: 增强 Middleware
- 实现完整的 Middleware 权限检查逻辑
- 添加辅助函数和工具模块
- 保持现有的客户端权限检查不变

**阶段 2**: 迁移 Admin Layout
- 将 Admin Layout 转换为 Server Component
- 测试管理后台的所有功能
- 确保没有回归问题

**阶段 3**: 迁移首页
- 将首页转换为 Server Component
- 处理数据获取逻辑
- 测试匿名访问和认证访问

**阶段 4**: 简化 ProtectedRoute
- 移除与 Middleware 重复的逻辑
- 更新文档说明使用场景
- 清理不再需要的代码

**阶段 5**: 清理和优化
- 移除废弃的客户端权限检查代码
- 优化性能（缓存、减少 API 调用）
- 更新相关文档

### 5. 向后兼容性

**保持兼容**:
- 保留 ProtectedRoute 组件用于特殊场景
- 不破坏现有的 API 接口
- 确保登录回调机制继续工作

**废弃通知**:
- 在代码注释中标记废弃的模式
- 提供迁移指南
- 在控制台输出警告（开发环境）

### 6. 测试环境配置

**Mock NextAuth**:
```typescript
// __mocks__/next-auth/react.ts
export const useSession = jest.fn()
export const signIn = jest.fn()
export const signOut = jest.fn()

// __mocks__/next-auth.ts
export const getServerSession = jest.fn()
```

**Mock Next.js Navigation**:
```typescript
// __mocks__/next/navigation.ts
export const redirect = jest.fn()
export const useRouter = jest.fn()
export const usePathname = jest.fn()
```

### 7. 监控和日志

**关键指标**:
- 权限检查失败率
- 重定向响应时间
- 系统设置 API 调用次数
- 页面加载时间

**日志记录**:
- 记录所有权限检查失败的情况
- 记录异常和错误
- 使用结构化日志格式

**示例**:
```typescript
console.log({
  event: 'auth_check_failed',
  path: req.nextUrl.pathname,
  reason: 'no_session',
  timestamp: new Date().toISOString()
})
```

## Migration Guide

### 从客户端权限检查迁移到服务端

**步骤 1: 识别需要迁移的组件**

查找使用以下模式的组件：
- `useSession()` + `useEffect()` + `router.push()`
- `useAuthStore()` + 权限检查
- `ProtectedRoute` 包裹的页面

**步骤 2: 评估迁移可行性**

- ✅ 可以迁移：页面级组件、布局组件
- ⚠️ 需要调整：包含大量客户端交互的组件
- ❌ 不建议迁移：纯客户端组件、动态权限检查

**步骤 3: 执行迁移**

1. 移除 `"use client"` 指令
2. 将函数改为 `async`
3. 替换 hooks 为服务端 API
4. 测试功能是否正常

**步骤 4: 处理客户端交互**

将需要客户端交互的部分提取为独立的 Client Component：

```typescript
// app/admin/layout.tsx (Server Component)
export default async function AdminLayout({ children }) {
  const session = await getServerSession()
  if (!session || !session.user.is_admin) {
    redirect('/login')
  }
  
  return (
    <>
      <AdminSidebarClient />  {/* Client Component */}
      <main>{children}</main>
    </>
  )
}

// components/admin/AdminSidebarClient.tsx (Client Component)
'use client'
export function AdminSidebarClient() {
  // 客户端交互逻辑
}
```

### 常见问题和解决方案

**问题 1**: Server Component 中无法使用 `useState` 或其他 hooks

**解决方案**: 将需要状态的部分提取为 Client Component

**问题 2**: 数据获取逻辑依赖客户端 API

**解决方案**: 
- 选项 1: 在 Server Component 中直接调用后端 API
- 选项 2: 将数据获取移到 Client Component 中

**问题 3**: `redirect()` 在 try-catch 中被捕获

**解决方案**: 检查错误类型，重新抛出 redirect 错误

**问题 4**: Middleware 中无法访问数据库

**解决方案**: 
- 使用 API 调用获取必要数据
- 考虑使用缓存减少 API 调用
- 将复杂的权限检查移到 Server Component

## Conclusion

本设计文档提供了服务端权限检查优化的完整技术方案。通过将权限检查从客户端迁移到服务端，我们可以：

1. **消除 Loading 闪烁**：用户不再看到"加载-重定向"的过程
2. **提升性能**：减少不必要的组件渲染和 API 请求
3. **统一权限逻辑**：使用 Middleware 作为主要的权限检查入口
4. **提高可维护性**：避免重复的权限检查代码
5. **增强安全性**：在服务端验证权限，防止客户端绕过

实施时应采用渐进式迁移策略，确保每个阶段都经过充分测试，避免影响现有功能。
