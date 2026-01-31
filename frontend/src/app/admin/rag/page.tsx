/**
 * RAG 管理页面
 * 
 * 功能：
 * - 显示向量数据库统计信息
 * - 提供重建索引功能
 * - 显示 RAG 配置信息
 * 
 * 验证需求: 15.6
 */

'use client';

import { useState } from 'react';
import { Database, RefreshCw, Info, AlertCircle } from 'lucide-react';
import { AppleCard } from '@/components/ui/AppleCard';
import { AppleButton } from '@/components/ui/AppleButton';
import { Skeleton } from '@/components/ui/Skeleton';
import { useVectorStoreStats, useRebuildIndex } from '@/hooks/useAdminRAG';
import { cn } from '@/lib/utils';

/**
 * 统计卡片组件
 */
function StatCard({
    label,
    value,
    icon: Icon,
    loading = false,
}: {
    label: string;
    value: string | number;
    icon: React.ElementType;
    loading?: boolean;
}) {
    if (loading) {
        return (
            <AppleCard variant="elevated" sx={{ p: 3 }}>
                <div className="space-y-3">
                    <Skeleton className="h-5 w-24" />
                    <Skeleton className="h-8 w-32" />
                </div>
            </AppleCard>
        );
    }

    return (
        <AppleCard
            variant="elevated"
            sx={{ p: 3 }}
            className="transition-all duration-200 hover:shadow-[var(--shadow-lg)]"
        >
            <div className="flex items-start gap-4">
                {/* 图标 */}
                <div
                    className={cn(
                        'flex items-center justify-center',
                        'w-12 h-12 rounded-[var(--radius-md)]',
                        'bg-[var(--color-primary)]/10'
                    )}
                >
                    <Icon className="w-6 h-6 text-[var(--color-primary)]" />
                </div>

                {/* 内容 */}
                <div className="flex-1 min-w-0">
                    <p className="text-sm text-[var(--color-text-secondary)] mb-1">
                        {label}
                    </p>
                    <p className="text-2xl font-semibold text-[var(--color-text-primary)]">
                        {value}
                    </p>
                </div>
            </div>
        </AppleCard>
    );
}

/**
 * 空状态组件
 */
function EmptyState() {
    return (
        <AppleCard variant="elevated" sx={{ p: 6 }}>
            <div className="flex flex-col items-center justify-center text-center space-y-4">
                <div
                    className={cn(
                        'flex items-center justify-center',
                        'w-16 h-16 rounded-full',
                        'bg-[var(--color-text-disabled)]/10'
                    )}
                >
                    <Database className="w-8 h-8 text-[var(--color-text-disabled)]" />
                </div>
                <div className="space-y-2">
                    <h3 className="text-lg font-medium text-[var(--color-text-primary)]">
                        向量数据库未初始化
                    </h3>
                    <p className="text-sm text-[var(--color-text-secondary)] max-w-md">
                        向量数据库尚未包含任何数据。请点击下方按钮重建索引以开始使用 RAG 功能。
                    </p>
                </div>
            </div>
        </AppleCard>
    );
}

/**
 * 错误状态组件
 */
function ErrorState({ error, onRetry }: { error: Error; onRetry: () => void }) {
    return (
        <AppleCard variant="elevated" sx={{ p: 6 }}>
            <div className="flex flex-col items-center justify-center text-center space-y-4">
                <div
                    className={cn(
                        'flex items-center justify-center',
                        'w-16 h-16 rounded-full',
                        'bg-[var(--color-error)]/10'
                    )}
                >
                    <AlertCircle className="w-8 h-8 text-[var(--color-error)]" />
                </div>
                <div className="space-y-2">
                    <h3 className="text-lg font-medium text-[var(--color-text-primary)]">
                        加载失败
                    </h3>
                    <p className="text-sm text-[var(--color-text-secondary)] max-w-md">
                        {error.message || '无法加载向量数据库统计信息'}
                    </p>
                </div>
                <AppleButton variant="secondary" onClick={onRetry}>
                    重试
                </AppleButton>
            </div>
        </AppleCard>
    );
}

/**
 * RAG 管理页面
 */
export default function RAGManagementPage() {
    const [isRebuilding, setIsRebuilding] = useState(false);

    // 获取向量存储统计信息
    const { data: stats, isLoading, error, refetch } = useVectorStoreStats();

    // 重建索引 mutation
    const rebuildIndexMutation = useRebuildIndex();

    // 处理重建索引
    const handleRebuildIndex = async () => {
        if (isRebuilding) return;

        setIsRebuilding(true);
        try {
            await rebuildIndexMutation.mutateAsync({});
        } finally {
            setIsRebuilding(false);
        }
    };

    return (
        <div className="space-y-6">
            {/* 页面头部 */}
            <div className="space-y-2">
                <h1 className="text-3xl font-semibold text-[var(--color-text-primary)]">
                    RAG 管理
                </h1>
                <p className="text-sm text-[var(--color-text-secondary)]">
                    管理检索增强生成（RAG）系统的向量数据库和索引
                </p>
            </div>

            {/* 错误状态 */}
            {error && <ErrorState error={error as Error} onRetry={() => refetch()} />}

            {/* 加载状态或正常内容 */}
            {!error && (
                <>
                    {/* 统计信息卡片 */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <StatCard
                            label="索引项目总数"
                            value={stats?.total_items ?? 0}
                            icon={Database}
                            loading={isLoading}
                        />
                        <StatCard
                            label="集合名称"
                            value={stats?.collection_name ?? '-'}
                            icon={Info}
                            loading={isLoading}
                        />
                        <StatCard
                            label="向量维度"
                            value={stats?.embedding_dimension ?? 0}
                            icon={Info}
                            loading={isLoading}
                        />
                    </div>

                    {/* 空状态 */}
                    {!isLoading && stats && stats.total_items === 0 && <EmptyState />}

                    {/* 配置和操作区域 */}
                    <AppleCard variant="elevated" sx={{ p: 4 }}>
                        <div className="space-y-4">
                            {/* 标题 */}
                            <div className="space-y-2">
                                <h2 className="text-xl font-semibold text-[var(--color-text-primary)]">
                                    向量索引管理
                                </h2>
                                <p className="text-sm text-[var(--color-text-secondary)]">
                                    重建向量索引将重新计算所有用户项目的向量嵌入。这是一个重量级操作，可能需要几分钟时间。
                                </p>
                            </div>

                            {/* 信息提示 */}
                            <div
                                className={cn(
                                    'flex items-start gap-3 p-4',
                                    'rounded-[var(--radius-md)]',
                                    'bg-[var(--color-primary)]/5',
                                    'border border-[var(--color-primary)]/20'
                                )}
                            >
                                <Info className="w-5 h-5 text-[var(--color-primary)] flex-shrink-0 mt-0.5" />
                                <div className="flex-1 space-y-1">
                                    <p className="text-sm font-medium text-[var(--color-text-primary)]">
                                        何时需要重建索引？
                                    </p>
                                    <ul className="text-sm text-[var(--color-text-secondary)] space-y-1 list-disc list-inside">
                                        <li>首次启用 RAG 功能时</li>
                                        <li>更换了嵌入模型时</li>
                                        <li>向量数据库出现异常时</li>
                                        <li>批量导入了大量新数据后</li>
                                    </ul>
                                </div>
                            </div>

                            {/* 操作按钮 */}
                            <div className="flex items-center justify-between pt-2">
                                <div className="text-sm text-[var(--color-text-secondary)]">
                                    {isRebuilding && (
                                        <span className="flex items-center gap-2">
                                            <RefreshCw className="w-4 h-4 animate-spin" />
                                            正在重建索引，请稍候...
                                        </span>
                                    )}
                                </div>
                                <AppleButton
                                    variant="primary"
                                    onClick={handleRebuildIndex}
                                    disabled={isRebuilding || isLoading}
                                    loading={isRebuilding}
                                >
                                    <RefreshCw className="w-4 h-4 mr-2" />
                                    重建索引
                                </AppleButton>
                            </div>
                        </div>
                    </AppleCard>

                    {/* RAG 配置说明 */}
                    <AppleCard variant="elevated" sx={{ p: 4 }}>
                        <div className="space-y-4">
                            <h2 className="text-xl font-semibold text-[var(--color-text-primary)]">
                                RAG 系统配置
                            </h2>

                            <div className="space-y-3">
                                {/* 嵌入模型 */}
                                <div className="flex items-start justify-between py-3 border-b border-[var(--color-text-disabled)]/20">
                                    <div className="space-y-1">
                                        <p className="text-sm font-medium text-[var(--color-text-primary)]">
                                            嵌入模型
                                        </p>
                                        <p className="text-xs text-[var(--color-text-secondary)]">
                                            用于生成文本向量嵌入的模型
                                        </p>
                                    </div>
                                    <p className="text-sm text-[var(--color-text-primary)] font-mono">
                                        paraphrase-multilingual-MiniLM-L12-v2
                                    </p>
                                </div>

                                {/* 向量数据库 */}
                                <div className="flex items-start justify-between py-3 border-b border-[var(--color-text-disabled)]/20">
                                    <div className="space-y-1">
                                        <p className="text-sm font-medium text-[var(--color-text-primary)]">
                                            向量数据库
                                        </p>
                                        <p className="text-xs text-[var(--color-text-secondary)]">
                                            用于存储和检索向量的数据库
                                        </p>
                                    </div>
                                    <p className="text-sm text-[var(--color-text-primary)] font-mono">
                                        ChromaDB
                                    </p>
                                </div>

                                {/* 相似度阈值 */}
                                <div className="flex items-start justify-between py-3">
                                    <div className="space-y-1">
                                        <p className="text-sm font-medium text-[var(--color-text-primary)]">
                                            最小相似度阈值
                                        </p>
                                        <p className="text-xs text-[var(--color-text-secondary)]">
                                            检索结果的最小相似度分数
                                        </p>
                                    </div>
                                    <p className="text-sm text-[var(--color-text-primary)] font-mono">
                                        0.01
                                    </p>
                                </div>
                            </div>
                        </div>
                    </AppleCard>
                </>
            )}
        </div>
    );
}
