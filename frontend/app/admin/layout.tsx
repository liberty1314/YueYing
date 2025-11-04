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
  const { isAuthenticated, isAdmin } = useAuthStore();
  const [isChecking, setIsChecking] = useState(true);

  useEffect(() => {
    // 检查认证状态和管理员权限
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
  }, [isAuthenticated, isAdmin, router]);

  // 检查中或未授权时显示加载状态
  if (isChecking || !isAuthenticated || !isAdmin) {
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

