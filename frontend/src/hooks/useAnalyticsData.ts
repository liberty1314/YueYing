/**
 * useAnalyticsData Hook
 * 获取数据统计仪表盘数据
 */

import { useState, useEffect } from 'react';
import { getComprehensiveStats, type ComprehensiveStats } from '@/lib/stats-api';
import { getAIInsights } from '@/lib/ai-insights-api';
import type { AnalyticsData } from '@/components/features/stats/analytics/types';

// 状态映射
const STATUS_MAP: Record<string, string> = {
    want_to_watch: '想看',
    watching: '在看',
    watched: '看过',
};

// 类型映射
const TYPE_MAP: Record<string, string> = {
    movie: '电影',
    tv: '电视剧',
    anime: '动漫',
    book: '书籍',
};

// 类型颜色映射
const TYPE_COLORS: Record<string, string> = {
    movie: '#007AFF',
    tv: '#5856D6',
    anime: '#34C759',
    book: '#FF9500',
};

/**
 * 转换后端数据为前端格式
 */
function transformData(stats: ComprehensiveStats): AnalyticsData {
    const { overview, type_distribution, rating_distribution, time_trend, status_distribution } = stats;

    // 计算趋势（与上月对比）
    const calculateTrend = (current: number, previous: number): { trend: 'up' | 'down' | 'neutral'; value: number } => {
        if (previous === 0) return { trend: 'neutral', value: 0 };
        const change = ((current - previous) / previous) * 100;
        if (Math.abs(change) < 1) return { trend: 'neutral', value: 0 };
        return {
            trend: change > 0 ? 'up' : 'down',
            value: Math.round(change * 10) / 10,
        };
    };

    // 获取上月新增数据（如果有的话）
    const lastMonthAdded = time_trend.data.length >= 2 ? time_trend.data[time_trend.data.length - 2].count : 0;
    const monthlyTrend = calculateTrend(overview.this_month_added, lastMonthAdded);

    return {
        kpis: {
            totalItems: {
                label: '总收藏数',
                value: overview.total_items,
                trend: 'neutral',
                trendValue: 0,
                suffix: '项',
            },
            avgRating: {
                label: '平均评分',
                value: overview.average_rating ? overview.average_rating.toFixed(1) : '暂无',
                trend: 'neutral',
                trendValue: 0,
                suffix: overview.average_rating ? '/10' : '',
            },
            monthlyNew: {
                label: '本月新增',
                value: overview.this_month_added,
                trend: monthlyTrend.trend,
                trendValue: monthlyTrend.value,
                suffix: '项',
            },
        },
        insights: [], // AI 洞察需要单独获取
        trends: {
            itemsAdded: time_trend.data.map((point) => ({
                date: point.date,
                value: point.count,
            })),
        },
        distributions: {
            contentType: type_distribution.map((item) => ({
                name: TYPE_MAP[item.type] || item.type,
                value: item.count,
                color: TYPE_COLORS[item.type],
            })),
            rating: rating_distribution.map((item) => ({
                name: `${item.rating}分`,
                value: item.count,
            })),
            status: status_distribution.map((item) => ({
                name: STATUS_MAP[item.status] || item.status,
                value: item.count,
            })),
        },
    };
}

export function useAnalyticsData() {
    const [data, setData] = useState<AnalyticsData | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<Error | null>(null);

    const fetchData = async () => {
        try {
            setLoading(true);
            setError(null);

            // 并行获取统计数据和 AI 洞察
            const [stats, insightsResponse] = await Promise.all([
                getComprehensiveStats('month', 6),
                getAIInsights().catch(err => {
                    console.warn('Failed to fetch AI insights:', err);
                    return { insights: [], generated_at: new Date().toISOString() };
                })
            ]);

            const transformedData = transformData(stats);
            // 将 AI 洞察数据添加到转换后的数据中
            transformedData.insights = insightsResponse.insights;

            setData(transformedData);
        } catch (err) {
            console.error('Failed to fetch analytics data:', err);
            setError(err as Error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    return { data, loading, error, refetch: fetchData };
}
