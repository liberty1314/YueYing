'use client';

import { motion } from 'framer-motion';
import { Sparkles } from 'lucide-react';
import MediaCard from '@/components/shared/MediaCard';
import { normalizeMediaData } from '@/utils/mediaDataMapper';

interface RecommendationItem {
  id: number;
  title?: string;
  name?: string;
  poster_path?: string;
  vote_average?: number;
  release_date?: string;
  first_air_date?: string;
  media_type?: string;
}

interface AIRecommendationsProps {
  items: RecommendationItem[];
  onItemClick?: (item: RecommendationItem) => void;
}

export default function AIRecommendations({ items, onItemClick }: AIRecommendationsProps) {
  if (!items || items.length === 0) {
    return null;
  }

  return (
    <section className="mb-16 md:mb-20 px-4 md:px-6">
      {/* 标题 - 带渐变和动画 */}
      <div className="flex items-center gap-3 mb-6">
        <div className="w-1 h-8 bg-gradient-to-b from-violet-500 to-purple-500 rounded-full" />
        <motion.div
          animate={{
            rotate: [0, 10, -10, 10, 0],
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
            repeatDelay: 3,
          }}
        >
          <Sparkles className="w-7 h-7 md:w-8 md:h-8 text-violet-500" />
        </motion.div>
        <h2 className="text-3xl md:text-4xl font-bold tracking-tight">
          <span className="bg-gradient-to-r from-violet-500 to-purple-500 bg-clip-text text-transparent">
            AI
          </span>
          {' '}为你推荐
        </h2>
      </div>

      {/* 推荐网格 */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4 md:gap-6">
        {items.slice(0, 12).map((item, index) => {
          const normalized = normalizeMediaData(item);
          return (
            <motion.div
              key={item.id}
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true, margin: '-50px' }}
              transition={{ duration: 0.4, delay: index * 0.05 }}
            >
              <MediaCard
                id={normalized.id}
                title={normalized.title}
                posterUrl={normalized.poster_url}
                year={normalized.year}
                rating={normalized.rating}
                onClick={() => onItemClick?.(item)}
              />
            </motion.div>
          );
        })}
      </div>
    </section>
  );
}
