# 首页组件 - Netflix/Disney+ 级别设计

## 概述

首页已完全重构，采用 Tailwind CSS + Framer Motion，实现 Netflix/Disney+ 级别的现代化视觉体验。

## 核心优化

### 1. 技术栈升级
- ✅ 移除 Material-UI，全面使用 Tailwind CSS
- ✅ 集成 Framer Motion 实现流畅动画
- ✅ 使用 Lucide React 图标库
- ✅ 响应式设计，完美适配移动端

### 2. 视觉效果提升

#### HeroCarousel（英雄轮播图）
- **渐变遮罩**：从透明到深色的自然过渡
- **AnimatePresence**：图片切换时的淡入淡出动画
- **内容动画**：标题和按钮带有延迟进入效果
- **玻璃拟态按钮**：导航按钮使用 backdrop-blur 效果
- **流畅指示器**：使用 layoutId 实现平滑的宽度动画

#### MediaCard（媒体卡片）
- **Hover 上浮**：鼠标悬停时卡片轻微上浮（-8px）
- **图片缩放**：Hover 时图片放大 1.08 倍
- **评分标签**：绝对定位在右上角，带玻璃拟态效果
- **阴影升级**：从 shadow-lg 到 shadow-2xl 的过渡
- **圆角优化**：使用 rounded-xl 提升精致感

#### TrendingSection（热门趋势）
- **胶囊式 Tab**：使用 layoutId 实现背景平滑移动
- **渐变背景**：选中状态使用紫色到粉色的渐变
- **内容切换动画**：Tab 切换时内容淡入淡出
- **瀑布流进入**：卡片依次延迟进入（stagger effect）

#### AnimeTimeline（番剧日历）
- **周期表筛选器**：周一到周日的横向滚动选择器
- **渐变主题色**：粉色到玫瑰色的渐变
- **平滑切换**：使用 layoutId 实现背景动画
- **响应式滚动**：移动端支持横向滚动

#### AIRecommendations（AI 推荐）
- **图标动画**：Sparkles 图标带有旋转动画
- **渐变文字**：AI 文字使用渐变色
- **缩放进入**：卡片从 0.9 缩放到 1.0
- **视口触发**：使用 whileInView 实现滚动触发动画

#### CategoryRecommendations（分类推荐）
- **彩色标识**：每个分类使用不同的渐变色
- **视口动画**：滚动到视口时触发进入动画
- **图标主题化**：Film 和 Tv 图标使用对应主题色

### 3. 设计细节

#### 区块标题设计
```tsx
<div className="flex items-center gap-3 mb-6">
  <div className="w-1 h-8 bg-gradient-to-b from-purple-500 to-pink-500 rounded-full" />
  <Icon className="w-7 h-7 md:w-8 md:h-8 text-purple-500" />
  <h2 className="text-3xl md:text-4xl font-bold tracking-tight">标题</h2>
</div>
```

#### 响应式网格
```tsx
<div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4 md:gap-6">
  {/* 卡片内容 */}
</div>
```

#### 动画配置
```tsx
// 卡片 Hover
whileHover={{ y: -8 }}
transition={{ duration: 0.3, ease: [0.4, 0, 0.2, 1] }}

// 图片缩放
whileHover={{ scale: 1.08 }}
transition={{ duration: 0.6, ease: [0.4, 0, 0.2, 1] }}

// 瀑布流进入
transition={{ duration: 0.4, delay: index * 0.05 }}
```

## 组件列表

### 主要组件
- `HeroCarousel.tsx` - 英雄轮播图
- `AIRecommendations.tsx` - AI 推荐区块
- `TrendingSection.tsx` - 热门趋势（今日/本周切换）
- `AnimeTimeline.tsx` - 番剧日历（周一到周日）
- `CategoryRecommendations.tsx` - 分类推荐（电影/剧集）

### 骨架屏
- `HomeSkeletons.tsx` - 所有首页骨架屏组件

### 共享组件
- `MediaCard.tsx` - 统一的媒体卡片组件

## 使用示例

```tsx
import {
  HeroCarousel,
  AIRecommendations,
  TrendingSection,
  AnimeTimeline,
  CategoryRecommendations,
} from '@/components/features/home';

export default function HomePage() {
  return (
    <div className="w-full">
      <HeroCarousel
        items={heroItems}
        onViewDetail={handleOpenDetail}
        onAddToLibrary={handleAddToLibrary}
      />
      
      <AIRecommendations
        items={recommendations}
        onItemClick={handleOpenDetail}
      />
      
      <TrendingSection
        dailyItems={trendingToday}
        weeklyItems={trendingWeek}
        onItemClick={handleOpenDetail}
      />
      
      <AnimeTimeline
        calendarData={animeCalendar}
        onAnimeClick={handleAnimeClick}
      />
      
      <CategoryRecommendations
        movies={popularMovies}
        tvShows={popularTvShows}
        onMovieClick={handleMovieClick}
        onTvShowClick={handleTvShowClick}
      />
    </div>
  );
}
```

## 性能优化

1. **AnimatePresence mode="wait"**：确保动画不重叠
2. **viewport={{ once: true }**：滚动动画只触发一次
3. **margin: '-50px'**：提前触发视口动画
4. **lazy loading**：图片懒加载
5. **stagger effect**：避免同时渲染大量动画

## 浏览器兼容性

- Chrome/Edge 90+
- Firefox 88+
- Safari 14+
- 移动端浏览器全面支持

## 主题支持

所有组件完全支持亮色/暗色主题切换，使用 Tailwind 的 `dark:` 前缀。

## 未来优化方向

- [ ] 添加视差滚动效果
- [ ] 集成 GSAP 实现更复杂的动画
- [ ] 添加手势支持（滑动切换）
- [ ] 优化首屏加载性能
- [ ] 添加骨架屏渐变动画
