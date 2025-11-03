/**
 * 用户记录相关类型定义
 */

export type WatchStatus = "want_to_watch" | "watching" | "watched";
export type ContentType = "movie" | "tv" | "anime" | "book" | "game";
export type SortField = "status" | "created_at" | "updated_at" | "rating" | "started_at" | "completed_at" | "title";
export type SortOrder = "asc" | "desc";

export interface UserItem {
  id: number;
  user_id: number;
  item_id: number;
  status: WatchStatus;
  rating?: number;
  notes?: string;
  started_at?: string;
  completed_at?: string;
  created_at: string;
  updated_at: string;
  // 内容信息
  external_id: string;
  source: string;
  content_type: ContentType;
  title: string;
  original_title?: string;
  description?: string;
  poster_url?: string;
  backdrop_url?: string;
  release_date?: string;
  year?: string;
  language?: string;
  metadata?: Record<string, any>;
}

export interface UserItemFilters {
  status?: WatchStatus;
  content_type?: ContentType;
  min_rating?: number;
  max_rating?: number;
  year_from?: number;
  year_to?: number;
  search?: string;
  sort_by?: SortField;
  sort_order?: SortOrder;
  page?: number;
  page_size?: number;
}

export interface UserItemListResponse {
  total: number;
  page: number;
  page_size: number;
  total_pages: number;
  items: UserItem[];
}

export interface UserItemStats {
  total: number;
  by_status: Record<WatchStatus, number>;
  by_type: Record<ContentType, number>;
  average_rating: number | null;
}

