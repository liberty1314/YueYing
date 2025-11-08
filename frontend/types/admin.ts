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

