'use client';

import { Stack } from '@mui/material';
import type { UserItem } from '@/types';
import ItemCard from './ItemCard';

interface ItemListProps {
    items: UserItem[];
    onRefresh: () => void;
    onView: (item: UserItem) => void;
    onEdit: (item: UserItem) => void;
    onDelete: (item: UserItem) => void;
}

export default function ItemList({ items, onRefresh, onView, onEdit, onDelete }: ItemListProps) {
    return (
        <Stack spacing={2}>
            {items.map((item) => (
                <ItemCard
                    key={item.id}
                    item={item}
                    onRefresh={onRefresh}
                    onView={onView}
                    onEdit={onEdit}
                    onDelete={onDelete}
                    variant="list"
                />
            ))}
        </Stack>
    );
}
