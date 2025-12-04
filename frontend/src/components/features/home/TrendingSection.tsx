'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { TrendingUp } from 'lucide-react';
import MediaCard from '@/components/shared/MediaCard';
import { normalizeMediaData } from '@/utils/mediaDataMapper';

interface TrendingItem {
  id: number;
  title?: string;
  name?: string;
  poster_path?: string;
  vote_average?: number;
  media_type?: string;
  release_date?: string;
  first_air_date?: string;
}

interface TrendingSectionProps {
  dailyItems: TrendingItem[];
  weeklyItems: TrendingItem[];
  onItemClick?: (item: TrendingItem) => void;
  onAddToLibrary?: (item: TrendingItem) => void;
}

export default function TrendingSection({ dailyItems, weeklyItems, onItemClick }: TrendingSectionProps) {
  const [activeTab, setActiveTab] = useState<'daily' | 'weekly'>('daily');

  const currentItems = activeTab === 'daily' ? dailyItems : weeklyItems;

  const handleItemClick = (item: TrendingItem) => {
    onItemClick?.(item);
  };

  if ((!dailyItems || dailyItems.length === 0) && (!weeklyItems || weeklyItems.length === 0)) {
    return null;
  }

  const tabs = [
    { id: 'daily', label: '今日热门' },
    { id: 'weekly', label: '本周热门' },
  ];

  return (
    <section className="mb-16 md:mb-20 px-4 md:px-6">
      {/* 标题和切换器 */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
        {/* 标题 */}
        <div className="flex items-center gap-3">
          <div className="w-1 h-8 bg-gradient-to-b from-purple-500 to-pink-500 rounded-full" />
          <TrendingUp className="w-7 h-7 md:w-8 md:h-8 text-purple-500" />
          <h2 className="text-3xl md:text-4xl font-bold tracking-tight">
            热门趋势
          </h2>
        </div>

        {/* Tab 切换器 - 胶囊样式 */}
        <div className="relative flex p-1 rounded-full bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as 'daily' | 'weekly')}
              className={`relative z-10 px-6 py-2 rounded-full text-sm font-semibold transition-colors duration-200 ${activeTab === tab.id
                  ? 'text-white'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
                }`}
            >
              {tab.label}
              {activeTab === tab.id && (
                <motion.div
                  layoutId="activeTab"
                  className="absolute inset-0 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full -z-10"
                  transition={{ type: 'spring', bounce: 0.2, duration: 0.6 }}
                />
              )}
            </button>
          ))}
        </div>
      </div>

      {/* 内容网格 - 带淡入动画 */}
      <AnimatePresence mode="wait">
        <motion.div
          key={activeTab}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          transition={{ duration: 0.3 }}
          className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4 md:gap-6"
        >
          {currentItems.slice(0, 12).map((item, index) => {
            const normalized = normalizeMediaData(item);
            return (
              <motion.div
                key={item.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: index * 0.05 }}
              >
                <MediaCard
                  id={normalized.id}
                  title={normalized.title}
                  posterUrl={normalized.poster_url}
                  year={normalized.year}
                  rating={normalized.rating}
                  onClick={() => handleItemClick(item)}
                />
              </motion.div>
            );
          })}
        </motion.div>
      </AnimatePresence>
    </section>
  );
}
