"use client";

import { useState, useRef, useEffect } from "react";
import { ChatInput } from "@/components/chat-input";
import { LogoutButton } from "@/components/logout-button";
import { ArrowLeft, Bot, User, Brain, Zap, Loader } from "lucide-react";
import { useRouter } from "next/navigation";

// 新的Message接口
interface Message {
  id: string;
  content: string;
  isUser: boolean;
  timestamp: Date;
  aiService?: 'dify' | 'n8n' | 'system';
  answerType?: 'quick' | 'professional';
  showProfessionalButton?: boolean;
  isLoadingProfessional?: boolean;
}

interface User {
  email?: string;
  sub?: string;
  id?: string;
}

interface ChatInterfaceProps {
  user: User;
}

export function DualWorkflowChatInterface({ user }: ChatInterfaceProps) {
  const router = useRouter();
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "welcome",
      content: "您好！我是PFA智能助手，您的AI保险培训助手。我可以帮助您学习产品知识、练习销售话术、解答专业问题。我会先为您提供快速回答，如需更专业的建议，可点击「获取专业回答」。",
      isUser: false,
      timestamp: new Date(),
      aiService: 'system'
    },
  ]);
  const [isLoading, setIsLoading] = useState(false);
  const [conversationId, setConversationId] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // 发送消息到Dify (流式回答)
  const sendMessageToDifyStream = async (
    message: string, 
    onChunk: (chunk: string) => void,
    onComplete: (completeResponse: string, conversationId?: string) => void,
    onError: (error: string) => void
  ): Promise<void> => {
    const requestBody: {
      message: string;
      user: string;
      conversationId?: string;
    } = {
      message,
      user: user.id || user.sub || `user_${Date.now()}`
    };
    
    // 只有当conversationId存在时才传递
    if (conversationId) {
      requestBody.conversationId = conversationId;
    }
    
    console.log('发送Dify流式请求:', { ...requestBody, conversationId: conversationId || 'NEW_CONVERSATION' });
    
    try {
      const response = await fetch('/api/dify-chat-stream', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Accept': 'text/event-stream'
        },
        body: JSON.stringify(requestBody)
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        console.error('Dify流式API错误:', errorData);
        onError(errorData.error || errorData.details || '调用Dify流式API失败');
        return;
      }
      
      const reader = response.body?.getReader();
      const decoder = new TextDecoder();
      
      if (!reader) {
        onError('无法读取流式响应');
        return;
      }
      
      let completeResponse = '';
      let newConversationId: string | undefined = conversationId || undefined;
      
      while (true) {
        const { done, value } = await reader.read();
        
        if (done) break;
        
        const chunk = decoder.decode(value, { stream: true });
        const lines = chunk.split('\n');
        
        for (const line of lines) {
          if (line.startsWith('data: ')) {
            try {
              const jsonStr = line.slice(6).trim();
              if (!jsonStr) continue;
              
              const eventData = JSON.parse(jsonStr);
              
              if (eventData.event === 'message_chunk') {
                // 接收到消息块
                const chunkText = eventData.chunk || '';
                completeResponse += chunkText;
                onChunk(chunkText);
                
                // 更新会话ID
                if (eventData.conversation_id && eventData.conversation_id !== newConversationId) {
                  newConversationId = eventData.conversation_id;
                }
              } else if (eventData.event === 'message_complete') {
                // 消息完成
                console.log('流式消息完成:', {
                  completeResponse: completeResponse.length,
                  conversationId: eventData.conversation_id
                });
                onComplete(completeResponse, eventData.conversation_id || newConversationId);
                return;
              } else if (eventData.event === 'stream_end') {
                // 流结束
                console.log('流式传输结束');
                onComplete(completeResponse, eventData.conversation_id || newConversationId);
                return;
              } else if (eventData.event === 'error') {
                // 错误事件
                onError(eventData.error || '流式处理出错');
                return;
              }
            } catch (parseError) {
              console.error('解析流式数据失败:', parseError, 'Raw line:', line);
            }
          }
        }
      }
      
      // 如果循环结束但没有收到完成事件，手动触发完成
      if (completeResponse) {
        onComplete(completeResponse, newConversationId);
      }
      
    } catch (error) {
      console.error('流式请求失败:', error);
      onError(error instanceof Error ? error.message : '流式请求失败');
    }
  };

  // 获取专业回答 (N8N)
  const getProfessionalAnswer = async (messageId: string) => {
    // 设置加载状态
    setMessages(prev => prev.map(msg => 
      msg.id === messageId 
        ? { ...msg, isLoadingProfessional: true, showProfessionalButton: false }
        : msg
    ));

    try {
      // 获取当前对话历史 (排除系统欢迎消息)
      const conversationHistory = messages
        .filter(msg => msg.id !== 'welcome' && msg.aiService !== 'system')
        .map(msg => ({
          role: msg.isUser ? 'user' as const : 'assistant' as const,
          content: msg.content
        }));

      console.log('发送专业回答请求:', {
        conversationHistory: conversationHistory.length,
        messageId,
        conversationId
      });

      const response = await fetch('/api/n8n-professional', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          conversationHistory,
          messageId,
          conversationId
        })
      });
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: `HTTP ${response.status}错误` }));
        console.error('N8N专业API前端错误:', errorData);
        throw new Error(errorData.error || errorData.details || '获取专业回答失败');
      }
      
      const data = await response.json();
      
      // 隐藏快速回答的专业回答按钮和加载状态
      setMessages(prev => prev.map(msg => 
        msg.id === messageId 
          ? { 
              ...msg, 
              showProfessionalButton: false,
              isLoadingProfessional: false
            }
          : msg
      ));
      
      // 添加新的专业回答消息
      const professionalMessage: Message = {
        id: `professional_${Date.now()}`,
        content: data.response,
        isUser: false,
        timestamp: new Date(),
        aiService: 'n8n',
        answerType: 'professional',
        showProfessionalButton: false
      };
      
      setMessages(prev => [...prev, professionalMessage]);
      
    } catch (error) {
      console.error('获取专业回答失败:', error);
      // 恢复按钮状态
      setMessages(prev => prev.map(msg => 
        msg.id === messageId 
          ? { 
              ...msg, 
              isLoadingProfessional: false, 
              showProfessionalButton: true 
            }
          : msg
      ));
      
      // 可以在这里添加错误提示toast
      alert('获取专业回答失败，请重试');
    }
  };

  // 处理发送消息（流式）
  const handleSendMessage = async (content: string) => {
    const userMessage: Message = {
      id: `user_${Date.now()}`,
      content,
      isUser: true,
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, userMessage]);
    setIsLoading(true);

    // 创建一个初始的AI消息占位符
    const aiMessageId = `ai_${Date.now()}`;
    const aiMessage: Message = {
      id: aiMessageId,
      content: '', // 开始时为空，会逐步填充
      isUser: false,
      timestamp: new Date(),
      aiService: 'dify',
      answerType: 'quick',
      showProfessionalButton: false // 流式完成后再显示
    };

    setMessages(prev => [...prev, aiMessage]);

    try {
      // 使用流式API获取快速回答
      await sendMessageToDifyStream(
        content,
        // onChunk: 接收到新的文本块时更新消息内容
        (chunk: string) => {
          setMessages(prev => prev.map(msg => 
            msg.id === aiMessageId 
              ? { ...msg, content: msg.content + chunk }
              : msg
          ));
        },
        // onComplete: 流式传输完成时
        (completeResponse: string, newConversationId?: string) => {
          // 更新会话ID
          if (newConversationId) {
            if (!conversationId || newConversationId !== conversationId) {
              setConversationId(newConversationId);
              console.log('更新会话ID:', { 
                old: conversationId || 'NULL', 
                new: newConversationId 
              });
            }
          }
          
          // 显示专业回答按钮
          setMessages(prev => prev.map(msg => 
            msg.id === aiMessageId 
              ? { 
                  ...msg, 
                  content: completeResponse,
                  showProfessionalButton: true 
                }
              : msg
          ));
          
          setIsLoading(false);
        },
        // onError: 发生错误时
        (error: string) => {
          console.error('流式发送消息失败:', error);
          
          // 替换AI消息为错误消息
          setMessages(prev => prev.map(msg => 
            msg.id === aiMessageId 
              ? {
                  ...msg,
                  content: `抱歉，出现了一些问题：${error}。请重新发送您的消息。`,
                  aiService: 'system',
                  showProfessionalButton: false
                }
              : msg
          ));
          
          setIsLoading(false);
        }
      );
    } catch (error) {
      console.error('发送消息失败:', error);
      
      // 替换AI消息为错误消息
      setMessages(prev => prev.map(msg => 
        msg.id === aiMessageId 
          ? {
              ...msg,
              content: `抱歉，出现了一些问题：${error instanceof Error ? error.message : '未知错误'}。请重新发送您的消息。`,
              aiService: 'system',
              showProfessionalButton: false
            }
          : msg
      ));
      
      setIsLoading(false);
    }
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
            <div className="bg-pfa-royal-blue text-white rounded-2xl px-4 py-2 max-w-full">
              <p className="text-sm whitespace-pre-wrap break-words">{message.content}</p>
              <p className="text-xs text-pfa-champagne-gold mt-1 opacity-75">
                {formatTime(message.timestamp)}
              </p>
            </div>
            <div className="w-8 h-8 bg-pfa-champagne-gold rounded-full flex items-center justify-center flex-shrink-0">
              <User className="w-4 h-4 text-pfa-royal-blue" />
            </div>
          </div>
        </div>
      );
    }

    return (
      <div className="flex justify-start mb-4">
        <div className="flex items-start gap-2 max-w-[80%]">
          {/* AI头像 */}
          <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
            message.aiService === 'n8n' ? 'bg-green-500' : 
            message.aiService === 'dify' ? 'bg-blue-500' : 'bg-gray-500'
          }`}>
            <Bot className="w-4 h-4 text-white" />
          </div>
          
          <div className="flex-1">
            {/* 消息内容 */}
            <div className={`rounded-2xl px-4 py-2 ${
              message.aiService === 'n8n' 
                ? 'bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200' 
                : 'bg-gray-100'
            }`}>
              {/* 专业回答特殊标题 */}
              {message.aiService === 'n8n' && (
                <div className="flex items-center gap-2 mb-2 pb-2 border-b border-green-200">
                  <Brain className="w-4 h-4 text-green-600" />
                  <span className="text-sm font-medium text-green-700">AI专业教练深度分析</span>
                </div>
              )}
              
              <p className="text-sm text-gray-800 whitespace-pre-wrap break-words">
                {message.content}
                {/* 流式输入指示器 */}
                {message.aiService === 'dify' && message.content && !message.showProfessionalButton && (
                  <span className="inline-block w-1 h-4 bg-blue-500 ml-1 animate-pulse"></span>
                )}
              </p>
              
              {/* 回答类型标识 */}
              <div className="flex items-center justify-between mt-2">
                <div className="flex items-center gap-2">
                  {message.aiService === 'dify' && (
                    <span className="inline-flex items-center gap-1 text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded-full">
                      <Zap className="w-3 h-3" />
                      快速回答
                    </span>
                  )}
                  {message.aiService === 'n8n' && (
                    <span className="inline-flex items-center gap-1 text-xs bg-green-100 text-green-700 px-2 py-1 rounded-full">
                      <Brain className="w-3 h-3" />
                      专业回答
                    </span>
                  )}
                  <p className="text-xs text-gray-500">
                    {formatTime(message.timestamp)}
                  </p>
                </div>
              </div>
            </div>
            
            {/* 专业回答按钮 */}
            {message.showProfessionalButton && !message.isLoadingProfessional && (
              <div className="mt-3 p-3 bg-gradient-to-r from-green-50 to-blue-50 rounded-lg border border-green-200">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-700 mb-1">
                      需要更专业的回答？
                    </p>
                    <p className="text-xs text-gray-500">
                      AI专业教练将为您提供更详细的分析和建议（约30秒）
                    </p>
                  </div>
                  <button
                    onClick={() => getProfessionalAnswer(message.id)}
                    className="ml-3 inline-flex items-center gap-2 bg-gradient-to-r from-green-500 to-blue-500 text-white px-4 py-2 rounded-lg text-sm font-medium hover:from-green-600 hover:to-blue-600 transition-all duration-200 shadow-md hover:shadow-lg"
                  >
                    <Brain className="w-4 h-4" />
                    获取专业回答
                  </button>
                </div>
              </div>
            )}
            
            {/* 加载专业回答状态 */}
            {message.isLoadingProfessional && (
              <div className="mt-3 p-3 bg-gradient-to-r from-green-50 to-blue-50 rounded-lg border border-green-200">
                <div className="flex items-center gap-3">
                  <Loader className="w-5 h-5 text-green-600 animate-spin" />
                  <div>
                    <p className="text-sm font-medium text-gray-700">
                      正在获取专业回答...
                    </p>
                    <p className="text-xs text-gray-500">
                      AI专业教练正在为您分析，预计需要30秒
                    </p>
                  </div>
                </div>
                <div className="mt-2 w-full bg-gray-200 rounded-full h-1">
                  <div className="bg-gradient-to-r from-green-500 to-blue-500 h-1 rounded-full animate-pulse" style={{width: '70%'}}></div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  };

  // 打字指示器
  const TypingIndicator = () => (
    <div className="flex justify-start mb-4">
      <div className="flex items-start gap-2">
        <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center">
          <Bot className="w-4 h-4 text-white" />
        </div>
        <div className="bg-gray-100 rounded-2xl px-4 py-2">
          <div className="flex items-center gap-1">
            <div className="flex gap-1">
              <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
              <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{animationDelay: '0.1s'}}></div>
              <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{animationDelay: '0.2s'}}></div>
            </div>
            <span className="text-xs text-gray-500 ml-2">AI正在思考...</span>
          </div>
        </div>
      </div>
    </div>
  );

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
              <span className="text-pfa-royal-blue font-bold text-sm sm:text-base">AI</span>
            </div>
            <div className="min-w-0">
              <h1 className="font-bold text-sm sm:text-base text-white truncate">
                PFA智能助手 (双工作流)
              </h1>
              <p className="text-pfa-champagne-gold text-xs">快速+专业回答</p>
            </div>
          </div>
        </div>

        {/* 用户信息和退出按钮 */}
        <div className="flex items-center gap-2 sm:gap-3">
          <span className="text-pfa-champagne-gold text-xs sm:text-sm">
            {user?.email?.split('@')[0] || '会员'}
          </span>
          <LogoutButton />
        </div>
      </header>

      {/* 主要内容区域 - 聊天区域占满全屏 */}
      <div className="flex-1 flex flex-col min-h-0">
        {/* 消息列表 */}
        <div className="flex-1 overflow-y-auto p-3 sm:p-4 space-y-4">
          {messages.map((message) => (
            <MessageComponent key={message.id} message={message} />
          ))}
          {isLoading && <TypingIndicator />}
          <div ref={messagesEndRef} />
        </div>

        {/* 输入区域 */}
        <div className="border-t bg-white p-3 sm:p-4">
          <ChatInput onSendMessage={handleSendMessage} disabled={isLoading} />
        </div>
      </div>
    </div>
  );
}