'use client';

import { Box, Typography, Stack, Chip, Divider } from '@mui/material';
import { AppleInput } from '@/components/ui';
import { useLibraryStore } from '@/stores/libraryStore';
import type { ItemType, ItemStatus } from '@/types';

const itemTypes: { value: ItemType; label: string }[] = [
    { value: 'movie', label: '电影' },
    { value: 'tv', label: '电视剧' },
    { value: 'anime', label: '动漫' },
    { value: 'book', label: '书籍' },
];

const itemStatuses: { value: ItemStatus; label: string }[] = [
    { value: 'want_to_watch', label: '想看/想玩' },
    { value: 'watching', label: '进行中' },
    { value: 'watched', label: '已完成' },
];

export default function FilterPanel() {
    const { filters, updateFilter, clearFilters } = useLibraryStore();

    const handleTypeFilter = (type: ItemType) => {
        updateFilter('content_type', filters.content_type === type ? undefined : type);
    };

    const handleStatusFilter = (status: ItemStatus) => {
        updateFilter('status', filters.status === status ? undefined : status);
    };

    const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        updateFilter('search', e.target.value || undefined);
    };

    return (
        <Stack spacing={3}>
            <Typography variant="h6" sx={{ fontWeight: 600 }}>
                筛选条件
            </Typography>

            {/* Search */}
            <Box>
                <Typography variant="subtitle2" gutterBottom sx={{ fontWeight: 500 }}>
                    搜索
                </Typography>
                <AppleInput
                    placeholder="搜索标题..."
                    value={filters.search || ''}
                    onChange={handleSearchChange}
                    size="small"
                    fullWidth
                />
            </Box>

            <Divider />

            {/* Type Filter */}
            <Box>
                <Typography variant="subtitle2" gutterBottom sx={{ fontWeight: 500 }}>
                    类型
                </Typography>
                <Stack direction="row" flexWrap="wrap" gap={1}>
                    {itemTypes.map((type) => (
                        <Chip
                            key={type.value}
                            label={type.label}
                            variant={filters.content_type === type.value ? 'filled' : 'outlined'}
                            color={filters.content_type === type.value ? 'primary' : 'default'}
                            onClick={() => handleTypeFilter(type.value)}
                            sx={{ borderRadius: 2 }}
                        />
                    ))}
                </Stack>
            </Box>

            <Divider />

            {/* Status Filter */}
            <Box>
                <Typography variant="subtitle2" gutterBottom sx={{ fontWeight: 500 }}>
                    状态
                </Typography>
                <Stack direction="row" flexWrap="wrap" gap={1}>
                    {itemStatuses.map((status) => (
                        <Chip
                            key={status.value}
                            label={status.label}
                            variant={filters.status === status.value ? 'filled' : 'outlined'}
                            color={filters.status === status.value ? 'primary' : 'default'}
                            onClick={() => handleStatusFilter(status.value)}
                            sx={{ borderRadius: 2 }}
                        />
                    ))}
                </Stack>
            </Box>

            <Divider />

            {/* Clear Filters */}
            <Box>
                <Chip
                    label="清除筛选"
                    variant="outlined"
                    color="secondary"
                    onClick={clearFilters}
                    sx={{ borderRadius: 2 }}
                />
            </Box>
        </Stack>
    );
}
