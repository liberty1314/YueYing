"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Pencil, Power, Trash2, Mail, Calendar } from "lucide-react";
import { format } from "date-fns";
import { zhCN } from "date-fns/locale";
import type { AdminUser } from "@/types/admin";

interface UserCardViewProps {
  users: AdminUser[];
  currentUserId?: string;
  onViewDetail: (user: AdminUser) => void;
  onEdit: (user: AdminUser) => void;
  onToggleStatus: (user: AdminUser) => void;
  onDelete: (user: AdminUser) => void;
}

export function UserCardView({
  users,
  currentUserId,
  onViewDetail,
  onEdit,
  onToggleStatus,
  onDelete,
}: UserCardViewProps) {
  const formatDate = (dateStr: string) => {
    try {
      return format(new Date(dateStr), "yyyy-MM-dd", { locale: zhCN });
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

  const isCurrentUser = (userId: number) => {
    return currentUserId && userId.toString() === currentUserId;
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
      {users.map((user) => (
        <Card
          key={user.id}
          className={`transition-all cursor-pointer flex flex-col ${
            isCurrentUser(user.id)
              ? "shadow-[0_0_20px_rgba(249,115,22,0.4)] ring-2 ring-orange-500/60 bg-orange-50/30 dark:bg-orange-950/20"
              : "hover:shadow-md"
          }`}
          onClick={() => onViewDetail(user)}
        >
          <CardContent className="p-6 flex flex-col flex-1 min-h-[400px]">
            {/* 头像和基本信息 */}
            <div className="flex flex-col items-center text-center mb-4">
              <Avatar className="h-20 w-20 mb-3">
                <AvatarImage src={user.avatar_url || undefined} />
                <AvatarFallback className="text-lg">
                  {getInitials(user)}
                </AvatarFallback>
              </Avatar>
              <h3 className="font-semibold text-lg mb-1 min-h-[28px] flex items-center">
                {user.username || user.full_name || "未设置"}
              </h3>
              {user.full_name && user.username ? (
                <p className="text-sm text-muted-foreground mb-2 min-h-[20px]">
                  {user.full_name}
                </p>
              ) : (
                <div className="mb-2 min-h-[20px]" />
              )}
            </div>

            {/* 邮箱 */}
            <div className="flex items-center gap-2 mb-3 text-sm min-h-[36px]">
              <Mail className="h-4 w-4 text-muted-foreground flex-shrink-0" />
              <span className="truncate" title={user.email}>
                {user.email}
              </span>
            </div>

            {/* 角色和状态 */}
            <div className="flex items-center justify-center gap-2 mb-3 flex-wrap min-h-[32px]">
              <Badge
                variant={user.role === "admin" ? "default" : "secondary"}
                className="whitespace-nowrap"
              >
                {user.role === "admin" ? "管理员" : "普通用户"}
              </Badge>
              <Badge
                variant={user.is_active ? "default" : "destructive"}
                className={
                  user.is_active
                    ? "bg-green-500 hover:bg-green-600 whitespace-nowrap"
                    : "whitespace-nowrap"
                }
              >
                {user.is_active ? "激活" : "禁用"}
              </Badge>
              {user.is_verified && (
                <Badge variant="outline" className="text-xs whitespace-nowrap">
                  已验证
                </Badge>
              )}
            </div>

            {/* 创建时间 */}
            <div className="flex items-center justify-center gap-2 mb-4 text-xs text-muted-foreground min-h-[20px]">
              <Calendar className="h-3 w-3 flex-shrink-0" />
              <span className="whitespace-nowrap">
                创建于 {formatDate(user.created_at)}
              </span>
            </div>

            {/* 操作按钮 */}
            <div
              className="flex items-center justify-center gap-1 mt-auto"
              onClick={(e) => e.stopPropagation()}
            >
              <Button
                variant="outline"
                size="sm"
                onClick={() => onEdit(user)}
                title="编辑"
              >
                <Pencil className="h-3 w-3 mr-1" />
                编辑
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => onToggleStatus(user)}
                disabled={isCurrentUser(user.id)}
                title={user.is_active ? "禁用" : "激活"}
              >
                <Power className="h-3 w-3 mr-1" />
                {user.is_active ? "禁用" : "激活"}
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => onDelete(user)}
                disabled={isCurrentUser(user.id)}
                title="删除"
                className="text-destructive hover:text-destructive"
              >
                <Trash2 className="h-3 w-3" />
              </Button>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

