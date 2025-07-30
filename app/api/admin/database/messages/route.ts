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
    const limit = parseInt(searchParams.get('limit') || '20');
    const search = searchParams.get('search') || '';

    const offset = (page - 1) * limit;

    const supabase = await createClient();

    // 构建查询
    let query = supabase
      .from('chat_messages')
      .select('*', { count: 'exact' });

    // 搜索条件
    if (search) {
      query = query.ilike('content', `%${search}%`);
    }

    // 分页
    query = query
      .range(offset, offset + limit - 1)
      .order('created_at', { ascending: false });

    const { data: messages, error, count } = await query;

    if (error) {
      console.error('Database error:', error);
      return NextResponse.json({ error: 'Failed to fetch messages' }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      messages: messages || [],
      total: count || 0,
      page,
      limit
    });

  } catch (error) {
    console.error('API error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}