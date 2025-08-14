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
    const includeGuests = searchParams.get('include_guests') === 'true';

    const supabase = await createClient();

    // 获取注册用户的聊天记录
    const { data: userChatData, error: userError } = await supabase
      .from('n8n_chat_histories')
      .select('user_id, session_id, created_at')
      .eq('session_type', 'user')
      .not('user_id', 'is', null)
      .order('created_at', { ascending: false });

    if (userError) {
      console.error('Error fetching user chat data:', userError);
      return NextResponse.json(
        { error: 'Failed to fetch user chat data' },
        { status: 500 }
      );
    }

    // 获取访客的聊天记录（如果需要）
    let guestChatData: any[] = [];
    if (includeGuests) {
      const { data: guestData, error: guestError } = await supabase
        .from('n8n_chat_histories')
        .select('guest_id, session_id, created_at')
        .eq('session_type', 'guest')
        .not('guest_id', 'is', null)
        .order('created_at', { ascending: false });

      if (guestError) {
        console.error('Error fetching guest chat data:', guestError);
      } else {
        guestChatData = guestData || [];
      }
    }

    // 合并数据
    const chatData = [...(userChatData || []), ...guestChatData];

    // 统计每个用户/访客的数据
    const userStatsMap = new Map();
    
    chatData?.forEach((record) => {
      // 使用user_id或guest_id作为标识符
      const identifier = record.user_id || record.guest_id;
      const isGuest = !!record.guest_id;
      
      if (!identifier) return;
      
      if (!userStatsMap.has(identifier)) {
        userStatsMap.set(identifier, {
          user_id: identifier,
          is_guest: isGuest,
          sessions: new Set(),
          message_count: 0,
          first_activity: record.created_at,
          last_activity: record.created_at
        });
      }
      
      const stats = userStatsMap.get(identifier);
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

    // 获取所有标识符
    const allIds = Array.from(userStatsMap.keys());
    if (allIds.length === 0) {
      return NextResponse.json({
        success: true,
        users: []
      });
    }

    // 获取注册用户的邮箱信息
    const registeredUserIds = allIds.filter(id => !userStatsMap.get(id).is_guest);
    let userEmailMap = new Map();

    if (registeredUserIds.length > 0) {
      try {
        const { createAdminClient } = await import('@/lib/supabase/admin');
        const adminClient = createAdminClient();
        
        const { data: authUsers, error: authError } = await adminClient.auth.admin.listUsers();
        
        if (authError) {
          console.error('Error fetching auth users:', authError);
        } else {
          authUsers?.users.forEach(user => {
            userEmailMap.set(user.id, user.email || 'Unknown');
          });
        }
      } catch (error) {
        console.error('Failed to fetch user emails:', error);
      }
    }

    // 合并用户信息和统计数据
    const userSummaries = allIds
      .map(id => {
        const stats = userStatsMap.get(id);
        const isGuest = stats.is_guest;
        
        return {
          user_id: id,
          user_email: isGuest ? `访客_${id.substring(0, 8)}` : (userEmailMap.get(id) || 'Unknown'),
          is_guest: isGuest,
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
      registeredUsers: userSummaries.filter(u => !u.is_guest).length,
      guests: userSummaries.filter(u => u.is_guest).length,
      includeGuests,
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