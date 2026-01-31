/**
 * DeleteConfirmDialog 使用示例
 * 
 * 本文件展示了 DeleteConfirmDialog 组件的各种使用场景
 */

'use client';

import { useState } from 'react';
import { DeleteConfirmDialog } from './DeleteConfirmDialog';
import { AppleButton } from '../ui/AppleButton';
import { Box, Typography } from '@mui/material';

/**
 * 基础用法示例
 */
export function BasicExample() {
  const [open, setOpen] = useState(false);

  const handleDelete = async () => {
    // 模拟 API 调用
    await new Promise((resolve) => setTimeout(resolve, 1000));
    console.log('用户已删除');
    setOpen(false);
  };

  return (
    <Box>
      <Typography variant="h6" sx={{ mb: 2 }}>
        基础用法
      </Typography>
      <AppleButton onClick={() => setOpen(true)}>删除用户</AppleButton>

      <DeleteConfirmDialog
        open={open}
        onClose={() => setOpen(false)}
        onConfirm={handleDelete}
        title="删除用户"
        message='确定要删除用户 "张三" 吗？'
        warning="此操作无法撤销，用户的所有数据将被永久删除。"
      />
    </Box>
  );
}

/**
 * 自定义按钮文本示例
 */
export function CustomButtonTextExample() {
  const [open, setOpen] = useState(false);

  const handleClear = async () => {
    await new Promise((resolve) => setTimeout(resolve, 1000));
    console.log('数据已清空');
    setOpen(false);
  };

  return (
    <Box>
      <Typography variant="h6" sx={{ mb: 2 }}>
        自定义按钮文本
      </Typography>
      <AppleButton onClick={() => setOpen(true)}>清空数据</AppleButton>

      <DeleteConfirmDialog
        open={open}
        onClose={() => setOpen(false)}
        onConfirm={handleClear}
        title="清空数据"
        message="确定要清空所有数据吗？"
        confirmText="清空"
        cancelText="保留"
      />
    </Box>
  );
}

/**
 * 无警告信息示例
 */
export function NoWarningExample() {
  const [open, setOpen] = useState(false);

  const handleRemove = async () => {
    await new Promise((resolve) => setTimeout(resolve, 1000));
    console.log('项目已移除');
    setOpen(false);
  };

  return (
    <Box>
      <Typography variant="h6" sx={{ mb: 2 }}>
        无警告信息
      </Typography>
      <AppleButton onClick={() => setOpen(true)}>移除项目</AppleButton>

      <DeleteConfirmDialog
        open={open}
        onClose={() => setOpen(false)}
        onConfirm={handleRemove}
        title="移除项目"
        message="确定要从列表中移除此项目吗？"
      />
    </Box>
  );
}

/**
 * 加载状态示例
 */
export function LoadingExample() {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleDelete = async () => {
    setLoading(true);
    try {
      // 模拟 API 调用
      await new Promise((resolve) => setTimeout(resolve, 2000));
      console.log('文件已删除');
      setOpen(false);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box>
      <Typography variant="h6" sx={{ mb: 2 }}>
        加载状态
      </Typography>
      <AppleButton onClick={() => setOpen(true)}>删除文件</AppleButton>

      <DeleteConfirmDialog
        open={open}
        onClose={() => setOpen(false)}
        onConfirm={handleDelete}
        title="删除文件"
        message="确定要删除此文件吗？"
        warning="文件删除后将无法恢复。"
        loading={loading}
      />
    </Box>
  );
}

/**
 * 在用户管理中的实际使用示例
 */
export function UserManagementExample() {
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<{
    id: string;
    username: string;
  } | null>(null);
  const [loading, setLoading] = useState(false);

  // 模拟用户列表
  const users = [
    { id: '1', username: '张三' },
    { id: '2', username: '李四' },
    { id: '3', username: '王五' },
  ];

  const handleDeleteClick = (user: { id: string; username: string }) => {
    setSelectedUser(user);
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!selectedUser) return;

    setLoading(true);
    try {
      // 模拟 API 调用
      await new Promise((resolve) => setTimeout(resolve, 1500));
      console.log(`用户 ${selectedUser.username} 已删除`);
      setDeleteDialogOpen(false);
      setSelectedUser(null);
    } catch (error) {
      console.error('删除失败:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteCancel = () => {
    setDeleteDialogOpen(false);
    setSelectedUser(null);
  };

  return (
    <Box>
      <Typography variant="h6" sx={{ mb: 2 }}>
        用户管理中的实际使用
      </Typography>

      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
        {users.map((user) => (
          <Box
            key={user.id}
            sx={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: '12px 16px',
              borderRadius: 'var(--radius-md)',
              backgroundColor: 'var(--color-background-paper)',
            }}
          >
            <Typography>{user.username}</Typography>
            <AppleButton
              variant="ghost"
              size="small"
              onClick={() => handleDeleteClick(user)}
            >
              删除
            </AppleButton>
          </Box>
        ))}
      </Box>

      <DeleteConfirmDialog
        open={deleteDialogOpen}
        onClose={handleDeleteCancel}
        onConfirm={handleDeleteConfirm}
        title="删除用户"
        message={`确定要删除用户 "${selectedUser?.username}" 吗？`}
        warning="此操作无法撤销，用户的所有数据将被永久删除。"
        loading={loading}
      />
    </Box>
  );
}

/**
 * 所有示例的集合
 */
export function DeleteConfirmDialogExamples() {
  return (
    <Box sx={{ padding: 4, display: 'flex', flexDirection: 'column', gap: 4 }}>
      <Typography variant="h4" sx={{ mb: 2 }}>
        DeleteConfirmDialog 使用示例
      </Typography>

      <BasicExample />
      <CustomButtonTextExample />
      <NoWarningExample />
      <LoadingExample />
      <UserManagementExample />
    </Box>
  );
}

export default DeleteConfirmDialogExamples;
