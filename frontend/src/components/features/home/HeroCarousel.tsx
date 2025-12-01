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
  title?: string;
  name?: string;
  overview: string;
  backdrop_path?: string;
  poster_path?: string;
  vote_average?: number;
  genres?: string[];
  media_type?: string;
  genre_ids?: number[];
}

interface HeroCarouselProps {
  items: CarouselItem[];
  onAddToLibrary?: (item: CarouselItem) => void;
  onViewDetail?: (item: CarouselItem) => void;
}

export default function HeroCarousel({ items, onAddToLibrary, onViewDetail }: HeroCarouselProps) {
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

  if (!items || items.length === 0) {
    return null;
  }

  const currentItem = items[currentIndex];
  const title = currentItem.title || currentItem.name || '未知标题';
  const imageUrl = currentItem.backdrop_path
    ? `https://image.tmdb.org/t/p/original${currentItem.backdrop_path}`
    : currentItem.poster_path
      ? `https://image.tmdb.org/t/p/original${currentItem.poster_path}`
      : '/placeholder.svg';

  return (
    <Box
      sx={{
        position: 'relative',
        width: '100%',
        height: { xs: '75vh', md: '85vh' },
        overflow: 'hidden',
        mb: { xs: 8, md: 12 },
        borderRadius: { xs: 3, md: 4 },
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
          borderRadius: { xs: 3, md: 4 },
          transition: 'opacity 0.8s cubic-bezier(0.4, 0, 0.2, 1)',
          '&::after': {
            content: '""',
            position: 'absolute',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            borderRadius: { xs: 3, md: 4 },
            background: (theme) =>
              theme.palette.mode === 'dark'
                ? 'linear-gradient(to bottom, rgba(0,0,0,0.2) 0%, rgba(0,0,0,0.5) 60%, rgba(0,0,0,0.95) 100%)'
                : 'linear-gradient(to bottom, rgba(0,0,0,0.1) 0%, rgba(0,0,0,0.4) 60%, rgba(0,0,0,0.85) 100%)',
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
          p: { xs: 4, md: 8 },
          maxWidth: 1400,
          mx: 'auto',
        }}
      >
        <Stack spacing={{ xs: 2, md: 3 }} sx={{ maxWidth: { xs: '100%', md: 700 } }}>
          {/* 类型标签 */}
          {currentItem.media_type && (
            <Chip
              label={currentItem.media_type === 'movie' ? '电影' : '剧集'}
              size="small"
              sx={{
                width: 'fit-content',
                bgcolor: 'rgba(255,255,255,0.15)',
                color: 'white',
                backdropFilter: 'blur(20px)',
                border: '1px solid rgba(255,255,255,0.2)',
                fontWeight: 500,
                fontSize: '0.75rem',
                letterSpacing: '0.5px',
              }}
            />
          )}

          {/* 标题 */}
          <Typography
            variant="h1"
            sx={{
              color: 'white',
              fontWeight: 700,
              fontSize: { xs: '2.5rem', md: '4rem', lg: '4.5rem' },
              lineHeight: 1.1,
              letterSpacing: '-0.02em',
              textShadow: '0 4px 20px rgba(0,0,0,0.5)',
            }}
          >
            {title}
          </Typography>

          {/* 评分和类型 */}
          <Stack direction="row" spacing={2} alignItems="center" flexWrap="wrap">
            {currentItem.vote_average && (
              <Box
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 0.5,
                  bgcolor: 'rgba(255,255,255,0.15)',
                  backdropFilter: 'blur(20px)',
                  border: '1px solid rgba(255,255,255,0.2)',
                  px: 1.5,
                  py: 0.5,
                  borderRadius: 2,
                }}
              >
                <Typography variant="body2" sx={{ color: '#fbbf24', fontWeight: 600 }}>
                  ⭐
                </Typography>
                <Typography variant="body2" sx={{ color: 'white', fontWeight: 600 }}>
                  {currentItem.vote_average.toFixed(1)}
                </Typography>
              </Box>
            )}
            {currentItem.genres && currentItem.genres.length > 0 && (
              <Typography
                variant="body1"
                sx={{
                  color: 'rgba(255,255,255,0.85)',
                  fontWeight: 400,
                  fontSize: '0.95rem',
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
              color: 'rgba(255,255,255,0.85)',
              fontSize: { xs: '0.95rem', md: '1.05rem' },
              lineHeight: 1.7,
              display: '-webkit-box',
              WebkitLineClamp: 3,
              WebkitBoxOrient: 'vertical',
              overflow: 'hidden',
              maxWidth: 600,
            }}
          >
            {currentItem.overview}
          </Typography>

          {/* 操作按钮 */}
          <Stack direction="row" spacing={2} sx={{ mt: 1 }}>
            <AppleButton
              variant="primary"
              startIcon={<PlayArrowIcon />}
              onClick={() => onViewDetail?.(currentItem)}
              sx={{
                bgcolor: 'white',
                color: 'black',
                px: 3,
                py: 1.5,
                fontSize: '1rem',
                fontWeight: 600,
                '&:hover': {
                  bgcolor: 'rgba(255,255,255,0.92)',
                  transform: 'scale(1.02)',
                },
                transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
              }}
            >
              查看详情
            </AppleButton>
            <AppleButton
              variant="ghost"
              startIcon={<AddIcon />}
              onClick={() => onAddToLibrary?.(currentItem)}
              sx={{
                borderColor: 'rgba(255,255,255,0.3)',
                color: 'white',
                bgcolor: 'rgba(255,255,255,0.08)',
                backdropFilter: 'blur(20px)',
                px: 3,
                py: 1.5,
                fontSize: '1rem',
                fontWeight: 600,
                '&:hover': {
                  bgcolor: 'rgba(255,255,255,0.15)',
                  borderColor: 'rgba(255,255,255,0.5)',
                  transform: 'scale(1.02)',
                },
                transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
              }}
            >
              快速添加
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
              left: { xs: 16, md: 32 },
              top: '50%',
              transform: 'translateY(-50%)',
              zIndex: 2,
              bgcolor: 'rgba(255,255,255,0.1)',
              color: 'white',
              backdropFilter: 'blur(20px)',
              border: '1px solid rgba(255,255,255,0.2)',
              width: 48,
              height: 48,
              '&:hover': {
                bgcolor: 'rgba(255,255,255,0.2)',
                transform: 'translateY(-50%) scale(1.05)',
              },
              transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
            }}
          >
            <ChevronLeftIcon sx={{ fontSize: 28 }} />
          </IconButton>
          <IconButton
            onClick={handleNext}
            sx={{
              position: 'absolute',
              right: { xs: 16, md: 32 },
              top: '50%',
              transform: 'translateY(-50%)',
              zIndex: 2,
              bgcolor: 'rgba(255,255,255,0.1)',
              color: 'white',
              backdropFilter: 'blur(20px)',
              border: '1px solid rgba(255,255,255,0.2)',
              width: 48,
              height: 48,
              '&:hover': {
                bgcolor: 'rgba(255,255,255,0.2)',
                transform: 'translateY(-50%) scale(1.05)',
              },
              transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
            }}
          >
            <ChevronRightIcon sx={{ fontSize: 28 }} />
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
            bottom: { xs: 24, md: 32 },
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
                width: currentIndex === index ? 32 : 8,
                height: 8,
                borderRadius: 4,
                bgcolor: currentIndex === index ? 'white' : 'rgba(255,255,255,0.4)',
                cursor: 'pointer',
                transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
                '&:hover': {
                  bgcolor: currentIndex === index ? 'white' : 'rgba(255,255,255,0.7)',
                },
              }}
            />
          ))}
        </Stack>
      )}
    </Box>
  );
}
