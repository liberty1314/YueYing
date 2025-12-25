/**
 * 统一的动画配置（增强版）
 * 确保整个仪表盘的动画效果一致、丝滑且高级
 */

// 缓动函数 - 扩展版
export const easings = {
    // Apple 风格的缓动
    apple: [0.25, 0.46, 0.45, 0.94] as const,
    // 弹性缓动
    elastic: [0.34, 1.56, 0.64, 1] as const,
    // 平滑缓动
    smooth: [0.45, 0.05, 0.55, 0.95] as const,
    // 超级平滑（用于高级动画）
    superSmooth: [0.4, 0, 0.2, 1] as const,
    // 快速进入，慢速退出
    fastInSlowOut: [0.11, 0, 0.5, 0] as const,
    // 慢速进入，快速退出
    slowInFastOut: [0.5, 1, 0.89, 1] as const,
};

// 动画持续时间
export const durations = {
    instant: 0.15,
    fast: 0.25,
    normal: 0.4,
    slow: 0.6,
    verySlow: 0.9,
    ultra: 1.2,
};

// 卡片动画变体 - 增强版
export const cardVariants = {
    initial: {
        opacity: 0,
        y: 30,
        scale: 0.92,
        rotateX: 5,
    },
    animate: {
        opacity: 1,
        y: 0,
        scale: 1,
        rotateX: 0,
        transition: {
            duration: durations.slow,
            ease: easings.superSmooth,
        },
    },
    hover: {
        y: -12,
        scale: 1.02,
        rotateX: -2,
        transition: {
            duration: durations.normal,
            ease: easings.apple,
        },
    },
    tap: {
        scale: 0.97,
        transition: {
            duration: durations.fast,
            ease: easings.fastInSlowOut,
        },
    },
};

// 交错动画配置 - 优化版
export const staggerConfig = {
    staggerChildren: 0.06,
    delayChildren: 0.08,
};

// 弹簧动画配置 - 多种预设
export const springConfigs = {
    // 柔和弹簧
    soft: {
        type: 'spring' as const,
        stiffness: 120,
        damping: 20,
    },
    // 标准弹簧
    default: {
        type: 'spring' as const,
        stiffness: 200,
        damping: 15,
    },
    // 强劲弹簧
    bouncy: {
        type: 'spring' as const,
        stiffness: 300,
        damping: 10,
    },
    // 快速弹簧
    snappy: {
        type: 'spring' as const,
        stiffness: 400,
        damping: 25,
    },
};

// 光晕动画 - 增强版
export const glowAnimations = {
    // 呼吸效果
    breathe: {
        scale: [1, 1.3, 1],
        opacity: [0.3, 0.6, 0.3],
        transition: {
            duration: 8,
            repeat: Infinity,
            ease: easings.smooth,
        },
    },
    // 脉冲效果
    pulse: {
        scale: [1, 1.15, 1],
        opacity: [0.4, 0.7, 0.4],
        transition: {
            duration: 3,
            repeat: Infinity,
            ease: 'easeInOut',
        },
    },
    // 旋转光晕
    rotate: {
        scale: [1, 1.2, 1],
        opacity: [0.3, 0.5, 0.3],
        rotate: [0, 180, 360],
        transition: {
            duration: 20,
            repeat: Infinity,
            ease: 'linear',
        },
    },
};

// 流光效果 - 增强版
export const shimmerAnimations = {
    // 标准流光
    default: {
        initial: { x: '-100%', opacity: 0 },
        hover: { x: '100%', opacity: 1 },
        transition: {
            duration: 0.8,
            ease: 'easeInOut',
        },
    },
    // 快速流光
    fast: {
        initial: { x: '-100%', opacity: 0 },
        hover: { x: '100%', opacity: 1 },
        transition: {
            duration: 0.5,
            ease: 'easeOut',
        },
    },
    // 双向流光
    bidirectional: {
        animate: {
            x: ['-100%', '100%'],
            opacity: [0, 1, 0],
        },
        transition: {
            duration: 2,
            repeat: Infinity,
            repeatDelay: 3,
            ease: 'easeInOut',
        },
    },
};

// 数字滚动动画
export const numberAnimations = {
    // 弹跳效果
    bounce: {
        scale: [1, 1.08, 1],
        transition: {
            duration: durations.normal,
            ease: easings.elastic,
        },
    },
    // 上升效果
    slideUp: {
        y: [20, 0],
        opacity: [0, 1],
        transition: {
            duration: durations.slow,
            ease: easings.superSmooth,
        },
    },
};

// 图表入场动画 - 增强版
export const chartAnimations = {
    // 标准动画
    default: {
        animationDuration: 1500,
        animationEasing: 'ease-out' as const,
    },
    // 快速动画
    fast: {
        animationDuration: 800,
        animationEasing: 'ease-out' as const,
    },
    // 平滑动画
    smooth: {
        animationDuration: 2000,
        animationEasing: 'ease-in-out' as const,
    },
};

// Tooltip 动画类名
export const tooltipAnimation = 'animate-in fade-in zoom-in-95 duration-200 ease-out';

// 页面级动画变体
export const pageVariants = {
    initial: {
        opacity: 0,
        y: 20,
    },
    animate: {
        opacity: 1,
        y: 0,
        transition: {
            duration: durations.slow,
            ease: easings.superSmooth,
            staggerChildren: staggerConfig.staggerChildren,
            delayChildren: staggerConfig.delayChildren,
        },
    },
    exit: {
        opacity: 0,
        y: -20,
        transition: {
            duration: durations.normal,
            ease: easings.fastInSlowOut,
        },
    },
};

// 视差效果配置
export const parallaxConfig = {
    light: { x: 0, y: 0, scale: 1.02 },
    medium: { x: 0, y: 0, scale: 1.05 },
    strong: { x: 0, y: 0, scale: 1.08 },
};

// 磁吸效果配置
export const magneticConfig = {
    strength: 0.3,
    radius: 100,
};
