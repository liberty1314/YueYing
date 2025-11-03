"use client";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { ArrowUp, ArrowDown } from "lucide-react";
import type { SortField, SortOrder } from "@/types/user-item";

interface SortSelectorProps {
  sortBy: SortField;
  sortOrder: SortOrder;
  onSortChange: (sortBy: SortField, sortOrder: SortOrder) => void;
}

const sortOptions: { value: SortField; label: string }[] = [
  { value: "status", label: "状态" },
  { value: "updated_at", label: "更新时间" },
  { value: "created_at", label: "添加时间" },
  { value: "rating", label: "评分" },
  { value: "started_at", label: "开始时间" },
  { value: "completed_at", label: "完成时间" },
  { value: "title", label: "标题" },
];

export function SortSelector({ sortBy, sortOrder, onSortChange }: SortSelectorProps) {
  const handleSortByChange = (value: string) => {
    onSortChange(value as SortField, sortOrder);
  };

  const handleToggleSortOrder = () => {
    onSortChange(sortBy, sortOrder === "asc" ? "desc" : "asc");
  };

  return (
    <div className="flex gap-2">
      <Select value={sortBy} onValueChange={handleSortByChange}>
        <SelectTrigger className="w-32">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          {sortOptions.map((option) => (
            <SelectItem key={option.value} value={option.value}>
              {option.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <Button
        variant="outline"
        size="icon"
        onClick={handleToggleSortOrder}
        title={sortOrder === "asc" ? "升序" : "降序"}
      >
        {sortOrder === "asc" ? (
          <ArrowUp className="h-4 w-4" />
        ) : (
          <ArrowDown className="h-4 w-4" />
        )}
      </Button>
    </div>
  );
}

