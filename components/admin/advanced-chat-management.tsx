"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { 
  Users, 
  MessageSquare, 
  Search, 
  Eye, 
  Download, 
  ArrowLeft, 
  Calendar,
  FileText,
  Clock,
  User as UserIcon,
  Bot,
  ChevronRight,
  ChevronDown
} from "lucide-react";

interface UserChatSummary {
  user_id: string;
  user_email: string;
  is_guest?: boolean;
  session_count: number;
  message_count: number;
  last_activity: string;
  first_activity: string;
}

interface ChatSession {
  session_id: string;
  title: string;
  message_count: number;
  created_at: string;
  last_message_time: string;
  last_message: string;
}

interface ChatMessage {
  id: number;
  session_id: string;
  message: {
    type: 'human' | 'ai';
    content: string;
  };
  created_at: string;
}

type ViewMode = 'users' | 'sessions' | 'messages';

export function AdvancedChatManagement() {
  const [viewMode, setViewMode] = useState<ViewMode>('users');
  const [users, setUsers] = useState<UserChatSummary[]>([]);
  const [sessions, setSessions] = useState<ChatSession[]>([]);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  
  // 当前选择的用户和会话
  const [selectedUser, setSelectedUser] = useState<UserChatSummary | null>(null);
  const [selectedSession, setSelectedSession] = useState<ChatSession | null>(null);
  
  // 导出相关状态
  const [exporting, setExporting] = useState(false);
  const [dateRange, setDateRange] = useState({
    start: '',
    end: ''
  });
  
  // 访客数据控制
  const [includeGuests, setIncludeGuests] = useState(false);

  // 加载用户聊天统计
  const loadUserChatSummary = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (searchTerm) params.set('search', searchTerm);
      if (includeGuests) params.set('include_guests', 'true');
      
      const response = await fetch(`/api/admin/chat/users?${params}`);
      if (response.ok) {
        const data = await response.json();
        setUsers(data.users || []);
      }
    } catch (error) {
      console.error('加载用户聊天统计失败:', error);
    } finally {
      setLoading(false);
    }
  };

  // 加载指定用户的会话列表
  const loadUserSessions = async (userId: string, isGuest = false) => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      params.set('user_id', userId);
      if (isGuest) params.set('is_guest', 'true');
      
      const response = await fetch(`/api/admin/chat/user-sessions?${params}`);
      if (response.ok) {
        const data = await response.json();
        setSessions(data.sessions || []);
      }
    } catch (error) {
      console.error('加载用户会话失败:', error);
    } finally {
      setLoading(false);
    }
  };

  // 加载指定会话的消息
  const loadSessionMessages = async (sessionId: string, userId: string, isGuest = false) => {
    try {
      setLoading(true);
      
      const requestBody: any = {
        session_id: sessionId
      };
      
      if (isGuest) {
        requestBody.guest_id = userId;
      } else {
        requestBody.user_id = userId;
      }
      
      const response = await fetch('/api/chat/history', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(requestBody)
      });
      
      if (response.ok) {
        const data = await response.json();
        setMessages(data.messages || []);
      }
    } catch (error) {
      console.error('加载会话消息失败:', error);
    } finally {
      setLoading(false);
    }
  };

  // 导出功能
  const exportChats = async (type: 'user' | 'all' | 'date', format: 'json' | 'csv' = 'json') => {
    try {
      setExporting(true);
      
      let url = '/api/admin/chat/export';
      const exportParams = new URLSearchParams();
      exportParams.set('type', type);
      exportParams.set('format', format);
      
      if (type === 'user' && selectedUser) {
        exportParams.set('user_id', selectedUser.user_id);
        if (selectedUser.is_guest) {
          exportParams.set('is_guest', 'true');
        }
      } else if (type === 'date') {
        exportParams.set('start_date', dateRange.start);
        exportParams.set('end_date', dateRange.end);
        if (includeGuests) {
          exportParams.set('include_guests', 'true');
        }
      } else if (type === 'all') {
        if (includeGuests) {
          exportParams.set('include_guests', 'true');
        }
      }
      
      const response = await fetch(`${url}?${exportParams}`);
      if (response.ok) {
        const blob = await response.blob();
        const downloadUrl = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = downloadUrl;
        
        // 生成文件名
        const timestamp = new Date().toISOString().split('T')[0];
        const extension = format === 'csv' ? 'csv' : 'json';
        let filename = `chat_export_${timestamp}.${extension}`;
        if (type === 'user' && selectedUser) {
          filename = `chat_export_${selectedUser.user_email.replace('@', '_')}_${timestamp}.${extension}`;
        } else if (type === 'date') {
          filename = `chat_export_${dateRange.start}_to_${dateRange.end}.${extension}`;
        }
        
        link.download = filename;
        document.body.appendChild(link);
        link.click();
        link.remove();
        window.URL.revokeObjectURL(downloadUrl);
      }
    } catch (error) {
      console.error('导出失败:', error);
      alert('导出失败，请重试');
    } finally {
      setExporting(false);
    }
  };

  // 处理用户点击
  const handleUserClick = (user: UserChatSummary) => {
    setSelectedUser(user);
    setViewMode('sessions');
    loadUserSessions(user.user_id, user.is_guest);
  };

  // 处理会话点击
  const handleSessionClick = (session: ChatSession) => {
    if (!selectedUser) return;
    setSelectedSession(session);
    setViewMode('messages');
    loadSessionMessages(session.session_id, selectedUser.user_id, selectedUser.is_guest);
  };

  // 返回上级
  const handleGoBack = () => {
    if (viewMode === 'messages') {
      setViewMode('sessions');
      setSelectedSession(null);
      setMessages([]);
    } else if (viewMode === 'sessions') {
      setViewMode('users');
      setSelectedUser(null);
      setSessions([]);
    }
  };

  // 格式化时间
  const formatTime = (timeStr: string) => {
    return new Date(timeStr).toLocaleString('zh-CN');
  };

  // 格式化日期用于输入
  const formatDateForInput = (daysAgo: number) => {
    const date = new Date();
    date.setDate(date.getDate() - daysAgo);
    return date.toISOString().split('T')[0];
  };

  // 初始化
  useEffect(() => {
    if (viewMode === 'users') {
      loadUserChatSummary();
    }
  }, [viewMode, searchTerm, includeGuests]);

  // 设置默认日期范围（最近7天）
  useEffect(() => {
    setDateRange({
      start: formatDateForInput(6), // 6天前
      end: formatDateForInput(0)    // 今天
    });
  }, []);

  return (
    <div className="space-y-6">
      {/* 头部 */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          {viewMode !== 'users' && (
            <Button variant="outline" onClick={handleGoBack}>
              <ArrowLeft className="w-4 h-4 mr-2" />
              返回
            </Button>
          )}
          <div>
            <h2 className="text-2xl font-bold text-gray-900">
              聊天记录管理
              {viewMode === 'sessions' && selectedUser && (
                <span className="text-lg text-gray-600 ml-2">
                  - {selectedUser.user_email}
                </span>
              )}
              {viewMode === 'messages' && selectedSession && (
                <span className="text-lg text-gray-600 ml-2">
                  - {selectedSession.title}
                </span>
              )}
            </h2>
            <p className="text-gray-600">
              {viewMode === 'users' && '查看所有用户的聊天活动'}
              {viewMode === 'sessions' && '查看用户的聊天会话'}
              {viewMode === 'messages' && '查看会话的详细内容'}
            </p>
          </div>
        </div>

        {/* 导出功能 */}
        <div className="flex items-center gap-2">
          {viewMode === 'users' && (
            <>
              {/* 按日期导出 */}
              <div className="flex items-center gap-2 border rounded-lg p-2">
                <Calendar className="w-4 h-4" />
                <input
                  type="date"
                  value={dateRange.start}
                  onChange={(e) => setDateRange(prev => ({ ...prev, start: e.target.value }))}
                  max={formatDateForInput(0)}
                  className="text-sm border-none outline-none"
                />
                <span className="text-sm text-gray-500">至</span>
                <input
                  type="date"
                  value={dateRange.end}
                  onChange={(e) => setDateRange(prev => ({ ...prev, end: e.target.value }))}
                  max={formatDateForInput(0)}
                  className="text-sm border-none outline-none"
                />
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button 
                      size="sm" 
                      disabled={exporting || !dateRange.start || !dateRange.end}
                    >
                      导出 <ChevronDown className="w-3 h-3 ml-1" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent>
                    <DropdownMenuItem onClick={() => exportChats('date', 'json')}>
                      <FileText className="w-4 h-4 mr-2" />
                      导出为 JSON
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => exportChats('date', 'csv')}>
                      <FileText className="w-4 h-4 mr-2" />
                      导出为 CSV
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
              
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button disabled={exporting}>
                    <Download className="w-4 h-4 mr-2" />
                    导出全部 <ChevronDown className="w-3 h-3 ml-1" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent>
                  <DropdownMenuItem onClick={() => exportChats('all', 'json')}>
                    <FileText className="w-4 h-4 mr-2" />
                    导出为 JSON
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => exportChats('all', 'csv')}>
                    <FileText className="w-4 h-4 mr-2" />
                    导出为 CSV
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </>
          )}
          
          {viewMode === 'sessions' && selectedUser && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button disabled={exporting}>
                  <Download className="w-4 h-4 mr-2" />
                  导出用户聊天 <ChevronDown className="w-3 h-3 ml-1" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent>
                <DropdownMenuItem onClick={() => exportChats('user', 'json')}>
                  <FileText className="w-4 h-4 mr-2" />
                  导出为 JSON
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => exportChats('user', 'csv')}>
                  <FileText className="w-4 h-4 mr-2" />
                  导出为 CSV
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          )}
        </div>
      </div>

      {/* 搜索框和控制选项 */}
      {viewMode === 'users' && (
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="relative flex-1 max-w-md">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  placeholder="搜索用户邮箱..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="includeGuests"
                  checked={includeGuests}
                  onChange={(e) => setIncludeGuests(e.target.checked)}
                  className="rounded border-gray-300"
                />
                <label htmlFor="includeGuests" className="text-sm text-gray-700">
                  包含访客记录
                </label>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* 主要内容 */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            {viewMode === 'users' && <Users className="w-5 h-5" />}
            {viewMode === 'sessions' && <MessageSquare className="w-5 h-5" />}
            {viewMode === 'messages' && <FileText className="w-5 h-5" />}
            
            {viewMode === 'users' && `用户列表 (${users.length})`}
            {viewMode === 'sessions' && `会话列表 (${sessions.length})`}
            {viewMode === 'messages' && `消息详情 (${messages.length})`}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex justify-center py-8">
              <div className="w-6 h-6 border-2 border-blue-600/30 border-t-blue-600 rounded-full animate-spin"></div>
            </div>
          ) : (
            <>
              {/* 用户列表视图 */}
              {viewMode === 'users' && (
                <div className="space-y-4">
                  {users.map((user) => (
                    <div
                      key={user.user_id}
                      className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50 cursor-pointer transition-colors"
                      onClick={() => handleUserClick(user)}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                            user.is_guest ? 'bg-orange-100' : 'bg-blue-100'
                          }`}>
                            <UserIcon className={`w-5 h-5 ${
                              user.is_guest ? 'text-orange-600' : 'text-blue-600'
                            }`} />
                          </div>
                          <div>
                            <div className="flex items-center gap-2">
                              <h3 className="font-medium text-gray-900">{user.user_email}</h3>
                              {user.is_guest && (
                                <Badge variant="secondary" className="text-xs bg-orange-100 text-orange-800">
                                  访客
                                </Badge>
                              )}
                            </div>
                            <p className="text-sm text-gray-500">
                              {user.session_count} 个会话 · {user.message_count} 条消息
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-4">
                          <div className="text-right text-sm">
                            <div className="text-gray-900">最后活动</div>
                            <div className="text-gray-500">{formatTime(user.last_activity)}</div>
                          </div>
                          <ChevronRight className="w-5 h-5 text-gray-400" />
                        </div>
                      </div>
                    </div>
                  ))}
                  
                  {users.length === 0 && (
                    <div className="text-center py-8 text-gray-500">
                      暂无用户聊天记录
                    </div>
                  )}
                </div>
              )}

              {/* 会话列表视图 */}
              {viewMode === 'sessions' && (
                <div className="space-y-4">
                  {sessions.map((session) => (
                    <div
                      key={session.session_id}
                      className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50 cursor-pointer transition-colors"
                      onClick={() => handleSessionClick(session)}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                            <MessageSquare className="w-4 h-4 text-green-600" />
                          </div>
                          <div className="flex-1">
                            <h4 className="font-medium text-gray-900">{session.title}</h4>
                            <p className="text-sm text-gray-500 line-clamp-1">
                              {session.last_message}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-4">
                          <Badge variant="secondary">
                            {session.message_count} 条消息
                          </Badge>
                          <div className="text-right text-sm">
                            <div className="text-gray-900">{formatTime(session.last_message_time)}</div>
                          </div>
                          <ChevronRight className="w-5 h-5 text-gray-400" />
                        </div>
                      </div>
                    </div>
                  ))}
                  
                  {sessions.length === 0 && (
                    <div className="text-center py-8 text-gray-500">
                      该用户暂无聊天会话
                    </div>
                  )}
                </div>
              )}

              {/* 消息详情视图 */}
              {viewMode === 'messages' && (
                <div className="space-y-4 max-h-96 overflow-y-auto">
                  {messages.map((msg) => (
                    <div
                      key={msg.id}
                      className={`flex ${msg.message.type === 'human' ? 'justify-end' : 'justify-start'}`}
                    >
                      <div className="flex items-start gap-3 max-w-[80%]">
                        {msg.message.type === 'ai' && (
                          <div className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center flex-shrink-0">
                            <Bot className="w-4 h-4 text-gray-600" />
                          </div>
                        )}
                        
                        <div
                          className={`p-3 rounded-lg ${
                            msg.message.type === 'human'
                              ? 'bg-blue-600 text-white'
                              : 'bg-gray-100 text-gray-900'
                          }`}
                        >
                          <p className="text-sm whitespace-pre-wrap">{msg.message.content}</p>
                          <p className={`text-xs mt-1 ${
                            msg.message.type === 'human' ? 'text-blue-100' : 'text-gray-500'
                          }`}>
                            {formatTime(msg.created_at)}
                          </p>
                        </div>
                        
                        {msg.message.type === 'human' && (
                          <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                            <UserIcon className="w-4 h-4 text-blue-600" />
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                  
                  {messages.length === 0 && (
                    <div className="text-center py-8 text-gray-500">
                      该会话暂无消息
                    </div>
                  )}
                </div>
              )}
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}