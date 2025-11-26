# 前端调试指南 - 检查用户头像问题

## 在浏览器控制台执行以下代码

### 1. 检查 localStorage 中的用户数据
```javascript
const authData = JSON.parse(localStorage.getItem('auth-storage') || '{}');
console.log('=== LocalStorage 数据 ===');
console.log('完整数据:', authData);
console.log('用户对象:', authData.state?.user);
console.log('avatar字段:', authData.state?.user?.avatar);
console.log('avatar_url字段:', authData.state?.user?.avatar_url);
console.log('avatarUrl字段:', authData.state?.user?.avatarUrl);
```

### 2. 检查所有可能的avatar字段
```javascript
const user = JSON.parse(localStorage.getItem('auth-storage') || '{}').state?.user;
if (user) {
    console.log('=== 所有用户字段 ===');
    Object.keys(user).forEach(key => {
        if (key.toLowerCase().includes('avatar')) {
            console.log(`${key}:`, user[key]);
        }
    });
} else {
    console.log('❌ 用户对象不存在');
}
```

### 3. 测试登录接口响应
```javascript
fetch('http://localhost:8000/api/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
        email: 'admin@admin.com',  // 替换为你的邮箱
        password: 'admin123',       // 替换为你的密码
        remember_me: true
    })
})
.then(res => res.json())
.then(data => {
    console.log('=== 登录响应 ===');
    console.log('完整响应:', data);
    console.log('用户对象:', data.user);
    if (data.user) {
        console.log('avatar字段:', data.user.avatar);
        console.log('avatar_url字段:', data.user.avatar_url);
        console.log('avatarUrl字段:', data.user.avatarUrl);
    }
})
.catch(err => console.error('登录失败:', err));
```

### 4. 测试 /auth/me 接口
```javascript
const token = JSON.parse(localStorage.getItem('auth-storage') || '{}').state?.token;
if (token) {
    fetch('http://localhost:8000/api/auth/me', {
        headers: { 'Authorization': `Bearer ${token}` }
    })
    .then(res => res.json())
    .then(data => {
        console.log('=== /auth/me 响应 ===');
        console.log('完整响应:', data);
        console.log('avatar字段:', data.avatar);
        console.log('avatar_url字段:', data.avatar_url);
        console.log('avatarUrl字段:', data.avatarUrl);
    })
    .catch(err => console.error('获取用户信息失败:', err));
} else {
    console.log('❌ 没有找到token');
}
```

### 5. 强制重新获取用户信息
```javascript
// 这段代码会清除localStorage并重新登录
localStorage.removeItem('auth-storage');
console.log('✅ 已清除 localStorage');
console.log('请重新登录，然后再次检查');
```

## 预期结果

正确的情况下，应该看到：
```
avatar_url: "/uploads/avatars/avatar_1_45f757dd.jpg"
```

## 可能的问题

1. **字段名转换问题**
   - 后端返回: `avatar_url` (蛇形)
   - 前端接收: 可能被转换成 `avatarUrl` (驼峰)
   - 解决: 检查前端的API client是否有字段转换逻辑

2. **localStorage 数据过期**
   - 检查 localStorage 中的用户数据是否是旧的
   - 解决: 清除 localStorage 重新登录

3. **initialize() 覆盖问题**
   - 页面刷新时调用 getCurrentUser() 可能获取到错误的数据
   - 解决: 检查 /api/auth/me 接口返回

## 下一步

执行上述代码后，请告诉我：
1. localStorage 中 user 对象的所有字段
2. 登录响应中 user 对象的所有字段
3. /auth/me 响应中的所有字段

这样我就能确定问题在哪里了。
