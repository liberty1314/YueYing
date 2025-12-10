/**
 * TypeDistributionChart - 类型分布图表（优化版）
 * 
 * 特点：
 * - 现代化环形图
 * - 优雅的标签设计
 * - 悬停动画效果
 * - 自定义 Tooltip
 */

'use client';

import { useState } from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';
import { motion, AnimatePresence } from 'framer-motion';
import type { DistributionData } from './types';

interface TypeDistributionChartProps {
    data: DistributionData[];
}

const COLORS = ['#007AFF', '#5856D6', '#34C759', '#FF9500', '#FF3B30', '#00C7BE', '#AF52DE'];

export function TypeDistributionChart({ data }: TypeDistributionChartProps) {
    const [activeIndex, setActiveIndex] = useState<number | null>(null);

    // 自定义 Tooltip - 增强动画
    const CustomTooltip = ({ active, payload }: any) => {
        if (active && payload && payload.length) {
            const data = payload[0];
            return (
                <div className="bg-white/95 dark:bg-[#1C1C1E]/95 backdrop-blur-xl border border-gray-200 dark:border-white/10 rounded-xl px-4 py-3 shadow-2xl animate-in fade-in zoom-in duration-200">
                    <div className="flex items-center gap-2 mb-1">
                        <div
                            className="w-3 h-3 rounded-full shadow-sm"
                            style={{ backgroundColor: data.payload.fill }}
                        />
                        <p className="text-sm font-semibold text-gray-900 dark:text-white">
                            {data.name}
                        </p>
                    </div>
                    <p className="text-lg font-bold text-gray-900 dark:text-white">
                        {data.value} 项
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                        占比 {((data.value / data.payload.total) * 100).toFixed(1)}%
                    </p>
                </div>
            );
        }
        return null;
    };

    // 计算总数
    const total = data.reduce((sum, item) => sum + item.value, 0);
    const dataWithTotal = data.map(item => ({ ...item, total }));

    return (
        <div className="relative">
            <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                    <Pie
                        data={dataWithTotal}
                        cx="50%"
                        cy="50%"
                        innerRadius={70}
                        outerRadius={100}
                        paddingAngle={3}
                        dataKey="value"
                        onMouseEnter={(_, index) => setActiveIndex(index)}
                        onMouseLeave={() => setActiveIndex(null)}
                        animationDuration={1000}
                        animationEasing="ease-out"
                    >
                        {dataWithTotal.map((entry, index) => (
                            <Cell
                                key={`cell-${index}`}
                                fill={entry.color || COLORS[index % COLORS.length]}
                                stroke="none"
                                style={{
                                    filter: activeIndex === index
                                        ? 'brightness(1.15) drop-shadow(0 4px 8px rgba(0,0,0,0.15))'
                                        : 'brightness(1)',
                                    transition: 'all 0.3s cubic-bezier(0.25, 0.46, 0.45, 0.94)',
                                    cursor: 'pointer',
                                    transform: activeIndex === index ? 'scale(1.05)' : 'scale(1)',
                                    transformOrigin: 'center',
                                }}
                            />
                        ))}
                    </Pie>
                    <Tooltip content={<CustomTooltip />} />
                </PieChart>
            </ResponsiveContainer>

            {/* 中心文字 - 增强动画 */}
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                <div className="text-center">
                    <AnimatePresence mode="wait">
                        {activeIndex !== null ? (
                            <motion.div
                                key="active"
                                initial={{ opacity: 0, scale: 0.7, y: 10 }}
                                animate={{ opacity: 1, scale: 1, y: 0 }}
                                exit={{ opacity: 0, scale: 0.7, y: -10 }}
                                transition={{
                                    duration: 0.3,
                                    type: 'spring',
                                    stiffness: 300,
                                    damping: 20
                                }}
                            >
                                <motion.p
                                    className="text-3xl font-bold text-gray-900 dark:text-white"
                                    animate={{ scale: [1, 1.05, 1] }}
                                    transition={{ duration: 0.3 }}
                                >
                                    {dataWithTotal[activeIndex].value}
                                </motion.p>
                                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                                    {dataWithTotal[activeIndex].name}
                                </p>
                            </motion.div>
                        ) : (
                            <motion.div
                                key="total"
                                initial={{ opacity: 0, scale: 0.7, y: 10 }}
                                animate={{ opacity: 1, scale: 1, y: 0 }}
                                exit={{ opacity: 0, scale: 0.7, y: -10 }}
                                transition={{
                                    duration: 0.3,
                                    type: 'spring',
                                    stiffness: 300,
                                    damping: 20
                                }}
                            >
                                <p className="text-3xl font-bold text-gray-900 dark:text-white">
                                    {total}
                                </p>
                                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                                    总计
                                </p>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>
            </div>

            {/* 自定义图例 - 增强动画 */}
            <div className="grid grid-cols-2 gap-2 mt-4">
                {dataWithTotal.map((entry, index) => (
                    <motion.div
                        key={index}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{
                            duration: 0.4,
                            delay: index * 0.06,
                            type: 'spring',
                            stiffness: 200,
                            damping: 15
                        }}
                        onMouseEnter={() => setActiveIndex(index)}
                        onMouseLeave={() => setActiveIndex(null)}
                        whileHover={{
                            scale: 1.03,
                            x: 4,
                            transition: { duration: 0.2 }
                        }}
                        className="flex items-center gap-2 px-2 py-1.5 rounded-lg hover:bg-gray-50 dark:hover:bg-white/5 transition-all duration-200 cursor-pointer"
                    >
                        <motion.div
                            className="w-3 h-3 rounded-full flex-shrink-0 shadow-sm"
                            style={{ backgroundColor: entry.color || COLORS[index % COLORS.length] }}
                            animate={activeIndex === index ? { scale: [1, 1.2, 1] } : {}}
                            transition={{ duration: 0.3 }}
                        />
                        <span className="text-xs font-medium text-gray-700 dark:text-gray-300 truncate">
                            {entry.name}
                        </span>
                        <motion.span
                            className="text-xs text-gray-500 dark:text-gray-400 ml-auto font-semibold"
                            animate={activeIndex === index ? { scale: 1.1 } : { scale: 1 }}
                            transition={{ duration: 0.2 }}
                        >
                            {entry.value}
                        </motion.span>
                    </motion.div>
                ))}
            </div>
        </div>
    );
}
