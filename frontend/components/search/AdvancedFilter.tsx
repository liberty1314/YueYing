"use client";

import { useState } from "react";
import { SlidersHorizontal, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";

export interface FilterOptions {
  yearFrom?: number;
  yearTo?: number;
}

interface AdvancedFilterProps {
  filters: FilterOptions;
  onFiltersChange: (filters: FilterOptions) => void;
  className?: string;
}

const currentYear = new Date().getFullYear();
const minYear = 1900;

export function AdvancedFilter({
  filters,
  onFiltersChange,
  className,
}: AdvancedFilterProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [localFilters, setLocalFilters] = useState<FilterOptions>(filters);

  const hasActiveFilters = filters.yearFrom || filters.yearTo;

  const activeFilterCount = [filters.yearFrom, filters.yearTo].filter(
    (v) => v !== undefined && v !== null
  ).length;

  const handleApply = () => {
    onFiltersChange(localFilters);
    setIsOpen(false);
  };

  const handleReset = () => {
    const emptyFilters: FilterOptions = {};
    setLocalFilters(emptyFilters);
    onFiltersChange(emptyFilters);
  };

  const handleYearFromChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value ? parseInt(e.target.value) : undefined;
    setLocalFilters((prev) => ({ ...prev, yearFrom: value }));
  };

  const handleYearToChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value ? parseInt(e.target.value) : undefined;
    setLocalFilters((prev) => ({ ...prev, yearTo: value }));
  };


  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button
          variant={hasActiveFilters ? "default" : "outline"}
          size="sm"
          className={cn("gap-2 relative", className)}
        >
          <SlidersHorizontal className="h-4 w-4" />
          <span>高级筛选</span>
          {activeFilterCount > 0 && (
            <Badge
              variant="secondary"
              className="ml-1 h-5 w-5 rounded-full p-0 flex items-center justify-center text-xs"
            >
              {activeFilterCount}
            </Badge>
          )}
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>高级筛选</DialogTitle>
          <DialogDescription>
            设置年份范围，精确找到你想要的内容
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* 年份范围 */}
          <div className="space-y-3">
            <Label className="text-base font-medium">年份范围</Label>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="yearFrom" className="text-sm text-muted-foreground">
                  从
                </Label>
                <input
                  id="yearFrom"
                  type="number"
                  min={minYear}
                  max={currentYear}
                  value={localFilters.yearFrom || ""}
                  onChange={handleYearFromChange}
                  placeholder="1900"
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="yearTo" className="text-sm text-muted-foreground">
                  到
                </Label>
                <input
                  id="yearTo"
                  type="number"
                  min={minYear}
                  max={currentYear}
                  value={localFilters.yearTo || ""}
                  onChange={handleYearToChange}
                  placeholder={currentYear.toString()}
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                />
              </div>
            </div>
          </div>

          {/* 当前筛选条件 */}
          {hasActiveFilters && (
            <div className="space-y-2 pt-2 border-t">
              <Label className="text-sm text-muted-foreground">当前筛选条件</Label>
              <div className="flex flex-wrap gap-2">
                {filters.yearFrom && (
                  <Badge variant="secondary">
                    年份 ≥ {filters.yearFrom}
                  </Badge>
                )}
                {filters.yearTo && (
                  <Badge variant="secondary">
                    年份 ≤ {filters.yearTo}
                  </Badge>
                )}
              </div>
            </div>
          )}
        </div>

        <div className="flex justify-between gap-3">
          <Button
            variant="outline"
            onClick={handleReset}
            className="flex-1"
          >
            <X className="mr-2 h-4 w-4" />
            重置
          </Button>
          <Button onClick={handleApply} className="flex-1">
            应用筛选
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

