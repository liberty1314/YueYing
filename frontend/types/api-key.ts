/**
 * API 密钥配置相关类型定义
 */

// API 服务类型
export type ApiKeyService = 'tmdb' | 'google_books' | 'bangumi';

// 测试状态
export type TestStatus = 'not_tested' | 'success' | 'failed';

// API 密钥配置
export interface ApiKeyConfig {
  service: string;
  api_key?: string | null;  // 完整密钥（仅在 reveal=true 时返回）
  api_key_preview: string | null;
  has_key: boolean;
  base_url: string | null;
  enabled: boolean;
  last_tested_at: string | null;
  test_status: TestStatus;
  test_message: string | null;
  description: string | null;
  created_at: string;
  updated_at: string;
}

// API 密钥配置列表响应
export interface ApiKeyListResponse {
  configs: ApiKeyConfig[];
}

// API 密钥更新数据
export interface ApiKeyUpdateData {
  api_key?: string;
  base_url?: string;
  enabled?: boolean;
  description?: string;
}

// API 连接测试结果
export interface ApiKeyTestResult {
  success: boolean;
  message: string;
  tested_at: string;
}

// 服务信息（用于UI展示）
export interface ServiceInfo {
  service: ApiKeyService;
  name: string;
  description: string;
  icon: string;
  baseUrlRequired: boolean;
  defaultBaseUrl: string;
}

