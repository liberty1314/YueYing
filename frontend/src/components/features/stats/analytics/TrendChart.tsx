/**
 * TrendChart - 趋势图表组件（优化版）
 * 
 * 特点：
 * - 平滑曲线（Basis）
 * - 渐变填充区域
 * - 隐藏网格线
 * - 优雅的 Tooltip
 */

'use client';

import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import { useTheme } from 'next-themes';
import type { TrendDataPoint } from './types';

interface TrendChartProps {
    data: TrendDataPoint[];
    dataKey?: string;
    color?: string;
}

export function TrendChart({ data, dataKey = 'value', color = '#34C759' }: TrendChartProps) {
    const { theme } = useTheme();
    const isDark = theme === 'dark';

    // 自定义 Tooltip - 增强动画
    const CustomTooltip = ({ active, payload }: any) => {
        if (active && payload && payload.length) {
            return (
                <div className="bg-white/95 dark:bg-[#1C1C1E]/95 backdrop-blur-xl border border-gray-200 dark:border-white/10 rounded-xl px-4 py-3 shadow-2xl animate-in fade-in zoom-in duration-200">
                    <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">
                        {payload[0].payload.date}
                    </p>
                    <p className="text-lg font-bold text-gray-900 dark:text-white">
                        {payload[0].value} 项
                    </p>
                </div>
            );
        }
        return null;
    };

    return (
        <ResponsiveContainer width="100%" height={300}>
            <AreaChart data={data} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                <defs>
                    {/* 渐变填充 */}
                    <linearGradient id="areaGradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor={color} stopOpacity={0.4} />
                        <stop offset="50%" stopColor={color} stopOpacity={0.2} />
                        <stop offset="100%" stopColor={color} stopOpacity={0} />
                    </linearGradient>
                    {/* 线条渐变 */}
                    <linearGradient id="lineGradient" x1="0" y1="0" x2="1" y2="0">
                        <stop offset="0%" stopColor={color} stopOpacity={0.8} />
                        <stop offset="50%" stopColor={color} stopOpacity={1} />
                        <stop offset="100%" stopColor={color} stopOpacity={0.8} />
                    </linearGradient>
                </defs>

                {/* 隐藏网格线 */}
                <XAxis
                    dataKey="date"
                    stroke={isDark ? 'rgba(255,255,255,0.2)' : 'rgba(0,0,0,0.2)'}
                    style={{ fontSize: '11px', fontWeight: 500 }}
                    tickLine={false}
                    axisLine={false}
                    dy={10}
                />
                <YAxis
                    stroke={isDark ? 'rgba(255,255,255,0.2)' : 'rgba(0,0,0,0.2)'}
                    style={{ fontSize: '11px', fontWeight: 500 }}
                    tickLine={false}
                    axisLine={false}
                    dx={-10}
                    width={40}
                />

                <Tooltip content={<CustomTooltip />} cursor={{ stroke: color, strokeWidth: 1, strokeDasharray: '4 4' }} />

                {/* 平滑曲线 + 渐变填充 */}
                <Area
                    type="basis"
                    dataKey={dataKey}
                    stroke="url(#lineGradient)"
                    strokeWidth={3}
                    fill="url(#areaGradient)"
                    dot={false}
                    activeDot={{
                        r: 7,
                        fill: color,
                        stroke: '#fff',
                        strokeWidth: 3,
                        style: {
                            filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.2))',
                            transition: 'all 0.2s ease',
                        }
                    }}
                    animationDuration={1200}
                    animationEasing="ease-out"
                />
            </AreaChart>
        </ResponsiveContainer>
    );
}
