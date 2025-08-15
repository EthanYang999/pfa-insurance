"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { TrainingChat } from "@/components/training-chat";
import { User } from "@supabase/supabase-js";

// 临时内联设备检测功能
const generateGuestId = (): string => {
  const timestamp = Date.now().toString(36);
  const random = Math.random().toString(36).substring(2, 15);
  return `guest_${timestamp}_${random}`;
};

const getOrCreateGuestId = (): string => {
  if (typeof window === 'undefined') return generateGuestId();
  
  const stored = localStorage.getItem('training_guest_id');
  if (stored) return stored;
  
  const newGuestId = generateGuestId();
  localStorage.setItem('training_guest_id', newGuestId);
  return newGuestId;
};

export default function TrainingPage() {
  const [user, setUser] = useState<User | null>(null);
  const [guestId, setGuestId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [systemSettings, setSystemSettings] = useState<any>({ 
    guest_access_enabled: true, 
    maintenance_mode: false 
  });
  const [authChecked, setAuthChecked] = useState(false);
  const router = useRouter();

  useEffect(() => {
    let authSubscription: any = null;
    
    const initializeApp = async () => {
      try {
        console.log('开始初始化培训页面...');
        
        const supabase = createClient();
        
        // 1. 立即获取当前会话
        const { data: { session } } = await supabase.auth.getSession();
        if (session?.user) {
          setUser(session.user);
        }
        setAuthChecked(true);
        
        // 2. 设置认证状态监听
        const { data: { subscription } } = supabase.auth.onAuthStateChange(
          (event, session) => {
            console.log('认证状态变化:', event, session?.user?.email || 'no user');
            setUser(session?.user || null);
            setAuthChecked(true);
          }
        );
        authSubscription = subscription;
        
        // 3. 加载系统设置
        try {
          const response = await fetch('/api/settings/public');
          if (response.ok) {
            const data = await response.json();
            setSystemSettings(data.settings || { guest_access_enabled: true, maintenance_mode: false });
          }
        } catch (error) {
          console.warn('系统设置加载失败，使用默认值');
        }
        
        // 4. 初始化访客会话
        const newGuestId = getOrCreateGuestId();
        setGuestId(newGuestId);
        
        console.log('培训页面初始化完成');
        
      } catch (error) {
        console.error('培训页面初始化失败:', error);
        setAuthChecked(true);
        setGuestId(getOrCreateGuestId());
      } finally {
        setLoading(false);
      }
    };

    initializeApp();

    return () => {
      if (authSubscription) {
        authSubscription.unsubscribe();
      }
    };
  }, []);

  // 处理重定向
  useEffect(() => {
    if (!loading && authChecked && !systemSettings?.guest_access_enabled && !user) {
      router.push('/auth/login');
    }
  }, [loading, authChecked, systemSettings?.guest_access_enabled, user, router]);

  // 处理登录请求
  const handleLoginRequest = () => {
    router.push('/auth/login');
  };

  // 加载中
  if (loading || !authChecked) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-50">
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-blue-600/30 border-t-blue-600 rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">正在连接 AI实战教练（培训模式）...</p>
        </div>
      </div>
    );
  }

  // 维护模式
  if (systemSettings?.maintenance_mode) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-yellow-50 to-orange-50">
        <div className="text-center max-w-md mx-auto p-8">
          <div className="text-6xl mb-4">🔧</div>
          <h1 className="text-2xl font-bold text-gray-900 mb-4">系统维护中</h1>
          <p className="text-gray-600 mb-6">
            我们正在对系统进行维护升级，预计很快就会恢复正常。
            感谢您的耐心等待！
          </p>
          <p className="text-sm text-gray-500">
            如有紧急事务，请联系管理员
          </p>
        </div>
      </div>
    );
  }

  // 访客模式关闭且用户未登录
  if (!systemSettings?.guest_access_enabled && !user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-50">
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-blue-600/30 border-t-blue-600 rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">正在跳转到登录页面...</p>
        </div>
      </div>
    );
  }

  // 显示培训聊天界面
  if (user || (systemSettings?.guest_access_enabled && guestId)) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-blue-50">
        <TrainingChat 
          user={user}
          guestId={guestId}
          onLoginRequest={handleLoginRequest}
        />
      </div>
    );
  }

  // 备用加载状态
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-50">
      <div className="text-center">
        <div className="w-8 h-8 border-2 border-blue-600/30 border-t-blue-600 rounded-full animate-spin mx-auto mb-4"></div>
        <p className="text-gray-600">正在初始化培训模式...</p>
      </div>
    </div>
  );
}