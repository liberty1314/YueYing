# System Settings Page

系统设置管理页面，用于配置全局功能开关和访问控制。

## 功能特性

### 1. 功能开关
- **启用探索/推荐功能**：控制用户是否可以访问探索页面
- **启用数据统计页面**：控制用户是否可以访问统计分析页面
- **启用 AI 助手页面**：控制用户是否可以使用 AI 助手功能

### 2. 用户权限
- **允许用户自定义 AI 标签设置**：控制用户是否可以在个人设置中配置 AI 标签偏好

### 3. 访问控制
- **允许未登录用户访问首页**：控制未登录用户是否可以浏览首页内容

## 技术实现

### 组件结构
```
/admin/system/page.tsx
├── useAdminSystemSettings (获取设置)
├── useUpdateSystemSettings (更新设置)
└── ConfigForm (通用配置表单组件)
```

### 数据流
1. 使用 `useAdminSystemSettings` hook 从后端获取当前设置
2. 使用 `ConfigForm` 组件渲染表单，按类别分组显示
3. 用户修改设置后，通过 `useUpdateSystemSettings` 提交更新
4. 更新成功后，触发 `SYSTEM_SETTINGS_UPDATED` 事件，通知其他组件刷新

### API 端点
- **GET** `/api/system-settings` - 获取系统设置（需要登录）
- **PUT** `/api/system-settings` - 更新系统设置（仅管理员）

## 字段配置

所有字段都使用 `switch` 类型，提供开关控制：

```typescript
{
  name: 'enable_explore',
  label: '启用探索/推荐功能',
  type: 'switch',
  helpText: '启用后，用户可以访问探索页面查看个性化推荐内容',
  section: '功能开关',
}
```

## 分组说明

### 功能开关 (Feature Toggles)
控制主要功能模块的启用状态，影响用户可访问的页面和功能。

### 用户权限 (User Permissions)
控制用户可以自定义的设置范围，影响用户设置页面的可用选项。

### 访问控制 (Access Control)
控制未登录用户的访问权限，影响公开页面的可见性。

## 环境变量

系统设置支持通过环境变量进行初始化配置：

```bash
# .env
DEFAULT_ENABLE_EXPLORE=false
DEFAULT_ALLOW_USER_AI_TAG_SETTINGS=true
DEFAULT_ALLOW_ANONYMOUS_HOME_ACCESS=true
DEFAULT_ENABLE_STATS=true
DEFAULT_ENABLE_AI_ASSISTANT=true
```

**注意**：
- 环境变量仅在数据库中没有设置记录时生效
- 一旦通过管理页面保存设置，将以数据库中的值为准
- 如果需要强制使用环境变量，需要设置 `FORCE_ENV_SYSTEM_SETTINGS=true`

## 使用示例

### 访问页面
```
http://localhost:3000/admin/system
```

### 修改设置
1. 访问系统设置页面
2. 切换相应的开关
3. 点击"保存配置"按钮
4. 系统会显示成功提示，设置立即生效

### 验证设置
设置保存后，可以通过以下方式验证：
1. 退出登录，检查未登录用户是否可以访问首页
2. 访问探索页面，检查功能是否可用
3. 访问统计页面，检查功能是否可用
4. 访问 AI 助手页面，检查功能是否可用

## 错误处理

### 加载失败
如果获取设置失败，页面会显示错误提示，包含错误原因。

### 保存失败
如果保存设置失败，会显示 Toast 错误提示，用户可以重试。

### 权限不足
如果非管理员用户尝试访问此页面，会被重定向到登录页面。

## 相关文件

- `frontend/src/hooks/useAdminSystemSettings.ts` - 系统设置管理 Hook
- `frontend/src/components/admin/ConfigForm.tsx` - 通用配置表单组件
- `backend/app/api/routes/system_settings.py` - 后端 API 路由
- `backend/app/models/system_settings.py` - 数据库模型
- `backend/app/schemas/system_settings.py` - API Schema

## 验证需求

此页面实现了以下需求：
- **需求 15.5**：保留所有现有的系统设置功能（配置系统参数）
- **需求 6.2**：为每个字段提供清晰的标签和帮助文本
- **需求 6.6**：将相关字段分组并使用卡片区分
- **需求 6.7**：表单提交成功时显示成功提示
- **需求 6.8**：表单提交失败时显示错误提示
