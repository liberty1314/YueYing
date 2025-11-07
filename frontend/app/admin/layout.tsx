"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { AdminSidebar } from "@/components/admin/AdminSidebar";
import { Loading } from "@/components/ui/loading";
import { useAuthStore } from "@/store/authStore";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const { isAuthenticated, isAdmin, isLoading: isAuthLoading } = useAuthStore();
  const [isChecking, setIsChecking] = useState(true);

  useEffect(() => {
    // 关键修复：必须等待 auth 状态从 localStorage 完全加载后再检查
    if (isAuthLoading) {
      // Auth 状态还在加载中，等待
      return;
    }

    // Auth 状态已加载完成，现在可以安全地检查权限
    if (!isAuthenticated) {
      // 未登录，跳转到登录页
      router.push("/login");
    } else if (!isAdmin) {
      // 已登录但不是管理员，跳转到首页
      router.push("/");
    } else {
      // 是管理员，允许访问
      setIsChecking(false);
    }
  }, [isAuthenticated, isAdmin, isAuthLoading, router]);

  // Auth 状态加载中、权限检查中或未授权时显示加载状态
  if (isAuthLoading || isChecking || !isAuthenticated || !isAdmin) {
    return <Loading />;
  }

  return (
    <div className="flex min-h-screen bg-background">
      {/* 侧边栏 */}
      <AdminSidebar />

      {/* 主内容区 */}
      <main className="flex-1 overflow-y-auto">
        <div className="container mx-auto p-6 max-w-5xl">
          {children}
        </div>
      </main>
    </div>
  );
}

