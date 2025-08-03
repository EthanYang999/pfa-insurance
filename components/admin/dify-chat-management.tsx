'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Badge } from '../ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '../ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../ui/table';
import { MessageSquare, Search, Eye, Trash2, Download, FileText, FileJson } from 'lucide-react';

interface ChatSession {
  session_id: string;
  message_count: number;
  first_message_id: number;
  last_message_time: number;
  preview_content: string;
}

interface ChatMessage {
  id: number;
  session_id: string;
  message: {
    type: 'human' | 'ai';
    content: string;
    additional_kwargs: Record<string, unknown>;
    response_metadata: Record<string, unknown>;
  };
}

export function N8NChatManagement() {
  const [sessions, setSessions] = useState<ChatSession[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedSession, setSelectedSession] = useState<ChatSession | null>(null);
  const [sessionMessages, setSessionMessages] = useState<ChatMessage[]>([]);
  const [totalRecords, setTotalRecords] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 20;

  // 加载N8N聊天会话
  const loadSessions = async (page = 1) => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: pageSize.toString(),
        search: searchTerm
      });

      const response = await fetch(`/api/admin/database/dify-sessions?${params}`);
      const data = await response.json();
      
      if (data.success) {
        setSessions(data.sessions);
        setTotalRecords(data.total);
      }
    } catch (error) {
      console.error('Failed to load N8N sessions:', error);
    } finally {
      setLoading(false);
    }
  };

  // 加载会话消息
  const loadSessionMessages = async (sessionId: string) => {
    try {
      const response = await fetch(`/api/admin/database/dify-sessions/${sessionId}`);
      const data = await response.json();
      
      if (data.success) {
        setSessionMessages(data.messages);
      }
    } catch (error) {
      console.error('Failed to load session messages:', error);
    }
  };

  // 删除会话
  const deleteSession = async (sessionId: string) => {
    if (!confirm('确定要删除这个N8N会话吗？此操作不可恢复。')) {
      return;
    }

    try {
      const response = await fetch(`/api/admin/database/dify-sessions/${sessionId}`, {
        method: 'DELETE'
      });

      if (response.ok) {
        loadSessions(currentPage);
      }
    } catch (error) {
      console.error('Failed to delete session:', error);
    }
  };

  // 导出数据
  const exportData = async (format: 'csv' | 'json', sessionId?: string) => {
    try {
      const params = new URLSearchParams({ format });
      if (sessionId) {
        params.append('session_id', sessionId);
      }

      const response = await fetch(`/api/admin/database/dify-export?${params}`);
      
      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        
        // 从响应头获取文件名
        const contentDisposition = response.headers.get('content-disposition');
        const fileName = contentDisposition?.match(/filename="([^"]+)"/)?.[1] || 
          `n8n_export_${Date.now()}.${format}`;
        
        a.download = fileName;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
      }
    } catch (error) {
      console.error('Failed to export data:', error);
    }
  };

  useEffect(() => {
    loadSessions(currentPage);
    // ESLint disable next line to avoid circular dependency
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchTerm, currentPage]);

  const totalPages = Math.ceil(totalRecords / pageSize);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
          <MessageSquare className="h-6 w-6" />
          聊天记录管理
        </h2>
        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={() => exportData('csv')}
            className="text-green-600 hover:text-green-700"
          >
            <FileText className="h-4 w-4 mr-2" />
            导出CSV
          </Button>
          <Button
            variant="outline"
            onClick={() => exportData('json')}
            className="text-blue-600 hover:text-blue-700"
          >
            <FileJson className="h-4 w-4 mr-2" />
            导出JSON
          </Button>
        </div>
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
                placeholder="搜索会话ID或消息内容..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full"
              />
            </div>
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
            聊天会话 ({totalRecords} 个会话)
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
                    <TableHead>消息数</TableHead>
                    <TableHead>预览内容</TableHead>
                    <TableHead>最后消息ID</TableHead>
                    <TableHead>操作</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {sessions.map((session) => (
                    <TableRow key={session.session_id}>
                      <TableCell className="font-mono text-xs">
                        {session.session_id}
                      </TableCell>
                      <TableCell>
                        <Badge variant="secondary">
                          {session.message_count}
                        </Badge>
                      </TableCell>
                      <TableCell className="max-w-xs truncate">
                        {session.preview_content || '暂无预览'}
                      </TableCell>
                      <TableCell className="text-sm">
                        #{session.last_message_time}
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
                                  loadSessionMessages(session.session_id);
                                }}
                              >
                                <Eye className="h-4 w-4" />
                              </Button>
                            </DialogTrigger>
                            <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
                              <DialogHeader>
                                <DialogTitle>
                                  会话详情: {selectedSession?.session_id}
                                </DialogTitle>
                              </DialogHeader>
                              <div className="space-y-4">
                                <div className="flex gap-2 mb-4">
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => exportData('csv', selectedSession?.session_id)}
                                  >
                                    <Download className="h-4 w-4 mr-2" />
                                    导出CSV
                                  </Button>
                                  <Button
                                    variant="outline" 
                                    size="sm"
                                    onClick={() => exportData('json', selectedSession?.session_id)}
                                  >
                                    <Download className="h-4 w-4 mr-2" />
                                    导出JSON
                                  </Button>
                                </div>
                                {sessionMessages.map((msg) => (
                                  <div
                                    key={msg.id}
                                    className={`p-3 rounded-lg ${
                                      msg.message.type === 'human' 
                                        ? 'bg-blue-50 border-l-4 border-blue-500' 
                                        : 'bg-gray-50 border-l-4 border-gray-500'
                                    }`}
                                  >
                                    <div className="flex justify-between items-center mb-2">
                                      <Badge variant={msg.message.type === 'human' ? 'default' : 'secondary'}>
                                        {msg.message.type === 'human' ? '用户' : 'AI助手'}
                                      </Badge>
                                      <span className="text-xs text-gray-500">
                                        ID: {msg.id}
                                      </span>
                                    </div>
                                    <div className="text-sm whitespace-pre-wrap">
                                      {msg.message.content}
                                    </div>
                                  </div>
                                ))}
                              </div>
                            </DialogContent>
                          </Dialog>
                          
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => deleteSession(session.session_id)}
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