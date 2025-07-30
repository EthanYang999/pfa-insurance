import { redirect } from "next/navigation";
import { AdminDashboard } from "@/components/admin/admin-dashboard";
import { isAdmin } from "@/lib/admin-auth";

// 强制动态渲染
export const dynamic = 'force-dynamic';

export default async function AdminPage() {
  const isAdminUser = await isAdmin();
  
  if (!isAdminUser) {
    redirect("/auth/login?message=" + encodeURIComponent("需要管理员权限"));
  }

  return <AdminDashboard />;
}