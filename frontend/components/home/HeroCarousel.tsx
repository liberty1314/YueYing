"use client";

import { useState, useEffect } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Badge } from "@/components/ui/badge";

interface HeroItem {
  id: number | string;
  title: string;
  overview?: string;
  backdrop_path?: string;
  vote_average?: number;
  media_type?: string;
  release_date?: string;
  first_air_date?: string;
}

interface HeroCarouselProps {
  items: HeroItem[];
  onItemClick?: (item: HeroItem) => void;
}

export function HeroCarousel({ items, onItemClick }: HeroCarouselProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isAutoPlaying, setIsAutoPlaying] = useState(true);

  // 自动播放
  useEffect(() => {
    if (!isAutoPlaying || items.length === 0) return;

    const timer = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % items.length);
    }, 5000);

    return () => clearInterval(timer);
  }, [isAutoPlaying, items.length]);

  const goToPrevious = () => {
    setIsAutoPlaying(false);
    setCurrentIndex((prev) => (prev - 1 + items.length) % items.length);
  };

  const goToNext = () => {
    setIsAutoPlaying(false);
    setCurrentIndex((prev) => (prev + 1) % items.length);
  };

  const goToSlide = (index: number) => {
    setIsAutoPlaying(false);
    setCurrentIndex(index);
  };

  if (items.length === 0) {
    return (
      <div className="relative h-[500px] w-full bg-muted flex items-center justify-center">
        <p className="text-muted-foreground">暂无内容</p>
      </div>
    );
  }

  const currentItem = items[currentIndex];
  // 判断是否为完整URL（Bangumi）或相对路径（TMDB）
  const backdropUrl = currentItem.backdrop_path
    ? currentItem.backdrop_path.startsWith("http")
      ? currentItem.backdrop_path // Bangumi完整URL
      : `https://image.tmdb.org/t/p/original${currentItem.backdrop_path}` // TMDB相对路径
    : "/placeholder.jpg";

  const year = currentItem.release_date
    ? new Date(currentItem.release_date).getFullYear()
    : currentItem.first_air_date
    ? new Date(currentItem.first_air_date).getFullYear()
    : "";

  const rating = currentItem.vote_average
    ? currentItem.vote_average.toFixed(1)
    : "";

  return (
    <div 
      className="relative h-[650px] w-full overflow-hidden rounded-lg group cursor-pointer"
      onClick={() => onItemClick?.(currentItem)}
    >
      {/* 背景图片 */}
      <div className="absolute inset-0 transition-opacity duration-500">
        <img
          src={backdropUrl}
          alt={currentItem.title}
          className="h-full w-full object-cover object-center transition-transform duration-300 group-hover:scale-105"
        />
        {/* 渐变遮罩 */}
        <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/50 to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent" />
      </div>

      {/* 内容 */}
      <div className="relative h-full flex items-center">
        <div className="container px-8 max-w-7xl">
          <div className="max-w-2xl space-y-4">
            {/* 媒体类型和年份 */}
            <div className="flex items-center gap-3">
              {currentItem.media_type && (
                <Badge variant="secondary" className="uppercase">
                  {currentItem.media_type === "movie" ? "电影" : "剧集"}
                </Badge>
              )}
              {year && (
                <span className="text-sm text-gray-300">{year}</span>
              )}
              {rating && (
                <div className="flex items-center gap-1">
                  <span className="text-yellow-500">★</span>
                  <span className="text-sm text-gray-300">{rating}</span>
                </div>
              )}
            </div>

            {/* 标题 */}
            <h1 className="text-4xl md:text-5xl font-bold text-white line-clamp-2">
              {currentItem.title}
            </h1>

            {/* 简介 */}
            {currentItem.overview && (
              <p className="text-base text-gray-200 line-clamp-3 leading-relaxed">
                {currentItem.overview}
              </p>
            )}
          </div>
        </div>
      </div>

      {/* 导航按钮 */}
      <button
        onClick={(e) => {
          e.stopPropagation();
          goToPrevious();
        }}
        className="absolute left-4 top-1/2 -translate-y-1/2 p-2 rounded-full bg-black/50 text-white hover:bg-black/70 transition-all opacity-0 group-hover:opacity-100 z-10"
        aria-label="Previous slide"
      >
        <ChevronLeft className="h-6 w-6" />
      </button>

      <button
        onClick={(e) => {
          e.stopPropagation();
          goToNext();
        }}
        className="absolute right-4 top-1/2 -translate-y-1/2 p-2 rounded-full bg-black/50 text-white hover:bg-black/70 transition-all opacity-0 group-hover:opacity-100 z-10"
        aria-label="Next slide"
      >
        <ChevronRight className="h-6 w-6" />
      </button>

      {/* 指示器 */}
      <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex gap-2 z-10">
        {items.map((_, index) => (
          <button
            key={index}
            onClick={(e) => {
              e.stopPropagation();
              goToSlide(index);
            }}
            className={`h-1.5 rounded-full transition-all ${
              index === currentIndex
                ? "w-8 bg-white"
                : "w-1.5 bg-white/50 hover:bg-white/75"
            }`}
            aria-label={`Go to slide ${index + 1}`}
          />
        ))}
      </div>
    </div>
  );
}

