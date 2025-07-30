'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Badge } from '../ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../ui/table';
import { FileText, Search, RefreshCw, Download, Filter, User, AlertTriangle, Info, Activity } from 'lucide-react';
import { format } from 'date-fns';
import { zhCN } from 'date-fns/locale';

interface SystemLog {
  id: string;
  admin_id: string;
  action: string;
  target_type: string | null;
  target_id: string | null;
  details: Record<string, unknown>;
  ip_address: string | null;
  user_agent: string | null;
  created_at: string;
  admin_email?: string;
}

export function SystemLogs() {
  const [logs, setLogs] = useState<SystemLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [actionFilter, setActionFilter] = useState<string>('all');
  const [targetFilter, setTargetFilter] = useState<string>('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalRecords, setTotalRecords] = useState(0);
  const pageSize = 50;

  const fetchLogs = async (page = 1) => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: pageSize.toString(),
        search: searchTerm,
        action: actionFilter,
        target_type: targetFilter
      });

      const response = await fetch(`/api/admin/logs?${params}`);
      const data = await response.json();
      
      if (data.success) {
        setLogs(data.logs);
        setTotalRecords(data.total);
      }
    } catch (error) {
      console.error('Failed to fetch logs:', error);
    } finally {
      setLoading(false);
    }
  };

  const exportLogs = async () => {
    try {
      const params = new URLSearchParams({
        search: searchTerm,
        action: actionFilter,
        target_type: targetFilter,
        format: 'csv'
      });

      const response = await fetch(`/api/admin/logs/export?${params}`);
      const blob = await response.blob();
      
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `system-logs-${format(new Date(), 'yyyy-MM-dd')}.csv`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (error) {
      console.error('Failed to export logs:', error);
    }
  };

  useEffect(() => {
    fetchLogs(currentPage);
    // ESLint disable next line to avoid circular dependency
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentPage, searchTerm, actionFilter, targetFilter]);

  const getActionIcon = (action: string) => {
    if (action.includes('delete') || action.includes('ban')) {
      return <AlertTriangle className="h-4 w-4 text-red-500" />;
    }
    if (action.includes('create') || action.includes('add')) {
      return <Activity className="h-4 w-4 text-green-500" />;
    }
    if (action.includes('view') || action.includes('check')) {
      return <Info className="h-4 w-4 text-blue-500" />;
    }
    return <User className="h-4 w-4 text-gray-500" />;
  };

  const getActionColor = (action: string) => {
    if (action.includes('delete') || action.includes('ban')) {
      return 'text-red-600 bg-red-50 border-red-200';
    }
    if (action.includes('create') || action.includes('add')) {
      return 'text-green-600 bg-green-50 border-green-200';
    }
    if (action.includes('view') || action.includes('check')) {
      return 'text-blue-600 bg-blue-50 border-blue-200';
    }
    return 'text-gray-600 bg-gray-50 border-gray-200';
  };

  const formatAction = (action: string) => {
    const actionMap: Record<string, string> = {
      'create_user': '创建用户',
      'update_user': '更新用户',
      'delete_user': '删除用户',
      'reset_password': '重置密码',
      'ban_user': '禁用用户',
      'unban_user': '启用用户',
      'view_user_data': '查看用户数据',
      'delete_session': '删除会话',
      'archive_session': '归档会话',
      'unarchive_session': '取消归档会话',
      'view_system_health': '查看系统状态',
      'update_config': '更新系统配置',
      'export_data': '导出数据'
    };
    
    return actionMap[action] || action;
  };

  const totalPages = Math.ceil(totalRecords / pageSize);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <FileText className="h-6 w-6" />
            系统日志管理
          </h2>
          <p className="text-gray-500">查看和管理系统操作日志</p>
        </div>
        <div className="flex items-center gap-2">
          <Button 
            onClick={exportLogs}
            variant="outline"
            size="sm"
          >
            <Download className="h-4 w-4 mr-2" />
            导出日志
          </Button>
          <Button 
            onClick={() => fetchLogs(currentPage)} 
            disabled={loading}
            variant="outline"
            size="sm"
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
            刷新
          </Button>
        </div>
      </div>

      {/* 搜索和筛选 */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="h-5 w-5" />
            搜索和筛选
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Input
              placeholder="搜索操作或目标..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            
            <Select value={actionFilter} onValueChange={setActionFilter}>
              <SelectTrigger>
                <SelectValue placeholder="操作类型" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">全部操作</SelectItem>
                <SelectItem value="create_user">创建用户</SelectItem>
                <SelectItem value="update_user">更新用户</SelectItem>
                <SelectItem value="delete_user">删除用户</SelectItem>
                <SelectItem value="reset_password">重置密码</SelectItem>
                <SelectItem value="ban_user">用户管理</SelectItem>
                <SelectItem value="delete_session">会话管理</SelectItem>
                <SelectItem value="view_system_health">系统监控</SelectItem>
              </SelectContent>
            </Select>

            <Select value={targetFilter} onValueChange={setTargetFilter}>
              <SelectTrigger>
                <SelectValue placeholder="目标类型" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">全部类型</SelectItem>
                <SelectItem value="user">用户</SelectItem>
                <SelectItem value="session">会话</SelectItem>
                <SelectItem value="system">系统</SelectItem>
                <SelectItem value="admin">管理员</SelectItem>
              </SelectContent>
            </Select>

            <Button onClick={() => {
              setCurrentPage(1);
              fetchLogs(1);
            }} disabled={loading}>
              <Search className="h-4 w-4 mr-2" />
              搜索
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* 日志列表 */}
      <Card>
        <CardHeader>
          <CardTitle>
            操作日志 ({totalRecords} 条记录)
          </CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-8">
              <div className="w-8 h-8 border-4 border-pfa-royal-blue/30 border-t-pfa-royal-blue rounded-full animate-spin mx-auto"></div>
              <p className="text-gray-500 mt-2">加载日志...</p>
            </div>
          ) : (
            <>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>时间</TableHead>
                    <TableHead>操作员</TableHead>
                    <TableHead>操作</TableHead>
                    <TableHead>目标</TableHead>
                    <TableHead>详情</TableHead>
                    <TableHead>IP地址</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {logs.map((log) => (
                    <TableRow key={log.id}>
                      <TableCell className="text-sm">
                        {format(new Date(log.created_at), 'yyyy-MM-dd HH:mm:ss', { locale: zhCN })}
                      </TableCell>
                      <TableCell className="text-sm">
                        {log.admin_email || log.admin_id.slice(0, 8)}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          {getActionIcon(log.action)}
                          <Badge className={getActionColor(log.action)}>
                            {formatAction(log.action)}
                          </Badge>
                        </div>
                      </TableCell>
                      <TableCell className="text-sm">
                        {log.target_type && log.target_id && (
                          <div>
                            <div className="font-medium">{log.target_type}</div>
                            <div className="text-gray-500 font-mono text-xs">
                              {log.target_id.slice(0, 8)}...
                            </div>
                          </div>
                        )}
                      </TableCell>
                      <TableCell className="text-sm max-w-xs">
                        {Object.keys(log.details).length > 0 && (
                          <details className="cursor-pointer">
                            <summary className="text-blue-600">查看详情</summary>
                            <pre className="text-xs bg-gray-100 p-2 rounded mt-1 overflow-auto">
                              {JSON.stringify(log.details, null, 2)}
                            </pre>
                          </details>
                        )}
                      </TableCell>
                      <TableCell className="text-sm font-mono">
                        {log.ip_address || 'N/A'}
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