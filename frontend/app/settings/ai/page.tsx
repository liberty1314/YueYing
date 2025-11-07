"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { userSettingsApi } from "@/lib/user-settings-api";
import { systemSettingsApi } from "@/lib/system-settings-api";
import type { UserSettings } from "@/types/user-settings";
import type { SystemSettings } from "@/types/system-settings";
import { Loader2, Save } from "lucide-react";

export default function AISettingsPage() {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [settings, setSettings] = useState<UserSettings | null>(null);
  const [systemSettings, setSystemSettings] = useState<SystemSettings | null>(null);
  const [autoGenerateTags, setAutoGenerateTags] = useState(false);

  // 加载设置
  const loadSettings = async () => {
    setIsLoading(true);
    try {
      // 并行加载用户设置和系统设置
      const [userData, systemData] = await Promise.all([
        userSettingsApi.getSettings(),
        systemSettingsApi.getSettings(),
      ]);
      setSettings(userData);
      setSystemSettings(systemData);
      setAutoGenerateTags(userData.auto_generate_tags);
    } catch (err: any) {
      console.error("Failed to load settings:", err);
      toast({
        title: "加载失败",
        description: err.response?.data?.detail || "无法加载设置",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadSettings();
  }, []);

  // 保存设置
  const handleSave = async () => {
    setIsSaving(true);
    try {
      const updated = await userSettingsApi.updateSettings({
        auto_generate_tags: autoGenerateTags,
      });
      setSettings(updated);
      toast({
        title: "保存成功",
        description: "AI 功能设置已更新。",
      });
    } catch (err: any) {
      console.error("Failed to save settings:", err);
      toast({
        title: "保存失败",
        description: err.response?.data?.detail || "无法保存设置",
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };

  // 检查是否有更改
  const hasChanges = settings ? autoGenerateTags !== settings.auto_generate_tags : false;

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  // 检查是否允许用户设置 AI 标签
  const allowUserAiTagSettings = systemSettings?.allow_user_ai_tag_settings ?? true;

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>AI 功能设置</CardTitle>
          <CardDescription>
            配置 AI 驱动的功能，如自动标签生成和智能推荐。
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* 自动生成标签开关 - 仅在系统允许时显示 */}
          {allowUserAiTagSettings && (
            <div className="flex items-center justify-between space-x-4">
              <div className="flex-1 space-y-1">
                <Label htmlFor="auto-generate-tags">创建记录时自动生成标签</Label>
                <p className="text-sm text-muted-foreground">
                  启用后，每次添加新记录时会自动使用 AI 生成相关标签。
                </p>
              </div>
              <Switch
                id="auto-generate-tags"
                checked={autoGenerateTags}
                onCheckedChange={setAutoGenerateTags}
                disabled={isSaving}
              />
            </div>
          )}

          {/* 如果没有可配置的设置，显示提示 */}
          {!allowUserAiTagSettings && (
            <div className="text-center py-8 text-muted-foreground">
              <p>暂无可配置的 AI 功能设置。</p>
            </div>
          )}

          {/* 保存按钮 - 仅在有可配置选项时显示 */}
          {allowUserAiTagSettings && (
            <div className="flex justify-end pt-4 border-t">
              <Button
                onClick={handleSave}
                disabled={!hasChanges || isSaving}
              >
                {isSaving ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    保存中...
                  </>
                ) : (
                  <>
                    <Save className="mr-2 h-4 w-4" />
                    保存设置
                  </>
                )}
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

