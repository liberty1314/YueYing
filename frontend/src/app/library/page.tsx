'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { PlusIcon, Film } from 'lucide-react';
import { useLibraryStore } from '@/stores/libraryStore';
import { userItemsApi, tagsApi } from '@/lib/api';
import type { UserItem } from '@/types';
import type { Tag } from '@/lib/api/tags';
import ProtectedRoute from '@/components/shared/ProtectedRoute';
import { EmptyState } from '@/components/shared/EmptyState';
import { PosterGridSkeleton } from '@/components/shared/LoadingSkeletons';
import { AdvancedFilterPanel, ContentCard, BatchOperationsBar, BatchEditDialog, type BatchUpdateData } from '@/components/features/library';
import QuickAddForm from '@/components/features/library/QuickAddForm';
import EditForm from '@/components/features/library/EditForm';
import DeleteConfirmDialog from '@/components/features/library/DeleteConfirmDialog';
import ItemDetailDialog from '@/components/features/library/ItemDetailDialog';

export default function LibraryPage() {
    const router = useRouter();
    const [items, setItems] = useState<UserItem[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    // Dialog states
    const [addDialogOpen, setAddDialogOpen] = useState(false);
    const [editDialogOpen, setEditDialogOpen] = useState(false);
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
    const [detailDialogOpen, setDetailDialogOpen] = useState(false);
    const [selectedItem, setSelectedItem] = useState<UserItem | null>(null);

    // Batch operations states
    const [batchMode, setBatchMode] = useState(false);
    const [selectedItems, setSelectedItems] = useState<Set<number>>(new Set());
    const [batchEditOpen, setBatchEditOpen] = useState(false);
    const [batchDeleteOpen, setBatchDeleteOpen] = useState(false);

    const { filters, sortBy, page, pageSize, updateFilter, clearFilters } = useLibraryStore();

    // 活跃标签数据
    const [activeTags, setActiveTags] = useState<string[]>([]);

    const fetchItems = async () => {
        try {
            setLoading(true);

            // 转换 sortBy 格式：从 'updatedAt-desc' 转换为 'updated_at' 和 'desc'
            const [sortField, sortOrder] = sortBy.split('-');
            const sort_by = sortField.replace(/([A-Z])/g, '_$1').toLowerCase();

            const response = await userItemsApi.getAll({
                ...filters,
                sort_by,
                sort_order: (sortOrder as 'asc' | 'desc'),
                page,
                page_size: pageSize,
            });
            setItems(response.items);
        } catch (err: unknown) {
            setError(err instanceof Error ? err.message : '获取数据失败');
        } finally {
            setLoading(false);
        }
    };

    // 获取活跃标签
    const fetchActiveTags = async () => {
        try {
            const tags = await tagsApi.getPopular(6);
            setActiveTags(tags.map(tag => tag.name));
        } catch (err) {
            console.error('获取活跃标签失败:', err);
            setActiveTags([]);
        }
    };

    useEffect(() => {
        fetchItems();
        fetchActiveTags();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [filters, sortBy, page, pageSize]);

    const handleView = (item: UserItem) => {
        setSelectedItem(item);
        setDetailDialogOpen(true);
    };

    const handleEdit = (item: UserItem) => {
        setSelectedItem(item);
        setEditDialogOpen(true);
    };

    const handleDelete = (item: UserItem) => {
        setSelectedItem(item);
        setDeleteDialogOpen(true);
    };

    const handleDetailEdit = () => {
        setDetailDialogOpen(false);
        setEditDialogOpen(true);
    };

    const handleDetailDelete = () => {
        setDetailDialogOpen(false);
        setDeleteDialogOpen(true);
    };

    // Batch operations handlers
    const handleToggleBatchMode = () => {
        setBatchMode(!batchMode);
        setSelectedItems(new Set());
    };

    const handleSelectItem = (item: UserItem) => {
        const newSelected = new Set(selectedItems);
        if (newSelected.has(item.id)) {
            newSelected.delete(item.id);
        } else {
            newSelected.add(item.id);
        }
        setSelectedItems(newSelected);
    };

    const handleSelectAll = () => {
        setSelectedItems(new Set(items.map(item => item.id)));
    };

    const handleClearSelection = () => {
        setSelectedItems(new Set());
        setBatchMode(false);
    };

    const handleBatchEdit = () => {
        setBatchEditOpen(true);
    };

    const handleBatchDelete = () => {
        setBatchDeleteOpen(true);
    };

    const handleBatchEditConfirm = async (updates: BatchUpdateData) => {
        try {
            // 批量更新API调用
            const updatePromises = Array.from(selectedItems).map(id =>
                userItemsApi.update(id, updates as any)
            );
            await Promise.all(updatePromises);
            await fetchItems();
            setSelectedItems(new Set());
        } catch (err) {
            console.error('批量编辑失败:', err);
        }
    };

    const handleBatchDeleteConfirm = async () => {
        try {
            // 批量删除API调用
            const deletePromises = Array.from(selectedItems).map(id =>
                userItemsApi.delete(id)
            );
            await Promise.all(deletePromises);
            await fetchItems();
            setSelectedItems(new Set());
            setBatchDeleteOpen(false);
        } catch (err) {
            console.error('批量删除失败:', err);
        }
    };

    return (
        <ProtectedRoute>
            <div className="min-h-screen bg-gray-50 dark:bg-black">

                {/* Batch Operations Bar */}
                <BatchOperationsBar
                    isActive={batchMode}
                    selectedCount={selectedItems.size}
                    totalCount={items.length}
                    onToggle={handleToggleBatchMode}
                    onSelectAll={handleSelectAll}
                    onClearSelection={handleClearSelection}
                    onBatchEdit={handleBatchEdit}
                    onBatchDelete={handleBatchDelete}
                />

                <div className="max-w-[1920px] mx-auto flex">
                    {/* Sidebar - Advanced Filter Panel */}
                    <AdvancedFilterPanel
                        filters={filters}
                        onFilterChange={(newFilters) => {
                            // 如果是清空操作，调用store的clearFilters
                            if (Object.keys(newFilters).length === 0) {
                                clearFilters();
                            } else {
                                Object.entries(newFilters).forEach(([key, value]) => {
                                    updateFilter(key as any, value);
                                });
                            }
                        }}
                        activeTags={activeTags}
                    />

                    {/* Main Content */}
                    <div className="flex-1 p-6">
                        {loading ? (
                            <PosterGridSkeleton count={12} />
                        ) : error ? (
                            <div className="text-center py-20">
                                <p className="text-red-600 dark:text-red-400">{error}</p>
                            </div>
                        ) : items.length === 0 ? (
                            <EmptyState
                                icon={Film}
                                title="开始你的观影记录"
                                description="在这里记录你看过、在看或想看的电影和剧集，建立专属于你的影视收藏库。"
                                primaryAction={{
                                    label: '浏览热门内容',
                                    onClick: () => router.push('/'),
                                }}
                                secondaryAction={{
                                    label: '搜索添加',
                                    onClick: () => router.push('/search'),
                                }}
                                hints={[
                                    '使用筛选器快速找到想看的内容',
                                    '为每部作品添加评分和笔记',
                                    '查看你的观影统计和趋势分析',
                                ]}
                            />
                        ) : (
                            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6 gap-6">
                                {items.map((item) => (
                                    <ContentCard
                                        key={item.id}
                                        item={item}
                                        onView={handleView}
                                        onEdit={handleEdit}
                                        onDelete={handleDelete}
                                        isSelectable={batchMode}
                                        isSelected={selectedItems.has(item.id)}
                                        onSelect={handleSelectItem}
                                    />
                                ))}
                            </div>
                        )}
                    </div>
                </div>

                {/* Dialogs */}
                <QuickAddForm
                    open={addDialogOpen}
                    onClose={() => setAddDialogOpen(false)}
                    onSuccess={fetchItems}
                />

                <EditForm
                    open={editDialogOpen}
                    item={selectedItem}
                    onClose={() => {
                        setEditDialogOpen(false);
                        setSelectedItem(null);
                    }}
                    onSuccess={fetchItems}
                />

                <DeleteConfirmDialog
                    open={deleteDialogOpen}
                    item={selectedItem}
                    onClose={() => {
                        setDeleteDialogOpen(false);
                        setSelectedItem(null);
                    }}
                    onSuccess={fetchItems}
                />

                <ItemDetailDialog
                    open={detailDialogOpen}
                    item={selectedItem}
                    onClose={() => {
                        setDetailDialogOpen(false);
                        setSelectedItem(null);
                    }}
                    onEdit={handleDetailEdit}
                    onDelete={handleDetailDelete}
                />

                {/* Batch Edit Dialog */}
                <BatchEditDialog
                    open={batchEditOpen}
                    selectedCount={selectedItems.size}
                    onClose={() => setBatchEditOpen(false)}
                    onConfirm={handleBatchEditConfirm}
                />

                {/* Batch Delete Confirm */}
                {batchDeleteOpen && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 animate-fadeIn">
                        <div className="bg-white dark:bg-gray-800 rounded-lg p-6 max-w-md mx-4">
                            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                                确认批量删除
                            </h3>
                            <p className="text-gray-600 dark:text-gray-400 mb-6">
                                您即将删除 {selectedItems.size} 条记录，此操作不可恢复。确定继续吗？
                            </p>
                            <div className="flex justify-end gap-3">
                                <button
                                    onClick={() => setBatchDeleteOpen(false)}
                                    className="px-4 py-2 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                                >
                                    取消
                                </button>
                                <button
                                    onClick={handleBatchDeleteConfirm}
                                    className="px-4 py-2 bg-red-600 text-white dark:text-white hover:bg-red-700 rounded-lg transition-colors"
                                >
                                    确认删除
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </ProtectedRoute>
    );
}
