import { Button as MuiButton, ButtonProps as MuiButtonProps, styled } from '@mui/material';

/**
 * Apple 风格按钮组件的属性接口
 * 
 * @interface AppleButtonProps
 * @extends {Omit<MuiButtonProps, 'variant'>}
 */
interface AppleButtonProps extends Omit<MuiButtonProps, 'variant'> {
    /**
     * 按钮变体
     * - primary: 主要按钮，蓝色渐变背景
     * - secondary: 次要按钮，紫色渐变背景
     * - ghost: 幽灵按钮，透明背景带边框
     * - text: 文本按钮，纯文本样式
     * 
     * @default 'primary'
     */
    variant?: 'primary' | 'secondary' | 'ghost' | 'text';
}

interface StyledButtonProps extends Omit<MuiButtonProps, 'variant'> {
    appleVariant?: 'primary' | 'secondary' | 'ghost' | 'text';
}

const StyledButton = styled(MuiButton, {
    shouldForwardProp: (prop) => prop !== 'appleVariant',
})<StyledButtonProps>(({ theme, appleVariant = 'primary' }) => ({
    borderRadius: 12,
    padding: '10px 20px',
    fontSize: '1rem',
    fontWeight: 500,
    textTransform: 'none',
    boxShadow: 'none',
    transition: 'all 0.2s ease',

    '&:hover': {
        boxShadow: 'none',
    },

    ...(appleVariant === 'primary' && {
        background: 'linear-gradient(180deg, #007AFF 0%, #0051D5 100%)',
        color: '#FFFFFF',
        boxShadow: '0 4px 16px rgba(0, 122, 255, 0.3)',
        '&:hover': {
            boxShadow: '0 6px 24px rgba(0, 122, 255, 0.4)',
            transform: 'translateY(-2px)',
        },
        '&:active': {
            transform: 'translateY(0)',
        },
    }),

    ...(appleVariant === 'secondary' && {
        background: 'linear-gradient(180deg, #5856D6 0%, #3634A3 100%)',
        color: '#FFFFFF',
        boxShadow: '0 4px 16px rgba(88, 86, 214, 0.3)',
        '&:hover': {
            boxShadow: '0 6px 24px rgba(88, 86, 214, 0.4)',
            transform: 'translateY(-2px)',
        },
    }),

    ...(appleVariant === 'ghost' && {
        backgroundColor: 'transparent',
        border: `1.5px solid ${theme.palette.primary.main}`,
        color: theme.palette.primary.main,
        '&:hover': {
            backgroundColor: 'rgba(0, 122, 255, 0.05)',
            borderWidth: '1.5px',
        },
    }),

    ...(appleVariant === 'text' && {
        backgroundColor: 'transparent',
        color: theme.palette.primary.main,
        '&:hover': {
            backgroundColor: 'rgba(0, 122, 255, 0.05)',
        },
    }),
}));

/**
 * Apple 风格按钮组件
 * 
 * 基于 Material-UI Button 构建的 Apple 风格按钮，提供多种视觉变体。
 * 支持渐变背景、悬停动画和流畅的交互反馈。
 * 
 * @component
 * @example
 * ```tsx
 * // 主要按钮
 * <AppleButton variant="primary">
 *   点击我
 * </AppleButton>
 * 
 * // 幽灵按钮
 * <AppleButton variant="ghost" fullWidth>
 *   全宽按钮
 * </AppleButton>
 * 
 * // 禁用状态
 * <AppleButton disabled>
 *   禁用
 * </AppleButton>
 * ```
 * 
 * @param {AppleButtonProps} props - 组件属性
 * @returns {JSX.Element} Apple 风格按钮组件
 */
export function AppleButton({ variant = 'primary', ...props }: AppleButtonProps) {
    // 使用 text variant 作为基础，因为我们完全自定义样式
    return <StyledButton variant="text" appleVariant={variant} {...props} />;
}

export default AppleButton;
