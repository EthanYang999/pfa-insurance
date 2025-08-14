"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { MessageSquare, RefreshCw, Search, Filter, Download, Eye, User, Clock, FileText } from "lucide-react";

interface FeedbackItem {
  id: string;
  submitter_name: string;
  feedback_type: string;
  description: string;
  user_email: string;
  status: string;
  priority: string;
  created_at: string;
  updated_at: string;
}

interface FeedbackResponse {
  data: FeedbackItem[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export function FeedbackManagement() {
  const [feedbacks, setFeedbacks] = useState<FeedbackItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  
  // 筛选状态
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [typeFilter, setTypeFilter] = useState<string>("all");
  const [searchTerm, setSearchTerm] = useState<string>("");
  
  // 详情对话框状态
  const [selectedFeedback, setSelectedFeedback] = useState<FeedbackItem | null>(null);
  const [detailDialogOpen, setDetailDialogOpen] = useState(false);

  const feedbackTypeLabels: Record<string, string> = {
    'knowledge_error': '知识点错误',
    'response_delay': '响应延迟',
    'system_freeze': '系统卡死',
    'ui_issue': '界面问题',
    'feature_request': '功能建议',
    'bug_report': '错误报告',
    'content_quality': '内容质量问题',
    'other': '其他问题'
  };

  const statusLabels: Record<string, string> = {
    'pending': '待处理',
    'in_progress': '处理中',
    'resolved': '已解决',
    'closed': '已关闭'
  };


  const fetchFeedbacks = async () => {
    try {
      setLoading(true);
      setError(null);

      const params = new URLSearchParams({
        page: currentPage.toString(),
        limit: '10'
      });

      if (statusFilter && statusFilter !== 'all') params.append('status', statusFilter);
      if (typeFilter && typeFilter !== 'all') params.append('type', typeFilter);

      const response = await fetch(`/api/feedback?${params}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`获取反馈失败: ${response.statusText}`);
      }

      const data: FeedbackResponse = await response.json();
      setFeedbacks(data.data || []);
      setTotalPages(data.pagination.totalPages);
      setTotalItems(data.pagination.total);
    } catch (err) {
      setError(err instanceof Error ? err.message : '获取反馈失败');
      console.error('获取反馈失败:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFeedbacks();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentPage, statusFilter, typeFilter]);

  const handleRefresh = () => {
    fetchFeedbacks();
  };

  const handleSearch = () => {
    setCurrentPage(1);
    fetchFeedbacks();
  };

  const getBadgeVariant = (status: string) => {
    switch (status) {
      case 'pending': return 'secondary';
      case 'in_progress': return 'default';
      case 'resolved': return 'default';
      case 'closed': return 'outline';
      default: return 'secondary';
    }
  };

  const getBadgeColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-orange-100 text-orange-800 hover:bg-orange-200';
      case 'in_progress': return 'bg-blue-100 text-blue-800 hover:bg-blue-200';
      case 'resolved': return 'bg-green-100 text-green-800 hover:bg-green-200';
      case 'closed': return 'bg-gray-100 text-gray-800 hover:bg-gray-200';
      default: return 'bg-gray-100 text-gray-800 hover:bg-gray-200';
    }
  };

  const handleViewDetail = (feedback: FeedbackItem) => {
    setSelectedFeedback(feedback);
    setDetailDialogOpen(true);
  };

  const handleCloseDetail = () => {
    setDetailDialogOpen(false);
    setSelectedFeedback(null);
  };

  const handleUpdateStatus = async (feedbackId: string, newStatus: string) => {
    try {
      const response = await fetch('/api/feedback', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          id: feedbackId,
          status: newStatus
        })
      });

      if (response.ok) {
        // 刷新列表
        await fetchFeedbacks();
        // 更新选中的反馈状态
        if (selectedFeedback && selectedFeedback.id === feedbackId) {
          setSelectedFeedback(prev => prev ? { ...prev, status: newStatus } : null);
        }
        alert('状态更新成功');
      } else {
        const errorData = await response.json();
        alert(`更新失败: ${errorData.error || '未知错误'}`);
      }
    } catch (error) {
      console.error('更新状态失败:', error);
      alert('更新失败，请重试');
    }
  };

  const handleExport = async (format: 'txt' | 'csv') => {
    try {
      const params = new URLSearchParams();
      if (statusFilter && statusFilter !== 'all') params.append('status', statusFilter);
      if (typeFilter && typeFilter !== 'all') params.append('type', typeFilter);
      
      const response = await fetch(`/api/feedback/export?format=${format}&${params}`);
      
      if (!response.ok) {
        throw new Error('导出失败');
      }
      
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.style.display = 'none';
      a.href = url;
      a.download = `feedback-export-${new Date().toISOString().split('T')[0]}.${format}`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (error) {
      console.error('导出失败:', error);
      alert('导出失败，请重试');
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('zh-CN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <MessageSquare className="h-5 w-5" />
                用户反馈管理
              </CardTitle>
              <CardDescription>
                查看和管理用户提交的反馈信息（共 {totalItems} 条）
              </CardDescription>
            </div>
            <div className="flex gap-2">
              <Select onValueChange={(format: 'txt' | 'csv') => handleExport(format)}>
                <SelectTrigger className="w-auto">
                  <Download className="h-4 w-4 mr-2" />
                  <SelectValue placeholder="导出" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="txt">文本格式 (.txt)</SelectItem>
                  <SelectItem value="csv">表格格式 (.csv)</SelectItem>
                </SelectContent>
              </Select>
              <Button onClick={handleRefresh} disabled={loading} variant="outline">
                <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
                刷新
              </Button>
            </div>
          </div>
        </CardHeader>

        <CardContent className="space-y-4">
          {/* 搜索和筛选 */}
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  placeholder="搜索提交者姓名或描述..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                  onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                />
              </div>
            </div>
            
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-full sm:w-[140px]">
                <SelectValue placeholder="状态筛选" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">全部状态</SelectItem>
                <SelectItem value="pending">待处理</SelectItem>
                <SelectItem value="in_progress">处理中</SelectItem>
                <SelectItem value="resolved">已解决</SelectItem>
                <SelectItem value="closed">已关闭</SelectItem>
              </SelectContent>
            </Select>

            <Select value={typeFilter} onValueChange={setTypeFilter}>
              <SelectTrigger className="w-full sm:w-[140px]">
                <SelectValue placeholder="类型筛选" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">全部类型</SelectItem>
                {Object.entries(feedbackTypeLabels).map(([key, label]) => (
                  <SelectItem key={key} value={key}>{label}</SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Button onClick={handleSearch} variant="outline">
              <Filter className="h-4 w-4 mr-2" />
              搜索
            </Button>
          </div>

          {/* 反馈列表 */}
          {error ? (
            <div className="text-center py-8">
              <div className="text-red-600 mb-2">{error}</div>
              <Button onClick={handleRefresh} variant="outline">
                重试
              </Button>
            </div>
          ) : (
            <div className="border rounded-lg">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>提交者</TableHead>
                    <TableHead>类型</TableHead>
                    <TableHead>描述</TableHead>
                    <TableHead>状态</TableHead>
                    <TableHead>提交时间</TableHead>
                    <TableHead className="text-center">操作</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {loading ? (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center py-8">
                        <div className="flex items-center justify-center">
                          <RefreshCw className="animate-spin h-4 w-4 mr-2" />
                          加载中...
                        </div>
                      </TableCell>
                    </TableRow>
                  ) : feedbacks.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center py-8 text-gray-500">
                        暂无反馈数据
                      </TableCell>
                    </TableRow>
                  ) : (
                    feedbacks.map((feedback) => (
                      <TableRow key={feedback.id}>
                        <TableCell>
                          <div>
                            <div className="font-medium">{feedback.submitter_name}</div>
                            <div className="text-sm text-gray-500">{feedback.user_email}</div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline">
                            {feedbackTypeLabels[feedback.feedback_type] || feedback.feedback_type}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div 
                            className="max-w-xs truncate cursor-pointer hover:text-blue-600 transition-colors" 
                            title="点击查看详情"
                            onClick={() => handleViewDetail(feedback)}
                          >
                            {feedback.description}
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge 
                            variant="secondary" 
                            className={getBadgeColor(feedback.status)}
                          >
                            {statusLabels[feedback.status] || feedback.status}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-sm">
                          {formatDate(feedback.created_at)}
                        </TableCell>
                        <TableCell className="text-center">
                          <Button
                            onClick={() => handleViewDetail(feedback)}
                            variant="outline"
                            size="sm"
                            className="h-8 w-8 p-0"
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
          )}

          {/* 分页 */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between">
              <div className="text-sm text-gray-500">
                第 {currentPage} 页，共 {totalPages} 页
              </div>
              <div className="flex gap-2">
                <Button
                  onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                  disabled={currentPage === 1}
                  variant="outline"
                  size="sm"
                >
                  上一页
                </Button>
                <Button
                  onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                  disabled={currentPage === totalPages}
                  variant="outline"
                  size="sm"
                >
                  下一页
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* 反馈详情对话框 */}
      <Dialog open={detailDialogOpen} onOpenChange={setDetailDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              反馈详情
            </DialogTitle>
          </DialogHeader>
          
          {selectedFeedback && (
            <div className="space-y-6">
              {/* 基本信息 */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-4">
                  <div>
                    <label className="text-sm font-medium text-gray-500">提交者</label>
                    <div className="flex items-center gap-2 mt-1">
                      <User className="h-4 w-4 text-gray-400" />
                      <span className="font-medium">{selectedFeedback.submitter_name}</span>
                    </div>
                    <div className="text-sm text-gray-500 ml-6">{selectedFeedback.user_email}</div>
                  </div>
                  
                  <div>
                    <label className="text-sm font-medium text-gray-500">反馈类型</label>
                    <div className="mt-1">
                      <Badge variant="outline" className="text-sm">
                        {feedbackTypeLabels[selectedFeedback.feedback_type] || selectedFeedback.feedback_type}
                      </Badge>
                    </div>
                  </div>
                </div>
                
                <div className="space-y-4">
                  <div>
                    <label className="text-sm font-medium text-gray-500">当前状态</label>
                    <div className="mt-1">
                      <Badge 
                        variant="secondary" 
                        className={getBadgeColor(selectedFeedback.status)}
                      >
                        {statusLabels[selectedFeedback.status] || selectedFeedback.status}
                      </Badge>
                    </div>
                  </div>
                  
                  <div>
                    <label className="text-sm font-medium text-gray-500">提交时间</label>
                    <div className="flex items-center gap-2 mt-1">
                      <Clock className="h-4 w-4 text-gray-400" />
                      <span className="text-sm">{formatDate(selectedFeedback.created_at)}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* 反馈内容 */}
              <div>
                <label className="text-sm font-medium text-gray-500">反馈描述</label>
                <div className="mt-2 p-4 bg-gray-50 rounded-lg border">
                  <p className="text-sm leading-relaxed whitespace-pre-wrap">
                    {selectedFeedback.description}
                  </p>
                </div>
              </div>

              {/* 操作按钮 */}
              <div className="flex justify-between pt-4 border-t">
                <div className="flex gap-2">
                  {selectedFeedback.status === 'pending' && (
                    <Button 
                      onClick={() => handleUpdateStatus(selectedFeedback.id, 'in_progress')}
                      className="bg-blue-600 hover:bg-blue-700"
                    >
                      标记为处理中
                    </Button>
                  )}
                  {selectedFeedback.status === 'in_progress' && (
                    <Button 
                      onClick={() => handleUpdateStatus(selectedFeedback.id, 'resolved')}
                      className="bg-green-600 hover:bg-green-700"
                    >
                      标记为已解决
                    </Button>
                  )}
                  {(selectedFeedback.status === 'resolved' || selectedFeedback.status === 'in_progress') && (
                    <Button 
                      onClick={() => handleUpdateStatus(selectedFeedback.id, 'closed')}
                      variant="outline"
                      className="border-gray-400 text-gray-600 hover:bg-gray-50"
                    >
                      关闭反馈
                    </Button>
                  )}
                  {selectedFeedback.status !== 'pending' && (
                    <Button 
                      onClick={() => handleUpdateStatus(selectedFeedback.id, 'pending')}
                      variant="outline"
                      className="border-orange-400 text-orange-600 hover:bg-orange-50"
                    >
                      重新打开
                    </Button>
                  )}
                </div>
                <Button variant="outline" onClick={handleCloseDetail}>
                  关闭
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}