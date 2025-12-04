'use client';

import { useState } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { X } from 'lucide-react';
import { MenuItem, Alert, Collapse, Typography, Box } from '@mui/material';

// shadcn/ui Dialog 组件
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter,
    DialogPortal,
    DialogOverlay,
} from '@/components/ui/dialog';

// 保留 Material-UI 的表单组件（因为它们支持 select 和 multiline）
import { AppleButton, AppleInput } from '@/components/ui';

import { addToLibrary } from '@/utils/library';
import type { ItemStatus } from '@/types';
import { statusLabels } from '@/lib/adapters/userItemAdapter';

const addToLibrarySchema = z.object({
    status: z.enum(['want_to_watch', 'watching', 'watched']),
    rating: z.number().min(0).max(10).optional().nullable(),
    notes: z.string().optional(),
    progress: z.number().min(0).optional().nullable(),
    started_at: z.string().optional(),
    completed_at: z.string().optional(),
});

type AddToLibraryFormData = z.infer<typeof addToLibrarySchema>;

interface AddToLibraryDialogProps {
    open: boolean;
    content: any;
    onClose: () => void;
    onSuccess: () => void;
}

const itemStatuses: { value: ItemStatus; label: string }[] = [
    { value: 'want_to_watch', label: statusLabels.want_to_watch },
    { value: 'watching', label: statusLabels.watching },
    { value: 'watched', label: statusLabels.watched },
];

/**
 * 添加到收藏库对话框
 * 
 * 采用 shadcn/ui (Radix UI) Dialog 组件，解决与 ResourceDetailModal 的嵌套冲突问题
 * 关键技术点：
 * 1. 使用 DialogPortal 确保渲染到 body 根节点
 * 2. 设置 z-index 为 9999，远高于 ResourceDetailModal 的 z-50
 * 3. 统一使用 Radix UI Dialog，避免 Material-UI 和 Radix UI 的 Focus Trap 冲突
 */
export default function AddToLibraryDialog({
    open,
    content,
    onClose,
    onSuccess,
}: AddToLibraryDialogProps) {
    const [error, setError] = useState<string>('');
    const [loading, setLoading] = useState(false);

    const {
        register,
        handleSubmit,
        formState: { errors },
        reset,
        watch,
        control,
    } = useForm<AddToLibraryFormData>({
        resolver: zodResolver(addToLibrarySchema),
        defaultValues: {
            status: 'want_to_watch',
            rating: undefined,
            notes: '',
            progress: undefined,
            started_at: undefined,
            completed_at: undefined,
        },
    });

    const currentStatus = watch('status');

    const onSubmit = async (data: AddToLibraryFormData) => {
        console.log('=== AddToLibraryDialog onSubmit ===');
        console.log('Form data:', data);
        console.log('Content:', content);

        if (!content) {
            console.error('Content is null, cannot submit');
            setError('内容信息缺失，无法添加');
            return;
        }

        try {
            setLoading(true);
            setError('');

            // 处理null值，转换为undefined
            const cleanedData = {
                rating: data.rating ?? undefined,
                progress: data.progress ?? undefined,
                notes: data.notes,
                started_at: data.started_at,
                completed_at: data.completed_at,
            };

            // 合并content和表单数据
            const itemToAdd = {
                ...content,
                ...cleanedData,
                status: data.status,
            };

            console.log('Item to add:', itemToAdd);

            const result = await addToLibrary(itemToAdd, data.status);

            console.log('Add result:', result);

            if (result.success) {
                reset();
                onSuccess();
                onClose();
            } else {
                setError(result.message);
            }
        } catch (err: unknown) {
            console.error('Add to library error:', err);
            setError(err instanceof Error ? err.message : '添加失败，请重试');
        } finally {
            setLoading(false);
        }
    };

    const handleClose = () => {
        if (!loading) {
            reset({
                status: 'want_to_watch',
                rating: undefined,
                notes: '',
                progress: undefined,
                started_at: undefined,
                completed_at: undefined,
            });
            setError('');
            onClose();
        }
    };

    const contentTitle = content?.title || content?.name || content?.name_cn || '未知内容';

    return (
        <Dialog open={open} onOpenChange={handleClose}>
            <DialogPortal>
                {/* 
                  自定义遮罩层 - 设置 z-index 为 9998
                  确保在 ResourceDetailModal (z-50) 之上
                */}
                <DialogOverlay className="fixed inset-0 z-[9998] bg-black/60 backdrop-blur-sm data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0" />

                {/* 
                  Dialog 内容 - 设置 z-index 为 9999
                  Apple 风格：大圆角、柔和阴影、磨砂玻璃背景
                */}
                <DialogContent
                    className="fixed left-[50%] top-[50%] z-[9999] w-[95vw] max-w-lg translate-x-[-50%] translate-y-[-50%] rounded-3xl bg-white/98 p-0 shadow-2xl backdrop-blur-xl dark:bg-gray-900/98 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95"
                    // 阻止默认的关闭按钮，使用自定义关闭按钮
                    onPointerDownOutside={(e) => {
                        if (!loading) {
                            handleClose();
                        } else {
                            e.preventDefault();
                        }
                    }}
                    onEscapeKeyDown={(e) => {
                        if (!loading) {
                            handleClose();
                        } else {
                            e.preventDefault();
                        }
                    }}
                >
                    {/* Header - 标题 + 关闭按钮 */}
                    <DialogHeader className="relative px-8 pt-8 pb-4">
                        <DialogTitle className="text-2xl font-semibold text-gray-900 dark:text-white">
                            添加到收藏库
                        </DialogTitle>
                        <Typography
                            variant="body2"
                            className="mt-2 text-sm font-normal text-gray-500 dark:text-gray-400"
                        >
                            {contentTitle}
                        </Typography>

                        {/* 关闭按钮 - 绝对定位在右上角 */}
                        <button
                            onClick={handleClose}
                            disabled={loading}
                            className="absolute right-6 top-6 rounded-full p-2 text-gray-400 transition-all hover:bg-gray-100 hover:text-gray-600 disabled:cursor-not-allowed disabled:opacity-50 dark:hover:bg-gray-800 dark:hover:text-gray-200"
                            aria-label="关闭"
                        >
                            <X className="h-5 w-5" />
                        </button>
                    </DialogHeader>

                    {/* Form Content */}
                    <form onSubmit={handleSubmit(onSubmit, (errors) => {
                        console.log('=== Form validation errors ===');
                        console.log('Errors:', errors);
                    })}>
                        <div className="px-8 py-4 max-h-[60vh] overflow-y-auto">
                            {/* 错误提示 */}
                            {error && (
                                <Alert severity="error" sx={{ mb: 3, borderRadius: 3 }}>
                                    {error}
                                </Alert>
                            )}

                            {/* 表单验证失败提示 */}
                            {Object.keys(errors).length > 0 && (
                                <Alert severity="warning" sx={{ mb: 3, borderRadius: 3 }}>
                                    表单验证失败，请检查输入
                                </Alert>
                            )}

                            {/* 表单字段 */}
                            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
                                {/* 状态选择 - 必填，放在最前面 */}
                                <Controller
                                    name="status"
                                    control={control}
                                    render={({ field }) => (
                                        <AppleInput
                                            label="观看状态 *"
                                            select
                                            fullWidth
                                            error={!!errors.status}
                                            helperText={errors.status?.message || '请选择观看状态'}
                                            {...field}
                                            // 关键修复：配置 Select 下拉菜单
                                            // 1. 提升 z-index 确保菜单在最上层
                                            // 2. 禁用 Menu 的 backdrop，避免事件拦截
                                            // 3. 确保 pointer-events 正确
                                            SelectProps={{
                                                MenuProps: {
                                                    disablePortal: false, // 使用 Portal 渲染（默认行为）
                                                    sx: {
                                                        zIndex: 10000, // Menu 容器的 z-index
                                                        pointerEvents: 'auto', // 确保可以接收指针事件
                                                    },
                                                    slotProps: {
                                                        root: {
                                                            sx: {
                                                                zIndex: 10000, // Menu 根元素的 z-index
                                                            }
                                                        }
                                                    },
                                                    // 禁用 Menu 的背景遮罩，避免拦截点击事件
                                                    BackdropProps: {
                                                        invisible: true, // 让背景透明且不拦截事件
                                                    },
                                                }
                                            }}
                                        >
                                            {itemStatuses.map((status) => (
                                                <MenuItem key={status.value} value={status.value}>
                                                    {status.label}
                                                </MenuItem>
                                            ))}
                                        </AppleInput>
                                    )}
                                />

                                {/* 在看状态 - 显示进度和开始日期 */}
                                <Collapse in={currentStatus === 'watching'} timeout="auto">
                                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
                                        <AppleInput
                                            label="观看进度（可选）"
                                            type="number"
                                            placeholder="例如：第5集、第100页"
                                            fullWidth
                                            error={!!errors.progress}
                                            helperText={errors.progress?.message || '当前观看到第几集/第几页'}
                                            slotProps={{ htmlInput: { min: 0, step: 1 } }}
                                            {...register('progress', {
                                                setValueAs: (v) => v === '' || isNaN(v) ? undefined : Number(v)
                                            })}
                                        />
                                        <AppleInput
                                            label="开始日期（可选）"
                                            type="date"
                                            fullWidth
                                            error={!!errors.started_at}
                                            helperText={errors.started_at?.message}
                                            slotProps={{ inputLabel: { shrink: true } }}
                                            {...register('started_at')}
                                        />
                                    </Box>
                                </Collapse>

                                {/* 已看状态 - 显示评分、观看感受和完成日期 */}
                                <Collapse in={currentStatus === 'watched'} timeout="auto">
                                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
                                        <AppleInput
                                            label="评分（可选）"
                                            type="number"
                                            placeholder="0-10分"
                                            fullWidth
                                            error={!!errors.rating}
                                            helperText={errors.rating?.message || '给这部作品打个分吧'}
                                            slotProps={{ htmlInput: { min: 0, max: 10, step: 0.1 } }}
                                            {...register('rating', {
                                                setValueAs: (v) => v === '' || isNaN(v) ? undefined : Number(v)
                                            })}
                                        />
                                        <AppleInput
                                            label="观看感受（可选）"
                                            placeholder="分享你的观看感受..."
                                            multiline
                                            rows={4}
                                            fullWidth
                                            error={!!errors.notes}
                                            helperText={errors.notes?.message}
                                            {...register('notes')}
                                        />
                                        <AppleInput
                                            label="完成日期（可选）"
                                            type="date"
                                            fullWidth
                                            error={!!errors.completed_at}
                                            helperText={errors.completed_at?.message}
                                            slotProps={{ inputLabel: { shrink: true } }}
                                            {...register('completed_at')}
                                        />
                                    </Box>
                                </Collapse>

                                {/* 想看状态 - 只显示备注 */}
                                <Collapse in={currentStatus === 'want_to_watch'} timeout="auto">
                                    <AppleInput
                                        label="备注（可选）"
                                        placeholder="添加一些备注..."
                                        multiline
                                        rows={3}
                                        fullWidth
                                        error={!!errors.notes}
                                        helperText={errors.notes?.message}
                                        {...register('notes')}
                                    />
                                </Collapse>
                            </Box>
                        </div>

                        {/* Footer - 操作按钮 */}
                        <DialogFooter className="flex items-center justify-end gap-3 px-8 pb-8 pt-4">
                            <AppleButton
                                variant="ghost"
                                onClick={handleClose}
                                disabled={loading}
                                sx={{ minWidth: 100, height: 44 }}
                            >
                                取消
                            </AppleButton>
                            <AppleButton
                                variant="primary"
                                type="submit"
                                disabled={loading}
                                onClick={(e) => {
                                    console.log('Button clicked!');
                                    console.log('Button type:', e.currentTarget.type);
                                }}
                                sx={{ minWidth: 100, height: 44 }}
                            >
                                {loading ? '添加中...' : '添加'}
                            </AppleButton>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </DialogPortal>
        </Dialog>
    );
}
