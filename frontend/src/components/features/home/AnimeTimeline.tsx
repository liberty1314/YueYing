'use client';

import { useState, useEffect, useMemo, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Calendar, ChevronLeft, ChevronRight } from 'lucide-react';
import MediaCard from '@/components/shared/MediaCard';
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  type CarouselApi,
} from '@/components/ui/carousel';

interface AnimeItem {
  id: number;
  name?: string;
  name_cn?: string;
  images?: {
    large?: string;
    medium?: string;
  };
  rating?: {
    score?: number;
  };
  air_date?: string;
}

interface CalendarDay {
  weekday: {
    cn: string;
    en: string;
    id: number;
  };
  items: AnimeItem[];
}

interface AnimeTimelineProps {
  calendarData: CalendarDay[];
  onAnimeClick?: (anime: AnimeItem) => void;
}

export default function AnimeTimeline({ calendarData, onAnimeClick }: AnimeTimelineProps) {
  // Carousel API 状态
  const [carouselApi, setCarouselApi] = useState<CarouselApi>();
  const [canScrollPrev, setCanScrollPrev] = useState(false);
  const [canScrollNext, setCanScrollNext] = useState(false);

  // 获取今天是星期几（0=周日, 1=周一, ..., 6=周六）
  const getTodayIndex = () => {
    const today = new Date().getDay();
    // 将 JS 的 getDay() (0-6, 0是周日) 映射到 calendarData 的索引
    // 假设 calendarData 的顺序是 [周一, 周二, ..., 周日]
    // 需要将周日(0)映射到索引6，周一(1)映射到索引0
    return today === 0 ? 6 : today - 1;
  };

  // 默认选中今天，如果数据不存在则回退到第一天
  const [activeDay, setActiveDay] = useState(() => {
    const todayIndex = getTodayIndex();
    return calendarData && calendarData[todayIndex] ? todayIndex : 0;
  });

  // 当 calendarData 变化时，重新计算默认选中的日期
  useEffect(() => {
    const todayIndex = getTodayIndex();
    if (calendarData && calendarData[todayIndex]) {
      setActiveDay(todayIndex);
    }
  }, [calendarData]);

  // 监听 Carousel API 的滚动状态
  useEffect(() => {
    if (!carouselApi) return;

    const updateScrollState = () => {
      setCanScrollPrev(carouselApi.canScrollPrev());
      setCanScrollNext(carouselApi.canScrollNext());
    };

    updateScrollState();
    carouselApi.on('select', updateScrollState);
    carouselApi.on('reInit', updateScrollState);

    return () => {
      carouselApi.off('select', updateScrollState);
      carouselApi.off('reInit', updateScrollState);
    };
  }, [carouselApi]);

  // 手动控制翻页
  const scrollPrev = useCallback(() => {
    carouselApi?.scrollPrev();
  }, [carouselApi]);

  const scrollNext = useCallback(() => {
    carouselApi?.scrollNext();
  }, [carouselApi]);

  if (!calendarData || calendarData.length === 0) {
    return null;
  }

  const currentDayItems = calendarData[activeDay]?.items || [];

  // 判断是否需要显示翻页按钮（数据量超过 12 条时显示）
  const showCarouselControls = currentDayItems.length > 12;

  // 计算每页显示的卡片数量（响应式）
  // 移动端: 2列, 平板: 3-4列, 桌面: 6列
  // 每页显示 2 行，所以是列数 * 2
  const itemsPerPage = useMemo(() => {
    if (typeof window === 'undefined') return 12;
    const width = window.innerWidth;
    if (width < 640) return 4; // 移动端 2列 * 2行
    if (width < 768) return 6; // 小平板 3列 * 2行
    if (width < 1024) return 8; // 平板 4列 * 2行
    return 12; // 桌面 6列 * 2行
  }, []);

  // 将数据分组为多页
  const pages = useMemo(() => {
    const result = [];
    for (let i = 0; i < currentDayItems.length; i += itemsPerPage) {
      result.push(currentDayItems.slice(i, i + itemsPerPage));
    }
    return result;
  }, [currentDayItems, itemsPerPage]);

  return (
    <section className="mb-16 md:mb-20 px-4 md:px-6">
      {/* 标题 */}
      <div className="flex items-center gap-3 mb-6">
        <div className="w-1 h-8 bg-gradient-to-b from-pink-500 to-rose-500 rounded-full" />
        <Calendar className="w-7 h-7 md:w-8 md:h-8 text-pink-500" />
        <h2 className="text-3xl md:text-4xl font-bold tracking-tight">
          热门番剧
        </h2>
      </div>

      {/* 周期表筛选器 + 轮播控制按钮 */}
      <div className="mb-6 flex items-center gap-4">
        {/* 星期筛选器 */}
        <div className="flex-1 overflow-x-auto pb-2 scrollbar-hide">
          <div className="flex gap-2 min-w-max">
            {calendarData.map((day, index) => (
              <button
                key={day.weekday.id}
                onClick={() => setActiveDay(index)}
                className={`relative px-5 py-2.5 rounded-xl text-sm font-semibold transition-all duration-200 whitespace-nowrap ${activeDay === index
                  ? 'text-white shadow-lg scale-105'
                  : 'text-slate-600 dark:text-slate-400 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700'
                  }`}
              >
                {day.weekday.cn}
                {activeDay === index && (
                  <motion.div
                    layoutId="activeDayBg"
                    className="absolute inset-0 bg-gradient-to-r from-pink-500 to-rose-500 rounded-xl -z-10"
                    transition={{ type: 'spring', bounce: 0.2, duration: 0.6 }}
                  />
                )}
              </button>
            ))}
          </div>
        </div>

        {/* 轮播控制按钮 - 只在数据量大于 12 条且有多页时显示 */}
        {showCarouselControls && pages.length > 1 && (
          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={scrollPrev}
              disabled={!canScrollPrev}
              className="h-10 w-10 rounded-full bg-white/90 dark:bg-slate-800/90 backdrop-blur-sm shadow-lg flex items-center justify-center transition-all duration-200 hover:bg-white dark:hover:bg-slate-700 hover:scale-110 disabled:opacity-30 disabled:cursor-not-allowed disabled:hover:scale-100"
              aria-label="上一页"
            >
              <ChevronLeft className="h-5 w-5 text-slate-700 dark:text-slate-200" />
            </button>
            <button
              onClick={scrollNext}
              disabled={!canScrollNext}
              className="h-10 w-10 rounded-full bg-white/90 dark:bg-slate-800/90 backdrop-blur-sm shadow-lg flex items-center justify-center transition-all duration-200 hover:bg-white dark:hover:bg-slate-700 hover:scale-110 disabled:opacity-30 disabled:cursor-not-allowed disabled:hover:scale-100"
              aria-label="下一页"
            >
              <ChevronRight className="h-5 w-5 text-slate-700 dark:text-slate-200" />
            </button>
          </div>
        )}
      </div>

      {/* 番剧轮播/网格 */}
      <AnimatePresence mode="wait">
        <motion.div
          key={activeDay}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          transition={{ duration: 0.3 }}
        >
          {showCarouselControls ? (
            // 数据量大于 12 条时，使用轮播模式
            <Carousel
              setApi={setCarouselApi}
              opts={{
                align: 'start',
                loop: false,
              }}
              className="w-full"
            >
              <CarouselContent>
                {pages.map((pageItems, pageIndex) => (
                  <CarouselItem key={pageIndex}>
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4 md:gap-6">
                      {pageItems.map((anime, index) => {
                        const title = anime.name_cn || anime.name || '未知';
                        const posterUrl = anime.images?.large || anime.images?.medium;
                        const rating = anime.rating?.score;
                        const year = anime.air_date ? new Date(anime.air_date).getFullYear() : undefined;

                        return (
                          <motion.div
                            key={anime.id}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.4, delay: index * 0.05 }}
                          >
                            <MediaCard
                              id={anime.id}
                              title={title}
                              posterUrl={posterUrl}
                              year={year}
                              rating={rating}
                              onClick={() => onAnimeClick?.(anime)}
                            />
                          </motion.div>
                        );
                      })}
                    </div>
                  </CarouselItem>
                ))}
              </CarouselContent>
            </Carousel>
          ) : (
            // 数据量小于等于 12 条时，使用普通网格布局
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4 md:gap-6">
              {currentDayItems.map((anime, index) => {
                const title = anime.name_cn || anime.name || '未知';
                const posterUrl = anime.images?.large || anime.images?.medium;
                const rating = anime.rating?.score;
                const year = anime.air_date ? new Date(anime.air_date).getFullYear() : undefined;

                return (
                  <motion.div
                    key={anime.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.4, delay: index * 0.05 }}
                  >
                    <MediaCard
                      id={anime.id}
                      title={title}
                      posterUrl={posterUrl}
                      year={year}
                      rating={rating}
                      onClick={() => onAnimeClick?.(anime)}
                    />
                  </motion.div>
                );
              })}
            </div>
          )}
        </motion.div>
      </AnimatePresence>

      {/* 空状态 */}
      {currentDayItems.length === 0 && (
        <div className="text-center py-12 text-slate-500 dark:text-slate-400">
          该日暂无番剧更新
        </div>
      )}
    </section>
  );
}
