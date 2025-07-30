"use client";

import { useState, useRef, useEffect } from "react";
import { ChatMessage, TypingIndicator } from "@/components/chat-message";
import { ChatInput } from "@/components/chat-input";
import { DigitalHuman } from "@/components/digital-human";
import { LogoutButton } from "@/components/logout-button";
import { ArrowLeft, Save, AlertCircle, CheckCircle } from "lucide-react";
import { useRouter } from "next/navigation";
import { ChatResponse, ChatError, ChatMessage as DBChatMessage } from "@/types/chat";

interface Message {
  id: string;
  content: string;
  isUser: boolean;
  timestamp: Date;
}

interface User {
  email?: string;
  sub?: string;
  id?: string;
}

interface ChatInterfaceProps {
  user: User;
}

export function ChatInterface({ user }: ChatInterfaceProps) {
  const router = useRouter();
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "welcome",
      content: "您好！我是雪莉教练，您的AI保险培训助手。我可以帮助您学习产品知识、练习销售话术、解答专业问题。请告诉我您想了解什么？",
      isUser: false,
      timestamp: new Date(),
    },
  ]);
  const [isLoading, setIsLoading] = useState(false);
  // 移动端默认最小化数字人，桌面端默认展开
  const [isDigitalHumanMinimized, setIsDigitalHumanMinimized] = useState(false);
  // 数据库会话ID（由API返回或URL参数）
  const [sessionId, setSessionId] = useState<string | null>(null);
  // 聊天记录保存状态
  const [saveStatus, setSaveStatus] = useState<'saving' | 'saved' | 'error' | null>(null);
  // 是否正在加载历史记录
  const [loadingHistory, setLoadingHistory] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // 检查URL参数中的sessionId并加载历史记录
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const urlSessionId = params.get('sessionId');
    
    if (urlSessionId) {
      setSessionId(urlSessionId);
      loadChatHistory(urlSessionId);
    }
  }, []);

  // 加载聊天历史记录
  const loadChatHistory = async (sessionIdToLoad: string) => {
    try {
      setLoadingHistory(true);
      const response = await fetch(`/api/chat-history?sessionId=${sessionIdToLoad}`);
      
      if (!response.ok) {
        throw new Error('加载聊天历史失败');
      }
      
      const data = await response.json();
      
      if (data.messages && data.messages.length > 0) {
        // 转换消息格式
        const historyMessages: Message[] = data.messages.map((msg: DBChatMessage) => ({
          id: msg.id,
          content: msg.content,
          isUser: msg.message_type === 'user',
          timestamp: new Date(msg.created_at)
        }));
        
        // 替换欢迎消息为历史记录
        setMessages(historyMessages);
      }
    } catch (error) {
      console.error('加载聊天历史失败:', error);
      // 如果加载失败，保持默认欢迎消息
    } finally {
      setLoadingHistory(false);
    }
  };

  // 响应式初始化：检测屏幕尺寸来决定数字人初始状态
  useEffect(() => {
    const handleResize = () => {
      // const isMobile = window.innerWidth < 768; // md breakpoint
      // 可以根据需要调整初始化逻辑，目前保持不变
    };

    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // 通过API代理调用n8n webhook并保存聊天记录
  const sendMessageWithHistory = async (message: string, retryCount = 0): Promise<string> => {
    try {
      setSaveStatus('saving');
      console.log(`发送消息到聊天API (尝试 ${retryCount + 1}):`, { 
        message, 
        sessionId: sessionId,
        userId: user.id,
        timestamp: new Date().toISOString()
      });

      const requestBody = {
        message: message,
        sessionId: sessionId || undefined,
        sessionType: 'general' as const
      };

      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 65000); // 65秒超时（比API内部超时稍长）

      const response = await fetch('/api/chat-with-history', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        body: JSON.stringify(requestBody),
        signal: controller.signal
      });

      clearTimeout(timeoutId);
      console.log('聊天API响应状态:', response.status);

      // 处理API响应
      if (!response.ok) {
        const errorData: ChatError = await response.json().catch(() => ({ error: '未知错误' }));
        
        if (response.status === 500 && retryCount < 2) {
          console.log(`服务器错误，1000ms后重试...`);
          await new Promise(resolve => setTimeout(resolve, 1000));
          return sendMessageWithHistory(message, retryCount + 1);
        }
        
        setSaveStatus('error');
        throw new Error(errorData.error || `HTTP ${response.status}: ${response.statusText}`);
      }

      const responseData: ChatResponse = await response.json();
      console.log('聊天API响应数据:', responseData);

      // 更新sessionId（如果是新会话）
      if (responseData.sessionId && !sessionId) {
        setSessionId(responseData.sessionId);
      }

      // 设置保存状态
      if (responseData.metadata?.messagesSaved) {
        setSaveStatus('saved');
        // 2秒后隐藏保存状态提示
        setTimeout(() => setSaveStatus(null), 2000);
      } else {
        setSaveStatus('error');
        setTimeout(() => setSaveStatus(null), 3000);
      }

      console.log('AI回复:', responseData.response);
      console.log('响应时间:', responseData.responseTime + 'ms');
      
      return responseData.response;

    } catch (error) {
      console.error(`聊天API调用失败 (尝试 ${retryCount + 1}):`, error);
      setSaveStatus('error');
      setTimeout(() => setSaveStatus(null), 3000);

      // 处理不同类型的错误
      if (error instanceof Error && error.name === 'AbortError') {
        return '请求超时了，请重新发送您的消息。';
      } else if (error instanceof Error && error.message.includes('Failed to fetch')) {
        return '网络连接有问题，请检查网络后重试。';
      } else if (error instanceof Error && error.message.includes('未授权')) {
        return '登录已过期，请重新登录。';
      } else if (retryCount >= 2) {
        return '系统暂时不稳定，请稍后再试。';
      }

      // 递归重试
      console.log(`1500ms后进行第${retryCount + 2}次重试...`);
      await new Promise(resolve => setTimeout(resolve, 1500));
      return sendMessageWithHistory(message, retryCount + 1);
    }
  };

  const handleSendMessage = async (content: string) => {
    const userMessage: Message = {
      id: Date.now().toString(),
      content,
      isUser: true,
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, userMessage]);
    setIsLoading(true);

    try {
      const aiResponse = await sendMessageWithHistory(content);
      
      const aiMessage: Message = {
        id: (Date.now() + 1).toString(),
        content: aiResponse,
        isUser: false,
        timestamp: new Date(),
      };

      setMessages(prev => [...prev, aiMessage]);
    } catch (error) {
      console.error('处理消息失败:', error);
      
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        content: "抱歉，出现了一些问题。请重新发送您的消息。",
        isUser: false,
        timestamp: new Date(),
      };

      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  // 保存状态指示器组件
  const SaveStatusIndicator = () => {
    if (!saveStatus) return null;

    const statusConfig = {
      saving: { icon: Save, text: '保存中...', className: 'text-blue-600' },
      saved: { icon: CheckCircle, text: '已保存', className: 'text-green-600' },
      error: { icon: AlertCircle, text: '保存失败', className: 'text-red-600' }
    };

    const config = statusConfig[saveStatus];
    const Icon = config.icon;

    return (
      <div className={`flex items-center gap-1 text-xs ${config.className} animate-fade-in`}>
        <Icon className="h-3 w-3" />
        <span>{config.text}</span>
      </div>
    );
  };

  return (
    <div className="h-screen w-full flex flex-col bg-gradient-to-br from-pfa-light-gray to-white">
      {/* 顶部导航栏 */}
      <header className="bg-pfa-royal-blue text-white px-3 sm:px-4 py-3 flex items-center justify-between shadow-lg">
        {/* 返回按钮 */}
        <button
          onClick={() => router.push('/')}
          className="flex items-center gap-2 text-white hover:text-pfa-champagne-gold transition-colors"
        >
          <ArrowLeft className="h-5 w-5" />
          <span className="hidden sm:inline">返回首页</span>
        </button>

        <div className="flex items-center gap-2 sm:gap-3 flex-1 min-w-0 justify-center">
          <div className="flex items-center gap-1.5 sm:gap-2 min-w-0">
            <div className="w-7 h-7 sm:w-8 sm:h-8 bg-pfa-champagne-gold rounded-full flex items-center justify-center flex-shrink-0">
              <span className="text-pfa-royal-blue font-bold text-sm sm:text-base">雪</span>
            </div>
            <div className="min-w-0">
              <h1 className="font-bold text-sm sm:text-base text-white truncate">
                金牌保险教练 - 雪梨 (Shirley)
              </h1>
              <div className="flex items-center gap-2">
                <p className="text-pfa-champagne-gold text-xs">在线</p>
                <SaveStatusIndicator />
              </div>
            </div>
          </div>
        </div>

        {/* 用户信息和退出按钮 */}
        <div className="flex items-center gap-2 sm:gap-3">
          <button
            onClick={() => router.push('/chat-history')}
            className="text-white hover:text-pfa-champagne-gold transition-colors"
            title="聊天历史"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </button>
          <span className="text-pfa-champagne-gold text-xs sm:text-sm">
            {user?.email?.split('@')[0] || '会员'}
          </span>
          <LogoutButton />
        </div>
      </header>

      {/* 主要内容区域 - 使用flex布局 */}
      <div className="flex-1 flex flex-col sm:flex-row min-h-0">
        {/* 数字人区域 */}
        <div 
          className={`
            ${isDigitalHumanMinimized ? 'h-[10vh] sm:w-16' : 'h-[33vh] sm:h-full sm:w-80'} 
            sm:h-full border-b sm:border-b-0 sm:border-r border-gray-200 bg-gradient-to-br from-pfa-royal-blue/5 to-pfa-navy-blue/10 
            transition-all duration-500 ease-in-out flex-shrink-0 relative overflow-hidden
          `}
        >
          <DigitalHuman 
            isMinimized={isDigitalHumanMinimized}
            onToggleMinimize={() => setIsDigitalHumanMinimized(!isDigitalHumanMinimized)}
          />
        </div>

        {/* 聊天区域 */}
        <div className="flex-1 flex flex-col min-h-0">
          {/* 消息列表 */}
          <div className="flex-1 overflow-y-auto p-3 sm:p-4 space-y-4">
            {loadingHistory ? (
              <div className="flex items-center justify-center py-8">
                <div className="text-center">
                  <div className="w-6 h-6 border-2 border-pfa-champagne-gold/30 border-t-pfa-champagne-gold rounded-full animate-spin mx-auto mb-2"></div>
                  <p className="text-sm text-gray-500">正在加载聊天历史...</p>
                </div>
              </div>
            ) : (
              <>
                {messages.map((message) => (
                  <ChatMessage 
                    key={message.id} 
                    message={message.content} 
                    isUser={message.isUser}
                    timestamp={message.timestamp}
                  />
                ))}
                {isLoading && <TypingIndicator />}
              </>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* 输入区域 */}
          <div className="border-t bg-white p-3 sm:p-4">
            <ChatInput onSendMessage={handleSendMessage} disabled={isLoading} />
          </div>
        </div>
      </div>
    </div>
  );
}