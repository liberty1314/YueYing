'use client';

import { useState } from 'react';
import { Card, Badge } from '@/components/ui';
import { MoreVerticalIcon, Edit2Icon, Trash2Icon, EyeIcon, StarIcon } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { UserItem } from '@/types';
import { statusLabels, statusColors, typeLabels } from '@/lib/adapters/userItemAdapter';

interface ItemCardProps {
    item: UserItem;
    onRefresh: () => void;
    onView: (item: UserItem) => void;
    onEdit: (item: UserItem) => void;
    onDelete: (item: UserItem) => void;
    variant?: 'grid' | 'list';
}

const typeEmojis = {
    movie: '🎬',
    tv: '📺',
    anime: '🎌',
    book: '📚',
    game: '🎮',
};

const statusColorMap: Record<string, string> = {
    want_to_watch: 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300',
    watching: 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300',
    watched: 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300',
};

export default function ItemCard({
    item,
    onRefresh,
    onView,
    onEdit,
    onDelete,
    variant = 'grid',
}: ItemCardProps) {
    const [showActions, setShowActions] = useState(false);
    const [isHovered, setIsHovered] = useState(false);

    // 获取封面图片
    const coverImage = item.poster_url || item.backdrop_url;

    // 列表视图
    if (variant === 'list') {
        return (
            <Card variant="elevated" className="p-4 hover:shadow-lg transition-shadow">
                <div className="flex items-center gap-4">
                    {/* 封面图片 */}
                    {coverImage && (
                        <div className="w-16 h-20 flex-shrink-0 rounded-lg overflow-hidden bg-gray-200 dark:bg-gray-800">
                            <img
                                src={coverImage}
                                alt={item.title}
                                className="w-full h-full object-cover"
                            />
                        </div>
                    )}

                    {/* 内容 */}
                    <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                            <h3 className="font-semibold text-gray-900 dark:text-white truncate">
                                {item.title}
                            </h3>
                            <Badge variant="outline" size="sm">
                                {typeLabels[item.content_type]}
                            </Badge>
                        </div>

                        <div className="flex items-center gap-2">
                            <Badge
                                variant="default"
                                size="sm"
                                className={statusColorMap[item.status]}
                            >
                                {statusLabels[item.status]}
                            </Badge>
                            {item.rating && (
                                <div className="flex items-center gap-1">
                                    <StarIcon className="w-4 h-4 text-yellow-500 fill-yellow-500" />
                                    <span className="text-sm text-gray-900 dark:text-white">
                                        {item.rating.toFixed(1)}
                                    </span>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* 操作按钮 */}
                    <button
                        onClick={() => setShowActions(!showActions)}
                        className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
                    >
                        <MoreVerticalIcon className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                    </button>
                </div>

                {/* 操作菜单 */}
                {showActions && (
                    <div className="mt-2 pt-2 border-t border-gray-200 dark:border-gray-700 flex gap-2">
                        <button
                            onClick={() => {
                                onView(item);
                                setShowActions(false);
                            }}
                            className="flex-1 px-3 py-2 text-sm bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-lg transition-colors flex items-center justify-center gap-2"
                        >
                            <EyeIcon className="w-4 h-4" />
                            查看
                        </button>
                        <button
                            onClick={() => {
                                onEdit(item);
                                setShowActions(false);
                            }}
                            className="flex-1 px-3 py-2 text-sm bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-lg transition-colors flex items-center justify-center gap-2"
                        >
                            <Edit2Icon className="w-4 h-4" />
                            编辑
                        </button>
                        <button
                            onClick={() => {
                                onDelete(item);
                                setShowActions(false);
                            }}
                            className="flex-1 px-3 py-2 text-sm bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 hover:bg-red-100 dark:hover:bg-red-900/30 rounded-lg transition-colors flex items-center justify-center gap-2"
                        >
                            <Trash2Icon className="w-4 h-4" />
                            删除
                        </button>
                    </div>
                )}
            </Card>
        );
    }

    // 卡片视图 - Netflix/Apple TV 风格（图片和信息分离）
    return (
        <div className="relative">
            <div
                className="group cursor-pointer"
                onMouseEnter={() => setIsHovered(true)}
                onMouseLeave={() => setIsHovered(false)}
                onClick={() => onView(item)}
            >
                {/* 图片卡片 - 独立容器，带圆角、阴影和 hover 效果 */}
                <Card
                    variant="elevated"
                    className={cn(
                        "overflow-hidden transition-all duration-300",
                        "hover:shadow-xl hover:-translate-y-1",
                        isHovered && "ring-2 ring-primary-500"
                    )}
                >
                    <div className="relative aspect-[2/3] bg-gray-200 dark:bg-gray-800 overflow-hidden">
                        {coverImage ? (
                            <img
                                src={coverImage}
                                alt={item.title}
                                className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                            />
                        ) : (
                            <div className="flex items-center justify-center h-full text-gray-500 dark:text-gray-600">
                                <span className="text-5xl">{typeEmojis[item.content_type]}</span>
                            </div>
                        )}

                        {/* Hover 遮罩层 */}
                        {isHovered && (
                            <div className="absolute inset-0 bg-black/60 flex items-center justify-center transition-opacity duration-300">
                                <div className="flex gap-3">
                                    <button
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            onView(item);
                                        }}
                                        className="p-3 rounded-full bg-white/90 hover:bg-white transition-colors"
                                        title="查看详情"
                                    >
                                        <EyeIcon className="w-5 h-5 text-gray-900" />
                                    </button>
                                    <button
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            onEdit(item);
                                        }}
                                        className="p-3 rounded-full bg-white/90 hover:bg-white transition-colors"
                                        title="编辑"
                                    >
                                        <Edit2Icon className="w-5 h-5 text-gray-900" />
                                    </button>
                                    <button
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            setShowActions(!showActions);
                                        }}
                                        className="p-3 rounded-full bg-white/90 hover:bg-white transition-colors"
                                        title="更多操作"
                                    >
                                        <MoreVerticalIcon className="w-5 h-5 text-gray-900" />
                                    </button>
                                </div>
                            </div>
                        )}

                        {/* 状态徽章 */}
                        <div className="absolute top-2 left-2">
                            <Badge
                                variant="default"
                                size="sm"
                                className={statusColorMap[item.status]}
                            >
                                {statusLabels[item.status]}
                            </Badge>
                        </div>
                    </div>
                </Card>

                {/* 信息区域 - 独立容器，透明背景 */}
                <div className="mt-2 px-1">
                    {/* 标题 */}
                    <h3 className="font-semibold text-gray-900 dark:text-white line-clamp-2 mb-1 text-sm leading-tight">
                        {item.title}
                    </h3>

                    {/* 元数据行 */}
                    <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400">
                        <span>{item.year || '未知'}</span>
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

            {/* 快捷操作菜单 */}
            {showActions && (
                <div className="absolute top-full left-0 right-0 mt-2 bg-white dark:bg-gray-800 rounded-lg shadow-xl border border-gray-200 dark:border-gray-700 z-30 overflow-hidden">
                    <button
                        onClick={() => {
                            onView(item);
                            setShowActions(false);
                        }}
                        className="w-full px-4 py-2 text-left text-sm hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center gap-2"
                    >
                        <EyeIcon className="w-4 h-4" />
                        查看详情
                    </button>
                    <button
                        onClick={() => {
                            onEdit(item);
                            setShowActions(false);
                        }}
                        className="w-full px-4 py-2 text-left text-sm hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center gap-2"
                    >
                        <Edit2Icon className="w-4 h-4" />
                        编辑记录
                    </button>
                    <button
                        onClick={() => {
                            onDelete(item);
                            setShowActions(false);
                        }}
                        className="w-full px-4 py-2 text-left text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 flex items-center gap-2"
                    >
                        <Trash2Icon className="w-4 h-4" />
                        删除记录
                    </button>
                </div>
            )}
        </div>
    );
}
