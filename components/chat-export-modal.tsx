"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { 
  X, 
  Download, 
  FileText, 
  FileSpreadsheet, 
  FileJson,
  CheckSquare,
  Square,
  AlertCircle
} from "lucide-react";
import { ChatSessionWithStats } from "@/types/chat";

interface ChatExportModalProps {
  isOpen: boolean;
  onClose: () => void;
  sessions: ChatSessionWithStats[];
  selectedSessionId?: string | null;
}

export function ChatExportModal({ 
  isOpen, 
  onClose, 
  sessions, 
  selectedSessionId 
}: ChatExportModalProps) {
  const [selectedSessions, setSelectedSessions] = useState<string[]>(
    selectedSessionId ? [selectedSessionId] : []
  );
  const [exportFormat, setExportFormat] = useState<'json' | 'csv' | 'txt'>('json');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [includeMetadata, setIncludeMetadata] = useState(true);
  const [isExporting, setIsExporting] = useState(false);
  const [error, setError] = useState('');

  if (!isOpen) return null;

  // 格式配置
  const formatOptions = [
    {
      value: 'json' as const,
      label: 'JSON格式',
      icon: FileJson,
      description: '结构化数据，适合程序处理',
      extension: '.json'
    },
    {
      value: 'csv' as const,
      label: 'CSV格式', 
      icon: FileSpreadsheet,
      description: '表格格式，可用Excel打开',
      extension: '.csv'
    },
    {
      value: 'txt' as const,
      label: '文本格式',
      icon: FileText,
      description: '纯文本，便于阅读',
      extension: '.txt'
    }
  ];

  // 处理会话选择
  const toggleSession = (sessionId: string) => {
    setSelectedSessions(prev => 
      prev.includes(sessionId)
        ? prev.filter(id => id !== sessionId)
        : [...prev, sessionId]
    );
  };

  // 全选/取消全选
  const toggleAllSessions = () => {
    if (selectedSessions.length === sessions.length) {
      setSelectedSessions([]);
    } else {
      setSelectedSessions(sessions.map(s => s.id));
    }
  };

  // 执行导出
  const handleExport = async () => {
    if (selectedSessions.length === 0) {
      setError('请至少选择一个对话');
      return;
    }

    setIsExporting(true);
    setError('');

    try {
      const exportData = {
        sessionIds: selectedSessions,
        format: exportFormat,
        dateFrom: dateFrom || undefined,
        dateTo: dateTo || undefined,
        includeMetadata
      };

      const response = await fetch('/api/chat-export', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(exportData)
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || '导出失败');
      }

      // 获取文件内容
      const blob = await response.blob();
      
      // 创建下载链接
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      
      // 从响应头获取文件名，或生成默认文件名
      const contentDisposition = response.headers.get('Content-Disposition');
      let filename = `chat_export_${new Date().toISOString().split('T')[0]}`;
      
      if (contentDisposition) {
        const filenameMatch = contentDisposition.match(/filename="(.+)"/);
        if (filenameMatch) {
          filename = filenameMatch[1];
        }
      } else {
        const format = formatOptions.find(f => f.value === exportFormat);
        filename += format?.extension || '.txt';
      }
      
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);

      // 导出成功，关闭模态框
      onClose();
      
    } catch (error) {
      console.error('导出失败:', error);
      setError(error instanceof Error ? error.message : '导出失败');
    } finally {
      setIsExporting(false);
    }
  };

  // 格式化时间显示
  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('zh-CN') + ' ' + 
           date.toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <Card className="w-full max-w-4xl max-h-[90vh] overflow-hidden">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
          <CardTitle className="flex items-center gap-2">
            <Download className="h-5 w-5" />
            导出聊天记录
          </CardTitle>
          <Button
            variant="ghost"
            size="sm"
            onClick={onClose}
            className="h-8 w-8 p-0"
          >
            <X className="h-4 w-4" />
          </Button>
        </CardHeader>

        <CardContent className="space-y-6 overflow-y-auto max-h-[calc(90vh-8rem)]">
          {/* 错误提示 */}
          {error && (
            <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700">
              <AlertCircle className="h-4 w-4" />
              <span className="text-sm">{error}</span>
            </div>
          )}

          {/* 导出格式选择 */}
          <div>
            <h3 className="text-sm font-medium mb-3">选择导出格式</h3>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {formatOptions.map((format) => {
                const Icon = format.icon;
                return (
                  <label
                    key={format.value}
                    className={`cursor-pointer p-4 border rounded-lg transition-colors ${
                      exportFormat === format.value
                        ? 'border-pfa-champagne-gold bg-pfa-champagne-gold/5'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <input
                      type="radio"
                      name="format"
                      value={format.value}
                      checked={exportFormat === format.value}
                      onChange={(e) => setExportFormat(e.target.value as 'json' | 'csv' | 'txt')}
                      className="sr-only"
                    />
                    <div className="flex items-start gap-3">
                      <Icon className={`h-5 w-5 mt-0.5 ${
                        exportFormat === format.value ? 'text-pfa-champagne-gold' : 'text-gray-400'
                      }`} />
                      <div>
                        <div className="font-medium text-sm">{format.label}</div>
                        <div className="text-xs text-gray-500 mt-1">{format.description}</div>
                      </div>
                    </div>
                  </label>
                );
              })}
            </div>
          </div>

          {/* 时间范围 */}
          <div>
            <h3 className="text-sm font-medium mb-3">时间范围（可选）</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs text-gray-500 mb-1">开始日期</label>
                <Input
                  type="date"
                  value={dateFrom}
                  onChange={(e) => setDateFrom(e.target.value)}
                  className="text-sm"
                />
              </div>
              <div>
                <label className="block text-xs text-gray-500 mb-1">结束日期</label>
                <Input
                  type="date"
                  value={dateTo}
                  onChange={(e) => setDateTo(e.target.value)}
                  className="text-sm"
                />
              </div>
            </div>
          </div>

          {/* 导出选项 */}
          <div>
            <h3 className="text-sm font-medium mb-3">导出选项</h3>
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={includeMetadata}
                onChange={(e) => setIncludeMetadata(e.target.checked)}
                className="rounded border-gray-300"
              />
              <span className="text-sm">包含元数据（响应时间、错误信息等）</span>
            </label>
          </div>

          {/* 会话选择 */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-medium">选择要导出的对话</h3>
              <Button
                variant="ghost"
                size="sm"
                onClick={toggleAllSessions}
                className="text-xs"
              >
                {selectedSessions.length === sessions.length ? (
                  <>
                    <Square className="h-3 w-3 mr-1" />
                    取消全选
                  </>
                ) : (
                  <>
                    <CheckSquare className="h-3 w-3 mr-1" />
                    全选
                  </>
                )}
              </Button>
            </div>
            
            <div className="max-h-60 overflow-y-auto border rounded-lg">
              {sessions.length === 0 ? (
                <div className="p-4 text-center text-gray-500 text-sm">
                  暂无聊天记录
                </div>
              ) : (
                sessions.map((session) => (
                  <label
                    key={session.id}
                    className="flex items-start gap-3 p-3 hover:bg-gray-50 cursor-pointer border-b last:border-b-0"
                  >
                    <input
                      type="checkbox"
                      checked={selectedSessions.includes(session.id)}
                      onChange={() => toggleSession(session.id)}
                      className="mt-1 rounded border-gray-300"
                    />
                    <div className="flex-1 min-w-0">
                      <div className="font-medium text-sm truncate">{session.title}</div>
                      <div className="text-xs text-gray-500 mt-1">
                        {formatTime(session.created_at)} • {session.message_count} 条消息
                      </div>
                      {session.last_message_preview && (
                        <div className="text-xs text-gray-400 mt-1 truncate">
                          {session.last_message_preview}
                        </div>
                      )}
                    </div>
                  </label>
                ))
              )}
            </div>
            
            {selectedSessions.length > 0 && (
              <div className="mt-2 text-xs text-gray-500">
                已选择 {selectedSessions.length} 个对话
              </div>
            )}
          </div>

          {/* 操作按钮 */}
          <div className="flex justify-end gap-3 pt-4 border-t">
            <Button
              variant="outline"
              onClick={onClose}
              disabled={isExporting}
            >
              取消
            </Button>
            <Button
              onClick={handleExport}
              disabled={isExporting || selectedSessions.length === 0}
              className="bg-pfa-royal-blue hover:bg-pfa-navy-blue text-white"
            >
              {isExporting ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin mr-2" />
                  导出中...
                </>
              ) : (
                <>
                  <Download className="h-4 w-4 mr-2" />
                  导出 ({selectedSessions.length})
                </>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}