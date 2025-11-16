# 用户记录详情页组件

## 概述

用户记录详情页（`/library/[id]`）已完成模块化重构，从单一的 567 行文件拆分为多个职责明确的组件和 Hook。

## 重构成果

**优化前：**
- 单文件：`app/library/[id]/page.tsx`（567行）
- 所有逻辑混在一起：UI、状态管理、业务逻辑

**优化后：**
- 页面文件：`app/library/[id]/page.tsx`（98行，-82.7%）
- 4个展示组件 + 1个自定义 Hook
- 职责清晰，易于维护和测试

## 文件结构

```
frontend/
├── app/library/[id]/
│   └── page.tsx                          # 页面入口（98行）
├── components/library/detail/
│   ├── ItemDetailHeader.tsx              # 头部组件
│   ├── ItemDetailSidebar.tsx             # 侧边栏组件
│   ├── ItemDetailContent.tsx             # 内容主体组件
│   └── ItemDetailSections.tsx            # 信息卡片组件
└── hooks/
    └── use-item-detail.ts                # 状态和业务逻辑 Hook
```

## 组件说明

### 1. ItemDetailHeader.tsx

**职责：** 页面头部展示

**包含内容：**
- 背景图（backdrop）
- 返回按钮

**Props：**
```typescript
interface ItemDetailHeaderProps {
  title: string;           // 标题（用于 alt）
  backdropUrl?: string;    // 背景图 URL
}
```

**使用示例：**
```tsx
<ItemDetailHeader 
  title={item.title} 
  backdropUrl={item.backdrop_url} 
/>
```

---

### 2. ItemDetailSidebar.tsx

**职责：** 左侧边栏展示

**包含内容：**
- 封面图（poster）
- 编辑按钮
- 删除按钮

**Props：**
```typescript
interface ItemDetailSidebarProps {
  title: string;           // 标题（用于 alt）
  posterUrl?: string;      // 封面图 URL
  isEditing: boolean;      // 是否处于编辑模式
  onEdit: () => void;      // 编辑按钮点击
  onDelete: () => void;    // 删除按钮点击
}
```

**使用示例：**
```tsx
<ItemDetailSidebar
  title={item.title}
  posterUrl={item.poster_url}
  isEditing={isEditing}
  onEdit={() => setIsEditing(true)}
  onDelete={() => setDeleteDialogOpen(true)}
/>
```

---

### 3. ItemDetailContent.tsx

**职责：** 主要内容区域

**包含内容：**
- 标题和元数据（类型、状态、评分、年份）
- 简介
- 编辑表单（编辑模式）
- 信息卡片（查看模式，通过 ItemDetailSections 组件）

**Props：**
```typescript
interface ItemDetailContentProps {
  item: UserItem;                          // 用户记录数据
  isEditing: boolean;                      // 是否处于编辑模式
  itemTags: Tag[];                         // 已添加的标签
  availableTags: Tag[];                    // 可用标签列表
  isLoadingTags: boolean;                  // 标签加载状态
  onUpdate: (data: any) => Promise<void>;  // 更新处理
  onCancelEdit: () => void;                // 取消编辑
  onAddTag: (tag: Tag) => void;            // 添加标签
  onRemoveTag: (tagId: number) => void;    // 移除标签
  onCreateTag: (name: string) => Promise<Tag>; // 创建标签
  onAITagsGenerated: (tags: Tag[]) => void;    // AI 标签生成完成
}
```

**使用示例：**
```tsx
<ItemDetailContent
  item={item}
  isEditing={isEditing}
  itemTags={itemTags}
  availableTags={availableTags}
  isLoadingTags={isLoadingTags}
  onUpdate={handleUpdate}
  onCancelEdit={() => setIsEditing(false)}
  onAddTag={handleAddTag}
  onRemoveTag={handleRemoveTag}
  onCreateTag={handleCreateTag}
  onAITagsGenerated={handleAITagsGenerated}
/>
```

---

### 4. ItemDetailSections.tsx

**职责：** 信息卡片展示（查看模式）

**包含内容：**
- 观看进度卡片（仅剧集类型且在看状态）
- 日期信息卡片（开始/完成日期）
- 笔记卡片
- 标签卡片（含 AI 标签生成）
- 相似推荐卡片
- 元数据卡片（导演、演员等）

**Props：**
```typescript
interface ItemDetailSectionsProps {
  item: UserItem;                          // 用户记录数据
  itemTags: Tag[];                         // 已添加的标签
  availableTags: Tag[];                    // 可用标签列表
  isLoadingTags: boolean;                  // 标签加载状态
  onAddTag: (tag: Tag) => void;            // 添加标签
  onRemoveTag: (tagId: number) => void;    // 移除标签
  onCreateTag: (name: string) => Promise<Tag>; // 创建标签
  onAITagsGenerated: (tags: Tag[]) => void;    // AI 标签生成完成
}
```

**使用示例：**
```tsx
<ItemDetailSections
  item={item}
  itemTags={itemTags}
  availableTags={availableTags}
  isLoadingTags={isLoadingTags}
  onAddTag={handleAddTag}
  onRemoveTag={handleRemoveTag}
  onCreateTag={handleCreateTag}
  onAITagsGenerated={handleAITagsGenerated}
/>
```

---

### 5. use-item-detail.ts Hook

**职责：** 状态管理和业务逻辑

**管理的状态：**
- 记录数据（item）
- 加载状态（isLoading）
- 编辑模式（isEditing）
- 删除对话框（deleteDialogOpen）
- 错误信息（error）
- 标签数据（itemTags, availableTags）
- 标签加载状态（isLoadingTags）

**提供的方法：**
- `handleUpdate()` - 更新记录
- `handleDelete()` - 删除记录
- `handleAddTag()` - 添加标签
- `handleRemoveTag()` - 移除标签
- `handleCreateTag()` - 创建标签
- `handleAITagsGenerated()` - AI 标签生成完成处理

**返回值：**
```typescript
interface UseItemDetailReturn {
  // 状态
  item: UserItem | null;
  isLoading: boolean;
  isEditing: boolean;
  deleteDialogOpen: boolean;
  error: string | null;
  itemTags: Tag[];
  availableTags: Tag[];
  isLoadingTags: boolean;
  
  // 状态设置
  setIsEditing: (value: boolean) => void;
  setDeleteDialogOpen: (value: boolean) => void;
  
  // 事件处理
  handleUpdate: (data: any) => Promise<void>;
  handleDelete: () => Promise<void>;
  handleAddTag: (tag: Tag) => void;
  handleRemoveTag: (tagId: number) => void;
  handleCreateTag: (tagName: string) => Promise<Tag>;
  handleAITagsGenerated: (tags: Tag[]) => void;
}
```

**使用示例：**
```tsx
const {
  item,
  isLoading,
  isEditing,
  deleteDialogOpen,
  error,
  itemTags,
  availableTags,
  isLoadingTags,
  setIsEditing,
  setDeleteDialogOpen,
  handleUpdate,
  handleDelete,
  handleAddTag,
  handleRemoveTag,
  handleCreateTag,
  handleAITagsGenerated,
} = useItemDetail(id);
```

---

## 页面组装

**page.tsx 的职责：**
1. 获取路由参数（id）
2. 调用 `useItemDetail` Hook 获取数据和方法
3. 处理加载和错误状态
4. 组装各个组件

**代码示例：**
```tsx
export default function ItemDetailPage() {
  const params = useParams();
  const id = params.id as string;
  
  const {
    item,
    isLoading,
    // ... 其他状态和方法
  } = useItemDetail(id);
  
  if (isLoading) return <LoadingState />;
  if (error || !item) return <ErrorState />;
  
  return (
    <div>
      <ItemDetailHeader {...headerProps} />
      <Container>
        <ItemDetailSidebar {...sidebarProps} />
        <ItemDetailContent {...contentProps} />
      </Container>
      <DeleteConfirmDialog {...dialogProps} />
    </div>
  );
}
```

---

## 设计原则

### 1. 单一职责
- 每个组件只负责一个明确的展示区域
- Hook 负责所有状态管理和业务逻辑
- 页面只负责组装

### 2. Props 向下传递
- 所有数据通过 props 传递
- 组件不直接访问 API 或全局状态
- 便于测试和复用

### 3. 事件向上冒泡
- 组件通过回调函数通知父组件
- 业务逻辑在 Hook 中统一处理
- 保持组件的纯粹性

### 4. 关注点分离
- 展示层（组件）：只关心如何展示
- 逻辑层（Hook）：只关心数据和业务逻辑
- 页面层：只关心组装和路由

---

## 优化效果

### 代码量减少
- 页面文件：567行 → 98行（-82.7%）
- 平均每个文件：~150行（易于理解和维护）

### 可维护性提升
- ✅ 职责清晰，修改影响范围小
- ✅ 组件可独立测试
- ✅ Hook 可复用于其他页面
- ✅ 易于添加新功能

### 可测试性提升
- ✅ 组件可进行快照测试
- ✅ Hook 可进行单元测试
- ✅ 业务逻辑与 UI 分离

---

## 后续优化建议

1. **添加单元测试**
   - 为 `use-item-detail` Hook 添加测试
   - 为各个组件添加快照测试

2. **性能优化**
   - 使用 `React.memo` 优化组件渲染
   - 使用 `useCallback` 优化回调函数

3. **错误边界**
   - 为各个组件添加错误边界
   - 提供更友好的错误提示

4. **加载状态优化**
   - 为各个卡片添加骨架屏
   - 优化加载体验

---

**重构完成时间：** 2025年11月15日  
**重构人员：** Kiro AI  
**相关文档：** [阶段 2 最终报告](../../../../.kiro/specs/project-optimization/STAGE2_FINAL_REPORT.md)
