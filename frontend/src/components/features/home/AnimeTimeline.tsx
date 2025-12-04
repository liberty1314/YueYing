'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Calendar } from 'lucide-react';
import MediaCard from '@/components/shared/MediaCard';

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
  const [activeDay, setActiveDay] = useState(0);

  if (!calendarData || calendarData.length === 0) {
    return null;
  }

  const currentDayItems = calendarData[activeDay]?.items || [];

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

      {/* 周期表筛选器 */}
      <div className="mb-6 overflow-x-auto pb-2 scrollbar-hide">
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

      {/* 番剧网格 */}
      <AnimatePresence mode="wait">
        <motion.div
          key={activeDay}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          transition={{ duration: 0.3 }}
          className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4 md:gap-6"
        >
          {currentDayItems.slice(0, 12).map((anime, index) => {
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
