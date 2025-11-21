/**
 * TagCloudWidget - 标签云组件
 * Week 6: 数据可视化 - 热门标签词云展示
 */

'use client';

import { Card } from '@/components/ui';
import { TagIcon } from 'lucide-react';
import { getColorPalette } from '@/lib/chart-theme';
import { useState } from 'react';

export interface TagData {
  name: string;
  count: number;
  color?: string;
}

export interface TagCloudWidgetProps {
  title?: string;
  data: TagData[];
  className?: string;
  minFontSize?: number;
  maxFontSize?: number;
  onTagClick?: (tag: TagData) => void;
}

export function TagCloudWidget({
  title = '热门标签',
  data,
  className,
  minFontSize = 0.875, // 14px
  maxFontSize = 2, // 32px
  onTagClick,
}: TagCloudWidgetProps) {
  const [hoveredTag, setHoveredTag] = useState<string | null>(null);

  if (data.length === 0) {
    return (
      <Card className={className}>
        <div className="p-6">
          <div className="flex items-center gap-2 mb-6">
            <TagIcon className="w-5 h-5 text-primary-500" />
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              {title}
            </h3>
          </div>
          <div className="text-center py-8">
            <TagIcon className="w-12 h-12 text-gray-400 dark:text-gray-500 mx-auto mb-3" />
            <p className="text-gray-500 dark:text-gray-400">暂无标签数据</p>
          </div>
        </div>
      </Card>
    );
  }

  // 计算字体大小
  const maxCount = Math.max(...data.map(tag => tag.count), 1);
  const minCount = Math.min(...data.map(tag => tag.count), 1);
  const countRange = maxCount - minCount || 1;

  const getFontSize = (count: number) => {
    const ratio = (count - minCount) / countRange;
    return minFontSize + ratio * (maxFontSize - minFontSize);
  };

  // 为标签分配颜色
  const colors = getColorPalette(6);
  const tagsWithColors = data.map((tag, index) => ({
    ...tag,
    color: tag.color || colors[index % colors.length],
    fontSize: getFontSize(tag.count),
  }));

  // 按数量排序
  const sortedTags = [...tagsWithColors].sort((a, b) => b.count - a.count);

  const totalCount = data.reduce((sum, tag) => sum + tag.count, 0);

  return (
    <Card className={className}>
      <div className="p-6">
        {/* Header */}
        <div className="flex items-center gap-2 mb-6">
          <TagIcon className="w-5 h-5 text-primary-500" />
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
            {title}
          </h3>
        </div>

        {/* Tag Cloud */}
        <div className="flex flex-wrap items-center justify-center gap-3 py-4 min-h-[200px]">
          {tagsWithColors.map((tag, index) => {
            const isHovered = hoveredTag === tag.name;
            
            return (
              <button
                key={index}
                className={`
                  px-3 py-1.5 rounded-lg font-medium transition-all duration-200
                  ${onTagClick ? 'cursor-pointer' : 'cursor-default'}
                  ${isHovered ? 'scale-110 shadow-lg' : 'shadow'}
                `}
                style={{
                  fontSize: `${tag.fontSize}rem`,
                  backgroundColor: `${tag.color}20`,
                  color: tag.color,
                  border: `1px solid ${tag.color}40`,
                }}
                onClick={() => onTagClick && onTagClick(tag)}
                onMouseEnter={() => setHoveredTag(tag.name)}
                onMouseLeave={() => setHoveredTag(null)}
              >
                {tag.name}
                <span className="ml-1.5 text-xs opacity-75">
                  ({tag.count})
                </span>
              </button>
            );
          })}
        </div>

        {/* Top Tags List */}
        <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
          <p className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">
            Top 5 标签
          </p>
          <div className="space-y-2">
            {sortedTags.slice(0, 5).map((tag, index) => (
              <div
                key={index}
                className={`flex items-center justify-between ${onTagClick ? 'cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800 rounded px-2 py-1' : ''}`}
                onClick={() => onTagClick && onTagClick(tag)}
              >
                <div className="flex items-center gap-2">
                  <div
                    className="w-3 h-3 rounded-full"
                    style={{ backgroundColor: tag.color }}
                  />
                  <span className="text-sm text-gray-700 dark:text-gray-300">
                    {tag.name}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-sm font-semibold text-gray-900 dark:text-white">
                    {tag.count}
                  </span>
                  <span className="text-xs text-gray-500 dark:text-gray-400">
                    ({((tag.count / totalCount) * 100).toFixed(1)}%)
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Total */}
        <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700 text-center">
          <p className="text-2xl font-bold text-primary-500">{totalCount}</p>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">标签总使用次数</p>
        </div>
      </div>
    </Card>
  );
}
