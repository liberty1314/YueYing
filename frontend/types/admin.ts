/**
 * 管理员相关类型定义
 */

// 用户角色
export type UserRole = 'user' | 'admin';

// 用户接口
export interface AdminUser {
  id: number;
  email: string;
  username: string | null;
  full_name: string | null;
  avatar_url: string | null;
  role: UserRole;
  is_active: boolean;
  is_verified: boolean;
  created_at: string;
  updated_at: string;
}

// 用户列表响应
export interface UserListResponse {
  users: AdminUser[];
  total: number;
  page: number;
  page_size: number;
}

// 用户筛选参数
export interface UserFilters {
  search?: string;
  role?: UserRole;
  is_active?: boolean;
  sort_by?: string;
  sort_desc?: boolean;
}

// 用户更新数据
export interface UserUpdateData {
  email?: string;
  username?: string;
  full_name?: string;
  role?: UserRole;
  is_active?: boolean;
}

// 创建管理员数据
export interface CreateAdminData {
  email: string;
  password: string;
  username?: string;
  full_name?: string;
}

// 仪表盘相关类型

// 核心指标
export interface CoreMetrics {
  dau: number;              // 日活跃用户
  mau: number;              // 月活跃用户
  user_stickiness: number;  // 用户粘性 (DAU/MAU %)
  today_new_users: number;  // 今日新增用户
}

// DAU趋势数据点
export interface DauTrendPoint {
  date: string;
  dau: number;
}

// 用户留存率趋势数据点
export interface RetentionTrendPoint {
  date: string;
  cohort_size: number;
  day_1: number;   // 次日留存率
  day_7: number;   // 第7日留存率
  day_14: number;  // 第14日留存率
  day_30: number;  // 第30日留存率
}

// 系统健康状态
export interface SystemHealthStatus {
  status: string;
  details: string;
}

export interface SystemHealth {
  llm_api: SystemHealthStatus;
  rag_index: SystemHealthStatus;
  redis_cache: SystemHealthStatus;
  database: SystemHealthStatus;
}

// 最近用户
export interface RecentUser {
  id: number;
  username: string | null;
  email: string;
  created_at: string;
}

// 系统事件
export interface SystemEvent {
  id: number;
  task_type: string;
  status: string;
  created_at: string;
  description: string;
}

// 最近活动
export interface RecentActivity {
  recent_users: RecentUser[];
  system_events: SystemEvent[];
}

// 仪表盘统计数据
export interface DashboardStats {
  core_metrics: CoreMetrics;
  dau_trend: DauTrendPoint[];
  retention_trends: RetentionTrendPoint[];
  system_health: SystemHealth;
  timestamp: string;
}

