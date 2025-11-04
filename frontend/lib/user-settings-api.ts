/**
 * 用户设置 API 客户端
 */

import { api } from "./api";
import type { UserSettings, UserSettingsUpdate } from "@/types/user-settings";

export const userSettingsApi = {
  /**
   * 获取用户设置
   */
  async getSettings(): Promise<UserSettings> {
    const response = await api.get<UserSettings>("/settings");
    return response.data;
  },

  /**
   * 更新用户设置
   */
  async updateSettings(data: UserSettingsUpdate): Promise<UserSettings> {
    const response = await api.put<UserSettings>("/settings", data);
    return response.data;
  },
};

