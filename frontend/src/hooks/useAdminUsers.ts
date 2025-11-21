/**
 * 管理员用户管理 Hook
 * Week 7 Day 4: 用户管理页面开发
 */

'use client';

import { useState, useEffect, useCallback } from 'react';
import { api, APIError, CachePresets } from '@/lib/apiClient';

// ========== 类型定义 ==========

export interface User {
  id: number;
  email: string;
  username: string | null;
  full_name: string | null;
  avatar_url: string | null;
  role: string;
  is_active: boolean;
  is_verified: boolean;
  created_at: string;
  updated_at: string;
}

export interface UserListResponse {
  users: User[];
  total: number;
  page: number;
  page_size: number;
}

export interface UserUpdateRequest {
  email?: string;
  username?: string;
  full_name?: string;
  role?: 'user' | 'admin';
  is_active?: boolean;
}

export interface CreateAdminRequest {
  email: string;
  password: string;
  username?: string;
  full_name?: string;
}

export interface UserListFilters {
  search?: string;
  role?: 'user' | 'admin';
  is_active?: boolean;
  sort_by?: 'created_at' | 'username' | 'email';
  sort_desc?: boolean;
}

interface UseUsersOptions {
  page?: number;
  pageSize?: number;
  filters?: UserListFilters;
  enabled?: boolean;
}

interface UseUsersResult {
  data: UserListResponse | null;
  loading: boolean;
  error: Error | null;
  refetch: () => Promise<void>;
  updateUser: (userId: number, data: UserUpdateRequest) => Promise<User>;
  deleteUser: (userId: number, hardDelete?: boolean) => Promise<void>;
  createAdmin: (data: CreateAdminRequest) => Promise<User>;
}

// ========== Hook 实现 ==========

/**
 * 用户列表管理Hook
 */
export function useAdminUsers(options: UseUsersOptions = {}): UseUsersResult {
  const {
    page = 1,
    pageSize = 20,
    filters = {},
    enabled = true,
  } = options;

  const [data, setData] = useState<UserListResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchUsers = useCallback(async () => {
    if (!enabled) return;

    setLoading(true);
    setError(null);
    try {
      // 构建查询参数
      const params = new URLSearchParams();
      params.append('page', page.toString());
      params.append('page_size', pageSize.toString());

      if (filters.search) params.append('search', filters.search);
      if (filters.role) params.append('role', filters.role);
      if (filters.is_active !== undefined) params.append('is_active', filters.is_active.toString());
      if (filters.sort_by) params.append('sort_by', filters.sort_by);
      if (filters.sort_desc !== undefined) params.append('sort_desc', filters.sort_desc.toString());

      const result = await api.get<UserListResponse>(
        `/api/admin/users?${params.toString()}`,
        true,
        CachePresets.SHORT // 1分钟缓存
      );
      setData(result);
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Unknown error');
      setError(error);
      console.error('Failed to fetch users:', error);
    } finally {
      setLoading(false);
    }
  }, [page, pageSize, filters, enabled]);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  /**
   * 更新用户信息
   */
  const updateUser = useCallback(async (userId: number, updateData: UserUpdateRequest): Promise<User> => {
    try {
      const user = await api.put<User>(
        `/api/admin/users/${userId}`,
        updateData,
        true
      );
      // 刷新列表
      await fetchUsers();
      return user;
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Failed to update user');
      throw error;
    }
  }, [fetchUsers]);

  /**
   * 删除用户
   */
  const deleteUser = useCallback(async (userId: number, hardDelete: boolean = false): Promise<void> => {
    try {
      await api.delete(
        `/api/admin/users/${userId}?hard_delete=${hardDelete}`,
        true
      );
      // 刷新列表
      await fetchUsers();
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Failed to delete user');
      throw error;
    }
  }, [fetchUsers]);

  /**
   * 创建管理员
   */
  const createAdmin = useCallback(async (adminData: CreateAdminRequest): Promise<User> => {
    try {
      const user = await api.post<User>(
        '/api/admin/users/create-admin',
        adminData,
        true
      );
      // 刷新列表
      await fetchUsers();
      return user;
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Failed to create admin');
      throw error;
    }
  }, [fetchUsers]);

  return {
    data,
    loading,
    error,
    refetch: fetchUsers,
    updateUser,
    deleteUser,
    createAdmin,
  };
}
