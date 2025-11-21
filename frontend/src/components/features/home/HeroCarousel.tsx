'use client';

import { useState, useEffect } from 'react';
import { Box, IconButton, Typography, Stack, Chip } from '@mui/material';
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import AddIcon from '@mui/icons-material/Add';
import { AppleButton } from '@/components/ui';

interface CarouselItem {
  id: number;
  title: string;
  overview: string;
  backdrop_path?: string;
  poster_path?: string;
  vote_average?: number;
  genres?: string[];
  media_type?: string;
}

interface HeroCarouselProps {
  items: CarouselItem[];
}

export default function HeroCarousel({ items }: HeroCarouselProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isAutoPlaying, setIsAutoPlaying] = useState(true);

  useEffect(() => {
    if (!isAutoPlaying || items.length <= 1) return;

    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % items.length);
    }, 5000);

    return () => clearInterval(interval);
  }, [isAutoPlaying, items.length]);

  const handlePrev = () => {
    setCurrentIndex((prev) => (prev - 1 + items.length) % items.length);
    setIsAutoPlaying(false);
  };

  const handleNext = () => {
    setCurrentIndex((prev) => (prev + 1) % items.length);
    setIsAutoPlaying(false);
  };

  if (items.length === 0) return null;

  const currentItem = items[currentIndex];
  const imageUrl = currentItem.backdrop_path
    ? `https://image.tmdb.org/t/p/original${currentItem.backdrop_path}`
    : currentItem.poster_path
      ? `https://image.tmdb.org/t/p/original${currentItem.poster_path}`
      : '/placeholder.jpg';

  return (
    <Box
      sx={{
        position: 'relative',
        width: '100%',
        height: { xs: '60vh', md: '70vh' },
        overflow: 'hidden',
        borderRadius: { xs: 0, md: 4 },
        mb: 6,
      }}
    >
      {/* 背景图片 */}
      <Box
        sx={{
          position: 'absolute',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          backgroundImage: `url(${imageUrl})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          transition: 'opacity 0.5s ease',
          '&::after': {
            content: '""',
            position: 'absolute',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            background: (theme) =>
              theme.palette.mode === 'dark'
                ? 'linear-gradient(to top, rgba(0,0,0,0.9) 0%, rgba(0,0,0,0.4) 50%, rgba(0,0,0,0.6) 100%)'
                : 'linear-gradient(to top, rgba(0,0,0,0.7) 0%, rgba(0,0,0,0.3) 50%, rgba(0,0,0,0.4) 100%)',
          },
        }}
      />

      {/* 内容区域 */}
      <Box
        sx={{
          position: 'relative',
          zIndex: 1,
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'flex-end',
          p: { xs: 3, md: 6 },
          maxWidth: 1200,
          mx: 'auto',
        }}
      >
        <Stack spacing={2} sx={{ maxWidth: 600 }}>
          {/* 类型标签 */}
          {currentItem.media_type && (
            <Chip
              label={currentItem.media_type === 'movie' ? '电影' : '剧集'}
              size="small"
              sx={{
                width: 'fit-content',
                bgcolor: 'rgba(255,255,255,0.2)',
                color: 'white',
                backdropFilter: 'blur(10px)',
              }}
            />
          )}

          {/* 标题 */}
          <Typography
            variant="h2"
            sx={{
              color: 'white',
              fontWeight: 700,
              fontSize: { xs: '2rem', md: '3rem' },
              textShadow: '2px 2px 8px rgba(0,0,0,0.8)',
            }}
          >
            {currentItem.title}
          </Typography>

          {/* 评分和类型 */}
          <Stack direction="row" spacing={2} alignItems="center">
            {currentItem.vote_average && (
              <Chip
                label={`⭐ ${currentItem.vote_average.toFixed(1)}`}
                size="small"
                sx={{
                  bgcolor: 'rgba(255,255,255,0.2)',
                  color: 'white',
                  backdropFilter: 'blur(10px)',
                  fontWeight: 600,
                }}
              />
            )}
            {currentItem.genres && currentItem.genres.length > 0 && (
              <Typography
                variant="body2"
                sx={{
                  color: 'rgba(255,255,255,0.9)',
                  textShadow: '1px 1px 4px rgba(0,0,0,0.8)',
                }}
              >
                {currentItem.genres.slice(0, 3).join(' · ')}
              </Typography>
            )}
          </Stack>

          {/* 简介 */}
          <Typography
            variant="body1"
            sx={{
              color: 'rgba(255,255,255,0.9)',
              textShadow: '1px 1px 4px rgba(0,0,0,0.8)',
              display: '-webkit-box',
              WebkitLineClamp: 3,
              WebkitBoxOrient: 'vertical',
              overflow: 'hidden',
              lineHeight: 1.6,
            }}
          >
            {currentItem.overview}
          </Typography>

          {/* 操作按钮 */}
          <Stack direction="row" spacing={2} sx={{ mt: 2 }}>
            <AppleButton
              variant="primary"
              startIcon={<PlayArrowIcon />}
              sx={{
                bgcolor: 'white',
                color: 'black',
                '&:hover': {
                  bgcolor: 'rgba(255,255,255,0.9)',
                },
              }}
            >
              查看详情
            </AppleButton>
            <AppleButton
              variant="ghost"
              startIcon={<AddIcon />}
              sx={{
                borderColor: 'white',
                color: 'white',
                bgcolor: 'rgba(255,255,255,0.1)',
                backdropFilter: 'blur(10px)',
                '&:hover': {
                  bgcolor: 'rgba(255,255,255,0.2)',
                  borderColor: 'white',
                },
              }}
            >
              添加到库
            </AppleButton>
          </Stack>
        </Stack>
      </Box>

      {/* 导航按钮 */}
      {items.length > 1 && (
        <>
          <IconButton
            onClick={handlePrev}
            sx={{
              position: 'absolute',
              left: { xs: 10, md: 20 },
              top: '50%',
              transform: 'translateY(-50%)',
              zIndex: 2,
              bgcolor: 'rgba(0,0,0,0.5)',
              color: 'white',
              backdropFilter: 'blur(10px)',
              '&:hover': {
                bgcolor: 'rgba(0,0,0,0.7)',
              },
            }}
          >
            <ChevronLeftIcon />
          </IconButton>
          <IconButton
            onClick={handleNext}
            sx={{
              position: 'absolute',
              right: { xs: 10, md: 20 },
              top: '50%',
              transform: 'translateY(-50%)',
              zIndex: 2,
              bgcolor: 'rgba(0,0,0,0.5)',
              color: 'white',
              backdropFilter: 'blur(10px)',
              '&:hover': {
                bgcolor: 'rgba(0,0,0,0.7)',
              },
            }}
          >
            <ChevronRightIcon />
          </IconButton>
        </>
      )}

      {/* 指示器 */}
      {items.length > 1 && (
        <Stack
          direction="row"
          spacing={1}
          sx={{
            position: 'absolute',
            bottom: 20,
            left: '50%',
            transform: 'translateX(-50%)',
            zIndex: 2,
          }}
        >
          {items.map((_, index) => (
            <Box
              key={index}
              onClick={() => {
                setCurrentIndex(index);
                setIsAutoPlaying(false);
              }}
              sx={{
                width: currentIndex === index ? 24 : 8,
                height: 8,
                borderRadius: 4,
                bgcolor: currentIndex === index ? 'white' : 'rgba(255,255,255,0.5)',
                cursor: 'pointer',
                transition: 'all 0.3s ease',
                '&:hover': {
                  bgcolor: 'white',
                },
              }}
            />
          ))}
        </Stack>
      )}
    </Box>
  );
}
