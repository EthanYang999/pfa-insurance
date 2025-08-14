"use client";

import { useState } from "react";
import { History, X, MessageCircle, Clock } from "lucide-react";
import { User } from "@supabase/supabase-js";

interface ChatSession {
  id: string;
  conversation_id: string;
  last_message: string;
  last_message_time: string;
  message_count: number;
  created_at: string;
}

interface ChatHistoryButtonProps {
  user: User;
}

export function ChatHistoryButton({ user }: ChatHistoryButtonProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [sessions, setSessions] = useState<ChatSession[]>([]);
  const [loading, setLoading] = useState(false);

  const loadChatHistory = async () => {
    if (!user?.id) return;
    
    try {
      setLoading(true);
      const response = await fetch(`/api/chat/history?user_id=${user.id}`);
      
      if (response.ok) {
        const data = await response.json();
        setSessions(data.sessions || []);
      } else {
        console.error('加载聊天历史失败:', response.status);
      }
    } catch (error) {
      console.error('加载聊天历史错误:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleToggle = () => {
    if (!isOpen) {
      loadChatHistory();
    }
    setIsOpen(!isOpen);
  };

  const formatTime = (timeStr: string) => {
    try {
      const date = new Date(timeStr);
      const now = new Date();
      const diff = now.getTime() - date.getTime();
      const days = Math.floor(diff / (1000 * 60 * 60 * 24));
      
      if (days === 0) {
        return date.toLocaleTimeString('zh-CN', { 
          hour: '2-digit', 
          minute: '2-digit' 
        });
      } else if (days === 1) {
        return '昨天';
      } else if (days < 7) {
        return `${days}天前`;
      } else {
        return date.toLocaleDateString('zh-CN', {
          month: 'short',
          day: 'numeric'
        });
      }
    } catch {
      return '未知时间';
    }
  };

  const truncateMessage = (message: string, maxLength = 50) => {
    if (message.length <= maxLength) return message;
    return message.substring(0, maxLength) + '...';
  };

  return (
    <>
      <button
        onClick={handleToggle}
        className="flex items-center gap-2 px-3 py-1.5 text-pfa-champagne-gold hover:bg-pfa-champagne-gold/10 rounded-lg transition-colors"
      >
        <History className="w-4 h-4" />
        <span className="hidden sm:inline text-sm">历史</span>
      </button>

      {/* 历史记录弹窗 */}
      {isOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg w-full max-w-2xl max-h-[80vh] flex flex-col">
            {/* 头部 */}
            <div className="flex items-center justify-between p-4 border-b">
              <div className="flex items-center gap-2">
                <History className="w-5 h-5 text-pfa-royal-blue" />
                <h2 className="text-lg font-semibold text-gray-900">聊天历史</h2>
              </div>
              <button
                onClick={() => setIsOpen(false)}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <X className="w-5 h-5 text-gray-500" />
              </button>
            </div>

            {/* 内容 */}
            <div className="flex-1 overflow-y-auto p-4">
              {loading ? (
                <div className="flex items-center justify-center py-8">
                  <div className="w-6 h-6 border-2 border-pfa-royal-blue border-t-transparent rounded-full animate-spin"></div>
                  <span className="ml-2 text-gray-600">加载中...</span>
                </div>
              ) : sessions.length > 0 ? (
                <div className="space-y-3">
                  {sessions.map((session) => (
                    <div
                      key={session.id}
                      className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50 cursor-pointer transition-colors"
                      onClick={() => {
                        // 这里可以添加跳转到特定会话的逻辑
                        console.log('点击会话:', session);
                      }}
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-2">
                            <MessageCircle className="w-4 h-4 text-pfa-royal-blue flex-shrink-0" />
                            <span className="text-sm font-medium text-gray-900">
                              会话 {session.conversation_id.substring(0, 8)}...
                            </span>
                            <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded-full">
                              {session.message_count} 条消息
                            </span>
                          </div>
                          
                          <p className="text-sm text-gray-600 mb-2">
                            {truncateMessage(session.last_message)}
                          </p>
                          
                          <div className="flex items-center gap-4 text-xs text-gray-500">
                            <div className="flex items-center gap-1">
                              <Clock className="w-3 h-3" />
                              <span>{formatTime(session.last_message_time)}</span>
                            </div>
                            <span>创建于 {formatTime(session.created_at)}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <MessageCircle className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                  <p className="text-gray-500 mb-2">暂无聊天历史</p>
                  <p className="text-sm text-gray-400">开始您的第一次对话吧！</p>
                </div>
              )}
            </div>

            {/* 底部 */}
            <div className="border-t p-4">
              <div className="flex items-center justify-between text-sm text-gray-500">
                <span>显示最近 {sessions.length} 个会话</span>
                <button
                  onClick={() => setIsOpen(false)}
                  className="px-4 py-2 bg-pfa-royal-blue text-white rounded-lg hover:bg-pfa-royal-blue/90 transition-colors"
                >
                  关闭
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}