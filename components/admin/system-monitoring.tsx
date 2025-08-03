'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { 
  Activity, 
  Database, 
  AlertTriangle, 
  CheckCircle, 
  XCircle,
  RefreshCw,
  Clock
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

export function SystemMonitoring() {
  const [metrics, setMetrics] = useState<SystemMetrics | null>(null);
  const [loading, setLoading] = useState(true);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  const fetchSystemMetrics = async () => {
    setLoading(true);
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
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSystemMetrics();
    // 自动刷新，每30秒
    const interval = setInterval(fetchSystemMetrics, 30000);
    
    return () => clearInterval(interval);
  }, []);

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

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <Activity className="h-6 w-6" />
            系统监控
          </h2>
          <p className="text-gray-500">实时监控系统运行状态和性能指标</p>
        </div>
        <div className="flex items-center gap-4">
          {lastUpdated && (
            <span className="text-sm text-gray-500">
              最后更新: {format(lastUpdated, 'HH:mm:ss', { locale: zhCN })}
            </span>
          )}
          <Button 
            onClick={fetchSystemMetrics} 
            disabled={loading}
            variant="outline"
            size="sm"
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
            刷新
          </Button>
        </div>
      </div>

      {loading && !metrics ? (
        <div className="text-center py-8">
          <div className="w-8 h-8 border-4 border-pfa-royal-blue/30 border-t-pfa-royal-blue rounded-full animate-spin mx-auto"></div>
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
                </div>
              </CardContent>
            </Card>
          </div>
        </>
      )}
    </div>
  );
}