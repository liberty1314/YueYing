"use client";

import { useParams } from "next/navigation";
import { Container } from "@/components/common/Container";
import { Button } from "@/components/ui/button";
import { DeleteConfirmDialog } from "@/components/library/DeleteConfirmDialog";
import { ItemDetailHeader } from "@/components/library/detail/ItemDetailHeader";
import { ItemDetailSidebar } from "@/components/library/detail/ItemDetailSidebar";
import { ItemDetailContent } from "@/components/library/detail/ItemDetailContent";
import { useItemDetail } from "@/hooks/use-item-detail";
import { ArrowLeft, Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";

export default function ItemDetailPage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;

  const {
    item,
    isLoading,
    isEditing,
    deleteDialogOpen,
    error,
    itemTags,
    availableTags,
    isLoadingTags,
    setIsEditing,
    setDeleteDialogOpen,
    handleUpdate,
    handleDelete,
    handleAddTag,
    handleRemoveTag,
    handleCreateTag,
    handleAITagsGenerated,
  } = useItemDetail(id);

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

  return (
    <div className="min-h-[calc(100vh-64px)] bg-background">
      <ItemDetailHeader title={item.title} backdropUrl={item.backdrop_url} />

      <Container>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <ItemDetailSidebar
            title={item.title}
            posterUrl={item.poster_url}
            isEditing={isEditing}
            onEdit={() => setIsEditing(true)}
            onDelete={() => setDeleteDialogOpen(true)}
          />

          <ItemDetailContent
            item={item}
            isEditing={isEditing}
            itemTags={itemTags}
            availableTags={availableTags}
            isLoadingTags={isLoadingTags}
            onUpdate={handleUpdate}
            onCancelEdit={() => setIsEditing(false)}
            onAddTag={handleAddTag}
            onRemoveTag={handleRemoveTag}
            onCreateTag={handleCreateTag}
            onAITagsGenerated={handleAITagsGenerated}
          />
        </div>
      </Container>

      <DeleteConfirmDialog
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        onConfirm={handleDelete}
        title={item.title}
      />
    </div>
  );
}
