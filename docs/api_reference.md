# API 接口文档

## 系统设置 API

### 获取公开系统设置

**接口地址**: `GET /api/system-settings/public`

**描述**: 获取公开的系统设置（无需登录）

**请求参数**: 无

**返回示例**:
```json
{
  "allow_anonymous_home_access": true,
  "enable_explore": false,
  "enable_stats": true,
  "enable_ai_assistant": true
}
```

**字段说明**:
- `allow_anonymous_home_access` (boolean): 是否允许未登录用户访问首页
- `enable_explore` (boolean): 是否启用探索/推荐功能
- `enable_stats` (boolean): 是否启用数据统计页面
- `enable_ai_assistant` (boolean): 是否启用AI助手页面

---

### 获取系统设置

**接口地址**: `GET /api/system-settings`

**描述**: 获取完整的系统设置（需要登录）

**请求头**:
- `Authorization`: Bearer {access_token}

**请求参数**: 无

**返回示例**:
```json
{
  "id": 1,
  "enable_explore": false,
  "allow_user_ai_tag_settings": true,
  "allow_anonymous_home_access": true,
  "enable_stats": true,
  "enable_ai_assistant": true
}
```

**字段说明**:
- `id` (integer): 设置记录ID
- `enable_explore` (boolean): 是否启用探索/推荐功能
- `allow_user_ai_tag_settings` (boolean): 是否允许用户自行设置 AI 自动标签
- `allow_anonymous_home_access` (boolean): 是否允许未登录用户访问首页
- `enable_stats` (boolean): 是否启用数据统计页面
- `enable_ai_assistant` (boolean): 是否启用AI助手页面

---

### 更新系统设置

**接口地址**: `PUT /api/system-settings`

**描述**: 更新系统设置（仅管理员）

**请求头**:
- `Authorization`: Bearer {access_token}
- `Content-Type`: application/json

**请求参数**:
```json
{
  "enable_explore": false,
  "allow_user_ai_tag_settings": true,
  "allow_anonymous_home_access": true,
  "enable_stats": true,
  "enable_ai_assistant": true
}
```

**参数说明**:
- `enable_explore` (boolean, 可选): 是否启用探索/推荐功能
- `allow_user_ai_tag_settings` (boolean, 可选): 是否允许用户自行设置 AI 自动标签
- `allow_anonymous_home_access` (boolean, 可选): 是否允许未登录用户访问首页
- `enable_stats` (boolean, 可选): 是否启用数据统计页面
- `enable_ai_assistant` (boolean, 可选): 是否启用AI助手页面

**返回示例**:
```json
{
  "id": 1,
  "enable_explore": false,
  "allow_user_ai_tag_settings": true,
  "allow_anonymous_home_access": true,
  "enable_stats": true,
  "enable_ai_assistant": true
}
```

**错误码**:
- `401`: 未授权（未登录或token无效）
- `403`: 禁止访问（非管理员用户）
- `404`: 系统设置不存在
- `500`: 服务器内部错误

---

## 注意事项

1. **环境变量优先级**: 
   - 如果设置了 `FORCE_READ_ENV_SETTINGS=true`，系统将忽略数据库配置，强制使用环境变量中的默认值
   - 首次启动时，如果数据库中没有设置记录，会自动从环境变量创建默认设置

2. **功能开关说明**:
   - `enable_stats`: 控制用户是否可以访问数据统计页面（`/stats`）
   - `enable_ai_assistant`: 控制用户是否可以访问AI助手页面（`/assistant`）
   - 关闭这些功能后，对应的导航菜单项将被隐藏，直接访问URL会被重定向

3. **缓存处理**:
   - 更新系统设置后，前端会自动清除缓存
   - 系统会触发 `SYSTEM_SETTINGS_UPDATED` 事件，通知相关组件更新

---

**最后更新**: 2025-12-25
**维护者**: YueYing Development Team
