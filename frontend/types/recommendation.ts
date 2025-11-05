/**
 * 推荐类型定义
 */

export interface RecommendationItem {
  item_id: number;
  title: string;
  poster_url: string | null;
  content_type: string;
  score: number;
  genres: string[] | null;
}

export interface RecommendationsResponse {
  recommendations: RecommendationItem[];
  total: number;
  strategy: string;
}

export type RecommendationStrategy = "weighted" | "cascade" | "switch";

