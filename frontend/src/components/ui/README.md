# UI 组件库

这是 YueYing 的 Apple 风格 UI 组件库。

## 快速开始

### 导入组件

```tsx
import { AppleButton, AppleCard, AppleInput, Loading } from '@/components/ui';
```

### 使用示例

#### 按钮

```tsx
<AppleButton variant="primary">
  点击我
</AppleButton>
```

#### 卡片

```tsx
<AppleCard variant="elevated" hover sx={{ p: 3 }}>
  <Typography variant="h6">卡片标题</Typography>
  <Typography variant="body2">卡片内容</Typography>
</AppleCard>
```

#### 输入框

```tsx
<AppleInput
  label="用户名"
  placeholder="请输入用户名"
  value={value}
  onChange={(e) => setValue(e.target.value)}
/>
```

#### 加载指示器

```tsx
<Loading message="加载中..." />
```

## 组件展示

访问 `/components` 页面查看所有组件的实时示例和完整文档。

## 完整文档

查看项目根目录的 `DESIGN_SYSTEM.md` 文件获取完整的设计系统文档，包括：

- 设计原则
- 颜色系统
- 排版系统
- 间距系统
- 动画系统
- 响应式设计
- 可访问性指南
- 最佳实践

## 组件列表

### AppleButton
Apple 风格按钮组件，支持 4 种变体：
- `primary` - 主要按钮（蓝色渐变）
- `secondary` - 次要按钮（紫色渐变）
- `ghost` - 幽灵按钮（透明背景带边框）
- `text` - 文本按钮（纯文本样式）

### AppleCard
Apple 风格卡片组件，支持 3 种变体：
- `elevated` - 带阴影的浮起效果
- `outlined` - 带边框的扁平效果
- `glass` - 毛玻璃效果

### AppleInput
Apple 风格输入框组件，基于 Material-UI TextField。
特点：圆角设计、柔和背景色、流畅聚焦动画。

### Loading
加载指示器组件，支持自定义大小、消息和全屏模式。

## 开发指南

### 添加新组件

1. 在此目录创建新组件文件
2. 添加完整的 JSDoc 注释
3. 在 `index.ts` 中导出组件
4. 在 `/app/components/page.tsx` 添加展示示例
5. 更新此 README

### 组件规范

- 使用 TypeScript 严格模式
- 提供完整的类型定义
- 添加 JSDoc 注释
- 遵循 Apple 设计风格
- 支持主题切换（浅色/深色）
- 确保可访问性

## 技术栈

- **React 18** - UI 框架
- **Material-UI v6** - 基础组件库
- **Emotion** - CSS-in-JS
- **TypeScript** - 类型安全

## 相关资源

- [Material-UI 文档](https://mui.com/)
- [Apple Human Interface Guidelines](https://developer.apple.com/design/human-interface-guidelines/)
- [项目设计系统文档](../../../DESIGN_SYSTEM.md)
