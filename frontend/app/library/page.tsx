"use client";

import { useState, useMemo } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { Container } from "@/components/common/Container";
import { FilterPanel } from "@/components/library/FilterPanel";
import { GridView } from "@/components/library/GridView";
import { ListView } from "@/components/library/ListView";
import { LibrarySkeleton } from "@/components/library/LibrarySkeleton";
import { SearchPagination } from "@/components/search/SearchPagination";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useUserItems, useDeleteUserItem } from "@/hooks/use-user-items";
import { useToast } from "@/hooks/use-toast";
import type { UserItemFilters } from "@/types/user-item";
import { Loader2, Search } from "lucide-react";
import { DeleteConfirmDialog } from "@/components/library/DeleteConfirmDialog";

export default function LibraryPage() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const { toast } = useToast();

    // 从 URL 读取参数并构建 filters（使用 useMemo 避免重复计算）
    const filters = useMemo<UserItemFilters>(() => ({
        status: searchParams.get("status") as any || undefined,
        content_type: searchParams.get("content_type") as any || undefined,
        search: searchParams.get("search") || undefined,
        sort_by: (searchParams.get("sort_by") || "status") as any,
        sort_order: (searchParams.get("sort_order") || "asc") as any,
        page: parseInt(searchParams.get("page") || "1", 10),
        page_size: 20,
        year_from: searchParams.get("year_from") ? parseInt(searchParams.get("year_from")!) : undefined,
        year_to: searchParams.get("year_to") ? parseInt(searchParams.get("year_to")!) : undefined,
    }), [searchParams]);

    const [searchInput, setSearchInput] = useState(filters.search || "");
    const [viewMode, setViewMode] = useState(searchParams.get("view") || "grid");

    // 使用 React Query 获取数据
    const { data, isLoading, error } = useUserItems(filters);
    const deleteMutation = useDeleteUserItem();

    // 删除确认对话框状态
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
    const [itemToDelete, setItemToDelete] = useState<{ id: number; title: string } | null>(null);

    // 更新 URL
    const updateURL = (newFilters: Partial<UserItemFilters>, newViewMode?: string) => {
        const params = new URLSearchParams();
        const mergedFilters = { ...filters, ...newFilters };

        if (mergedFilters.status) params.set("status", mergedFilters.status);
        if (mergedFilters.content_type) params.set("content_type", mergedFilters.content_type);
        if (mergedFilters.search) params.set("search", mergedFilters.search);
        if (mergedFilters.sort_by) params.set("sort_by", mergedFilters.sort_by);
        if (mergedFilters.sort_order) params.set("sort_order", mergedFilters.sort_order);
        if (mergedFilters.year_from) params.set("year_from", mergedFilters.year_from.toString());
        if (mergedFilters.year_to) params.set("year_to", mergedFilters.year_to.toString());
        if (mergedFilters.page && mergedFilters.page > 1) params.set("page", mergedFilters.page.toString());

        const currentViewMode = newViewMode || viewMode;
        if (currentViewMode && currentViewMode !== "grid") params.set("view", currentViewMode);

        router.push(`/library?${params.toString()}`, { scroll: false });
    };

    // 处理搜索
    const handleSearch = (value: string) => {
        setSearchInput(value);
        updateURL({ search: value || undefined, page: 1 });
    };

    // 处理筛选变化
    const handleFiltersChange = (newFilters: Partial<UserItemFilters>) => {
        updateURL({ ...newFilters, page: 1 });
    };

    // 处理排序变化
    const handleSortChange = (sortBy: string, sortOrder: string) => {
        updateURL({ sort_by: sortBy as any, sort_order: sortOrder as any, page: 1 });
    };

    // 处理页码变化
    const handlePageChange = (newPage: number) => {
        updateURL({ page: newPage });
        window.scrollTo({ top: 0, behavior: "smooth" });
    };

    // 处理视图模式变化
    const handleViewModeChange = (mode: "grid" | "list") => {
        setViewMode(mode);
        updateURL({}, mode);
    };

    // 打开删除确认对话框
    const openDeleteDialog = (id: number, title: string) => {
        setItemToDelete({ id, title });
        setDeleteDialogOpen(true);
    };

    // 处理删除
    const handleDeleteConfirm = async () => {
        if (!itemToDelete) return;

        deleteMutation.mutate(itemToDelete.id, {
            onSuccess: () => {
                toast({
                    title: "删除成功",
                    description: "记录已删除",
                });
                setDeleteDialogOpen(false);
                setItemToDelete(null);
            },
            onError: (err: any) => {
                toast({
                    title: "删除失败",
                    description: err.response?.data?.detail || "无法删除记录",
                    variant: "destructive",
                });
            },
        });
    };

    // 加载中显示骨架屏
    if (isLoading && !data) {
        return <LibrarySkeleton />;
    }

    return (
        <div className="min-h-[calc(100vh-64px)] bg-background">
            <Container className="py-8">
                {/* 状态筛选标签 */}
                <div className="mb-6">
                    <div className="flex items-center gap-2">
                        <Button
                            type="button"
                            variant={!filters.status ? "default" : "ghost"}
                            size="lg"
                            onClick={() => handleFiltersChange({ status: undefined })}
                            className="h-10 px-6 text-base font-semibold"
                        >
                            全部
                        </Button>
                        <Button
                            type="button"
                            variant={filters.status === "watching" ? "default" : "ghost"}
                            size="lg"
                            onClick={() => handleFiltersChange({ status: "watching" })}
                            className="h-10 px-6 text-base font-semibold"
                        >
                            在看
                        </Button>
                        <Button
                            type="button"
                            variant={filters.status === "want_to_watch" ? "default" : "ghost"}
                            size="lg"
                            onClick={() => handleFiltersChange({ status: "want_to_watch" })}
                            className="h-10 px-6 text-base font-semibold"
                        >
                            想看
                        </Button>
                        <Button
                            type="button"
                            variant={filters.status === "watched" ? "default" : "ghost"}
                            size="lg"
                            onClick={() => handleFiltersChange({ status: "watched" })}
                            className="h-10 px-6 text-base font-semibold"
                        >
                            看过
                        </Button>
                    </div>
                </div>

                {/* 工具栏 */}
                <div className="flex flex-col gap-4 mb-6">
                    {/* 第一行：记录数（左）和搜索框（右） */}
                    <div className="flex items-center justify-between gap-4">
                        {/* 记录条数 */}
                        <p className="text-muted-foreground">
                            {data ? `共 ${data.total} 条记录` : "加载中..."}
                        </p>

                        {/* 搜索框（1/4宽度） */}
                        <div className="relative w-full md:w-1/4">
                            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                            <Input
                                type="text"
                                placeholder="搜索标题..."
                                value={searchInput}
                                onChange={(e) => handleSearch(e.target.value)}
                                className="pl-9"
                            />
                        </div>
                    </div>

                    {/* 第二行和第三行：筛选按钮+排序+视图 / 展开的筛选面板 */}
                    <FilterPanel
                        filters={filters}
                        onFiltersChange={handleFiltersChange}
                        sortBy={(filters.sort_by || "status") as any}
                        sortOrder={(filters.sort_order || "asc") as any}
                        onSortChange={handleSortChange}
                        viewMode={viewMode as "grid" | "list"}
                        onViewModeChange={handleViewModeChange}
                    />
                </div>

                {/* 错误状态 */}
                {error && !data && (
                    <div className="text-center py-20">
                        <p className="text-destructive mb-4">加载失败</p>
                        <button
                            onClick={() => router.refresh()}
                            className="text-primary hover:underline"
                        >
                            重试
                        </button>
                    </div>
                )}

                {/* 数据展示 */}
                {data && (
                    <div className="relative">
                        {/* 加载遮罩 */}
                        {isLoading && (
                            <div className="absolute inset-0 bg-background/50 backdrop-blur-sm z-10 flex items-start justify-center pt-20">
                                <div className="bg-background rounded-lg p-4 shadow-lg">
                                    <Loader2 className="h-6 w-6 animate-spin text-primary" />
                                </div>
                            </div>
                        )}

                        {data.items.length === 0 ? (
                            <div className="text-center py-20">
                                <p className="text-muted-foreground mb-4">
                                    还没有记录，快去添加吧！
                                </p>
                                <button
                                    onClick={() => router.push("/discover")}
                                    className="text-primary hover:underline"
                                >
                                    去探索
                                </button>
                            </div>
                        ) : (
                            <>
                                {/* 网格或列表视图 */}
                                {viewMode === "grid" ? (
                                    <GridView items={data.items} onDelete={openDeleteDialog} />
                                ) : (
                                    <ListView items={data.items} onDelete={openDeleteDialog} />
                                )}

                                {/* 分页 */}
                                {data.total_pages > 1 && (
                                    <div className="mt-8">
                                        <SearchPagination
                                            currentPage={data.page}
                                            totalPages={data.total_pages}
                                            onPageChange={handlePageChange}
                                        />
                                    </div>
                                )}
                            </>
                        )}
                    </div>
                )}
            </Container>

            {/* 删除确认对话框 */}
            <DeleteConfirmDialog
                open={deleteDialogOpen}
                onOpenChange={setDeleteDialogOpen}
                onConfirm={handleDeleteConfirm}
                title={itemToDelete?.title || "此记录"}
            />
        </div>
    );
}
