/**
 * Home Feature Components Export
 */

// Legacy components
export { PersonalizedHero } from './PersonalizedHero';
export { StatsOverview } from './StatsOverview';
export { RecentActivity } from './RecentActivity';
export { SmartRecommendations } from './SmartRecommendations';
export { AIInsightCard } from './AIInsightCard';

// New redesigned home components
export { default as HeroCarousel } from './HeroCarousel';
export { default as AIRecommendations } from './AIRecommendations';
export { default as TrendingSection } from './TrendingSection';
export { default as AnimeTimeline } from './AnimeTimeline';
export { default as CategoryRecommendations } from './CategoryRecommendations';
export { default as MediaSection } from './MediaSection';

// Home skeletons
export {
  HeroCarouselSkeleton,
  AIRecommendationsSkeleton,
  TrendingSectionSkeleton,
  AnimeTimelineSkeleton,
  CategoryRecommendationsSkeleton,
} from './HomeSkeletons';
