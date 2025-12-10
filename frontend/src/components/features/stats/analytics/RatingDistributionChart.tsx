/**
 * RatingDistributionChart - 评分分布图表（优化版）
 * 
 * 特点：
 * - 渐变柱状图
 * - 隐藏网格线
 * - 悬停动画
 * - 优雅的 Tooltip
 */

'use client';

import { useState } from 'react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { useTheme } from 'next-themes';
import { Star } from 'lucide-react';
import type { DistributionData } from './types';

interface RatingDistributionChartProps {
    data: DistributionData[];
}

export function RatingDistributionChart({ data }: RatingDistributionChartProps) {
    const { theme } = useTheme();
    const isDark = theme === 'dark';
    const [activeIndex, setActiveIndex] = useState<number | null>(null);

    // 根据评分生成颜色
    const getColorByRating = (name: string) => {
        const rating = parseFloat(name);
        if (rating >= 9) return '#34C759'; // 绿色 - 优秀
        if (rating >= 8) return '#007AFF'; // 蓝色 - 很好
        if (rating >= 7) return '#5856D6'; // 紫色 - 好
        if (rating >= 6) return '#FF9500'; // 橙色 - 一般
        return '#FF3B30'; // 红色 - 较差
    };

    // 自定义 Tooltip - 增强动画
    const CustomTooltip = ({ active, payload }: any) => {
        if (active && payload && payload.length) {
            const data = payload[0];
            return (
                <div className="bg-white/95 dark:bg-[#1C1C1E]/95 backdrop-blur-xl border border-gray-200 dark:border-white/10 rounded-xl px-4 py-3 shadow-2xl animate-in fade-in zoom-in duration-200">
                    <div className="flex items-center gap-2 mb-1">
                        <Star className="w-4 h-4 fill-yellow-400 text-yellow-400 drop-shadow-sm" />
                        <p className="text-sm font-semibold text-gray-900 dark:text-white">
                            {data.payload.name} 分
                        </p>
                    </div>
                    <p className="text-lg font-bold text-gray-900 dark:text-white">
                        {data.value} 项
                    </p>
                </div>
            );
        }
        return null;
    };

    return (
        <ResponsiveContainer width="100%" height={300}>
            <BarChart
                data={data}
                margin={{ top: 10, right: 10, left: 0, bottom: 0 }}
                onMouseMove={(state) => {
                    if (state.isTooltipActive) {
                        setActiveIndex(state.activeTooltipIndex ?? null);
                    } else {
                        setActiveIndex(null);
                    }
                }}
                onMouseLeave={() => setActiveIndex(null)}
            >
                <defs>
                    {/* 为每个柱子创建渐变 */}
                    {data.map((entry, index) => {
                        const color = getColorByRating(entry.name);
                        return (
                            <linearGradient key={`gradient-${index}`} id={`barGradient-${index}`} x1="0" y1="0" x2="0" y2="1">
                                <stop offset="0%" stopColor={color} stopOpacity={0.9} />
                                <stop offset="100%" stopColor={color} stopOpacity={0.4} />
                            </linearGradient>
                        );
                    })}
                </defs>

                {/* 隐藏网格线 */}
                <XAxis
                    dataKey="name"
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

                <Tooltip
                    content={<CustomTooltip />}
                    cursor={{ fill: 'rgba(0, 122, 255, 0.05)', radius: 8 }}
                />

                <Bar
                    dataKey="value"
                    radius={[10, 10, 0, 0]}
                    maxBarSize={50}
                    animationDuration={1000}
                    animationEasing="ease-out"
                >
                    {data.map((entry, index) => (
                        <Cell
                            key={`cell-${index}`}
                            fill={`url(#barGradient-${index})`}
                            style={{
                                filter: activeIndex === index
                                    ? 'brightness(1.2) drop-shadow(0 4px 8px rgba(0,0,0,0.15))'
                                    : 'brightness(1)',
                                transition: 'all 0.3s cubic-bezier(0.25, 0.46, 0.45, 0.94)',
                            }}
                        />
                    ))}
                </Bar>
            </BarChart>
        </ResponsiveContainer>
    );
}
