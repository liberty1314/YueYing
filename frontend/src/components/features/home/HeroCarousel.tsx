'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Star } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

interface CarouselItem {
  id: number;
  title?: string;
  name?: string;
  overview: string;
  backdrop_path?: string;
  poster_path?: string;
  vote_average?: number;
  genres?: string[];
  media_type?: string;
  genre_ids?: number[];
}

interface HeroCarouselProps {
  items: CarouselItem[];
  onAddToLibrary?: (item: CarouselItem) => void;
  onViewDetail?: (item: CarouselItem) => void;
}

export default function HeroCarousel({ items, onAddToLibrary, onViewDetail }: HeroCarouselProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isAutoPlaying, setIsAutoPlaying] = useState(true);

  useEffect(() => {
    if (!isAutoPlaying || items.length <= 1) return;

    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % items.length);
    }, 5000);

    return () => clearInterval(interval);
  }, [isAutoPlaying, items.length]);



  if (!items || items.length === 0) {
    return null;
  }

  const currentItem = items[currentIndex];
  const title = currentItem.title || currentItem.name || '未知标题';
  const imageUrl = currentItem.backdrop_path
    ? `https://image.tmdb.org/t/p/original${currentItem.backdrop_path}`
    : currentItem.poster_path
      ? `https://image.tmdb.org/t/p/original${currentItem.poster_path}`
      : '/placeholder.svg';

  return (
    <div
      onClick={() => onViewDetail?.(currentItem)}
      className="relative w-full h-[75vh] md:h-[85vh] overflow-hidden mb-12 md:mb-16 rounded-2xl md:rounded-3xl bg-black cursor-pointer group"
    >
      {/* 背景图片层 - 带动画切换 */}
      <AnimatePresence>
        <motion.div
          key={currentIndex}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.6, ease: [0.4, 0, 0.2, 1] }}
          className="absolute inset-0"
        >
          <div
            className="absolute inset-0 bg-cover bg-center rounded-2xl md:rounded-3xl"
            style={{ backgroundImage: `url(${imageUrl})` }}
          />
          {/* 渐变遮罩 - 从透明到深色 */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/95 via-black/50 to-black/20 rounded-2xl md:rounded-3xl" />
        </motion.div>
      </AnimatePresence>

      {/* 内容区域 */}
      <div className="relative z-10 h-full flex flex-col justify-end p-6 md:p-12 max-w-7xl mx-auto">
        <motion.div
          key={`content-${currentIndex}`}
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2, ease: [0.4, 0, 0.2, 1] }}
          className="max-w-2xl space-y-4 md:space-y-6"
        >
          {/* 类型标签 */}
          {currentItem.media_type && (
            <Badge className="w-fit bg-white/15 text-white border-white/20 backdrop-blur-md font-medium text-xs tracking-wide">
              {currentItem.media_type === 'movie' ? '电影' : '剧集'}
            </Badge>
          )}

          {/* 标题 */}
          <h1 className="text-white font-bold text-4xl md:text-6xl lg:text-7xl leading-tight tracking-tight drop-shadow-2xl">
            {title}
          </h1>

          {/* 评分和类型 */}
          <div className="flex items-center gap-4 flex-wrap">
            {currentItem.vote_average && (
              <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/15 backdrop-blur-md border border-white/20">
                <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
                <span className="text-white font-semibold text-sm">
                  {currentItem.vote_average.toFixed(1)}
                </span>
              </div>
            )}
            {currentItem.genres && currentItem.genres.length > 0 && (
              <span className="text-white/85 text-sm md:text-base">
                {currentItem.genres.slice(0, 3).join(' · ')}
              </span>
            )}
          </div>

          {/* 简介 */}
          <p className="text-white/85 text-sm md:text-base leading-relaxed line-clamp-3 max-w-xl">
            {currentItem.overview}
          </p>
        </motion.div>
      </div>

      {/* 指示器 */}
      {items.length > 1 && (
        <div className="absolute bottom-6 md:bottom-8 left-1/2 -translate-x-1/2 z-20 flex gap-2">
          {items.map((_, index) => (
            <motion.button
              key={index}
              onClick={(e) => {
                e.stopPropagation();
                setCurrentIndex(index);
                setIsAutoPlaying(false);
              }}
              className="h-2 rounded-full bg-white/40 hover:bg-white/70 cursor-pointer transition-all duration-300"
              animate={{
                width: currentIndex === index ? 32 : 8,
                backgroundColor: currentIndex === index ? 'rgb(255 255 255)' : 'rgb(255 255 255 / 0.4)',
              }}
              transition={{ duration: 0.4, ease: [0.4, 0, 0.2, 1] }}
            />
          ))}
        </div>
      )}
    </div>
  );
}
