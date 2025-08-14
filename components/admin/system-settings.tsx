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
  Shield,
  RefreshCw,
  Monitor,
  Database,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Clock,
  Activity,
  Settings
} from 'lucide-react';
import { format } from 'date-fns';
import { zhCN } from 'date-fns/locale';

interface ServiceHealth {
  service_name: string;
  status: 'healthy' | 'warning' | 'error' | 'unknown';
  response_time: number | null;
  error_message: string | null;
  checked_at: string;
  metadata?: {
    uptime?: number;
    memory_usage?: number;
    cpu_usage?: number;
    active_connections?: number;
  };
}

interface SystemMetrics {
  database: ServiceHealth;
}

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
  const [metrics, setMetrics] = useState<SystemMetrics | null>(null);
  const [metricsLoading, setMetricsLoading] = useState(true);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

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

  // 加载系统监控数据
  const fetchSystemMetrics = async () => {
    setMetricsLoading(true);
    try {
      const response = await fetch('/api/admin/system/health');
      const data = await response.json();
      
      if (data.success) {
        setMetrics(data.metrics);
        setLastUpdated(new Date());
      }
    } catch (error) {
      console.error('Failed to fetch system metrics:', error);
    } finally {
      setMetricsLoading(false);
    }
  };

  // 获取状态图标
  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'healthy':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'warning':
        return <AlertTriangle className="h-4 w-4 text-yellow-500" />;
      case 'error':
        return <XCircle className="h-4 w-4 text-red-500" />;
      default:
        return <Clock className="h-4 w-4 text-gray-500" />;
    }
  };

  // 获取状态颜色
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'healthy':
        return 'text-green-600 bg-green-50 border-green-200';
      case 'warning':
        return 'text-yellow-600 bg-yellow-50 border-yellow-200';
      case 'error':
        return 'text-red-600 bg-red-50 border-red-200';
      default:
        return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  };

  // 获取状态文本
  const getStatusText = (status: string) => {
    switch (status) {
      case 'healthy':
        return '正常';
      case 'warning':
        return '警告';
      case 'error':
        return '错误';
      default:
        return '未知';
    }
  };


  useEffect(() => {
    loadStats();
    fetchSystemMetrics();
    
    // 设置定时刷新（每5分钟）
    const interval = setInterval(() => {
      loadStats();
      fetchSystemMetrics();
    }, 5 * 60 * 1000);
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
          {lastUpdated && (
            <span className="text-sm text-gray-500">
              监控更新: {format(lastUpdated, 'HH:mm:ss', { locale: zhCN })}
            </span>
          )}
          <Button 
            onClick={() => {
              loadStats();
              fetchSystemMetrics();
            }} 
            disabled={updating || metricsLoading}
            size="sm"
            variant="outline"
          >
            <RefreshCw className={`w-4 h-4 mr-2 ${(updating || metricsLoading) ? 'animate-spin' : ''}`} />
            刷新数据
          </Button>
        </div>
      </div>

      <Tabs defaultValue="settings" className="space-y-6">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="settings">访问控制</TabsTrigger>
          <TabsTrigger value="monitoring">系统监控</TabsTrigger>
        </TabsList>


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
                  <span>数据更新时间</span>
                  <span className="text-sm text-gray-500">
                    {stats?.lastUpdated ? new Date(stats.lastUpdated).toLocaleString('zh-CN') : '未知'}
                  </span>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="monitoring" className="space-y-6">
          <div className="space-y-6">
            {/* 系统监控头部 */}
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-medium text-gray-900 flex items-center gap-2">
                  <Monitor className="h-5 w-5" />
                  系统服务监控
                </h3>
                <p className="text-gray-500">实时监控系统运行状态和性能指标</p>
              </div>
              <Button 
                onClick={fetchSystemMetrics} 
                disabled={metricsLoading}
                variant="outline"
                size="sm"
              >
                <RefreshCw className={`h-4 w-4 mr-2 ${metricsLoading ? 'animate-spin' : ''}`} />
                刷新监控
              </Button>
            </div>

            {metricsLoading && !metrics ? (
              <div className="text-center py-8">
                <div className="w-8 h-8 border-4 border-blue-600/30 border-t-blue-600 rounded-full animate-spin mx-auto"></div>
                <p className="text-gray-500 mt-2">加载监控数据...</p>
              </div>
            ) : (
              <>
                {/* 服务状态概览 */}
                <div className="grid grid-cols-1 gap-6">
                  {/* 数据库状态 */}
                  <Card className="max-w-lg">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                      <CardTitle className="text-sm font-medium flex items-center gap-2">
                        <Database className="h-4 w-4" />
                        数据库服务
                      </CardTitle>
                      {metrics?.database && getStatusIcon(metrics.database.status)}
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2">
                        <Badge className={getStatusColor(metrics?.database?.status || 'unknown')}>
                          {getStatusText(metrics?.database?.status || 'unknown')}
                        </Badge>
                        {metrics?.database?.response_time && (
                          <div className="text-sm text-gray-600">
                            响应时间: {metrics.database.response_time}ms
                          </div>
                        )}
                        {metrics?.database?.error_message && (
                          <div className="text-xs text-red-600 mt-1">
                            {metrics.database.error_message}
                          </div>
                        )}
                        {metrics?.database?.checked_at && (
                          <div className="text-xs text-gray-500">
                            检查时间: {format(new Date(metrics.database.checked_at), 'yyyy-MM-dd HH:mm:ss', { locale: zhCN })}
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </>
            )}
          </div>
        </TabsContent>

      </Tabs>
    </div>
  );
}