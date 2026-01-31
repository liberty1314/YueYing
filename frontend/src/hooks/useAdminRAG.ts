/**
 * RAG 管理相关的 React Query hooks
 * 
 * 功能：
 * - 获取向量存储统计信息
 * - 重建向量索引
 * 
 * 验证需求: 15.6
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { adminApi, type VectorStoreStats, type RebuildIndexRequest, type RebuildIndexResponse } from '@/lib/api/admin';
import { useToast } from '@/hooks/use-toast';

/**
 * 获取向量存储统计信息
 */
export function useVectorStoreStats() {
    return useQuery<VectorStoreStats>({
        queryKey: ['admin', 'rag', 'stats'],
        queryFn: () => adminApi.getVectorStoreStats(),
        refetchInterval: 30000, // 每 30 秒刷新一次
    });
}

/**
 * 重建向量索引
 */
export function useRebuildIndex() {
    const queryClient = useQueryClient();
    const { toast } = useToast();

    return useMutation<RebuildIndexResponse, Error, RebuildIndexRequest | undefined>({
        mutationFn: (data) => adminApi.rebuildIndex(data),
        onSuccess: (data: RebuildIndexResponse) => {
            // 刷新统计信息
            queryClient.invalidateQueries({ queryKey: ['admin', 'rag', 'stats'] });
            
            toast({
                title: '索引重建成功',
                description: data.message || `已成功重建 ${data.total_items || 0} 个项目的向量索引`,
                variant: 'default',
            });
        },
        onError: (error: Error) => {
            toast({
                title: '索引重建失败',
                description: error.message || '重建向量索引时发生错误',
                variant: 'error',
            });
        },
    });
}
