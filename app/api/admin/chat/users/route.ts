import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { isAdmin } from '@/lib/admin-auth';

export async function GET(request: NextRequest) {
  try {
    // 验证管理员权限
    const adminCheck = await isAdmin();
    if (!adminCheck) {
      return NextResponse.json(
        { error: 'Unauthorized - Admin access required' },
        { status: 403 }
      );
    }

    const { searchParams } = new URL(request.url);
    const search = searchParams.get('search') || '';

    const supabase = await createClient();

    // 获取所有有聊天记录的用户统计
    const { data: chatData, error } = await supabase
      .from('n8n_chat_histories')
      .select('user_id, session_id, created_at')
      .eq('session_type', 'user')
      .not('user_id', 'is', null)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching chat data:', error);
      return NextResponse.json(
        { error: 'Failed to fetch chat data' },
        { status: 500 }
      );
    }

    // 统计每个用户的数据
    const userStatsMap = new Map();
    
    chatData?.forEach((record) => {
      const userId = record.user_id;
      if (!userStatsMap.has(userId)) {
        userStatsMap.set(userId, {
          user_id: userId,
          sessions: new Set(),
          message_count: 0,
          first_activity: record.created_at,
          last_activity: record.created_at
        });
      }
      
      const stats = userStatsMap.get(userId);
      stats.sessions.add(record.session_id);
      stats.message_count++;
      
      // 更新活动时间
      if (record.created_at > stats.last_activity) {
        stats.last_activity = record.created_at;
      }
      if (record.created_at < stats.first_activity) {
        stats.first_activity = record.created_at;
      }
    });

    // 获取用户邮箱信息
    const userIds = Array.from(userStatsMap.keys());
    if (userIds.length === 0) {
      return NextResponse.json({
        success: true,
        users: []
      });
    }

    // 从认证系统获取用户信息
    const { createAdminClient } = await import('@/lib/supabase/admin');
    const adminClient = createAdminClient();
    
    const { data: authUsers, error: authError } = await adminClient.auth.admin.listUsers();
    
    if (authError) {
      console.error('Error fetching auth users:', authError);
      return NextResponse.json(
        { error: 'Failed to fetch user information' },
        { status: 500 }
      );
    }

    // 合并用户信息和统计数据
    const userSummaries = authUsers.users
      .filter(user => userStatsMap.has(user.id))
      .map(user => {
        const stats = userStatsMap.get(user.id);
        return {
          user_id: user.id,
          user_email: user.email || 'Unknown',
          session_count: stats.sessions.size,
          message_count: stats.message_count,
          first_activity: stats.first_activity,
          last_activity: stats.last_activity
        };
      })
      .filter(user => {
        // 应用搜索过滤
        if (search) {
          return user.user_email.toLowerCase().includes(search.toLowerCase());
        }
        return true;
      })
      .sort((a, b) => new Date(b.last_activity).getTime() - new Date(a.last_activity).getTime());

    console.log('用户聊天统计查询成功:', {
      totalUsers: userSummaries.length,
      search
    });

    return NextResponse.json({
      success: true,
      users: userSummaries
    });

  } catch (error) {
    console.error('User chat summary API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}