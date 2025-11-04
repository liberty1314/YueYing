"use client";

import { useState } from "react";
import { X, Plus, Tag as TagIcon } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import type { Tag } from "@/types/tag";
import { cn } from "@/lib/utils";

interface TagInputProps {
  selectedTags: Tag[];
  availableTags: Tag[];
  onAddTag: (tag: Tag) => void;
  onRemoveTag: (tagId: number) => void;
  onCreateTag: (tagName: string) => Promise<Tag>;
  placeholder?: string;
  className?: string;
}

export function TagInput({
  selectedTags,
  availableTags,
  onAddTag,
  onRemoveTag,
  onCreateTag,
  placeholder = "添加标签...",
  className,
}: TagInputProps) {
  const [open, setOpen] = useState(false);
  const [inputValue, setInputValue] = useState("");
  const [isCreating, setIsCreating] = useState(false);

  // 过滤出未选中的标签
  const unselectedTags = availableTags.filter(
    (tag) => !selectedTags.some((selected) => selected.id === tag.id)
  );

  // 根据输入值筛选标签
  const filteredTags = unselectedTags.filter((tag) =>
    tag.name.toLowerCase().includes(inputValue.toLowerCase())
  );

  const handleSelectTag = (tag: Tag) => {
    onAddTag(tag);
    setInputValue("");
    setOpen(false);
  };

  const handleCreateTag = async () => {
    if (!inputValue.trim()) return;

    setIsCreating(true);
    try {
      const newTag = await onCreateTag(inputValue.trim());
      onAddTag(newTag);
      setInputValue("");
      setOpen(false);
    } finally {
      setIsCreating(false);
    }
  };

  return (
    <div className={cn("space-y-2", className)}>
      {/* 已选标签 */}
      {selectedTags.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {selectedTags.map((tag) => (
            <Badge
              key={tag.id}
              variant="secondary"
              className="pr-1 gap-1"
              style={tag.color ? { backgroundColor: tag.color + "20", borderColor: tag.color } : undefined}
            >
              {tag.name}
              <button
                onClick={() => onRemoveTag(tag.id)}
                className="ml-1 rounded-full hover:bg-muted-foreground/20 p-0.5"
              >
                <X className="h-3 w-3" />
              </button>
            </Badge>
          ))}
        </div>
      )}

      {/* 添加标签按钮/输入框 */}
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button variant="outline" size="sm" className="h-8 border-dashed">
            <Plus className="mr-2 h-4 w-4" />
            添加标签
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-[300px] p-0" align="start">
          <div className="p-2">
            <Input
              placeholder={placeholder}
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              className="h-9"
            />
          </div>
          <div className="max-h-[300px] overflow-y-auto">
            {filteredTags.length === 0 ? (
              <div className="p-4">
                {inputValue.trim() ? (
                  <div className="text-center space-y-2">
                    <p className="text-sm text-muted-foreground">
                      未找到 "{inputValue}"
                    </p>
                    <Button
                      size="sm"
                      onClick={handleCreateTag}
                      disabled={isCreating}
                      className="w-full"
                    >
                      <Plus className="mr-2 h-4 w-4" />
                      创建新标签
                    </Button>
                  </div>
                ) : (
                  <p className="text-center text-sm text-muted-foreground">
                    输入标签名称
                  </p>
                )}
              </div>
            ) : (
              <div className="py-1">
                {filteredTags.map((tag) => (
                  <button
                    key={tag.id}
                    onClick={() => handleSelectTag(tag)}
                    className="w-full flex items-center gap-2 px-3 py-2 text-sm hover:bg-accent hover:text-accent-foreground cursor-pointer"
                  >
                    <TagIcon className="h-4 w-4" />
                    <span className="flex-1 text-left">{tag.name}</span>
                    {tag.usage_count && tag.usage_count > 0 && (
                      <span className="text-xs text-muted-foreground">
                        {tag.usage_count}
                      </span>
                    )}
                  </button>
                ))}
              </div>
            )}
          </div>
        </PopoverContent>
      </Popover>
    </div>
  );
}

