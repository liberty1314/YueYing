/**
 * Admin Layout - 管理后台布局
 * 使用统一的 AdminLayout 组件
 */

'use client';

import { AdminLayout } from '@/components/features/admin/AdminLayout';

export default function AdminRootLayout({ children }: { children: React.ReactNode }) {
  // AdminLayout 组件内部已包含权限检查和 ProtectedRoute
  return <AdminLayout>{children}</AdminLayout>;
}
