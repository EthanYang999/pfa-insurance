import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
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
    const role = searchParams.get('role') || '';
    
    // 使用管理员客户端获取真实用户数据
    const adminClient = createAdminClient();
    const { data: authUsers, error: authError } = await adminClient.auth.admin.listUsers({
      page,
      perPage: limit
    });

    if (authError) {
      console.error('获取用户列表失败:', authError);
      return NextResponse.json(
        { error: "获取用户列表失败" },
        { status: 500 }
      );
    }

    let filteredUsers = authUsers.users || [];

    // 应用搜索过滤
    if (search) {
      filteredUsers = filteredUsers.filter(user => 
        user.email?.toLowerCase().includes(search.toLowerCase())
      );
    }

    // 应用状态过滤
    if (status === 'banned') {
      // 检查用户是否被禁用 - 使用 app_metadata 或其他可用字段
      filteredUsers = filteredUsers.filter(user => 
        user.app_metadata?.provider === 'email' && user.last_sign_in_at == null
      );
    } else if (status === 'active') {
      filteredUsers = filteredUsers.filter(user => 
        user.email_confirmed_at != null && user.last_sign_in_at != null
      );
    } else if (status === 'unverified') {
      filteredUsers = filteredUsers.filter(user => user.email_confirmed_at == null);
    }

    // 获取管理员角色信息
    const userIds = filteredUsers.map(u => u.id);
    const { data: adminUsers } = await supabase
      .from('admin_users')
      .select('user_id, role, is_active')
      .in('user_id', userIds);
    
    // 创建管理员角色映射
    const adminRoles = (adminUsers || []).reduce((acc: Record<string, { role: string; is_admin_active: boolean }>, admin) => {
      acc[admin.user_id] = {
        role: admin.role,
        is_admin_active: admin.is_active
      };
      return acc;
    }, {});
    
    // 为每个用户添加角色信息
    const usersWithRoles = filteredUsers.map(user => ({
      ...user,
      admin_role: adminRoles[user.id]?.role || 'user',
      is_admin_active: adminRoles[user.id]?.is_admin_active || false
    }));
    
    // 应用角色过滤
    let finalFilteredUsers = usersWithRoles;
    if (role) {
      finalFilteredUsers = usersWithRoles.filter(user => user.admin_role === role);
    }
    
    // 获取用户统计信息
    const finalUserIds = finalFilteredUsers.map(u => u.id);
    
    const { data: sessionStats } = await supabase
      .from('chat_sessions')
      .select('user_id')
      .in('user_id', finalUserIds);

    const { data: messageStats } = await supabase
      .from('chat_messages')
      .select('user_id') 
      .in('user_id', finalUserIds);

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
    const usersWithStats = finalFilteredUsers.map(user => ({
      id: user.id,
      email: user.email,
      created_at: user.created_at,
      updated_at: user.updated_at,
      last_sign_in_at: user.last_sign_in_at,
      email_confirmed_at: user.email_confirmed_at,
      is_active: user.email_confirmed_at != null,
      admin_role: user.admin_role,
      is_admin_active: user.is_admin_active,
      session_count: sessionCounts[user.id] || 0,
      message_count: messageCounts[user.id] || 0
    }));

    await logAdminAction('view_user_data', 'user_list', undefined, { 
      query: { page, limit, search, status } 
    });

    return NextResponse.json({
      success: true,
      users: usersWithStats,
      total: authUsers.total || filteredUsers.length, // 使用真实的用户总数
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