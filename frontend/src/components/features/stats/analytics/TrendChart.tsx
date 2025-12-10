/**
 * TrendChart - 趋势图表组件
 * 
 * 使用 Recharts 绘制时间趋势图
 */

'use client';

import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import type { TrendDataPoint } from './types';

interface TrendChartProps {
    data: TrendDataPoint[];
    dataKey?: string;
    color?: string;
}

export function TrendChart({ data, dataKey = 'value', color = '#007AFF' }: TrendChartProps) {
    return (
        <ResponsiveContainer width="100%" height={300}>
            <LineChart data={data} margin={{ top: 5, right: 5, left: 0, bottom: 5 }}>
                <defs>
                    <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor={color} stopOpacity={0.3} />
                        <stop offset="95%" stopColor={color} stopOpacity={0} />
                    </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(0,0,0,0.05)" />
                <XAxis
                    dataKey="date"
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
                />
                <Line
                    type="monotone"
                    dataKey={dataKey}
                    stroke={color}
                    strokeWidth={3}
                    dot={{ fill: color, strokeWidth: 2, r: 4 }}
                    activeDot={{ r: 6 }}
                    fill="url(#colorValue)"
                />
            </LineChart>
        </ResponsiveContainer>
    );
}
