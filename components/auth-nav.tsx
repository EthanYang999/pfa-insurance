"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { createClient } from "@/lib/supabase/client";
import { LogoutButton } from "@/components/logout-button";
import { useRouter } from "next/navigation";
import { User } from "@supabase/supabase-js";

interface AuthNavProps {
  className?: string;
}

export function AuthNav({ className }: AuthNavProps) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const supabase = createClient();
    
    // 获取初始用户状态
    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setUser(user);
      setLoading(false);
    };

    getUser();

    // 监听认证状态变化
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        setUser(session?.user ?? null);
        setLoading(false);
      }
    );

    return () => subscription.unsubscribe();
  }, []);

  if (loading) {
    return (
      <div className={className}>
        <div className="w-4 h-4 border-2 border-pfa-champagne-gold/30 border-t-pfa-champagne-gold rounded-full animate-spin"></div>
      </div>
    );
  }

  if (user) {
    return (
      <div className={`flex items-center space-x-3 ${className}`}>
        <span className="text-pfa-champagne-gold text-sm">
          {user.email?.split('@')[0] || '会员'}
        </span>
        <LogoutButton />
      </div>
    );
  }

  return (
    <div className={className}>
      <Button 
        onClick={() => router.push('/auth/login')}
        variant="outline"
        size="sm"
        className="border-pfa-champagne-gold text-pfa-champagne-gold hover:bg-pfa-champagne-gold hover:text-pfa-royal-blue transition-colors"
      >
        登录
      </Button>
    </div>
  );
}