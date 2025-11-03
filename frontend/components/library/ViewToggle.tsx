"use client";

import { Button } from "@/components/ui/button";
import { Grid3x3, List } from "lucide-react";

interface ViewToggleProps {
  viewMode: "grid" | "list";
  onViewModeChange: (mode: "grid" | "list") => void;
}

export function ViewToggle({ viewMode, onViewModeChange }: ViewToggleProps) {
  return (
    <div className="flex gap-1 border rounded-md p-1">
      <Button
        variant={viewMode === "grid" ? "secondary" : "ghost"}
        size="icon"
        onClick={() => onViewModeChange("grid")}
        title="网格视图"
        className="h-8 w-8"
      >
        <Grid3x3 className="h-4 w-4" />
      </Button>
      <Button
        variant={viewMode === "list" ? "secondary" : "ghost"}
        size="icon"
        onClick={() => onViewModeChange("list")}
        title="列表视图"
        className="h-8 w-8"
      >
        <List className="h-4 w-4" />
      </Button>
    </div>
  );
}

