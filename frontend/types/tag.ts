/**
 * 标签相关类型定义
 */

export type TagType = "emotion" | "theme" | "style" | "custom";

export interface Tag {
  id: number;
  user_id: number;
  name: string;
  type: TagType;
  is_auto: boolean;
  color: string | null;
  description: string | null;
  usage_count?: number;
  created_at: string;
  updated_at: string;
}

export interface TagCreate {
  name: string;
  type?: TagType;
  color?: string | null;
  description?: string | null;
}

export interface TagUpdate {
  name?: string;
  type?: TagType;
  color?: string | null;
  description?: string | null;
}

export interface TagListResponse {
  total: number;
  tags: Tag[];
}

export interface TagStatsResponse {
  total: number;
  by_type: Record<TagType, number>;
  popular_tags: Tag[];
}

