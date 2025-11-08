"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { PageHeader } from "@/components/common/PageHeader";
import { UserFilterBar } from "@/components/admin/UserFilterBar";
import { UserTableView } from "@/components/admin/UserTableView";
import { UserCardView } from "@/components/admin/UserCardView";
import { UserDetailDialog } from "@/components/admin/UserDetailDialog";
import { EditUserDialog } from "@/components/admin/EditUserDialog";
import { ToggleStatusDialog } from "@/components/admin/ToggleStatusDialog";
import { DeleteUserDialog } from "@/components/admin/DeleteUserDialog";
import { CreateAdminDialog } from "@/components/admin/CreateAdminDialog";
import { Loading } from "@/components/ui/loading";
import { Empty } from "@/components/ui/empty";
import { UserPlus, AlertCircle } from "lucide-react";
import { adminApi } from "@/lib/admin-api";
import { useToast } from "@/hooks/use-toast";
import { useAuthStore } from "@/store/authStore";
import type { AdminUser, UserFilters } from "@/types/admin";

export default function UsersPage() {
  const { toast } = useToast();
  const { user: currentUser } = useAuthStore();

  // 状态
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [pageSize] = useState(20);
  const [isLoading, setIsLoading] = useState(true);
  const [viewMode, setViewMode] = useState<"table" | "card">("table");

  // 筛选条件
  const [filters, setFilters] = useState<UserFilters>({
    search: undefined,
    role: undefined,
    is_active: undefined,
    sort_by: "created_at",
    sort_desc: true,
  });

  // 对话框状态
  const [selectedUser, setSelectedUser] = useState<AdminUser | null>(null);
  const [detailDialogOpen, setDetailDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [toggleStatusDialogOpen, setToggleStatusDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [createAdminDialogOpen, setCreateAdminDialogOpen] = useState(false);

  // 加载用户列表
  const loadUsers = async () => {
    setIsLoading(true);
    try {
      const response = await adminApi.getUsers({
        page,
        page_size: pageSize,
        ...filters,
      });
      setUsers(response.users);
      setTotal(response.total);
    } catch (error: any) {
      console.error("加载用户列表失败:", error);
      toast({
        title: "加载失败",
        description: error.response?.data?.detail || "无法加载用户列表",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  // 监听筛选条件和分页变化
  useEffect(() => {
    loadUsers();
  }, [page, filters]);

  // 处理筛选条件变化
  const handleFiltersChange = (newFilters: Partial<UserFilters>) => {
    setFilters((prev) => ({ ...prev, ...newFilters }));
    setPage(1); // 重置到第一页
  };

  // 查看详情
  const handleViewDetail = (user: AdminUser) => {
    setSelectedUser(user);
    setDetailDialogOpen(true);
  };

  // 编辑用户
  const handleEdit = (user: AdminUser) => {
    setSelectedUser(user);
    setEditDialogOpen(true);
  };

  // 切换状态
  const handleToggleStatus = (user: AdminUser) => {
    setSelectedUser(user);
    setToggleStatusDialogOpen(true);
  };

  // 删除用户
  const handleDelete = (user: AdminUser) => {
    setSelectedUser(user);
    setDeleteDialogOpen(true);
  };

  // 创建管理员
  const handleCreateAdmin = () => {
    setCreateAdminDialogOpen(true);
  };

  // 判断是否为当前用户
  const isCurrentUser = (userId: number) => {
    return currentUser?.id && userId.toString() === currentUser.id;
  };

  // 上一页
  const handlePrevPage = () => {
    if (page > 1) {
      setPage(page - 1);
    }
  };

  // 下一页
  const handleNextPage = () => {
    const totalPages = Math.ceil(total / pageSize);
    if (page < totalPages) {
      setPage(page + 1);
    }
  };

  const totalPages = Math.ceil(total / pageSize);

  return (
    <div className="space-y-6">
      {/* 页面头部 */}
      <PageHeader
        title="用户管理"
        description="管理系统用户账号"
        action={
          <Button onClick={handleCreateAdmin} className="gap-2">
            <UserPlus className="h-4 w-4" />
            创建管理员
          </Button>
        }
      />

      {/* 筛选栏 */}
      <UserFilterBar
        filters={filters}
        onFiltersChange={handleFiltersChange}
        viewMode={viewMode}
        onViewModeChange={setViewMode}
      />

      {/* 用户列表 */}
      {isLoading ? (
        <Loading />
      ) : users.length === 0 ? (
        <Empty
          icon={<AlertCircle className="h-12 w-12" />}
          title="没有找到用户"
          description="尝试调整筛选条件"
        />
      ) : (
        <div className="space-y-4">
          {viewMode === "table" ? (
            <UserTableView
              users={users}
              currentUserId={currentUser?.id}
              onViewDetail={handleViewDetail}
              onEdit={handleEdit}
              onToggleStatus={handleToggleStatus}
              onDelete={handleDelete}
            />
          ) : (
            <UserCardView
              users={users}
              currentUserId={currentUser?.id}
              onViewDetail={handleViewDetail}
              onEdit={handleEdit}
              onToggleStatus={handleToggleStatus}
              onDelete={handleDelete}
            />
          )}

          {/* 分页 */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between">
              <div className="text-sm text-muted-foreground">
                共 {total} 个用户，第 {page} / {totalPages} 页
              </div>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handlePrevPage}
                  disabled={page === 1}
                >
                  上一页
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleNextPage}
                  disabled={page >= totalPages}
                >
                  下一页
                </Button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* 对话框 */}
      <UserDetailDialog
        user={selectedUser}
        open={detailDialogOpen}
        onOpenChange={setDetailDialogOpen}
        onEdit={handleEdit}
        onToggleStatus={handleToggleStatus}
        isCurrentUser={selectedUser ? isCurrentUser(selectedUser.id) : false}
      />

      <EditUserDialog
        user={selectedUser}
        open={editDialogOpen}
        onOpenChange={setEditDialogOpen}
        onSuccess={loadUsers}
        isCurrentUser={selectedUser ? isCurrentUser(selectedUser.id) : false}
      />

      <ToggleStatusDialog
        user={selectedUser}
        open={toggleStatusDialogOpen}
        onOpenChange={setToggleStatusDialogOpen}
        onSuccess={loadUsers}
        isCurrentUser={selectedUser ? isCurrentUser(selectedUser.id) : false}
      />

      <DeleteUserDialog
        user={selectedUser}
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        onSuccess={loadUsers}
        isCurrentUser={selectedUser ? isCurrentUser(selectedUser.id) : false}
      />

      <CreateAdminDialog
        open={createAdminDialogOpen}
        onOpenChange={setCreateAdminDialogOpen}
        onSuccess={loadUsers}
      />
    </div>
  );
}

