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
        <div className="min-h-screen bg-[var(--color-background-paper)] dark:bg-[#0F0F0F]">
            {/* Container with max width */}
            <div className="max-w-[1600px] mx-auto px-4 md:px-6 lg:px-8 py-8">
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
                            <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
                                数据统计
                            </h1>
                            <p className="text-gray-600 dark:text-gray-400">
                                查看你的观看习惯和内容分析
                            </p>
                        </motion.div>
                        <motion.button
                            onClick={handleRefresh}
                            disabled={refreshing}
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ duration: 0.3, delay: 0.2 }}
                            whileHover={{ scale: 1.05, y: -2 }}
                            whileTap={{ scale: 0.95 }}
                            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white dark:bg-[#1C1C1E] border border-gray-200 dark:border-white/10 hover:shadow-lg transition-shadow"
                        >
                            <motion.div
                                animate={refreshing ? { rotate: 360 } : {}}
                                transition={{ duration: 1, repeat: refreshing ? Infinity : 0, ease: 'linear' }}
                            >
                                <RefreshCw className="w-4 h-4" />
                            </motion.div>
                            <span className="text-sm font-medium">刷新</span>
                        </motion.button>
                    </div>
                </motion.div>

                {/* Bento Grid Layout */}
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 lg:gap-6">
                    {/* KPI Cards - 3 columns on desktop */}
                    <div className="lg:col-span-12 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                        <KPICard {...displayData.kpis.totalItems} delay={0} />
                        <KPICard {...displayData.kpis.avgRating} delay={0.1} />
                        <KPICard {...displayData.kpis.monthlyNew} delay={0.2} />
                    </div>

                    {/* AI Insights - 条件渲染，带动画 */}
                    <AnimatePresence mode="wait">
                        {showAIInsights && (
                            <motion.div
                                key="ai-insights"
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: -20 }}
                                transition={{ duration: 0.3 }}
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
                        transition={{ duration: 0.3, ease: 'easeInOut' }}
                        className={showAIInsights ? 'lg:col-span-7' : 'lg:col-span-12'}
                    >
                        <ChartContainer
                            title="新增内容趋势"
                            description="最近 6 个月的新增收藏变化"
                            delay={0.3}
                            action={
                                <div className="flex items-center gap-2 text-sm text-gray-500">
                                    <Calendar className="w-4 h-4" />
                                    <span>近 6 个月</span>
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
