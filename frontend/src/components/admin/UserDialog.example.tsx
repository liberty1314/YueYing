/**
 * UserDialog 组件使用示例
 * 
 * 展示如何在不同场景下使用 UserDialog 组件
 */

'use client';

import { useState } from 'react';
import { Box, Typography } from '@mui/material';
import { AppleButton } from '@/components/ui/AppleButton';
import { UserDialog, UserFormData } from './UserDialog';
import type { AdminUser } from '@/lib/api/admin';

/**
 * 模拟用户数据
 */
const mockUser: AdminUser = {
  id: 1,
  username: 'johndoe',
  email: 'john@example.com',
  role: 'user',
  is_active: true,
  created_at: '2024-01-01T00:00:00Z',
  updated_at: '2024-01-15T10:30:00Z',
};

/**
 * UserDialog 使用示例组件
 */
export function UserDialogExample() {
  const [createOpen, setCreateOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [viewOpen, setViewOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState<{
    message: string;
    type: 'success' | 'error';
  } | null>(null);

  /**
   * 显示 Toast 提示
   */
  const showToast = (message: string, type: 'success' | 'error') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  /**
   * 处理创建用户
   */
  const handleCreate = async (data: UserFormData) => {
    setLoading(true);
    try {
      // 模拟 API 调用
      await new Promise((resolve) => setTimeout(resolve, 1000));
      console.log('创建用户:', data);
      showToast('用户创建成功', 'success');
    } catch (error) {
      showToast('创建失败', 'error');
      throw error;
    } finally {
      setLoading(false);
    }
  };

  /**
   * 处理编辑用户
   */
  const handleEdit = async (data: UserFormData) => {
    setLoading(true);
    try {
      // 模拟 API 调用
      await new Promise((resolve) => setTimeout(resolve, 1000));
      console.log('编辑用户:', data);
      showToast('用户信息已更新', 'success');
    } catch (error) {
      showToast('更新失败', 'error');
      throw error;
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box sx={{ p: 4 }}>
      <Typography variant="h4" sx={{ mb: 4 }}>
        UserDialog 组件示例
      </Typography>

      {/* 操作按钮 */}
      <Box sx={{ display: 'flex', gap: 2, mb: 4 }}>
        <AppleButton variant="primary" onClick={() => setCreateOpen(true)}>
          创建用户
        </AppleButton>
        <AppleButton variant="secondary" onClick={() => setEditOpen(true)}>
          编辑用户
        </AppleButton>
        <AppleButton variant="ghost" onClick={() => setViewOpen(true)}>
          查看用户
        </AppleButton>
      </Box>

      {/* Toast 提示 */}
      {toast && (
        <Box
          sx={{
            position: 'fixed',
            top: 24,
            right: 24,
            p: 2,
            borderRadius: 'var(--radius-md)',
            backgroundColor:
              toast.type === 'success'
                ? 'var(--color-success)'
                : 'var(--color-error)',
            color: 'white',
            boxShadow: 'var(--shadow-lg)',
            zIndex: 9999,
          }}
        >
          {toast.message}
        </Box>
      )}

      {/* 创建用户对话框 */}
      <UserDialog
        open={createOpen}
        onClose={() => setCreateOpen(false)}
        mode="create"
        onSubmit={handleCreate}
        loading={loading}
      />

      {/* 编辑用户对话框 */}
      <UserDialog
        open={editOpen}
        onClose={() => setEditOpen(false)}
        mode="edit"
        user={mockUser}
        onSubmit={handleEdit}
        loading={loading}
      />

      {/* 查看用户对话框 */}
      <UserDialog
        open={viewOpen}
        onClose={() => setViewOpen(false)}
        mode="view"
        user={mockUser}
      />

      {/* 使用说明 */}
      <Box sx={{ mt: 4 }}>
        <Typography variant="h6" sx={{ mb: 2 }}>
          使用说明
        </Typography>
        <Typography variant="body2" sx={{ mb: 1 }}>
          <strong>创建模式：</strong>所有字段必填，密码必须符合强度要求
        </Typography>
        <Typography variant="body2" sx={{ mb: 1 }}>
          <strong>编辑模式：</strong>密码字段可选，留空则不修改密码
        </Typography>
        <Typography variant="body2">
          <strong>查看模式：</strong>所有字段只读，显示创建和更新时间
        </Typography>
      </Box>
    </Box>
  );
}

export default UserDialogExample;
