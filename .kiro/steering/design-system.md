---
inclusion: always
---

# 阅影·log 设计系统规则

本文档定义了从 Figma 设计转换为代码时应遵循的设计系统规则和约定。

## 1. 设计 Token 定义

### 颜色系统

项目使用 Apple 风格的设计 token，定义在 `frontend/src/app/globals.css` 中：

**亮色模式：**
```css
--color-primary: #007AFF;           /* Apple Blue */
--color-secondary: #5856D6;         /* Purple */
--color-success: #34C759;           /* Green */
--color-warning: #FF9500;           /* Orange */
--color-error: #FF3B30;             /* Red */

--color-background-default: #FFFFFF;
--color-background-paper: #F5F5F7;
--color-background-elevated: #FFFFFF;

--color-text-primary: #1D1D1F;
--color-text-secondary: #86868B;
--color-text-disabled: #C7C7CC;
```

**暗色模式：**
```css
--color-primary: #0A84FF;
--color-secondary: #5E5CE6;
--color-success: #30D158;
--color-warning: #FF9F0A;
--color-error: #FF453A;

--color-background-default: #0F0F0F;
--color-background-paper: #1C1C1E;
--color-background-elevated: #2C2C2E;

--color-text-primary: #FFFFFF;
--color-text-secondary: #98989D;
--color-text-disabled: #48484A;
```

### 间距系统

```css
--spacing-xs: 0.25rem;   /* 4px */
--spacing-sm: 0.5rem;    /* 8px */
--spacing-md: 1rem;      /* 16px */
--spacing-lg: 1.5rem;    /* 24px */
--spacing-xl: 2rem;      /* 32px */
--spacing-2xl: 3rem;     /* 48px */
```

### 圆角系统

```css
--radius-sm: 8px;
--radius-md: 12px;
--radius-lg: 16px;
--radius-xl: 20px;
```

### 阴影系统

```css
--shadow-sm: 0 2px 8px rgba(0, 0, 0, 0.08);
--shadow-md: 0 4px 16px rgba(0, 0, 0, 0.08);
--shadow-lg: 0 8px 32px rgba(0, 0, 0, 0.12);
```

## 2. 组件库架构

### 组件位置

- **基础 UI 组件**: `frontend/src/components/ui/`
- **功能组件**: `frontend/src/components/features/`
- **布局组件**: `frontend/src/components/layout/`

### 组件命名约定

- 使用 PascalCase: `Button`, `AppleCard`, `Navbar`
- Apple 风格组件前缀 `Apple`: `AppleButton`, `AppleCard`, `AppleDialog`
- 功能描述性命名: `AnimatedThemeToggler`, `ErrorDisplay`

### 现有基础组件

```
ui/
├── button.tsx              # 通用按钮
├── AppleButton.tsx         # Apple 风格按钮
├── card.tsx                # 卡片容器
├── AppleCard.tsx           # Apple 风格卡片
├── dialog.tsx              # 对话框
├── AppleDialog.tsx         # Apple 风格对话框
├── input.tsx               # 输入框
├── AppleInput.tsx          # Apple 风格输入框
├── badge.tsx               # 徽章
├── carousel.tsx            # 轮播图
├── scroll-area.tsx         # 滚动区域
├── separator.tsx           # 分隔线
├── Skeleton.tsx            # 骨架屏
├── Loading.tsx             # 加载状态
├── Switch.tsx              # 开关
├── Slider.tsx              # 滑块
└── animated-theme-toggler.tsx  # 主题切换器
```

## 3. 技术栈

### 框架与库

- **UI 框架**: Next.js 14 (App Router)
- **语言**: TypeScript (strict mode)
- **样式**: Tailwind CSS v4 (CSS-first configuration)
- **UI 组件基础**: shadcn/ui (Radix UI primitives)
- **图标**: Lucide React
- **动画**: tw-animate-css

### 构建系统

- **打包工具**: Next.js built-in (Turbopack)
- **包管理器**: pnpm
- **CSS 处理**: PostCSS + Tailwind CSS

## 4. 资源管理

### 图片资源

- **存储位置**: `frontend/public/` 或外部 CDN
- **优化**: Next.js Image 组件自动优化
- **格式**: WebP/AVIF 优先，PNG/JPG 降级

### 图标系统

- **图标库**: Lucide React
- **使用方式**: 
  ```tsx
  import { Search, User, Settings } from 'lucide-react';
  <Search className="w-5 h-5" />
  ```

## 5. 样式方法

### CSS 方法论

- **主要方式**: Tailwind CSS utility classes
- **类名合并**: 使用 `cn()` 工具函数（来自 `@/lib/utils`）
- **CSS 变量**: 用于设计 token 和主题切换

### 工具函数

```typescript
// frontend/src/lib/utils.ts
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
```

### 响应式设计

使用 Tailwind 断点：
```tsx
<div className="px-4 md:px-6 lg:px-8">
  {/* 移动端 16px, 平板 24px, 桌面 32px */}
</div>
```

## 6. 路径别名

TypeScript 路径配置（`tsconfig.json`）：

```json
{
  "@/*": ["./src/*"],
  "@/components/*": ["./src/components/*"],
  "@/lib/*": ["./src/lib/*"],
  "@/hooks/*": ["./src/hooks/*"],
  "@/store/*": ["./src/stores/*"],
  "@/types/*": ["./src/types/*"],
  "@/config/*": ["./src/config/*"]
}
```

## 7. Figma 到代码转换规则

### 从 Figma MCP 输出转换

1. **替换 Tailwind 类为设计 token**
   - Figma 输出: `bg-blue-500` → 项目: `bg-[var(--color-primary)]`
   - Figma 输出: `rounded-lg` → 项目: `rounded-[var(--radius-md)]`

2. **复用现有组件**
   - 不要重复创建按钮，使用 `<Button>` 或 `<AppleButton>`
   - 不要重复创建卡片，使用 `<Card>` 或 `<AppleCard>`
   - 不要重复创建输入框，使用 `<Input>` 或 `<AppleInput>`

3. **保持视觉一致性**
   - 优先使用设计 token 而非硬编码值
   - 确保与 Figma 截图的视觉 1:1 匹配
   - 调整间距和尺寸时最小化改动

4. **遵循项目模式**
   - 使用 React Query 进行数据获取
   - 使用 Zustand 进行全局状态管理
   - 使用 React Hook Form + Zod 进行表单验证

### 组件结构模板

```tsx
/**
 * ComponentName - 组件描述
 * 
 * 功能说明
 */

import { forwardRef } from 'react';
import { cn } from '@/lib/utils';

export interface ComponentNameProps {
  // Props 定义
}

const ComponentName = forwardRef<HTMLDivElement, ComponentNameProps>(
  ({ className, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn(
          // 基础样式
          'base-classes',
          // 变体样式
          {
            'variant-classes': condition,
          },
          className
        )}
        {...props}
      >
        {/* 组件内容 */}
      </div>
    );
  }
);

ComponentName.displayName = 'ComponentName';

export { ComponentName };
```

## 8. 性能优化

### 代码分割

- 使用 Next.js 动态导入: `dynamic(() => import('./Component'))`
- 路由级别自动代码分割

### 图片优化

```tsx
import Image from 'next/image';

<Image
  src="/path/to/image.jpg"
  alt="描述"
  width={800}
  height={600}
  loading="lazy"
  placeholder="blur"
/>
```

### 字体优化

使用 Next.js 字体优化：
```tsx
import { Inter } from 'next/font/google';

const inter = Inter({ subsets: ['latin'] });
```

## 9. 可访问性 (A11y)

### 必须遵循的规则

1. **语义化 HTML**: 使用正确的 HTML 标签
2. **键盘导航**: 所有交互元素可通过键盘访问
3. **ARIA 属性**: 为复杂组件添加适当的 ARIA 属性
4. **颜色对比**: 确保文本与背景的对比度符合 WCAG AA 标准
5. **焦点指示**: 清晰的焦点状态样式

### 示例

```tsx
<button
  aria-label="关闭对话框"
  aria-pressed={isPressed}
  className="focus:ring-2 focus:ring-blue-500"
>
  <X className="w-5 h-5" />
</button>
```

## 10. 开发工作流

### 从 Figma 到代码的流程

1. **获取设计上下文**: 使用 Figma MCP 的 `get_design_context` 工具
2. **分析输出**: 识别可复用的现有组件
3. **转换样式**: 将 Tailwind 类替换为设计 token
4. **集成组件**: 使用项目的状态管理和数据获取模式
5. **验证视觉**: 对比 Figma 截图确保一致性
6. **测试功能**: 确保交互和响应式行为正确

### 质量检查清单

- [ ] 使用了正确的路径别名
- [ ] 复用了现有组件而非重复创建
- [ ] 使用了设计 token 而非硬编码值
- [ ] 添加了 TypeScript 类型定义
- [ ] 遵循了项目的命名约定
- [ ] 实现了响应式设计
- [ ] 支持暗色模式
- [ ] 符合可访问性标准
- [ ] 视觉与 Figma 设计一致

## 11. 常用模式

### 条件渲染

```tsx
{isLoading ? <Skeleton /> : <Content />}
{error && <ErrorDisplay error={error} />}
```

### 列表渲染

```tsx
{items.map((item) => (
  <Card key={item.id}>
    {/* 内容 */}
  </Card>
))}
```

### 表单处理

```tsx
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';

const schema = z.object({
  name: z.string().min(1, '名称不能为空'),
});

const { register, handleSubmit } = useForm({
  resolver: zodResolver(schema),
});
```

---

**最后更新**: 2025-12-05
**维护者**: Kiro AI Assistant
