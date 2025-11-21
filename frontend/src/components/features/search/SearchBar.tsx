'use client';

import { useState, useEffect, useCallback } from 'react';
import { Box, IconButton, Chip, Stack } from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import ClearIcon from '@mui/icons-material/Clear';
import { AppleInput } from '@/components/ui';

interface SearchBarProps {
    onSearch: (query: string) => void;
    debounceMs?: number;
}

export default function SearchBar({ onSearch, debounceMs = 500 }: SearchBarProps) {
    const [query, setQuery] = useState('');
    const [searchHistory, setSearchHistory] = useState<string[]>([]);

    // 加载搜索历史
    useEffect(() => {
        const history = localStorage.getItem('search-history');
        if (history) {
            setSearchHistory(JSON.parse(history));
        }
    }, []);

    // 防抖搜索
    useEffect(() => {
        const timer = setTimeout(() => {
            if (query.trim()) {
                onSearch(query.trim());
                // 保存到搜索历史
                saveToHistory(query.trim());
            }
        }, debounceMs);

        return () => clearTimeout(timer);
    }, [query, debounceMs, onSearch]);

    const saveToHistory = (searchQuery: string) => {
        const newHistory = [
            searchQuery,
            ...searchHistory.filter((item) => item !== searchQuery),
        ].slice(0, 10); // 只保留最近 10 条
        setSearchHistory(newHistory);
        localStorage.setItem('search-history', JSON.stringify(newHistory));
    };

    const handleClear = () => {
        setQuery('');
        onSearch('');
    };

    const handleHistoryClick = (historyQuery: string) => {
        setQuery(historyQuery);
        onSearch(historyQuery);
    };

    const clearHistory = () => {
        setSearchHistory([]);
        localStorage.removeItem('search-history');
    };

    return (
        <Box>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <AppleInput
                    placeholder="搜索电影、电视剧、动漫、游戏、书籍..."
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    fullWidth
                    InputProps={{
                        startAdornment: <SearchIcon sx={{ mr: 1, color: 'text.secondary' }} />,
                        endAdornment: query && (
                            <IconButton size="small" onClick={handleClear}>
                                <ClearIcon />
                            </IconButton>
                        ),
                    }}
                />
            </Box>

            {/* Search History */}
            {searchHistory.length > 0 && !query && (
                <Box sx={{ mt: 2 }}>
                    <Stack direction="row" spacing={1} alignItems="center" flexWrap="wrap">
                        <Box sx={{ fontSize: '0.875rem', color: 'text.secondary', mr: 1 }}>
                            搜索历史：
                        </Box>
                        {searchHistory.map((item, index) => (
                            <Chip
                                key={index}
                                label={item}
                                size="small"
                                onClick={() => handleHistoryClick(item)}
                                sx={{ borderRadius: 2, mb: 1 }}
                            />
                        ))}
                        <Chip
                            label="清除历史"
                            size="small"
                            variant="outlined"
                            onClick={clearHistory}
                            sx={{ borderRadius: 2, mb: 1 }}
                        />
                    </Stack>
                </Box>
            )}
        </Box>
    );
}
