'use client';

import { useState } from 'react';
import { Card, Badge, Button } from '@/components/ui';
import { PlusIcon, CheckIcon } from 'lucide-react';
import { cn } from '@/lib/utils';
import { userItemsApi } from '@/lib/api';
import type { ItemType } from '@/types';

interface SearchResult {
    id: string;
    external_id: string;
    title: string;
    original_title?: string;
    description?: string;
    poster_url?: string;
    backdrop_url?: string;
    release_date?: string;
    year?: string;
    rating?: number;
}

interface SearchCardProps {
    result: SearchResult;
    contentType: ItemType;
    source: string;
}

const typeEmojis: Record<ItemType, string> = {
    movie: '🎬',
    tv: '📺',
    anime: '🎌',
    book: '📚',
};

export default function SearchCard({ result, contentType, source }: SearchCardProps) {
    const [added, setAdded] = useState(false);
    const [loading, setLoading] = useState(false);
    const [isHovered, setIsHovered] = useState(false);

    const handleAdd = async (e: React.MouseEvent) => {
        e.stopPropagation();
        if (added || loading) return;

        try {
            setLoading(true);

            await userItemsApi.create({
                external_id: result.external_id,
                source: source,
                content_type: contentType,
                title: result.title,
                original_title: result.original_title,
                description: result.description,
                poster_url: result.poster_url,
                backdrop_url: result.backdrop_url,
                release_date: result.release_date,
                year: result.year,
                status: 'want_to_watch',
                rating: result.rating,
            });

            setAdded(true);
        } catch (error) {
            console.error('添加失败:', error);
        } finally {
            setLoading(false);
        }
    };

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
                    {result.poster_url ? (
                        <img
                            src={result.poster_url}
                            alt={result.title}
                            className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                        />
                    ) : (
                        <div className="flex items-center justify-center h-full text-gray-500 dark:text-gray-600">
                            <span className="text-5xl">{typeEmojis[contentType]}</span>
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
                </div>
            </Card>

            {/* 信息区域 - 独立容器，透明背景 */}
            <div className="mt-2 px-1">
                {/* 标题 */}
                <h3 className="font-semibold text-gray-900 dark:text-white line-clamp-2 mb-1 text-sm leading-tight">
                    {result.title}
                </h3>

                {/* 元数据行 */}
                <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400">
                    <span>{result.year || '未知'}</span>
                    {result.rating ? (
                        <span className="text-yellow-500 font-medium">
                            ⭐ {result.rating.toFixed(1)}
                        </span>
                    ) : (
                        <span>未评分</span>
                    )}
                </div>
            </div>
        </div>
    );
}
