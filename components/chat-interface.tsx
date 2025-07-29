"use client";

import { useState, useRef, useEffect } from "react";
import { ChatMessage, TypingIndicator } from "@/components/chat-message";
import { ChatInput } from "@/components/chat-input";
import { DigitalHuman } from "@/components/digital-human";
import { LogoutButton } from "@/components/logout-button";
import { Mic } from "lucide-react";

interface Message {
  id: string;
  content: string;
  isUser: boolean;
  timestamp: Date;
}

interface ChatInterfaceProps {
  user: any;
}

export function ChatInterface({ user }: ChatInterfaceProps) {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "welcome",
      content: "您好！我是雪莉教练，您的AI保险培训助手。我可以帮助您学习产品知识、练习销售话术、解答专业问题。请告诉我您想了解什么？",
      isUser: false,
      timestamp: new Date(),
    },
  ]);
  const [isLoading, setIsLoading] = useState(false);
  const [isDigitalHumanMinimized, setIsDigitalHumanMinimized] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

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
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          message: content,
          userId: user?.sub,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to send message");
      }

      const data = await response.json();
      
      const aiMessage: Message = {
        id: (Date.now() + 1).toString(),
        content: data.response || "抱歉，我现在无法回复您的消息。请稍后再试。",
        isUser: false,
        timestamp: new Date(),
      };

      setMessages(prev => [...prev, aiMessage]);
    } catch (error) {
      console.error("Error sending message:", error);
      
      // 网络错误时的错误提示
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        content: "抱歉，发送消息时出现了网络错误。请检查您的网络连接并重试。",
        isUser: false,
        timestamp: new Date(),
      };

      setMessages(prev => [...prev, errorMessage]);
    }

    setIsLoading(false);
  };

  return (
    <div className="h-screen w-full flex flex-col bg-coach-gray-light">
      {/* 顶部导航栏 */}
      <header className="bg-coach-blue-primary text-white px-4 py-3 flex items-center justify-between shadow-lg">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-coach-gold-accent rounded-full flex items-center justify-center">
              <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
              </svg>
            </div>
            <div>
              <h1 className="font-bold text-lg">AI教练雪莉</h1>
              <p className="text-coach-gold-light text-xs">专业保险培训助手</p>
            </div>
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          {/* 语音功能入口 (预留) */}
          <button
            className="w-10 h-10 bg-white/10 hover:bg-white/20 rounded-md flex items-center justify-center transition-colors"
            title="语音功能 (即将上线)"
            disabled
          >
            <Mic className="w-4 h-4" />
          </button>
          
          {/* 用户信息和登出 */}
          <div className="flex items-center gap-2">
            <span className="text-sm text-coach-gold-light hidden sm:inline">
              {user?.email || "用户"}
            </span>
            <LogoutButton />
          </div>
        </div>
      </header>

      {/* 主要内容区域 */}
      <div className="flex-1 flex overflow-hidden">
        {/* 数字人展示区域 - 桌面端左侧，移动端顶部 */}
        <div className={`
          transition-all duration-300 ease-in-out
          md:w-2/5 md:border-r md:border-coach-gray-disabled
          ${isDigitalHumanMinimized ? 'md:w-16' : 'md:w-2/5'}
          md:block
          ${isDigitalHumanMinimized ? 'h-16' : 'h-32'} md:h-full
        `}>
          <DigitalHuman
            isMinimized={isDigitalHumanMinimized}
            onToggleMinimize={() => setIsDigitalHumanMinimized(!isDigitalHumanMinimized)}
          />
        </div>

        {/* 聊天区域 */}
        <div className={`
          flex-1 flex flex-col
          ${isDigitalHumanMinimized ? 'md:w-full' : 'md:w-3/5'}
          transition-all duration-300 ease-in-out
        `}>
          {/* 消息列表 */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
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
          <ChatInput
            onSendMessage={handleSendMessage}
            disabled={isLoading}
          />
        </div>
      </div>
    </div>
  );
}