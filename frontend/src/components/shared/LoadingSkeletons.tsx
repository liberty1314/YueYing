'use client';

import { cn } from '@/lib/utils';

interface SkeletonProps {
    className?: string;
}

export function Skeleton({ className }: SkeletonProps) {
    return (
        <div
            className={cn(
                'animate-pulse bg-gray-200 dark:bg-gray-800 rounded',
                className
            )}
        />
    );
}

/**
 * Skeleton for poster card grid items
 */
export function PosterCardSkeleton() {
    return (
        <div className="group">
            {/* Poster image skeleton */}
            <div className="relative aspect-[2/3] overflow-hidden rounded-lg bg-gray-200 dark:bg-gray-800">
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-gray-300 dark:via-gray-700 to-transparent animate-shimmer" />
            </div>

            {/* Title skeleton */}
            <div className="mt-2 px-1">
                <Skeleton className="h-4 w-3/4 mb-2" />
                <div className="flex items-center justify-between">
                    <Skeleton className="h-3 w-12" />
                    <Skeleton className="h-3 w-16" />
                </div>
            </div>
        </div>
    );
}

/**
 * Skeleton for list item views
 */
export function ListItemSkeleton() {
    return (
        <div className="flex items-center gap-4 p-4 rounded-lg bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800">
            {/* Thumbnail skeleton */}
            <Skeleton className="w-16 h-24 flex-shrink-0 rounded" />

            {/* Content skeleton */}
            <div className="flex-1 min-w-0">
                <Skeleton className="h-5 w-1/2 mb-2" />
                <Skeleton className="h-4 w-3/4 mb-1" />
                <Skeleton className="h-3 w-1/4" />
            </div>

            {/* Actions skeleton */}
            <div className="flex gap-2">
                <Skeleton className="w-8 h-8 rounded" />
                <Skeleton className="w-8 h-8 rounded" />
            </div>
        </div>
    );
}

/**
 * Grid of poster card skeletons
 */
interface PosterGridSkeletonProps {
    count?: number;
    className?: string;
}

export function PosterGridSkeleton({ count = 12, className }: PosterGridSkeletonProps) {
    return (
        <div
            className={cn(
                'grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6 gap-6',
                className
            )}
        >
            {Array.from({ length: count }).map((_, i) => (
                <PosterCardSkeleton key={i} />
            ))}
        </div>
    );
}

/**
 * Loading spinner
 */
export function LoadingSpinner({ className }: SkeletonProps) {
    return (
        <div className={cn('flex items-center justify-center', className)}>
            <div className="inline-block w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
        </div>
    );
}
