/**
 * Admin 组件导出
 * 
 * 统一导出所有后台管理相关组件
 */

// 统计卡片组件
export { StatCard } from './StatCard';
export type { StatCardProps } from './StatCard';

// 图表组件
export { DashboardChart } from './DashboardChart';
export type { DashboardChartProps, ChartDataPoint } from './DashboardChart';

// 用户表格组件
export { UserTable } from './UserTable';
export type { UserTableProps } from './UserTable';

// 用户对话框组件
export { UserDialog } from './UserDialog';
export type {
  UserDialogProps,
  UserDialogMode,
  UserFormData,
} from './UserDialog';

// 日志查看器组件
export { LogViewer } from './LogViewer';
export type { LogViewerProps } from './LogViewer';
