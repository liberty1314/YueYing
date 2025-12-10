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
                ease: [0.25, 0.46, 0.45, 0.94], // 自定义缓动函数
            }}
            whileHover={{
                scale: 1.02,
                y: -6,
                transition: { duration: 0.2, ease: 'easeOut' }
            }}
            whileTap={{ scale: 0.98 }}
            className={cn(
                'group relative overflow-hidden cursor-pointer',
                'bg-white dark:bg-[#1C1C1E]',
                'rounded-2xl',
                'border border-gray-100 dark:border-white/5',
                'shadow-sm hover:shadow-2xl',
                'transition-shadow duration-300',
                'p-6',
                className
            )}
        >
            {/* 背景渐变效果 - 增强版 */}
            <motion.div
                className="absolute inset-0 bg-gradient-to-br from-blue-50/50 via-purple-50/30 to-pink-50/50 dark:from-blue-950/20 dark:via-purple-950/10 dark:to-pink-950/20"
                initial={{ opacity: 0 }}
                whileHover={{ opacity: 1 }}
                transition={{ duration: 0.3 }}
            />

            {/* 光晕效果 */}
            <motion.div
                className="absolute -top-24 -right-24 w-48 h-48 bg-gradient-to-br from-blue-400/20 to-purple-400/20 rounded-full blur-3xl"
                initial={{ opacity: 0, scale: 0.8 }}
                whileHover={{ opacity: 1, scale: 1.2 }}
                transition={{ duration: 0.5 }}
            />

            <div className="relative z-10">
                {/* 标签 */}
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-3">
                    {label}
                </p>

                {/* 数值 - 添加动画 */}
                <motion.div
                    className="flex items-baseline gap-2 mb-4"
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.5, delay: delay + 0.2 }}
                >
                    <h3 className="text-4xl font-bold text-gray-900 dark:text-white tracking-tight">
                        {value}
                    </h3>
                    {suffix && (
                        <span className="text-xl font-semibold text-gray-500 dark:text-gray-400">
                            {suffix}
                        </span>
                    )}
                </motion.div>

                {/* 趋势指示器 - 添加弹性动画 */}
                {config && trendValue !== undefined && (
                    <motion.div
                        className={cn('inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full', config.bg)}
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{
                            duration: 0.4,
                            delay: delay + 0.3,
                            type: 'spring',
                            stiffness: 200,
                            damping: 15
                        }}
                        whileHover={{ scale: 1.05 }}
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
                        <span className="text-xs text-gray-600 dark:text-gray-400">
                            vs 上月
                        </span>
                    </motion.div>
                )}
            </div>
        </motion.div>
    );
}
