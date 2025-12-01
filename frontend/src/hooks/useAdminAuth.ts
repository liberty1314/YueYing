/**
 * 管理员权限检查 Hook
 * Week 7 Day 1: 后台管理基础设施 - 权限控制
 */

'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { api, APIError } from '@/lib/apiClient';
import type { User } from '@/types';

interface UseAdminAuthResult {
  user: User | null;
  loading: boolean;
  error: Error | null;
  isAdmin: boolean;
  checkAdminPermission: () => Promise<boolean>;
}

/**
 * 管理员权限检查 Hook
 * 
 * @param requireAdmin - 是否要求管理员权限（默认true）
 * @param redirectTo - 未授权时重定向的路径（默认'/login'）
 * @returns 用户信息、加载状态、错误信息、是否为管理员
 */
export function useAdminAuth(
  requireAdmin: boolean = true,
  redirectTo: string = '/login'
): UseAdminAuthResult {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);

  const checkAdminPermission = async (): Promise<boolean> => {
    try {
      // 获取当前用户信息
      const userData = await api.get<User>('/auth/me', true);

      console.log('🔍 Admin Auth Check:', {
        userData,
        isAdmin: userData.is_admin,
        role: userData.role,
        requireAdmin,
      });

      setUser(userData);
      setIsAdmin(userData.is_admin);

      // 检查是否需要管理员权限
      if (requireAdmin && !userData.is_admin) {
        console.warn('❌ User is not an admin, redirecting to /403');
        console.warn('User data:', userData);
        router.push('/403'); // 重定向到403权限不足页面
        return false;
      }

      // 检查账户是否激活
      if (!userData.is_active) {
        console.warn('User account is not active');
        router.push('/login');
        return false;
      }

      return true;
    } catch (err) {
      console.error('Admin auth check failed:', err);

      if (err instanceof APIError) {
        // 401未授权 - 重定向到登录页
        if (err.statusCode === 401) {
          router.push(redirectTo);
          return false;
        }

        // 403权限不足
        if (err.statusCode === 403) {
          router.push('/403');
          return false;
        }

        setError(err);
      } else if (err instanceof Error) {
        setError(err);
      }

      return false;
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    checkAdminPermission();
  }, [requireAdmin, redirectTo]);

  return {
    user,
    loading,
    error,
    isAdmin,
    checkAdminPermission,
  };
}

/**
 * 检查当前用户是否为管理员（不自动重定向）
 */
export async function checkIsAdmin(): Promise<boolean> {
  try {
    const userData = await api.get<User>('/auth/me', true);
    return userData.is_admin;
  } catch (error) {
    console.error('Failed to check admin status:', error);
    return false;
  }
}
