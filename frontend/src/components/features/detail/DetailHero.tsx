/**
 * DetailHero - 详情页头部组件
 * 
 * 展示内容的背景图、海报和基本信息
 */

'use client';

import { Badge } from '@/components/ui';
import { CalendarIcon, StarIcon, ClockIcon } from 'lucide-react';
import Image from 'next/image';

interface DetailHeroProps {
  title: string;
  originalTitle?: string;
  posterUrl?: string;
  backdropUrl?: string;
  year?: number;
  rating?: number;
  contentType: 'movie' | 'tv' | 'anime' | 'book' | 'game';
  genres?: string[];
  runtime?: number;
}

const typeLabels = {
  movie: '电影',
  tv: '剧集',
  anime: '动画',
  book: '书籍',
  game: '游戏',
};

export function DetailHero({
  title,
  originalTitle,
  posterUrl,
  backdropUrl,
  year,
  rating,
  contentType,
  genres = [],
  runtime,
}: DetailHeroProps) {
  return (
    <div className="relative -mt-8 -mx-4 sm:-mx-6 lg:-mx-8">
      {/* Backdrop Image */}
      <div className="relative h-[500px] bg-gray-900">
        {backdropUrl ? (
          <>
            <Image
              src={backdropUrl}
              alt={title}
              fill
              className="object-cover opacity-40"
              priority
              sizes="100vw"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black via-black/50 to-transparent" />
          </>
        ) : (
          <div className="absolute inset-0 bg-gradient-to-br from-gray-800 to-gray-900" />
        )}

        {/* Content */}
        <div className="relative h-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-end h-full pb-12 gap-8">
            {/* Poster */}
            <div className="flex-shrink-0 w-64 h-96 relative bg-gray-800 rounded-xl overflow-hidden shadow-2xl">
              {posterUrl ? (
                <Image
                  src={posterUrl}
                  alt={title}
                  fill
                  className="object-cover"
                  priority
                  sizes="256px"
                />
              ) : (
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="text-gray-500 text-sm">暂无海报</span>
                </div>
              )}
            </div>

            {/* Info */}
            <div className="flex-1 text-white space-y-4 pb-4">
              {/* Title */}
              <div>
                <h1 className="text-4xl font-bold mb-2">{title}</h1>
                {originalTitle && originalTitle !== title && (
                  <p className="text-xl text-gray-200 dark:text-gray-300">{originalTitle}</p>
                )}
              </div>

              {/* Meta */}
              <div className="flex items-center gap-4 flex-wrap">
                <Badge variant="primary" size="lg">
                  {typeLabels[contentType]}
                </Badge>
                {year && (
                  <div className="flex items-center gap-1.5 text-gray-200 dark:text-gray-300">
                    <CalendarIcon className="w-4 h-4" />
                    <span>{year}</span>
                  </div>
                )}
                {rating && (
                  <div className="flex items-center gap-1.5">
                    <StarIcon className="w-5 h-5 fill-yellow-400 text-yellow-400" />
                    <span className="text-lg font-semibold">{rating.toFixed(1)}</span>
                  </div>
                )}
                {runtime && (
                  <div className="flex items-center gap-1.5 text-gray-200 dark:text-gray-300">
                    <ClockIcon className="w-4 h-4" />
                    <span>{runtime} 分钟</span>
                  </div>
                )}
              </div>

              {/* Genres */}
              {genres.length > 0 && (
                <div className="flex gap-2 flex-wrap">
                  {genres.map((genre) => (
                    <Badge key={genre} variant="outline" size="sm" className="text-white border-white/30">
                      {genre}
                    </Badge>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
