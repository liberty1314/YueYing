'use client';

import { useState } from 'react';
import { Card, Badge, Button } from '@/components/ui';
import { PlusIcon, CheckIcon, SparklesIcon } from 'lucide-react';
import { cn } from '@/lib/utils';
import { userItemsApi } from '@/lib/api';
import type { UserItem } from '@/types';

interface RecommendationCardProps {
    item: UserItem;
}

const typeEmojis = {
    movie: '🎬',
    tv: '📺',
    anime: '🎌',
    book: '📚',
};

export default function RecommendationCard({ item }: RecommendationCardProps) {
    const [added, setAdded] = useState(false);
    const [loading, setLoading] = useState(false);
    const [isHovered, setIsHovered] = useState(false);

    const handleAdd = async (e: React.MouseEvent) => {
        e.stopPropagation();
        if (added || loading) return;

        try {
            setLoading(true);

            await userItemsApi.create({
                external_id: item.external_id,
                source: item.source,
                content_type: item.content_type,
                title: item.title,
                original_title: item.original_title,
                description: item.description,
                poster_url: item.poster_url,
                backdrop_url: item.backdrop_url,
                release_date: item.release_date,
                year: item.year,
                status: 'want_to_watch',
                rating: item.rating,
            });

            setAdded(true);
        } catch (error) {
            console.error('添加失败:', error);
        } finally {
            setLoading(false);
        }
    };

    const coverImage = item.poster_url || item.backdrop_url;

    return (
        <div
            className="group cursor-pointer"
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
        >
            {/* 图片卡片 - 独立容器，带圆角、阴影和 hover 效果 */}
            <Card
                variant="elevated"
                className={cn(
                    "overflow-hidden transition-all duration-300",
                    "hover:shadow-xl hover:-translate-y-1"
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
                            <Button
                                variant={added ? 'outline' : 'primary'}
                                size="sm"
                                onClick={handleAdd}
                                disabled={added || loading}
                                className="bg-white text-gray-900 hover:bg-gray-100 dark:bg-white dark:text-gray-900"
                            >
                                {added ? (
                                    <>
                                        <CheckIcon className="w-4 h-4 mr-1" />
                                        已添加
                                    </>
                                ) : (
                                    <>
                                        <PlusIcon className="w-4 h-4 mr-1" />
                                        添加到库
                                    </>
                                )}
                            </Button>
                        </div>
                    )}

                    {/* AI 推荐徽章 */}
                    <div className="absolute top-2 left-2">
                        <Badge
                            variant="default"
                            size="sm"
                            className="bg-gradient-to-r from-primary-500 to-purple-500 text-white dark:text-white"
                        >
                            <SparklesIcon className="w-3 h-3 mr-1 text-white dark:text-white" />
                            AI推荐
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
    );
}
