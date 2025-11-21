'use client';

import { Box, Typography, Stack, Grid, IconButton } from '@mui/material';
import { AppleCard } from '@/components/ui';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';

interface MediaItem {
  id: number;
  title?: string;
  name?: string;
  poster_path?: string;
  vote_average?: number;
  release_date?: string;
  first_air_date?: string;
  overview?: string;
}

interface MediaSectionProps {
  title: string;
  icon: React.ReactNode;
  items: MediaItem[];
  onViewAll?: () => void;
}

export default function MediaSection({ title, icon, items, onViewAll }: MediaSectionProps) {
  return (
    <Box sx={{ mb: 8 }}>
      {/* 标题和查看更多 */}
      <Stack
        direction="row"
        alignItems="center"
        justifyContent="space-between"
        sx={{ mb: 3 }}
      >
        <Stack direction="row" alignItems="center" spacing={1.5}>
          {icon}
          <Typography variant="h4" sx={{ fontWeight: 700 }}>
            {title}
          </Typography>
        </Stack>

        {onViewAll && (
          <IconButton
            onClick={onViewAll}
            sx={{
              color: 'primary.main',
              '&:hover': {
                bgcolor: 'action.hover',
              },
            }}
          >
            <ChevronRightIcon />
          </IconButton>
        )}
      </Stack>

      {/* 内容网格 */}
      <Grid container spacing={2}>
        {items.slice(0, 12).map((item) => {
          const itemTitle = item.title || item.name || '未知标题';
          const imageUrl = item.poster_path
            ? `https://image.tmdb.org/t/p/w500${item.poster_path}`
            : '/placeholder.jpg';
          const releaseDate = item.release_date || item.first_air_date;
          const year = releaseDate ? new Date(releaseDate).getFullYear() : '';

          return (
            <Grid key={item.id} size={{ xs: 6, sm: 4, md: 3, lg: 2 }}>
              <AppleCard
                variant="elevated"
                hover
                sx={{
                  cursor: 'pointer',
                  height: '100%',
                  overflow: 'hidden',
                  transition: 'all 0.3s ease',
                  '&:hover': {
                    transform: 'translateY(-4px)',
                  },
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
                      e.currentTarget.src = '/placeholder.jpg';
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

      {items.length === 0 && (
        <Box
          sx={{
            py: 8,
            textAlign: 'center',
            color: 'text.secondary',
          }}
        >
          <Typography variant="body1">暂无内容</Typography>
        </Box>
      )}
    </Box>
  );
}
