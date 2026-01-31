/**
 * Users 用户管理页面
 * 
 * 功能：
 * - 使用现有的 useAdminUsers hook 获取用户列表
 * - 集成 UserTable 组件
 * - 集成 UserDialog 组件
 * - 集成 DeleteConfirmDialog 组件
 * - 实现创建、编辑、删除、启用/禁用用户功能
 * - 添加空状态处理
 * 
 * 验证需求: 5.1, 13.6, 15.1
 */

'use client';

import { useState } from 'react';
import { UserPlus, Users as UsersIcon } from 'lucide-react';
import { UserTable } from '@/components/admin/UserTable';
import { UserDialog, type UserFormData } from '@/components/admin/UserDialog';
import { DeleteConfirmDialog } from '@/components/admin/DeleteConfirmDialog';
import { EmptyState } from '@/components/shared/EmptyState';
import { AppleButton } from '@/components/ui/AppleButton';
import { useToast } from '@/hooks/use-toast';
import { useAdminUsers, type AdminUserResponse } from '@/hooks/useAdminUsers';
import { adminApi, type AdminUser } from '@/lib/api/admin';
import { cn } from '@/lib/utils';

/**
 * 转换 AdminUserResponse 到 AdminUser 类型
 */
function convertToAdminUser(user: AdminUserResponse): AdminUser {
  return {
    id: user.id,
    username: user.username || user.email.split('@')[0],
    email: user.email,
    role: user.role as 'user' | 'admin',
    is_active: user.is_active,
    created_at: user.created_at,
    updated_at: user.updated_at,
  };
}

/**
 * Users 用户管理页面组件
 */
export default function UsersPage() {
  // 状态管理
  const [dialogMode, setDialogMode] = useState<'create' | 'edit' | 'view' | null>(null);
  const [selectedUser, setSelectedUser] = useState<AdminUser | null>(null);
  const [deletingUser, setDeletingUser] = useState<AdminUser | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Hooks
  const { toast } = useToast();
  const { data, loading, error, refetch, updateUser, deleteUser, createAdmin } = useAdminUsers({
    page: 1,
    pageSize: 100, // 获取所有用户，由 UserTable 内部处理分页
  });

  /**
   * 处理创建用户
   */
  const handleCreate = () => {
    setDialogMode('create');
    setSelectedUser(null);
  };

  /**
   * 处理编辑用户
   */
  const handleEdit = (user: AdminUser) => {
    setDialogMode('edit');
    setSelectedUser(user);
  };

  /**
   * 处理删除用户
   */
  const handleDelete = (user: AdminUser) => {
    setDeletingUser(user);
  };

  /**
   * 处理切换用户状态
   */
  const handleToggleStatus = async (user: AdminUser) => {
    try {
      setIsSubmitting(true);
      await adminApi.toggleUserStatus(user.id);
      await refetch();
      toast({
        title: '状态已更新',
        description: `用户已${user.is_active ? '禁用' : '启用'}`,
        variant: 'success',
      });
    } catch (error) {
      toast({
        title: '操作失败',
        description: error instanceof Error ? error.message : '无法更新用户状态',
        variant: 'error',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  /**
   * 处理表单提交
   */
  const handleSubmit = async (data: UserFormData) => {
    try {
      setIsSubmitting(true);

      if (dialogMode === 'create') {
        // 创建模式
        await createAdmin({
          username: data.username,
          email: data.email,
          password: data.password!,
        });
        toast({
          title: '创建成功',
          description: '管理员账户已创建',
          variant: 'success',
        });
      } else if (dialogMode === 'edit' && selectedUser) {
        // 编辑模式
        await updateUser(selectedUser.id, {
          username: data.username,
          email: data.email,
          role: data.role,
          is_active: data.is_active,
        });
        toast({
          title: '更新成功',
          description: '用户信息已更新',
          variant: 'success',
        });
      }

      // 关闭对话框
      setDialogMode(null);
      setSelectedUser(null);
    } catch (error) {
      toast({
        title: dialogMode === 'create' ? '创建失败' : '更新失败',
        description: error instanceof Error ? error.message : '操作失败',
        variant: 'error',
      });
      throw error; // 重新抛出错误，让对话框保持打开状态
    } finally {
      setIsSubmitting(false);
    }
  };

  /**
   * 确认删除
   */
  const handleConfirmDelete = async () => {
    if (!deletingUser) return;

    try {
      setIsSubmitting(true);
      await deleteUser(deletingUser.id, false);
      toast({
        title: '删除成功',
        description: '用户已删除',
        variant: 'success',
      });
      setDeletingUser(null);
    } catch (error) {
      toast({
        title: '删除失败',
        description: error instanceof Error ? error.message : '无法删除用户',
        variant: 'error',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  // 转换用户列表
  const users: AdminUser[] = data?.users?.map(convertToAdminUser) || [];
  const totalUsers = data?.total || 0;

  // 是否显示空状态
  const showEmptyState = !loading && users.length === 0 && !error;

  return (
    <div className="space-y-6">
      {/* 页面头部 */}
      <div className="flex items-center justify-between">
        <div>
          <h1
            className={cn(
              'text-3xl font-bold',
              'text-[var(--color-text-primary)]',
              'mb-2'
            )}
          >
            用户管理
          </h1>
          <p className="text-sm text-[var(--color-text-secondary)]">
            共 {totalUsers} 个用户
          </p>
        </div>

        {/* 创建按钮 */}
        <AppleButton
          variant="primary"
          onClick={handleCreate}
          startIcon={<UserPlus className="w-5 h-5" />}
          disabled={isSubmitting}
        >
          创建管理员
        </AppleButton>
      </div>

      {/* 错误显示 */}
      {error && (
        <div
          className={cn(
            'p-4 rounded-[var(--radius-md)]',
            'bg-[var(--color-error)] bg-opacity-10',
            'border border-[var(--color-error)] border-opacity-20',
            'text-[var(--color-error)]'
          )}
        >
          <p className="font-medium">加载失败</p>
          <p className="text-sm mt-1">
            {error instanceof Error ? error.message : '无法加载用户列表'}
          </p>
        </div>
      )}

      {/* 空状态 */}
      {showEmptyState && (
        <EmptyState
          icon={UsersIcon}
          title="暂无用户"
          description="系统中还没有任何用户，点击上方按钮创建第一个管理员账户。"
          primaryAction={{
            label: '创建管理员',
            onClick: handleCreate,
          }}
        />
      )}

      {/* 用户表格 */}
      {!showEmptyState && (
        <UserTable
          users={users}
          loading={loading}
          onEdit={handleEdit}
          onDelete={handleDelete}
          onToggleStatus={handleToggleStatus}
        />
      )}

      {/* 用户对话框 */}
      {dialogMode && (
        <UserDialog
          open={true}
          onClose={() => {
            setDialogMode(null);
            setSelectedUser(null);
          }}
          mode={dialogMode}
          user={selectedUser || undefined}
          onSubmit={handleSubmit}
          loading={isSubmitting}
        />
      )}

      {/* 删除确认对话框 */}
      {deletingUser && (
        <DeleteConfirmDialog
          open={true}
          onClose={() => setDeletingUser(null)}
          onConfirm={handleConfirmDelete}
          title="确认删除用户"
          message={`确定要删除用户 "${deletingUser.username}" 吗？`}
          warning="此操作将禁用该用户账号（软删除），用户将无法登录系统。"
          loading={isSubmitting}
        />
      )}
    </div>
  );
}
