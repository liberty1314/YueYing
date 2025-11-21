'use client';

import { useState } from 'react';
import { Box, Typography, Tabs, Tab } from '@mui/material';
import ProtectedRoute from '@/components/shared/ProtectedRoute';
import SearchBar from '@/components/features/search/SearchBar';
import ContentTypeFilter from '@/components/features/search/ContentTypeFilter';
import SearchResults from '@/components/features/search/SearchResults';
import type { ItemType } from '@/types';

export default function ExplorePage() {
    const [searchQuery, setSearchQuery] = useState('');
    const [contentType, setContentType] = useState<ItemType>('movie');
    const [source, setSource] = useState<'tmdb' | 'google_books' | 'bangumi'>('tmdb');

    const handleSearch = (query: string) => {
        setSearchQuery(query);
    };

    const handleContentTypeChange = (type: ItemType) => {
        setContentType(type);
        // 根据内容类型自动切换数据源
        if (type === 'book') {
            setSource('google_books');
        } else if (type === 'anime') {
            setSource('bangumi');
        } else {
            setSource('tmdb');
        }
    };

    return (
        <ProtectedRoute>
            <Box sx={{ minHeight: '100vh', bgcolor: 'background.default', pt: 8 }}>
                {/* Header */}
                <Box sx={{ p: 3, borderBottom: 1, borderColor: 'divider' }}>
                    <Typography variant="h4" component="h1" sx={{ fontWeight: 700, mb: 3 }}>
                        搜索和探索
                    </Typography>

                    {/* Search Bar */}
                    <SearchBar onSearch={handleSearch} />

                    {/* Content Type Filter */}
                    <Box sx={{ mt: 3 }}>
                        <ContentTypeFilter value={contentType} onChange={handleContentTypeChange} />
                    </Box>

                    {/* Source Tabs */}
                    <Box sx={{ mt: 2 }}>
                        <Tabs
                            value={source}
                            onChange={(e, newValue) => setSource(newValue)}
                            sx={{
                                '& .MuiTab-root': {
                                    textTransform: 'none',
                                    fontWeight: 500,
                                },
                            }}
                        >
                            {contentType !== 'book' && contentType !== 'anime' && (
                                <Tab label="TMDB" value="tmdb" />
                            )}
                            {contentType === 'book' && <Tab label="Google Books" value="google_books" />}
                            {contentType === 'anime' && <Tab label="Bangumi" value="bangumi" />}
                        </Tabs>
                    </Box>
                </Box>

                {/* Search Results */}
                <Box sx={{ p: 3 }}>
                    <SearchResults query={searchQuery} contentType={contentType} source={source} />
                </Box>
            </Box>
        </ProtectedRoute>
    );
}
