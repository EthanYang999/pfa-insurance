"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { 
  Users, 
  Search, 
  UserPlus, 
  Eye, 
  Ban,
  UnlockKeyhole,
  Activity
} from "lucide-react";
import { UserInfo, AdminQuery } from "@/types/admin";

export function UserManagement() {
  const [users, setUsers] = useState<UserInfo[]>([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState<AdminQuery>({
    page: 1,
    limit: 20,
    search: '',
    sortBy: 'created_at',
    sortOrder: 'desc'
  });
  const [totalCount, setTotalCount] = useState(0);
  const [selectedUser, setSelectedUser] = useState<UserInfo | null>(null);

  useEffect(() => {
    fetchUsers();
  }, [query]); // eslint-disable-line react-hooks/exhaustive-deps

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      Object.entries(query).forEach(([key, value]) => {
        if (value !== undefined && value !== '') {
          params.set(key, value.toString());
        }
      });

      const response = await fetch(`/api/admin/users?${params}`);
      if (response.ok) {
        const data = await response.json();
        setUsers(data.users);
        setTotalCount(data.total);
      }
    } catch (error) {
      console.error('获取用户列表失败:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (searchTerm: string) => {
    setQuery(prev => ({ ...prev, search: searchTerm, page: 1 }));
  };

  const handleResetPassword = async (userId: string) => {
    if (!confirm('确定要重置该用户的密码吗？系统将发送重置邮件给用户。')) return;

    try {
      const response = await fetch('/api/admin/users/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId })
      });

      if (response.ok) {
        alert('密码重置邮件已发送');
      } else {
        alert('重置密码失败');
      }
    } catch (error) {
      console.error('重置密码失败:', error);
      alert('重置密码失败');
    }
  };

  const handleBanUser = async (userId: string, ban: boolean) => {
    const action = ban ? '禁用' : '启用';
    if (!confirm(`确定要${action}该用户吗？`)) return;

    try {
      const response = await fetch('/api/admin/users/ban', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, ban })
      });

      if (response.ok) {
        alert(`用户${action}成功`);
        fetchUsers();
      } else {
        alert(`${action}用户失败`);
      }
    } catch (error) {
      console.error(`${action}用户失败:`, error);
      alert(`${action}用户失败`);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('zh-CN');
  };

  const getUserStatus = (user: UserInfo) => {
    if (user.banned_until) {
      return { label: '已禁用', color: 'destructive' as const };
    }
    if (user.email_confirmed_at) {
      return { label: '正常', color: 'default' as const };
    }
    return { label: '未验证', color: 'secondary' as const };
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">用户管理</h2>
          <p className="text-gray-500">管理系统用户账户和权限</p>
        </div>
        <Button>
          <UserPlus className="h-4 w-4 mr-2" />
          添加用户
        </Button>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center space-x-4">
            <div className="relative flex-1 max-w-sm">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                placeholder="搜索用户邮箱..."
                value={query.search || ''}
                onChange={(e) => handleSearch(e.target.value)}
                className="pl-10"
              />
            </div>
            <select
              value={query.status || ''}
              onChange={(e) => setQuery(prev => ({ ...prev, status: e.target.value, page: 1 }))}
              className="px-3 py-2 border rounded-md"
            >
              <option value="">所有状态</option>
              <option value="active">正常</option>
              <option value="banned">已禁用</option>
              <option value="unverified">未验证</option>
            </select>
          </div>
        </CardContent>
      </Card>

      {/* Users Table */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            用户列表 ({totalCount})
          </CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex justify-center py-8">
              <div className="w-6 h-6 border-2 border-pfa-royal-blue/30 border-t-pfa-royal-blue rounded-full animate-spin"></div>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>用户信息</TableHead>
                  <TableHead>状态</TableHead>
                  <TableHead>注册时间</TableHead>
                  <TableHead>最后登录</TableHead>
                  <TableHead>活动统计</TableHead>
                  <TableHead className="text-right">操作</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {users.map((user) => {
                  const status = getUserStatus(user);
                  return (
                    <TableRow key={user.id}>
                      <TableCell>
                        <div className="flex items-center space-x-3">
                          <div className="w-8 h-8 bg-pfa-champagne-gold rounded-full flex items-center justify-center">
                            <span className="text-xs font-medium text-pfa-royal-blue">
                              {user.email[0].toUpperCase()}
                            </span>
                          </div>
                          <div>
                            <div className="font-medium">{user.email}</div>
                            <div className="text-sm text-gray-500">ID: {user.id.slice(0, 8)}...</div>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant={status.color}>{status.label}</Badge>
                      </TableCell>
                      <TableCell className="text-sm">
                        {formatDate(user.created_at)}
                      </TableCell>
                      <TableCell className="text-sm">
                        {user.last_sign_in_at ? formatDate(user.last_sign_in_at) : '从未登录'}
                      </TableCell>
                      <TableCell className="text-sm">
                        <div className="space-y-1">
                          <div>{user.session_count || 0} 个会话</div>
                          <div className="text-gray-500">{user.message_count || 0} 条消息</div>
                        </div>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end space-x-2">
                          <Dialog>
                            <DialogTrigger asChild>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => setSelectedUser(user)}
                              >
                                <Eye className="h-4 w-4" />
                              </Button>
                            </DialogTrigger>
                            <DialogContent className="max-w-2xl">
                              <DialogHeader>
                                <DialogTitle>用户详情</DialogTitle>
                              </DialogHeader>
                              {selectedUser && (
                                <UserDetailView user={selectedUser} />
                              )}
                            </DialogContent>
                          </Dialog>

                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleResetPassword(user.id)}
                          >
                            <UnlockKeyhole className="h-4 w-4" />
                          </Button>

                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleBanUser(user.id, !user.banned_until)}
                          >
                            {user.banned_until ? (
                              <Activity className="h-4 w-4 text-green-600" />
                            ) : (
                              <Ban className="h-4 w-4 text-red-600" />
                            )}
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          )}

          {/* Pagination */}
          {totalCount > (query.limit || 20) && (
            <div className="flex items-center justify-between mt-4">
              <div className="text-sm text-gray-500">
                显示 {((query.page || 1) - 1) * (query.limit || 20) + 1} 到{' '}
                {Math.min((query.page || 1) * (query.limit || 20), totalCount)} 条，共 {totalCount} 条
              </div>
              <div className="flex space-x-2">
                <Button
                  variant="outline"
                  size="sm"
                  disabled={(query.page || 1) <= 1}
                  onClick={() => setQuery(prev => ({ ...prev, page: (prev.page || 1) - 1 }))}
                >
                  上一页
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  disabled={(query.page || 1) * (query.limit || 20) >= totalCount}
                  onClick={() => setQuery(prev => ({ ...prev, page: (prev.page || 1) + 1 }))}
                >
                  下一页
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

function UserDetailView({ user }: { user: UserInfo }) {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="text-sm font-medium text-gray-500">用户ID</label>
          <div className="mt-1 text-sm">{user.id}</div>
        </div>
        <div>
          <label className="text-sm font-medium text-gray-500">邮箱地址</label>
          <div className="mt-1 text-sm">{user.email}</div>
        </div>
        <div>
          <label className="text-sm font-medium text-gray-500">注册时间</label>
          <div className="mt-1 text-sm">{new Date(user.created_at).toLocaleString('zh-CN')}</div>
        </div>
        <div>
          <label className="text-sm font-medium text-gray-500">最后登录</label>
          <div className="mt-1 text-sm">
            {user.last_sign_in_at ? new Date(user.last_sign_in_at).toLocaleString('zh-CN') : '从未登录'}
          </div>
        </div>
        <div>
          <label className="text-sm font-medium text-gray-500">邮箱验证</label>
          <div className="mt-1 text-sm">
            {user.email_confirmed_at ? '已验证' : '未验证'}
          </div>
        </div>
        <div>
          <label className="text-sm font-medium text-gray-500">账户状态</label>
          <div className="mt-1 text-sm">
            {user.banned_until ? '已禁用' : '正常'}
          </div>
        </div>
      </div>

      <div className="border-t pt-4">
        <h4 className="text-sm font-medium text-gray-500 mb-3">活动统计</h4>
        <div className="grid grid-cols-3 gap-4 text-center">
          <div className="bg-gray-50 rounded-lg p-3">
            <div className="text-2xl font-bold text-pfa-royal-blue">{user.session_count || 0}</div>
            <div className="text-xs text-gray-500">聊天会话</div>
          </div>
          <div className="bg-gray-50 rounded-lg p-3">
            <div className="text-2xl font-bold text-pfa-royal-blue">{user.message_count || 0}</div>
            <div className="text-xs text-gray-500">消息数量</div>
          </div>
          <div className="bg-gray-50 rounded-lg p-3">
            <div className="text-2xl font-bold text-pfa-royal-blue">
              {user.last_activity ? new Date(user.last_activity).toLocaleDateString() : 'N/A'}
            </div>
            <div className="text-xs text-gray-500">最后活动</div>
          </div>
        </div>
      </div>
    </div>
  );
}