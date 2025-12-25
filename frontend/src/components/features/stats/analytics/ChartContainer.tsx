/**
 * ChartContainer - 图表容器组件（增强版）
 * 
 * 统一的图表容器，提供标题、描述和操作区域
 * 增强特性：视差效果、多层光晕、流畅动画
 */

'use client';

import { motion, useMotionValue, useSpring, useTransform } from 'framer-motion';
import { cn } from '@/lib/utils';
import type { ReactNode } from 'react';
import { useRef } from 'react';
import { easings, durations, springConfigs } from './animations';

interface ChartContainerProps {
    title: string;
    description?: string;
    action?: ReactNode;
    children: ReactNode;
    delay?: number;
    className?: string;
}

export function ChartContainer({
    title,
    description,
    action,
    children,
    delay = 0,
    className,
}: ChartContainerProps) {
    const containerRef = useRef<HTMLDivElement>(null);

    // 鼠标位置追踪（轻微视差效果）
    const mouseX = useMotionValue(0);
    const mouseY = useMotionValue(0);

    const rotateX = useSpring(useTransform(mouseY, [-0.5, 0.5], [3, -3]), springConfigs.soft);
    const rotateY = useSpring(useTransform(mouseX, [-0.5, 0.5], [-3, 3]), springConfigs.soft);

    const glowX = useSpring(useTransform(mouseX, [-0.5, 0.5], [-30, 30]), springConfigs.default);
    const glowY = useSpring(useTransform(mouseY, [-0.5, 0.5], [-30, 30]), springConfigs.default);

    const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
        if (!containerRef.current) return;

        const rect = containerRef.current.getBoundingClientRect();
        const centerX = rect.left + rect.width / 2;
        const centerY = rect.top + rect.height / 2;

        const x = (e.clientX - centerX) / (rect.width / 2);
        const y = (e.clientY - centerY) / (rect.height / 2);

        mouseX.set(x * 0.5); // 减小视差强度
        mouseY.set(y * 0.5);
    };

    const handleMouseLeave = () => {
        mouseX.set(0);
        mouseY.set(0);
    };

    return (
        <motion.div
            ref={containerRef}
            initial={{ opacity: 0, y: 30, scale: 0.92, rotateX: 5 }}
            animate={{ opacity: 1, y: 0, scale: 1, rotateX: 0 }}
            transition={{
                duration: durations.slow,
                delay,
                ease: easings.superSmooth
            }}
            whileHover={{
                y: -6,
                scale: 1.008,
                transition: {
                    duration: 0.35,
                    ease: [0.34, 1.56, 0.64, 1]
                }
            }}
            style={{
                rotateX,
                rotateY,
                transformStyle: 'preserve-3d',
                transformPerspective: 1200,
            }}
            onMouseMove={handleMouseMove}
            onMouseLeave={handleMouseLeave}
            className={cn(
                'group relative overflow-hidden h-full',
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
            {/* 背景装饰 - 增强版 */}
            <motion.div
                className="absolute inset-0 bg-gradient-to-br from-blue-50/40 via-transparent to-purple-50/40 dark:from-blue-950/20 dark:via-transparent dark:to-purple-950/20"
                initial={{ opacity: 0 }}
                whileHover={{ opacity: 1 }}
                transition={{ duration: durations.slow, ease: easings.superSmooth }}
            />

            {/* 多层光晕效果 */}
            <motion.div
                className="absolute -top-20 -right-20 w-48 h-48 bg-gradient-to-br from-blue-400/12 to-purple-400/12 dark:from-blue-400/6 dark:to-purple-400/6 rounded-full blur-3xl"
                style={{ x: glowX, y: glowY }}
                initial={{ opacity: 0, scale: 0.8 }}
                whileHover={{ opacity: 1, scale: 1.4 }}
                transition={{ duration: durations.slow, ease: easings.elastic }}
            />

            <motion.div
                className="absolute -bottom-20 -left-20 w-48 h-48 bg-gradient-to-tr from-indigo-400/10 to-cyan-400/10 dark:from-indigo-400/5 dark:to-cyan-400/5 rounded-full blur-3xl"
                style={{ x: useTransform(glowX, (x) => -x * 0.8), y: useTransform(glowY, (y) => -y * 0.8) }}
                initial={{ opacity: 0, scale: 0.8 }}
                whileHover={{ opacity: 1, scale: 1.4 }}
                transition={{ duration: durations.slow, ease: easings.elastic, delay: 0.1 }}
            />

            {/* 流光效果 */}
            <motion.div
                className="absolute inset-0 bg-gradient-to-r from-transparent via-white/25 to-transparent dark:via-white/12"
                initial={{ x: '-100%', opacity: 0 }}
                whileHover={{ x: '100%', opacity: 1 }}
                transition={{ duration: 0.8, ease: 'easeOut' }}
            />

            {/* 边框光效 */}
            <motion.div
                className="absolute inset-0 rounded-2xl lg:rounded-3xl"
                initial={{ opacity: 0 }}
                whileHover={{
                    opacity: 1,
                    boxShadow: '0 0 0 1px rgba(59, 130, 246, 0.15), inset 0 0 30px rgba(59, 130, 246, 0.03)'
                }}
                transition={{ duration: durations.normal }}
            />

            {/* Header */}
            <div className="flex items-start justify-between mb-5 md:mb-6 relative z-10" style={{ transform: 'translateZ(20px)' }}>
                <motion.div
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: durations.normal, delay: delay + 0.1, ease: easings.superSmooth }}
                    className="flex-1 min-w-0"
                >
                    <h3 className="text-base md:text-lg font-semibold text-gray-900 dark:text-white mb-1 tracking-tight">
                        {title}
                    </h3>
                    {description && (
                        <motion.p
                            className="text-xs md:text-sm text-gray-500 dark:text-gray-400"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ delay: delay + 0.2 }}
                        >
                            {description}
                        </motion.p>
                    )}
                </motion.div>
                {action && (
                    <motion.div
                        className="flex-shrink-0 ml-4"
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ duration: durations.normal, delay: delay + 0.2, ...springConfigs.default }}
                    >
                        {action}
                    </motion.div>
                )}
            </div>

            {/* Chart Content */}
            <motion.div
                className="relative z-10"
                style={{ transform: 'translateZ(10px)' }}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: durations.slow, delay: delay + 0.3, ease: easings.superSmooth }}
            >
                {children}
            </motion.div>
        </motion.div>
    );
}
