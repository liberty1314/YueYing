'use client';

import { ToggleButton, ToggleButtonGroup } from '@mui/material';
import GridViewIcon from '@mui/icons-material/GridView';
import ViewListIcon from '@mui/icons-material/ViewList';
import { useLibraryStore } from '@/stores/libraryStore';

export default function ViewToggle() {
    const { viewMode, setViewMode } = useLibraryStore();

    const handleChange = (event: React.MouseEvent<HTMLElement>, newViewMode: string | null) => {
        if (newViewMode !== null) {
            setViewMode(newViewMode as 'grid' | 'list');
        }
    };

    return (
        <ToggleButtonGroup
            value={viewMode}
            exclusive
            onChange={handleChange}
            aria-label="view mode"
            size="small"
            sx={{
                '& .MuiToggleButton-root': {
                    borderRadius: 2,
                    border: 'none',
                    '&.Mui-selected': {
                        backgroundColor: 'primary.main',
                        color: 'primary.contrastText',
                        '&:hover': {
                            backgroundColor: 'primary.dark',
                        },
                    },
                },
            }}
        >
            <ToggleButton value="grid" aria-label="grid view">
                <GridViewIcon />
            </ToggleButton>
            <ToggleButton value="list" aria-label="list view">
                <ViewListIcon />
            </ToggleButton>
        </ToggleButtonGroup>
    );
}
