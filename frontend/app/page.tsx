/**
 * 首页 - Server Component
 * 
 * 在服务端执行首页访问控制检查
 */

import { getServerSession, isHomeAccessAllowed, redirectToLogin } from "@/lib/auth/server-auth";
import { HomeContent } from "@/components/home/HomeContent";

export default async function HomePage() {
  // 服务端获取 session
  const session = await getServerSession();

  // 服务端访问控制检查
  if (!session) {
    // 未认证用户，检查是否允许匿名访问
    const allowed = await isHomeAccessAllowed(null);
    if (!allowed) {
      // 不允许匿名访问，重定向到登录页
      redirectToLogin();
    }
  }

  // 权限验证通过，渲染首页内容
  return <HomeContent />;
}
