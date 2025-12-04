'use client';

import { Skeleton } from '@/components/ui/Skeleton';

export function HeroCarouselSkeleton() {
  return (
    <div className="relative w-full h-[75vh] md:h-[85vh] mb-12 md:mb-16 rounded-2xl md:rounded-3xl overflow-hidden">
      <Skeleton className="absolute inset-0" />
      <div className="absolute bottom-0 left-0 right-0 p-6 md:p-12 space-y-4">
        <Skeleton className="h-8 w-32 rounded-full" />
        <Skeleton className="h-16 md:h-24 w-3/4 max-w-2xl" />
        <Skeleton className="h-6 w-1/2 max-w-xl" />
        <Skeleton className="h-20 w-full max-w-xl" />
        <div className="flex gap-3 pt-2">
          <Skeleton className="h-12 w-32" />
          <Skeleton className="h-12 w-32" />
        </div>
      </div>
    </div>
  );
}

export function AIRecommendationsSkeleton() {
  return (
    <section className="mb-16 md:mb-20 px-4 md:px-6">
      <div className="flex items-center gap-3 mb-6">
        <Skeleton className="w-1 h-8 rounded-full" />
        <Skeleton className="w-8 h-8 rounded-full" />
        <Skeleton className="h-10 w-48" />
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4 md:gap-6">
        {Array.from({ length: 12 }).map((_, i) => (
          <div key={i} className="space-y-3">
            <Skeleton className="aspect-[2/3] rounded-xl" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-3 w-2/3" />
          </div>
        ))}
      </div>
    </section>
  );
}

export function TrendingSectionSkeleton() {
  return (
    <section className="mb-16 md:mb-20 px-4 md:px-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
        <div className="flex items-center gap-3">
          <Skeleton className="w-1 h-8 rounded-full" />
          <Skeleton className="w-8 h-8 rounded-full" />
          <Skeleton className="h-10 w-32" />
        </div>
        <Skeleton className="h-10 w-64 rounded-full" />
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4 md:gap-6">
        {Array.from({ length: 12 }).map((_, i) => (
          <div key={i} className="space-y-3">
            <Skeleton className="aspect-[2/3] rounded-xl" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-3 w-2/3" />
          </div>
        ))}
      </div>
    </section>
  );
}

export function AnimeTimelineSkeleton() {
  return (
    <section className="mb-16 md:mb-20 px-4 md:px-6">
      <div className="flex items-center gap-3 mb-6">
        <Skeleton className="w-1 h-8 rounded-full" />
        <Skeleton className="w-8 h-8 rounded-full" />
        <Skeleton className="h-10 w-32" />
      </div>
      <div className="mb-6 flex gap-2 overflow-x-auto">
        {Array.from({ length: 7 }).map((_, i) => (
          <Skeleton key={i} className="h-10 w-20 rounded-xl flex-shrink-0" />
        ))}
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4 md:gap-6">
        {Array.from({ length: 12 }).map((_, i) => (
          <div key={i} className="space-y-3">
            <Skeleton className="aspect-[2/3] rounded-xl" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-3 w-2/3" />
          </div>
        ))}
      </div>
    </section>
  );
}

export function CategoryRecommendationsSkeleton() {
  return (
    <>
      {Array.from({ length: 2 }).map((_, sectionIndex) => (
        <section key={sectionIndex} className="mb-16 md:mb-20 px-4 md:px-6">
          <div className="flex items-center gap-3 mb-6">
            <Skeleton className="w-1 h-8 rounded-full" />
            <Skeleton className="w-8 h-8 rounded-full" />
            <Skeleton className="h-10 w-40" />
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4 md:gap-6">
            {Array.from({ length: 12 }).map((_, i) => (
              <div key={i} className="space-y-3">
                <Skeleton className="aspect-[2/3] rounded-xl" />
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-3 w-2/3" />
              </div>
            ))}
          </div>
        </section>
      ))}
    </>
  );
}
