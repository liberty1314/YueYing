/**
 * AnalyticsDashboard - 高级感数据统计仪表盘
 * 
 * 特点：
 * - Bento Grid 布局
 * - 交错淡入动画
 * - 响应式设计
 * - 现代化视觉风格
 * - 根据系统设置动态显示/隐藏 AI 洞察模块
 */

'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Calendar, RefreshCw } from 'lucide-react';
import { KPICard } from './KPICard';
import { PremiumAIInsightCard } from './PremiumAIInsightCard';
import { ChartContainer } from './ChartContainer';
import { TrendChart } from './TrendChart';
import { TypeDistributionChart } from './TypeDistributionChart';
import { RatingDistributionChart } from './RatingDistributionChart';
import { useSystemSettings } from '@/hooks/useSystemSettings';
import type { AnalyticsData } from './types';

interface AnalyticsDashboardProps {
    data?: AnalyticsData;
    loading?: boolean;
    onRefresh?: () => void;
}

// 空状态数据
const emptyData: AnalyticsData = {
    kpis: {
        totalItems: {
            label: '总收藏数',
            value: 0,
            trend: 'neutral',
            trendValue: 0,
            suffix: '项',
        },
        avgRating: {
            label: '平均评分',
            value: '暂无',
            trend: 'neutral',
            trendValue: 0,
            suffix: '',
        },
        monthlyNew: {
            label: '本月新增',
            value: 0,
            trend: 'neutral',
            trendValue: 0,
            suffix: '项',
        },
    },
    insights: [],
    trends: {
        itemsAdded: [],
    },
    distributions: {
        contentType: [],
        rating: [],
        status: [],
    },
};

export function AnalyticsDashboard({ data = emptyData, loading = false, onRefresh }: AnalyticsDashboardProps) {
    const [refreshing, setRefreshing] = useState(false);
    const { settings } = useSystemSettings();

    const handleRefresh = async () => {
        setRefreshing(true);
        onRefresh?.();
        setTimeout(() => setRefreshing(false), 1000);
    };

    // 使用提供的数据或空数据
    const displayData = data || emptyData;

    // 根据系统设置决定是否显示 AI 洞察
    // 默认值为 true，确保在加载中或获取失败时仍显示（优雅降级）
    const showAIInsights = settings?.enable_explore ?? true;

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-50 dark:from-[#0A0A0A] dark:via-[#0F0F0F] dark:to-[#0A0A0A]">
            {/* 背景装饰 - 增强版 */}
            <div className="fixed inset-0 overflow-hidden pointer-events-none">
                {/* 主光晕 - 右上角 */}
                <motion.div
                    className="absolute -top-40 -right-40 w-96 h-96 bg-gradient-to-br from-blue-400/8 via-cyan-400/6 to-transparent dark:from-blue-400/4 dark:via-cyan-400/3 dark:to-transparent rounded-full blur-3xl"
                    animate={{
                        scale: [1, 1.3, 1],
                        opacity: [0.4, 0.7, 0.4],
                        x: [0, 30, 0],
                        y: [0, 20, 0],
                    }}
                    transition={{
                        duration: 10,
                        repeat: Infinity,
                        ease: [0.45, 0.05, 0.55, 0.95]
                    }}
                />
                {/* 次光晕 - 左下角 */}
                <motion.div
                    className="absolute -bottom-40 -left-40 w-96 h-96 bg-gradient-to-tr from-purple-400/8 via-pink-400/6 to-transparent dark:from-purple-400/4 dark:via-pink-400/3 dark:to-transparent rounded-full blur-3xl"
                    animate={{
                        scale: [1.2, 1, 1.2],
                        opacity: [0.6, 0.4, 0.6],
                        x: [0, -30, 0],
                        y: [0, -20, 0],
                    }}
                    transition={{
                        duration: 10,
                        repeat: Infinity,
                        ease: [0.45, 0.05, 0.55, 0.95],
                        delay: 1.5
                    }}
                />
                {/* 第三光晕 - 中间 */}
                <motion.div
                    className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-gradient-to-br from-indigo-400/4 via-violet-400/3 to-transparent dark:from-indigo-400/2 dark:via-violet-400/2 dark:to-transparent rounded-full blur-3xl"
                    animate={{
                        scale: [1, 1.15, 1],
                        opacity: [0.3, 0.5, 0.3],
                        rotate: [0, 90, 0],
                    }}
                    transition={{
                        duration: 15,
                        repeat: Infinity,
                        ease: 'linear'
                    }}
                />
            </div>

            {/* Container with max width */}
            <div className="relative max-w-[1600px] mx-auto px-4 md:px-6 lg:px-8 py-8">
                {/* Header - 增强动画 */}
                <motion.div
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{
                        duration: 0.6,
                        ease: [0.25, 0.46, 0.45, 0.94]
                    }}
                    className="mb-8"
                >
                    <div className="flex items-center justify-between">
                        <motion.div
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ duration: 0.5, delay: 0.1 }}
                        >
                            <h1 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-2 tracking-tight">
                                数据统计
                            </h1>
                            <p className="text-sm md:text-base text-gray-600 dark:text-gray-400">
                                查看你的观看习惯和内容分析
                            </p>
                        </motion.div>
                        <motion.button
                            onClick={handleRefresh}
                            disabled={refreshing}
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{
                                duration: 0.4,
                                delay: 0.2,
                                type: 'spring',
                                stiffness: 200,
                                damping: 15
                            }}
                            whileHover={{
                                scale: 1.05,
                                y: -3,
                                boxShadow: '0 10px 30px -10px rgba(0, 122, 255, 0.3)',
                                transition: { duration: 0.2 }
                            }}
                            whileTap={{ scale: 0.95 }}
                            className="relative flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white dark:bg-[#1C1C1E] border border-gray-200 dark:border-white/10 overflow-hidden transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {/* 悬停光效 */}
                            <motion.div
                                className="absolute inset-0 bg-gradient-to-r from-blue-500/0 via-blue-500/10 to-blue-500/0"
                                initial={{ x: '-100%' }}
                                whileHover={{ x: '100%' }}
                                transition={{ duration: 0.6, ease: 'easeInOut' }}
                            />
                            <motion.div
                                animate={refreshing ? { rotate: 360 } : {}}
                                transition={{ duration: 1, repeat: refreshing ? Infinity : 0, ease: 'linear' }}
                                className="relative z-10"
                            >
                                <RefreshCw className="w-4 h-4 text-gray-700 dark:text-gray-300" />
                            </motion.div>
                            <span className="text-sm font-medium text-gray-700 dark:text-gray-300 relative z-10">刷新</span>
                        </motion.button>
                    </div>
                </motion.div>

                {/* Bento Grid Layout - 优化间距和响应式 */}
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 md:gap-5 lg:gap-6">
                    {/* KPI Cards - 3 columns on desktop */}
                    <div className="lg:col-span-12 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-5">
                        <KPICard {...displayData.kpis.totalItems} delay={0} />
                        <KPICard {...displayData.kpis.avgRating} delay={0.1} />
                        <KPICard {...displayData.kpis.monthlyNew} delay={0.2} />
                    </div>

                    {/* AI Insights - 条件渲染，带动画 */}
                    <AnimatePresence mode="wait">
                        {showAIInsights && (
                            <motion.div
                                key="ai-insights"
                                initial={{ opacity: 0, x: -20, height: 0 }}
                                animate={{ opacity: 1, x: 0, height: 'auto' }}
                                exit={{ opacity: 0, x: -20, height: 0 }}
                                transition={{ duration: 0.4, ease: [0.25, 0.46, 0.45, 0.94] }}
                                className="lg:col-span-5"
                                layout
                            >
                                <PremiumAIInsightCard
                                    insights={displayData.insights}
                                    loading={loading}
                                    onRefresh={handleRefresh}
                                />
                            </motion.div>
                        )}
                    </AnimatePresence>

                    {/* Items Added Trend - 动态调整列宽 */}
                    <motion.div
                        layout
                        transition={{ duration: 0.4, ease: [0.25, 0.46, 0.45, 0.94] }}
                        className={showAIInsights ? 'lg:col-span-7' : 'lg:col-span-12'}
                    >
                        <ChartContainer
                            title="新增内容趋势"
                            description="最近 6 个月的新增收藏变化"
                            delay={0.3}
                            action={
                                <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
                                    <Calendar className="w-4 h-4" />
                                    <span className="hidden sm:inline">近 6 个月</span>
                                </div>
                            }
                        >
                            <TrendChart data={displayData.trends.itemsAdded} color="#34C759" />
                        </ChartContainer>
                    </motion.div>

                    {/* Content Type Distribution - 6 cols on desktop */}
                    <motion.div layout className="lg:col-span-6">
                        <ChartContainer
                            title="内容类型分布"
                            description="不同类型内容的收藏占比"
                            delay={0.4}
                        >
                            <TypeDistributionChart data={displayData.distributions.contentType} />
                        </ChartContainer>
                    </motion.div>

                    {/* Rating Distribution - 6 cols on desktop */}
                    <motion.div layout className="lg:col-span-6">
                        <ChartContainer
                            title="评分分布"
                            description="你的评分习惯分析"
                            delay={0.5}
                        >
                            <RatingDistributionChart data={displayData.distributions.rating} />
                        </ChartContainer>
                    </motion.div>
                </div>
            </div>
        </div>
    );
}
