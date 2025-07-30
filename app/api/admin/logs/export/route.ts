import { NextRequest, NextResponse } from 'next/server';
import { requireAdmin, logAdminAction } from '@/lib/admin-auth';
import { createClient } from '@/lib/supabase/server';

export async function GET(request: NextRequest) {
  try {
    // 验证管理员权限
    const adminCheck = await requireAdmin();
    if (!adminCheck.isAdmin) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const search = searchParams.get('search') || '';
    const action = searchParams.get('action') || 'all';
    const targetType = searchParams.get('target_type') || 'all';
    const format = searchParams.get('format') || 'csv';

    const supabase = await createClient();

    // 构建查询
    let query = supabase
      .from('system_logs')
      .select(`
        *,
        admin_users!inner(
          user_id,
          role
        )
      `);

    // 搜索条件
    if (search) {
      query = query.or(`action.ilike.%${search}%,target_id.ilike.%${search}%`);
    }

    // 操作类型筛选
    if (action !== 'all') {
      query = query.eq('action', action);
    }

    // 目标类型筛选
    if (targetType !== 'all') {
      query = query.eq('target_type', targetType);
    }

    // 排序，限制导出数量
    query = query
      .order('created_at', { ascending: false })
      .limit(10000); // 最多导出10000条记录

    const { data: logs, error } = await query;

    if (error) {
      console.error('Database error:', error);
      return NextResponse.json({ error: 'Failed to fetch logs' }, { status: 500 });
    }

    // 获取管理员邮箱信息
    const { data: users } = await supabase.auth.admin.listUsers();
    
    const userMap = new Map();
    users.users?.forEach(user => {
      userMap.set(user.id, user.email);
    });

    if (format === 'csv') {
      // 生成CSV内容
      const csvHeader = '时间,操作员,操作,目标类型,目标ID,详情,IP地址\n';
      const csvContent = logs?.map(log => {
        const adminEmail = userMap.get(log.admin_users.user_id) || log.admin_id;
        const details = JSON.stringify(log.details).replace(/"/g, '""'); // 转义CSV中的引号
        
        return [
          log.created_at,
          adminEmail,
          log.action,
          log.target_type || '',
          log.target_id || '',
          `"${details}"`,
          log.ip_address || ''
        ].join(',');
      }).join('\n') || '';

      const csv = csvHeader + csvContent;

      // 记录管理员操作
      await logAdminAction('export_data', 'logs', 'csv_export', {
        format,
        record_count: logs?.length || 0,
        filters: { search, action, targetType }
      });

      return new NextResponse(csv, {
        headers: {
          'Content-Type': 'text/csv; charset=utf-8',
          'Content-Disposition': `attachment; filename="system-logs-${new Date().toISOString().split('T')[0]}.csv"`
        }
      });
    }

    // JSON格式导出
    const processedLogs = logs?.map(log => ({
      ...log,
      admin_email: userMap.get(log.admin_users.user_id)
    })) || [];

    // 记录管理员操作
    await logAdminAction('export_data', 'logs', 'json_export', {
      format,
      record_count: logs?.length || 0,
      filters: { search, action, targetType }
    });

    return NextResponse.json({
      success: true,
      logs: processedLogs,
      exported_at: new Date().toISOString(),
      total_records: logs?.length || 0
    }, {
      headers: {
        'Content-Disposition': `attachment; filename="system-logs-${new Date().toISOString().split('T')[0]}.json"`
      }
    });

  } catch (error) {
    console.error('Export API error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}