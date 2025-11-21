/**
 * Admin Users Management Page
 * Week 7 Day 4: 用户管理页面
 * 
 * 注意：此页面已被 /app/admin/layout.tsx 包装在 AdminLayout 中
 */

'use client';

import { useState } from 'react';
import {
  UserTable,
  UserFilterBar,
  UserEditDialog,
  CreateAdminDialog,
} from '@/components/features/admin';
import { useAdminUsers, type User, type UserListFilters } from '@/hooks/useAdminUsers';
import { PlusIcon, AlertTriangleIcon } from 'lucide-react';
import { Button } from '@/components/ui';

export default function UsersPage() {
  const [page, setPage] = useState(1);
  const [pageSize] = useState(20);
  const [filters, setFilters] = useState<UserListFilters>({});
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [deletingUser, setDeletingUser] = useState<User | null>(null);
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  const { data, loading, error, updateUser, deleteUser, createAdmin } = useAdminUsers({
    page,
    pageSize,
    filters,
  });

  const showToast = (message: string, type: 'success' | 'error') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  const handleFilterChange = (newFilters: UserListFilters) => {
    setFilters(newFilters);
    setPage(1);
  };

  const handleFilterReset = () => {
    setFilters({});
    setPage(1);
  };

  const handleEdit = (user: User) => {
    setEditingUser(user);
  };

  const handleDelete = (user: User) => {
    setDeletingUser(user);
  };

  const confirmDelete = async () => {
    if (!deletingUser) return;

    try {
      await deleteUser(deletingUser.id);
      showToast('用户已删除', 'success');
      setDeletingUser(null);
    } catch (err) {
      showToast(err instanceof Error ? err.message : '删除失败', 'error');
    }
  };

  return (
    <div className="space-y-6">
      {/* Toast 通知 */}
      {toast && (
        <div
          className={`fixed top-4 right-4 z-50 px-6 py-3 rounded-lg shadow-lg ${
            toast.type === 'success'
              ? 'bg-green-500 text-white'
              : 'bg-red-500 text-white'
          }`}
        >
          {toast.message}
        </div>
      )}

      {/* 页面头部 */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
            用户管理
          </h1>
          <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
            共 {data?.total || 0} 个用户
          </p>
        </div>
        <Button
          onClick={() => setCreateDialogOpen(true)}
          variant="primary"
          className="gap-2"
        >
          <PlusIcon className="w-5 h-5" />
          创建管理员
        </Button>
      </div>

      {/* 筛选栏 */}
      <UserFilterBar
        filters={filters}
        onFilterChange={handleFilterChange}
        onReset={handleFilterReset}
      />

      {/* 错误显示 */}
      {error && (
        <div className="p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg text-red-600 dark:text-red-400">
          加载失败: {error.message}
        </div>
      )}

      {/* 用户表格 */}
      <UserTable
        users={data?.users || []}
        loading={loading}
        onEdit={handleEdit}
        onDelete={handleDelete}
        currentPage={page}
        pageSize={pageSize}
        total={data?.total || 0}
        onPageChange={setPage}
      />

      {/* 编辑用户对话框 */}
      <UserEditDialog
        user={editingUser}
        isOpen={!!editingUser}
        onClose={() => setEditingUser(null)}
        onSubmit={async (userId, updateData) => {
          try {
            await updateUser(userId, updateData);
            showToast('用户信息已更新', 'success');
          } catch (err) {
            throw err;
          }
        }}
      />

      {/* 创建管理员对话框 */}
      <CreateAdminDialog
        isOpen={createDialogOpen}
        onClose={() => setCreateDialogOpen(false)}
        onSubmit={async (data) => {
          try {
            await createAdmin(data);
            showToast('管理员已创建', 'success');
          } catch (err) {
            throw err;
          }
        }}
      />

      {/* 删除确认对话框 */}
      {deletingUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
          <div className="bg-white dark:bg-gray-900 rounded-lg shadow-xl max-w-md w-full p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 bg-red-100 dark:bg-red-900/30 rounded-full">
                <AlertTriangleIcon className="w-6 h-6 text-red-600 dark:text-red-400" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                确认删除用户
              </h3>
            </div>
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              确定要删除用户 <strong>{deletingUser.email}</strong> 吗？
              <br />
              此操作将禁用该用户账号（软删除）。
            </p>
            <div className="flex gap-3">
              <Button
                variant="outline"
                onClick={() => setDeletingUser(null)}
                className="flex-1"
              >
                取消
              </Button>
              <Button
                variant="primary"
                onClick={confirmDelete}
                className="flex-1 bg-red-600 hover:bg-red-700"
              >
                确认删除
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
