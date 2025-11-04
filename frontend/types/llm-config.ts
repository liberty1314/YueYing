/**
 * LLM 配置类型定义
 */

export type LLMProvider = "siliconflow" | "deepseek" | "openai" | "claude";

export interface LLMConfig {
  id: number;
  provider: LLMProvider;
  api_key: string | null;
  base_url: string | null;
  default_model: string | null;
  temperature: number;
  max_tokens: number | null;
  top_p: number;
  enabled: boolean;
  auto_tag_enabled: boolean;
  description: string | null;
  created_at: string;
  updated_at: string;
}

export interface LLMConfigCreatePayload {
  provider: LLMProvider;
  api_key?: string | null;
  base_url?: string | null;
  default_model?: string | null;
  temperature?: number;
  max_tokens?: number | null;
  top_p?: number;
  enabled?: boolean;
  auto_tag_enabled?: boolean;
  description?: string | null;
}

export interface LLMConfigUpdatePayload {
  provider?: LLMProvider;
  api_key?: string | null;
  base_url?: string | null;
  default_model?: string | null;
  temperature?: number;
  max_tokens?: number | null;
  top_p?: number;
  enabled?: boolean;
  auto_tag_enabled?: boolean;
  description?: string | null;
}

export interface LLMConfigTestRequest {
  provider: LLMProvider;
  api_key: string;
  base_url?: string | null;
  model?: string | null;
}

export interface LLMConfigTestResponse {
  success: boolean;
  message: string;
  latency?: number | null;
}

