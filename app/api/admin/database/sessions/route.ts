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

    const supabase = await createClient();
    
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');
    const search = searchParams.get('search') || '';
    const status = searchParams.get('status') || 'all';

    const offset = (page - 1) * limit;

    // 构建查询
    let query = supabase
      .from('chat_sessions')
      .select(`
        id,
        user_id,
        title,
        created_at,
        updated_at,
        is_archived,
        chat_messages(count)
      `, { count: 'exact' });

    // 搜索条件
    if (search) {
      query = query.ilike('title', `%${search}%`);
    }

    // 状态筛选
    if (status === 'active') {
      query = query.eq('is_archived', false);
    } else if (status === 'archived') {
      query = query.eq('is_archived', true);
    }

    // 分页
    query = query
      .range(offset, offset + limit - 1)
      .order('created_at', { ascending: false });

    const { data: sessions, error, count } = await query;

    if (error) {
      console.error('Database error:', error);
      return NextResponse.json({ error: 'Failed to fetch sessions' }, { status: 500 });
    }

    // 获取用户邮箱信息
    const { data: users } = await supabase.auth.admin.listUsers();
    
    const userMap = new Map();
    users.users?.forEach(user => {
      userMap.set(user.id, user.email);
    });

    // 处理数据
    const processedSessions = sessions?.map(session => ({
      ...session,
      message_count: session.chat_messages?.[0]?.count || 0,
      user_email: userMap.get(session.user_id)
    })) || [];

    return NextResponse.json({
      success: true,
      sessions: processedSessions,
      total: count || 0,
      page,
      limit
    });

  } catch (error) {
    console.error('API error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}