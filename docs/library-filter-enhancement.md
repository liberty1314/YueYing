# 我的记录页面筛选增强

## 完成内容

### 1. 后端更新

#### 数据库变更
- ✅ 在 `user_settings` 表中添加 `default_library_status` 字段
- ✅ 默认值设为 `want_to_watch`（想看）
- ✅ 创建并执行数据库迁移

#### API 更新
- ✅ 更新 `UserSettings` 模型
- ✅ 更新 Pydantic schemas（`UserSettingsBase`, `UserSettingsUpdate`, `UserSettingsResponse`）
- ✅ 更新 `UserSettingsService` 以支持新字段
- ✅ API 端点 `/api/settings` 已支持读取和保存新字段

### 2. 前端更新

#### 个人设置页面
- ✅ 在"我的记录"设置区域添加"默认记录状态"下拉选择器
- ✅ 支持选择：想看、在看、看过
- ✅ 保存设置到后端

#### 我的记录页面
- ✅ 页面初始化时读取用户的 `default_library_status` 配置
- ✅ 强制应用默认状态（不再显示"全部"）
- ✅ 如果用户未配置，默认使用"想看"状态

#### 评分筛选组件
- ✅ 移除旧的固定评分按钮（9-10分、8-9分等）
- ✅ 创建新的双向滑块组件 `Slider`
- ✅ 支持拖动选择评分范围（0-10分，步长0.5）
- ✅ 实时更新筛选结果

## 测试步骤

### 1. 测试默认状态设置

1. 登录系统
2. 进入"个人设置"页面
3. 找到"我的记录"区域
4. 在"默认记录状态"下拉框中选择一个状态（如"在看"）
5. 点击"保存设置"
6. 进入"我的记录"页面
7. 验证页面自动显示"在看"状态的记录

### 2. 测试评分滑块

1. 进入"我的记录"页面
2. 在左侧筛选面板找到"评分范围"
3. 拖动滑块的左右两端
4. 观察：
   - 滑块上方显示当前选择的评分范围
   - 记录列表实时更新，只显示该评分范围内的内容
5. 将滑块拖到完整范围（0-10）时，评分筛选被清除

### 3. 测试筛选持久化

1. 在"我的记录"页面设置筛选条件
2. 刷新页面
3. 验证筛选条件被保存（包括默认状态）

## 技术实现

### 后端

**模型字段：**
```python
default_library_status = Column(
    String(50), 
    nullable=False, 
    default='want_to_watch', 
    server_default='want_to_watch',
    comment="我的记录页面默认筛选状态"
)
```

**可选值：**
- `want_to_watch` - 想看
- `watching` - 在看
- `watched` - 看过

### 筛选器交互逻辑

#### 1. 强制状态筛选（Mandatory Status）
- **状态必选**：状态筛选器始终保持一个值被选中
- **禁止取消**：点击已选中的状态按钮不会取消选中
- **允许切换**：点击不同的状态可以正常切换
- **初始化保证**：页面加载时确保 status 有默认值

**实现位置**：`AdvancedFilterPanel.tsx` 的 `handleStatusToggle` 函数

```typescript
const handleStatusToggle = (status: ItemStatus) => {
  // 如果点击的是当前已选中的状态，不做任何操作（强制保持选中）
  if (filters.status === status) {
    return;
  }
  
  // 切换到新的状态
  onFilterChange({
    ...filters,
    status: status,
  });
};
```

#### 2. 智能清除筛选
- **保护状态**：点击"清除筛选"按钮时保留当前的 status 值
- **清除范围**：仅清除评分、类型、标签、搜索等次要条件
- **用户体验**：在当前状态下重新查看所有内容

**实现位置**：
- `AdvancedFilterPanel.tsx` 的 `clearFilters` 函数
- `libraryStore.ts` 的 `clearFilters` 方法

#### 3. 清除按钮智能显隐
- **隐藏条件**：只有 status 筛选时（无额外筛选条件）
- **显示条件**：有评分、类型、标签等额外筛选条件时
- **计算逻辑**：`activeFilterCount` 只统计除 status 外的筛选条件

**实现位置**：`AdvancedFilterPanel.tsx` 的 `activeFilterCount` 计算

```typescript
// 计算除了 status 之外的活跃筛选条件数量
const activeFilterCount = Object.keys(filters).filter(key =>
  key !== 'status' && filters[key as keyof FilterState] !== undefined
).length;
```

### 前端

**Slider 组件特性：**
- 双向拖动（两个独立滑块）
- 实时数值显示
- 支持 0.5 步长
- 简洁的视觉设计
- 拖动时视觉反馈（缩放动画）
- 平滑过渡动画
- 暗色模式适配

**视觉设计：**
- 背景轨道：灰色（浅色模式）/ 深灰色（暗色模式）
- 激活区域：蓝色
- 滑块：白色背景 + 蓝色边框
- 拖动时：110% 缩放 + 阴影增强

**初始化逻辑：**
```typescript
// 1. 检查是否已有状态筛选
// 2. 如果没有，从 API 获取用户设置
// 3. 应用默认状态
// 4. 开始加载数据
```

## 数据库迁移

迁移文件：`backend/alembic/versions/20251201_1053_f37843123bef_add_default_library_status_to_user_.py`

已执行：✅

## 性能优化

### Apple 风格平滑过渡动画

**问题**：筛选时骨架屏闪烁，体验生硬

**解决方案**：
1. **智能加载状态**
   - 区分首次加载和筛选更新
   - 首次加载：显示骨架屏
   - 筛选更新：保持列表显示，降低透明度 + 显示小型加载指示器

2. **布局动画**（framer-motion）
   - 位置过渡：`layout` 属性实现平滑移动
   - 进场动画：淡入 + 缩放（0.9 → 1.0）
   - 出场动画：淡出 + 缩放（1.0 → 0.9）
   - 弹簧物理效果：`type: "spring", stiffness: 300, damping: 30`

3. **视觉反馈**
   - 更新中：右上角显示加载指示器
   - 列表透明度：50%
   - 动画时长：300ms

**技术栈**：
- `framer-motion` 12.23.24
- `AnimatePresence` 处理进出场
- `motion.div` 实现布局动画

**应用页面**：
- ✅ 我的记录页面（LibraryPage）
- ✅ 智能推荐页面（RecommendationsPage）

## 注意事项

1. **向后兼容**：现有用户会自动获得默认值 `want_to_watch`
2. **筛选持久化**：使用 localStorage 保存筛选状态
3. **评分范围**：基于 0-10 分制，与项目评分系统一致
4. **性能优化**：
   - 首次加载后缓存数据
   - 筛选更新时保持 UI 响应
   - 使用 GPU 加速的 CSS 动画

## Bug 修复

### 问题 1：评分筛选不生效

**问题原因**：前端和后端的字段名不一致
- 前端使用：`rating_min`, `rating_max`
- 后端使用：`min_rating`, `max_rating`

**解决方案**：统一使用后端的字段名 `min_rating` 和 `max_rating`

**修改文件**：
- `frontend/src/lib/api/userItems.ts` - 添加字段定义
- `frontend/src/stores/libraryStore.ts` - 修改字段名
- `frontend/src/components/features/library/AdvancedFilterPanel.tsx` - 修改字段名

### 问题 2：评分筛选返回 422 错误

**问题原因**：后端参数类型不匹配
- 后端定义：`min_rating: int`, `max_rating: int`
- 前端传递：浮点数（如 8.5, 9.5）
- 滑块步长为 0.5，会产生浮点数

**解决方案**：修改后端参数类型从 `int` 改为 `float`

**修改文件**：
- `backend/app/api/routes/user_items/query.py` - 两个函数的参数类型
- `backend/app/schemas/user_item.py` - `UserItemFilters` schema
