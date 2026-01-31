/**
 * UserDialog - 用户对话框组件
 * 
 * 功能：
 * - 支持三种模式：创建、编辑、查看
 * - 使用 React Hook Form + Zod 进行表单验证
 * - 使用 AppleInput 和 AppleSelect 组件
 * - 实现表单提交和错误处理
 * - 添加成功/失败 Toast 提示
 * 
 * 验证需求: 5.6, 6.2, 6.3, 6.4, 6.7, 6.8
 * 
 * @component
 * @example
 * ```tsx
 * // 创建模式
 * <UserDialog
 *   open={open}
 *   onClose={handleClose}
 *   mode="create"
 *   onSubmit={handleCreate}
 * />
 * 
 * // 编辑模式
 * <UserDialog
 *   open={open}
 *   onClose={handleClose}
 *   mode="edit"
 *   user={selectedUser}
 *   onSubmit={handleUpdate}
 * />
 * 
 * // 查看模式
 * <UserDialog
 *   open={open}
 *   onClose={handleClose}
 *   mode="view"
 *   user={selectedUser}
 * />
 * ```
 */

'use client';

import { useEffect } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import {
  DialogTitle,
  DialogContent,
  DialogActions,
  IconButton,
  Box,
  Typography,
} from '@mui/material';
import { X, User, Mail, Lock } from 'lucide-react';
import { AppleDialog } from '../ui/AppleDialog';
import { AppleInput } from '../ui/AppleInput';
import { AppleSelect } from '../ui/AppleSelect';
import { AppleSwitch } from '../ui/AppleSwitch';
import { AppleButton } from '../ui/AppleButton';
import type { AdminUser } from '@/lib/api/admin';

/**
 * 对话框模式
 */
export type UserDialogMode = 'create' | 'edit' | 'view';

/**
 * 表单数据接口
 */
export interface UserFormData {
  username: string;
  email: string;
  password?: string;
  role: 'user' | 'admin';
  is_active: boolean;
}

/**
 * UserDialog 组件属性接口
 */
export interface UserDialogProps {
  /** 对话框是否打开 */
  open: boolean;
  /** 关闭对话框回调 */
  onClose: () => void;
  /** 对话框模式 */
  mode: UserDialogMode;
  /** 用户数据（编辑和查看模式必需） */
  user?: AdminUser;
  /** 表单提交回调 */
  onSubmit?: (data: UserFormData) => Promise<void>;
  /** 提交中状态 */
  loading?: boolean;
}

/**
 * 创建模式的表单验证 Schema
 */
const createSchema = z.object({
  username: z
    .string()
    .min(3, '用户名至少 3 个字符')
    .max(50, '用户名最多 50 个字符')
    .regex(/^[a-zA-Z0-9_-]+$/, '用户名只能包含字母、数字、下划线和连字符'),
  email: z
    .string()
    .min(1, '邮箱不能为空')
    .regex(/^[^\s@]+@[^\s@]+\.[^\s@]+$/, '请输入有效的邮箱地址')
    .max(100, '邮箱最多 100 个字符'),
  password: z
    .string()
    .min(8, '密码至少 8 个字符')
    .max(100, '密码最多 100 个字符')
    .regex(
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
      '密码必须包含大小写字母和数字'
    ),
  role: z.enum(['user', 'admin'], {
    message: '请选择用户角色',
  }),
  is_active: z.boolean(),
});

/**
 * 编辑模式的表单验证 Schema（密码可选）
 */
const editSchema = z.object({
  username: z
    .string()
    .min(3, '用户名至少 3 个字符')
    .max(50, '用户名最多 50 个字符')
    .regex(/^[a-zA-Z0-9_-]+$/, '用户名只能包含字母、数字、下划线和连字符'),
  email: z
    .string()
    .min(1, '邮箱不能为空')
    .regex(/^[^\s@]+@[^\s@]+\.[^\s@]+$/, '请输入有效的邮箱地址')
    .max(100, '邮箱最多 100 个字符'),
  password: z
    .string()
    .optional()
    .refine(
      (val) => !val || (val.length >= 8 && val.length <= 100),
      '密码长度应在 8-100 个字符之间'
    )
    .refine(
      (val) => !val || /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(val),
      '密码必须包含大小写字母和数字'
    ),
  role: z.enum(['user', 'admin'], {
    message: '请选择用户角色',
  }),
  is_active: z.boolean(),
});

/**
 * 角色选项
 */
const roleOptions = [
  { label: '普通用户', value: 'user' },
  { label: '管理员', value: 'admin' },
];

/**
 * UserDialog 用户对话框组件
 * 
 * 验证需求: 5.6, 6.2, 6.3, 6.4, 6.7, 6.8
 */
export function UserDialog({
  open,
  onClose,
  mode,
  user,
  onSubmit,
  loading = false,
}: UserDialogProps) {
  // 根据模式选择验证 Schema
  const schema = mode === 'create' ? createSchema : editSchema;

  // 初始化表单
  const {
    control,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<UserFormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      username: '',
      email: '',
      password: '',
      role: 'user',
      is_active: true,
    },
  });

  // 当用户数据或模式变化时，重置表单
  useEffect(() => {
    if (open) {
      if (mode === 'create') {
        reset({
          username: '',
          email: '',
          password: '',
          role: 'user',
          is_active: true,
        });
      } else if (user) {
        reset({
          username: user.username,
          email: user.email,
          password: '',
          role: user.role,
          is_active: user.is_active,
        });
      }
    }
  }, [open, mode, user, reset]);

  /**
   * 处理表单提交
   */
  const handleFormSubmit = async (data: UserFormData) => {
    if (!onSubmit) return;

    try {
      // 如果是编辑模式且密码为空，则不提交密码字段
      const submitData = { ...data };
      if (mode === 'edit' && !submitData.password) {
        delete submitData.password;
      }

      await onSubmit(submitData);
      onClose();
    } catch (error) {
      // 错误处理由父组件负责（通过 toast）
      console.error('Form submission error:', error);
    }
  };

  /**
   * 获取对话框标题
   */
  const getDialogTitle = () => {
    switch (mode) {
      case 'create':
        return '创建用户';
      case 'edit':
        return '编辑用户';
      case 'view':
        return '用户详情';
      default:
        return '';
    }
  };

  /**
   * 是否为只读模式
   */
  const isReadOnly = mode === 'view';

  /**
   * 是否显示提交按钮
   */
  const showSubmitButton = mode !== 'view';

  return (
    <AppleDialog
      open={open}
      onClose={onClose}
      maxWidth="sm"
      fullWidth
      aria-labelledby="user-dialog-title"
      aria-describedby="user-dialog-description"
    >
      {/* 对话框标题 */}
      <DialogTitle
        id="user-dialog-title"
        sx={{
          fontSize: '24px',
          fontWeight: 600,
          padding: '24px 24px 16px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}
      >
        <span>{getDialogTitle()}</span>
        <IconButton
          onClick={onClose}
          size="small"
          aria-label="关闭对话框"
          sx={{
            color: 'text.secondary',
            '&:hover': {
              backgroundColor: 'action.hover',
            },
          }}
        >
          <X size={20} />
        </IconButton>
      </DialogTitle>

      {/* 对话框内容 */}
      <DialogContent
        id="user-dialog-description"
        sx={{
          padding: '16px 24px',
        }}
      >
        <form onSubmit={handleSubmit(handleFormSubmit)} id="user-form">
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
            {/* 用户名字段 */}
            <Controller
              name="username"
              control={control}
              render={({ field }) => (
                <AppleInput
                  {...field}
                  label="用户名"
                  placeholder="请输入用户名"
                  leftIcon={User}
                  error={errors.username?.message}
                  helpText={
                    !errors.username && !isReadOnly
                      ? '只能包含字母、数字、下划线和连字符'
                      : undefined
                  }
                  disabled={isReadOnly || loading}
                  autoComplete="username"
                />
              )}
            />

            {/* 邮箱字段 */}
            <Controller
              name="email"
              control={control}
              render={({ field }) => (
                <AppleInput
                  {...field}
                  label="邮箱"
                  type="email"
                  placeholder="请输入邮箱地址"
                  leftIcon={Mail}
                  error={errors.email?.message}
                  disabled={isReadOnly || loading}
                  autoComplete="email"
                />
              )}
            />

            {/* 密码字段 */}
            {!isReadOnly && (
              <Controller
                name="password"
                control={control}
                render={({ field }) => (
                  <AppleInput
                    {...field}
                    label={mode === 'create' ? '密码' : '新密码（可选）'}
                    type="password"
                    placeholder={
                      mode === 'create'
                        ? '请输入密码'
                        : '留空则不修改密码'
                    }
                    leftIcon={Lock}
                    error={errors.password?.message}
                    helpText={
                      !errors.password
                        ? '密码必须包含大小写字母和数字，至少 8 个字符'
                        : undefined
                    }
                    disabled={loading}
                    autoComplete={mode === 'create' ? 'new-password' : 'off'}
                  />
                )}
              />
            )}

            {/* 角色字段 */}
            <Controller
              name="role"
              control={control}
              render={({ field: { value, onChange, ...field } }) => (
                <AppleSelect
                  {...field}
                  value={value}
                  onValueChange={onChange}
                  label="角色"
                  options={roleOptions}
                  placeholder="请选择角色"
                  error={errors.role?.message}
                  disabled={isReadOnly || loading}
                  name="role"
                />
              )}
            />

            {/* 状态开关 */}
            <Controller
              name="is_active"
              control={control}
              render={({ field: { value, onChange } }) => (
                <Box>
                  <AppleSwitch
                    checked={value}
                    onCheckedChange={onChange}
                    label="账户状态"
                    description={
                      value ? '账户已启用，用户可以正常登录' : '账户已禁用，用户无法登录'
                    }
                    disabled={isReadOnly || loading}
                  />
                </Box>
              )}
            />

            {/* 查看模式下显示额外信息 */}
            {isReadOnly && user && (
              <Box
                sx={{
                  mt: 2,
                  p: 2,
                  borderRadius: 'var(--radius-md)',
                  backgroundColor: 'var(--color-background-paper)',
                }}
              >
                <Typography
                  variant="body2"
                  sx={{
                    color: 'var(--color-text-secondary)',
                    mb: 1,
                  }}
                >
                  创建时间：{new Date(user.created_at).toLocaleString('zh-CN')}
                </Typography>
                <Typography
                  variant="body2"
                  sx={{
                    color: 'var(--color-text-secondary)',
                  }}
                >
                  更新时间：{new Date(user.updated_at).toLocaleString('zh-CN')}
                </Typography>
              </Box>
            )}
          </Box>
        </form>
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
          disabled={loading || isSubmitting}
          fullWidth
        >
          {isReadOnly ? '关闭' : '取消'}
        </AppleButton>

        {showSubmitButton && (
          <AppleButton
            variant="primary"
            type="submit"
            form="user-form"
            disabled={loading || isSubmitting}
            fullWidth
          >
            {isSubmitting || loading
              ? '提交中...'
              : mode === 'create'
              ? '创建'
              : '保存'}
          </AppleButton>
        )}
      </DialogActions>
    </AppleDialog>
  );
}

export default UserDialog;
