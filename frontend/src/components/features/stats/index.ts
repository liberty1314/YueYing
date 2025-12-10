/**
 * Stats Components Barrel Export
 * Week 6: 数据可视化 - 统计组件索引
 */

// Legacy components (default exports)
export { default as OverviewCards } from './OverviewCards';
export { default as TypeDistributionChart } from './TypeDistributionChart';
export { default as RatingDistributionChart } from './RatingDistributionChart';
export { default as TimeTrendChart } from './TimeTrendChart';
export { default as TopTagsCloud } from './TopTagsCloud';

// Named exports (legacy components removed - migrated to analytics/)

// Week 6 New Components
export { StatCard, StatCardGrid } from './StatCard';
export { BarChartWidget } from './BarChartWidget';
export { PieChartWidget } from './PieChartWidget';
export { LineChartWidget } from './LineChartWidget';
export { TagCloudWidget } from './TagCloudWidget';

// Premium Analytics Dashboard (Bento Grid)
export * from './analytics';
