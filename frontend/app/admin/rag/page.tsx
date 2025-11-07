"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { api } from "@/lib/api";
import { Loader2, RefreshCw, Database, Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

interface VectorStoreStats {
  total_items: number;
  collection_name: string;
  embedding_dimension: number;
}

interface SearchResult {
  user_item_id: number;
  similarity: number;
  item: {
    title: string;
    content_type: string;
  };
}

export default function RAGAdminPage() {
  const { toast } = useToast();
  const [stats, setStats] = useState<VectorStoreStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isRebuilding, setIsRebuilding] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const [showRebuildDialog, setShowRebuildDialog] = useState(false);

  const loadStats = async () => {
    setIsLoading(true);
    try {
      const response = await api.get<VectorStoreStats>("/rag/stats", {
        timeout: 60000, // 增加超时时间到60秒
      });
      setStats(response.data);
    } catch (err: any) {
      console.error("Failed to load RAG stats:", err);
      const errorMsg = err.code === 'ECONNABORTED' 
        ? "请求超时，这可能是首次加载需要下载模型文件。请稍后再试。"
        : err.response?.data?.detail || "无法加载向量存储统计信息";
      toast({
        title: "加载失败",
        description: errorMsg,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadStats();
  }, []);

  const handleRebuildIndex = async () => {
    setIsRebuilding(true);
    setShowRebuildDialog(false);
    
    try {
      const response = await api.post("/rag/rebuild-index", {});
      toast({
        title: "重建成功",
        description: `成功: ${response.data.success_count}, 失败: ${response.data.error_count}`,
      });
      loadStats();
    } catch (err: any) {
      console.error("Failed to rebuild index:", err);
      toast({
        title: "重建失败",
        description: err.response?.data?.detail || "重建索引失败",
        variant: "destructive",
      });
    } finally {
      setIsRebuilding(false);
    }
  };

  const handleSearch = async () => {
    if (!searchQuery.trim()) {
      toast({
        title: "请输入搜索关键词",
        variant: "destructive",
      });
      return;
    }

    setIsSearching(true);
    try {
      const response = await api.post<SearchResult[]>("/rag/search", {
        query: searchQuery,
        limit: 10,
      });
      setSearchResults(response.data);
      toast({
        title: "搜索完成",
        description: `找到 ${response.data.length} 条相关记录`,
      });
    } catch (err: any) {
      console.error("Failed to search:", err);
      toast({
        title: "搜索失败",
        description: err.response?.data?.detail || "搜索失败",
        variant: "destructive",
      });
    } finally {
      setIsSearching(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">RAG 系统管理</h1>
        <p className="text-muted-foreground mt-2">
          管理向量数据库和检索增强生成系统
        </p>
      </div>

      {/* 统计信息 */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Database className="h-5 w-5" />
            向量存储统计
          </CardTitle>
          <CardDescription>当前向量数据库的统计信息</CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
          ) : stats ? (
            <div className="space-y-4">
              <div className="grid gap-4 md:grid-cols-3">
                <div className="flex flex-col space-y-1">
                  <span className="text-sm text-muted-foreground">总记录数</span>
                  <span className="text-2xl font-bold">{stats.total_items}</span>
                </div>
                <div className="flex flex-col space-y-1">
                  <span className="text-sm text-muted-foreground">Collection名称</span>
                  <span className="text-lg font-medium">{stats.collection_name}</span>
                </div>
                <div className="flex flex-col space-y-1">
                  <span className="text-sm text-muted-foreground">向量维度</span>
                  <span className="text-lg font-medium">{stats.embedding_dimension}</span>
                </div>
              </div>

              <div className="flex gap-4 pt-4">
                <Button onClick={loadStats} variant="outline" size="sm">
                  <RefreshCw className="mr-2 h-4 w-4" />
                  刷新统计
                </Button>
                <Button
                  onClick={() => setShowRebuildDialog(true)}
                  variant="destructive"
                  size="sm"
                  disabled={isRebuilding}
                >
                  {isRebuilding ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      重建中...
                    </>
                  ) : (
                    <>
                      <Database className="mr-2 h-4 w-4" />
                      重建索引
                    </>
                  )}
                </Button>
              </div>
            </div>
          ) : (
            <p className="text-muted-foreground">无法加载统计信息</p>
          )}
        </CardContent>
      </Card>

      {/* 语义搜索测试 */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Search className="h-5 w-5" />
            语义搜索测试
          </CardTitle>
          <CardDescription>测试向量搜索功能</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex gap-2">
              <div className="flex-1">
                <Label htmlFor="search-query">搜索关键词</Label>
                <Input
                  id="search-query"
                  placeholder="例如：科幻电影"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onKeyPress={(e) => e.key === "Enter" && handleSearch()}
                />
              </div>
              <div className="flex items-end">
                <Button onClick={handleSearch} disabled={isSearching}>
                  {isSearching ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      搜索中...
                    </>
                  ) : (
                    <>
                      <Search className="mr-2 h-4 w-4" />
                      搜索
                    </>
                  )}
                </Button>
              </div>
            </div>

            {/* 搜索结果 */}
            {searchResults.length > 0 && (
              <div className="space-y-2 mt-4">
                <h3 className="font-semibold">搜索结果 ({searchResults.length})</h3>
                <div className="space-y-2">
                  {searchResults.map((result) => (
                    <div
                      key={result.user_item_id}
                      className="border rounded-lg p-3 space-y-1"
                    >
                      <div className="flex items-start justify-between">
                        <div>
                          <p className="font-medium">{result.item.title}</p>
                          <p className="text-sm text-muted-foreground">
                            {result.item.content_type}
                          </p>
                        </div>
                        <span className="text-sm font-mono bg-muted px-2 py-1 rounded">
                          {(result.similarity * 100).toFixed(1)}%
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* 重建索引确认对话框 */}
      <AlertDialog open={showRebuildDialog} onOpenChange={setShowRebuildDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>确认重建向量索引</AlertDialogTitle>
            <AlertDialogDescription>
              确定要重建向量索引吗？此操作会花费一些时间。
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>取消</AlertDialogCancel>
            <AlertDialogAction 
              onClick={handleRebuildIndex}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              确定
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

