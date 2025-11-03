"use client";

import { useState, useEffect } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { Container } from "@/components/common/Container";
import { FilterPanel } from "@/components/library/FilterPanel";
import { GridView } from "@/components/library/GridView";
import { ListView } from "@/components/library/ListView";
import { SearchPagination } from "@/components/search/SearchPagination";
import { Input } from "@/components/ui/input";
import { userItemsApi } from "@/lib/user-items-api";
import { useToast } from "@/hooks/use-toast";
import type { UserItemFilters, UserItemListResponse } from "@/types/user-item";
import { Loader2, Search } from "lucide-react";

export default function LibraryPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { toast } = useToast();

  // 从 URL 读取初始参数
  const initialStatus = searchParams.get("status") as any || undefined;
  const initialContentType = searchParams.get("content_type") as any || undefined;
  const initialSearchQuery = searchParams.get("search") || "";
  const initialSortBy = searchParams.get("sort_by") || "status";
  const initialSortOrder = searchParams.get("sort_order") || "asc";
  const initialPage = parseInt(searchParams.get("page") || "1", 10);
  const initialViewMode = searchParams.get("view") || "grid";
  const initialYearFrom = searchParams.get("year_from") ? parseInt(searchParams.get("year_from")!) : undefined;
  const initialYearTo = searchParams.get("year_to") ? parseInt(searchParams.get("year_to")!) : undefined;

  // 使用本地状态管理
  const [filters, setFilters] = useState<UserItemFilters>({
    status: initialStatus,
    content_type: initialContentType,
    search: initialSearchQuery || undefined,
    sort_by: initialSortBy as any,
    sort_order: initialSortOrder as any,
    page: initialPage,
    page_size: 20,
    year_from: initialYearFrom,
    year_to: initialYearTo,
  });
  
  const [searchInput, setSearchInput] = useState(initialSearchQuery);
  const [viewMode, setViewMode] = useState(initialViewMode);
  const [data, setData] = useState<UserItemListResponse | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // 加载数据
  const loadData = async (currentFilters: UserItemFilters) => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await userItemsApi.getUserItems(currentFilters);
      setData(response);
    } catch (err: any) {
      console.error("Failed to load user items:", err);
      setError(err.response?.data?.detail || "加载失败");
      toast({
        title: "加载失败",
        description: err.response?.data?.detail || "无法加载记录列表",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  // 更新 URL（使用 replace 避免历史记录堆积）
  const updateURL = (currentFilters: UserItemFilters, currentViewMode: string) => {
    const params = new URLSearchParams();
    
    if (currentFilters.status) params.set("status", currentFilters.status);
    if (currentFilters.content_type) params.set("content_type", currentFilters.content_type);
    if (currentFilters.search) params.set("search", currentFilters.search);
    if (currentFilters.sort_by) params.set("sort_by", currentFilters.sort_by);
    if (currentFilters.sort_order) params.set("sort_order", currentFilters.sort_order);
    if (currentFilters.year_from) params.set("year_from", currentFilters.year_from.toString());
    if (currentFilters.year_to) params.set("year_to", currentFilters.year_to.toString());
    if (currentFilters.page && currentFilters.page > 1) params.set("page", currentFilters.page.toString());
    if (currentViewMode && currentViewMode !== "grid") params.set("view", currentViewMode);

    const newUrl = `/library?${params.toString()}`;
    // 使用 replace 而不是 push，避免页面跳动
    router.replace(newUrl, { scroll: false });
  };

  // 初始加载
  useEffect(() => {
    loadData(filters);
  }, []);

  // 处理搜索（不立即更新URL，避免抖动）
  const handleSearch = (value: string) => {
    setSearchInput(value);
    const newFilters = {
      ...filters,
      search: value || undefined,
      page: 1,
    };
    setFilters(newFilters);
    loadData(newFilters);
    // 不立即更新URL，避免输入时的抖动
  };

  // 处理筛选变化（不立即更新URL，避免抖动）
  const handleFiltersChange = (newFilters: Partial<UserItemFilters>) => {
    const updatedFilters = {
      ...filters,
      ...newFilters,
      page: 1, // 筛选变化时重置到第一页
    };
    setFilters(updatedFilters);
    loadData(updatedFilters);
    // 不立即更新URL，等数据加载完成后再更新
  };

  // 处理排序变化（不立即更新URL，避免抖动）
  const handleSortChange = (sortBy: string, sortOrder: string) => {
    const updatedFilters = {
      ...filters,
      sort_by: sortBy as any,
      sort_order: sortOrder as any,
      page: 1,
    };
    setFilters(updatedFilters);
    loadData(updatedFilters);
    // 不立即更新URL，等数据加载完成后再更新
  };

  // 处理页码变化
  const handlePageChange = (newPage: number) => {
    const updatedFilters = {
      ...filters,
      page: newPage,
    };
    setFilters(updatedFilters);
    loadData(updatedFilters);
    updateURL(updatedFilters, viewMode);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  // 处理视图模式变化
  const handleViewModeChange = (mode: "grid" | "list") => {
    setViewMode(mode);
    updateURL(filters, mode);
  };

  // 处理删除
  const handleDelete = async (id: number) => {
    if (!confirm("确定要删除这条记录吗？")) return;

    try {
      await userItemsApi.deleteUserItem(id);
      toast({
        title: "删除成功",
        description: "记录已删除",
      });
      loadData(filters); // 重新加载数据
    } catch (err: any) {
      toast({
        title: "删除失败",
        description: err.response?.data?.detail || "无法删除记录",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="min-h-[calc(100vh-64px)] bg-background">
      <Container className="py-8">
        {/* 页面标题 */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold">我的记录</h1>
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
            <p className="text-destructive mb-4">{error}</p>
            <button
              onClick={() => loadData(filters)}
              className="text-primary hover:underline"
            >
              重试
            </button>
          </div>
        )}

        {/* 数据展示（保持内容可见，避免抖动） */}
        {data && (
          <div className="relative">
            {/* 加载遮罩 - 在数据上方显示半透明遮罩 */}
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
                  onClick={() => router.push("/explore")}
                  className="text-primary hover:underline"
                >
                  去探索
                </button>
              </div>
            ) : (
              <>
                {/* 网格或列表视图 */}
                {viewMode === "grid" ? (
                  <GridView items={data.items} onDelete={handleDelete} />
                ) : (
                  <ListView items={data.items} onDelete={handleDelete} />
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

        {/* 初始加载状态（只在没有数据时显示） */}
        {!data && isLoading && (
          <div className="flex justify-center items-center py-20">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        )}
      </Container>
    </div>
  );
}
