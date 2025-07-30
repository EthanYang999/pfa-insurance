import { createClient } from "@/lib/supabase/server";
import { NextRequest, NextResponse } from "next/server";
import { requirePermission, logAdminAction } from "@/lib/admin-auth";

export async function GET(request: NextRequest) {
  try {
    await requirePermission('view_user_data');
    
    const supabase = await createClient();
    const { searchParams } = new URL(request.url);
    
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');
    const search = searchParams.get('search') || '';
    const status = searchParams.get('status') || '';
    const sortBy = searchParams.get('sortBy') || 'created_at';
    const sortOrder = searchParams.get('sortOrder') || 'desc';
    
    const offset = (page - 1) * limit;

    // 构建查询
    let query = supabase
      .from('auth.users')
      .select(`
        id,
        email,
        created_at,
        updated_at,
        last_sign_in_at,
        email_confirmed_at,
        banned_until
      `, { count: 'exact' });

    // 添加搜索条件
    if (search) {
      query = query.ilike('email', `%${search}%`);
    }

    // 添加状态筛选
    if (status === 'banned') {
      query = query.not('banned_until', 'is', null);
    } else if (status === 'active') {
      query = query.is('banned_until', null).not('email_confirmed_at', 'is', null);
    } else if (status === 'unverified') {
      query = query.is('email_confirmed_at', null);
    }

    // 排序和分页
    const { data: users, error, count } = await query
      .order(sortBy, { ascending: sortOrder === 'asc' })
      .range(offset, offset + limit - 1);

    if (error) {
      console.error('获取用户列表失败:', error);
      return NextResponse.json(
        { error: "获取用户列表失败" },
        { status: 500 }
      );
    }

    // 获取用户统计信息
    const userIds = users?.map(u => u.id) || [];
    
    const { data: userStats } = await supabase
      .from('chat_sessions')
      .select('user_id')
      .in('user_id', userIds);

    const { data: messageStats } = await supabase
      .from('chat_messages')
      .select('user_id')
      .in('user_id', userIds);

    // 合并统计数据
    const usersWithStats = users?.map(user => {
      const sessionCount = userStats?.filter(s => s.user_id === user.id).length || 0;
      const messageCount = messageStats?.filter(m => m.user_id === user.id).length || 0;
      
      return {
        ...user,
        session_count: sessionCount,
        message_count: messageCount
      };
    }) || [];

    await logAdminAction('view_user_data', 'user_list', undefined, { 
      query: { page, limit, search, status } 
    });

    return NextResponse.json({
      success: true,
      users: usersWithStats,
      total: count || 0,
      page,
      limit
    });

  } catch (error) {
    console.error('获取用户列表API失败:', error);
    return NextResponse.json(
      { 
        error: error instanceof Error ? error.message : "获取用户列表失败" 
      },
      { status: error instanceof Error && error.message.includes('权限') ? 403 : 500 }
    );
  }
}