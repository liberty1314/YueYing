# 头像上传功能使用指南

## 快速开始

### 1. 启动后端服务

```bash
cd backend
# 确保已安装依赖（包括 Pillow）
pip install -r requirements.txt
# 启动服务
make dev  # 或 uvicorn app.main:app --reload
```

### 2. 启动前端服务

```bash
cd frontend
# 确保环境变量已配置
cp .env.example .env.local
# 编辑 .env.local，确保 NEXT_PUBLIC_API_URL=http://localhost:8000

# 启动开发服务器
pnpm dev
```

### 3. 使用功能

1. 登录你的账号
2. 点击右上角用户头像 → 选择"设置"
3. 在"个人设置"页面，点击头像上的相机图标
4. 选择一张图片（JPG/PNG/WEBP，最大2MB）
5. 上传完成后，导航栏的头像会立即更新

## API 端点

### 上传头像
```http
POST /api/user/avatar
Content-Type: multipart/form-data
Authorization: Bearer <token>

file: <image_file>
```

**响应:**
```json
{
  "id": "1",
  "username": "user",
  "email": "user@example.com",
  "avatar_url": "/uploads/avatars/avatar_1_abc123.jpg",
  ...
}
```

### 删除头像
```http
DELETE /api/user/avatar
Authorization: Bearer <token>
```

**响应:**
```json
{
  "id": "1",
  "username": "user",
  "email": "user@example.com",
  "avatar_url": null,
  ...
}
```

## 文件要求

- **支持格式**: JPG, PNG, WEBP
- **最大大小**: 2MB
- **处理后尺寸**: 400x400 像素
- **输出格式**: JPEG (质量 90%)

## 常见问题

### Q: 上传后头像没有立即显示？
A: 检查浏览器控制台是否有错误。确保：
   - 后端服务正在运行
   - 静态文件服务已正确配置
   - NEXT_PUBLIC_API_URL 环境变量正确设置

### Q: 提示"上传失败"？
A: 可能的原因：
   - 文件大小超过 2MB
   - 文件格式不支持
   - 未登录或 token 过期
   - 后端服务未运行

### Q: 头像显示为默认头像？
A: 确认：
   - 上传是否成功（检查 /backend/uploads/avatars/ 目录）
   - 浏览器能否访问 http://localhost:8000/uploads/avatars/
   - 用户对象中 avatar_url 字段是否有值

### Q: 如何在生产环境部署？
A: 
1. 确保 uploads 目录有正确的权限
2. 考虑使用云存储（MinIO/S3）代替本地存储
3. 配置 CDN 加速静态资源访问
4. 设置合理的文件上传大小限制

## 测试示例

### 使用 curl 测试上传

```bash
# 获取 token
TOKEN="your_access_token"

# 上传头像
curl -X POST \
  http://localhost:8000/api/user/avatar \
  -H "Authorization: Bearer $TOKEN" \
  -F "file=@/path/to/your/image.jpg"
```

### 使用 Python 测试

```python
import requests

# 登录获取 token
response = requests.post(
    'http://localhost:8000/api/auth/login',
    json={
        'email': 'user@example.com',
        'password': 'password'
    }
)
token = response.json()['access_token']

# 上传头像
with open('avatar.jpg', 'rb') as f:
    response = requests.post(
        'http://localhost:8000/api/user/avatar',
        headers={'Authorization': f'Bearer {token}'},
        files={'file': f}
    )
    
print(response.json())
```

## 目录结构

```
backend/
└── uploads/
    └── avatars/
        ├── avatar_1_a1b2c3.jpg
        ├── avatar_2_d4e5f6.jpg
        └── ...
```

## 注意事项

1. **权限**: 确保 uploads 目录有写入权限
2. **清理**: 旧头像会自动删除，但长期运行建议定期清理孤立文件
3. **备份**: 重要头像需要备份（考虑使用云存储）
4. **安全**: 已实现基本的文件验证，但仍需注意：
   - 定期检查上传的文件
   - 监控磁盘空间使用
   - 设置合理的速率限制

## 性能优化建议

1. 使用 CDN 加速头像访问
2. 启用浏览器缓存
3. 考虑使用图片 CDN（如 imgix, Cloudinary）
4. 实现延迟加载
5. 使用 WebP 格式提供更好的压缩比

---

如有问题，请查看 `docs/avatar-upload-implementation.md` 了解更多技术细节。
