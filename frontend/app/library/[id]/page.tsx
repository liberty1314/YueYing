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
import { TagInput } from "@/components/tags/TagInput";
import { AITagGenerator } from "@/components/tags/AITagGenerator";
import { SimilarItemsSection } from "@/components/recommendations/SimilarItemsSection";
import { userItemsApi } from "@/lib/user-items-api";
import { tagsApi } from "@/lib/tags-api";
import { useToast } from "@/hooks/use-toast";
import type { UserItem } from "@/types/user-item";
import type { Tag } from "@/types/tag";
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
  
  // 标签相关状态
  const [itemTags, setItemTags] = useState<Tag[]>([]);
  const [availableTags, setAvailableTags] = useState<Tag[]>([]);
  const [isLoadingTags, setIsLoadingTags] = useState(false);

  // 加载数据
  const loadData = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const data = await userItemsApi.getUserItem(parseInt(id));
      setItem(data);
      
      // 加载标签
      await loadTags();
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

  // 加载标签
  const loadTags = async () => {
    setIsLoadingTags(true);
    try {
      // 分别加载，避免一个失败影响另一个
      const allTagsPromise = tagsApi.getTags({ limit: 100 });
      const itemTagsPromise = tagsApi.getUserItemTags(parseInt(id)).catch(() => []);
      
      const [allTags, tags] = await Promise.all([allTagsPromise, itemTagsPromise]);
      
      setAvailableTags(allTags.tags);
      setItemTags(tags);
    } catch (err) {
      console.error("Failed to load tags:", err);
      // 至少尝试加载可用标签
      try {
        const allTags = await tagsApi.getTags({ limit: 100 });
        setAvailableTags(allTags.tags);
      } catch (e) {
        console.error("Failed to load available tags:", e);
      }
    } finally {
      setIsLoadingTags(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [id]);

  // 处理更新
  const handleUpdate = async (data: any) => {
    try {
      const updated = await userItemsApi.updateUserItem(parseInt(id), data);
      console.log("Updated item:", updated); // Debug log
      console.log("Progress value:", updated.progress); // Debug log
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

  // 标签处理函数
  const handleAddTag = async (tag: Tag) => {
    try {
      await tagsApi.addTagsToUserItem(parseInt(id), [tag.id]);
      setItemTags([...itemTags, tag]);
      toast({
        title: "添加成功",
        description: `已添加标签 "${tag.name}"`,
      });
    } catch (err: any) {
      toast({
        title: "添加失败",
        description: err.response?.data?.detail || "无法添加标签",
        variant: "destructive",
      });
    }
  };

  // AI 标签生成处理
  const handleAITagsGenerated = async (newTags: Tag[]) => {
    // 重新加载标签以获取最新状态
    await loadTags();
  };

  const handleRemoveTag = async (tagId: number) => {
    try {
      await tagsApi.removeTagFromUserItem(parseInt(id), tagId);
      setItemTags(itemTags.filter((tag) => tag.id !== tagId));
      toast({
        title: "移除成功",
        description: "已移除标签",
      });
    } catch (err: any) {
      toast({
        title: "移除失败",
        description: err.response?.data?.detail || "无法移除标签",
        variant: "destructive",
      });
    }
  };

  const handleCreateTag = async (tagName: string): Promise<Tag> => {
    try {
      const newTag = await tagsApi.createTag({ name: tagName, type: "custom" });
      setAvailableTags([...availableTags, newTag]);
      toast({
        title: "创建成功",
        description: `已创建标签 "${tagName}"`,
      });
      return newTag;
    } catch (err: any) {
      // 如果是409冲突错误（标签已存在），尝试从列表中找到该标签
      if (err.response?.status === 409) {
        try {
          // 重新加载标签列表并直接获取
          const allTags = await tagsApi.getTags({ limit: 100 });
          setAvailableTags(allTags.tags);
          
          // 从新加载的列表中找到该标签
          const existingTag = allTags.tags.find(
            tag => tag.name.toLowerCase() === tagName.toLowerCase()
          );
          
          if (existingTag) {
            toast({
              title: "标签已存在",
              description: `标签 "${tagName}" 已存在，已为您选择`,
            });
            return existingTag;
          }
        } catch (loadErr) {
          console.error("Failed to reload tags:", loadErr);
        }
      }
      
      toast({
        title: "创建失败",
        description: err.response?.data?.detail || "无法创建标签",
        variant: "destructive",
      });
      throw err;
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
                {/* 观看进度 - 仅在"在看"且为剧集类型时显示 */}
                {item.status === "watching" && 
                 (item.content_type === "tv" || item.content_type === "anime") && (
                  <Card>
                    <CardContent className="p-6">
                      <h2 className="text-lg font-semibold mb-4">观看进度</h2>
                      {/* Debug info */}
                      {/* {process.env.NODE_ENV === "development" && (
                        <div className="text-xs text-muted-foreground mb-2">
                          Debug: progress={String(item.progress)}, type={typeof item.progress}
                        </div>
                      )} */}
                      {typeof item.progress === "number" && item.progress > 0 ? (
                        <div className="flex items-center gap-2">
                          <div className="text-3xl font-bold text-primary">
                            第 {item.progress} 集
                          </div>
                        </div>
                      ) : (
                        <div className="text-sm text-muted-foreground">
                          暂未记录观看进度，点击"编辑记录"可以添加当前观看集数
                        </div>
                      )}
                    </CardContent>
                  </Card>
                )}

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

                {/* 标签 */}
                <Card>
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between mb-4">
                      <h2 className="text-lg font-semibold">标签</h2>
                      <AITagGenerator
                        userItemId={parseInt(id)}
                        onTagsGenerated={handleAITagsGenerated}
                        disabled={isLoadingTags}
                      />
                    </div>
                    <TagInput
                      selectedTags={itemTags}
                      availableTags={availableTags}
                      onAddTag={handleAddTag}
                      onRemoveTag={handleRemoveTag}
                      onCreateTag={handleCreateTag}
                      placeholder="搜索或创建标签..."
                    />
                  </CardContent>
                </Card>

                {/* 相似推荐 */}
                {item.item_id && (
                  <SimilarItemsSection itemId={item.item_id} />
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

