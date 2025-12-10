/**
 * TypeDistributionChart - 类型分布图表
 * 
 * 使用 Recharts 绘制饼图/环形图
 */

'use client';

import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts';
import type { DistributionData } from './types';

interface TypeDistributionChartProps {
    data: DistributionData[];
}

const COLORS = ['#007AFF', '#5856D6', '#34C759', '#FF9500', '#FF3B30', '#00C7BE'];

export function TypeDistributionChart({ data }: TypeDistributionChartProps) {
    return (
        <ResponsiveContainer width="100%" height={300}>
            <PieChart>
                <Pie
                    data={data}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={100}
                    paddingAngle={2}
                    dataKey="value"
                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                    labelLine={false}
                >
                    {data.map((entry, index) => (
                        <Cell
                            key={`cell-${index}`}
                            fill={entry.color || COLORS[index % COLORS.length]}
                            stroke="none"
                        />
                    ))}
                </Pie>
                <Tooltip
                    contentStyle={{
                        backgroundColor: 'rgba(255, 255, 255, 0.95)',
                        border: '1px solid rgba(0,0,0,0.1)',
                        borderRadius: '8px',
                        boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                    }}
                />
                <Legend
                    verticalAlign="bottom"
                    height={36}
                    iconType="circle"
                    formatter={(value) => <span style={{ fontSize: '12px' }}>{value}</span>}
                />
            </PieChart>
        </ResponsiveContainer>
    );
}
