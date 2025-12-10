/**
 * 统一的动画配置
 * 确保整个仪表盘的动画效果一致且高级
 */

// 缓动函数
export const easings = {
    // Apple 风格的缓动
    apple: [0.25, 0.46, 0.45, 0.94] as const,
    // 弹性缓动
    elastic: [0.34, 1.56, 0.64, 1] as const,
    // 平滑缓动
    smooth: [0.45, 0.05, 0.55, 0.95] as const,
};

// 动画持续时间
export const durations = {
    fast: 0.2,
    normal: 0.3,
    slow: 0.5,
    verySlow: 0.8,
};

// 卡片动画变体
export const cardVariants = {
    initial: {
        opacity: 0,
        y: 20,
        scale: 0.95,
    },
    animate: {
        opacity: 1,
        y: 0,
        scale: 1,
    },
    hover: {
        y: -8,
        scale: 1.02,
        transition: {
            duration: durations.normal,
            ease: easings.apple,
        },
    },
    tap: {
        scale: 0.98,
    },
};

// 交错动画配置
export const staggerConfig = {
    staggerChildren: 0.08,
    delayChildren: 0.1,
};

// 弹簧动画配置
export const springConfig = {
    type: 'spring' as const,
    stiffness: 200,
    damping: 15,
};

// 光晕动画
export const glowAnimation = {
    scale: [1, 1.3, 1],
    opacity: [0.4, 0.7, 0.4],
    transition: {
        duration: 10,
        repeat: Infinity,
        ease: easings.smooth,
    },
};

// 流光效果
export const shimmerAnimation = {
    initial: { x: '-100%', opacity: 0 },
    hover: { x: '100%', opacity: 1 },
    transition: {
        duration: 0.8,
        ease: 'easeInOut',
    },
};

// 数字跳动动画
export const numberBounce = {
    scale: [1, 1.05, 1],
    transition: {
        duration: 0.3,
        ease: easings.elastic,
    },
};

// 图表入场动画
export const chartAnimation = {
    animationDuration: 1200,
    animationEasing: 'ease-out' as const,
};

// Tooltip 动画类名
export const tooltipAnimation = 'animate-in fade-in zoom-in duration-200';
