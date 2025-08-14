"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { EnhancedDualWorkflowChat } from "@/components/enhanced-dual-workflow-chat";
import { User } from "@supabase/supabase-js";
// 临时内联设备检测功能
const generateGuestId = (): string => {
  const timestamp = Date.now().toString(36);
  const random = Math.random().toString(36).substring(2, 15);
  return `guest_${timestamp}_${random}`;
};

const getOrCreateGuestId = (): string => {
  if (typeof window === 'undefined') return generateGuestId();
  
  const stored = localStorage.getItem('guest_id');
  if (stored) return stored;
  
  const newGuestId = generateGuestId();
  localStorage.setItem('guest_id', newGuestId);
  return newGuestId;
};

const collectDeviceInfo = () => {
  if (typeof window === 'undefined') {
    return {
      userAgent: '',
      platform: '',
      language: 'zh-CN',
      screenWidth: 1920,
      screenHeight: 1080,
      pixelRatio: 1,
      touchSupport: false,
      hardwareConcurrency: 4,
      timezone: 'Asia/Shanghai',
      cookieEnabled: true
    };
  }

  try {
    return {
      userAgent: navigator.userAgent || '',
      platform: navigator.platform || '',
      language: navigator.language || 'zh-CN',
      screenWidth: screen?.width || 1920,
      screenHeight: screen?.height || 1080,
      pixelRatio: window.devicePixelRatio || 1,
      touchSupport: ('ontouchstart' in window) || (navigator.maxTouchPoints > 0),
      hardwareConcurrency: navigator.hardwareConcurrency || 4,
      timezone: (() => {
        try {
          return Intl.DateTimeFormat().resolvedOptions().timeZone;
        } catch {
          return 'Asia/Shanghai';
        }
      })(),
      cookieEnabled: navigator.cookieEnabled || true
    };
  } catch (error) {
    console.warn('设备信息收集失败:', error);
    return {
      userAgent: '',
      platform: '',
      language: 'zh-CN',
      screenWidth: 1920,
      screenHeight: 1080,
      pixelRatio: 1,
      touchSupport: false,
      hardwareConcurrency: 4,
      timezone: 'Asia/Shanghai',
      cookieEnabled: true
    };
  }
};

export default function Home() {
  const [user, setUser] = useState<User | null>(null);
  const [guestId, setGuestId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [systemSettings, setSystemSettings] = useState<any>(null);
  const [authChecked, setAuthChecked] = useState(false);
  const router = useRouter();

  // 加载系统设置
  const loadSystemSettings = async () => {
    try {
      console.log('加载系统设置...');
      const response = await fetch('/api/settings/public');
      
      if (response.ok) {
        const data = await response.json();
        console.log('系统设置加载成功:', data.settings);
        return data.settings || {};
      } else {
        console.warn('系统设置加载失败，使用默认值');
        return { guest_access_enabled: false }; // 默认关闭访客模式
      }
    } catch (error) {
      console.error('系统设置加载错误:', error);
      return { guest_access_enabled: false }; // 默认关闭访客模式
    }
  };

  // 初始化访客会话
  const initializeGuestSession = async () => {
    try {
      console.log('初始化访客会话...');
      
      const newGuestId = getOrCreateGuestId();
      console.log('访客ID:', newGuestId);
      
      const deviceInfo = collectDeviceInfo();
      console.log('设备信息收集完成');
      
      // 尝试创建访客会话（失败也无关紧要）
      try {
        const response = await fetch('/api/guest/session', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ guestId: newGuestId, deviceInfo })
        });
        
        if (response.ok) {
          console.log('访客会话创建成功');
        } else {
          console.warn('访客会话创建失败，但继续使用访客模式');
        }
      } catch (sessionError) {
        console.warn('访客会话API调用失败，但继续使用访客模式:', sessionError);
      }
      
      setGuestId(newGuestId);
      return newGuestId;
      
    } catch (error) {
      console.error('访客会话初始化失败:', error);
      // 即使失败也生成一个备用ID
      const fallbackGuestId = `guest_${Date.now()}_${Math.random().toString(36).substring(2, 15)}`;
      setGuestId(fallbackGuestId);
      return fallbackGuestId;
    }
  };

  // 检查用户认证状态（非强制）
  const checkAuthStatus = async () => {
    const supabase = createClient();
    
    try {
      console.log('检查用户认证状态...');
      
      const { data: { session } } = await supabase.auth.getSession();
      
      if (session?.user) {
        console.log('用户已登录:', session.user.email);
        setUser(session.user);
      } else {
        console.log('用户未登录');
        setUser(null);
      }
      
      setAuthChecked(true);
      
    } catch (error) {
      console.error('认证检查失败:', error);
      setUser(null);
      setAuthChecked(true);
    }
  };

  // 处理登录请求
  const handleLoginRequest = () => {
    router.push('/auth/login');
  };

  useEffect(() => {
    let subscription: any = null;
    
    const initializeApp = async () => {
      try {
        setLoading(true);
        console.log('开始初始化应用...');
        
        // 1. 设置认证状态监听
        const supabase = createClient();
        const { data: { subscription: authSubscription } } = supabase.auth.onAuthStateChange(
          (event, session) => {
            console.log('认证状态变化:', event, session?.user?.email || 'no user');
            
            if (session?.user) {
              setUser(session.user);
            } else {
              setUser(null);
            }
            
            setAuthChecked(true);
          }
        );
        subscription = authSubscription;
        
        // 2. 检查用户认证状态（优先）
        await checkAuthStatus();
        
        // 3. 加载系统设置
        const settings = await loadSystemSettings();
        setSystemSettings(settings);
        
        // 4. 如果允许访客模式，初始化访客会话
        if (settings.guest_access_enabled) {
          await initializeGuestSession();
        }
        
        console.log('应用初始化完成');
        
      } catch (error) {
        console.error('应用初始化失败:', error);
        // 设置默认值，确保应用能正常运行
        setSystemSettings({ guest_access_enabled: true, maintenance_mode: false });
        setAuthChecked(true);
      } finally {
        setLoading(false);
      }
    };

    initializeApp();

    return () => {
      if (subscription) {
        subscription.unsubscribe();
      }
    };
  }, []);

  // 加载中
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-pfa-light-gray to-white">
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-pfa-champagne-gold/30 border-t-pfa-champagne-gold rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-pfa-dark-gray">正在连接 AI 教练...</p>
          <p className="text-sm text-gray-500 mt-2">
            如果长时间无响应，请尝试
            <a 
              href="/troubleshoot" 
              className="text-blue-600 hover:text-blue-800 underline ml-1"
            >
              故障排查页面
            </a>
          </p>
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

  // 处理重定向逻辑
  useEffect(() => {
    if (authChecked && !systemSettings?.guest_access_enabled && !user) {
      router.push('/auth/login');
    }
  }, [authChecked, systemSettings?.guest_access_enabled, user, router]);

  // 访客模式关闭且用户未登录
  if (authChecked && !systemSettings?.guest_access_enabled && !user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-50">
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-blue-600/30 border-t-blue-600 rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">正在跳转到登录页面...</p>
        </div>
      </div>
    );
  }

  // 显示聊天界面
  // 如果访客模式开启：用户可以是已登录或访客状态
  // 如果访客模式关闭：只有已登录用户可以使用
  if (authChecked && (user || (systemSettings?.guest_access_enabled && guestId))) {
    return (
      <EnhancedDualWorkflowChat 
        user={user} 
        guestId={user ? null : guestId} // 已登录用户不使用访客ID
        onLoginRequest={handleLoginRequest}
      />
    );
  }

  // 等待状态完成
  return null;
}
