"use client";

import { useState } from "react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Loader2 } from "lucide-react";
import { adminApi } from "@/lib/admin-api";
import { useToast } from "@/hooks/use-toast";
import type { AdminUser } from "@/types/admin";

interface ToggleStatusDialogProps {
  user: AdminUser | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
  isCurrentUser: boolean;
}

export function ToggleStatusDialog({
  user,
  open,
  onOpenChange,
  onSuccess,
  isCurrentUser,
}: ToggleStatusDialogProps) {
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!user) return null;

  // 防止管理员禁用自己
  if (isCurrentUser) {
    return (
      <AlertDialog open={open} onOpenChange={onOpenChange}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>无法执行操作</AlertDialogTitle>
            <AlertDialogDescription>
              不能切换自己的账号状态
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>关闭</AlertDialogCancel>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    );
  }

  const handleConfirm = async () => {
    setIsSubmitting(true);
    try {
      await adminApi.toggleUserStatus(user.id);

      toast({
        title: "操作成功",
        description: `已${user.is_active ? "禁用" : "激活"}用户 ${
          user.username || user.email
        }`,
      });

      onOpenChange(false);
      onSuccess();
    } catch (error: any) {
      console.error("切换用户状态失败:", error);
      toast({
        title: "操作失败",
        description: error.response?.data?.detail || "无法切换用户状态",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const targetStatus = user.is_active ? "禁用" : "激活";
  const statusColor = user.is_active ? "text-destructive" : "text-green-600";

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>
            {targetStatus}用户账号
          </AlertDialogTitle>
          <AlertDialogDescription asChild>
            <div className="space-y-3">
              <p>
                确定要{targetStatus}用户{" "}
                <span className="font-semibold">
                  {user.username || user.email}
                </span>{" "}
                的账号吗？
              </p>
              <div className="rounded-lg bg-muted p-3 space-y-2">
                <p className="text-sm">
                  <span className="text-foreground font-medium">当前状态：</span>
                  <span className={user.is_active ? "text-green-600" : "text-destructive"}>
                    {user.is_active ? "激活" : "禁用"}
                  </span>
                </p>
                <p className="text-sm">
                  <span className="text-foreground font-medium">将变更为：</span>
                  <span className={statusColor}>
                    {targetStatus}
                  </span>
                </p>
              </div>
              {user.is_active && (
                <p className="text-sm text-destructive">
                  ⚠️ 禁用后，该用户将无法登录系统
                </p>
              )}
            </div>
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={isSubmitting}>取消</AlertDialogCancel>
          <AlertDialogAction
            onClick={(e) => {
              e.preventDefault();
              handleConfirm();
            }}
            disabled={isSubmitting}
            className={user.is_active ? "bg-destructive hover:bg-destructive/90" : ""}
          >
            {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            确认{targetStatus}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}

