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
                <AppleCard
                  variant="elevated"
                  hover
                  onClick={() => onItemClick?.(item)}
                  sx={{
                    cursor: 'pointer',
                    height: '100%',
                    overflow: 'hidden',
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
                      }}
                      onError={(e) => {
                        e.currentTarget.src = '/placeholder.svg';
                      }}
                    />
                    {item.vote_average && (
                      <Box
                        sx={{
                          position: 'absolute',
                          top: 8,
                          right: 8,
                          bgcolor: 'rgba(0,0,0,0.8)',
                          color: 'white',
                          borderRadius: 1,
                          px: 1,
                          py: 0.5,
                          fontSize: '0.75rem',
                          fontWeight: 600,
                          backdropFilter: 'blur(10px)',
                        }}
                      >
                        ⭐ {item.vote_average.toFixed(1)}
                      </Box>
                    )}
                  </Box>
                  <Box sx={{ p: 1.5 }}>
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
                      }}
                    >
                      {itemTitle}
                    </Typography>
                    {year && (
                      <Typography variant="caption" color="text.secondary">
                        {year}
                      </Typography>
                    )}
                  </Box>
                </AppleCard>
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
