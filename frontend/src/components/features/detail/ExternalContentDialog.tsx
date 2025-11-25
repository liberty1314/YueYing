/**
 * ExternalContentDialog - 外部内容详情弹窗
 * 
 * 用于显示来自 TMDB、Bangumi、Google Books 等外部源的内容详情
 * 并提供快速添加到收藏库的功能
 */

'use client';

import { useState } from 'react';
import {
    Dialog,
    DialogContent,
    DialogTitle,
    Box,
    Typography,
    Stack,
    Chip,
    Button,
    IconButton,
    Divider,
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import AddIcon from '@mui/icons-material/Add';
import CheckIcon from '@mui/icons-material/Check';
import StarIcon from '@mui/icons-material/Star';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';

interface ExternalContent {
    id: number | string;
    title?: string;
    name?: string;
    name_cn?: string;
    original_title?: string;
    original_name?: string;
    poster_path?: string;
    poster_url?: string;
    backdrop_path?: string;
    images?: {
        large?: string;
        common?: string;
        medium?: string;
    };
    overview?: string;
    summary?: string;
    vote_average?: number;
    rating?: {
        score?: number;
    };
    release_date?: string;
    first_air_date?: string;
    air_date?: string;
    media_type?: string;
    content_type?: string;
    genres?: Array<{ id: number; name: string }>;
    eps?: number;
    eps_count?: number;
    runtime?: number;
    source?: string;
}

interface ExternalContentDialogProps {
    open: boolean;
    content: ExternalContent | null;
    onClose: () => void;
    onAddToLibrary?: (content: ExternalContent) => void;
}

export default function ExternalContentDialog({
    open,
    content,
    onClose,
    onAddToLibrary,
}: ExternalContentDialogProps) {
    const [isAdding, setIsAdding] = useState(false);
    const [isAdded, setIsAdded] = useState(false);

    if (!content) return null;

    // 提取标题
    const title = content.title || content.name || content.name_cn || '未知标题';
    const originalTitle = content.original_title || content.original_name;

    // 提取海报
    let posterUrl = '';
    if (content.poster_path) {
        posterUrl = content.poster_path.startsWith('http')
            ? content.poster_path
            : `https://image.tmdb.org/t/p/w500${content.poster_path}`;
    } else if (content.poster_url) {
        posterUrl = content.poster_url;
    } else if (content.images?.large) {
        posterUrl = content.images.large;
    } else if (content.images?.common) {
        posterUrl = content.images.common;
    }

    // 提取背景图
    let backdropUrl = '';
    if (content.backdrop_path) {
        backdropUrl = content.backdrop_path.startsWith('http')
            ? content.backdrop_path
            : `https://image.tmdb.org/t/p/original${content.backdrop_path}`;
    }

    // 提取简介
    const overview = content.overview || content.summary || '暂无简介';

    // 提取评分
    const rating = content.vote_average || content.rating?.score;

    // 提取年份
    const releaseDate = content.release_date || content.first_air_date || content.air_date;
    const year = releaseDate ? new Date(releaseDate).getFullYear() : null;

    // 提取类型
    const contentType = content.media_type || content.content_type;

    // 提取集数
    const episodeCount = content.eps || content.eps_count;

    // 处理添加到收藏库
    const handleAdd = async () => {
        if (!onAddToLibrary || isAdded) return;

        setIsAdding(true);
        try {
            await onAddToLibrary(content);
            setIsAdded(true);
        } catch (error) {
            console.error('Failed to add to library:', error);
        } finally {
            setIsAdding(false);
        }
    };

    return (
        <Dialog
            open={open}
            onClose={onClose}
            maxWidth="md"
            fullWidth
            PaperProps={{
                sx: {
                    borderRadius: 3,
                    maxHeight: '90vh',
                },
            }}
        >
            {/* 背景图 */}
            {backdropUrl && (
                <Box
                    sx={{
                        position: 'relative',
                        height: 200,
                        backgroundImage: `url(${backdropUrl})`,
                        backgroundSize: 'cover',
                        backgroundPosition: 'center',
                        '&::after': {
                            content: '""',
                            position: 'absolute',
                            inset: 0,
                            background: 'linear-gradient(to bottom, transparent 0%, rgba(0,0,0,0.8) 100%)',
                        },
                    }}
                />
            )}

            {/* 关闭按钮 */}
            <IconButton
                onClick={onClose}
                sx={{
                    position: 'absolute',
                    right: 8,
                    top: 8,
                    color: 'white',
                    bgcolor: 'rgba(0,0,0,0.5)',
                    '&:hover': {
                        bgcolor: 'rgba(0,0,0,0.7)',
                    },
                    zIndex: 1,
                }}
            >
                <CloseIcon />
            </IconButton>

            <DialogContent sx={{ p: 3 }}>
                <Stack spacing={3}>
                    {/* 标题和海报 */}
                    <Stack direction="row" spacing={3}>
                        {/* 海报 */}
                        {posterUrl && (
                            <Box
                                component="img"
                                src={posterUrl}
                                alt={title}
                                sx={{
                                    width: 150,
                                    height: 225,
                                    objectFit: 'cover',
                                    borderRadius: 2,
                                    flexShrink: 0,
                                }}
                                onError={(e) => {
                                    e.currentTarget.style.display = 'none';
                                }}
                            />
                        )}

                        {/* 标题和元信息 */}
                        <Stack spacing={2} flex={1}>
                            <Box>
                                <Typography variant="h5" sx={{ fontWeight: 700, mb: 0.5 }}>
                                    {title}
                                </Typography>
                                {originalTitle && originalTitle !== title && (
                                    <Typography variant="body2" color="text.secondary">
                                        {originalTitle}
                                    </Typography>
                                )}
                            </Box>

                            {/* 元信息 */}
                            <Stack direction="row" spacing={1.5} flexWrap="wrap">
                                {year && (
                                    <Chip
                                        icon={<CalendarTodayIcon />}
                                        label={year}
                                        size="small"
                                        variant="outlined"
                                    />
                                )}
                                {rating && (
                                    <Chip
                                        icon={<StarIcon />}
                                        label={rating.toFixed(1)}
                                        size="small"
                                        color="primary"
                                    />
                                )}
                                {contentType && (
                                    <Chip
                                        label={contentType === 'movie' ? '电影' : contentType === 'tv' ? '剧集' : contentType === 'anime' ? '动画' : contentType}
                                        size="small"
                                    />
                                )}
                                {episodeCount && (
                                    <Chip
                                        label={`共${episodeCount}话`}
                                        size="small"
                                    />
                                )}
                                {content.runtime && (
                                    <Chip
                                        label={`${content.runtime}分钟`}
                                        size="small"
                                    />
                                )}
                            </Stack>

                            {/* 类型标签 */}
                            {content.genres && content.genres.length > 0 && (
                                <Stack direction="row" spacing={1} flexWrap="wrap">
                                    {content.genres.map((genre) => (
                                        <Chip
                                            key={genre.id}
                                            label={genre.name}
                                            size="small"
                                            variant="outlined"
                                        />
                                    ))}
                                </Stack>
                            )}

                            {/* 添加按钮 */}
                            {onAddToLibrary && (
                                <Box>
                                    <Button
                                        variant={isAdded ? 'outlined' : 'contained'}
                                        startIcon={isAdded ? <CheckIcon /> : <AddIcon />}
                                        onClick={handleAdd}
                                        disabled={isAdding || isAdded}
                                        fullWidth
                                    >
                                        {isAdded ? '已添加到收藏库' : '添加到收藏库'}
                                    </Button>
                                </Box>
                            )}
                        </Stack>
                    </Stack>

                    <Divider />

                    {/* 简介 */}
                    <Box>
                        <Typography variant="h6" sx={{ fontWeight: 600, mb: 1.5 }}>
                            简介
                        </Typography>
                        <Typography variant="body2" color="text.secondary" sx={{ lineHeight: 1.8 }}>
                            {overview}
                        </Typography>
                    </Box>
                </Stack>
            </DialogContent>
        </Dialog>
    );
}
