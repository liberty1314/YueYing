/**
 * ChartContainer - 图表容器组件
 * 
 * 统一的图表容器，提供标题、描述和操作区域
 */

'use client';

import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import type { ReactNode } from 'react';

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
    return (
        <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{
                duration: 0.6,
                delay,
                ease: [0.25, 0.46, 0.45, 0.94]
            }}
            whileHover={{
                y: -6,
                transition: { duration: 0.3, ease: [0.25, 0.46, 0.45, 0.94] }
            }}
            className={cn(
                'group relative overflow-hidden h-full',
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
            {/* 背景装饰 - 增强版 */}
            <motion.div
                className="absolute inset-0 bg-gradient-to-br from-blue-50/40 via-transparent to-purple-50/40 dark:from-blue-950/20 dark:via-transparent dark:to-purple-950/20"
                initial={{ opacity: 0 }}
                whileHover={{ opacity: 1 }}
                transition={{ duration: 0.5, ease: [0.25, 0.46, 0.45, 0.94] }}
            />

            {/* 光晕效果 */}
            <motion.div
                className="absolute -top-20 -right-20 w-40 h-40 bg-gradient-to-br from-blue-400/10 to-purple-400/10 dark:from-blue-400/5 dark:to-purple-400/5 rounded-full blur-3xl"
                initial={{ opacity: 0, scale: 0.8 }}
                whileHover={{ opacity: 1, scale: 1.3 }}
                transition={{ duration: 0.6, ease: [0.34, 1.56, 0.64, 1] }}
            />

            {/* 边框光效 */}
            <motion.div
                className="absolute inset-0 rounded-2xl lg:rounded-3xl"
                initial={{ opacity: 0 }}
                whileHover={{
                    opacity: 1,
                    boxShadow: '0 0 0 1px rgba(59, 130, 246, 0.1), 0 0 20px rgba(59, 130, 246, 0.05)'
                }}
                transition={{ duration: 0.3 }}
            />

            {/* Header */}
            <div className="flex items-start justify-between mb-5 md:mb-6 relative z-10">
                <motion.div
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.4, delay: delay + 0.1 }}
                    className="flex-1 min-w-0"
                >
                    <h3 className="text-base md:text-lg font-semibold text-gray-900 dark:text-white mb-1 tracking-tight">
                        {title}
                    </h3>
                    {description && (
                        <p className="text-xs md:text-sm text-gray-500 dark:text-gray-400">
                            {description}
                        </p>
                    )}
                </motion.div>
                {action && (
                    <motion.div
                        className="flex-shrink-0 ml-4"
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ duration: 0.3, delay: delay + 0.2 }}
                    >
                        {action}
                    </motion.div>
                )}
            </div>

            {/* Chart Content */}
            <motion.div
                className="relative z-10"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.5, delay: delay + 0.3 }}
            >
                {children}
            </motion.div>
        </motion.div>
    );
}
