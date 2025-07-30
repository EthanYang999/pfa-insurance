import { NextRequest, NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/admin-auth';
import { createClient } from '@/lib/supabase/server';

export async function GET(request: NextRequest) {
  try {
    // 验证管理员权限
    const adminCheck = await requireAdmin();
    if (!adminCheck.isAdmin) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '50');
    const search = searchParams.get('search') || '';
    const action = searchParams.get('action') || 'all';
    const targetType = searchParams.get('target_type') || 'all';

    const offset = (page - 1) * limit;

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
      `, { count: 'exact' });

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

    // 分页和排序
    query = query
      .range(offset, offset + limit - 1)
      .order('created_at', { ascending: false });

    const { data: logs, error, count } = await query;

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

    // 处理数据
    const processedLogs = logs?.map(log => ({
      ...log,
      admin_email: userMap.get(log.admin_users.user_id)
    })) || [];

    return NextResponse.json({
      success: true,
      logs: processedLogs,
      total: count || 0,
      page,
      limit
    });

  } catch (error) {
    console.error('API error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}