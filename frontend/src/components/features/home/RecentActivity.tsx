/**
 * RecentActivity - 最近活动列表
 * 
 * 展示用户最近的记录活动
 */

'use client';

import { Card, CardHeader, CardTitle, CardContent, Badge } from '@/components/ui';
import { formatRelativeTime } from '@/lib/utils';
import Image from 'next/image';
import Link from 'next/link';

interface ActivityItem {
  id: number;
  title: string;
  type: 'movie' | 'tv' | 'anime' | 'book' | 'game';
  poster_url?: string;
  status: string;
  rating?: number;
  updated_at: string;
}

interface RecentActivityProps {
  items?: ActivityItem[];
}

const typeLabels = {
  movie: '电影',
  tv: '剧集',
  anime: '动画',
  book: '书籍',
  game: '游戏',
};

const typeColors = {
  movie: 'primary' as const,
  tv: 'primary' as const,
  anime: 'warning' as const,
  book: 'success' as const,
  game: 'error' as const,
};

export function RecentActivity({ items = [] }: RecentActivityProps) {
  if (items.length === 0) {
    return (
      <Card variant="elevated">
        <CardHeader>
          <CardTitle>📋 最近活动</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-12 text-gray-500 dark:text-gray-400">
            <p>暂无活动记录</p>
            <p className="text-sm mt-2">开始添加你的第一条记录吧！</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card variant="elevated">
      <CardHeader>
        <CardTitle>📋 最近活动</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {items.map((item) => (
            <Link
              key={item.id}
              href={`/item/${item.id}`}
              className="flex items-center gap-4 p-3 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors group"
            >
              {/* 海报 */}
              <div className="relative w-12 h-16 rounded overflow-hidden flex-shrink-0 bg-gray-200 dark:bg-gray-700">
                {item.poster_url ? (
                  <Image
                    src={item.poster_url}
                    alt={item.title}
                    fill
                    className="object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-gray-500 dark:text-gray-400">
                    <span className="text-xs">无图</span>
                  </div>
                )}
              </div>

              {/* 信息 */}
              <div className="flex-1 min-w-0">
                <h4 className="font-medium text-gray-900 dark:text-white truncate group-hover:text-primary-500 transition-colors">
                  {item.title}
                </h4>
                <div className="flex items-center gap-2 mt-1">
                  <Badge variant={typeColors[item.type]} size="sm">
                    {typeLabels[item.type]}
                  </Badge>
                  <span className="text-sm text-gray-600 dark:text-gray-400">
                    {item.status}
                  </span>
                  {item.rating && (
                    <span className="text-sm text-yellow-600 dark:text-yellow-400">
                      ⭐ {item.rating}/10
                    </span>
                  )}
                </div>
              </div>

              {/* 时间 */}
              <div className="text-xs text-gray-500 dark:text-gray-500 flex-shrink-0">
                {formatRelativeTime(item.updated_at)}
              </div>
            </Link>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
