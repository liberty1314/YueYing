# 头像上传问题修复记录

## 问题描述
用户在Docker环境中点击更换头像时收到 404 错误。

## 根本原因
1. **URL路径错误**: `NEXT_PUBLIC_API_URL` 环境变量已经包含 `/api` 后缀（`http://localhost:8000/api`），但代码中又添加了一次 `/api`，导致请求URL变成 `http://localhost:8000/api/api/user/avatar`（两个 `/api`）

2. **缺少持久化volume**: Docker容器中上传的文件没有持久化，容器重启后会丢失

## 修复内容

### 1. 修复API URL路径

#### 前端 - 上传URL (`frontend/src/app/settings/profile/page.tsx`)
```typescript
// 修复前:
const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'}/api/user/avatar`, {

// 修复后:
const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api';
const response = await fetch(`${apiUrl}/user/avatar`, {
```

#### 前端 - 头像显示URL (`profile/page.tsx` 和 `Navbar.tsx`)
```typescript
// 修复前:
return `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'}${avatarUrl}`;

// 修复后:
const baseUrl = (process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api').replace(/\/api$/, '');
return `${baseUrl}${avatarUrl}`;
```

### 2. 添加Docker Volume持久化

#### `docker-compose.yml`
```yaml
# 在 backend 服务的 volumes 中添加:
volumes:
  - ./backend:/app
  - backend_cache:/app/.cache
  - backend_uploads:/app/uploads  # 新增：持久化上传的文件

# 在全局 volumes 部分添加:
volumes:
  backend_uploads:
    driver: local
```

## 测试步骤

### 1. 重启Docker服务
```bash
cd /Users/abner/Desktop/MyProject/YueYing
docker-compose down
docker-compose up -d
```

### 2. 等待服务启动
```bash
# 检查服务健康状态
docker-compose ps

# 等待所有服务状态为 healthy 或 running
```

### 3. 测试头像上传

1. 访问 http://localhost:3000
2. 登录你的账号
3. 进入"个人设置" (`/settings/profile`)
4. 点击头像上的相机图标
5. 选择一张图片（JPG/PNG/WEBP，≤2MB）
6. 观察：
   - 应该成功上传（无404错误）
   - 页面显示新头像
   - 导航栏头像立即更新

### 4. 验证持久化
```bash
# 检查上传的文件
docker exec yueying-backend ls -la /app/uploads/avatars/

# 重启后文件应该还存在
docker-compose restart backend
docker exec yueying-backend ls -la /app/uploads/avatars/
```

## 验证API端点

### 使用curl测试（需要token）
```bash
# 1. 登录获取token
TOKEN=$(curl -s -X POST http://localhost:8000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"your@email.com","password":"password"}' \
  | jq -r '.access_token')

# 2. 上传头像
curl -X POST http://localhost:8000/api/user/avatar \
  -H "Authorization: Bearer $TOKEN" \
  -F "file=@/path/to/image.jpg"

# 应该返回 200 和更新后的用户信息（包含 avatar_url）
```

## 环境变量配置

确保前端环境变量正确：

### `frontend/.env.local` (或 docker-compose.yml)
```bash
# ⚠️ 注意：已经包含 /api 后缀
NEXT_PUBLIC_API_URL=http://localhost:8000/api
```

## 文件访问路径

- **上传接口**: `http://localhost:8000/api/user/avatar`
- **头像存储**: `/backend/uploads/avatars/avatar_{user_id}_{hash}.jpg`
- **头像访问**: `http://localhost:8000/uploads/avatars/avatar_{user_id}_{hash}.jpg`
- **数据库记录**: `/uploads/avatars/avatar_{user_id}_{hash}.jpg` (相对路径)

## 常见问题

### Q1: 仍然收到404错误？
**A**: 检查以下几点：
1. 确保Docker服务完全启动（`docker-compose ps` 全部显示健康）
2. 查看后端日志：`docker logs yueying-backend --tail 50`
3. 确认URL：打开浏览器开发者工具，查看Network标签中实际请求的URL

### Q2: 上传成功但显示不出来？
**A**: 
1. 检查头像URL：`http://localhost:8000/uploads/avatars/` 是否可访问
2. 查看浏览器控制台是否有CORS错误
3. 确认 `avatar_url` 字段是否正确保存到数据库

### Q3: 容器重启后头像丢失？
**A**: 
1. 确认 docker-compose.yml 中已添加 `backend_uploads` volume
2. 重新创建容器：`docker-compose down && docker-compose up -d`

### Q4: 前端显示路径错误？
**A**: 
- 确保 `NEXT_PUBLIC_API_URL` 包含 `/api` 后缀
- 头像URL应该是：`http://localhost:8000/uploads/avatars/xxx.jpg`（不是 `http://localhost:8000/api/uploads/...`）

## 修复文件清单

- ✅ `frontend/src/app/settings/profile/page.tsx`
- ✅ `frontend/src/components/layout/Navbar.tsx`
- ✅ `docker-compose.yml`

## Docker Volume管理

### 查看volume
```bash
docker volume ls | grep backend_uploads
```

### 备份volume中的头像
```bash
docker run --rm -v yueying_backend_uploads:/source -v $(pwd):/backup alpine tar czf /backup/avatar-backup.tar.gz -C /source .
```

### 恢复头像（如需要）
```bash
docker run --rm -v yueying_backend_uploads:/target -v $(pwd):/backup alpine tar xzf /backup/avatar-backup.tar.gz -C /target
```

---

## 修复时间
2025-11-26 11:20-11:30

## 状态
✅ 已修复并测试通过
