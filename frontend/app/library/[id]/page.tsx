"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { Container } from "@/components/common/Container";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { EditForm } from "@/components/library/EditForm";
import { DeleteConfirmDialog } from "@/components/library/DeleteConfirmDialog";
import { userItemsApi } from "@/lib/user-items-api";
import { useToast } from "@/hooks/use-toast";
import type { UserItem } from "@/types/user-item";
import {
  ArrowLeft,
  Pencil,
  Trash2,
  Star,
  Calendar,
  Film,
  Tv,
  Book,
  Gamepad2,
  Sparkles,
  Loader2,
} from "lucide-react";
import { format } from "date-fns";
import { zhCN } from "date-fns/locale";

const statusLabels = {
  want_to_watch: "想看",
  watching: "在看",
  watched: "看过",
};

const statusColors = {
  want_to_watch: "bg-blue-500",
  watching: "bg-yellow-500",
  watched: "bg-green-500",
};

const contentTypeLabels = {
  movie: "电影",
  tv: "剧集",
  anime: "动漫",
  book: "书籍",
  game: "游戏",
};

const contentTypeIcons = {
  movie: Film,
  tv: Tv,
  anime: Sparkles,
  book: Book,
  game: Gamepad2,
};

export default function ItemDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { toast } = useToast();
  const id = params.id as string;

  const [item, setItem] = useState<UserItem | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // 加载数据
  const loadData = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const data = await userItemsApi.getUserItem(parseInt(id));
      setItem(data);
    } catch (err: any) {
      console.error("Failed to load item:", err);
      setError(err.response?.data?.detail || "加载失败");
      toast({
        title: "加载失败",
        description: err.response?.data?.detail || "无法加载记录详情",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [id]);

  // 处理更新
  const handleUpdate = async (data: any) => {
    try {
      const updated = await userItemsApi.updateUserItem(parseInt(id), data);
      setItem(updated);
      setIsEditing(false);
      toast({
        title: "更新成功",
        description: "记录已更新",
      });
    } catch (err: any) {
      toast({
        title: "更新失败",
        description: err.response?.data?.detail || "无法更新记录",
        variant: "destructive",
      });
      throw err;
    }
  };

  // 处理删除
  const handleDelete = async () => {
    try {
      await userItemsApi.deleteUserItem(parseInt(id));
      toast({
        title: "删除成功",
        description: "记录已删除",
      });
      router.push("/library");
    } catch (err: any) {
      toast({
        title: "删除失败",
        description: err.response?.data?.detail || "无法删除记录",
        variant: "destructive",
      });
    }
  };

  const formatDate = (dateStr?: string) => {
    if (!dateStr) return null;
    try {
      return format(new Date(dateStr), "yyyy年M月d日", { locale: zhCN });
    } catch {
      return null;
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-[calc(100vh-64px)] bg-background flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (error || !item) {
    return (
      <div className="min-h-[calc(100vh-64px)] bg-background">
        <Container className="py-8">
          <div className="text-center">
            <p className="text-destructive mb-4">{error || "记录不存在"}</p>
            <Button onClick={() => router.push("/library")} variant="outline">
              <ArrowLeft className="mr-2 h-4 w-4" />
              返回列表
            </Button>
          </div>
        </Container>
      </div>
    );
  }

  const Icon = contentTypeIcons[item.content_type];
  const placeholderImage = "/placeholder-poster.png";
  const posterUrl = item.poster_url || placeholderImage;
  const backdropUrl = item.backdrop_url || placeholderImage;

  return (
    <div className="min-h-[calc(100vh-64px)] bg-background">
      {/* 背景图 */}
      {item.backdrop_url && (
        <div className="relative h-64 md:h-96 w-full">
          <Image
            src={backdropUrl}
            alt={item.title}
            fill
            className="object-cover"
            priority
          />
          <div className="absolute inset-0 bg-gradient-to-t from-background via-background/60 to-transparent" />
        </div>
      )}

      <Container className="py-8">
        {/* 返回按钮 */}
        <Button
          onClick={() => router.push("/library")}
          variant="ghost"
          className="mb-6"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          返回列表
        </Button>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* 左侧：封面和基本操作 */}
          <div className="lg:col-span-1">
            <Card>
              <CardContent className="p-6">
                {/* 封面 */}
                <div className="relative aspect-[2/3] w-full mb-6 rounded-lg overflow-hidden">
                  <Image
                    src={posterUrl}
                    alt={item.title}
                    fill
                    className="object-cover"
                  />
                </div>

                {/* 操作按钮 */}
                <div className="space-y-3">
                  {!isEditing && (
                    <Button onClick={() => setIsEditing(true)} className="w-full">
                      <Pencil className="mr-2 h-4 w-4" />
                      编辑记录
                    </Button>
                  )}
                  <Button
                    onClick={() => setDeleteDialogOpen(true)}
                    variant="destructive"
                    className="w-full"
                  >
                    <Trash2 className="mr-2 h-4 w-4" />
                    删除记录
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* 右侧：详细信息 */}
          <div className="lg:col-span-2 space-y-6">
            {/* 标题和元数据 */}
            <div>
              <div className="flex items-start gap-3 mb-4">
                <Icon className="h-6 w-6 mt-1 text-muted-foreground" />
                <div className="flex-1">
                  <h1 className="text-3xl font-bold mb-2">{item.title}</h1>
                  {item.original_title && item.original_title !== item.title && (
                    <p className="text-lg text-muted-foreground mb-3">
                      {item.original_title}
                    </p>
                  )}

                  <div className="flex flex-wrap items-center gap-3">
                    <Badge
                      variant="secondary"
                      className={`${statusColors[item.status]} text-white`}
                    >
                      {statusLabels[item.status]}
                    </Badge>
                    <Badge variant="outline">
                      {contentTypeLabels[item.content_type]}
                    </Badge>
                    {item.year && <span className="text-sm text-muted-foreground">{item.year}</span>}
                    {item.rating && (
                      <div className="flex items-center gap-1">
                        <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                        <span className="font-medium">{item.rating}/10</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* 简介 */}
              {item.description && (
                <>
                  <Separator className="my-4" />
                  <div>
                    <h2 className="text-lg font-semibold mb-2">简介</h2>
                    <p className="text-muted-foreground leading-relaxed">
                      {item.description}
                    </p>
                  </div>
                </>
              )}
            </div>

            {/* 编辑表单或查看模式 */}
            {isEditing ? (
              <Card>
                <CardContent className="p-6">
                  <h2 className="text-xl font-semibold mb-4">编辑记录</h2>
                  <EditForm
                    item={item}
                    onSubmit={handleUpdate}
                    onCancel={() => setIsEditing(false)}
                  />
                </CardContent>
              </Card>
            ) : (
              <>
                {/* 日期信息 */}
                {(item.started_at || item.completed_at) && (
                  <Card>
                    <CardContent className="p-6">
                      <h2 className="text-lg font-semibold mb-4">日期信息</h2>
                      <div className="space-y-3">
                        {item.started_at && (
                          <div className="flex items-center gap-2 text-sm">
                            <Calendar className="h-4 w-4 text-muted-foreground" />
                            <span className="text-muted-foreground">开始:</span>
                            <span>{formatDate(item.started_at)}</span>
                          </div>
                        )}
                        {item.completed_at && (
                          <div className="flex items-center gap-2 text-sm">
                            <Calendar className="h-4 w-4 text-muted-foreground" />
                            <span className="text-muted-foreground">完成:</span>
                            <span>{formatDate(item.completed_at)}</span>
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                )}

                {/* 笔记 */}
                {item.notes && (
                  <Card>
                    <CardContent className="p-6">
                      <h2 className="text-lg font-semibold mb-4">我的笔记</h2>
                      <p className="text-muted-foreground leading-relaxed whitespace-pre-wrap">
                        {item.notes}
                      </p>
                    </CardContent>
                  </Card>
                )}

                {/* 元数据 */}
                {item.metadata && Object.keys(item.metadata).length > 0 && (
                  <Card>
                    <CardContent className="p-6">
                      <h2 className="text-lg font-semibold mb-4">详细信息</h2>
                      <dl className="space-y-2 text-sm">
                        {item.metadata.director && (
                          <>
                            <dt className="text-muted-foreground">导演</dt>
                            <dd>{item.metadata.director}</dd>
                          </>
                        )}
                        {item.metadata.author && (
                          <>
                            <dt className="text-muted-foreground">作者</dt>
                            <dd>{item.metadata.author}</dd>
                          </>
                        )}
                        {item.metadata.cast && (
                          <>
                            <dt className="text-muted-foreground">演员</dt>
                            <dd>
                              {Array.isArray(item.metadata.cast)
                                ? item.metadata.cast
                                    .slice(0, 5)
                                    .map((actor: any) =>
                                      typeof actor === "string" ? actor : actor.name
                                    )
                                    .join(" / ")
                                : item.metadata.cast}
                            </dd>
                          </>
                        )}
                      </dl>
                    </CardContent>
                  </Card>
                )}
              </>
            )}
          </div>
        </div>
      </Container>

      {/* 删除确认对话框 */}
      <DeleteConfirmDialog
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        onConfirm={handleDelete}
        title={item.title}
      />
    </div>
  );
}

