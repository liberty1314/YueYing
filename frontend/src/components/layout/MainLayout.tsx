/**
 * MainLayout - 主布局组件
 * 
 * 页面内容区域布局容器
 */

'use client';

import { type ReactNode } from 'react';

interface MainLayoutProps {
  children: ReactNode;
}

export function MainLayout({ children }: MainLayoutProps) {
  return (
    <div className="min-h-screen bg-[#FFFFFF] dark:bg-[#000000]">
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {children}
      </main>
    </div>
  );
}
