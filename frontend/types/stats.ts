/**
 * 统计数据类型定义
 */

export interface OverviewStats {
  total_items: number;
  by_status: Record<string, number>;
  by_type: Record<string, number>;
  average_rating: number | null;
  total_rated: number;
  this_month_added: number;
}

export interface TypeDistribution {
  type: string;
  count: number;
  percentage: number;
}

export interface StatusDistribution {
  status: string;
  count: number;
  percentage: number;
}

export interface RatingDistribution {
  rating: number;
  count: number;
}

export interface TimeSeriesPoint {
  date: string;
  count: number;
  cumulative_count?: number;
}

export interface TimeTrend {
  period: string;
  data: TimeSeriesPoint[];
}

export interface TagStats {
  tag_name: string;
  count: number;
  color: string | null;
}

export interface ActivityHeatmapData {
  date: string;
  count: number;
}

export interface RecentActivityItem {
  id: number;
  item_id: number;
  title: string;
  content_type: string;
  poster_url: string | null;
  status: string;
  rating: number | null;
  updated_at: string;
}

export interface YearDistribution {
  year: number | null;
  count: number;
}

export interface ComprehensiveStats {
  overview: OverviewStats;
  type_distribution: TypeDistribution[];
  status_distribution: StatusDistribution[];
  rating_distribution: RatingDistribution[];
  time_trend: TimeTrend;
  top_tags: TagStats[];
  activity_heatmap: ActivityHeatmapData[];
  recent_activities: RecentActivityItem[];
  year_distribution: YearDistribution[];
}

