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

    const supabase = await createClient();

    // 1. 获取基础统计数据
    const { data: totalMessages, error: messagesError } = await supabase
      .from('n8n_chat_histories')
      .select('id', { count: 'exact', head: true });

    if (messagesError) {
      console.error('Error fetching total messages:', messagesError);
    }

    // 2. 获取用户数统计
    const { data: userStats, error: userStatsError } = await supabase
      .from('n8n_chat_histories')
      .select('user_id')
      .eq('session_type', 'user')
      .not('user_id', 'is', null);

    const uniqueUsers = userStats ? new Set(userStats.map(u => u.user_id)).size : 0;

    // 3. 获取访客数统计
    const { data: guestStats, error: guestStatsError } = await supabase
      .from('n8n_chat_histories')
      .select('guest_id')
      .eq('session_type', 'guest')
      .not('guest_id', 'is', null);

    const uniqueGuests = guestStats ? new Set(guestStats.map(g => g.guest_id)).size : 0;

    // 4. 获取会话数统计
    const { data: sessionStats, error: sessionStatsError } = await supabase
      .from('n8n_chat_histories')
      .select('session_id, session_type');

    const allSessions = sessionStats ? new Set(sessionStats.map(s => s.session_id)).size : 0;
    const userSessions = sessionStats ? 
      new Set(sessionStats.filter(s => s.session_type === 'user').map(s => s.session_id)).size : 0;
    const guestSessions = sessionStats ? 
      new Set(sessionStats.filter(s => s.session_type === 'guest').map(s => s.session_id)).size : 0;

    // 5. 获取今日统计
    const today = new Date().toISOString().split('T')[0];
    const { data: todayStats, error: todayError } = await supabase
      .from('n8n_chat_histories')
      .select('session_type, session_id, user_id, guest_id')
      .gte('created_at', `${today}T00:00:00.000Z`)
      .lt('created_at', `${today}T23:59:59.999Z`);

    const todayMessages = todayStats?.length || 0;
    const todayUsers = todayStats ? 
      new Set(todayStats.filter(s => s.session_type === 'user' && s.user_id).map(s => s.user_id)).size : 0;
    const todayGuests = todayStats ? 
      new Set(todayStats.filter(s => s.session_type === 'guest' && s.guest_id).map(s => s.guest_id)).size : 0;
    const todaySessions = todayStats ? 
      new Set(todayStats.map(s => s.session_id)).size : 0;

    // 6. 获取系统设置
    const { data: settings, error: settingsError } = await supabase
      .from('system_settings')
      .select('*');

    const systemSettings = settings?.reduce((acc: any, setting: any) => {
      acc[setting.key] = setting.value;
      return acc;
    }, {}) || {};

    // 7. 获取最近7天的趋势数据
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    
    const { data: weeklyTrend, error: weeklyError } = await supabase
      .from('n8n_chat_histories')
      .select('created_at, session_type')
      .gte('created_at', sevenDaysAgo.toISOString());

    // 按日期分组统计
    const dailyStats: { [key: string]: { user: number, guest: number, total: number } } = {};
    
    if (weeklyTrend) {
      weeklyTrend.forEach(record => {
        const date = record.created_at.split('T')[0];
        if (!dailyStats[date]) {
          dailyStats[date] = { user: 0, guest: 0, total: 0 };
        }
        dailyStats[date].total++;
        if (record.session_type === 'user') {
          dailyStats[date].user++;
        } else if (record.session_type === 'guest') {
          dailyStats[date].guest++;
        }
      });
    }

    const stats = {
      overview: {
        totalMessages: totalMessages?.length || 0,
        totalUsers: uniqueUsers,
        totalGuests: uniqueGuests,
        totalSessions: allSessions,
        userSessions,
        guestSessions
      },
      today: {
        messages: todayMessages,
        users: todayUsers,
        guests: todayGuests,
        sessions: todaySessions
      },
      weeklyTrend: dailyStats,
      systemSettings,
      lastUpdated: new Date().toISOString()
    };

    console.log('管理员统计数据查询成功:', {
      totalMessages: stats.overview.totalMessages,
      totalUsers: stats.overview.totalUsers,
      totalGuests: stats.overview.totalGuests,
      todayActivity: stats.today
    });

    return NextResponse.json({
      success: true,
      stats
    });

  } catch (error) {
    console.error('Admin stats API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}