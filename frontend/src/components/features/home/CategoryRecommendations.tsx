'use client';

import { Box, Typography, Stack, Grid } from '@mui/material';
import MediaCard from '@/components/shared/MediaCard';
import MovieIcon from '@mui/icons-material/Movie';
import TvIcon from '@mui/icons-material/Tv';
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
    onItemClick?: (item: MediaItem) => void
  ) => {
    if (!items || items.length === 0) {
      return null;
    }

    return (
      <Box sx={{ mb: { xs: 10, md: 14 }, px: { xs: 2, md: 4 } }}>
        {/* 标题 */}
        <Stack direction="row" alignItems="center" spacing={1.5} sx={{ mb: 4 }}>
          {icon}
          <Typography
            variant="h3"
            sx={{
              fontWeight: 700,
              fontSize: { xs: '1.75rem', md: '2.25rem' },
              letterSpacing: '-0.02em',
            }}
          >
            {title}
          </Typography>
        </Stack>

        {/* 内容网格 */}
        <Grid container spacing={{ xs: 2, md: 3 }}>
          {items.slice(0, 12).map((item) => {
            const normalized = normalizeMediaData(item);
            return (
              <Grid key={item.id} size={{ xs: 6, sm: 4, md: 3, lg: 2 }}>
                <MediaCard
                  id={normalized.id}
                  title={normalized.title}
                  posterUrl={normalized.poster_url}
                  year={normalized.year}
                  rating={normalized.rating}
                  onClick={() => onItemClick?.(item)}
                />
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
        <MovieIcon sx={{ fontSize: { xs: 28, md: 32 }, color: 'primary.main' }} />,
        onMovieClick
      )}

      {/* 热门剧集推荐 */}
      {renderMediaGrid(
        tvShows,
        '热门剧集推荐',
        <TvIcon sx={{ fontSize: { xs: 28, md: 32 }, color: 'primary.main' }} />,
        onTvShowClick
      )}
    </>
  );
}
