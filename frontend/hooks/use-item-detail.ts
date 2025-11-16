/**
 * 用户记录详情页面的数据管理 Hook
 */

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { userItemsApi } from "@/lib/user-items-api";
import { tagsApi } from "@/lib/tags-api";
import { useToast } from "@/hooks/use-toast";
import type { UserItem } from "@/types/user-item";
import type { Tag } from "@/types/tag";

export function useItemDetail(id: string) {
    const router = useRouter();
    const { toast } = useToast();

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
            const itemTagsPromise = tagsApi
                .getUserItemTags(parseInt(id))
                .catch(() => []);

            const [allTags, tags] = await Promise.all([
                allTagsPromise,
                itemTagsPromise,
            ]);

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
    const handleAITagsGenerated = async () => {
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
                        (tag) => tag.name.toLowerCase() === tagName.toLowerCase()
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

    return {
        // 状态
        item,
        isLoading,
        isEditing,
        deleteDialogOpen,
        error,
        itemTags,
        availableTags,
        isLoadingTags,

        // 状态设置函数
        setIsEditing,
        setDeleteDialogOpen,

        // 事件处理函数
        handleUpdate,
        handleDelete,
        handleAddTag,
        handleRemoveTag,
        handleCreateTag,
        handleAITagsGenerated,
    };
}
