import { NextResponse } from 'next/server';
import { requireAdmin, logAdminAction } from '@/lib/admin-auth';
import { createClient } from '@/lib/supabase/server';

export async function GET() {
  try {
    // 验证管理员权限
    const adminCheck = await requireAdmin();
    if (!adminCheck.isAdmin) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const supabase = await createClient();

    // 检查数据库健康状态
    const databaseHealth = await checkDatabaseHealth(supabase);
    
    // 检查n8n健康状态
    const n8nHealth = await checkN8nHealth(supabase);
    
    // 检查API健康状态
    const apiHealth = await checkApiHealth();
    
    // 获取系统负载（模拟数据，实际项目中可以集成真实的系统监控）
    const systemLoad = await getSystemLoad();

    // 更新服务健康记录
    await updateServiceHealthRecords(supabase, [databaseHealth, n8nHealth, apiHealth]);

    // 记录管理员操作
    await logAdminAction('view_system_health', 'system', 'health_check');

    const metrics = {
      database: databaseHealth,
      n8n: n8nHealth,
      api: apiHealth,
      system_load: systemLoad
    };

    return NextResponse.json({
      success: true,
      metrics
    });

  } catch (error) {
    console.error('System health check error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

interface SupabaseClient {
  from: (table: string) => any; // eslint-disable-line @typescript-eslint/no-explicit-any
  auth: {
    admin: {
      listUsers: () => any; // eslint-disable-line @typescript-eslint/no-explicit-any
    };
  };
}

interface HealthRecord {
  service_name: string;
  status: 'healthy' | 'warning' | 'error' | 'unknown';
  response_time: number | null;
  error_message: string | null;
  checked_at: string;
  metadata?: Record<string, unknown>;
}

async function checkDatabaseHealth(supabase: SupabaseClient): Promise<HealthRecord> {
  const startTime = Date.now();
  
  try {
    // 测试数据库连接
    const { error } = await supabase
      .from('admin_users')
      .select('count')
      .limit(1);

    const responseTime = Date.now() - startTime;

    if (error) {
      return {
        service_name: 'database',
        status: 'error' as const,
        response_time: responseTime,
        error_message: error.message,
        checked_at: new Date().toISOString()
      };
    }

    return {
      service_name: 'database',
      status: responseTime < 1000 ? 'healthy' as const : 'warning' as const,
      response_time: responseTime,
      error_message: null,
      checked_at: new Date().toISOString()
    };

  } catch (error) {
    const responseTime = Date.now() - startTime;
    return {
      service_name: 'database',
      status: 'error' as const,
      response_time: responseTime,
      error_message: error instanceof Error ? error.message : 'Unknown error',
      checked_at: new Date().toISOString()
    };
  }
}

async function checkN8nHealth(supabase: SupabaseClient): Promise<HealthRecord> {
  const startTime = Date.now();
  
  try {
    // 从系统配置中获取n8n webhook URL
    const { data: config } = await supabase
      .from('system_config')
      .select('value')
      .eq('key', 'n8n_webhook_url')
      .single();

    const webhookUrl = config?.value || process.env.N8N_WEBHOOK_URL;
    
    if (!webhookUrl) {
      return {
        service_name: 'n8n',
        status: 'unknown' as const,
        response_time: null,
        error_message: 'n8n webhook URL not configured',
        checked_at: new Date().toISOString(),
        metadata: {
          uptime: 0,
          memory_usage: 0,
          cpu_usage: 0,
          active_connections: 0
        }
      };
    }

    // 发送健康检查请求到n8n
    const response = await fetch(webhookUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        type: 'health_check',
        timestamp: new Date().toISOString()
      }),
      signal: AbortSignal.timeout(10000) // 10秒超时
    });

    const responseTime = Date.now() - startTime;

    if (!response.ok) {
      return {
        service_name: 'n8n',
        status: 'error' as const,
        response_time: responseTime,
        error_message: `HTTP ${response.status}: ${response.statusText}`,
        checked_at: new Date().toISOString(),
        metadata: {
          uptime: 0,
          memory_usage: 0,
          cpu_usage: 0,
          active_connections: 0
        }
      };
    }

    // 模拟n8n元数据（实际项目中可以从n8n API获取真实数据）
    const metadata = {
      uptime: Math.floor(Math.random() * 86400) + 3600, // 1-24小时
      memory_usage: Math.floor(Math.random() * 512) + 128, // 128-640MB
      cpu_usage: Math.floor(Math.random() * 30) + 5, // 5-35%
      active_connections: Math.floor(Math.random() * 10) + 1 // 1-10个连接
    };

    return {
      service_name: 'n8n',
      status: responseTime < 5000 ? 'healthy' as const : 'warning' as const,
      response_time: responseTime,
      error_message: null,
      checked_at: new Date().toISOString(),
      metadata
    };

  } catch (error) {
    const responseTime = Date.now() - startTime;
    return {
      service_name: 'n8n',
      status: 'error' as const,
      response_time: responseTime,
      error_message: error instanceof Error ? error.message : 'Connection failed',
      checked_at: new Date().toISOString(),
      metadata: {
        uptime: 0,
        memory_usage: 0,
        cpu_usage: 0,
        active_connections: 0
      }
    };
  }
}

async function checkApiHealth(): Promise<HealthRecord> {
  const startTime = Date.now();
  
  try {
    // 检查内部API健康状态
    const response = await fetch(`${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}/api/health`, {
      method: 'GET',
      signal: AbortSignal.timeout(5000) // 5秒超时
    });

    const responseTime = Date.now() - startTime;

    if (!response.ok) {
      return {
        service_name: 'api',
        status: 'error' as const,
        response_time: responseTime,
        error_message: `HTTP ${response.status}: ${response.statusText}`,
        checked_at: new Date().toISOString()
      };
    }

    return {
      service_name: 'api',
      status: responseTime < 1000 ? 'healthy' as const : 'warning' as const,
      response_time: responseTime,
      error_message: null,
      checked_at: new Date().toISOString()
    };

  } catch (error) {
    const responseTime = Date.now() - startTime;
    return {
      service_name: 'api',
      status: 'error' as const,
      response_time: responseTime,
      error_message: error instanceof Error ? error.message : 'Unknown error',
      checked_at: new Date().toISOString()
    };
  }
}

async function getSystemLoad(): Promise<{ cpu: number; memory: number; disk: number; }> {
  // 模拟系统负载数据（实际项目中可以集成真实的系统监控）
  return {
    cpu: Math.floor(Math.random() * 60) + 10, // 10-70%
    memory: Math.floor(Math.random() * 50) + 20, // 20-70%
    disk: Math.floor(Math.random() * 40) + 30 // 30-70%
  };
}

async function updateServiceHealthRecords(supabase: SupabaseClient, healthRecords: HealthRecord[]) {
  try {
    for (const record of healthRecords) {
      await supabase
        .from('service_health')
        .insert({
          service_name: record.service_name,
          status: record.status,
          response_time: record.response_time,
          error_message: record.error_message,
          metadata: record.metadata || {},
          checked_at: record.checked_at
        });
    }
  } catch (error) {
    console.error('Failed to update service health records:', error);
  }
}