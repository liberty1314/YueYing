'use client';

import { useState, useEffect } from 'react';
import { Box, Typography, Grid, Pagination, CircularProgress } from '@mui/material';
import { AppleCard } from '@/components/ui';
import SearchCard from './SearchCard';
import type { ItemType } from '@/types';

interface SearchResultsProps {
    query: string;
    contentType: ItemType;
    source: 'tmdb' | 'google_books' | 'bangumi';
}

interface SearchResult {
    id: string;
    external_id: string;
    title: string;
    original_title?: string;
    description?: string;
    poster_url?: string;
    backdrop_url?: string;
    release_date?: string;
    year?: string;
    rating?: number;
}

export default function SearchResults({ query, contentType, source }: SearchResultsProps) {
    const [results, setResults] = useState<SearchResult[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);

    useEffect(() => {
        if (!query) {
            setResults([]);
            return;
        }

        const fetchResults = async () => {
            try {
                setLoading(true);
                setError('');

                // TODO: 实际调用外部 API
                setResults([]);
                setTotalPages(1);
            } catch (err: unknown) {
                setError(err instanceof Error ? err.message : '搜索失败，请重试');
            } finally {
                setLoading(false);
            }
        };

        fetchResults();
    }, [query, contentType, source, page]);

    const handlePageChange = (event: React.ChangeEvent<unknown>, value: number) => {
        setPage(value);
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    if (!query) {
        return (
            <AppleCard sx={{ p: 4, textAlign: 'center' }}>
                <Typography variant="h6" gutterBottom>
                    开始搜索
                </Typography>
                <Typography color="text.secondary">
                    在上方输入关键词，搜索您感兴趣的内容
                </Typography>
            </AppleCard>
        );
    }

    if (loading) {
        return (
            <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
                <CircularProgress />
            </Box>
        );
    }

    if (error) {
        return (
            <AppleCard sx={{ p: 4, textAlign: 'center' }}>
                <Typography color="error">{error}</Typography>
            </AppleCard>
        );
    }

    if (results.length === 0) {
        return (
            <AppleCard sx={{ p: 4, textAlign: 'center' }}>
                <Typography variant="h6" gutterBottom>
                    没有找到结果
                </Typography>
                <Typography color="text.secondary">
                    尝试使用不同的关键词或切换内容类型
                </Typography>
            </AppleCard>
        );
    }

    return (
        <Box>
            <Typography variant="h6" sx={{ mb: 3, fontWeight: 600 }}>
                找到 {results.length} 个结果
            </Typography>

            <Grid container spacing={3}>
                {results.map((result) => (
                    <Grid size={{ xs: 12, sm: 6, md: 4, lg: 3 }} key={result.id}>
                        <SearchCard result={result} contentType={contentType} source={source} />
                    </Grid>
                ))}
            </Grid>

            {/* Pagination */}
            {totalPages > 1 && (
                <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
                    <Pagination
                        count={totalPages}
                        page={page}
                        onChange={handlePageChange}
                        color="primary"
                        size="large"
                        sx={{
                            '& .MuiPaginationItem-root': {
                                borderRadius: 2,
                            },
                        }}
                    />
                </Box>
            )}
        </Box>
    );
}
