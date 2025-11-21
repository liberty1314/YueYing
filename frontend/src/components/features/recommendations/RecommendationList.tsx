'use client';

import { Grid } from '@mui/material';
import type { UserItem } from '@/types';
import RecommendationCard from './RecommendationCard';

interface RecommendationListProps {
    recommendations: UserItem[];
}

export default function RecommendationList({ recommendations }: RecommendationListProps) {
    return (
        <Grid container spacing={3}>
            {recommendations.map((item) => (
                <Grid size={{ xs: 12, sm: 6, md: 4, lg: 3 }} key={item.id}>
                    <RecommendationCard item={item} />
                </Grid>
            ))}
        </Grid>
    );
}
