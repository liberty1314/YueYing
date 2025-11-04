/**
 * AI 标签生成类型定义
 */

export interface TagInfo {
  id: number;
  name: string;
}

export interface GenerateTagsRequest {
  user_item_id: number;
  include_notes?: boolean;
  model?: string;
}

export interface GenerateTagsResponse {
  user_item_id: number;
  tags: TagInfo[];
  total: number;
}

export interface BatchGenerateTagsRequest {
  user_item_ids: number[];
  model?: string;
}

export interface BatchGenerateTagsResponse {
  results: GenerateTagsResponse[];
  total_processed: number;
  total_success: number;
  total_failed: number;
}

export interface RegenerateTagsRequest {
  user_item_id: number;
  feedback?: string;
  model?: string;
}

