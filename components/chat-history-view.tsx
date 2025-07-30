"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { 
  ArrowLeft, 
  Search, 
  MessageCircle, 
  Calendar,
  Edit2,
  Trash2,
  Download,
  Clock
} from "lucide-react";
import { AuthNav } from "@/components/auth-nav";
import { LanguageSwitcher } from "@/components/language-switcher";
import { ChatSessionWithStats, ChatMessage } from "@/types/chat";
import { User } from "@supabase/supabase-js";

interface ChatHistoryViewProps {
  user: User;
}

export function ChatHistoryView({ }: ChatHistoryViewProps) {
  const router = useRouter();
  const [sessions, setSessions] = useState<ChatSessionWithStats[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedSession, setSelectedSession] = useState<string | null>(null);
  const [sessionMessages, setSessionMessages] = useState<ChatMessage[]>([]);
  const [loadingMessages, setLoadingMessages] = useState(false);
  const [editingSession, setEditingSession] = useState<string | null>(null);
  const [editTitle, setEditTitle] = useState("");

  // 获取聊天会话列表
  const fetchSessions = async (search = "") => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (search) params.set('search', search);
      
      const response = await fetch(`/api/chat-history?${params}`);
      if (!response.ok) throw new Error('获取聊天历史失败');
      
      const data = await response.json();
      setSessions(data.sessions || []);
    } catch (error) {
      console.error('获取聊天历史失败:', error);
    } finally {
      setLoading(false);
    }
  };

  // 获取特定会话的消息
  const fetchSessionMessages = async (sessionId: string) => {
    try {
      setLoadingMessages(true);
      const response = await fetch(`/api/chat-history?sessionId=${sessionId}`);
      if (!response.ok) throw new Error('获取消息失败');
      
      const data = await response.json();
      setSessionMessages(data.messages || []);
    } catch (error) {
      console.error('获取消息失败:', error);
      setSessionMessages([]);
    } finally {
      setLoadingMessages(false);
    }
  };

  // 更新会话标题
  const updateSessionTitle = async (sessionId: string, newTitle: string) => {
    try {
      const response = await fetch('/api/chat-history', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sessionId, title: newTitle })
      });
      
      if (!response.ok) throw new Error('更新标题失败');
      
      // 更新本地状态
      setSessions(prev => prev.map(session => 
        session.id === sessionId 
          ? { ...session, title: newTitle }
          : session
      ));
      
      setEditingSession(null);
      setEditTitle("");
    } catch (error) {
      console.error('更新标题失败:', error);
    }
  };

  // 删除会话
  const deleteSession = async (sessionId: string) => {
    if (!confirm('确定要删除这个对话吗？此操作不可撤销。')) return;
    
    try {
      const response = await fetch(`/api/chat-history?sessionId=${sessionId}`, {
        method: 'DELETE'
      });
      
      if (!response.ok) throw new Error('删除会话失败');
      
      // 从列表中移除
      setSessions(prev => prev.filter(session => session.id !== sessionId));
      
      // 如果删除的是当前选中的会话，清空消息视图
      if (selectedSession === sessionId) {
        setSelectedSession(null);
        setSessionMessages([]);
      }
    } catch (error) {
      console.error('删除会话失败:', error);
    }
  };

  // 继续对话
  const continueChat = (sessionId: string) => {
    // 跳转到聊天页面并传递sessionId
    router.push(`/chat?sessionId=${sessionId}`);
  };

  useEffect(() => {
    fetchSessions();
  }, []);

  useEffect(() => {
    if (selectedSession) {
      fetchSessionMessages(selectedSession);
    }
  }, [selectedSession]);

  // 搜索处理
  const handleSearch = (value: string) => {
    setSearchTerm(value);
    fetchSessions(value);
  };

  // 格式化时间
  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = now.getTime() - date.getTime();
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays === 0) {
      return date.toLocaleTimeString('zh-CN', { 
        hour: '2-digit', 
        minute: '2-digit' 
      });
    } else if (diffDays === 1) {
      return '昨天';
    } else if (diffDays < 7) {
      return `${diffDays}天前`;
    } else {
      return date.toLocaleDateString('zh-CN');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-pfa-light-gray to-white">
      {/* 导航栏 */}
      <nav className="bg-pfa-royal-blue shadow-lg sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            {/* Logo和返回 */}
            <div className="flex items-center">
              <button
                onClick={() => router.push('/')}
                className="flex items-center gap-2 text-white hover:text-pfa-champagne-gold transition-colors mr-4"
              >
                <ArrowLeft className="h-5 w-5" />
                <span className="hidden sm:inline">返回首页</span>
              </button>
              
              <div className="flex items-center">
                <div className="w-10 h-10 bg-pfa-champagne-gold rounded-lg flex items-center justify-center mr-3">
                  <MessageCircle className="h-5 w-5 text-pfa-royal-blue" />
                </div>
                <div className="hidden sm:block">
                  <h1 className="text-xl font-bold text-white">聊天历史</h1>
                  <p className="text-pfa-champagne-gold text-xs">Chat History</p>
                </div>
              </div>
            </div>

            {/* 右侧导航 */}
            <div className="flex items-center space-x-4">
              <Button
                onClick={() => router.push('/chat')}
                variant="outline"
                size="sm"
                className="border-pfa-champagne-gold text-pfa-champagne-gold hover:bg-pfa-champagne-gold hover:text-pfa-royal-blue"
              >
                <MessageCircle className="h-4 w-4 mr-1" />
                <span className="hidden sm:inline">新对话</span>
              </Button>
              <LanguageSwitcher />
              <AuthNav />
            </div>
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* 左侧：会话列表 */}
          <div className="lg:col-span-1">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MessageCircle className="h-5 w-5" />
                  对话列表
                </CardTitle>
                {/* 搜索框 */}
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                  <Input
                    placeholder="搜索对话内容..."
                    value={searchTerm}
                    onChange={(e) => handleSearch(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </CardHeader>
              <CardContent className="p-0">
                {loading ? (
                  <div className="p-4 text-center">
                    <div className="w-6 h-6 border-2 border-pfa-champagne-gold/30 border-t-pfa-champagne-gold rounded-full animate-spin mx-auto mb-2"></div>
                    <p className="text-sm text-gray-500">加载中...</p>
                  </div>
                ) : sessions.length === 0 ? (
                  <div className="p-4 text-center text-gray-500">
                    <MessageCircle className="h-8 w-8 mx-auto mb-2 opacity-50" />
                    <p>暂无聊天记录</p>
                    <Button
                      onClick={() => router.push('/chat')}
                      className="mt-2"
                      size="sm"
                    >
                      开始第一个对话
                    </Button>
                  </div>
                ) : (
                  <div className="max-h-96 overflow-y-auto">
                    {sessions.map((session) => (
                      <div
                        key={session.id}
                        className={`p-4 border-b hover:bg-gray-50 cursor-pointer transition-colors ${
                          selectedSession === session.id ? 'bg-pfa-royal-blue/5 border-l-4 border-l-pfa-champagne-gold' : ''
                        }`}
                        onClick={() => setSelectedSession(session.id)}
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex-1 min-w-0">
                            {editingSession === session.id ? (
                              <div className="flex gap-2">
                                <Input
                                  value={editTitle}
                                  onChange={(e) => setEditTitle(e.target.value)}
                                  className="text-sm"
                                  onKeyDown={(e) => {
                                    if (e.key === 'Enter') {
                                      updateSessionTitle(session.id, editTitle);
                                    } else if (e.key === 'Escape') {
                                      setEditingSession(null);
                                      setEditTitle("");
                                    }
                                  }}
                                  autoFocus
                                />
                                <Button
                                  size="sm"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    updateSessionTitle(session.id, editTitle);
                                  }}
                                >
                                  保存
                                </Button>
                              </div>
                            ) : (
                              <>
                                <h3 className="font-medium text-sm truncate">{session.title}</h3>
                                <p className="text-xs text-gray-500 truncate mt-1">
                                  {session.last_message_preview}
                                </p>
                                <div className="flex items-center gap-2 mt-2 text-xs text-gray-400">
                                  <Clock className="h-3 w-3" />
                                  <span>{formatTime(session.last_message_at)}</span>
                                  <span>•</span>
                                  <span>{session.message_count} 条消息</span>
                                </div>
                              </>
                            )}
                          </div>
                          
                          {editingSession !== session.id && (
                            <div className="flex items-center gap-1 ml-2">
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setEditingSession(session.id);
                                  setEditTitle(session.title);
                                }}
                                className="h-6 w-6 p-0"
                              >
                                <Edit2 className="h-3 w-3" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  deleteSession(session.id);
                                }}
                                className="h-6 w-6 p-0 text-red-500 hover:text-red-700"
                              >
                                <Trash2 className="h-3 w-3" />
                              </Button>
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* 右侧：消息详情 */}
          <div className="lg:col-span-2">
            <Card className="h-[600px] flex flex-col">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center gap-2">
                    <Calendar className="h-5 w-5" />
                    {selectedSession ? 
                      sessions.find(s => s.id === selectedSession)?.title || '对话详情' 
                      : '选择一个对话查看详情'
                    }
                  </CardTitle>
                  {selectedSession && (
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => continueChat(selectedSession)}
                      >
                        <MessageCircle className="h-4 w-4 mr-1" />
                        继续对话
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          // TODO: 实现导出功能
                          alert('导出功能即将推出');
                        }}
                      >
                        <Download className="h-4 w-4 mr-1" />
                        导出
                      </Button>
                    </div>
                  )}
                </div>
              </CardHeader>
              
              <CardContent className="flex-1 overflow-hidden p-0">
                {!selectedSession ? (
                  <div className="h-full flex items-center justify-center text-gray-500">
                    <div className="text-center">
                      <MessageCircle className="h-12 w-12 mx-auto mb-4 opacity-50" />
                      <p>请选择一个对话查看消息记录</p>
                    </div>
                  </div>
                ) : loadingMessages ? (
                  <div className="h-full flex items-center justify-center">
                    <div className="text-center">
                      <div className="w-8 h-8 border-2 border-pfa-champagne-gold/30 border-t-pfa-champagne-gold rounded-full animate-spin mx-auto mb-4"></div>
                      <p className="text-gray-500">加载消息中...</p>
                    </div>
                  </div>
                ) : (
                  <div className="h-full overflow-y-auto p-4 space-y-4">
                    {sessionMessages.map((message) => (
                      <div
                        key={message.id}
                        className={`flex gap-3 ${message.message_type === 'user' ? 'justify-end' : 'justify-start'}`}
                      >
                        <div
                          className={`max-w-[70%] rounded-lg px-4 py-2 ${
                            message.message_type === 'user'
                              ? 'bg-pfa-royal-blue text-white'
                              : 'bg-gray-100 text-gray-900'
                          }`}
                        >
                          <div className="whitespace-pre-wrap break-words">
                            {message.content}
                          </div>
                          <div className={`text-xs mt-1 opacity-70 ${
                            message.message_type === 'user' ? 'text-pfa-champagne-gold' : 'text-gray-500'
                          }`}>
                            {formatTime(message.created_at)}
                            {message.n8n_response_time && (
                              <span className="ml-2">
                                ({(message.n8n_response_time / 1000).toFixed(1)}s)
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}