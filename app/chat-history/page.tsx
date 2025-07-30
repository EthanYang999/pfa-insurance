"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { ChatHistoryView } from "@/components/chat-history-view";
import { User } from "@supabase/supabase-js";

export default function ChatHistoryPage() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const supabase = createClient();
    
    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        router.push("/auth/login");
        return;
      }
      
      setUser(user);
      setLoading(false);
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
          <p className="text-pfa-dark-gray">正在加载聊天历史...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return null; // 用户未登录会被重定向
  }

  return <ChatHistoryView user={user} />;
}