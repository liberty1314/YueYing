/**
 * 用户记录详情页面 - 内容主体组件
 * 包含标题、元数据、简介、编辑表单和信息卡片
 */

import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { RatingBadge } from "@/components/common/RatingBadge";
import { EditForm } from "@/components/library/EditForm";
import { ItemDetailSections } from "./ItemDetailSections";
import type { UserItem } from "@/types/user-item";
import type { Tag } from "@/types/tag";
import { Film, Tv, Book, Gamepad2, Sparkles } from "lucide-react";

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

interface ItemDetailContentProps {
    item: UserItem;
    isEditing: boolean;
    itemTags: Tag[];
    availableTags: Tag[];
    isLoadingTags: boolean;
    onUpdate: (data: any) => Promise<void>;
    onCancelEdit: () => void;
    onAddTag: (tag: Tag) => void;
    onRemoveTag: (tagId: number) => void;
    onCreateTag: (tagName: string) => Promise<Tag>;
    onAITagsGenerated: (tags: Tag[]) => void;
}

export function ItemDetailContent({
    item,
    isEditing,
    itemTags,
    availableTags,
    isLoadingTags,
    onUpdate,
    onCancelEdit,
    onAddTag,
    onRemoveTag,
    onCreateTag,
    onAITagsGenerated,
}: ItemDetailContentProps) {
    const Icon = contentTypeIcons[item.content_type];

    return (
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
                            {item.year && (
                                <span className="text-sm text-muted-foreground">{item.year}</span>
                            )}
                            {item.rating && (
                                <RatingBadge
                                    rating={item.rating}
                                    type="user"
                                    size="lg"
                                    showLabel
                                />
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
                        <EditForm item={item} onSubmit={onUpdate} onCancel={onCancelEdit} />
                    </CardContent>
                </Card>
            ) : (
                <ItemDetailSections
                    item={item}
                    itemTags={itemTags}
                    availableTags={availableTags}
                    isLoadingTags={isLoadingTags}
                    onAddTag={onAddTag}
                    onRemoveTag={onRemoveTag}
                    onCreateTag={onCreateTag}
                    onAITagsGenerated={onAITagsGenerated}
                />
            )}
        </div>
    );
}
