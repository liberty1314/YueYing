# 登录后头像丢失问题修复

## 问题描述
用户上传头像后，重新登录会恢复成默认头像，之前上传的头像丢失了。

## 根本原因
登录接口 (`POST /api/auth/login`) **只返回 Token**（access_token 和 refresh_token），没有返回用户信息。

前端代码期望登录响应包含 `user` 对象：
```typescript
const response = await authApi.login(data);
login(response.user, response.access_token);  // 期望有 response.user
```

但后端原来的响应只有：
```json
{
  "access_token": "...",
  "refresh_token": "...",
  "token_type": "bearer"
}
```

导致前端无法获取用户的 `avatar_url`，每次登录都显示默认头像。

## 解决方案

### 1. 修改 Token Schema 添加 user 字段

**文件**: `backend/app/schemas/user.py`

```python
class Token(BaseModel):
    """Token 响应"""

    access_token: str = Field(..., description="访问令牌")
    refresh_token: str = Field(..., description="刷新令牌")
    token_type: str = Field(default="bearer", description="令牌类型")
    user: Optional['UserResponse'] = Field(None, description="用户信息")  # ✅ 新增

# 文件末尾添加
Token.model_rebuild()  # ✅ 解析 forward reference
```

### 2. 修改登录接口返回用户信息

**文件**: `backend/app/api/routes/auth.py`

```python
@router.post("/login", response_model=Token)
def login(request: Request, login_data: UserLogin, db: Session = Depends(get_db)):
    user = auth_service.authenticate_user(db, login_data)
    
    if not user:
        raise HTTPException(...)
    
    tokens = auth_service.create_user_tokens(user, remember_me=login_data.remember_me)
    
    # ✅ 添加用户信息到响应中
    from app.schemas.user import UserResponse
    tokens.user = UserResponse.from_orm(user)
    
    return tokens
```

## 修复后的响应

登录接口现在返回完整的用户信息：

```json
{
  "access_token": "eyJ...",
  "refresh_token": "eyJ...",
  "token_type": "bearer",
  "user": {
    "id": 1,
    "username": "admin",
    "email": "admin@admin.com",
    "avatar_url": "/uploads/avatars/avatar_1_45f757dd.jpg",  // ✅ 包含头像
    "role": "admin",
    "is_admin": true,
    "is_active": true,
    "is_verified": true,
    "created_at": "2025-11-21T09:17:55.713014",
    "updated_at": "2025-11-26T03:30:16.409669"
  }
}
```

## 工作流程

### 修复前 ❌
```
1. 用户登录
   ↓
2. 后端返回: { access_token, refresh_token }  // 没有用户信息
   ↓
3. 前端调用 /api/auth/me 获取用户信息
   ↓
4. 获得用户信息（包括 avatar_url）
   ↓
5. 但前端可能在某些情况下没有正确处理，导致头像丢失
```

### 修复后 ✅
```
1. 用户登录
   ↓
2. 后端返回: { access_token, refresh_token, user }  // 直接包含完整用户信息
   ↓
3. 前端立即获得用户信息（包括 avatar_url）
   ↓
4. 保存到 zustand store
   ↓
5. 全局头像正确显示
```

## 验证方法

### 1. 使用 curl 测试
```bash
curl -X POST http://localhost:8000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "your@email.com",
    "password": "yourpassword",
    "remember_me": true
  }' | python -m json.tool
```

**预期结果**: 响应中包含 `user` 对象，且 `user.avatar_url` 有值（如果用户已上传头像）

### 2. 浏览器测试

1. **清除浏览器缓存和 localStorage**
   ```javascript
   // 在浏览器控制台执行
   localStorage.clear();
   location.reload();
   ```

2. **重新登录**
   - 访问 http://localhost:3000/login
   - 输入账号密码
   - 点击登录

3. **检查 Network 请求**
   - 打开开发者工具 (F12)
   - Network 标签
   - 找到 `/api/auth/login` 请求
   - 查看响应，确认包含 `user` 对象

4. **验证头像显示**
   - 登录成功后，右上角应该显示你的头像
   - 刷新页面，头像依然存在
   - 退出登录再次登录，头像依然正确显示

### 3. 完整测试流程

```bash
# 1. 登录
# 2. 上传头像
# 3. 退出登录
# 4. 再次登录  ✅ 头像应该正确显示
# 5. 刷新页面  ✅ 头像依然存在
```

## 相关文件

- ✅ `backend/app/schemas/user.py` - 添加 user 字段到 Token
- ✅ `backend/app/api/routes/auth.py` - 登录接口返回用户信息

## 额外说明

### 为什么不删除 /api/auth/me 接口？

保留 `/api/auth/me` 接口仍然有用：
1. **Token 刷新**: 使用 refresh_token 换新 access_token 后，可以调用此接口获取最新用户信息
2. **用户信息更新**: 当用户修改了个人信息（如头像、用户名）后，可以调用此接口刷新
3. **页面刷新**: 当页面刷新时，从 localStorage 读取 token，然后调用此接口获取用户信息

### UserResponse Schema 包含的字段

```python
class UserResponse(UserBase):
    id: int
    full_name: Optional[str] = None
    avatar_url: Optional[str] = None  # ✅ 头像 URL
    is_verified: bool = False
    role: str = "user"
    is_admin: bool = False
    created_at: datetime
    updated_at: datetime
```

## 测试结果

✅ **登录接口测试通过**
```bash
$ curl -X POST http://localhost:8000/api/auth/login ...
{
  "user": {
    "avatar_url": "/uploads/avatars/avatar_1_45f757dd.jpg"
    ...
  }
}
```

✅ **用户上传头像后重新登录，头像正确显示**

## 修复日期
2025-11-26 11:35

## 状态
✅ 已修复并验证通过
