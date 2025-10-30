"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { Search, X, Clock } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

interface SearchBarProps {
  initialValue?: string;
  onSearch: (query: string) => void;
  placeholder?: string;
  className?: string;
  searchHistory?: string[];
  onRemoveHistory?: (query: string) => void;
  onClearHistory?: () => void;
  showHistory?: boolean;
}

export function SearchBar({
  initialValue = "",
  onSearch,
  placeholder = "搜索...",
  className,
  searchHistory = [],
  onRemoveHistory,
  onClearHistory,
  showHistory = false,
}: SearchBarProps) {
  const [value, setValue] = useState(initialValue);
  const [isFocused, setIsFocused] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  // 更新初始值
  useEffect(() => {
    setValue(initialValue);
  }, [initialValue]);

  const handleClear = useCallback(() => {
    setValue("");
    onSearch("");
  }, [onSearch]);

  // 快捷键支持
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // / 键聚焦搜索框
      if (e.key === "/" && !isFocused) {
        e.preventDefault();
        inputRef.current?.focus();
      }
      // Esc 键清空搜索
      if (e.key === "Escape" && isFocused) {
        e.preventDefault();
        handleClear();
        inputRef.current?.blur();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isFocused, handleClear]);

  const handleSubmit = useCallback(
    (e: React.FormEvent) => {
      e.preventDefault();
      if (value.trim()) {
        onSearch(value.trim());
        inputRef.current?.blur();
      }
    },
    [value, onSearch]
  );

  const handleHistoryClick = useCallback(
    (query: string) => {
      setValue(query);
      onSearch(query);
      setIsFocused(false);
      inputRef.current?.blur();
    },
    [onSearch]
  );

  const handleRemoveHistory = useCallback(
    (e: React.MouseEvent, query: string) => {
      e.stopPropagation();
      onRemoveHistory?.(query);
    },
    [onRemoveHistory]
  );

  const showHistoryDropdown =
    isFocused && showHistory && searchHistory.length > 0 && !value;

  return (
    <div className={cn("relative w-full max-w-2xl mx-auto", className)}>
      <form onSubmit={handleSubmit} className="relative">
        <div className="relative flex items-center gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground pointer-events-none" />
            <Input
              ref={inputRef}
              type="text"
              value={value}
              onChange={(e) => setValue(e.target.value)}
              onFocus={() => setIsFocused(true)}
              onBlur={() => setTimeout(() => setIsFocused(false), 200)}
              placeholder={placeholder}
              className="h-12 pl-10 pr-10 text-base rounded-full"
            />
            {value && (
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={handleClear}
                className="absolute right-2 top-1/2 -translate-y-1/2 h-8 w-8 p-0 rounded-full"
              >
                <X className="h-4 w-4" />
                <span className="sr-only">清除</span>
              </Button>
            )}
          </div>
          <Button
            type="submit"
            size="lg"
            className="h-12 px-6 rounded-full"
          >
            搜索
          </Button>
        </div>
      </form>

      {/* 搜索历史下拉列表 */}
      {showHistoryDropdown && (
        <div className="absolute top-full left-0 right-0 mt-2 bg-background border rounded-lg shadow-lg z-50 overflow-hidden">
          <div className="flex items-center justify-between px-4 py-3 border-b bg-muted/50">
            <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
              <Clock className="h-4 w-4" />
              <span>搜索历史</span>
            </div>
            {onClearHistory && (
              <Button
                variant="ghost"
                size="sm"
                onClick={onClearHistory}
                className="h-7 text-xs hover:text-destructive"
              >
                清空
              </Button>
            )}
          </div>
          <div className="p-4">
            <div className="flex flex-wrap gap-2">
              {searchHistory.map((query, index) => (
                <Badge
                  key={index}
                  variant="secondary"
                  className="group relative pl-3 pr-7 py-1.5 text-sm cursor-pointer hover:bg-secondary/80 transition-colors"
                  onClick={() => handleHistoryClick(query)}
                >
                  <span>{query}</span>
                  {onRemoveHistory && (
                    <button
                      onClick={(e) => handleRemoveHistory(e, query)}
                      className="absolute right-1 top-1/2 -translate-y-1/2 h-4 w-4 flex items-center justify-center rounded-full hover:bg-muted opacity-60 hover:opacity-100 transition-opacity"
                    >
                      <X className="h-3 w-3" />
                      <span className="sr-only">删除</span>
                    </button>
                  )}
                </Badge>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

