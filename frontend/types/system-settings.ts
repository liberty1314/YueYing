/**
 * 系统设置类型定义
 */

/**
 * 系统设置响应
 */
export interface SystemSettings {
  id: number;
  enable_explore: boolean;
  allow_user_ai_tag_settings: boolean;
  allow_anonymous_home_access: boolean;
}

/**
 * 系统设置更新请求
 */
export interface SystemSettingsUpdate {
  enable_explore?: boolean;
  allow_user_ai_tag_settings?: boolean;
  allow_anonymous_home_access?: boolean;
}

