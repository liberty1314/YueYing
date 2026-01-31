/**
 * DeleteConfirmDialog - 删除确认对话框组件
 * 
 * 功能：
 * - 使用 AppleDialog 作为基础
 * - 显示确认消息和警告信息
 * - 实现确认和取消按钮
 * - 支持自定义标题、消息和警告文本
 * - 支持加载状态
 * 
 * 验证需求: 13.3
 * 
 * @component
 * @example
 * ```tsx
 * // 基础用法
 * <DeleteConfirmDialog
 *   open={open}
 *   onClose={handleClose}
 *   onConfirm={handleDelete}
 *   title="删除用户"
 *   message="确定要删除用户 "张三" 吗？"
 *   warning="此操作无法撤销，用户的所有数据将被永久删除。"
 * />
 * 
 * // 自定义确认按钮文本
 * <DeleteConfirmDialog
 *   open={open}
 *   onClose={handleClose}
 *   onConfirm={handleDelete}
 *   title="清空数据"
 *   message="确定要清空所有数据吗？"
 *   confirmText="清空"
 * />
 * ```
 */

'use client';

import {
  DialogTitle,
  DialogContent,
  DialogActions,
  IconButton,
  Box,
  Typography,
} from '@mui/material';
import { X, AlertTriangle } from 'lucide-react';
import { AppleDialog } from '../ui/AppleDialog';
import { AppleButton } from '../ui/AppleButton';

/**
 * DeleteConfirmDialog 组件属性接口
 */
export interface DeleteConfirmDialogProps {
  /** 对话框是否打开 */
  open: boolean;
  /** 关闭对话框回调 */
  onClose: () => void;
  /** 确认删除回调 */
  onConfirm: () => void | Promise<void>;
  /** 对话框标题 */
  title?: string;
  /** 确认消息 */
  message: string;
  /** 警告文本（可选） */
  warning?: string;
  /** 确认按钮文本 */
  confirmText?: string;
  /** 取消按钮文本 */
  cancelText?: string;
  /** 加载状态 */
  loading?: boolean;
}

/**
 * DeleteConfirmDialog 删除确认对话框组件
 * 
 * 验证需求: 13.3
 */
export function DeleteConfirmDialog({
  open,
  onClose,
  onConfirm,
  title = '确认删除',
  message,
  warning,
  confirmText = '删除',
  cancelText = '取消',
  loading = false,
}: DeleteConfirmDialogProps) {
  /**
   * 处理确认操作
   */
  const handleConfirm = async () => {
    try {
      await onConfirm();
      // 如果 onConfirm 没有关闭对话框，则自动关闭
      if (open) {
        onClose();
      }
    } catch (error) {
      // 错误处理由父组件负责（通过 toast）
      console.error('Delete confirmation error:', error);
    }
  };

  return (
    <AppleDialog
      open={open}
      onClose={onClose}
      maxWidth="xs"
      fullWidth
      aria-labelledby="delete-confirm-dialog-title"
      aria-describedby="delete-confirm-dialog-description"
      aria-modal="true"
      role="dialog"
    >
      {/* 对话框标题 */}
      <DialogTitle
        id="delete-confirm-dialog-title"
        sx={{
          fontSize: '20px',
          fontWeight: 600,
          padding: '24px 24px 16px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          color: 'var(--color-error)',
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
          <AlertTriangle size={24} />
          <span>{title}</span>
        </Box>
        <IconButton
          onClick={onClose}
          size="small"
          aria-label="关闭对话框"
          disabled={loading}
          sx={{
            color: 'text.secondary',
            '&:hover': {
              backgroundColor: 'action.hover',
            },
            '&:disabled': {
              opacity: 0.5,
            },
          }}
        >
          <X size={20} />
        </IconButton>
      </DialogTitle>

      {/* 对话框内容 */}
      <DialogContent
        id="delete-confirm-dialog-description"
        sx={{
          padding: '16px 24px',
        }}
      >
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          {/* 确认消息 */}
          <Typography
            variant="body1"
            sx={{
              color: 'var(--color-text-primary)',
              fontSize: '16px',
              lineHeight: 1.6,
            }}
          >
            {message}
          </Typography>

          {/* 警告信息 */}
          {warning && (
            <Box
              sx={{
                padding: '12px 16px',
                borderRadius: 'var(--radius-md)',
                backgroundColor: 'rgba(255, 59, 48, 0.1)',
                border: '1px solid rgba(255, 59, 48, 0.2)',
              }}
            >
              <Typography
                variant="body2"
                sx={{
                  color: 'var(--color-error)',
                  fontSize: '14px',
                  lineHeight: 1.5,
                  display: 'flex',
                  alignItems: 'flex-start',
                  gap: 1,
                }}
              >
                <AlertTriangle size={16} style={{ flexShrink: 0, marginTop: 2 }} />
                <span>{warning}</span>
              </Typography>
            </Box>
          )}
        </Box>
      </DialogContent>

      {/* 对话框操作按钮 */}
      <DialogActions
        sx={{
          padding: '16px 24px 24px',
          gap: 2,
        }}
      >
        <AppleButton
          variant="ghost"
          onClick={onClose}
          disabled={loading}
          fullWidth
        >
          {cancelText}
        </AppleButton>

        <AppleButton
          variant="primary"
          onClick={handleConfirm}
          disabled={loading}
          fullWidth
          sx={{
            backgroundColor: 'var(--color-error)',
            '&:hover': {
              backgroundColor: 'var(--color-error)',
              opacity: 0.9,
            },
            '&:active': {
              backgroundColor: 'var(--color-error)',
              opacity: 0.8,
            },
          }}
        >
          {loading ? '删除中...' : confirmText}
        </AppleButton>
      </DialogActions>
    </AppleDialog>
  );
}

export default DeleteConfirmDialog;
