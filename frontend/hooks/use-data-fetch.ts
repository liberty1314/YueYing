/**
 * 通用数据获取 Hooks
 * 
 * 基于 React Query 的可复用数据获取逻辑
 */

import { useQuery, useMutation, useQueryClient, UseQueryOptions, UseMutationOptions } from '@tanstack/react-query';
import { useState, useCallback } from 'react';
import { handleApiError } from '@/lib/utils/api-helpers';

/**
 * 通用数据获取 Hook
 * 
 * @param queryKey 查询键
 * @param queryFn 查询函数
 * @param options React Query 选项
 * @returns 查询结果
 * 
 * @example
 * ```tsx
 * const { data, isLoading, error } = useDataFetch(
 *   ['users', userId],
 *   () => api.getUser(userId)
 * );
 * ```
 */
export function useDataFetch<TData = any, TError = any>(
    queryKey: any[],
    queryFn: () => Promise<TData>,
    options?: Omit<UseQueryOptions<TData, TError>, 'queryKey' | 'queryFn'>
) {
    return useQuery<TData, TError>({
        queryKey,
        queryFn,
        ...options,
    });
}

/**
 * 带缓存的数据获取 Hook
 * 
 * @param queryKey 查询键
 * @param queryFn 查询函数
 * @param cacheTime 缓存时间（毫秒）
 * @param staleTime 数据过期时间（毫秒）
 * @returns 查询结果
 * 
 * @example
 * ```tsx
 * const { data, isLoading } = useCachedDataFetch(
 *   ['config'],
 *   () => api.getConfig(),
 *   5 * 60 * 1000, // 5分钟缓存
 *   1 * 60 * 1000  // 1分钟后标记为过期
 * );
 * ```
 */
export function useCachedDataFetch<TData = any, TError = any>(
    queryKey: any[],
    queryFn: () => Promise<TData>,
    cacheTime: number = 5 * 60 * 1000,
    staleTime: number = 1 * 60 * 1000,
    options?: Omit<UseQueryOptions<TData, TError>, 'queryKey' | 'queryFn' | 'cacheTime' | 'staleTime'>
) {
    return useQuery<TData, TError>({
        queryKey,
        queryFn,
        gcTime: cacheTime,
        staleTime,
        ...options,
    });
}

/**
 * 分页数据获取 Hook
 * 
 * @param queryKey 查询键基础部分
 * @param queryFn 查询函数（接收 page 和 pageSize 参数）
 * @param initialPage 初始页码
 * @param initialPageSize 初始每页数量
 * @returns 分页查询结果和控制函数
 * 
 * @example
 * ```tsx
 * const {
 *   data,
 *   isLoading,
 *   page,
 *   pageSize,
 *   totalPages,
 *   goToPage,
 *   nextPage,
 *   prevPage,
 * } = usePaginatedDataFetch(
 *   ['items'],
 *   (page, pageSize) => api.getItems({ page, page_size: pageSize }),
 *   1,
 *   20
 * );
 * ```
 */
export function usePaginatedDataFetch<TData = any>(
    queryKey: any[],
    queryFn: (page: number, pageSize: number) => Promise<{
        items: TData[];
        total: number;
        page: number;
        page_size: number;
        total_pages: number;
    }>,
    initialPage: number = 1,
    initialPageSize: number = 20
) {
    const [page, setPage] = useState(initialPage);
    const [pageSize, setPageSize] = useState(initialPageSize);

    const query = useQuery({
        queryKey: [...queryKey, page, pageSize],
        queryFn: () => queryFn(page, pageSize),
        placeholderData: (previousData) => previousData,
    });

    const goToPage = useCallback((newPage: number) => {
        setPage(newPage);
    }, []);

    const nextPage = useCallback(() => {
        if (query.data && page < query.data.total_pages) {
            setPage((prev) => prev + 1);
        }
    }, [page, query.data]);

    const prevPage = useCallback(() => {
        if (page > 1) {
            setPage((prev) => prev - 1);
        }
    }, [page]);

    const changePageSize = useCallback((newPageSize: number) => {
        setPageSize(newPageSize);
        setPage(1); // 重置到第一页
    }, []);

    return {
        ...query,
        items: query.data?.items || [],
        total: query.data?.total || 0,
        page,
        pageSize,
        totalPages: query.data?.total_pages || 0,
        hasNextPage: query.data ? page < query.data.total_pages : false,
        hasPrevPage: page > 1,
        goToPage,
        nextPage,
        prevPage,
        changePageSize,
    };
}

/**
 * 数据变更 Hook（用于 POST/PUT/DELETE 操作）
 * 
 * @param mutationFn 变更函数
 * @param options 变更选项
 * @returns 变更结果和控制函数
 * 
 * @example
 * ```tsx
 * const { mutate, isLoading } = useDataMutation(
 *   (data) => api.createItem(data),
 *   {
 *     onSuccess: () => {
 *       toast.success('创建成功');
 *       queryClient.invalidateQueries(['items']);
 *     },
 *     onError: (error) => {
 *       toast.error(handleApiError(error));
 *     },
 *   }
 * );
 * 
 * // 使用
 * mutate({ title: '新项目' });
 * ```
 */
export function useDataMutation<TData = any, TVariables = any, TError = any>(
    mutationFn: (variables: TVariables) => Promise<TData>,
    options?: UseMutationOptions<TData, TError, TVariables>
) {
    return useMutation<TData, TError, TVariables>({
        mutationFn,
        ...options,
    });
}

/**
 * 带加载状态和错误处理的数据获取 Hook
 * 
 * @param queryKey 查询键
 * @param queryFn 查询函数
 * @param options 选项
 * @returns 查询结果和辅助状态
 * 
 * @example
 * ```tsx
 * const { data, isLoading, error, errorMessage, retry } = useDataFetchWithState(
 *   ['items'],
 *   () => api.getItems()
 * );
 * 
 * if (isLoading) return <Loading />;
 * if (error) return <Error message={errorMessage} onRetry={retry} />;
 * return <ItemList items={data} />;
 * ```
 */
export function useDataFetchWithState<TData = any>(
    queryKey: any[],
    queryFn: () => Promise<TData>,
    options?: Omit<UseQueryOptions<TData, any>, 'queryKey' | 'queryFn'>
) {
    const query = useQuery({
        queryKey,
        queryFn,
        ...options,
    });

    const errorMessage = query.error ? handleApiError(query.error) : '';

    return {
        ...query,
        errorMessage,
        isEmpty: !query.isLoading && !query.error && (!query.data || (Array.isArray(query.data) && query.data.length === 0)),
    };
}

/**
 * 无限滚动数据获取 Hook
 * 
 * @param queryKey 查询键
 * @param queryFn 查询函数（接收 page 参数）
 * @param options 选项
 * @returns 无限查询结果
 * 
 * @example
 * ```tsx
 * const {
 *   data,
 *   fetchNextPage,
 *   hasNextPage,
 *   isFetchingNextPage,
 * } = useInfiniteDataFetch(
 *   ['items'],
 *   ({ pageParam = 1 }) => api.getItems({ page: pageParam })
 * );
 * 
 * // 在滚动到底部时
 * if (hasNextPage && !isFetchingNextPage) {
 *   fetchNextPage();
 * }
 * ```
 */
export function useInfiniteDataFetch<TData = any>(
    queryKey: any[],
    queryFn: ({ pageParam }: { pageParam?: number }) => Promise<{
        items: TData[];
        nextPage?: number;
        hasMore: boolean;
    }>,
    options?: any
) {
    const query = useQuery({
        queryKey,
        queryFn: () => queryFn({ pageParam: 1 }),
        ...options,
    });

    return query;
}

/**
 * 轮询数据获取 Hook
 * 
 * @param queryKey 查询键
 * @param queryFn 查询函数
 * @param interval 轮询间隔（毫秒）
 * @param enabled 是否启用轮询
 * @returns 查询结果
 * 
 * @example
 * ```tsx
 * const { data, isLoading } = usePollingDataFetch(
 *   ['status'],
 *   () => api.getStatus(),
 *   5000, // 每5秒轮询一次
 *   true  // 启用轮询
 * );
 * ```
 */
export function usePollingDataFetch<TData = any>(
    queryKey: any[],
    queryFn: () => Promise<TData>,
    interval: number = 5000,
    enabled: boolean = true
) {
    return useQuery({
        queryKey,
        queryFn,
        refetchInterval: enabled ? interval : false,
        refetchIntervalInBackground: false,
    });
}

/**
 * 依赖数据获取 Hook
 * 
 * @param queryKey 查询键
 * @param queryFn 查询函数
 * @param dependency 依赖值
 * @returns 查询结果
 * 
 * @example
 * ```tsx
 * // 只有当 userId 存在时才获取数据
 * const { data, isLoading } = useDependentDataFetch(
 *   ['user', userId],
 *   () => api.getUser(userId),
 *   userId
 * );
 * ```
 */
export function useDependentDataFetch<TData = any>(
    queryKey: any[],
    queryFn: () => Promise<TData>,
    dependency: any
) {
    return useQuery({
        queryKey,
        queryFn,
        enabled: !!dependency,
    });
}

/**
 * 预取数据 Hook
 * 
 * @returns 预取函数
 * 
 * @example
 * ```tsx
 * const prefetch = usePrefetchData();
 * 
 * // 在鼠标悬停时预取数据
 * <Link
 *   href="/item/123"
 *   onMouseEnter={() => prefetch(['item', 123], () => api.getItem(123))}
 * >
 *   查看详情
 * </Link>
 * ```
 */
export function usePrefetchData() {
    const queryClient = useQueryClient();

    return useCallback(
        <TData = any>(queryKey: any[], queryFn: () => Promise<TData>) => {
            queryClient.prefetchQuery({
                queryKey,
                queryFn,
            });
        },
        [queryClient]
    );
}
