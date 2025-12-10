/**
 * Analytics Dashboard Types
 * 数据统计仪表盘类型定义
 */

export interface KPIMetric {
    label: string;
    value: number | string;
    trend?: 'up' | 'down' | 'neutral';
    trendValue?: number;
    suffix?: string;
    icon?: string;
}

export interface AIInsight {
    type: 'trend' | 'recommendation' | 'achievement' | 'suggestion';
    title: string;
    description: string;
    priority: 'high' | 'medium' | 'low';
    action?: {
        label: string;
        link?: string;
    };
}

export interface TrendDataPoint {
    date: string;
    value: number;
    label?: string;
}

export interface DistributionData {
    name: string;
    value: number;
    color?: string;
}

export interface AnalyticsData {
    kpis: {
        totalItems: KPIMetric;
        avgRating: KPIMetric;
        monthlyNew: KPIMetric;
    };
    insights: AIInsight[];
    trends: {
        itemsAdded: TrendDataPoint[];
    };
    distributions: {
        contentType: DistributionData[];
        rating: DistributionData[];
        status: DistributionData[];
    };
}
