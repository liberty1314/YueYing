import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { userItemsApi } from '@/lib/user-items-api'
import type { UserItemFilters } from '@/types/user-item'

// Query keys
export const userItemsKeys = {
    all: ['user-items'] as const,
    lists: () => [...userItemsKeys.all, 'list'] as const,
    list: (filters: UserItemFilters) => [...userItemsKeys.lists(), filters] as const,
    details: () => [...userItemsKeys.all, 'detail'] as const,
    detail: (id: number) => [...userItemsKeys.details(), id] as const,
    stats: () => [...userItemsKeys.all, 'stats'] as const,
}

/**
 * 获取用户记录列表
 */
export function useUserItems(filters: UserItemFilters = {}) {
    return useQuery({
        queryKey: userItemsKeys.list(filters),
        queryFn: () => userItemsApi.getUserItems(filters),
        staleTime: 2 * 60 * 1000, // 2分钟
    })
}

/**
 * 获取单个用户记录
 */
export function useUserItem(id: number) {
    return useQuery({
        queryKey: userItemsKeys.detail(id),
        queryFn: () => userItemsApi.getUserItem(id),
        enabled: !!id,
    })
}

/**
 * 删除用户记录
 */
export function useDeleteUserItem() {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: (id: number) => userItemsApi.deleteUserItem(id),
        onSuccess: () => {
            // 删除成功后，使所有列表查询失效
            queryClient.invalidateQueries({ queryKey: userItemsKeys.lists() })
            queryClient.invalidateQueries({ queryKey: userItemsKeys.stats() })
        },
    })
}

/**
 * 更新用户记录
 */
export function useUpdateUserItem() {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: ({ id, data }: { id: number; data: any }) =>
            userItemsApi.updateUserItem(id, data),
        onSuccess: (_, variables) => {
            // 更新成功后，使相关查询失效
            queryClient.invalidateQueries({ queryKey: userItemsKeys.detail(variables.id) })
            queryClient.invalidateQueries({ queryKey: userItemsKeys.lists() })
            queryClient.invalidateQueries({ queryKey: userItemsKeys.stats() })
        },
    })
}
