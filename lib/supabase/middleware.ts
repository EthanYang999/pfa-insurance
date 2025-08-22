import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";
import { hasEnvVars } from "../utils";

export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({
    request,
  });

  // If the env vars are not set, skip middleware check. You can remove this
  // once you setup the project.
  if (!hasEnvVars) {
    return supabaseResponse;
  }

  // With Fluid compute, don't put this client in a global environment
  // variable. Always create a new one on each request.
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_OR_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value),
          );
          supabaseResponse = NextResponse.next({
            request,
          });
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options),
          );
        },
      },
    },
  );

  // Do not run code between createServerClient and
  // supabase.auth.getClaims(). A simple mistake could make it very hard to debug
  // issues with users being randomly logged out.

  // IMPORTANT: If you remove getClaims() and you use server-side rendering
  // with the Supabase client, your users may be randomly logged out.
  
  // 先尝试获取session，这通常更可靠
  const { data: { session } } = await supabase.auth.getSession();
  let user = session?.user;
  
  // 如果session检查失败，再尝试getClaims()
  if (!user) {
    const { data } = await supabase.auth.getClaims();
    user = data?.claims;
  }

  // 对于需要认证的页面进行检查
  const protectedPaths = ['/chat', '/dashboard', '/profile'];
  const isProtectedPath = protectedPaths.some(path => request.nextUrl.pathname.startsWith(path));
  
  if (
    isProtectedPath &&
    !user &&
    !request.nextUrl.pathname.startsWith("/login") &&
    !request.nextUrl.pathname.startsWith("/auth")
  ) {
    // 检查是否是从主页跳转过来的
    const referer = request.headers.get('referer');
    const isFromMainPage = referer && (referer.includes(request.nextUrl.origin) || referer.endsWith('/'));
    
    // 如果是从主页跳转且没有重试标记，给一次重试机会
    const hasRetryFlag = request.nextUrl.searchParams.has('auth_retry');
    
    if (isFromMainPage && !hasRetryFlag) {
      // 添加重试标记并重新尝试当前路径，给认证状态一点时间同步
      const url = request.nextUrl.clone();
      url.searchParams.set('auth_retry', '1');
      return NextResponse.redirect(url);
    }
    
    // 重定向到登录页面
    const url = request.nextUrl.clone();
    url.pathname = "/auth/login";
    url.searchParams.delete('auth_retry'); // 清除重试标记
    
    // 添加回调URL
    if (isFromMainPage) {
      url.searchParams.set('redirectTo', request.nextUrl.pathname);
    }
    
    return NextResponse.redirect(url);
  }

  // 清除URL中的重试参数，让用户看不到这个技术细节
  if (request.nextUrl.searchParams.has('auth_retry') && user) {
    const url = request.nextUrl.clone();
    url.searchParams.delete('auth_retry');
    return NextResponse.redirect(url);
  }

  // IMPORTANT: You *must* return the supabaseResponse object as it is.
  // If you're creating a new response object with NextResponse.next() make sure to:
  // 1. Pass the request in it, like so:
  //    const myNewResponse = NextResponse.next({ request })
  // 2. Copy over the cookies, like so:
  //    myNewResponse.cookies.setAll(supabaseResponse.cookies.getAll())
  // 3. Change the myNewResponse object to fit your needs, but avoid changing
  //    the cookies!
  // 4. Finally:
  //    return myNewResponse
  // If this is not done, you may be causing the browser and server to go out
  // of sync and terminate the user's session prematurely!

  return supabaseResponse;
}
