"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Eye, Pencil, Power, Trash2 } from "lucide-react";
import { format } from "date-fns";
import { zhCN } from "date-fns/locale";
import type { AdminUser } from "@/types/admin";

interface UserTableViewProps {
  users: AdminUser[];
  currentUserId?: string;
  onViewDetail: (user: AdminUser) => void;
  onEdit: (user: AdminUser) => void;
  onToggleStatus: (user: AdminUser) => void;
  onDelete: (user: AdminUser) => void;
}

export function UserTableView({
  users,
  currentUserId,
  onViewDetail,
  onEdit,
  onToggleStatus,
  onDelete,
}: UserTableViewProps) {
  const formatDate = (dateStr: string) => {
    try {
      return format(new Date(dateStr), "yyyy-MM-dd HH:mm", { locale: zhCN });
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
    <div className="border rounded-lg overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full table-fixed">
          <colgroup>
            <col className="w-[25%]" />
            <col className="w-[25%]" />
            <col className="w-[10%] min-w-[120px]" />
            <col className="w-[10%] min-w-[100px]" />
            <col className="w-[15%] min-w-[140px]" />
            <col className="w-[15%] min-w-[180px]" />
          </colgroup>
          <thead className="bg-muted/50">
            <tr className="border-b">
              <th className="text-left p-4 font-medium">用户</th>
              <th className="text-left p-4 font-medium">邮箱</th>
              <th className="text-left p-4 font-medium">角色</th>
              <th className="text-left p-4 font-medium">状态</th>
              <th className="text-left p-4 font-medium">创建时间</th>
              <th className="text-right p-4 font-medium">操作</th>
            </tr>
          </thead>
          <tbody>
            {users.map((user) => (
              <tr
                key={user.id}
                className="border-b hover:bg-muted/30 transition-colors cursor-pointer"
                onClick={() => onViewDetail(user)}
              >
                <td className="p-4">
                  <div className="flex items-center gap-3 min-w-0">
                    <Avatar className="h-10 w-10 flex-shrink-0">
                      <AvatarImage src={user.avatar_url || undefined} />
                      <AvatarFallback>{getInitials(user)}</AvatarFallback>
                    </Avatar>
                    <div className="min-w-0 flex-1">
                      <div className="font-medium truncate">
                        {user.username || user.full_name || "未设置"}
                        {isCurrentUser(user.id) && (
                          <Badge variant="outline" className="ml-2 text-xs">
                            当前用户
                          </Badge>
                        )}
                      </div>
                      {user.full_name && user.username && (
                        <div className="text-sm text-muted-foreground truncate">
                          {user.full_name}
                        </div>
                      )}
                    </div>
                  </div>
                </td>
                <td className="p-4">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="truncate">{user.email}</span>
                    {user.is_verified && (
                      <Badge variant="secondary" className="text-xs flex-shrink-0 whitespace-nowrap">
                        已验证
                      </Badge>
                    )}
                  </div>
                </td>
                <td className="p-4">
                  <Badge
                    variant={user.role === "admin" ? "default" : "secondary"}
                    className="whitespace-nowrap"
                  >
                    {user.role === "admin" ? "管理员" : "普通用户"}
                  </Badge>
                </td>
                <td className="p-4">
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
                </td>
                <td className="p-4 text-sm text-muted-foreground whitespace-nowrap">
                  {formatDate(user.created_at)}
                </td>
                <td className="p-4">
                  <div
                    className="flex items-center justify-end gap-1 flex-shrink-0"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => onViewDetail(user)}
                      title="查看详情"
                    >
                      <Eye className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => onEdit(user)}
                      title="编辑"
                    >
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => onToggleStatus(user)}
                      disabled={isCurrentUser(user.id)}
                      title={user.is_active ? "禁用" : "激活"}
                    >
                      <Power className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => onDelete(user)}
                      disabled={isCurrentUser(user.id)}
                      title="删除"
                      className="text-destructive hover:text-destructive hover:bg-destructive/10"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

