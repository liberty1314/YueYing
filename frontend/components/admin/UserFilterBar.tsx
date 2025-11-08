"use client";

import { useState, useCallback } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Search, X, Grid3x3, List } from "lucide-react";
import type { UserFilters } from "@/types/admin";
import { useDebounce } from "@/hooks/use-debounce";

interface UserFilterBarProps {
  filters: UserFilters;
  onFiltersChange: (filters: Partial<UserFilters>) => void;
  viewMode: "table" | "card";
  onViewModeChange: (mode: "table" | "card") => void;
}

export function UserFilterBar({
  filters,
  onFiltersChange,
  viewMode,
  onViewModeChange,
}: UserFilterBarProps) {
  const [searchInput, setSearchInput] = useState(filters.search || "");

  // 搜索防抖
  const debouncedSearch = useDebounce((value: string) => {
    onFiltersChange({ search: value || undefined });
  }, 500);

  const handleSearchChange = (value: string) => {
    setSearchInput(value);
    debouncedSearch(value);
  };

  const handleRoleChange = (value: string) => {
    onFiltersChange({
      role: value === "all" ? undefined : (value as "user" | "admin"),
    });
  };

  const handleStatusChange = (value: string) => {
    onFiltersChange({
      is_active:
        value === "all" ? undefined : value === "active" ? true : false,
    });
  };

  const handleSortChange = (value: string) => {
    const [sortBy, sortOrder] = value.split(":");
    onFiltersChange({
      sort_by: sortBy,
      sort_desc: sortOrder === "desc",
    });
  };

  const handleReset = () => {
    setSearchInput("");
    onFiltersChange({
      search: undefined,
      role: undefined,
      is_active: undefined,
      sort_by: "created_at",
      sort_desc: true,
    });
  };

  const hasActiveFilters =
    filters.search || filters.role || filters.is_active !== undefined;

  const currentSort = `${filters.sort_by || "created_at"}:${
    filters.sort_desc ? "desc" : "asc"
  }`;

  return (
    <div className="space-y-4">
      {/* 第一行：搜索框 */}
      <div className="flex items-center gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="搜索邮箱、用户名、全名..."
            value={searchInput}
            onChange={(e) => handleSearchChange(e.target.value)}
            className="pl-10"
          />
        </div>
        <div className="flex items-center gap-2 border rounded-md p-1">
          <Button
            variant={viewMode === "table" ? "secondary" : "ghost"}
            size="icon"
            onClick={() => onViewModeChange("table")}
            title="表格视图"
            className="h-8 w-8"
          >
            <List className="h-4 w-4" />
          </Button>
          <Button
            variant={viewMode === "card" ? "secondary" : "ghost"}
            size="icon"
            onClick={() => onViewModeChange("card")}
            title="卡片视图"
            className="h-8 w-8"
          >
            <Grid3x3 className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* 第二行：筛选条件 */}
      <div className="flex items-center gap-4 flex-wrap">
        {/* 角色筛选 */}
        <Select
          value={filters.role || "all"}
          onValueChange={handleRoleChange}
        >
          <SelectTrigger className="w-[140px]">
            <SelectValue placeholder="选择角色" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">全部角色</SelectItem>
            <SelectItem value="user">普通用户</SelectItem>
            <SelectItem value="admin">管理员</SelectItem>
          </SelectContent>
        </Select>

        {/* 状态筛选 */}
        <Select
          value={
            filters.is_active === undefined
              ? "all"
              : filters.is_active
              ? "active"
              : "inactive"
          }
          onValueChange={handleStatusChange}
        >
          <SelectTrigger className="w-[140px]">
            <SelectValue placeholder="选择状态" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">全部状态</SelectItem>
            <SelectItem value="active">激活</SelectItem>
            <SelectItem value="inactive">禁用</SelectItem>
          </SelectContent>
        </Select>

        {/* 排序 */}
        <Select value={currentSort} onValueChange={handleSortChange}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="排序" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="created_at:desc">创建时间（新→旧）</SelectItem>
            <SelectItem value="created_at:asc">创建时间（旧→新）</SelectItem>
            <SelectItem value="updated_at:desc">更新时间（新→旧）</SelectItem>
            <SelectItem value="updated_at:asc">更新时间（旧→新）</SelectItem>
            <SelectItem value="email:asc">邮箱（A→Z）</SelectItem>
            <SelectItem value="email:desc">邮箱（Z→A）</SelectItem>
          </SelectContent>
        </Select>

        {/* 重置按钮 */}
        {hasActiveFilters && (
          <Button
            variant="ghost"
            size="sm"
            onClick={handleReset}
            className="gap-2"
          >
            <X className="h-4 w-4" />
            重置筛选
          </Button>
        )}
      </div>
    </div>
  );
}

