/**
 * React Query Provider
 * 
 * 为应用提供 React Query 的 QueryClient 实例
 */
'use client';

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactNode, useState } from 'react';

interface QueryProviderProps {
  children: ReactNode;
}

export function QueryProvider({ children }: QueryProviderProps) {
  // 使用 useState 确保 QueryClient 在客户端只创建一次
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            // 默认配置
            staleTime: 60 * 1000, // 1分钟
            refetchOnWindowFocus: false, // 窗口聚焦时不自动重新获取
            retry: 1, // 失败重试1次
          },
        },
      })
  );

  return (
    <QueryClientProvider client={queryClient}>
      {children}
    </QueryClientProvider>
  );
}

export default QueryProvider;
