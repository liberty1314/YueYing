/**
 * ResourceDetailModal - 现代沉浸式资源详情弹窗
 * 
 * 设计理念：
 * 1. 深色模式 + 高斯模糊（Glassmorphism）风格
 * 2. 背景图与内容自然融合，避免生硬的黑白切割
 * 3. 海报悬浮立体效果，重叠背景图与内容区交界线
 * 4. 主次分明的按钮设计，不使用全宽大按钮
 * 5. 使用 framer-motion 实现平滑动画
 */

'use client';

import { useState, useMemo, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    X,
    Plus,
    Check,
    Star,
    Calendar,
    Clock,
    Tv,
    Play,
    MoreHorizontal,
} from 'lucide-react';
import Image from 'next/image';

// Shadcn UI 组件
import {
    Dialog,
    DialogContent,
    DialogPortal,
    DialogOverlay,
    DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';

import { checkInLibrary } from '@/utils/library';

interface ExternalContent {
    id: number | string;
    title?: string;
    name?: string;
    name_cn?: string;
    original_title?: string;
    original_name?: string;
    poster_path?: string;
    poster_url?: string;
    backdrop_path?: string;
    images?: {
        large?: string;
        common?: string;
        medium?: string;
    };
    overview?: string;
    summary?: string;
    vote_average?: number;
    rating?: {
        score?: number;
    };
    release_date?: string;
    first_air_date?: string;
    air_date?: string;
    media_type?: string;
    content_type?: string;
    genres?: Array<{ id: number; name: string }>;
    eps?: number;
    eps_count?: number;
    runtime?: number;
    source?: string;
    external_id?: number | string;
}

interface ResourceDetailModalProps {
    open: boolean;
    content: ExternalContent | null;
    onClose: () => void;
    onAddToLibrary?: (content: ExternalContent) => void;
    refreshTrigger?: number;
    forceAdded?: boolean;
}

export default function ResourceDetailModal({
    open,
    content,
    onClose,
    onAddToLibrary,
    refreshTrigger = 0,
    forceAdded = false,
}: ResourceDetailModalProps) {
    const [isAdding, setIsAdding] = useState(false);
    const [isAdded, setIsAdded] = useState(false);
    const [imageLoaded, setImageLoaded] = useState(false);
    const isClosingRef = useRef(false);

    // 重置状态
    useEffect(() => {
        if (!open) {
            setIsAdding(false);
            setIsAdded(false);
            setImageLoaded(false);
            isClosingRef.current = false;
        }
    }, [open]);

    // 强制设置已添加状态
    useEffect(() => {
        if (forceAdded) {
            setIsAdded(true);
        }
    }, [forceAdded]);

    // 检查是否已在收藏库中
    useEffect(() => {
        const checkStatus = async () => {
            if (forceAdded || !content || !open) return;

            try {
                const externalIdValue = (content as any).external_id || content.id;
                const externalId = Number(externalIdValue);
                if (isNaN(externalId)) return;

                const contentType = content.media_type || content.content_type || 'movie';
                const { inLibrary } = await checkInLibrary(externalId, contentType);
                setIsAdded(inLibrary);
            } catch (error) {
                console.error('检查收藏状态失败:', error);
            }
        };

        if (open) {
            checkStatus();
        }
    }, [content, open, refreshTrigger, forceAdded]);

    // 统一关闭处理
    const handleClose = useCallback(() => {
        if (isClosingRef.current) return;
        isClosingRef.current = true;
        onClose();
    }, [onClose]);

    // 提取和处理数据
    const contentData = useMemo(() => {
        if (!content) return null;

        const title = content.title || content.name || content.name_cn || '未知标题';
        const originalTitle = content.original_title || content.original_name;

        // 海报 URL
        let posterUrl = '';
        if (content.poster_path) {
            posterUrl = content.poster_path.startsWith('http')
                ? content.poster_path
                : `https://image.tmdb.org/t/p/w500${content.poster_path}`;
        } else if (content.poster_url) {
            posterUrl = content.poster_url;
        } else if (content.images?.large) {
            posterUrl = content.images.large;
        } else if (content.images?.common) {
            posterUrl = content.images.common;
        }

        // 背景图 URL
        let backdropUrl = '';
        if (content.backdrop_path) {
            backdropUrl = content.backdrop_path.startsWith('http')
                ? content.backdrop_path
                : `https://image.tmdb.org/t/p/original${content.backdrop_path}`;
        }

        const overview = content.overview || content.summary;
        const hasOverview = overview && overview.trim().length > 0;
        const rating = content.vote_average || content.rating?.score;
        const releaseDate = content.release_date || content.first_air_date || content.air_date;
        const year = releaseDate ? new Date(releaseDate).getFullYear() : null;
        const contentType = content.media_type || content.content_type;
        const episodeCount = content.eps || content.eps_count;

        return {
            title,
            originalTitle,
            posterUrl,
            backdropUrl,
            overview,
            hasOverview,
            rating,
            year,
            contentType,
            episodeCount,
            runtime: content.runtime,
            genres: content.genres,
        };
    }, [content]);

    // 添加到收藏库
    const handleAdd = async () => {
        if (!onAddToLibrary || isAdded || !content) return;
        setIsAdding(true);
        try {
            onAddToLibrary(content);
        } catch (error) {
            console.error('添加到收藏库失败:', error);
        } finally {
            setIsAdding(false);
        }
    };

    // 内容类型标签映射
    const getContentTypeLabel = (type?: string) => {
        const typeMap: Record<string, string> = {
            movie: '电影',
            tv: '剧集',
            anime: '动画',
            game: '游戏',
            book: '图书',
        };
        return type ? typeMap[type] || type : '';
    };

    if (!content || !contentData) return null;

    const {
        title,
        originalTitle,
        posterUrl,
        backdropUrl,
        overview,
        hasOverview,
        rating,
        year,
        contentType,
        episodeCount,
        runtime,
        genres,
    } = contentData;

    return (
        <Dialog open={open} onOpenChange={handleClose}>
            <AnimatePresence>
                {open && (
                    <DialogPortal forceMount>
                        {/* 自定义遮罩层 - 高斯模糊效果 */}
                        <DialogOverlay asChild>
                            <motion.div
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0 }}
                                transition={{ duration: 0.3 }}
                                className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md"
                            />
                        </DialogOverlay>

                        {/* 弹窗内容 */}
                        <DialogContent
                            className="fixed left-[50%] top-[50%] z-50 w-[95vw] max-w-5xl translate-x-[-50%] translate-y-[-50%] p-0 overflow-hidden border-0 shadow-2xl"
                            asChild
                        >
                            <motion.div
                                initial={{ opacity: 0, scale: 0.95, y: 20 }}
                                animate={{ opacity: 1, scale: 1, y: 0 }}
                                exit={{ opacity: 0, scale: 0.95, y: 20 }}
                                transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
                                className="rounded-2xl bg-gradient-to-b from-background to-card dark:from-gray-900 dark:to-black"
                            >
                                {/* 无障碍：视觉隐藏的标题 */}
                                <DialogTitle className="sr-only">{title}</DialogTitle>

                                {/* Hero Section - 背景图 + 海报 + 标题元数据 */}
                                <div className="relative h-[400px] overflow-hidden">
                                    {/* 背景图 */}
                                    {backdropUrl ? (
                                        <>
                                            <div className="absolute inset-0">
                                                <Image
                                                    src={backdropUrl}
                                                    alt={title}
                                                    fill
                                                    className="object-cover"
                                                    priority
                                                    unoptimized
                                                    onLoad={() => setImageLoaded(true)}
                                                    style={{
                                                        opacity: imageLoaded ? 1 : 0,
                                                        transition: 'opacity 0.6s ease-in-out',
                                                    }}
                                                />
                                            </div>
                                            {/* 渐变遮罩 - 主题自适应 */}
                                            <div className="absolute inset-0 bg-gradient-to-t from-background/95 via-background/70 to-transparent dark:from-black dark:via-black/60" />
                                        </>
                                    ) : (
                                        <div className="absolute inset-0 bg-gradient-to-br from-muted to-card dark:from-gray-800 dark:to-gray-900" />
                                    )}

                                    {/* 关闭按钮 - 半透明悬浮 */}
                                    <button
                                        onClick={handleClose}
                                        className="absolute right-4 top-4 z-10 rounded-full bg-background/60 p-2 backdrop-blur-xl transition-all hover:bg-background/80 hover:scale-105 dark:bg-black/40 dark:hover:bg-black/60"
                                    >
                                        <X className="h-5 w-5 text-foreground dark:text-white" />
                                    </button>

                                    {/* 内容区 - 海报 + 信息 */}
                                    <div className="absolute bottom-0 left-0 right-0 p-8">
                                        <div className="flex items-end gap-6">
                                            {/* 海报 - 悬浮立体效果，轻微上移 */}
                                            {posterUrl && (
                                                <motion.div
                                                    initial={{ opacity: 0, y: 20 }}
                                                    animate={{ opacity: 1, y: -20 }}
                                                    transition={{ delay: 0.2, duration: 0.5 }}
                                                    className="relative h-[280px] w-[190px] flex-shrink-0"
                                                >
                                                    <Image
                                                        src={posterUrl}
                                                        alt={title}
                                                        fill
                                                        className="rounded-xl object-cover shadow-2xl ring-2 ring-white/10"
                                                        priority
                                                        unoptimized
                                                    />
                                                </motion.div>
                                            )}

                                            {/* 标题和元数据 */}
                                            <div className="flex-1 space-y-3 pb-2">
                                                {/* 标题组 */}
                                                <div>
                                                    <h2 className="text-4xl font-bold text-foreground drop-shadow-lg dark:text-white">
                                                        {title}
                                                    </h2>
                                                    {originalTitle && originalTitle !== title && (
                                                        <p className="mt-1 text-lg text-muted-foreground drop-shadow dark:text-gray-200/80">
                                                            {originalTitle}
                                                        </p>
                                                    )}
                                                </div>

                                                {/* 元数据 Badges */}
                                                <div className="flex flex-wrap items-center gap-2">
                                                    {year && (
                                                        <Badge
                                                            variant="default"
                                                            className="bg-muted/80 text-foreground backdrop-blur-xl border border-border hover:bg-muted dark:bg-white/15 dark:text-white dark:border-white/20 dark:hover:bg-white/20"
                                                        >
                                                            <Calendar className="mr-1 h-3 w-3" />
                                                            {year}
                                                        </Badge>
                                                    )}
                                                    {rating && (
                                                        <Badge
                                                            variant="default"
                                                            className="bg-yellow-500/20 text-yellow-700 backdrop-blur-xl border border-yellow-500/30 hover:bg-yellow-500/30 dark:text-yellow-200"
                                                        >
                                                            <Star className="mr-1 h-3 w-3 fill-yellow-400 text-yellow-400" />
                                                            {rating.toFixed(1)}
                                                        </Badge>
                                                    )}
                                                    {contentType && (
                                                        <Badge
                                                            variant="default"
                                                            className="bg-muted/80 text-foreground backdrop-blur-xl border border-border hover:bg-muted dark:bg-white/15 dark:text-white dark:border-white/20 dark:hover:bg-white/20"
                                                        >
                                                            <Tv className="mr-1 h-3 w-3" />
                                                            {getContentTypeLabel(contentType)}
                                                        </Badge>
                                                    )}
                                                    {runtime && (
                                                        <Badge
                                                            variant="default"
                                                            className="bg-muted/80 text-foreground backdrop-blur-xl border border-border hover:bg-muted dark:bg-white/15 dark:text-white dark:border-white/20 dark:hover:bg-white/20"
                                                        >
                                                            <Clock className="mr-1 h-3 w-3" />
                                                            {runtime} 分钟
                                                        </Badge>
                                                    )}
                                                    {episodeCount && (
                                                        <Badge
                                                            variant="default"
                                                            className="bg-muted/80 text-foreground backdrop-blur-xl border border-border hover:bg-muted dark:bg-white/15 dark:text-white dark:border-white/20 dark:hover:bg-white/20"
                                                        >
                                                            共 {episodeCount} 话
                                                        </Badge>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Content Section - 操作按钮 + 简介 + 标签 */}
                                <ScrollArea className="max-h-[400px] bg-background">
                                    <div className="space-y-6 p-8">
                                        {/* Action Bar - 主次分明的按钮组 */}
                                        {onAddToLibrary && (
                                            <div className="flex items-center gap-3">
                                                <Button
                                                    size="lg"
                                                    onClick={handleAdd}
                                                    disabled={isAdding || isAdded}
                                                    className={`flex-1 max-w-xs font-semibold transition-all duration-200 ease-in-out active:scale-95 ${isAdded
                                                        ? 'bg-orange-600 hover:bg-orange-700 text-white dark:bg-orange-600 dark:hover:bg-orange-700 shadow-lg shadow-orange-500/30'
                                                        : 'bg-blue-600 hover:bg-blue-700 text-white dark:bg-blue-500 dark:hover:bg-blue-600 shadow-lg shadow-blue-500/30 hover:shadow-blue-500/40'
                                                        }`}
                                                >
                                                    {isAdded ? (
                                                        <>
                                                            <Check className="mr-2 h-5 w-5" />
                                                            已添加到收藏库
                                                        </>
                                                    ) : (
                                                        <>
                                                            <Plus className="mr-2 h-5 w-5" />
                                                            添加到收藏库
                                                        </>
                                                    )}
                                                </Button>
                                                <Button
                                                    size="lg"
                                                    variant="outline"
                                                    className="border-gray-300 bg-white hover:bg-gray-50 text-gray-900 dark:border-gray-600 dark:bg-gray-800 dark:hover:bg-gray-700 dark:text-white transition-all duration-200 ease-in-out active:scale-95"
                                                >
                                                    <Play className="mr-2 h-4 w-4" />
                                                    预告片
                                                </Button>
                                                <Button
                                                    size="lg"
                                                    variant="ghost"
                                                    className="hover:bg-gray-100 text-gray-700 dark:hover:bg-gray-800 dark:text-gray-300 transition-all duration-200 ease-in-out active:scale-95"
                                                >
                                                    <MoreHorizontal className="h-5 w-5" />
                                                </Button>
                                            </div>
                                        )}

                                        {/* 类型标签 */}
                                        {genres && genres.length > 0 && (
                                            <div>
                                                <h3 className="mb-3 text-sm font-semibold uppercase tracking-wider text-muted-foreground">
                                                    类型
                                                </h3>
                                                <div className="flex flex-wrap gap-2">
                                                    {genres.map((genre) => (
                                                        <Badge
                                                            key={genre.id}
                                                            variant="outline"
                                                            className="border-border bg-muted/50 hover:bg-muted dark:border-gray-700 dark:bg-gray-800/50 dark:text-gray-300 dark:hover:bg-gray-800"
                                                        >
                                                            {genre.name}
                                                        </Badge>
                                                    ))}
                                                </div>
                                            </div>
                                        )}

                                        {/* 分隔线 */}
                                        {hasOverview && genres && genres.length > 0 && (
                                            <Separator className="bg-border dark:bg-gray-800" />
                                        )}

                                        {/* 简介 */}
                                        {hasOverview && (
                                            <div>
                                                <h3 className="mb-3 text-sm font-semibold uppercase tracking-wider text-muted-foreground">
                                                    简介
                                                </h3>
                                                <p className="leading-relaxed text-foreground dark:text-gray-300">
                                                    {overview}
                                                </p>
                                            </div>
                                        )}

                                        {/* 演员表占位符（可扩展） */}
                                        <div>
                                            <h3 className="mb-3 text-sm font-semibold uppercase tracking-wider text-muted-foreground">
                                                演员表
                                            </h3>
                                            <p className="text-sm text-muted-foreground dark:text-gray-500">暂无演员信息</p>
                                        </div>
                                    </div>
                                </ScrollArea>
                            </motion.div>
                        </DialogContent>
                    </DialogPortal>
                )}
            </AnimatePresence>
        </Dialog>
    );
}
