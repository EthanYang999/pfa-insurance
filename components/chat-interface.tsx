"use client";

import { useState, useRef, useEffect } from "react";
import { ChatMessage, TypingIndicator } from "@/components/chat-message";
import { ChatInput } from "@/components/chat-input";
import { DigitalHuman } from "@/components/digital-human";
import { LogoutButton } from "@/components/logout-button";
import { ArrowLeft } from "lucide-react";
import { useRouter } from "next/navigation";

interface Message {
  id: string;
  content: string;
  isUser: boolean;
  timestamp: Date;
}

interface User {
  email?: string;
  sub?: string;
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
  // 为整个会话生成唯一且持久的sessionId
  const [sessionId] = useState(() => `user_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

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

  // 直接调用n8n webhook，参考index.html的成功实现
  const sendMessageToN8N = async (message: string, retryCount = 0): Promise<string> => {
    try {
      console.log(`发送消息到N8N保险webhook (尝试 ${retryCount + 1}):`, { 
        message, 
        url: 'https://n8n.aifunbox.com/webhook/insurance',
        timestamp: new Date().toISOString()
      });

      const requestBody = {
        text: message,
        sessionId: sessionId
      };

      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 60000); // 60秒超时

      const response = await fetch('https://n8n.aifunbox.com/webhook/insurance', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        body: JSON.stringify(requestBody),
        signal: controller.signal
      });

      clearTimeout(timeoutId);
      console.log('N8N保险工作流响应状态:', response.status);

      // 处理不同的响应状态
      if (!response.ok) {
        if (response.status === 500 && retryCount < 2) {
          console.log(`服务器错误，1000ms后重试...`);
          await new Promise(resolve => setTimeout(resolve, 1000));
          return sendMessageToN8N(message, retryCount + 1);
        }
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      // 尝试解析响应
      const responseData = await response.json();
      console.log('N8N保险工作流响应数据:', responseData);

      // 提取AI回复，支持多种响应格式
      const aiReply = responseData.response || 
                      responseData.message || 
                      responseData.reply || 
                      responseData.data?.response ||
                      responseData.output ||
                      responseData.text;

      if (!aiReply) {
        console.warn('N8N工作流返回了空的回复');
        return '抱歉，我暂时无法理解您的问题。请您换个方式提问，我会尽力帮助您。';
      }

      return aiReply;

    } catch (error) {
      console.error(`N8N保险webhook调用失败 (尝试 ${retryCount + 1}):`, error);

      // 处理不同类型的错误
      if (error instanceof Error && error.name === 'AbortError') {
        return '请求超时了，请重新发送您的消息。';
      } else if (error instanceof Error && error.message.includes('Failed to fetch')) {
        return '网络连接有问题，请检查网络后重试。';
      } else if (retryCount >= 2) {
        return '系统暂时不稳定，请稍后再试。';
      } else {
        // 继续重试
        await new Promise(resolve => setTimeout(resolve, 1000));
        return sendMessageToN8N(message, retryCount + 1);
      }
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
      const aiResponse = await sendMessageToN8N(content);
      
      const aiMessage: Message = {
        id: (Date.now() + 1).toString(),
        content: aiResponse,
        isUser: false,
        timestamp: new Date(),
      };

      setMessages(prev => [...prev, aiMessage]);
    } catch (error) {
      console.error("Error sending message:", error);
      
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        content: "抱歉，发送消息时出现了错误。请稍后再试。",
        isUser: false,
        timestamp: new Date(),
      };

      setMessages(prev => [...prev, errorMessage]);
    }

    setIsLoading(false);
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
              <svg className="w-3 h-3 sm:w-4 sm:h-4 text-pfa-royal-blue" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
              </svg>
            </div>
            <div className="min-w-0 flex-1">
              <h1 className="font-bold text-base sm:text-lg truncate">AI教练雪莉</h1>
              <p className="text-pfa-champagne-gold text-xs hidden sm:block">专业保险培训助手</p>
            </div>
          </div>
        </div>
        
        <div className="flex items-center gap-1 sm:gap-2 flex-shrink-0">
          {/* 用户信息和登出 */}
          <div className="flex items-center gap-1 sm:gap-2">
            <span className="text-xs sm:text-sm text-pfa-champagne-gold hidden md:inline max-w-32 truncate">
              {user?.email?.split('@')[0] || "会员"}
            </span>
            <LogoutButton />
          </div>
        </div>
      </header>

      {/* 主要内容区域 */}
      <div className="flex-1 flex flex-col md:flex-row overflow-hidden">
        {/* 数字人展示区域 - 移动端顶部，桌面端左侧 */}
        <div className={`
          transition-all duration-300 ease-in-out
          ${isDigitalHumanMinimized 
            ? 'h-16 md:w-20' 
            : 'h-[33vh] md:h-full md:w-1/2'
          }
          md:border-r md:border-coach-gray-disabled
          flex-shrink-0
        `}>
          <DigitalHuman
            isMinimized={isDigitalHumanMinimized}
            onToggleMinimize={() => setIsDigitalHumanMinimized(!isDigitalHumanMinimized)}
          />
        </div>

        {/* 聊天区域 */}
        <div className={`
          flex-1 flex flex-col min-h-0
          ${isDigitalHumanMinimized ? 'md:w-full' : 'md:w-1/2'}
          transition-all duration-300 ease-in-out
        `}>
          {/* 消息列表 */}
          <div className="flex-1 overflow-y-auto p-3 sm:p-4 space-y-3 sm:space-y-4">
            {messages.map((message) => (
              <ChatMessage
                key={message.id}
                message={message.content}
                isUser={message.isUser}
                timestamp={message.timestamp}
              />
            ))}
            {isLoading && <TypingIndicator />}
            <div ref={messagesEndRef} />
          </div>

          {/* 输入区域 */}
          <div className="flex-shrink-0">
            <ChatInput
              onSendMessage={handleSendMessage}
              disabled={isLoading}
            />
          </div>
        </div>
      </div>
    </div>
  );
}