/**
 * RatingDistributionChart - 评分分布图表
 * 
 * 使用 Recharts 绘制柱状图
 */

'use client';

import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import type { DistributionData } from './types';

interface RatingDistributionChartProps {
    data: DistributionData[];
}

export function RatingDistributionChart({ data }: RatingDistributionChartProps) {
    return (
        <ResponsiveContainer width="100%" height={300}>
            <BarChart data={data} margin={{ top: 5, right: 5, left: 0, bottom: 5 }}>
                <defs>
                    <linearGradient id="colorBar" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#007AFF" stopOpacity={0.8} />
                        <stop offset="95%" stopColor="#007AFF" stopOpacity={0.3} />
                    </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(0,0,0,0.05)" />
                <XAxis
                    dataKey="name"
                    stroke="rgba(0,0,0,0.3)"
                    style={{ fontSize: '12px' }}
                    tickLine={false}
                />
                <YAxis
                    stroke="rgba(0,0,0,0.3)"
                    style={{ fontSize: '12px' }}
                    tickLine={false}
                    axisLine={false}
                />
                <Tooltip
                    contentStyle={{
                        backgroundColor: 'rgba(255, 255, 255, 0.95)',
                        border: '1px solid rgba(0,0,0,0.1)',
                        borderRadius: '8px',
                        boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                    }}
                    cursor={{ fill: 'rgba(0, 122, 255, 0.1)' }}
                />
                <Bar
                    dataKey="value"
                    fill="url(#colorBar)"
                    radius={[8, 8, 0, 0]}
                    maxBarSize={60}
                />
            </BarChart>
        </ResponsiveContainer>
    );
}
