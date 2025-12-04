'use client';

import { motion } from 'framer-motion';
import { Film, Tv } from 'lucide-react';
import MediaCard from '@/components/shared/MediaCard';
import { normalizeMediaData } from '@/utils/mediaDataMapper';

interface MediaItem {
  id: number;
  title?: string;
  name?: string;
  poster_path?: string;
  vote_average?: number;
  release_date?: string;
  first_air_date?: string;
}

interface CategoryRecommendationsProps {
  movies: MediaItem[];
  tvShows: MediaItem[];
  onMovieClick?: (movie: MediaItem) => void;
  onTvShowClick?: (tvShow: MediaItem) => void;
}

export default function CategoryRecommendations({
  movies,
  tvShows,
  onMovieClick,
  onTvShowClick,
}: CategoryRecommendationsProps) {
  const renderMediaGrid = (
    items: MediaItem[],
    title: string,
    icon: React.ReactNode,
    iconColor: string,
    onItemClick?: (item: MediaItem) => void
  ) => {
    if (!items || items.length === 0) {
      return null;
    }

    return (
      <section className="mb-16 md:mb-20 px-4 md:px-6">
        {/* 标题 */}
        <div className="flex items-center gap-3 mb-6">
          <div className={`w-1 h-8 bg-gradient-to-b ${iconColor} rounded-full`} />
          {icon}
          <h2 className="text-3xl md:text-4xl font-bold tracking-tight">
            {title}
          </h2>
        </div>

        {/* 内容网格 */}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4 md:gap-6">
          {items.slice(0, 12).map((item, index) => {
            const normalized = normalizeMediaData(item);
            return (
              <motion.div
                key={item.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
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
  };

  return (
    <>
      {/* 热门电影推荐 */}
      {renderMediaGrid(
        movies,
        '热门电影推荐',
        <Film className="w-7 h-7 md:w-8 md:h-8 text-blue-500" />,
        'from-blue-500 to-cyan-500',
        onMovieClick
      )}

      {/* 热门剧集推荐 */}
      {renderMediaGrid(
        tvShows,
        '热门剧集推荐',
        <Tv className="w-7 h-7 md:w-8 md:h-8 text-emerald-500" />,
        'from-emerald-500 to-teal-500',
        onTvShowClick
      )}
    </>
  );
}
