"use client";

import { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  Users, 
  UserCheck,
  Activity,
  Clock,
  RefreshCw,
  TrendingUp,
  AlertTriangle
} from 'lucide-react';

interface GuestMonitorData {
  realTimeGuests: number;
  todayGuests: number;
  guestSessions: number;
  averageSessionDuration: number;
  recentGuestActivity: Array<{
    guest_id: string;
    sessions: number;
    lastActivity: string;
    messages: number;
  }>;
  peakHours: Array<{
    hour: number;
    guestCount: number;
  }>;
}

export function GuestAccessMonitor() {
  const [monitorData, setMonitorData] = useState<GuestMonitorData | null>(null);
  const [loading, setLoading] = useState(true);
  const [autoRefresh, setAutoRefresh] = useState(true);

  const loadMonitorData = async () => {
    try {
      const response = await fetch('/api/admin/guest-monitor');
      if (response.ok) {
        const data = await response.json();
        setMonitorData(data.monitorData);
      } else {
        console.error('Failed to load guest monitor data');
      }
    } catch (error) {
      console.error('Error loading guest monitor data:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadMonitorData();
    
    if (autoRefresh) {
      const interval = setInterval(loadMonitorData, 30000); // 每30秒刷新
      return () => clearInterval(interval);
    }
  }, [autoRefresh]);

  const formatDuration = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);
    if (hours > 0) {
      return `${hours}小时${minutes % 60}分钟`;
    }
    return `${minutes}分钟`;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-blue-600/30 border-t-blue-600 rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">加载访客监控数据...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* 头部控制 */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <UserCheck className="w-6 h-6 text-green-600" />
            访客访问监控
          </h2>
          <p className="text-gray-600 mt-1">实时监控访客活动和使用情况</p>
        </div>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <label className="text-sm text-gray-600">自动刷新</label>
            <button
              onClick={() => setAutoRefresh(!autoRefresh)}
              className={`
                relative inline-flex h-5 w-9 items-center rounded-full transition-colors
                ${autoRefresh ? 'bg-green-600' : 'bg-gray-300'}
              `}
            >
              <span
                className={`
                  inline-block h-3 w-3 transform rounded-full bg-white transition-transform
                  ${autoRefresh ? 'translate-x-5' : 'translate-x-1'}
                `}
              />
            </button>
          </div>
          <Button 
            onClick={loadMonitorData} 
            size="sm"
            variant="outline"
          >
            <RefreshCw className="w-4 h-4 mr-2" />
            刷新
          </Button>
        </div>
      </div>

      {/* 关键指标卡片 */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">当前在线访客</CardTitle>
            <Activity className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {monitorData?.realTimeGuests || 0}
            </div>
            <p className="text-xs text-muted-foreground">
              实时活跃访客数量
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">今日访客总数</CardTitle>
            <Users className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">
              {monitorData?.todayGuests || 0}
            </div>
            <p className="text-xs text-muted-foreground">
              今日独立访客数
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">访客会话数</CardTitle>
            <TrendingUp className="h-4 w-4 text-purple-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-purple-600">
              {monitorData?.guestSessions || 0}
            </div>
            <p className="text-xs text-muted-foreground">
              今日访客会话总数
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">平均会话时长</CardTitle>
            <Clock className="h-4 w-4 text-orange-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">
              {formatDuration(monitorData?.averageSessionDuration || 0)}
            </div>
            <p className="text-xs text-muted-foreground">
              访客平均停留时间
            </p>
          </CardContent>
        </Card>
      </div>

      {/* 详细监控信息 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* 最近访客活动 */}
        <Card>
          <CardHeader>
            <CardTitle>最近访客活动</CardTitle>
            <CardDescription>最近活跃的访客用户</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {monitorData?.recentGuestActivity?.length ? (
                monitorData.recentGuestActivity.map((guest, index) => (
                  <div key={guest.guest_id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-orange-100 rounded-full flex items-center justify-center">
                        <UserCheck className="w-4 h-4 text-orange-600" />
                      </div>
                      <div>
                        <div className="font-medium text-sm">
                          访客 {guest.guest_id.slice(-8)}
                        </div>
                        <div className="text-xs text-gray-500">
                          {guest.sessions} 个会话 · {guest.messages} 条消息
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-xs text-gray-500">
                        {new Date(guest.lastActivity).toLocaleTimeString('zh-CN')}
                      </div>
                      <Badge variant="secondary" className="text-xs">
                        活跃
                      </Badge>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-8 text-gray-500">
                  <UserCheck className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                  <p>暂无访客活动</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* 高峰时段分析 */}
        <Card>
          <CardHeader>
            <CardTitle>访客活跃时段</CardTitle>
            <CardDescription>今日各时段访客数量分布</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {monitorData?.peakHours?.length ? (
                monitorData.peakHours.map((hourData, index) => (
                  <div key={hourData.hour} className="flex items-center gap-4">
                    <div className="w-16 text-sm text-gray-600">
                      {hourData.hour.toString().padStart(2, '0')}:00
                    </div>
                    <div className="flex-1">
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div 
                          className="bg-blue-600 h-2 rounded-full transition-all"
                          style={{ 
                            width: `${Math.max(5, (hourData.guestCount / Math.max(...monitorData.peakHours.map(h => h.guestCount), 1)) * 100)}%` 
                          }}
                        />
                      </div>
                    </div>
                    <div className="w-12 text-right text-sm font-medium">
                      {hourData.guestCount}
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-8 text-gray-500">
                  <Activity className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                  <p>暂无时段数据</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* 系统状态警告 */}
      {monitorData && (
        <Card className="border-orange-200 bg-orange-50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-orange-800">
              <AlertTriangle className="w-5 h-5" />
              系统状态提醒
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2 text-sm">
              {monitorData.realTimeGuests > 50 && (
                <div className="flex items-center gap-2 text-orange-700">
                  <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
                  当前在线访客数量较高，请关注系统性能
                </div>
              )}
              {monitorData.todayGuests > 200 && (
                <div className="flex items-center gap-2 text-orange-700">
                  <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
                  今日访客数量已超过日常水平，建议监控系统负载
                </div>
              )}
              {monitorData.averageSessionDuration > 1800 && (
                <div className="flex items-center gap-2 text-green-700">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  访客会话时长较长，用户粘性良好
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}