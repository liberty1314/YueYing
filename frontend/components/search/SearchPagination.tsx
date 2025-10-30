"use client";

import { ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface SearchPaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  className?: string;
  maxVisiblePages?: number;
}

export function SearchPagination({
  currentPage,
  totalPages,
  onPageChange,
  className,
  maxVisiblePages = 5,
}: SearchPaginationProps) {
  // 计算显示的页码范围
  const getPageNumbers = (): number[] => {
    if (totalPages <= maxVisiblePages) {
      return Array.from({ length: totalPages }, (_, i) => i + 1);
    }

    const half = Math.floor(maxVisiblePages / 2);
    let start = Math.max(currentPage - half, 1);
    let end = Math.min(start + maxVisiblePages - 1, totalPages);

    if (end - start + 1 < maxVisiblePages) {
      start = Math.max(end - maxVisiblePages + 1, 1);
    }

    return Array.from({ length: end - start + 1 }, (_, i) => start + i);
  };

  const pageNumbers = getPageNumbers();
  const showFirstPage = pageNumbers[0] > 1;
  const showLastPage = pageNumbers[pageNumbers.length - 1] < totalPages;

  return (
    <div
      className={cn(
        "flex items-center justify-center gap-2 flex-wrap",
        className
      )}
    >
      {/* 第一页 */}
      <Button
        variant="outline"
        size="icon"
        onClick={() => onPageChange(1)}
        disabled={currentPage === 1}
        className="hidden sm:inline-flex"
      >
        <ChevronsLeft className="h-4 w-4" />
        <span className="sr-only">第一页</span>
      </Button>

      {/* 上一页 */}
      <Button
        variant="outline"
        size="icon"
        onClick={() => onPageChange(currentPage - 1)}
        disabled={currentPage === 1}
      >
        <ChevronLeft className="h-4 w-4" />
        <span className="sr-only">上一页</span>
      </Button>

      {/* 第一页省略号 */}
      {showFirstPage && (
        <>
          <Button
            variant="outline"
            size="icon"
            onClick={() => onPageChange(1)}
            className="hidden sm:inline-flex"
          >
            1
          </Button>
          {pageNumbers[0] > 2 && (
            <span className="px-2 text-muted-foreground hidden sm:inline">...</span>
          )}
        </>
      )}

      {/* 页码按钮 */}
      {pageNumbers.map((page) => (
        <Button
          key={page}
          variant={currentPage === page ? "default" : "outline"}
          size="icon"
          onClick={() => onPageChange(page)}
          className={cn(
            currentPage === page && "pointer-events-none"
          )}
        >
          {page}
        </Button>
      ))}

      {/* 最后一页省略号 */}
      {showLastPage && (
        <>
          {pageNumbers[pageNumbers.length - 1] < totalPages - 1 && (
            <span className="px-2 text-muted-foreground hidden sm:inline">...</span>
          )}
          <Button
            variant="outline"
            size="icon"
            onClick={() => onPageChange(totalPages)}
            className="hidden sm:inline-flex"
          >
            {totalPages}
          </Button>
        </>
      )}

      {/* 下一页 */}
      <Button
        variant="outline"
        size="icon"
        onClick={() => onPageChange(currentPage + 1)}
        disabled={currentPage === totalPages}
      >
        <ChevronRight className="h-4 w-4" />
        <span className="sr-only">下一页</span>
      </Button>

      {/* 最后一页 */}
      <Button
        variant="outline"
        size="icon"
        onClick={() => onPageChange(totalPages)}
        disabled={currentPage === totalPages}
        className="hidden sm:inline-flex"
      >
        <ChevronsRight className="h-4 w-4" />
        <span className="sr-only">最后一页</span>
      </Button>
    </div>
  );
}

