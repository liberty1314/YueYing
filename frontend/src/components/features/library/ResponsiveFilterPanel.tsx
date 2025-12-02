/**
 * ResponsiveFilterPanel - 响应式筛选面板包装器
 * 
 * 功能：
 * - 桌面端：固定侧边栏
 * - 移动端：抽屉式侧边栏
 */

'use client';

import { useState } from 'react';
import { FilterIcon, XIcon } from 'lucide-react';
import { AdvancedFilterPanel } from './AdvancedFilterPanel';
import type { ItemType, ItemStatus } from '@/types';

interface FilterState {
    content_type?: ItemType;
    status?: ItemStatus;
    search?: string;
    min_rating?: number;
    max_rating?: number;
    tags?: string[];
    year_min?: number;
    year_max?: number;
    sortBy?: string;
}

interface ResponsiveFilterPanelProps {
    filters: FilterState;
    onFilterChange: (filters: FilterState) => void;
    onClearFilters: () => void;
    activeTags?: string[];
    onToggleBatchMode?: () => void;
    batchMode?: boolean;
}

export function ResponsiveFilterPanel(props: ResponsiveFilterPanelProps) {
    const [isDrawerOpen, setIsDrawerOpen] = useState(false);

    return (
        <>
            {/* 移动端：浮动筛选按钮 */}
            <button
                onClick={() => setIsDrawerOpen(true)}
                className="lg:hidden fixed bottom-6 right-6 z-40 p-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-full shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-110 active:scale-95"
                aria-label="打开筛选器"
            >
                <FilterIcon className="w-6 h-6" />
            </button>

            {/* 移动端：抽屉式侧边栏 */}
            {isDrawerOpen && (
                <div className="lg:hidden fixed inset-0 z-50 animate-fadeIn">
                    {/* 遮罩层 */}
                    <div
                        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
                        onClick={() => setIsDrawerOpen(false)}
                    />

                    {/* 抽屉内容 */}
                    <div className="absolute left-0 top-0 bottom-0 w-80 max-w-[85vw] bg-white dark:bg-gray-900 shadow-2xl animate-slideInLeft overflow-y-auto">
                        {/* 关闭按钮 */}
                        <div className="sticky top-0 z-10 bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700 p-4 flex items-center justify-between">
                            <h3 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                                <FilterIcon className="w-5 h-5" />
                                筛选器
                            </h3>
                            <button
                                onClick={() => setIsDrawerOpen(false)}
                                className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
                            >
                                <XIcon className="w-5 h-5" />
                            </button>
                        </div>

                        {/* 筛选面板 */}
                        <div className="p-4">
                            <AdvancedFilterPanel {...props} />
                        </div>
                    </div>
                </div>
            )}

            {/* 桌面端：固定侧边栏 */}
            <div className="hidden lg:block">
                <AdvancedFilterPanel {...props} />
            </div>
        </>
    );
}
