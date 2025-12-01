/**
 * ExternalContentDialog - 外部内容详情弹窗
 * 
 * 参考苹果官网设计风格，针对不同数据源提供差异化布局：
 * - TMDB: 完整信息展示（背景图、海报、详细简介）
 * - Bangumi: 简化布局（优雅处理信息缺失）
 */

'use client';

import { useState, useMemo, useEffect, useCallback, useRef } from 'react';
import {
    Dialog,
    DialogContent,
    Box,
    Typography,
    Stack,
    Chip,
    Button,
    IconButton,
    Fade,
    Backdrop,
    alpha,
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import AddIcon from '@mui/icons-material/Add';
import CheckIcon from '@mui/icons-material/Check';
import StarIcon from '@mui/icons-material/Star';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import TvIcon from '@mui/icons-material/Tv';
import LocalOfferIcon from '@mui/icons-material/LocalOffer';
import { checkInLibrary } from '@/utils/library';

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
    refreshTrigger?: number; // 用于触发状态刷新
    forceAdded?: boolean; // 强制设置为已添加状态
}

export default function ExternalContentDialog({
    open,
    content,
    onClose,
    onAddToLibrary,
    refreshTrigger = 0,
    forceAdded = false,
}: ExternalContentDialogProps) {
    const [isAdding, setIsAdding] = useState(false);
    const [isAdded, setIsAdded] = useState(false);
    const [imageLoaded, setImageLoaded] = useState(false);
    const isClosingRef = useRef(false);

    // 当弹窗关闭时重置所有状态
    useEffect(() => {
        if (!open) {
            setIsAdding(false);
            setIsAdded(false);
            setImageLoaded(false);
            isClosingRef.current = false;
        }
    }, [open]);

    // 当 forceAdded 变化时，直接设置状态
    useEffect(() => {
        if (forceAdded) {
            setIsAdded(true);
        }
    }, [forceAdded]);

    // 检查条目是否已在库中
    // 当对话框打开时检查，当 refreshTrigger 变化时也重新检查
    useEffect(() => {
        const checkStatus = async () => {
            // 如果已经强制设置为已添加，跳过检查
            if (forceAdded) {
                return;
            }

            if (!content || !open) {
                return;
            }

            try {
                // 使用与 addToLibrary 相同的逻辑：优先使用 external_id，否则使用 id
                const externalIdValue = (content as any).external_id || content.id;
                const externalId = Number(externalIdValue);
                if (isNaN(externalId)) {
                    return;
                }

                const contentType = content.media_type || content.content_type || 'movie';

                const { inLibrary } = await checkInLibrary(externalId, contentType);
                setIsAdded(inLibrary);
            } catch (error) {
                console.error('检查收藏状态失败:', error);
            }
        };

        // 每次对话框打开或 refreshTrigger 变化时都重新检查状态
        if (open) {
            checkStatus();
        }
    }, [content, open, refreshTrigger, forceAdded]);

    // 统一的关闭处理函数，防止重复调用
    const handleClose = useCallback(() => {
        if (isClosingRef.current) return;
        isClosingRef.current = true;
        onClose();
    }, [onClose]);

    // 数据提取和处理
    const contentData = useMemo(() => {
        if (!content) return null;

        const title = content.title || content.name || content.name_cn || '未知标题';
        const originalTitle = content.original_title || content.original_name;

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

        let backdropUrl = '';
        if (content.backdrop_path) {
            backdropUrl = content.backdrop_path.startsWith('http')
                ? content.backdrop_path
                : `https://image.tmdb.org/t/p/original${content.backdrop_path}`;
        }

        const overview = content.overview || content.summary;
        const hasOverview = overview && overview.trim().length > 0;
        const rating = content.vote_average || content.rating?.score;
        const releaseDate = content.release_date || content.first_air_date || content.air_date;
        const year = releaseDate ? new Date(releaseDate).getFullYear() : null;
        const contentType = content.media_type || content.content_type;
        const episodeCount = content.eps || content.eps_count;
        const isTMDB = !!(backdropUrl && hasOverview);
        const source = content.source || (isTMDB ? 'tmdb' : 'bangumi');

        return {
            title,
            originalTitle,
            posterUrl,
            backdropUrl,
            overview,
            hasOverview,
            rating,
            year,
            contentType,
            episodeCount,
            runtime: content.runtime,
            genres: content.genres,
            isTMDB,
            source,
        };
    }, [content]);

    const handleAdd = async () => {
        if (!onAddToLibrary || isAdded || !content) return;
        setIsAdding(true);
        try {
            onAddToLibrary(content);
            // 不要立即设置 isAdded，等待用户在对话框中确认
            // setIsAdded(true); // 移除这行，避免在用户取消时显示错误状态
        } catch (error) {
            console.error('Failed to add to library:', error);
        } finally {
            setIsAdding(false);
        }
    };

    const getContentTypeLabel = (type?: string) => {
        const typeMap: Record<string, string> = {
            movie: '电影',
            tv: '剧集',
            anime: '动画',
            game: '游戏',
            book: '图书',
        };
        return type ? typeMap[type] || type : '';
    };

    if (!content || !contentData) return null;

    const {
        title,
        originalTitle,
        posterUrl,
        backdropUrl,
        overview,
        hasOverview,
        rating,
        year,
        contentType,
        episodeCount,
        runtime,
        genres,
        isTMDB,
    } = contentData;

    // TMDB完整布局
    if (isTMDB) {
        return (
            <Dialog
                open={open}
                onClose={handleClose}
                maxWidth="lg"
                fullWidth
                TransitionComponent={Fade}
                TransitionProps={{ timeout: 400 }}
                BackdropComponent={Backdrop}
                BackdropProps={{
                    timeout: 400,
                    sx: {
                        backdropFilter: 'blur(8px)',
                        backgroundColor: alpha('#000', 0.7),
                    },
                }}
                slotProps={{
                    paper: {
                        sx: {
                            borderRadius: 4,
                            maxHeight: '90vh',
                            overflow: 'hidden',
                            bgcolor: 'background.paper',
                            boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)',
                        },
                    },
                }}
            >
                <Box
                    sx={{
                        position: 'relative',
                        height: { xs: 250, sm: 350, md: 450 },
                        overflow: 'hidden',
                    }}
                >
                    <Box
                        component="img"
                        src={backdropUrl}
                        alt={title}
                        onLoad={() => setImageLoaded(true)}
                        sx={{
                            width: '100%',
                            height: '100%',
                            objectFit: 'cover',
                            opacity: imageLoaded ? 1 : 0,
                            transition: 'opacity 0.6s ease-in-out',
                        }}
                    />
                    <Box
                        sx={{
                            position: 'absolute',
                            inset: 0,
                            background: `linear-gradient(to bottom, transparent 0%, ${alpha('#000', 0.3)} 40%, ${alpha('#000', 0.8)} 80%, ${alpha('#000', 0.95)} 100%)`,
                        }}
                    />
                    <IconButton
                        onClick={handleClose}
                        sx={{
                            position: 'absolute',
                            right: 16,
                            top: 16,
                            color: 'white',
                            bgcolor: alpha('#000', 0.4),
                            backdropFilter: 'blur(10px)',
                            '&:hover': {
                                bgcolor: alpha('#000', 0.6),
                                transform: 'scale(1.05)',
                            },
                            transition: 'all 0.2s ease',
                            zIndex: 2,
                        }}
                    >
                        <CloseIcon />
                    </IconButton>

                    <Box
                        sx={{
                            position: 'absolute',
                            bottom: 0,
                            left: 0,
                            right: 0,
                            p: { xs: 3, sm: 4, md: 5 },
                            zIndex: 1,
                        }}
                    >
                        <Stack direction={{ xs: 'column', sm: 'row' }} spacing={3} alignItems="flex-end">
                            {posterUrl && (
                                <Box
                                    component="img"
                                    src={posterUrl}
                                    alt={title}
                                    sx={{
                                        width: { xs: 140, sm: 160, md: 180 },
                                        height: { xs: 210, sm: 240, md: 270 },
                                        objectFit: 'cover',
                                        borderRadius: 3,
                                        flexShrink: 0,
                                        boxShadow: '0 20px 40px rgba(0,0,0,0.5)',
                                        border: '2px solid rgba(255,255,255,0.1)',
                                        transition: 'transform 0.3s ease',
                                        '&:hover': {
                                            transform: 'scale(1.02)',
                                        },
                                    }}
                                />
                            )}
                            <Stack spacing={2} flex={1} pb={1}>
                                <Box>
                                    <Typography
                                        variant="h4"
                                        sx={{
                                            fontWeight: 700,
                                            color: 'white',
                                            mb: 0.5,
                                            fontSize: { xs: '1.75rem', sm: '2rem', md: '2.5rem' },
                                            textShadow: '0 2px 10px rgba(0,0,0,0.5)',
                                        }}
                                    >
                                        {title}
                                    </Typography>
                                    {originalTitle && originalTitle !== title && (
                                        <Typography
                                            variant="body1"
                                            sx={{
                                                color: alpha('#fff', 0.8),
                                                textShadow: '0 1px 5px rgba(0,0,0,0.5)',
                                            }}
                                        >
                                            {originalTitle}
                                        </Typography>
                                    )}
                                </Box>
                                <Stack direction="row" spacing={1.5} flexWrap="wrap">
                                    {year && (
                                        <Chip
                                            icon={<CalendarTodayIcon sx={{ fontSize: 16 }} />}
                                            label={year}
                                            size="medium"
                                            sx={{
                                                bgcolor: alpha('#fff', 0.15),
                                                backdropFilter: 'blur(10px)',
                                                color: 'white',
                                                fontWeight: 600,
                                                border: `1px solid ${alpha('#fff', 0.2)}`,
                                            }}
                                        />
                                    )}
                                    {rating && (
                                        <Chip
                                            icon={<StarIcon sx={{ fontSize: 16, color: '#FFD700' }} />}
                                            label={rating.toFixed(1)}
                                            size="medium"
                                            sx={{
                                                bgcolor: alpha('#FFD700', 0.2),
                                                backdropFilter: 'blur(10px)',
                                                color: 'white',
                                                fontWeight: 700,
                                                border: `1px solid ${alpha('#FFD700', 0.3)}`,
                                            }}
                                        />
                                    )}
                                    {contentType && (
                                        <Chip
                                            icon={<TvIcon sx={{ fontSize: 16 }} />}
                                            label={getContentTypeLabel(contentType)}
                                            size="medium"
                                            sx={{
                                                bgcolor: alpha('#fff', 0.15),
                                                backdropFilter: 'blur(10px)',
                                                color: 'white',
                                                fontWeight: 600,
                                                border: `1px solid ${alpha('#fff', 0.2)}`,
                                            }}
                                        />
                                    )}
                                    {runtime && (
                                        <Chip
                                            icon={<AccessTimeIcon sx={{ fontSize: 16 }} />}
                                            label={`${runtime}分钟`}
                                            size="medium"
                                            sx={{
                                                bgcolor: alpha('#fff', 0.15),
                                                backdropFilter: 'blur(10px)',
                                                color: 'white',
                                                fontWeight: 600,
                                                border: `1px solid ${alpha('#fff', 0.2)}`,
                                            }}
                                        />
                                    )}
                                    {episodeCount && (
                                        <Chip
                                            label={`共${episodeCount}话`}
                                            size="medium"
                                            sx={{
                                                bgcolor: alpha('#fff', 0.15),
                                                backdropFilter: 'blur(10px)',
                                                color: 'white',
                                                fontWeight: 600,
                                                border: `1px solid ${alpha('#fff', 0.2)}`,
                                            }}
                                        />
                                    )}
                                </Stack>
                            </Stack>
                        </Stack>
                    </Box>
                </Box>

                <DialogContent sx={{ p: { xs: 3, sm: 4, md: 5 } }}>
                    <Stack spacing={4}>
                        {onAddToLibrary && (
                            <Button
                                variant={isAdded ? 'outlined' : 'contained'}
                                size="large"
                                startIcon={isAdded ? <CheckIcon /> : <AddIcon />}
                                onClick={handleAdd}
                                disabled={isAdding || isAdded}
                                sx={{
                                    py: 1.5,
                                    px: 4,
                                    borderRadius: 2,
                                    fontSize: '1rem',
                                    fontWeight: 600,
                                    textTransform: 'none',
                                    boxShadow: isAdded ? 'none' : '0 4px 14px rgba(0,0,0,0.15)',
                                    '&:hover': {
                                        transform: 'translateY(-2px)',
                                        boxShadow: isAdded ? 'none' : '0 6px 20px rgba(0,0,0,0.2)',
                                    },
                                    transition: 'all 0.2s ease',
                                }}
                            >
                                {isAdded ? '已添加到收藏库' : '添加到收藏库'}
                            </Button>
                        )}
                        {genres && genres.length > 0 && (
                            <Box>
                                <Typography
                                    variant="subtitle2"
                                    sx={{
                                        fontWeight: 600,
                                        color: 'text.secondary',
                                        mb: 1.5,
                                        textTransform: 'uppercase',
                                        letterSpacing: 1,
                                    }}
                                >
                                    类型
                                </Typography>
                                <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
                                    {genres.map((genre) => (
                                        <Chip
                                            key={genre.id}
                                            icon={<LocalOfferIcon sx={{ fontSize: 16 }} />}
                                            label={genre.name}
                                            size="medium"
                                            variant="outlined"
                                            sx={{
                                                borderRadius: 2,
                                                fontWeight: 500,
                                                '&:hover': {
                                                    bgcolor: alpha('#000', 0.05),
                                                },
                                            }}
                                        />
                                    ))}
                                </Stack>
                            </Box>
                        )}
                        {hasOverview && (
                            <Box>
                                <Typography
                                    variant="subtitle2"
                                    sx={{
                                        fontWeight: 600,
                                        color: 'text.secondary',
                                        mb: 2,
                                        textTransform: 'uppercase',
                                        letterSpacing: 1,
                                    }}
                                >
                                    简介
                                </Typography>
                                <Typography
                                    variant="body1"
                                    sx={{
                                        lineHeight: 1.8,
                                        color: 'text.primary',
                                        fontSize: '1rem',
                                    }}
                                >
                                    {overview}
                                </Typography>
                            </Box>
                        )}
                    </Stack>
                </DialogContent>
            </Dialog>
        );
    }

    // Bangumi简化布局
    return (
        <Dialog
            open={open}
            onClose={handleClose}
            maxWidth="sm"
            fullWidth
            TransitionComponent={Fade}
            TransitionProps={{ timeout: 400 }}
            BackdropComponent={Backdrop}
            BackdropProps={{
                timeout: 400,
                sx: {
                    backdropFilter: 'blur(8px)',
                    backgroundColor: alpha('#000', 0.7),
                },
            }}
            slotProps={{
                paper: {
                    sx: {
                        borderRadius: 4,
                        maxHeight: '90vh',
                        overflow: 'hidden',
                        bgcolor: 'background.paper',
                        boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)',
                    },
                },
            }}
        >
            <IconButton
                onClick={handleClose}
                sx={{
                    position: 'absolute',
                    right: 16,
                    top: 16,
                    color: 'text.primary',
                    bgcolor: alpha('#000', 0.05),
                    '&:hover': {
                        bgcolor: alpha('#000', 0.1),
                        transform: 'scale(1.05)',
                    },
                    transition: 'all 0.2s ease',
                    zIndex: 2,
                }}
            >
                <CloseIcon />
            </IconButton>
            <DialogContent sx={{ p: { xs: 3, sm: 4 } }}>
                <Stack spacing={3}>
                    <Stack direction="row" spacing={3} alignItems="flex-start">
                        {posterUrl && (
                            <Box
                                component="img"
                                src={posterUrl}
                                alt={title}
                                sx={{
                                    width: 120,
                                    height: 180,
                                    objectFit: 'cover',
                                    borderRadius: 2,
                                    flexShrink: 0,
                                    boxShadow: '0 8px 24px rgba(0,0,0,0.15)',
                                    border: '1px solid rgba(0,0,0,0.1)',
                                }}
                            />
                        )}
                        <Stack spacing={2} flex={1} pt={0.5}>
                            <Box>
                                <Typography
                                    variant="h5"
                                    sx={{
                                        fontWeight: 700,
                                        mb: 0.5,
                                        fontSize: { xs: '1.25rem', sm: '1.5rem' },
                                    }}
                                >
                                    {title}
                                </Typography>
                                {originalTitle && originalTitle !== title && (
                                    <Typography
                                        variant="body2"
                                        color="text.secondary"
                                        sx={{ fontSize: '0.875rem' }}
                                    >
                                        {originalTitle}
                                    </Typography>
                                )}
                            </Box>
                            <Stack spacing={1.5}>
                                {year && (
                                    <Stack direction="row" spacing={1} alignItems="center">
                                        <CalendarTodayIcon sx={{ fontSize: 18, color: 'text.secondary' }} />
                                        <Typography variant="body2" color="text.secondary">
                                            {year}
                                        </Typography>
                                    </Stack>
                                )}
                                {rating && (
                                    <Stack direction="row" spacing={1} alignItems="center">
                                        <StarIcon sx={{ fontSize: 18, color: '#FFD700' }} />
                                        <Typography variant="body2" fontWeight={600}>
                                            {rating.toFixed(1)}
                                        </Typography>
                                    </Stack>
                                )}
                                {contentType && (
                                    <Stack direction="row" spacing={1} alignItems="center">
                                        <TvIcon sx={{ fontSize: 18, color: 'text.secondary' }} />
                                        <Typography variant="body2" color="text.secondary">
                                            {getContentTypeLabel(contentType)}
                                        </Typography>
                                    </Stack>
                                )}
                                {episodeCount && (
                                    <Stack direction="row" spacing={1} alignItems="center">
                                        <Typography variant="body2" color="text.secondary">
                                            共 {episodeCount} 话
                                        </Typography>
                                    </Stack>
                                )}
                            </Stack>
                        </Stack>
                    </Stack>
                    {genres && genres.length > 0 && (
                        <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
                            {genres.map((genre) => (
                                <Chip
                                    key={genre.id}
                                    label={genre.name}
                                    size="small"
                                    variant="outlined"
                                    sx={{
                                        borderRadius: 1.5,
                                        fontSize: '0.75rem',
                                    }}
                                />
                            ))}
                        </Stack>
                    )}
                    {hasOverview && (
                        <Box>
                            <Typography
                                variant="body2"
                                sx={{
                                    lineHeight: 1.7,
                                    color: 'text.secondary',
                                }}
                            >
                                {overview}
                            </Typography>
                        </Box>
                    )}
                    {onAddToLibrary && (
                        <Button
                            variant={isAdded ? 'outlined' : 'contained'}
                            size="large"
                            startIcon={isAdded ? <CheckIcon /> : <AddIcon />}
                            onClick={handleAdd}
                            disabled={isAdding || isAdded}
                            fullWidth
                            sx={{
                                py: 1.5,
                                borderRadius: 2,
                                fontSize: '0.95rem',
                                fontWeight: 600,
                                textTransform: 'none',
                                boxShadow: isAdded ? 'none' : '0 4px 14px rgba(0,0,0,0.15)',
                                '&:hover': {
                                    transform: 'translateY(-2px)',
                                    boxShadow: isAdded ? 'none' : '0 6px 20px rgba(0,0,0,0.2)',
                                },
                                transition: 'all 0.2s ease',
                            }}
                        >
                            {isAdded ? '已添加到收藏库' : '添加到收藏库'}
                        </Button>
                    )}
                </Stack>
            </DialogContent>
        </Dialog>
    );
}
