'use client';

import { Grid } from '@mui/material';
import type { UserItem } from '@/types';
import ItemCard from './ItemCard';

interface ItemGridProps {
    items: UserItem[];
    onRefresh: () => void;
    onView: (item: UserItem) => void;
    onEdit: (item: UserItem) => void;
    onDelete: (item: UserItem) => void;
}

export default function ItemGrid({ items, onRefresh, onView, onEdit, onDelete }: ItemGridProps) {
    return (
        <Grid container spacing={3}>
            {items.map((item) => (
                <Grid size={{ xs: 12, sm: 6, md: 4, lg: 3 }} key={item.id}>
                    <ItemCard
                        item={item}
                        onRefresh={onRefresh}
                        onView={onView}
                        onEdit={onEdit}
                        onDelete={onDelete}
                    />
                </Grid>
            ))}
        </Grid>
    );
}
