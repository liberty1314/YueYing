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
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Loader2, AlertTriangle } from "lucide-react";
import { adminApi } from "@/lib/admin-api";
import { useToast } from "@/hooks/use-toast";
import type { AdminUser } from "@/types/admin";

interface DeleteUserDialogProps {
  user: AdminUser | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
  isCurrentUser: boolean;
}

export function DeleteUserDialog({
  user,
  open,
  onOpenChange,
  onSuccess,
  isCurrentUser,
}: DeleteUserDialogProps) {
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [hardDelete, setHardDelete] = useState(false);

  if (!user) return null;

  // 防止管理员删除自己
  if (isCurrentUser) {
    return (
      <AlertDialog open={open} onOpenChange={onOpenChange}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>无法执行操作</AlertDialogTitle>
            <AlertDialogDescription>
              不能删除自己的账号
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
      await adminApi.deleteUser(user.id, hardDelete);

      toast({
        title: "删除成功",
        description: `已${hardDelete ? "永久删除" : "禁用"}用户 ${
          user.username || user.email
        }`,
      });

      onOpenChange(false);
      setHardDelete(false); // 重置选项
      onSuccess();
    } catch (error: any) {
      console.error("删除用户失败:", error);
      toast({
        title: "删除失败",
        description: error.response?.data?.detail || "无法删除用户",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-destructive" />
            删除用户
          </AlertDialogTitle>
          <AlertDialogDescription asChild>
            <div className="space-y-4">
              <p>
                确定要删除用户{" "}
                <span className="font-semibold text-foreground">
                  {user.username || user.email}
                </span>{" "}
                吗？
              </p>

              {/* 用户信息 */}
              <div className="rounded-lg bg-muted p-3 space-y-1 text-sm">
                <p>
                  <span className="font-medium text-foreground">邮箱：</span>
                  {user.email}
                </p>
                <p>
                  <span className="font-medium text-foreground">角色：</span>
                  {user.role === "admin" ? "管理员" : "普通用户"}
                </p>
                <p>
                  <span className="font-medium text-foreground">状态：</span>
                  {user.is_active ? "激活" : "禁用"}
                </p>
              </div>

              {/* 删除选项 */}
              <div className="flex items-center justify-between rounded-lg border p-4">
                <div className="space-y-0.5">
                  <Label htmlFor="hard-delete" className="text-base font-medium">
                    永久删除
                  </Label>
                  <p className="text-sm text-muted-foreground">
                    {hardDelete
                      ? "将从数据库中永久删除用户数据，此操作不可恢复"
                      : "将禁用用户账号，可以稍后重新激活"}
                  </p>
                </div>
                <Switch
                  id="hard-delete"
                  checked={hardDelete}
                  onCheckedChange={setHardDelete}
                  disabled={isSubmitting}
                />
              </div>

              {/* 警告信息 */}
              <div className="rounded-lg bg-destructive/10 border border-destructive/20 p-3">
                <p className="text-sm text-destructive font-medium flex items-start gap-2">
                  <AlertTriangle className="h-4 w-4 mt-0.5 flex-shrink-0" />
                  <span>
                    {hardDelete
                      ? "警告：永久删除操作不可恢复！用户的所有数据将被删除。"
                      : "软删除将禁用用户账号，用户将无法登录系统。"}
                  </span>
                </p>
              </div>
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
            className="bg-destructive hover:bg-destructive/90"
          >
            {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            确认删除
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}

