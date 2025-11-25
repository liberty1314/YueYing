'use client';

import { Box, Typography, Stack, Grid } from '@mui/material';
import { AppleCard } from '@/components/ui';
import MovieIcon from '@mui/icons-material/Movie';
import TvIcon from '@mui/icons-material/Tv';

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
  onTvShowClick
}: CategoryRecommendationsProps) {
  const renderMediaGrid = (
    items: MediaItem[],
    title: string,
    icon: React.ReactNode,
    onItemClick?: (item: MediaItem) => void
  ) => {
    if (!items || items.length === 0) {
      return null;
    }

    return (
      <Box sx={{ mb: 8 }}>
        {/* 标题 */}
        <Stack direction="row" alignItems="center" spacing={1.5} sx={{ mb: 3 }}>
          {icon}
          <Typography variant="h4" sx={{ fontWeight: 700 }}>
            {title}
          </Typography>
        </Stack>

        {/* 内容网格 */}
        <Grid container spacing={2}>
          {items.slice(0, 12).map((item) => {
            const itemTitle = item.title || item.name || '未知标题';
            const imageUrl = item.poster_path
              ? `https://image.tmdb.org/t/p/w500${item.poster_path}`
              : '/placeholder.svg';
            const releaseDate = item.release_date || item.first_air_date;
            const year = releaseDate ? new Date(releaseDate).getFullYear() : '';

            return (
              <Grid key={item.id} size={{ xs: 6, sm: 4, md: 3, lg: 2 }}>
                {/* 分离式布局：图片卡片和信息区域 */}
                <Box
                  onClick={() => onItemClick?.(item)}
                  sx={{
                    cursor: 'pointer',
                    '&:hover .image-card': {
                      boxShadow: 6,
                      transform: 'translateY(-4px)',
                    },
                    '&:hover img': {
                      transform: 'scale(1.05)',
                    },
                  }}
                >
                  {/* 图片卡片 - 独立容器 */}
                  <AppleCard
                    variant="elevated"
                    className="image-card"
                    sx={{
                      overflow: 'hidden',
                      transition: 'all 0.3s ease',
                    }}
                  >
                    <Box
                      sx={{
                        position: 'relative',
                        paddingTop: '150%',
                        overflow: 'hidden',
                      }}
                    >
                      <Box
                        component="img"
                        src={imageUrl}
                        alt={itemTitle}
                        sx={{
                          position: 'absolute',
                          top: 0,
                          left: 0,
                          width: '100%',
                          height: '100%',
                          objectFit: 'cover',
                          transition: 'transform 0.3s ease',
                        }}
                        onError={(e) => {
                          e.currentTarget.src = '/placeholder.svg';
                        }}
                      />
                    </Box>
                  </AppleCard>

                  {/* 信息区域 - 独立容器，透明背景 */}
                  <Box sx={{ mt: 1, px: 0.5 }}>
                    <Typography
                      variant="body2"
                      sx={{
                        fontWeight: 600,
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        display: '-webkit-box',
                        WebkitLineClamp: 2,
                        WebkitBoxOrient: 'vertical',
                        minHeight: '2.4em',
                        lineHeight: 1.2,
                        mb: 0.25,
                      }}
                    >
                      {itemTitle}
                    </Typography>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <Typography variant="caption" color="text.secondary">
                        {year || '未知'}
                      </Typography>
                      {item.vote_average && (
                        <Typography variant="caption" sx={{ color: '#facc15', fontWeight: 600 }}>
                          ⭐ {item.vote_average.toFixed(1)}
                        </Typography>
                      )}
                    </Box>
                  </Box>
                </Box>
              </Grid>
            );
          })}
        </Grid>
      </Box>
    );
  };

  return (
    <>
      {/* 热门电影推荐 */}
      {renderMediaGrid(
        movies,
        '热门电影推荐',
        <MovieIcon sx={{ fontSize: 32, color: 'primary.main' }} />,
        onMovieClick
      )}

      {/* 热门剧集推荐 */}
      {renderMediaGrid(
        tvShows,
        '热门剧集推荐',
        <TvIcon sx={{ fontSize: 32, color: 'primary.main' }} />,
        onTvShowClick
      )}
    </>
  );
}
