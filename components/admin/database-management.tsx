'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Badge } from '../ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '../ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../ui/table';
import { Database, Search, Archive, Trash2, Eye } from 'lucide-react';
import { format } from 'date-fns';
import { zhCN } from 'date-fns/locale';

interface ChatSession {
  id: string;
  user_id: string;
  title: string;
  created_at: string;
  updated_at: string;
  is_archived: boolean;
  message_count: number;
  user_email?: string;
}

interface ChatMessage {
  id: string;
  session_id: string;
  role: 'user' | 'assistant';
  content: string;
  created_at: string;
  metadata?: Record<string, unknown>;
}


export function DatabaseManagement() {
  const [sessions, setSessions] = useState<ChatSession[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<'all' | 'active' | 'archived'>('all');
  const [selectedSession, setSelectedSession] = useState<ChatSession | null>(null);
  const [sessionMessages, setSessionMessages] = useState<ChatMessage[]>([]);
  const [totalRecords, setTotalRecords] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 20;

  // 加载聊天会话
  const loadSessions = async (page = 1) => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: pageSize.toString(),
        search: searchTerm,
        status: filterStatus
      });

      const response = await fetch(`/api/admin/database/sessions?${params}`);
      const data = await response.json();
      
      if (data.success) {
        setSessions(data.sessions);
        setTotalRecords(data.total);
      }
    } catch (error) {
      console.error('Failed to load sessions:', error);
    } finally {
      setLoading(false);
    }
  };


  // 加载会话消息
  const loadSessionMessages = async (sessionId: string) => {
    try {
      const response = await fetch(`/api/admin/database/sessions/${sessionId}/messages`);
      const data = await response.json();
      
      if (data.success) {
        setSessionMessages(data.messages);
      }
    } catch (error) {
      console.error('Failed to load session messages:', error);
    }
  };

  // 归档/取消归档会话
  const toggleArchiveSession = async (sessionId: string, isArchived: boolean) => {
    try {
      const response = await fetch(`/api/admin/database/sessions/${sessionId}/archive`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ archived: !isArchived })
      });

      if (response.ok) {
        loadSessions(currentPage);
      }
    } catch (error) {
      console.error('Failed to toggle archive:', error);
    }
  };

  // 删除会话
  const deleteSession = async (sessionId: string) => {
    if (!confirm('确定要删除这个会话吗？此操作不可恢复。')) {
      return;
    }

    try {
      const response = await fetch(`/api/admin/database/sessions/${sessionId}`, {
        method: 'DELETE'
      });

      if (response.ok) {
        loadSessions(currentPage);
      }
    } catch (error) {
      console.error('Failed to delete session:', error);
    }
  };

  useEffect(() => {
    loadSessions(currentPage);
    // ESLint disable next line to avoid circular dependency
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchTerm, filterStatus, currentPage]);

  const totalPages = Math.ceil(totalRecords / pageSize);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
          <Database className="h-6 w-6" />
          数据库内容管理
        </h2>
      </div>


      {/* 搜索和筛选 */}
      <Card>
        <CardHeader>
          <CardTitle>搜索和筛选</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex gap-4">
            <div className="flex-1">
              <Input
                placeholder="搜索会话标题..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full"
              />
            </div>
            <Select value={filterStatus} onValueChange={(value: 'all' | 'active' | 'archived') => setFilterStatus(value)}>
              <SelectTrigger className="w-32">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">全部</SelectItem>
                <SelectItem value="active">活跃</SelectItem>
                <SelectItem value="archived">已归档</SelectItem>
              </SelectContent>
            </Select>
            <Button onClick={() => setCurrentPage(1)} disabled={loading}>
              <Search className="h-4 w-4 mr-2" />
              搜索
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* 数据表格 */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>
            聊天会话管理 ({totalRecords} 条记录)
          </CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-8">加载中...</div>
          ) : (
            <>
              {/* 会话表格 */}
              <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>会话ID</TableHead>
                      <TableHead>标题</TableHead>
                      <TableHead>用户</TableHead>
                      <TableHead>消息数</TableHead>
                      <TableHead>状态</TableHead>
                      <TableHead>创建时间</TableHead>
                      <TableHead>操作</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {sessions.map((session) => (
                      <TableRow key={session.id}>
                        <TableCell className="font-mono text-xs">
                          {session.id.slice(0, 8)}...
                        </TableCell>
                        <TableCell className="max-w-xs truncate">
                          {session.title || '未命名会话'}
                        </TableCell>
                        <TableCell className="text-sm">
                          {session.user_email || session.user_id.slice(0, 8)}
                        </TableCell>
                        <TableCell>
                          <Badge variant="secondary">
                            {session.message_count || 0}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Badge variant={session.is_archived ? 'secondary' : 'default'}>
                            {session.is_archived ? '已归档' : '活跃'}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-sm">
                          {format(new Date(session.created_at), 'yyyy-MM-dd HH:mm', { locale: zhCN })}
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Dialog>
                              <DialogTrigger asChild>
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => {
                                    setSelectedSession(session);
                                    loadSessionMessages(session.id);
                                  }}
                                >
                                  <Eye className="h-4 w-4" />
                                </Button>
                              </DialogTrigger>
                              <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
                                <DialogHeader>
                                  <DialogTitle>
                                    会话详情: {selectedSession?.title || '未命名会话'}
                                  </DialogTitle>
                                </DialogHeader>
                                <div className="space-y-4">
                                  {sessionMessages.map((msg) => (
                                    <div
                                      key={msg.id}
                                      className={`p-3 rounded-lg ${
                                        msg.role === 'user' 
                                          ? 'bg-blue-50 border-l-4 border-blue-500' 
                                          : 'bg-gray-50 border-l-4 border-gray-500'
                                      }`}
                                    >
                                      <div className="flex justify-between items-center mb-2">
                                        <Badge variant={msg.role === 'user' ? 'default' : 'secondary'}>
                                          {msg.role === 'user' ? '用户' : 'AI助手'}
                                        </Badge>
                                        <span className="text-xs text-gray-500">
                                          {format(new Date(msg.created_at), 'MM-dd HH:mm')}
                                        </span>
                                      </div>
                                      <div className="text-sm whitespace-pre-wrap">
                                        {msg.content}
                                      </div>
                                    </div>
                                  ))}
                                </div>
                              </DialogContent>
                            </Dialog>
                            
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => toggleArchiveSession(session.id, session.is_archived)}
                            >
                              <Archive className="h-4 w-4" />
                            </Button>
                            
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => deleteSession(session.id)}
                              className="text-red-600 hover:text-red-700"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
              </Table>

              {/* 分页 */}
              {totalPages > 1 && (
                <div className="flex items-center justify-between mt-4">
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      disabled={currentPage === 1}
                      onClick={() => setCurrentPage(currentPage - 1)}
                    >
                      上一页
                    </Button>
                    <span className="text-sm text-gray-600">
                      第 {currentPage} 页，共 {totalPages} 页
                    </span>
                    <Button
                      variant="outline"
                      size="sm"
                      disabled={currentPage === totalPages}
                      onClick={() => setCurrentPage(currentPage + 1)}
                    >
                      下一页
                    </Button>
                  </div>
                  <div className="text-sm text-gray-600">
                    显示 {(currentPage - 1) * pageSize + 1} - {Math.min(currentPage * pageSize, totalRecords)} 条，共 {totalRecords} 条记录
                  </div>
                </div>
              )}
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}