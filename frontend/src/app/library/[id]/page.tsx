'use client';

import { useState, useEffect, KeyboardEvent } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { ArrowLeft, Edit2, Save, X, Trash2, Loader2, Star, Calendar, Tag as TagIcon, Plus, Sparkles, AlignLeft } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { userItemsApi, tagsApi } from '@/lib/api';
import type { UserItem, ItemStatus } from '@/types';
import type { Tag } from '@/lib/api/tags';
import ProtectedRoute from '@/components/shared/ProtectedRoute';
import DeleteConfirmDialog from '@/components/features/library/DeleteConfirmDialog';

const statusOptions: { value: ItemStatus; label: string }[] = [
    { value: 'want_to_watch', label: '想看' },
    { value: 'watching', label: '在看' },
    { value: 'watched', label: '看过' },
];

const statusColors = {
    want_to_watch: 'bg-blue-500/20 text-blue-600 dark:text-blue-300 border-blue-500/30',
    watching: 'bg-green-500/20 text-green-600 dark:text-green-300 border-green-500/30',
    watched: 'bg-gray-500/20 text-gray-600 dark:text-gray-300 border-gray-500/30',
};

export default function MediaDetailPage() {
    const router = useRouter();
    const params = useParams();
    const id = params?.id as string;

    const [item, setItem] = useState<UserItem | null>(null);
    const [tags, setTags] = useState<Tag[]>([]);
    const [tagsLoading, setTagsLoading] = useState(false);
    const [loading, setLoading] = useState(true);
    const [isEditing, setIsEditing] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);

    // 标签管理状态
    const [newTagInput, setNewTagInput] = useState('');
    const [isAddingTag, setIsAddingTag] = useState(false);
    const [isGeneratingTags, setIsGeneratingTags] = useState(false);

    const [editForm, setEditForm] = useState({
        title: '',
        status: 'want_to_watch' as ItemStatus,
        rating: 0,
        notes: '',
    });

    useEffect(() => {
        if (id) {
            fetchItem();
        }
    }, [id]);

    const fetchItem = async () => {
        try {
            setLoading(true);
            const data = await userItemsApi.getById(Number(id));
            setItem(data);
            setEditForm({
                title: data.title,
                status: data.status,
                rating: data.rating || 0,
                notes: data.notes || '',
            });
            // 获取标签
            fetchTags(data.id);
        } catch (err) {
            console.error('获取详情失败:', err);
        } finally {
            setLoading(false);
        }
    };

    const fetchTags = async (itemId: number) => {
        try {
            setTagsLoading(true);
            const tagData = await tagsApi.getUserItemTags(itemId);
            setTags(tagData);
        } catch (err) {
            console.error('获取标签失败:', err);
        } finally {
            setTagsLoading(false);
        }
    };

    const handleEdit = () => setIsEditing(true);

    const handleCancel = () => {
        if (item) {
            setEditForm({
                title: item.title,
                status: item.status,
                rating: item.rating || 0,
                notes: item.notes || '',
            });
        }
        setIsEditing(false);
    };

    const handleSave = async () => {
        if (!item) return;
        try {
            setIsSaving(true);
            await userItemsApi.update(item.id, {
                title: editForm.title,
                status: editForm.status,
                rating: editForm.rating || undefined,
                notes: editForm.notes || undefined,
            });
            await fetchItem();
            setIsEditing(false);
            // 清除 Next.js 缓存，确保返回列表页面时能获取最新数据
            router.refresh();
        } catch (err) {
            console.error('保存失败:', err);
        } finally {
            setIsSaving(false);
        }
    };

    const handleDelete = () => setDeleteDialogOpen(true);
    const handleDeleteSuccess = () => {
        // 清除缓存后返回列表页面
        router.refresh();
        router.push('/library');
    };

    // 标签管理函数
    const handleAddTag = async () => {
        if (!item || !newTagInput.trim()) return;

        // 检查是否重复
        if (tags.some(tag => tag.name.toLowerCase() === newTagInput.trim().toLowerCase())) {
            alert('该标签已存在');
            return;
        }

        try {
            setIsAddingTag(true);
            // 创建标签
            const newTag = await tagsApi.create({ name: newTagInput.trim(), type: 'custom' });
            // 关联到项目
            await tagsApi.addToUserItem(item.id, [newTag.id]);
            // 刷新标签列表
            await fetchTags(item.id);
            setNewTagInput('');
        } catch (err) {
            console.error('添加标签失败:', err);
            alert('添加标签失败，请重试');
        } finally {
            setIsAddingTag(false);
        }
    };

    const handleRemoveTag = async (tagId: number) => {
        if (!item) return;

        try {
            await tagsApi.removeFromUserItem(item.id, tagId);
            // 刷新标签列表
            await fetchTags(item.id);
        } catch (err) {
            console.error('删除标签失败:', err);
            alert('删除标签失败，请重试');
        }
    };

    const handleGenerateTags = async () => {
        if (!item) return;

        try {
            setIsGeneratingTags(true);
            await tagsApi.generateTags({
                user_item_id: item.id,
                include_notes: true,
            });
            // 刷新标签列表
            await fetchTags(item.id);
        } catch (err) {
            console.error('AI 生成标签失败:', err);
            alert('AI 生成标签失败，请重试');
        } finally {
            setIsGeneratingTags(false);
        }
    };

    const handleTagInputKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Enter') {
            e.preventDefault();
            handleAddTag();
        }
    };

    const getDisplayYear = (item: UserItem): string => {
        if (item.year && String(item.year).length === 4) return String(item.year);
        if (item.release_date) {
            try {
                const year = new Date(item.release_date).getFullYear();
                if (!isNaN(year) && year > 1800 && year < 2100) return String(year);
            } catch (e) {
                // 解析失败
            }
        }
        return '未知';
    };

    if (loading) {
        return (
            <ProtectedRoute>
                <div className="min-h-screen bg-gray-50 dark:bg-black flex items-center justify-center">
                    <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
                </div>
            </ProtectedRoute>
        );
    }

    if (!item) {
        return (
            <ProtectedRoute>
                <div className="min-h-screen bg-gray-50 dark:bg-black flex items-center justify-center">
                    <div className="text-center">
                        <p className="text-gray-600 dark:text-gray-400 mb-4">未找到该内容</p>
                        <button onClick={() => router.push('/library')} className="text-blue-500 dark:text-blue-400 hover:text-blue-600 dark:hover:text-blue-300">
                            返回库
                        </button>
                    </div>
                </div>
            </ProtectedRoute>
        );
    }

    const coverImage = item.poster_url || item.backdrop_url;
    const backgroundImage = item.backdrop_url || item.poster_url;
    const displayYear = getDisplayYear(item);

    return (
        <ProtectedRoute>
            {/* 沉浸式背景层 */}
            <div className="fixed inset-0 z-0">
                {backgroundImage ? (
                    <>
                        <div
                            className="absolute inset-0 bg-cover bg-center"
                            style={{ backgroundImage: `url(${backgroundImage})` }}
                        />
                        <div className="absolute inset-0 backdrop-blur-3xl bg-white/80 dark:bg-black/60" />
                    </>
                ) : (
                    <div className="absolute inset-0 bg-gradient-to-br from-gray-100 via-gray-50 to-gray-100 dark:from-gray-900 dark:via-black dark:to-gray-900" />
                )}
            </div>

            {/* 主内容 */}
            <div className="relative z-10 min-h-screen">
                <div className="max-w-7xl mx-auto px-6 py-8">
                    {/* 返回按钮 */}
                    <motion.button
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        onClick={() => router.back()}
                        className="flex items-center gap-2 text-gray-600 dark:text-white/70 hover:text-gray-900 dark:hover:text-white mb-8 transition-colors group"
                    >
                        <ArrowLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
                        <span className="font-medium">返回</span>
                    </motion.button>

                    {/* 玻璃拟态卡片 */}
                    <motion.div
                        initial={{ opacity: 0, y: 40 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
                        className="bg-white/90 dark:bg-white/10 backdrop-blur-md border border-gray-200 dark:border-white/20 rounded-3xl overflow-hidden shadow-2xl"
                    >
                        <div className="flex flex-col lg:flex-row">
                            {/* 左侧：大海报 */}
                            <motion.div
                                initial={{ opacity: 0, scale: 0.95 }}
                                animate={{ opacity: 1, scale: 1 }}
                                transition={{ duration: 0.6, delay: 0.2 }}
                                className="lg:w-[420px] flex-shrink-0"
                            >
                                {coverImage ? (
                                    <img
                                        src={coverImage}
                                        alt={item.title}
                                        className="w-full h-full object-cover lg:rounded-l-3xl"
                                    />
                                ) : (
                                    <div className="flex items-center justify-center h-[600px] bg-gray-100 dark:bg-white/5">
                                        <span className="text-8xl opacity-30">
                                            {item.content_type === 'movie' && '🎬'}
                                            {item.content_type === 'tv' && '📺'}
                                            {item.content_type === 'anime' && '🎌'}
                                            {item.content_type === 'book' && '📚'}
                                        </span>
                                    </div>
                                )}
                            </motion.div>

                            {/* 右侧：信息区 */}
                            <div className="flex-1 p-10 lg:p-12">
                                {/* 操作按钮 */}
                                <div className="flex justify-end gap-3 mb-8">
                                    {!isEditing ? (
                                        <>
                                            <motion.button
                                                whileHover={{ scale: 1.05 }}
                                                whileTap={{ scale: 0.95 }}
                                                onClick={handleEdit}
                                                className="px-5 py-2.5 bg-blue-500 hover:bg-blue-600 text-white rounded-xl transition-colors flex items-center gap-2 font-medium shadow-lg shadow-blue-500/30"
                                            >
                                                <Edit2 className="w-4 h-4" />
                                                编辑
                                            </motion.button>
                                            <motion.button
                                                whileHover={{ scale: 1.05 }}
                                                whileTap={{ scale: 0.95 }}
                                                onClick={handleDelete}
                                                className="px-5 py-2.5 bg-red-500 hover:bg-red-600 text-white rounded-xl transition-colors flex items-center gap-2 font-medium shadow-lg shadow-red-500/30"
                                            >
                                                <Trash2 className="w-4 h-4" />
                                                删除
                                            </motion.button>
                                        </>
                                    ) : (
                                        <>
                                            <motion.button
                                                whileHover={{ scale: 1.05 }}
                                                whileTap={{ scale: 0.95 }}
                                                onClick={handleSave}
                                                disabled={isSaving}
                                                className="px-5 py-2.5 bg-blue-500 hover:bg-blue-600 text-white rounded-xl transition-colors flex items-center gap-2 font-medium disabled:opacity-50 shadow-lg shadow-blue-500/30"
                                            >
                                                {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                                                保存
                                            </motion.button>
                                            <motion.button
                                                whileHover={{ scale: 1.05 }}
                                                whileTap={{ scale: 0.95 }}
                                                onClick={handleCancel}
                                                disabled={isSaving}
                                                className="px-5 py-2.5 bg-gray-200 dark:bg-white/10 hover:bg-gray-300 dark:hover:bg-white/20 text-gray-900 dark:text-white rounded-xl transition-colors flex items-center gap-2 font-medium disabled:opacity-50"
                                            >
                                                <X className="w-4 h-4" />
                                                取消
                                            </motion.button>
                                        </>
                                    )}
                                </div>

                                {/* 标题 */}
                                <div className="mb-8">
                                    {isEditing ? (
                                        <input
                                            type="text"
                                            value={editForm.title}
                                            onChange={(e) => setEditForm({ ...editForm, title: e.target.value })}
                                            className="w-full text-5xl font-bold text-gray-900 dark:text-white bg-gray-50 dark:bg-white/5 border border-gray-300 dark:border-white/20 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        />
                                    ) : (
                                        <h1 className="text-5xl lg:text-6xl font-bold text-gray-900 dark:text-white leading-tight">{item.title}</h1>
                                    )}
                                </div>

                                {/* 元数据网格 */}
                                <div className="grid grid-cols-2 gap-6 mb-8">
                                    {/* 年份 */}
                                    <div>
                                        <div className="flex items-center gap-2 text-gray-500 dark:text-gray-400 text-sm mb-2">
                                            <Calendar className="w-4 h-4" />
                                            <span>年份</span>
                                        </div>
                                        <p className="text-gray-900 dark:text-white text-xl font-semibold">{displayYear}</p>
                                    </div>

                                    {/* 状态 */}
                                    <div>
                                        <div className="text-gray-500 dark:text-gray-400 text-sm mb-2">状态</div>
                                        {isEditing ? (
                                            <select
                                                value={editForm.status}
                                                onChange={(e) => setEditForm({ ...editForm, status: e.target.value as ItemStatus })}
                                                className="w-full px-4 py-2 bg-gray-50 dark:bg-white/10 border border-gray-300 dark:border-white/20 rounded-lg text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                                            >
                                                {statusOptions.map((opt) => (
                                                    <option key={opt.value} value={opt.value} className="bg-white dark:bg-gray-900">
                                                        {opt.label}
                                                    </option>
                                                ))}
                                            </select>
                                        ) : (
                                            <div
                                                className={`inline-flex px-4 py-1.5 rounded-full border text-sm font-medium ${statusColors[item.status]}`}
                                            >
                                                {statusOptions.find((opt) => opt.value === item.status)?.label}
                                            </div>
                                        )}
                                    </div>

                                    {/* 评分 */}
                                    <div>
                                        <div className="flex items-center gap-2 text-gray-500 dark:text-gray-400 text-sm mb-2">
                                            <Star className="w-4 h-4" />
                                            <span>评分</span>
                                        </div>
                                        {isEditing ? (
                                            <input
                                                type="number"
                                                min="0"
                                                max="10"
                                                step="0.1"
                                                value={editForm.rating}
                                                onChange={(e) => setEditForm({ ...editForm, rating: parseFloat(e.target.value) || 0 })}
                                                className="w-full px-4 py-2 bg-gray-50 dark:bg-white/10 border border-gray-300 dark:border-white/20 rounded-lg text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                                            />
                                        ) : (
                                            <div className="flex items-center gap-2">
                                                <span className="text-yellow-500 dark:text-yellow-400 text-2xl">★</span>
                                                <span className="text-gray-900 dark:text-white text-xl font-semibold">
                                                    {item.rating ? item.rating.toFixed(1) : '未评分'}
                                                </span>
                                            </div>
                                        )}
                                    </div>
                                </div>

                                {/* 简介 */}
                                <div className="mb-8">
                                    <div className="flex items-center gap-2 text-gray-500 dark:text-gray-400 text-sm mb-3">
                                        <AlignLeft className="w-4 h-4" />
                                        <span>简介</span>
                                    </div>
                                    <p className="text-gray-600 dark:text-white/70 leading-relaxed text-base">
                                        {item.description || '暂无简介'}
                                    </p>
                                </div>

                                {/* 标签管理器 */}
                                <div className="mb-8">
                                    <div className="flex items-center justify-between mb-3">
                                        <div className="flex items-center gap-2 text-gray-500 dark:text-gray-400 text-sm">
                                            <TagIcon className="w-4 h-4" />
                                            <span>标签</span>
                                        </div>
                                        {/* AI 生成按钮 */}
                                        <motion.button
                                            whileHover={{ scale: 1.05 }}
                                            whileTap={{ scale: 0.95 }}
                                            onClick={handleGenerateTags}
                                            disabled={isGeneratingTags || !item}
                                            className="flex items-center gap-1.5 px-3 py-1.5 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white rounded-lg text-xs font-medium transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-sm"
                                        >
                                            {isGeneratingTags ? (
                                                <>
                                                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                                                    <span>生成中...</span>
                                                </>
                                            ) : (
                                                <>
                                                    <Sparkles className="w-3.5 h-3.5" />
                                                    <span>AI 生成</span>
                                                </>
                                            )}
                                        </motion.button>
                                    </div>

                                    {tagsLoading ? (
                                        <div className="flex items-center gap-2">
                                            <Loader2 className="w-4 h-4 animate-spin text-gray-400" />
                                            <span className="text-sm text-gray-400">加载中...</span>
                                        </div>
                                    ) : (
                                        <>
                                            {/* 标签列表 */}
                                            <div className="flex flex-wrap gap-2 mb-3">
                                                <AnimatePresence mode="popLayout">
                                                    {tags.map((tag) => (
                                                        <motion.div
                                                            key={tag.id}
                                                            initial={{ opacity: 0, scale: 0.9 }}
                                                            animate={{ opacity: 1, scale: 1 }}
                                                            exit={{ opacity: 0, scale: 0.9 }}
                                                            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800"
                                                        >
                                                            <span>{tag.name}</span>
                                                            {isEditing && (
                                                                <button
                                                                    onClick={() => handleRemoveTag(tag.id)}
                                                                    className="hover:bg-blue-200 dark:hover:bg-blue-800 rounded-full p-0.5 transition-colors"
                                                                    aria-label="删除标签"
                                                                >
                                                                    <X className="w-3 h-3" />
                                                                </button>
                                                            )}
                                                        </motion.div>
                                                    ))}
                                                </AnimatePresence>
                                                {tags.length === 0 && !isEditing && (
                                                    <p className="text-gray-400 dark:text-gray-500 text-sm">暂无标签</p>
                                                )}
                                            </div>

                                            {/* 添加标签输入框（仅编辑模式） */}
                                            {isEditing && (
                                                <motion.div
                                                    initial={{ opacity: 0, height: 0 }}
                                                    animate={{ opacity: 1, height: 'auto' }}
                                                    exit={{ opacity: 0, height: 0 }}
                                                    className="flex gap-2"
                                                >
                                                    <input
                                                        type="text"
                                                        value={newTagInput}
                                                        onChange={(e) => setNewTagInput(e.target.value)}
                                                        onKeyDown={handleTagInputKeyDown}
                                                        placeholder="输入标签名称，按 Enter 添加"
                                                        className="flex-1 px-3 py-2 bg-gray-50 dark:bg-white/5 border border-gray-300 dark:border-white/20 rounded-lg text-sm text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                                        disabled={isAddingTag}
                                                    />
                                                    <motion.button
                                                        whileHover={{ scale: 1.05 }}
                                                        whileTap={{ scale: 0.95 }}
                                                        onClick={handleAddTag}
                                                        disabled={isAddingTag || !newTagInput.trim()}
                                                        className="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg text-sm font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1.5"
                                                    >
                                                        {isAddingTag ? (
                                                            <Loader2 className="w-4 h-4 animate-spin" />
                                                        ) : (
                                                            <>
                                                                <Plus className="w-4 h-4" />
                                                                <span>添加</span>
                                                            </>
                                                        )}
                                                    </motion.button>
                                                </motion.div>
                                            )}
                                        </>
                                    )}
                                </div>

                                {/* 笔记 */}
                                <div>
                                    <h3 className="text-gray-500 dark:text-gray-400 text-sm mb-3">笔记</h3>
                                    {isEditing ? (
                                        <textarea
                                            value={editForm.notes}
                                            onChange={(e) => setEditForm({ ...editForm, notes: e.target.value })}
                                            rows={6}
                                            placeholder="添加你的笔记..."
                                            className="w-full px-4 py-3 bg-gray-50 dark:bg-white/5 border border-gray-300 dark:border-white/20 rounded-xl text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                                        />
                                    ) : (
                                        <p className="text-gray-600 dark:text-white/70 leading-relaxed whitespace-pre-wrap">
                                            {item.notes || '暂无笔记'}
                                        </p>
                                    )}
                                </div>
                            </div>
                        </div>
                    </motion.div>
                </div>
            </div>

            {/* 删除确认对话框 */}
            <DeleteConfirmDialog open={deleteDialogOpen} item={item} onClose={() => setDeleteDialogOpen(false)} onSuccess={handleDeleteSuccess} />
        </ProtectedRoute>
    );
}
