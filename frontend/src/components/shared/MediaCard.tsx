/**
 * MediaCard - 统一的媒体卡片组件
 * 
 * Netflix/Disney+ 级别的现代化卡片设计
 * 使用 Tailwind CSS + Framer Motion
 */

'use client';

import { motion } from 'framer-motion';
import { Star } from 'lucide-react';
import { cn } from '@/lib/utils';

interface MediaCardProps {
    id: number | string;
    title: string;
    posterUrl?: string;
    year?: number | string;
    rating?: number;
    onClick?: () => void;
    className?: string;
}

export default function MediaCard({
    title,
    posterUrl,
    year,
    rating,
    onClick,
    className,
}: MediaCardProps) {
    const imageUrl = posterUrl || '/placeholder.svg';

    return (
        <motion.div
            onClick={onClick}
            className={cn('group cursor-pointer', className)}
            whileHover={{ y: -8 }}
            transition={{ duration: 0.3, ease: [0.4, 0, 0.2, 1] }}
        >
            {/* 图片容器 */}
            <div className="relative overflow-hidden rounded-xl bg-slate-200 dark:bg-slate-800 shadow-lg group-hover:shadow-2xl transition-shadow duration-300">
                {/* 宽高比容器 */}
                <div className="relative aspect-[2/3] overflow-hidden">
                    <motion.img
                        src={imageUrl}
                        alt={title}
                        className="absolute inset-0 w-full h-full object-cover"
                        whileHover={{ scale: 1.08 }}
                        transition={{ duration: 0.6, ease: [0.4, 0, 0.2, 1] }}
                        onError={(e) => {
                            e.currentTarget.src = '/placeholder.svg';
                        }}
                    />

                    {/* 评分标签 - 绝对定位在右上角 */}
                    {rating && (
                        <div className="absolute top-2 right-2 flex items-center gap-1 px-2 py-1 rounded-lg bg-black/70 backdrop-blur-md border border-white/20">
                            <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
                            <span className="text-xs font-semibold text-white">
                                {typeof rating === 'number' ? rating.toFixed(1) : rating}
                            </span>
                        </div>
                    )}

                    {/* Hover 遮罩层 */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                </div>
            </div>

            {/* 信息区域 */}
            <div className="mt-3 px-1">
                <h3 className="font-semibold text-sm leading-tight line-clamp-2 min-h-[2.5rem] mb-1.5 text-slate-900 dark:text-slate-100">
                    {title}
                </h3>
                <div className="flex items-center justify-between text-xs">
                    <span className="text-slate-500 dark:text-slate-400">
                        {year || '未知'}
                    </span>
                </div>
            </div>
        </motion.div>
    );
}
