import { Card as MuiCard, CardProps as MuiCardProps, styled } from '@mui/material';

/**
 * Apple 风格卡片组件的属性接口
 * 
 * @interface AppleCardProps
 * @extends {Omit<MuiCardProps, 'variant'>}
 */
interface AppleCardProps extends Omit<MuiCardProps, 'variant'> {
    /**
     * 卡片变体
     * - elevated: 带阴影的浮起效果
     * - outlined: 带边框的扁平效果
     * - glass: 毛玻璃效果（适合叠加在背景图片上）
     * 
     * @default 'elevated'
     */
    variant?: 'elevated' | 'outlined' | 'glass';

    /**
     * 是否启用悬停效果
     * 启用后，鼠标悬停时卡片会有提升动画
     * 
     * @default false
     */
    hover?: boolean;
}

interface StyledCardProps extends Omit<MuiCardProps, 'variant'> {
    appleVariant?: 'elevated' | 'outlined' | 'glass';
    hover?: boolean;
}

const StyledCard = styled(MuiCard, {
    shouldForwardProp: (prop) => prop !== 'appleVariant' && prop !== 'hover',
})<StyledCardProps>(({ theme, appleVariant = 'elevated', hover = false }) => ({
    borderRadius: 16,
    transition: 'all 0.3s ease',

    ...(appleVariant === 'elevated' && {
        boxShadow: '0 4px 16px rgba(0, 0, 0, 0.08)',
        ...(hover && {
            '&:hover': {
                boxShadow: '0 8px 32px rgba(0, 0, 0, 0.12)',
                transform: 'translateY(-4px)',
            },
        }),
    }),

    ...(appleVariant === 'outlined' && {
        border: `1px solid ${theme.palette.divider}`,
        boxShadow: 'none',
        ...(hover && {
            '&:hover': {
                borderColor: theme.palette.primary.main,
                boxShadow: '0 4px 16px rgba(0, 122, 255, 0.1)',
            },
        }),
    }),

    ...(appleVariant === 'glass' && {
        background: 'rgba(255, 255, 255, 0.7)',
        backdropFilter: 'blur(20px)',
        border: '1px solid rgba(255, 255, 255, 0.3)',
        boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)',
        ...(theme.palette.mode === 'dark' && {
            background: 'rgba(28, 28, 30, 0.7)',
            border: '1px solid rgba(255, 255, 255, 0.1)',
        }),
    }),
}));

/**
 * Apple 风格卡片组件
 * 
 * 基于 Material-UI Card 构建的 Apple 风格卡片，提供多种视觉效果。
 * 支持浮起阴影、边框样式和毛玻璃效果，可选悬停动画。
 * 
 * @component
 * @example
 * ```tsx
 * // 带阴影的卡片
 * <AppleCard variant="elevated" sx={{ p: 3 }}>
 *   <Typography variant="h6">卡片标题</Typography>
 *   <Typography variant="body2">卡片内容...</Typography>
 * </AppleCard>
 * 
 * // 带悬停效果的卡片
 * <AppleCard variant="elevated" hover sx={{ p: 3 }}>
 *   悬停时会有提升动画
 * </AppleCard>
 * 
 * // 毛玻璃效果卡片
 * <AppleCard variant="glass" sx={{ p: 3 }}>
 *   毛玻璃效果内容
 * </AppleCard>
 * ```
 * 
 * @param {AppleCardProps} props - 组件属性
 * @returns {JSX.Element} Apple 风格卡片组件
 */
export function AppleCard({ variant = 'elevated', hover = false, ...props }: AppleCardProps) {
    return <StyledCard variant="outlined" appleVariant={variant} hover={hover} {...props} />;
}

export default AppleCard;
