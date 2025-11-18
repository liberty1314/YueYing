/**
 * Admin Layout - Server Component
 * 
 * 在服务端执行管理员权限检查，避免客户端加载延迟
 */

import { AdminSidebar } from "@/components/admin/AdminSidebar";
import { getServerSession, isAdmin, redirectToLogin, redirectToHome } from "@/lib/auth/server-auth";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // 服务端获取 session
  const session = await getServerSession();

  // 未认证用户，重定向到登录页
  if (!session) {
    redirectToLogin('/admin');
  }

  // 检查是否为管理员
  const isAdminUser = await isAdmin(session);

  // 已认证但非管理员用户，重定向到首页
  if (!isAdminUser) {
    redirectToHome();
  }

  // 权限验证通过，渲染管理后台布局
  return (
    <>
      {/* 侧边栏 - Client Component */}
      <AdminSidebar />

      {/* 主内容区 - 添加左侧 margin 避开侧边栏 */}
      <main className="ml-64 min-h-[calc(100vh-4rem)] bg-background">
        <div className="container mx-auto p-6 max-w-5xl">
          {children}
        </div>
      </main>
    </>
  );
}

