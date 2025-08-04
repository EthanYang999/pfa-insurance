import { createClient } from "@/lib/supabase/client";

/**
 * 确保认证状态同步的工具函数
 * 在跳转到需要认证的页面前调用，确保服务器端和客户端认证状态一致
 */
export async function ensureAuthSync() {
  const supabase = createClient();
  
  try {
    // 强制刷新session以确保服务器端同步
    const { data: { session }, error } = await supabase.auth.getSession();
    
    if (error) {
      console.warn('Session sync error:', error);
      return false;
    }
    
    // 如果有session，再次验证用户状态
    if (session?.user) {
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      if (userError) {
        console.warn('User verification error:', userError);
        return false;
      }
      return !!user;
    }
    
    return false;
  } catch (error) {
    console.error('Auth sync failed:', error);
    return false;
  }
}

/**
 * 安全跳转到需要认证的页面
 * 确保认证状态同步后再进行跳转
 */
export async function navigateToProtectedRoute(router: any, path: string) {
  const isAuthenticated = await ensureAuthSync();
  
  if (isAuthenticated) {
    router.push(path);
  } else {
    // 如果认证失败，跳转到登录页面并携带回调地址
    router.push(`/auth/login?redirectTo=${encodeURIComponent(path)}`);
  }
}