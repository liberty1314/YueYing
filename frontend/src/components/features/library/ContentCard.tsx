/**
 * ContentCard - 内容卡片组件（简化版）
 * 
 * 功能：
 * - 整卡可点击，导航到详情页
 * - 悬停时缩放和阴影效果
 * - 状态徽章显示
 * - 批量选择模式支持
 */

'use client';

import { useRouter } from 'next/navigation';
import { Card } from '@/components/ui';
import { Badge } from '@/components/ui';
import {
  PlayIcon,
  CheckIcon,
  ClockIcon,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import type { UserItem } from '@/types';

interface ContentCardProps {
  item: UserItem;
  isSelectable?: boolean;
  isSelected?: boolean;
  onSelect?: (item: UserItem) => void;
}

const statusConfig = {
  want_to_watch: { label: '想看', icon: ClockIcon, color: 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300' },
  watching: { label: '在看', icon: PlayIcon, color: 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300' },
  watched: { label: '看过', icon: CheckIcon, color: 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300' },
};

const typeEmojis = {
  movie: '🎬',
  tv: '📺',
  anime: '🎌',
  book: '📚',
};

export function ContentCard({
  item,
  isSelectable = false,
  isSelected = false,
  onSelect,
}: ContentCardProps) {
  const router = useRouter();
  const statusInfo = statusConfig[item.status];
  const StatusIcon = statusInfo.icon;
  const coverImage = item.poster_url || item.backdrop_url;

  // 提取年份
  const getDisplayYear = (): string => {
    if (item.year && String(item.year).length === 4) {
      return String(item.year);
    }
    if (item.release_date) {
      try {
        const year = new Date(item.release_date).getFullYear();
        if (!isNaN(year) && year > 1800 && year < 2100) {
          return String(year);
        }
      } catch (e) {
        // 解析失败
      }
    }
    return '未知';
  };

  const displayYear = getDisplayYear();

  const handleCardClick = () => {
    if (isSelectable && onSelect) {
      onSelect(item);
    } else {
      router.push(`/library/${item.id}`);
    }
  };

  return (
    <div className="relative">
      {/* 选择框 */}
      {isSelectable && (
        <div className="absolute -top-2 -left-2 z-20">
          <button
            onClick={(e) => {
              e.stopPropagation();
              if (onSelect) onSelect(item);
            }}
            className={cn(
              'w-6 h-6 rounded-full border-2 transition-all flex items-center justify-center',
              isSelected
                ? 'bg-blue-500 border-blue-500'
                : 'bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600 hover:border-blue-500'
            )}
          >
            {isSelected && <CheckIcon className="w-4 h-4 text-white" />}
          </button>
        </div>
      )}

      <div
        onClick={handleCardClick}
        className="cursor-pointer"
      >
        {/* 图片卡片 */}
        <Card
          variant="elevated"
          className={cn(
            'overflow-hidden transition-all duration-300 rounded-xl',
            'hover:scale-105 hover:shadow-lg',
            isSelected && 'ring-2 ring-blue-500'
          )}
        >
          <div className="relative aspect-[2/3] overflow-hidden bg-gray-200 dark:bg-gray-800">
            {coverImage ? (
              <img
                src={coverImage}
                alt={item.title}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="flex items-center justify-center h-full text-gray-500 dark:text-gray-600">
                <span className="text-5xl">{typeEmojis[item.content_type]}</span>
              </div>
            )}

            {/* 状态徽章 */}
            <div className="absolute top-2 left-2">
              <Badge variant="default" size="sm" className={statusInfo.color}>
                <StatusIcon className="w-3 h-3 mr-1" />
                {statusInfo.label}
              </Badge>
            </div>
          </div>
        </Card>

        {/* 信息区域 */}
        <div className="mt-2 px-1">
          <h3 className="font-semibold text-gray-900 dark:text-white line-clamp-2 mb-1 text-sm leading-tight">
            {item.title}
          </h3>
          <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400">
            <span>{displayYear}</span>
            {item.rating ? (
              <span className="text-yellow-500 font-medium">
                ⭐ {item.rating.toFixed(1)}
              </span>
            ) : (
              <span>未评分</span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
