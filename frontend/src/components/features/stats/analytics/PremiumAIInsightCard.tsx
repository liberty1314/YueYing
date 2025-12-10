/**
 * PremiumAIInsightCard - 高级感 AI 洞察卡片
 * 
 * 特点：
 * - 渐变背景
 * - 流光效果
 * - 优先级标识
 * - 交互动画
 */

'use client';

import { motion } from 'framer-motion';
import { Sparkles, TrendingUp, Heart, Award, Lightbulb, ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { AIInsight } from './types';

interface PremiumAIInsightCardProps {
    insights: AIInsight[];
    loading?: boolean;
    onRefresh?: () => void;
}

const iconMap = {
    trend: TrendingUp,
    recommendation: Heart,
    achievement: Award,
    suggestion: Lightbulb,
};

const gradientMap = {
    trend: 'from-blue-500/10 via-blue-400/5 to-transparent',
    recommendation: 'from-pink-500/10 via-pink-400/5 to-transparent',
    achievement: 'from-yellow-500/10 via-yellow-400/5 to-transparent',
    suggestion: 'from-green-500/10 via-green-400/5 to-transparent',
};

const borderMap = {
    trend: 'border-l-blue-500',
    recommendation: 'border-l-pink-500',
    achievement: 'border-l-yellow-500',
    suggestion: 'border-l-green-500',
};

const priorityConfig = {
    high: { label: '重要', color: 'text-red-600 dark:text-red-400', bg: 'bg-red-50 dark:bg-red-950/30' },
    medium: { label: '一般', color: 'text-yellow-600 dark:text-yellow-400', bg: 'bg-yellow-50 dark:bg-yellow-950/30' },
    low: { label: '提示', color: 'text-gray-600 dark:text-gray-400', bg: 'bg-gray-50 dark:bg-gray-800/30' },
};

export function PremiumAIInsightCard({ insights, loading, onRefresh }: PremiumAIInsightCardProps) {
    return (
        <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{
                duration: 0.6,
                delay: 0.4,
                ease: [0.25, 0.46, 0.45, 0.94]
            }}
            className={cn(
                'relative overflow-hidden',
                'bg-white dark:bg-[#1C1C1E]',
                'rounded-2xl',
                'border border-gray-100 dark:border-white/5',
                'shadow-sm',
                'p-6'
            )}
        >
            {/* 顶部装饰渐变 - 增强动画 */}
            <motion.div
                className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500"
                initial={{ scaleX: 0 }}
                animate={{ scaleX: 1 }}
                transition={{ duration: 0.8, delay: 0.5, ease: 'easeOut' }}
                style={{ transformOrigin: 'left' }}
            />

            {/* 背景光晕效果 */}
            <motion.div
                className="absolute -top-32 -right-32 w-64 h-64 bg-gradient-to-br from-blue-400/10 via-purple-400/10 to-pink-400/10 rounded-full blur-3xl"
                animate={{
                    scale: [1, 1.2, 1],
                    opacity: [0.3, 0.5, 0.3],
                }}
                transition={{
                    duration: 4,
                    repeat: Infinity,
                    ease: 'easeInOut'
                }}
            />

            {/* Header */}
            <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                    <motion.div
                        className="relative"
                        whileHover={{ scale: 1.1, rotate: 5 }}
                        transition={{ type: 'spring', stiffness: 300, damping: 15 }}
                    >
                        <motion.div
                            className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center"
                            animate={{
                                boxShadow: [
                                    '0 0 0 0 rgba(59, 130, 246, 0)',
                                    '0 0 0 8px rgba(59, 130, 246, 0.1)',
                                    '0 0 0 0 rgba(59, 130, 246, 0)',
                                ],
                            }}
                            transition={{
                                duration: 2,
                                repeat: Infinity,
                                ease: 'easeInOut'
                            }}
                        >
                            <motion.div
                                animate={{
                                    rotate: [0, 10, -10, 0],
                                    scale: [1, 1.1, 1],
                                }}
                                transition={{
                                    duration: 3,
                                    repeat: Infinity,
                                    ease: 'easeInOut'
                                }}
                            >
                                <Sparkles className="w-5 h-5 text-white" />
                            </motion.div>
                        </motion.div>
                        {/* 流光效果 - 增强版 */}
                        <motion.div
                            className="absolute inset-0 rounded-xl bg-gradient-to-r from-transparent via-white/40 to-transparent"
                            animate={{
                                x: ['-100%', '200%'],
                            }}
                            transition={{
                                duration: 2,
                                repeat: Infinity,
                                repeatDelay: 3,
                                ease: 'easeInOut'
                            }}
                        />
                    </motion.div>
                    <motion.div
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.5, delay: 0.5 }}
                    >
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                            AI 智能洞察
                        </h3>
                        <p className="text-xs text-gray-500 dark:text-gray-400">
                            基于你的观看习惯分析
                        </p>
                    </motion.div>
                </div>

                {onRefresh && (
                    <button
                        onClick={onRefresh}
                        disabled={loading}
                        className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-white/5 transition-colors"
                    >
                        <motion.div
                            animate={loading ? { rotate: 360 } : {}}
                            transition={{ duration: 1, repeat: loading ? Infinity : 0, ease: 'linear' }}
                        >
                            <Sparkles className="w-4 h-4 text-gray-600 dark:text-gray-400" />
                        </motion.div>
                    </button>
                )}
            </div>

            {/* Insights List */}
            {loading ? (
                <div className="space-y-3">
                    {[1, 2, 3].map((i) => (
                        <div key={i} className="animate-pulse">
                            <div className="h-20 bg-gray-100 dark:bg-white/5 rounded-xl" />
                        </div>
                    ))}
                </div>
            ) : (
                <div className="space-y-3">
                    {insights.map((insight, index) => {
                        const Icon = iconMap[insight.type];
                        const gradient = gradientMap[insight.type];
                        const border = borderMap[insight.type];
                        const priority = priorityConfig[insight.priority];

                        return (
                            <motion.div
                                key={index}
                                initial={{ opacity: 0, x: -20, scale: 0.95 }}
                                animate={{ opacity: 1, x: 0, scale: 1 }}
                                transition={{
                                    duration: 0.4,
                                    delay: index * 0.1,
                                    type: 'spring',
                                    stiffness: 200,
                                    damping: 20
                                }}
                                whileHover={{
                                    scale: 1.02,
                                    x: 6,
                                    transition: { duration: 0.2 }
                                }}
                                whileTap={{ scale: 0.98 }}
                                className={cn(
                                    'relative overflow-hidden',
                                    'p-4 rounded-xl',
                                    'bg-gradient-to-br',
                                    gradient,
                                    'border-l-4',
                                    border,
                                    'border border-gray-100 dark:border-white/5',
                                    'cursor-pointer group'
                                )}
                            >
                                {/* 悬停光效 */}
                                <motion.div
                                    className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent"
                                    initial={{ x: '-100%', opacity: 0 }}
                                    whileHover={{ x: '100%', opacity: 1 }}
                                    transition={{ duration: 0.6 }}
                                />

                                <div className="flex items-start gap-3 relative z-10">
                                    {/* Icon - 添加动画 */}
                                    <motion.div
                                        className="flex-shrink-0 mt-0.5"
                                        whileHover={{ rotate: 360, scale: 1.1 }}
                                        transition={{ duration: 0.5 }}
                                    >
                                        <div className="w-9 h-9 rounded-lg bg-white dark:bg-[#2C2C2E] shadow-sm flex items-center justify-center">
                                            <Icon className="w-4.5 h-4.5 text-gray-700 dark:text-gray-300" />
                                        </div>
                                    </motion.div>

                                    {/* Content */}
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center gap-2 mb-1">
                                            <h4 className="font-semibold text-sm text-gray-900 dark:text-white">
                                                {insight.title}
                                            </h4>
                                            <span className={cn('text-xs font-medium px-2 py-0.5 rounded-full', priority.color, priority.bg)}>
                                                {priority.label}
                                            </span>
                                        </div>
                                        <p className="text-xs text-gray-600 dark:text-gray-400 leading-relaxed">
                                            {insight.description}
                                        </p>
                                    </div>

                                    {/* Action Arrow - 添加动画 */}
                                    {insight.action && (
                                        <motion.div
                                            className="flex-shrink-0 mt-1"
                                            animate={{
                                                x: [0, 4, 0],
                                            }}
                                            transition={{
                                                duration: 1.5,
                                                repeat: Infinity,
                                                ease: 'easeInOut'
                                            }}
                                        >
                                            <ChevronRight className="w-4 h-4 text-gray-400 group-hover:text-gray-600 dark:group-hover:text-gray-300 transition-colors" />
                                        </motion.div>
                                    )}
                                </div>
                            </motion.div>
                        );
                    })}
                </div>
            )}

            {/* Empty State */}
            {!loading && insights.length === 0 && (
                <div className="text-center py-8">
                    <Sparkles className="w-12 h-12 text-gray-300 dark:text-gray-600 mx-auto mb-3" />
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                        暂无洞察数据
                    </p>
                </div>
            )}
        </motion.div>
    );
}
