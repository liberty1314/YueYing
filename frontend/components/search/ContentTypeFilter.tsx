"use client";

import { Film, Tv, Book, Sparkles, Grid3x3 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { ContentType } from "@/app/explore/page";

interface ContentTypeFilterProps {
  selectedType: ContentType;
  onTypeChange: (type: ContentType) => void;
  className?: string;
}

const contentTypes: {
  value: ContentType;
  label: string;
  icon: React.ReactNode;
  color: string;
}[] = [
  {
    value: "all",
    label: "全部",
    icon: <Grid3x3 className="h-4 w-4" />,
    color: "text-gray-600 dark:text-gray-400",
  },
  {
    value: "movie",
    label: "电影",
    icon: <Film className="h-4 w-4" />,
    color: "text-red-600 dark:text-red-400",
  },
  {
    value: "tv",
    label: "剧集",
    icon: <Tv className="h-4 w-4" />,
    color: "text-blue-600 dark:text-blue-400",
  },
  {
    value: "anime",
    label: "动漫",
    icon: <Sparkles className="h-4 w-4" />,
    color: "text-pink-600 dark:text-pink-400",
  },
  {
    value: "book",
    label: "书籍",
    icon: <Book className="h-4 w-4" />,
    color: "text-green-600 dark:text-green-400",
  },
];

export function ContentTypeFilter({
  selectedType,
  onTypeChange,
  className,
}: ContentTypeFilterProps) {
  return (
    <div
      className={cn(
        "flex flex-wrap items-center gap-2",
        className
      )}
    >
      {contentTypes.map((type) => {
        const isSelected = selectedType === type.value;

        return (
          <Button
            key={type.value}
            variant={isSelected ? "default" : "outline"}
            size="sm"
            onClick={() => onTypeChange(type.value)}
            className={cn(
              "gap-2 transition-all",
              !isSelected && "hover:scale-105",
              !isSelected && type.color
            )}
          >
            {type.icon}
            <span>{type.label}</span>
          </Button>
        );
      })}
    </div>
  );
}

