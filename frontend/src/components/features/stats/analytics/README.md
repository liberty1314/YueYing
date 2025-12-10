# Analytics Dashboard - 高级感数据统计仪表盘

## 概述

这是一个具有 **Bento Grid** 布局风格的现代化数据统计仪表盘，灵感来自 Vercel、Linear 和 Apple 的设计语言。

## 特性

### 🎨 视觉设计
- **Bento Grid 布局**: 灵活的网格系统，支持不同尺寸的卡片组合
- **大圆角设计**: 统一使用 16-24px 圆角，营造柔和亲和的视觉效果
- **柔和阴影**: 细腻的阴影层次，增强空间感
- **极细边框**: 1px 边框配合低透明度，保持视觉清爽
- **渐变效果**: AI 洞察区域使用微妙渐变，突出智能属性

### ✨ 交互动画
- **交错淡入**: 页面加载时各卡片按顺序依次出现
- **悬停效果**: 卡片悬停时轻微上浮并加深阴影
- **流光效果**: AI 洞察标题处的流光动画
- **数字动画**: KPI 数值的滚动动画效果

### 📱 响应式设计
- **移动端优先**: 完整的移动端适配
- **断点优化**: 针对不同屏幕尺寸的布局调整
- **触摸友好**: 适配触摸设备的交互体验

### 🌓 暗色模式
- **完整支持**: 所有组件都支持暗色模式
- **自动切换**: 跟随系统主题自动切换
- **对比优化**: 确保暗色模式下的可读性

## 组件架构

```
analytics/
├── types.ts                          # TypeScript 类型定义
├── AnalyticsDashboard.tsx            # 主仪表盘容器
├── KPICard.tsx                       # KPI 指标卡片
├── PremiumAIInsightCard.tsx          # AI 洞察卡片
├── ChartContainer.tsx                # 图表容器
├── TrendChart.tsx                    # 趋势折线图
├── TypeDistributionChart.tsx         # 类型分布饼图
├── RatingDistributionChart.tsx       # 评分分布柱状图
└── index.ts                          # 导出文件
```

## 使用方法

### 基础使用

```tsx
import { AnalyticsDashboard } from '@/components/features/stats/analytics';

export default function StatsPage() {
  return <AnalyticsDashboard />;
}
```

### 自定义数据

```tsx
import { AnalyticsDashboard, type AnalyticsData } from '@/components/features/stats/analytics';

const customData: AnalyticsData = {
  kpis: {
    totalItems: {
      label: '总收藏数',
      value: 1248,
      trend: 'up',
      trendValue: 12.5,
      suffix: '项',
    },
    // ... 其他 KPI
  },
  insights: [
    {
      type: 'trend',
      title: '观看高峰期分析',
      description: '你通常在周末晚上 8-11 点观看内容',
      priority: 'high',
    },
    // ... 其他洞察
  ],
  trends: {
    watchTime: [
      { date: '1月', value: 180 },
      // ... 其他数据点
    ],
    itemsAdded: [
      { date: '1月', value: 35 },
      // ... 其他数据点
    ],
  },
  distributions: {
    contentType: [
      { name: '电影', value: 520, color: '#007AFF' },
      // ... 其他类型
    ],
    rating: [
      { name: '9-10分', value: 245 },
      // ... 其他评分段
    ],
    status: [
      { name: '想看', value: 320 },
      // ... 其他状态
    ],
  },
};

export default function StatsPage() {
  return <AnalyticsDashboard data={customData} />;
}
```

### 加载状态和刷新

```tsx
import { useState } from 'react';
import { AnalyticsDashboard } from '@/components/features/stats/analytics';

export default function StatsPage() {
  const [loading, setLoading] = useState(false);

  const handleRefresh = async () => {
    setLoading(true);
    // 调用 API 获取最新数据
    const data = await fetchAnalyticsData();
    setLoading(false);
  };

  return (
    <AnalyticsDashboard 
      loading={loading} 
      onRefresh={handleRefresh} 
    />
  );
}
```

## 单独使用组件

### KPI 卡片

```tsx
import { KPICard } from '@/components/features/stats/analytics';

<KPICard
  label="总收藏数"
  value={1248}
  trend="up"
  trendValue={12.5}
  suffix="项"
  delay={0}
/>
```

### AI 洞察卡片

```tsx
import { PremiumAIInsightCard } from '@/components/features/stats/analytics';

<PremiumAIInsightCard
  insights={[
    {
      type: 'trend',
      title: '观看高峰期分析',
      description: '你通常在周末晚上 8-11 点观看内容',
      priority: 'high',
    },
  ]}
  loading={false}
  onRefresh={handleRefresh}
/>
```

### 图表容器

```tsx
import { ChartContainer, TrendChart } from '@/components/features/stats/analytics';

<ChartContainer
  title="观看时长趋势"
  description="最近 6 个月的观看时长变化"
  delay={0.5}
>
  <TrendChart 
    data={[
      { date: '1月', value: 180 },
      { date: '2月', value: 220 },
      // ...
    ]} 
    color="#007AFF" 
  />
</ChartContainer>
```

## 布局说明

### Bento Grid 结构

仪表盘使用 CSS Grid 实现 Bento Grid 布局：

```
┌─────────────────────────────────────────────────────┐
│  KPI 1    │  KPI 2    │  KPI 3    │  KPI 4         │  (4 列)
├───────────────────────┼─────────────────────────────┤
│  AI Insights (5 列)   │  Watch Time Trend (7 列)    │
├───────────────────────┴─────────────────────────────┤
│  Type Distribution (6 列)  │  Rating Distribution (6)│
├────────────────────────────┴─────────────────────────┤
│  Items Added Trend (12 列 - 全宽)                    │
└─────────────────────────────────────────────────────┘
```

### 响应式断点

- **移动端** (< 768px): 单列布局
- **平板** (768px - 1024px): 2 列布局
- **桌面** (> 1024px): 12 列 Grid 系统

## 设计 Token

组件使用项目的设计 token 系统：

```css
/* 颜色 */
--color-primary: #007AFF;
--color-success: #34C759;
--color-error: #FF3B30;

/* 圆角 */
--radius-lg: 16px;
--radius-xl: 20px;

/* 阴影 */
--shadow-sm: 0 2px 8px rgba(0, 0, 0, 0.08);
--shadow-lg: 0 8px 32px rgba(0, 0, 0, 0.12);
```

## 依赖

- **Framer Motion**: 动画效果
- **Recharts**: 图表渲染
- **Lucide React**: 图标库
- **Tailwind CSS**: 样式系统

## 性能优化

- ✅ 使用 Framer Motion 的 `initial` 和 `animate` 实现高性能动画
- ✅ 图表组件使用 `ResponsiveContainer` 自适应容器尺寸
- ✅ 合理使用 `delay` 参数实现交错动画，避免同时渲染
- ✅ 支持按需加载，可单独导入使用

## 可访问性

- ✅ 语义化 HTML 结构
- ✅ 适当的 ARIA 标签
- ✅ 键盘导航支持
- ✅ 颜色对比度符合 WCAG AA 标准
- ✅ 支持屏幕阅读器

## 浏览器兼容性

- ✅ Chrome 90+
- ✅ Firefox 88+
- ✅ Safari 14+
- ✅ Edge 90+

## 未来计划

- [ ] 添加更多图表类型（雷达图、热力图等）
- [ ] 支持自定义主题色
- [ ] 添加数据导出功能
- [ ] 支持拖拽调整布局
- [ ] 添加更多动画效果选项

## 贡献

欢迎提交 Issue 和 Pull Request！

---

**最后更新**: 2025-12-10
**维护者**: Kiro AI Assistant
