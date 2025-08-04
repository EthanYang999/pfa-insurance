"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { EnhancedDualWorkflowChat } from "@/components/enhanced-dual-workflow-chat";
import { User } from "@supabase/supabase-js";

export default function ChatPage() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const supabase = createClient();
    
    const getUser = async (retryCount = 0) => {
      try {
        // 先尝试获取session，确保服务器端session同步
        const { data: { session } } = await supabase.auth.getSession();
        
        if (!session?.user) {
          // 如果没有session，尝试获取用户信息
          const { data: { user }, error } = await supabase.auth.getUser();
          
          if (error) {
            console.warn('认证检查错误:', error);
            // 如果是网络错误，尝试重试
            if (retryCount < 3) {
              setTimeout(() => getUser(retryCount + 1), 1000);
              return;
            }
          }
          
          if (!user) {
            // 给用户一个更长的缓冲时间，可能是认证状态更新延迟
            if (retryCount < 3) {
              setTimeout(() => getUser(retryCount + 1), 1000 + retryCount * 500);
              return;
            }
            router.push("/auth/login");
            return;
          }
          
          setUser(user);
        } else {
          setUser(session.user);
        }
        
        setLoading(false);
      } catch (error) {
        console.error('认证检查失败:', error);
        // 重试机制，增加重试次数
        if (retryCount < 3) {
          setTimeout(() => getUser(retryCount + 1), 1500);
          return;
        }
        router.push("/auth/login");
      }
    };

    getUser();

    // 监听认证状态变化
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        if (!session?.user) {
          router.push("/auth/login");
        } else {
          setUser(session.user);
          setLoading(false);
        }
      }
    );

    return () => subscription.unsubscribe();
  }, [router]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-pfa-light-gray to-white">
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-pfa-champagne-gold/30 border-t-pfa-champagne-gold rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-pfa-dark-gray">正在连接 AI 教练...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return null; // 用户未登录会被重定向
  }

  return <EnhancedDualWorkflowChat user={user} />;
}