"use client";

import { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
// Switch组件（内联实现）
interface SwitchProps {
  checked: boolean;
  onCheckedChange: (checked: boolean) => void;
  disabled?: boolean;
}

function Switch({ checked, onCheckedChange, disabled }: SwitchProps) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      onClick={() => !disabled && onCheckedChange(!checked)}
      disabled={disabled}
      className={`
        relative inline-flex h-6 w-11 items-center rounded-full transition-colors
        ${checked ? 'bg-blue-600' : 'bg-gray-200'}
        ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
        focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2
      `}
    >
      <span
        className={`
          inline-block h-4 w-4 transform rounded-full bg-white transition-transform
          ${checked ? 'translate-x-6' : 'translate-x-1'}
        `}
      />
    </button>
  );
}
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Users, 
  MessageSquare, 
  Activity, 
  Settings, 
  UserCheck,
  UserX,
  Shield,
  RefreshCw,
  BarChart3,
  Monitor
} from 'lucide-react';
import { GuestAccessMonitor } from './guest-access-monitor';

interface AdminStats {
  overview: {
    totalMessages: number;
    totalUsers: number;
    totalGuests: number;
    totalSessions: number;
    userSessions: number;
    guestSessions: number;
  };
  today: {
    messages: number;
    users: number;
    guests: number;
    sessions: number;
  };
  weeklyTrend: { [key: string]: { user: number, guest: number, total: number } };
  systemSettings: { [key: string]: any };
  lastUpdated: string;
}

export function SystemSettings() {
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [guestModeEnabled, setGuestModeEnabled] = useState(false);
  const [maintenanceMode, setMaintenanceMode] = useState(false);

  // 加载统计数据
  const loadStats = async () => {
    try {
      const response = await fetch('/api/admin/stats');
      if (response.ok) {
        const data = await response.json();
        setStats(data.stats);
        
        // 更新开关状态
        const settings = data.stats.systemSettings;
        setGuestModeEnabled(settings.guest_access_enabled === true);
        setMaintenanceMode(settings.maintenance_mode === true);
        
        console.log('管理员统计数据加载成功');
      } else {
        console.error('Failed to load admin stats');
      }
    } catch (error) {
      console.error('Error loading admin stats:', error);
    } finally {
      setLoading(false);
    }
  };

  // 更新系统设置
  const updateSystemSetting = async (key: string, value: any) => {
    setUpdating(true);
    try {
      const response = await fetch('/api/admin/settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ key, value })
      });
      
      if (response.ok) {
        console.log(`系统设置更新成功: ${key} = ${value}`);
        
        // 刷新统计数据
        await loadStats();
      } else {
        console.error('Failed to update system setting');
      }
    } catch (error) {
      console.error('Error updating system setting:', error);
    } finally {
      setUpdating(false);
    }
  };

  // 处理访客模式开关
  const handleGuestModeToggle = async (enabled: boolean) => {
    setGuestModeEnabled(enabled);
    await updateSystemSetting('guest_access_enabled', enabled);
  };

  // 处理维护模式开关
  const handleMaintenanceModeToggle = async (enabled: boolean) => {
    setMaintenanceMode(enabled);
    await updateSystemSetting('maintenance_mode', enabled);
  };

  // 格式化数字
  const formatNumber = (num: number) => {
    return new Intl.NumberFormat('zh-CN').format(num);
  };

  // 生成最近7天的图表数据
  const generateWeeklyChartData = () => {
    if (!stats?.weeklyTrend) return [];
    
    const last7Days = [];
    for (let i = 6; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      const dateStr = date.toISOString().split('T')[0];
      const dayData = stats.weeklyTrend[dateStr] || { user: 0, guest: 0, total: 0 };
      
      last7Days.push({
        date: dateStr,
        day: date.toLocaleDateString('zh-CN', { weekday: 'short' }),
        user: dayData.user,
        guest: dayData.guest,
        total: dayData.total
      });
    }
    
    return last7Days;
  };

  useEffect(() => {
    loadStats();
    
    // 设置定时刷新（每5分钟）
    const interval = setInterval(loadStats, 5 * 60 * 1000);
    return () => clearInterval(interval);
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-blue-600/30 border-t-blue-600 rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">加载系统设置...</p>
        </div>
      </div>
    );
  }

  const weeklyData = generateWeeklyChartData();

  return (
    <div className="space-y-6">
      {/* 头部 */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <Shield className="w-6 h-6 text-blue-600" />
            系统设置与监控
          </h2>
          <p className="text-gray-600 mt-1">
            管理访客模式、维护模式和系统状态监控
          </p>
        </div>
        <div className="flex items-center gap-4">
          <Badge variant={stats ? "default" : "secondary"} className="px-3 py-1">
            {stats ? "系统正常" : "数据加载中"}
          </Badge>
          <Button 
            onClick={loadStats} 
            disabled={updating}
            size="sm"
            variant="outline"
          >
            <RefreshCw className={`w-4 h-4 mr-2 ${updating ? 'animate-spin' : ''}`} />
            刷新数据
          </Button>
        </div>
      </div>

      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="overview">系统概览</TabsTrigger>
          <TabsTrigger value="settings">访问控制</TabsTrigger>
          <TabsTrigger value="monitor">访客监控</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">

      {/* 快速状态卡片 */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">总消息数</CardTitle>
            <MessageSquare className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatNumber(stats?.overview.totalMessages || 0)}</div>
            <p className="text-xs text-muted-foreground">
              今日新增 {formatNumber(stats?.today.messages || 0)} 条
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">用户数量</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatNumber(stats?.overview.totalUsers || 0)}</div>
            <p className="text-xs text-muted-foreground">
              今日活跃 {formatNumber(stats?.today.users || 0)} 人
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">访客数量</CardTitle>
            <UserCheck className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatNumber(stats?.overview.totalGuests || 0)}</div>
            <p className="text-xs text-muted-foreground">
              今日访问 {formatNumber(stats?.today.guests || 0)} 人
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">会话总数</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatNumber(stats?.overview.totalSessions || 0)}</div>
            <p className="text-xs text-muted-foreground">
              今日会话 {formatNumber(stats?.today.sessions || 0)} 个
            </p>
          </CardContent>
        </Card>
      </div>

      {/* 会话类型分布 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>会话类型分布</CardTitle>
            <CardDescription>用户会话与访客会话的比例</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <UserCheck className="w-4 h-4 text-blue-600" />
                  <span>注册用户会话</span>
                </div>
                <div className="text-right">
                  <div className="font-semibold">{formatNumber(stats?.overview.userSessions || 0)}</div>
                  <div className="text-sm text-gray-500">
                    {stats?.overview.totalSessions ? 
                      Math.round((stats.overview.userSessions / stats.overview.totalSessions) * 100) : 0}%
                  </div>
                </div>
              </div>
              
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <UserX className="w-4 h-4 text-orange-600" />
                  <span>访客会话</span>
                </div>
                <div className="text-right">
                  <div className="font-semibold">{formatNumber(stats?.overview.guestSessions || 0)}</div>
                  <div className="text-sm text-gray-500">
                    {stats?.overview.totalSessions ? 
                      Math.round((stats.overview.guestSessions / stats.overview.totalSessions) * 100) : 0}%
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="w-5 h-5" />
              7日使用趋势
            </CardTitle>
            <CardDescription>
              最近一周的消息数量变化趋势
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {weeklyData.map((day, index) => (
                <div key={day.date} className="flex items-center gap-4">
                  <div className="w-12 text-sm text-gray-600">
                    {day.day}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <div className="text-sm font-medium">
                        {formatNumber(day.total)} 条消息
                      </div>
                      <div className="text-xs text-gray-500">
                        (用户: {day.user}, 访客: {day.guest})
                      </div>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-blue-600 h-2 rounded-full transition-all"
                        style={{ 
                          width: `${Math.max(1, (day.total / Math.max(...weeklyData.map(d => d.total), 1)) * 100)}%` 
                        }}
                      />
                    </div>
                  </div>
                  <div className="w-16 text-right text-sm text-gray-600">
                    {day.date.split('-').slice(1).join('/')}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
        </TabsContent>

        <TabsContent value="settings" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Settings className="w-5 h-5" />
                  访问控制设置
                </CardTitle>
                <CardDescription>
                  管理用户访问权限和模式
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex items-center justify-between">
                  <div className="space-y-1">
                    <div className="font-medium">访客模式</div>
                    <div className="text-sm text-gray-500">
                      允许未登录用户使用聊天功能
                    </div>
                  </div>
                  <Switch
                    checked={guestModeEnabled}
                    onCheckedChange={handleGuestModeToggle}
                    disabled={updating}
                  />
                </div>
                
                <div className="flex items-center justify-between">
                  <div className="space-y-1">
                    <div className="font-medium">维护模式</div>
                    <div className="text-sm text-gray-500">
                      启用后所有用户都无法访问系统
                    </div>
                  </div>
                  <Switch
                    checked={maintenanceMode}
                    onCheckedChange={handleMaintenanceModeToggle}
                    disabled={updating}
                  />
                </div>

                {updating && (
                  <div className="text-sm text-blue-600 flex items-center gap-2">
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    正在更新设置...
                  </div>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>系统状态</CardTitle>
                <CardDescription>当前系统配置和运行状态</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <span>访客访问</span>
                  <Badge variant={guestModeEnabled ? "default" : "secondary"}>
                    {guestModeEnabled ? "已启用" : "已禁用"}
                  </Badge>
                </div>
                
                <div className="flex items-center justify-between">
                  <span>系统状态</span>
                  <Badge variant={maintenanceMode ? "destructive" : "default"}>
                    {maintenanceMode ? "维护中" : "正常运行"}
                  </Badge>
                </div>
                
                <div className="flex items-center justify-between">
                  <span>数据更新时间</span>
                  <span className="text-sm text-gray-500">
                    {stats?.lastUpdated ? new Date(stats.lastUpdated).toLocaleString('zh-CN') : '未知'}
                  </span>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="monitor" className="space-y-6">
          <GuestAccessMonitor />
        </TabsContent>
      </Tabs>
    </div>
  );
}