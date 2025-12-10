/**
 * KPICard - 高级感 KPI 指标卡片
 * 
 * 特点：
 * - 大圆角设计
 * - 柔和阴影
 * - 悬停动画
 * - 趋势指示器
 */

'use client';

import { motion } from 'framer-motion';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';
import { cn } from '@/lib/utils';

interface KPICardProps {
    label: string;
    value: number | string;
    trend?: 'up' | 'down' | 'neutral';
    trendValue?: number;
    suffix?: string;
    delay?: number;
    className?: string;
}

export function KPICard({
    label,
    value,
    trend,
    trendValue,
    suffix,
    delay = 0,
    className,
}: KPICardProps) {
    const trendConfig = {
        up: {
            icon: TrendingUp,
            color: 'text-[var(--color-success)]',
            bg: 'bg-green-50 dark:bg-green-950/30',
            label: '增长',
        },
        down: {
            icon: TrendingDown,
            color: 'text-[var(--color-error)]',
            bg: 'bg-red-50 dark:bg-red-950/30',
            label: '下降',
        },
        neutral: {
            icon: Minus,
            color: 'text-gray-500 dark:text-gray-400',
            bg: 'bg-gray-50 dark:bg-gray-800/30',
            label: '持平',
        },
    };

    const config = trend ? trendConfig[trend] : null;
    const TrendIcon = config?.icon;

    return (
        <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{
                duration: 0.6,
                delay,
                ease: [0.25, 0.46, 0.45, 0.94],
            }}
            whileHover={{
                scale: 1.02,
                y: -8,
                transition: { duration: 0.3, ease: [0.25, 0.46, 0.45, 0.94] }
            }}
            whileTap={{ scale: 0.98 }}
            className={cn(
                'group relative overflow-hidden cursor-pointer h-full',
                'bg-white/80 dark:bg-[#1C1C1E]/80',
                'backdrop-blur-xl',
                'rounded-2xl lg:rounded-3xl',
                'border border-gray-200/50 dark:border-white/5',
                'shadow-sm hover:shadow-2xl',
                'transition-all duration-300',
                'p-5 md:p-6',
                className
            )}
        >
            {/* 背景渐变效果 - 增强版 */}
            <motion.div
                className="absolute inset-0 bg-gradient-to-br from-blue-50/60 via-purple-50/40 to-pink-50/60 dark:from-blue-950/30 dark:via-purple-950/20 dark:to-pink-950/30"
                initial={{ opacity: 0 }}
                whileHover={{ opacity: 1 }}
                transition={{ duration: 0.5, ease: [0.25, 0.46, 0.45, 0.94] }}
            />

            {/* 光晕效果 */}
            <motion.div
                className="absolute -top-20 -right-20 w-40 h-40 bg-gradient-to-br from-blue-400/20 to-purple-400/20 dark:from-blue-400/10 dark:to-purple-400/10 rounded-full blur-3xl"
                initial={{ opacity: 0, scale: 0.8 }}
                whileHover={{ opacity: 1, scale: 1.4 }}
                transition={{ duration: 0.7, ease: [0.34, 1.56, 0.64, 1] }}
            />

            {/* 流光效果 */}
            <motion.div
                className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent dark:via-white/10"
                initial={{ x: '-100%', opacity: 0 }}
                whileHover={{ x: '100%', opacity: 1 }}
                transition={{ duration: 0.8, ease: 'easeInOut' }}
            />

            <div className="relative z-10">
                {/* 标签 */}
                <p className="text-xs md:text-sm font-medium text-gray-600 dark:text-gray-400 mb-3 tracking-wide">
                    {label}
                </p>

                {/* 数值 - 添加动画 */}
                <motion.div
                    className="flex items-baseline gap-2 mb-4"
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{
                        duration: 0.6,
                        delay: delay + 0.2,
                        type: 'spring',
                        stiffness: 100,
                        damping: 12
                    }}
                >
                    <motion.h3
                        className="text-3xl md:text-4xl lg:text-5xl font-bold text-gray-900 dark:text-white tracking-tight"
                        whileHover={{ scale: 1.05 }}
                        transition={{ type: 'spring', stiffness: 300, damping: 20 }}
                    >
                        {value}
                    </motion.h3>
                    {suffix && (
                        <motion.span
                            className="text-lg md:text-xl font-semibold text-gray-500 dark:text-gray-400"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ delay: delay + 0.4 }}
                        >
                            {suffix}
                        </motion.span>
                    )}
                </motion.div>

                {/* 趋势指示器 - 添加弹性动画 */}
                {config && trendValue !== undefined && (
                    <motion.div
                        className={cn('inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full', config.bg)}
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{
                            duration: 0.4,
                            delay: delay + 0.3,
                            type: 'spring',
                            stiffness: 200,
                            damping: 15
                        }}
                        whileHover={{ scale: 1.08 }}
                    >
                        {TrendIcon && (
                            <motion.div
                                animate={{
                                    y: trend === 'up' ? [0, -2, 0] : trend === 'down' ? [0, 2, 0] : 0
                                }}
                                transition={{
                                    duration: 1.5,
                                    repeat: Infinity,
                                    ease: 'easeInOut'
                                }}
                            >
                                <TrendIcon className={cn('w-3.5 h-3.5', config.color)} />
                            </motion.div>
                        )}
                        <span className={cn('text-xs font-semibold', config.color)}>
                            {trendValue > 0 ? '+' : ''}{trendValue}%
                        </span>
                        <span className="text-xs text-gray-600 dark:text-gray-400 hidden sm:inline">
                            vs 上月
                        </span>
                    </motion.div>
                )}
            </div>
        </motion.div>
    );
}
