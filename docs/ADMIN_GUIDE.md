# 管理员指南

本指南介绍如何使用悦影（YueYing）平台的管理员功能。

## 目录

- [管理员角色说明](#管理员角色说明)
- [创建第一个管理员](#创建第一个管理员)
- [管理员 API 列表](#管理员-api-列表)
- [权限检查机制](#权限检查机制)
- [常见操作示例](#常见操作示例)

---

## 管理员角色说明

### 角色类型

悦影平台支持两种用户角色：

1. **普通用户（user）**：默认角色
   - 可以管理自己的记录、标签、收藏等
   - 可以使用 AI 助手和推荐功能
   - 无法访问管理后台

2. **管理员（admin）**：具有完整的管理权限
   - 拥有普通用户的所有权限
   - 可以管理所有用户账号
   - 可以访问后台统计数据
   - 可以配置系统设置（LLM、外部 API 等）
   - 可以执行系统级操作（如重建索引）

### 权限特点

- 管理员和普通用户使用同一个登录接口
- 管理员权限通过 `get_current_admin` 依赖进行检查
- 所有管理员操作都会记录日志（审计追踪）
- 管理员不能修改自己的角色或禁用自己

---

## 创建第一个管理员

### 方法一：使用 CLI 工具（推荐）

在后端容器中运行以下命令：

```bash
docker exec -it yueying-backend python scripts/create_admin.py
```

按照提示输入信息：

```
============================================
创建管理员账号
============================================
请输入管理员邮箱: admin@example.com
请输入管理员密码（至少6位）: ******
请再次输入密码确认: ******
请输入用户名（可选，直接回车跳过）: admin
请输入全名（可选，直接回车跳过）: Administrator

正在创建管理员账号...

============================================
✅ 管理员账号创建成功！
============================================
```

### 方法二：使用环境变量

在运行 CLI 工具时提供环境变量：

```bash
docker exec -it yueying-backend \
  ADMIN_EMAIL=admin@example.com \
  ADMIN_PASSWORD=secret123 \
  ADMIN_USERNAME=admin \
  python scripts/create_admin.py
```

### 方法三：通过 API（需要已有管理员权限）

已有管理员可以创建新的管理员账号：

```bash
POST /api/admin/users/create-admin
Authorization: Bearer <admin_token>

{
  "email": "newadmin@example.com",
  "password": "password123",
  "username": "newadmin",
  "full_name": "New Admin"
}
```

---

## 管理员 API 列表

所有管理员 API 都需要在请求头中携带 Bearer Token：

```
Authorization: Bearer <your_admin_token>
```

### 用户管理 API

#### 1. 获取用户列表

```http
GET /api/admin/users
```

查询参数：
- `page`: 页码（默认 1）
- `page_size`: 每页数量（默认 20，最大 100）
- `search`: 搜索关键词（匹配邮箱、用户名、全名）
- `role`: 角色筛选（`user` 或 `admin`）
- `is_active`: 状态筛选（`true` 或 `false`）
- `sort_by`: 排序字段（默认 `created_at`）
- `sort_desc`: 是否降序（默认 `true`）

响应示例：

```json
{
  "users": [
    {
      "id": 1,
      "email": "admin@admin.com",
      "username": "admin",
      "full_name": "Administrator",
      "role": "admin",
      "is_active": true,
      "is_verified": true,
      "created_at": "2024-01-01T00:00:00Z",
      "updated_at": "2024-01-01T00:00:00Z"
    }
  ],
  "total": 1,
  "page": 1,
  "page_size": 20
}
```

#### 2. 获取用户详情

```http
GET /api/admin/users/{user_id}
```

#### 3. 更新用户信息

```http
PUT /api/admin/users/{user_id}
Content-Type: application/json

{
  "email": "newemail@example.com",
  "username": "newusername",
  "full_name": "New Name",
  "role": "admin",
  "is_active": true
}
```

注意：所有字段都是可选的，只更新提供的字段。

#### 4. 切换用户状态

```http
POST /api/admin/users/{user_id}/toggle-status
```

快速激活/禁用用户账号。

#### 5. 删除用户

```http
DELETE /api/admin/users/{user_id}?hard_delete=false
```

查询参数：
- `hard_delete`: 是否硬删除（默认 `false`，进行软删除）

软删除：将用户设置为禁用状态，数据保留
硬删除：从数据库中完全删除用户及其所有数据

#### 6. 创建管理员账号

```http
POST /api/admin/users/create-admin
Content-Type: application/json

{
  "email": "newadmin@example.com",
  "password": "password123",
  "username": "newadmin",
  "full_name": "New Admin"
}
```

### 统计数据 API

#### 获取后台统计数据

```http
GET /api/admin/stats
```

响应示例：

```json
{
  "users": {
    "total": 100,
    "active": 95,
    "admin": 3,
    "new_7d": 10,
    "active_30d": 80,
    "role_distribution": {
      "user": 97,
      "admin": 3
    }
  },
  "content": {
    "total_items": 1500,
    "total_conversations": 200,
    "total_summaries": 50
  },
  "timestamp": "2024-01-01T12:00:00Z"
}
```

### 系统配置 API

#### LLM 配置管理

```http
GET /api/llm-config          # 获取 LLM 配置
PUT /api/llm-config          # 更新 LLM 配置
POST /api/llm-config/test    # 测试 LLM 连接
```

#### 系统设置管理

```http
GET /api/system-settings     # 获取系统设置（所有用户可访问）
PUT /api/system-settings     # 更新系统设置（仅管理员）
```

### 系统操作 API

#### 重建 RAG 索引

```http
POST /api/rag/rebuild-index
Content-Type: application/json

{
  "user_id": 1  # 可选，指定用户ID或留空重建所有
}
```

注意：这是一个重量级操作，可能需要较长时间。

---

## 权限检查机制

### FastAPI 依赖注入

悦影平台使用 FastAPI 的依赖注入系统进行权限检查：

```python
from app.api.dependencies.auth import get_current_admin

@router.get("/admin/users")
def list_users(
    current_admin: User = Depends(get_current_admin),
    db: Session = Depends(get_db)
):
    # 只有管理员可以访问
    ...
```

### 权限验证流程

1. 客户端在请求头中携带 Bearer Token
2. `get_current_admin` 依赖验证 Token
3. 检查用户的 `role` 字段是否为 `admin`
4. 如果不是管理员，返回 403 Forbidden
5. 如果是管理员，继续执行路由处理函数

### 防护措施

- **自我保护**：管理员不能修改自己的角色或禁用自己
- **审计日志**：所有管理员操作都会记录到日志
- **Token 验证**：每次请求都会验证 Token 的有效性
- **最小权限原则**：只有必要的功能需要管理员权限

---

## 常见操作示例

### 示例 1：搜索用户

搜索邮箱或用户名包含 "test" 的用户：

```bash
curl -X GET "http://localhost:8000/api/admin/users?search=test&page=1&page_size=20" \
  -H "Authorization: Bearer <your_admin_token>"
```

### 示例 2：禁用用户账号

将用户 ID 为 5 的账号禁用：

```bash
curl -X POST "http://localhost:8000/api/admin/users/5/toggle-status" \
  -H "Authorization: Bearer <your_admin_token>"
```

### 示例 3：将用户提升为管理员

```bash
curl -X PUT "http://localhost:8000/api/admin/users/5" \
  -H "Authorization: Bearer <your_admin_token>" \
  -H "Content-Type: application/json" \
  -d '{"role": "admin"}'
```

### 示例 4：查看后台统计

```bash
curl -X GET "http://localhost:8000/api/admin/stats" \
  -H "Authorization: Bearer <your_admin_token>"
```

### 示例 5：批量操作（使用脚本）

参考 `backend/tests/test_admin_auth.sh` 脚本，可以编写自动化脚本执行批量操作。

---

## 安全最佳实践

1. **保护管理员凭据**
   - 使用强密码（至少 12 位，包含大小写字母、数字和特殊字符）
   - 定期更换密码
   - 不要在代码或配置文件中硬编码密码

2. **限制管理员数量**
   - 只授予必要人员管理员权限
   - 定期审查管理员账号列表

3. **监控管理员操作**
   - 定期检查日志文件
   - 设置异常操作告警

4. **使用 HTTPS**
   - 在生产环境中务必使用 HTTPS
   - 保护 Token 不被截获

5. **Token 管理**
   - Token 有过期时间，定期刷新
   - 登出时建议客户端删除 Token

---

## 故障排查

### 问题 1：无法创建管理员

**症状**：运行 `create_admin.py` 时报错 "邮箱已存在"

**解决**：该邮箱已被使用，请使用其他邮箱或登录现有账号。

### 问题 2：管理员 API 返回 403

**症状**：使用管理员 Token 访问管理员 API 时返回 403

**可能原因**：
1. Token 已过期，需要重新登录
2. 用户角色不是 admin
3. Token 格式错误（应为 `Bearer <token>`）

**解决方法**：
```bash
# 检查当前用户信息
curl -X GET "http://localhost:8000/api/auth/me" \
  -H "Authorization: Bearer <your_token>"

# 查看 role 字段是否为 "admin"
```

### 问题 3：无法删除用户

**症状**：删除用户时报错

**可能原因**：
1. 尝试删除自己的账号
2. 用户 ID 不存在

**解决方法**：确认用户 ID 正确，且不是删除自己。

---

## 相关资源

- [API 文档](http://localhost:8000/docs)：完整的 API 交互文档（Swagger UI）
- [开发计划文档](./开发计划文档.md)：项目的详细开发计划
- [测试脚本](../backend/tests/test_admin_auth.sh)：管理员功能测试脚本

---

## 联系支持

如有问题或建议，请通过以下方式联系：

- 提交 GitHub Issue
- 发送邮件至项目维护者

---

**文档版本**: v1.0  
**最后更新**: 2025-11-08

