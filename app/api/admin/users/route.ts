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
    
    const offset = (page - 1) * limit;

    // 由于服务角色密钥问题，我们暂时从chat_sessions表中获取用户信息
    // 这是一个临时解决方案，实际生产环境中应该配置正确的服务角色密钥
    const query = supabase
      .from('chat_sessions')
      .select('user_id')
      .order('created_at', { ascending: false });

    const { data: sessionData, error: sessionError } = await query;

    if (sessionError) {
      console.error('获取会话数据失败:', sessionError);
      return NextResponse.json(
        { error: "获取用户数据失败" },
        { status: 500 }
      );
    }

    // 获取唯一的用户ID
    const uniqueUserIds = [...new Set((sessionData || []).map(s => s.user_id))];
    
    // 为了演示，我们创建模拟用户数据
    // 实际环境中应该使用正确的Auth Admin API
    const mockUsers = uniqueUserIds.slice(offset, offset + limit).map(userId => ({
      id: userId,
      email: `user-${userId.slice(0, 8)}@example.com`, // 模拟邮箱
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      last_sign_in_at: new Date().toISOString(),
      email_confirmed_at: new Date().toISOString(),
      banned_until: null
    }));

    // 应用搜索过滤
    let filteredUsers = mockUsers;
    if (search) {
      filteredUsers = mockUsers.filter(user => 
        user.email.toLowerCase().includes(search.toLowerCase())
      );
    }

    // 获取用户统计信息
    const userIds = filteredUsers.map(u => u.id);
    
    const { data: sessionStats } = await supabase
      .from('chat_sessions')
      .select('user_id')
      .in('user_id', userIds);

    const { data: messageStats } = await supabase
      .from('chat_messages')
      .select('user_id') 
      .in('user_id', userIds);

    // 统计每个用户的会话和消息数量
    const sessionCounts = (sessionStats || []).reduce((acc: Record<string, number>, stat) => {
      acc[stat.user_id] = (acc[stat.user_id] || 0) + 1;
      return acc;
    }, {});

    const messageCounts = (messageStats || []).reduce((acc: Record<string, number>, stat) => {
      acc[stat.user_id] = (acc[stat.user_id] || 0) + 1;
      return acc;
    }, {});

    // 合并统计数据
    const usersWithStats = filteredUsers.map(user => ({
      id: user.id,
      email: user.email,
      created_at: user.created_at,
      updated_at: user.updated_at,
      last_sign_in_at: user.last_sign_in_at,
      email_confirmed_at: user.email_confirmed_at,
      banned_until: user.banned_until,
      session_count: sessionCounts[user.id] || 0,
      message_count: messageCounts[user.id] || 0
    }));

    await logAdminAction('view_user_data', 'user_list', undefined, { 
      query: { page, limit, search, status } 
    });

    return NextResponse.json({
      success: true,
      users: usersWithStats,
      total: uniqueUserIds.length, // 使用总的唯一用户数
      page,
      limit
    });

  } catch (error) {
    console.error('获取用户列表API失败:', error);
    return NextResponse.json(
      { 
        error: error instanceof Error ? error.message : "Failed to get user list" 
      },
      { status: error instanceof Error && error.message.includes('permission') ? 403 : 500 }
    );
  }
}