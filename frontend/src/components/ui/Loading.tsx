import { Box, CircularProgress, Typography } from '@mui/material';

/**
 * 加载组件的属性接口
 * 
 * @interface LoadingProps
 */
interface LoadingProps {
    /**
     * 加载提示消息
     * @optional
     */
    message?: string;

    /**
     * 加载指示器的大小（像素）
     * @default 40
     */
    size?: number;

    /**
     * 是否全屏显示
     * 启用后会创建全屏遮罩层
     * @default false
     */
    fullScreen?: boolean;
}

/**
 * 加载指示器组件
 * 
 * 用于显示加载状态的组件，支持自定义大小、消息和全屏模式。
 * 
 * @component
 * @example
 * ```tsx
 * // 基础加载器
 * <Loading />
 * 
 * // 带消息的加载器
 * <Loading message="加载中..." />
 * 
 * // 自定义大小
 * <Loading size={60} />
 * 
 * // 全屏加载
 * <Loading fullScreen message="正在处理..." />
 * ```
 * 
 * @param {LoadingProps} props - 组件属性
 * @returns {JSX.Element} 加载指示器组件
 */
export function Loading({ message, size = 40, fullScreen = false }: LoadingProps) {
    const content = (
        <Box
            sx={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 2,
            }}
        >
            <CircularProgress size={size} />
            {message && (
                <Typography variant="body2" color="text.secondary">
                    {message}
                </Typography>
            )}
        </Box>
    );

    if (fullScreen) {
        return (
            <Box
                sx={{
                    position: 'fixed',
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    backgroundColor: 'rgba(0, 0, 0, 0.5)',
                    zIndex: 9999,
                }}
            >
                {content}
            </Box>
        );
    }

    return content;
}

export default Loading;
