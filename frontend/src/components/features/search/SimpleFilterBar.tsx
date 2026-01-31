/**
 * SimpleFilterBar - 简化筛选栏
 * 
 * 只保留分类和年份两个筛选维度
 */

'use client';

import { Badge } from '@/components/ui';
import { FilterIcon } from 'lucide-react';

interface SimpleFilterBarProps {
  selectedType?: string;
  selectedYearRange?: [number, number];
  onTypeChange: (type: string) => void;
  onYearRangeChange: (range: [number, number]) => void;
}

const contentTypes = [
  { value: '', label: '全部' },
  { value: 'movie', label: '电影' },
  { value: 'tv', label: '剧集' },
  { value: 'anime', label: '动画' },
  { value: 'book', label: '书籍' },
];

const currentYear = new Date().getFullYear();

export function SimpleFilterBar({
  selectedType = '',
  selectedYearRange,
  onTypeChange,
  onYearRangeChange,
}: SimpleFilterBarProps) {
  return (
    <div className="space-y-4">
      {/* Content Type Filter */}
      <div>
        <div className="flex items-center gap-2 mb-3">
          <FilterIcon className="w-4 h-4 text-gray-500" />
          <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300">内容类型</h4>
        </div>
        <div className="flex flex-wrap gap-2">
          {contentTypes.map((type) => (
            <button
              key={type.value}
              onClick={() => onTypeChange(type.value)}
              className={`
                px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200
                ${selectedType === type.value
                  ? 'bg-blue-600 dark:bg-blue-500 text-white shadow-md'
                  : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'
                }
              `}
            >
              {type.label}
            </button>
          ))}
        </div>
      </div>

      {/* Year Range Filter */}
      <div>
        <div className="flex items-center gap-2 mb-3">
          <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300">年份范围</h4>
          {selectedYearRange && (
            <Badge variant="primary" size="sm">
              {selectedYearRange[0]} - {selectedYearRange[1]}
            </Badge>
          )}
        </div>
        <div className="px-2 space-y-4">
          {/* 最小年份滑块 */}
          <div>
            <label className="text-xs text-gray-600 dark:text-gray-400 mb-1 block">
              最早年份: {selectedYearRange?.[0] || 1990}
            </label>
            <input
              type="range"
              min={1990}
              max={currentYear}
              value={selectedYearRange?.[0] || 1990}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                const minYear = parseInt(e.target.value);
                const maxYear = selectedYearRange?.[1] || currentYear;
                // 确保最小年份不大于最大年份
                if (minYear <= maxYear) {
                  onYearRangeChange([minYear, maxYear]);
                }
              }}
              className="w-full h-2 bg-gray-200 dark:bg-gray-700 rounded-lg appearance-none cursor-pointer accent-blue-600 dark:accent-blue-500"
            />
          </div>
          
          {/* 最大年份滑块 */}
          <div>
            <label className="text-xs text-gray-600 dark:text-gray-400 mb-1 block">
              最晚年份: {selectedYearRange?.[1] || currentYear}
            </label>
            <input
              type="range"
              min={1990}
              max={currentYear}
              value={selectedYearRange?.[1] || currentYear}
              onChange={(e) => {
                const maxYear = parseInt(e.target.value);
                const minYear = selectedYearRange?.[0] || 1990;
                // 确保最大年份不小于最小年份
                if (maxYear >= minYear) {
                  onYearRangeChange([minYear, maxYear]);
                }
              }}
              className="w-full h-2 bg-gray-200 dark:bg-gray-700 rounded-lg appearance-none cursor-pointer accent-blue-600 dark:accent-blue-500"
            />
          </div>
          
          {/* 年份范围显示 */}
          <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400 pt-2 border-t border-gray-200 dark:border-gray-700">
            <span>可选范围: 1990 - {currentYear}</span>
          </div>
        </div>
      </div>

      {/* Clear Filters */}
      {(selectedType || selectedYearRange) && (
        <button
          onClick={() => {
            onTypeChange('');
            onYearRangeChange([1990, currentYear]);
          }}
          className="text-sm text-primary-600 dark:text-primary-400 hover:underline"
        >
          清除筛选
        </button>
      )}
    </div>
  );
}
