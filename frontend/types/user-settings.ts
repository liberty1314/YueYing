/**
 * 用户设置类型定义
 */

export interface UserSettings {
  id: number;
  user_id: number;
  auto_generate_tags: boolean;
  created_at: string;
  updated_at: string;
}

export interface UserSettingsUpdate {
  auto_generate_tags?: boolean;
}

