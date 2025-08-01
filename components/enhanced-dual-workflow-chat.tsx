"use client";

import { useState, useRef, useEffect } from "react";
import { ChatInput } from "@/components/chat-input";
import { LogoutButton } from "@/components/logout-button";
import { ArrowLeft, Bot, User, Brain, Zap, Loader } from "lucide-react";
import { useRouter } from "next/navigation";

// 原有的Message接口
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

export function EnhancedDualWorkflowChat({ user }: ChatInterfaceProps) {
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

  // 原有的Dify流式方法（保持不变）
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
    
    if (conversationId) {
      requestBody.conversationId = conversationId;
    }
    
    console.log('直接调用Dify API:', { ...requestBody, conversationId: conversationId || 'NEW_CONVERSATION' });
    
    try {
      const difyRequestBody: {
        inputs: Record<string, unknown>;
        query: string;
        response_mode: string;
        user: string;
        auto_generate_name: boolean;
        conversation_id?: string;
      } = {
        inputs: {},
        query: requestBody.message.trim(),
        response_mode: 'streaming',
        user: requestBody.user,
        auto_generate_name: true
      };

      if (requestBody.conversationId) {
        difyRequestBody.conversation_id = requestBody.conversationId;
      }

      const response = await fetch('https://pro.aifunbox.com/v1/chat-messages', {
        method: 'POST',
        headers: { 
          'Authorization': 'Bearer app-34ZpXbLsWBJlqyNMhSJDFlLS',
          'Content-Type': 'application/json',
          'Accept': 'text/event-stream'
        },
        body: JSON.stringify(difyRequestBody)
      });
      
      if (!response.ok) {
        const errorText = await response.text().catch(() => `HTTP ${response.status} 错误`);
        console.error('Dify直接调用错误:', response.status, response.statusText, errorText);
        onError(`Dify API错误: ${response.status} ${response.statusText}`);
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
      let buffer = '';
      
      while (true) {
        const { done, value } = await reader.read();
        
        if (done) break;
        
        const chunk = decoder.decode(value, { stream: true });
        buffer += chunk;
        
        const lines = buffer.split('\n');
        buffer = lines.pop() || '';
        
        for (const line of lines) {
          if (line.startsWith('data: ')) {
            try {
              const jsonStr = line.slice(6).trim();
              if (!jsonStr || jsonStr === '[DONE]') continue;
              
              const eventData = JSON.parse(jsonStr);
              
              if (eventData.event === 'message' || eventData.event === 'message_chunk') {
                const chunkText = eventData.answer || eventData.chunk || eventData.delta || eventData.content || '';
                if (chunkText) {
                  completeResponse += chunkText;
                  onChunk(chunkText);
                }
                
                if (eventData.conversation_id && eventData.conversation_id !== newConversationId) {
                  newConversationId = eventData.conversation_id;
                }
              } else if (eventData.event === 'message_end' || eventData.event === 'message_complete') {
                console.log('流式消息完成:', {
                  completeResponse: completeResponse.length,
                  conversationId: eventData.conversation_id
                });
                onComplete(completeResponse, eventData.conversation_id || newConversationId);
                return;
              } else if (eventData.event === 'stream_end') {
                console.log('流式传输结束');
                onComplete(completeResponse, eventData.conversation_id || newConversationId);
                return;
              } else if (eventData.event === 'error') {
                onError(eventData.error || '流式处理出错');
                return;
              }
            } catch (parseError) {
              console.error('解析流式数据失败:', parseError, 'Raw line:', line);
            }
          }
        }
      }
      
      if (buffer.trim()) {
        const finalLines = buffer.split('\n');
        for (const line of finalLines) {
          if (line.startsWith('data: ')) {
            try {
              const jsonStr = line.slice(6).trim();
              if (jsonStr && jsonStr !== '[DONE]') {
                const eventData = JSON.parse(jsonStr);
                if (eventData.event === 'message_end' || eventData.event === 'message_complete') {
                  onComplete(completeResponse, eventData.conversation_id || newConversationId);
                  return;
                }
              }
            } catch (parseError) {
              console.error('解析最终缓冲区数据失败:', parseError);
            }
          }
        }
      }
      
      if (completeResponse) {
        onComplete(completeResponse, newConversationId);
      }
      
    } catch (error) {
      console.error('流式请求失败:', error);
      onError(error instanceof Error ? error.message : '流式请求失败');
    }
  };

  // 原有的N8N专业回答方法（保持不变）
  const getProfessionalAnswer = async (messageId: string) => {
    setMessages(prev => prev.map(msg => 
      msg.id === messageId 
        ? { ...msg, isLoadingProfessional: true, showProfessionalButton: false }
        : msg
    ));

    try {
      const conversationHistory = messages
        .filter(msg => msg.id !== 'welcome' && msg.aiService !== 'system')
        .map(msg => ({
          role: msg.isUser ? 'user' as const : 'assistant' as const,
          content: msg.content
        }));

      const lastUserMessage = conversationHistory
        .filter(msg => msg.role === 'user')
        .pop();

      if (!lastUserMessage) {
        throw new Error('未找到用户消息');
      }

      console.log('直接调用N8N webhook:', {
        message: lastUserMessage.content.substring(0, 50) + "...",
        conversationId,
        historyLength: conversationHistory.length
      });

      const response = await fetch('https://n8nprd.aifunbox.com/webhook/insurance', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify({
          text: lastUserMessage.content,
          sessionId: `professional_${conversationId}`
        })
      });
      
      if (!response.ok) {
        console.error('N8N直接调用错误:', response.status, response.statusText);
        throw new Error(`N8N响应错误: ${response.status} ${response.statusText}`);
      }
      
      const data = await response.json();
      console.log('N8N直接调用响应:', data);
      
      setMessages(prev => prev.map(msg => 
        msg.id === messageId 
          ? { 
              ...msg, 
              showProfessionalButton: false,
              isLoadingProfessional: false
            }
          : msg
      ));
      
      const professionalMessage: Message = {
        id: `professional_${Date.now()}`,
        content: data.output || data.response || "抱歉，专业AI教练暂时无法处理您的请求。",
        isUser: false,
        timestamp: new Date(),
        aiService: 'n8n',
        answerType: 'professional',
        showProfessionalButton: false
      };
      
      setMessages(prev => [...prev, professionalMessage]);
      
    } catch (error) {
      console.error('获取专业回答失败:', error);
      setMessages(prev => prev.map(msg => 
        msg.id === messageId 
          ? { 
              ...msg, 
              isLoadingProfessional: false, 
              showProfessionalButton: true 
            }
          : msg
      ));
      
      alert('获取专业回答失败，请重试');
    }
  };

  // 原有的发送消息方法（保持不变）
  const handleSendMessage = async (content: string) => {
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
      aiService: 'dify',
      answerType: 'quick',
      showProfessionalButton: false
    };

    setMessages(prev => [...prev, aiMessage]);

    try {
      await sendMessageToDifyStream(
        content,
        (chunk: string) => {
          setMessages(prev => prev.map(msg => 
            msg.id === aiMessageId 
              ? { ...msg, content: msg.content + chunk }
              : msg
          ));
        },
        (completeResponse: string, newConversationId?: string) => {
          if (newConversationId) {
            if (!conversationId || newConversationId !== conversationId) {
              setConversationId(newConversationId);
              console.log('更新会话ID:', { 
                old: conversationId || 'NULL', 
                new: newConversationId 
              });
            }
          }
          
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
        (error: string) => {
          console.error('流式发送消息失败:', error);
          
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

  // 消息组件（保持原有样式）
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
          <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
            message.aiService === 'n8n' ? 'bg-pfa-champagne-gold' : 
            message.aiService === 'dify' ? 'bg-pfa-royal-blue' : 'bg-gray-500'
          }`}>
            <Bot className="w-4 h-4 text-white" />
          </div>
          
          <div className="flex-1">
            <div className={`rounded-2xl px-4 py-2 ${
              message.aiService === 'n8n' 
                ? 'bg-gradient-to-r from-pfa-champagne-gold/10 to-pfa-champagne-gold/5 border border-pfa-champagne-gold/20' 
                : 'bg-gray-100'
            }`}>
              {message.aiService === 'n8n' && (
                <div className="flex items-center gap-2 mb-2 pb-2 border-b border-pfa-champagne-gold/20">
                  <Brain className="w-4 h-4 text-pfa-champagne-gold" />
                  <span className="text-sm font-medium text-pfa-champagne-gold">AI专业教练深度分析</span>
                </div>
              )}
              
              <p className="text-sm text-gray-800 whitespace-pre-wrap break-words">
                {message.content || (message.aiService === 'dify' && !message.showProfessionalButton ? 'AI正在思考...' : '')}
                {message.aiService === 'dify' && !message.showProfessionalButton && (
                  <span className="inline-block w-1 h-4 bg-pfa-royal-blue ml-1 animate-pulse"></span>
                )}
              </p>
              
              <div className="flex items-center justify-between mt-2">
                <div className="flex items-center gap-2">
                  {message.aiService === 'dify' && (
                    <span className="inline-flex items-center gap-1 text-xs bg-pfa-royal-blue/10 text-pfa-royal-blue px-2 py-1 rounded-full">
                      <Zap className="w-3 h-3" />
                      快速回答
                    </span>
                  )}
                  {message.aiService === 'n8n' && (
                    <span className="inline-flex items-center gap-1 text-xs bg-pfa-champagne-gold/10 text-pfa-champagne-gold px-2 py-1 rounded-full">
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
            
            {message.showProfessionalButton && !message.isLoadingProfessional && (
              <div className="mt-3 p-3 bg-gradient-to-r from-pfa-royal-blue/5 to-pfa-champagne-gold/5 rounded-lg border border-pfa-royal-blue/20">
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
                    className="ml-3 inline-flex items-center gap-2 bg-gradient-to-r from-pfa-royal-blue to-pfa-champagne-gold text-white px-4 py-2 rounded-lg text-sm font-medium hover:shadow-lg transition-all duration-200"
                  >
                    <Brain className="w-4 h-4" />
                    获取专业回答
                  </button>
                </div>
              </div>
            )}
            
            {message.isLoadingProfessional && (
              <div className="mt-3 p-3 bg-gradient-to-r from-pfa-royal-blue/5 to-pfa-champagne-gold/5 rounded-lg border border-pfa-royal-blue/20">
                <div className="flex items-center gap-3">
                  <Loader className="w-5 h-5 text-pfa-royal-blue animate-spin" />
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
                  <div className="bg-gradient-to-r from-pfa-royal-blue to-pfa-champagne-gold h-1 rounded-full animate-pulse" style={{width: '70%'}}></div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="h-screen w-full flex flex-col bg-gradient-to-br from-pfa-light-gray to-white">
      {/* 顶部导航栏 */}
      <header className="bg-pfa-royal-blue text-white px-3 sm:px-4 py-3 flex items-center justify-between shadow-lg">
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
                PFA智能助手
              </h1>
              <p className="text-pfa-champagne-gold text-xs">快速+专业回答</p>
            </div>
          </div>
        </div>

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