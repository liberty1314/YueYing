"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { systemSettingsApi } from "@/lib/system-settings-api";
import type { SystemSettings } from "@/types/system-settings";
import { Loader2, Save } from "lucide-react";

export default function SystemSettingsPage() {
  const { toast } = useToast();
  const [settings, setSettings] = useState<SystemSettings | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [enableExplore, setEnableExplore] = useState(false);

  // 加载系统设置
  useEffect(() => {
    const loadSettings = async () => {
      try {
        const data = await systemSettingsApi.getSettings();
        setSettings(data);
        setEnableExplore(data.enable_explore);
      } catch (err: any) {
        console.error("加载系统设置失败:", err);
        toast({
          title: "加载失败",
          description: err.response?.data?.detail || "无法加载系统设置",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };

    loadSettings();
  }, [toast]);

  // 保存设置
  const handleSave = async () => {
    setSaving(true);
    try {
      const updated = await systemSettingsApi.updateSettings({
        enable_explore: enableExplore,
      });
      setSettings(updated);
      toast({
        title: "保存成功",
        description: "系统设置已更新",
      });
    } catch (err: any) {
      console.error("保存系统设置失败:", err);
      toast({
        title: "保存失败",
        description: err.response?.data?.detail || "无法保存系统设置",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">系统设置</h1>
        <p className="text-muted-foreground">管理全局系统功能和配置</p>
      </div>

      {/* 功能开关 */}
      <Card>
        <CardHeader>
          <CardTitle>功能开关</CardTitle>
          <CardDescription>
            控制全站功能的启用或禁用
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* 探索/推荐功能 */}
          <div className="flex items-center justify-between space-x-4 rounded-lg border p-4">
            <div className="flex-1 space-y-1">
              <Label htmlFor="enable-explore" className="text-base font-semibold">
                探索/推荐功能
              </Label>
              <p className="text-sm text-muted-foreground">
                启用后，已登录用户可以访问探索页面并获取个性化推荐。
                禁用后，即使已登录用户也无法访问探索功能。
              </p>
            </div>
            <Switch
              id="enable-explore"
              checked={enableExplore}
              onCheckedChange={setEnableExplore}
            />
          </div>

          {/* 保存按钮 */}
          <div className="flex justify-end">
            <Button
              onClick={handleSave}
              disabled={saving}
              className="gap-2"
            >
              {saving ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  保存中...
                </>
              ) : (
                <>
                  <Save className="h-4 w-4" />
                  保存设置
                </>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

