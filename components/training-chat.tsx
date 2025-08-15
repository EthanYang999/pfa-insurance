"use client";

import { useState, useRef, useEffect } from "react";
import { ChatInput } from "@/components/chat-input";
import { LogoutButton } from "@/components/logout-button";
import { Bot, User as UserIcon, Brain, Loader } from "lucide-react";
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { FeedbackModal } from "@/components/feedback-modal";
import { type SimpleVoiceButtonRef } from "@/components/voice/SimpleVoiceButton";
import { LoginButton } from "@/components/LoginButton";
import { ChatHistoryButton } from "@/components/ChatHistoryButton";
import { User } from "@supabase/supabase-js";

interface Message {
  id: string;
  content: string;
  isUser: boolean;
  timestamp: Date;
  aiService?: 'n8n' | 'system';
  isLoading?: boolean;
}

interface ChatInterfaceProps {
  user: User | null;           // null表示访客模式
  guestId?: string | null;     // 访客模式的ID
  onLoginRequest?: () => void; // 登录请求回调
}

export function TrainingChat({ user, guestId, onLoginRequest }: ChatInterfaceProps) {
  // 生成会话ID的函数
  const generateSessionId = () => {
    return Math.random().toString(36).substring(2) + Date.now().toString(36);
  };

  const [messages, setMessages] = useState<Message[]>([
    {
      id: "welcome",
      content: "您好！我是AI实战教练（培训模式）。我专注于为您提供专业的保险知识培训和实战技能指导。请告诉我您想学习什么内容？",
      isUser: false,
      timestamp: new Date(),
      aiService: 'system'
    },
  ]);
  const [isLoading, setIsLoading] = useState(false);
  const [conversationId, setConversationId] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const voiceButtonRef = useRef<SimpleVoiceButtonRef>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // 调用N8N Training Webhook
  const sendMessageToN8NTraining = async (content: string) => {
    const userMessage: Message = {
      id: `user_${Date.now()}`,
      content,
      isUser: true,
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, userMessage]);
    setIsLoading(true);

    const aiMessageId = `ai_${Date.now()}`;
    const aiMessage: Message = {
      id: aiMessageId,
      content: '',
      isUser: false,
      timestamp: new Date(),
      aiService: 'n8n',
      isLoading: true
    };

    setMessages(prev => [...prev, aiMessage]);

    try {
      // 获取或生成会话ID
      const sessionId = conversationId || generateSessionId();
      if (!conversationId) {
        setConversationId(sessionId);
      }

      console.log('调用N8N Training webhook:', {
        message: content.substring(0, 50) + "...",
        sessionId,
        user: user?.id || guestId
      });

      const response = await fetch('https://n8nprd.aifunbox.com/webhook/training', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify({
          text: content,
          sessionId: sessionId,
          userId: user?.id || guestId,
          userType: user ? 'registered' : 'guest'
        })
      });
      
      if (!response.ok) {
        console.error('N8N Training webhook错误:', response.status, response.statusText);
        throw new Error(`Training webhook响应错误: ${response.status} ${response.statusText}`);
      }
      
      const data = await response.json();
      console.log('N8N Training webhook响应:', data);
      
      const responseContent = data.output || data.response || data.text || "抱歉，AI实战教练暂时无法处理您的请求。请稍后重试。";
      
      setMessages(prev => prev.map(msg => 
        msg.id === aiMessageId 
          ? { 
              ...msg, 
              content: responseContent,
              isLoading: false
            }
          : msg
      ));
      
    } catch (error) {
      console.error('N8N Training webhook调用失败:', error);
      
      setMessages(prev => prev.map(msg => 
        msg.id === aiMessageId 
          ? {
              ...msg,
              content: `抱歉，出现了一些问题：${error instanceof Error ? error.message : '未知错误'}。请重新发送您的消息。`,
              aiService: 'system',
              isLoading: false
            }
          : msg
      ));
    } finally {
      setIsLoading(false);
    }
  };

  // 发送消息方法
  const handleSendMessage = async (content: string) => {
    // 🚀 用户发送新消息时，彻底清理上一条AI回复的语音播放
    if (voiceButtonRef.current?.isActive()) {
      console.log('🧹 用户发送新消息，彻底停止并重置上一条AI回复的语音播放');
      try {
        voiceButtonRef.current.resetStreaming();
      } catch (error) {
        console.error('重置语音状态失败:', error);
      }
    }
    
    await sendMessageToN8NTraining(content);
  };

  // 消息组件
  const MessageComponent = ({ message }: { message: Message }) => {
    const formatTime = (date: Date) => {
      return date.toLocaleTimeString('zh-CN', { 
        hour: '2-digit', 
        minute: '2-digit' 
      });
    };

    if (message.isUser) {
      return (
        <div className="flex justify-end mb-4">
          <div className="flex items-start gap-2 max-w-[80%]">
            <div className="bg-green-600 text-white rounded-2xl px-4 py-2 max-w-full">
              <p className="text-sm whitespace-pre-wrap break-words">{message.content}</p>
              <p className="text-xs text-green-100 mt-1 opacity-75">
                {formatTime(message.timestamp)}
              </p>
            </div>
            <div className="w-8 h-8 bg-green-200 rounded-full flex items-center justify-center flex-shrink-0">
              <UserIcon className="w-4 h-4 text-green-700" />
            </div>
          </div>
        </div>
      );
    }

    return (
      <div className="flex justify-start mb-4">
        <div className="flex items-start gap-2 max-w-[80%]">
          <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center flex-shrink-0">
            <Brain className="w-4 h-4 text-white" />
          </div>
          
          <div className="flex-1">
            <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-2xl px-4 py-2">
              <div className="flex items-center gap-2 mb-2 pb-2 border-b border-blue-200">
                <Brain className="w-4 h-4 text-blue-600" />
                <span className="text-sm font-medium text-blue-700">AI实战教练（培训模式）</span>
              </div>
              
              <div className="text-sm text-gray-800">
                {message.isLoading ? (
                  <div className="flex items-center gap-2">
                    <Loader className="w-4 h-4 animate-spin text-blue-600" />
                    <span>正在为您分析和准备培训内容...</span>
                  </div>
                ) : message.content ? (
                  <ReactMarkdown 
                    remarkPlugins={[remarkGfm]}
                    components={{
                      h1: ({children}) => <h1 className="text-xl font-bold text-blue-700 mb-3 mt-4 first:mt-0">{children}</h1>,
                      h2: ({children}) => <h2 className="text-lg font-bold text-blue-700 mb-2 mt-3 first:mt-0">{children}</h2>,
                      h3: ({children}) => <h3 className="text-base font-bold text-blue-700 mb-2 mt-3 first:mt-0">{children}</h3>,
                      h4: ({children}) => <h4 className="text-sm font-bold text-blue-700 mb-1 mt-2 first:mt-0">{children}</h4>,
                      p: ({children}) => <p className="mb-2 last:mb-0 whitespace-pre-wrap break-words">{children}</p>,
                      strong: ({children}) => <strong className="font-bold text-gray-900">{children}</strong>,
                      em: ({children}) => <em className="italic text-gray-700">{children}</em>,
                      ul: ({children}) => <ul className="list-none space-y-1 mb-2 ml-4">{children}</ul>,
                      ol: ({children}) => <ol className="list-decimal space-y-1 mb-2 ml-6">{children}</ol>,
                      li: ({children}) => <li className="relative pl-3 before:content-['•'] before:text-blue-600 before:font-bold before:absolute before:left-0">{children}</li>,
                      blockquote: ({children}) => <blockquote className="border-l-4 border-blue-500 pl-4 italic text-gray-600 my-2">{children}</blockquote>,
                      code: ({children}) => <code className="bg-gray-100 px-1 py-0.5 rounded text-sm font-mono">{children}</code>,
                      pre: ({children}) => <pre className="bg-gray-50 p-3 rounded-lg overflow-x-auto text-sm font-mono my-2">{children}</pre>,
                      hr: () => <hr className="border-0 border-t border-gray-300 my-4" />,
                      a: ({children, href}) => <a href={href} className="text-blue-600 hover:text-blue-800 underline" target="_blank" rel="noopener noreferrer">{children}</a>,
                    }}
                  >
                    {message.content}
                  </ReactMarkdown>
                ) : null}
              </div>
              
              <div className="flex items-center justify-between mt-2">
                <div className="flex items-center gap-2">
                  <span className="inline-flex items-center gap-1 text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded-full">
                    <Brain className="w-3 h-3" />
                    培训模式
                  </span>
                  <p className="text-xs text-gray-500">
                    {formatTime(message.timestamp)}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="h-screen w-full flex flex-col bg-gradient-to-br from-green-50 to-blue-50">
      {/* 顶部导航栏 */}
      <header className="bg-gradient-to-r from-blue-600 to-green-600 text-white px-3 sm:px-4 py-3 flex items-center justify-between shadow-lg">
        <div className="flex items-center gap-2 sm:gap-3 flex-1 min-w-0 justify-center">
          <div className="flex items-center gap-1.5 sm:gap-2 min-w-0">
            <div className="w-7 h-7 sm:w-8 sm:h-8 bg-white/20 rounded-full flex items-center justify-center flex-shrink-0">
              <Brain className="text-white font-bold text-sm sm:text-base w-4 h-4 sm:w-5 sm:h-5" />
            </div>
            <div className="min-w-0">
              <h1 className="font-bold text-sm sm:text-base text-white truncate">
                AI实战教练（培训模式）
              </h1>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2 sm:gap-3">
          {user ? (
            // 已登录用户：显示用户信息 + 聊天历史 + 反馈 + 登出
            <>
              <span className="text-green-100 text-xs sm:text-sm">
                {user.email?.split('@')[0] || '会员'}
              </span>
              <ChatHistoryButton user={user} />
              <FeedbackModal userEmail={user.email} userId={user.id} />
              <LogoutButton />
            </>
          ) : (
            // 访客模式：显示访客标识 + 登录按钮
            <>
              <span className="text-green-100 text-xs sm:text-sm">
                访客模式
              </span>
              {onLoginRequest && <LoginButton onClick={onLoginRequest} />}
            </>
          )}
        </div>
      </header>

      {/* 主要内容区域 - 聊天区域占满全屏 */}
      <div className="flex-1 flex flex-col min-h-0">
        {/* 消息列表 */}
        <div className="flex-1 overflow-y-auto p-3 sm:p-4 space-y-4">
          {messages.map((message) => (
            <MessageComponent key={message.id} message={message} />
          ))}
          <div ref={messagesEndRef} />
        </div>

        {/* 输入区域 */}
        <div className="border-t bg-white p-3 sm:p-4">
          <ChatInput 
            onSendMessage={handleSendMessage} 
            disabled={isLoading}
            placeholder="请输入您想学习的保险知识或培训内容..."
            voiceButtonRef={voiceButtonRef}
          />
        </div>
      </div>
    </div>
  );
}