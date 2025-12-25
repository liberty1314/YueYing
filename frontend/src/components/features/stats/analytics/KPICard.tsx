/**
 * KPICard - 高级感 KPI 指标卡片（增强版）
 * 
 * 特点：
 * - 大圆角设计
 * - 柔和阴影
 * - 数字滚动动画
 * - 鼠标跟随效果
 * - 多层次光晕
 * - 流畅的悬停动画
 */

'use client';

import { motion, useMotionValue, useSpring, useTransform } from 'framer-motion';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useEffect, useRef, useState } from 'react';
import { easings, durations, springConfigs } from './animations';

interface KPICardProps {
    label: string;
    value: number | string;
    trend?: 'up' | 'down' | 'neutral';
    trendValue?: number;
    suffix?: string;
    delay?: number;
    className?: string;
}

// 数字滚动动画组件
function AnimatedNumber({ value, duration = 1.5 }: { value: number; duration?: number }) {
    const [displayValue, setDisplayValue] = useState(0);
    const nodeRef = useRef<HTMLSpanElement>(null);

    useEffect(() => {
        const startTime = Date.now();
        const startValue = displayValue;
        const endValue = value;

        const animate = () => {
            const now = Date.now();
            const progress = Math.min((now - startTime) / (duration * 1000), 1);

            // 使用缓动函数
            const easeOutQuart = 1 - Math.pow(1 - progress, 4);
            const current = startValue + (endValue - startValue) * easeOutQuart;

            setDisplayValue(Math.round(current));

            if (progress < 1) {
                requestAnimationFrame(animate);
            }
        };

        requestAnimationFrame(animate);
    }, [value]);

    return <span ref={nodeRef}>{displayValue}</span>;
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
    const cardRef = useRef<HTMLDivElement>(null);

    // 鼠标位置追踪
    const mouseX = useMotionValue(0);
    const mouseY = useMotionValue(0);

    // 平滑的弹簧动画
    const rotateX = useSpring(useTransform(mouseY, [-0.5, 0.5], [5, -5]), springConfigs.soft);
    const rotateY = useSpring(useTransform(mouseX, [-0.5, 0.5], [-5, 5]), springConfigs.soft);

    // 光晕位置
    const glowX = useSpring(useTransform(mouseX, [-0.5, 0.5], [-20, 20]), springConfigs.default);
    const glowY = useSpring(useTransform(mouseY, [-0.5, 0.5], [-20, 20]), springConfigs.default);

    const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
        if (!cardRef.current) return;

        const rect = cardRef.current.getBoundingClientRect();
        const centerX = rect.left + rect.width / 2;
        const centerY = rect.top + rect.height / 2;

        const x = (e.clientX - centerX) / (rect.width / 2);
        const y = (e.clientY - centerY) / (rect.height / 2);

        mouseX.set(x);
        mouseY.set(y);
    };

    const handleMouseLeave = () => {
        mouseX.set(0);
        mouseY.set(0);
    };

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
            ref={cardRef}
            initial={{ opacity: 0, y: 30, scale: 0.92, rotateX: 5 }}
            animate={{ opacity: 1, y: 0, scale: 1, rotateX: 0 }}
            transition={{
                duration: durations.slow,
                delay,
                ease: easings.superSmooth,
            }}
            whileHover={{
                scale: 1.015,
                y: -8,
                transition: {
                    duration: 0.35,
                    ease: [0.34, 1.56, 0.64, 1]
                }
            }}
            whileTap={{ scale: 0.98 }}
            style={{
                rotateX,
                rotateY,
                transformStyle: 'preserve-3d',
                transformPerspective: 1000,
            }}
            onMouseMove={handleMouseMove}
            onMouseLeave={handleMouseLeave}
            className={cn(
                'group relative overflow-hidden cursor-pointer h-full',
                'bg-white/80 dark:bg-[#1C1C1E]/80',
                'backdrop-blur-xl',
                'rounded-2xl lg:rounded-3xl',
                'border border-gray-200/50 dark:border-white/5',
                'shadow-sm hover:shadow-xl',
                'transition-shadow duration-400',
                'p-5 md:p-6',
                'will-change-transform',
                className
            )}
        >
            {/* 背景渐变效果 - 增强版 */}
            <motion.div
                className="absolute inset-0 bg-gradient-to-br from-blue-50/60 via-purple-50/40 to-pink-50/60 dark:from-blue-950/30 dark:via-purple-950/20 dark:to-pink-950/30"
                initial={{ opacity: 0 }}
                whileHover={{ opacity: 1 }}
                transition={{ duration: durations.slow, ease: easings.superSmooth }}
            />

            {/* 多层光晕效果 */}
            <motion.div
                className="absolute -top-20 -right-20 w-40 h-40 bg-gradient-to-br from-blue-400/20 to-purple-400/20 dark:from-blue-400/10 dark:to-purple-400/10 rounded-full blur-3xl"
                style={{ x: glowX, y: glowY }}
                initial={{ opacity: 0, scale: 0.8 }}
                whileHover={{ opacity: 1, scale: 1.5 }}
                transition={{ duration: durations.slow, ease: easings.elastic }}
            />

            <motion.div
                className="absolute -bottom-20 -left-20 w-40 h-40 bg-gradient-to-tr from-pink-400/15 to-purple-400/15 dark:from-pink-400/8 dark:to-purple-400/8 rounded-full blur-3xl"
                style={{ x: useTransform(glowX, (x) => -x), y: useTransform(glowY, (y) => -y) }}
                initial={{ opacity: 0, scale: 0.8 }}
                whileHover={{ opacity: 1, scale: 1.5 }}
                transition={{ duration: durations.slow, ease: easings.elastic, delay: 0.1 }}
            />

            {/* 流光效果 - 增强版 */}
            <motion.div
                className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent dark:via-white/15"
                initial={{ x: '-100%', opacity: 0 }}
                whileHover={{ x: '100%', opacity: 1 }}
                transition={{ duration: 0.7, ease: 'easeOut' }}
            />

            {/* 边框光效 */}
            <motion.div
                className="absolute inset-0 rounded-2xl lg:rounded-3xl"
                initial={{ opacity: 0 }}
                whileHover={{
                    opacity: 1,
                    boxShadow: '0 0 0 1px rgba(59, 130, 246, 0.2), inset 0 0 20px rgba(59, 130, 246, 0.05)'
                }}
                transition={{ duration: durations.normal }}
            />

            <div className="relative z-10" style={{ transform: 'translateZ(20px)' }}>
                {/* 标签 */}
                <motion.p
                    className="text-xs md:text-sm font-medium text-gray-600 dark:text-gray-400 mb-3 tracking-wide"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: durations.normal, delay: delay + 0.1 }}
                >
                    {label}
                </motion.p>

                {/* 数值 - 添加滚动动画 */}
                <motion.div
                    className="flex items-baseline gap-2 mb-4"
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{
                        duration: durations.slow,
                        delay: delay + 0.2,
                        ...springConfigs.soft
                    }}
                >
                    <motion.h3
                        className="text-3xl md:text-4xl lg:text-5xl font-bold text-gray-900 dark:text-white tracking-tight tabular-nums"
                        whileHover={{ scale: 1.05 }}
                        transition={springConfigs.bouncy}
                    >
                        {typeof value === 'number' ? <AnimatedNumber value={value} /> : value}
                    </motion.h3>
                    {suffix && (
                        <motion.span
                            className="text-lg md:text-xl font-semibold text-gray-500 dark:text-gray-400"
                            initial={{ opacity: 0, y: 5 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: delay + 0.5, duration: durations.normal }}
                        >
                            {suffix}
                        </motion.span>
                    )}
                </motion.div>

                {/* 趋势指示器 - 增强动画 */}
                {config && trendValue !== undefined && (
                    <motion.div
                        className={cn('inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full', config.bg)}
                        initial={{ opacity: 0, scale: 0.8, y: 10 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        transition={{
                            duration: durations.normal,
                            delay: delay + 0.4,
                            ...springConfigs.default
                        }}
                        whileHover={{ scale: 1.1, y: -2 }}
                    >
                        {TrendIcon && (
                            <motion.div
                                animate={{
                                    y: trend === 'up' ? [0, -3, 0] : trend === 'down' ? [0, 3, 0] : 0
                                }}
                                transition={{
                                    duration: 2,
                                    repeat: Infinity,
                                    ease: 'easeInOut'
                                }}
                            >
                                <TrendIcon className={cn('w-3.5 h-3.5', config.color)} />
                            </motion.div>
                        )}
                        <motion.span
                            className={cn('text-xs font-semibold tabular-nums', config.color)}
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ delay: delay + 0.6 }}
                        >
                            {trendValue > 0 ? '+' : ''}{trendValue}%
                        </motion.span>
                        <span className="text-xs text-gray-600 dark:text-gray-400 hidden sm:inline">
                            vs 上月
                        </span>
                    </motion.div>
                )}
            </div>
        </motion.div>
    );
}
