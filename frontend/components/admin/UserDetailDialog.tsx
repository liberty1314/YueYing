"use client";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { Mail, User, Calendar, Clock, Shield, CheckCircle } from "lucide-react";
import { format } from "date-fns";
import { zhCN } from "date-fns/locale";
import type { AdminUser } from "@/types/admin";

interface UserDetailDialogProps {
  user: AdminUser | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onEdit: (user: AdminUser) => void;
  onToggleStatus: (user: AdminUser) => void;
  isCurrentUser: boolean;
}

export function UserDetailDialog({
  user,
  open,
  onOpenChange,
  onEdit,
  onToggleStatus,
  isCurrentUser,
}: UserDetailDialogProps) {
  if (!user) return null;

  const formatDate = (dateStr: string) => {
    try {
      return format(new Date(dateStr), "yyyy-MM-dd HH:mm:ss", {
        locale: zhCN,
      });
    } catch {
      return dateStr;
    }
  };

  const getInitials = (user: AdminUser) => {
    if (user.username) {
      return user.username.slice(0, 2).toUpperCase();
    }
    return user.email.slice(0, 2).toUpperCase();
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>用户详情</DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* 头像和基本信息 */}
          <div className="flex items-center gap-4">
            <Avatar className="h-20 w-20">
              <AvatarImage src={user.avatar_url || undefined} />
              <AvatarFallback className="text-xl">
                {getInitials(user)}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-2">
                <h3 className="text-2xl font-semibold">
                  {user.username || user.full_name || "未设置"}
                </h3>
                {isCurrentUser && (
                  <Badge variant="outline">当前用户</Badge>
                )}
              </div>
              <div className="flex items-center gap-2">
                <Badge
                  variant={user.role === "admin" ? "default" : "secondary"}
                >
                  {user.role === "admin" ? "管理员" : "普通用户"}
                </Badge>
                <Badge
                  variant={user.is_active ? "default" : "destructive"}
                  className={
                    user.is_active ? "bg-green-500 hover:bg-green-600" : ""
                  }
                >
                  {user.is_active ? "激活" : "禁用"}
                </Badge>
                {user.is_verified && (
                  <Badge variant="outline" className="gap-1">
                    <CheckCircle className="h-3 w-3" />
                    已验证
                  </Badge>
                )}
              </div>
            </div>
          </div>

          <Separator />

          {/* 详细信息 */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* 邮箱 */}
            <div className="space-y-1">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Mail className="h-4 w-4" />
                <span>邮箱</span>
              </div>
              <p className="font-medium">{user.email}</p>
            </div>

            {/* 用户名 */}
            <div className="space-y-1">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <User className="h-4 w-4" />
                <span>用户名</span>
              </div>
              <p className="font-medium">{user.username || "未设置"}</p>
            </div>

            {/* 全名 */}
            <div className="space-y-1">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <User className="h-4 w-4" />
                <span>全名</span>
              </div>
              <p className="font-medium">{user.full_name || "未设置"}</p>
            </div>

            {/* 角色 */}
            <div className="space-y-1">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Shield className="h-4 w-4" />
                <span>角色</span>
              </div>
              <p className="font-medium">
                {user.role === "admin" ? "管理员" : "普通用户"}
              </p>
            </div>

            {/* 创建时间 */}
            <div className="space-y-1">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Calendar className="h-4 w-4" />
                <span>创建时间</span>
              </div>
              <p className="font-medium text-sm">
                {formatDate(user.created_at)}
              </p>
            </div>

            {/* 更新时间 */}
            <div className="space-y-1">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Clock className="h-4 w-4" />
                <span>更新时间</span>
              </div>
              <p className="font-medium text-sm">
                {formatDate(user.updated_at)}
              </p>
            </div>
          </div>

          {/* 用户ID */}
          <div className="space-y-1">
            <div className="text-sm text-muted-foreground">用户 ID</div>
            <p className="font-mono text-sm">{user.id}</p>
          </div>
        </div>

        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => {
              onOpenChange(false);
              onEdit(user);
            }}
          >
            编辑
          </Button>
          <Button
            variant={user.is_active ? "destructive" : "default"}
            onClick={() => {
              onOpenChange(false);
              onToggleStatus(user);
            }}
            disabled={isCurrentUser}
          >
            {user.is_active ? "禁用账号" : "激活账号"}
          </Button>
          <Button onClick={() => onOpenChange(false)}>关闭</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

