"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export default function SettingsPage() {
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>通用设置</CardTitle>
          <CardDescription>管理你的账户设置和偏好。</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            更多设置功能即将推出...
          </p>
        </CardContent>
      </Card>
    </div>
  );
}

