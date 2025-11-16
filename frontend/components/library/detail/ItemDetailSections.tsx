/**
 * 用户记录详情页面 - 信息卡片组件
 * 包含进度、日期、笔记、标签、推荐、元数据等卡片
 */

import { Card, CardContent } from "@/components/ui/card";
import { Calendar } from "lucide-react";
import { TagInput } from "@/components/tags/TagInput";
import { AITagGenerator } from "@/components/tags/AITagGenerator";
import { SimilarItemsSection } from "@/components/recommendations/SimilarItemsSection";
import type { UserItem } from "@/types/user-item";
import type { Tag } from "@/types/tag";
import { format } from "date-fns";
import { zhCN } from "date-fns/locale";

interface ItemDetailSectionsProps {
    item: UserItem;
    itemTags: Tag[];
    availableTags: Tag[];
    isLoadingTags: boolean;
    onAddTag: (tag: Tag) => void;
    onRemoveTag: (tagId: number) => void;
    onCreateTag: (tagName: string) => Promise<Tag>;
    onAITagsGenerated: (tags: Tag[]) => void;
}

export function ItemDetailSections({
    item,
    itemTags,
    availableTags,
    isLoadingTags,
    onAddTag,
    onRemoveTag,
    onCreateTag,
    onAITagsGenerated,
}: ItemDetailSectionsProps) {
    const formatDate = (dateStr?: string) => {
        if (!dateStr) return null;
        try {
            return format(new Date(dateStr), "yyyy年M月d日", { locale: zhCN });
        } catch {
            return null;
        }
    };

    return (
        <>
            {/* 观看进度 - 仅在"在看"且为剧集类型时显示 */}
            {item.status === "watching" &&
                (item.content_type === "tv" || item.content_type === "anime") && (
                    <Card>
                        <CardContent className="p-6">
                            <h2 className="text-lg font-semibold mb-4">观看进度</h2>
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
                            userItemId={item.id}
                            onTagsGenerated={onAITagsGenerated}
                            disabled={isLoadingTags}
                        />
                    </div>
                    <TagInput
                        selectedTags={itemTags}
                        availableTags={availableTags}
                        onAddTag={onAddTag}
                        onRemoveTag={onRemoveTag}
                        onCreateTag={onCreateTag}
                        placeholder="搜索或创建标签..."
                    />
                </CardContent>
            </Card>

            {/* 相似推荐 */}
            {item.item_id && <SimilarItemsSection itemId={item.item_id} />}

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
    );
}
