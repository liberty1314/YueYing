'use client';

import { ToggleButtonGroup, ToggleButton } from '@mui/material';
import MovieIcon from '@mui/icons-material/Movie';
import TvIcon from '@mui/icons-material/Tv';
import MenuBookIcon from '@mui/icons-material/MenuBook';
import AnimationIcon from '@mui/icons-material/Animation';
import type { ItemType } from '@/types';

interface ContentTypeFilterProps {
    value: ItemType;
    onChange: (type: ItemType) => void;
}

const contentTypes = [
    { value: 'movie' as ItemType, label: '电影', icon: <MovieIcon /> },
    { value: 'tv' as ItemType, label: '电视剧', icon: <TvIcon /> },
    { value: 'anime' as ItemType, label: '动漫', icon: <AnimationIcon /> },
    { value: 'book' as ItemType, label: '书籍', icon: <MenuBookIcon /> },
];

export default function ContentTypeFilter({ value, onChange }: ContentTypeFilterProps) {
    const handleChange = (event: React.MouseEvent<HTMLElement>, newValue: ItemType | null) => {
        if (newValue !== null) {
            onChange(newValue);
        }
    };

    return (
        <ToggleButtonGroup
            value={value}
            exclusive
            onChange={handleChange}
            aria-label="content type"
            sx={{
                display: 'flex',
                gap: 1,
                '& .MuiToggleButton-root': {
                    flex: 1,
                    border: 'none',
                    borderRadius: 2,
                    textTransform: 'none',
                    fontWeight: 500,
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
            {contentTypes.map((type) => (
                <ToggleButton key={type.value} value={type.value} aria-label={type.label}>
                    {type.icon}
                    <span style={{ marginLeft: 8 }}>{type.label}</span>
                </ToggleButton>
            ))}
        </ToggleButtonGroup>
    );
}
