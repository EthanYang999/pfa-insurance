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

    // 1. 获取今日访客数据
    const today = new Date();
    const todayStart = new Date(today.getFullYear(), today.getMonth(), today.getDate());
    const todayEnd = new Date(todayStart.getTime() + 24 * 60 * 60 * 1000);

    // 2. 获取今日独立访客数
    const { data: todayGuestsData, error: todayGuestsError } = await supabase
      .from('n8n_chat_histories')
      .select('guest_id')
      .eq('session_type', 'guest')
      .gte('created_at', todayStart.toISOString())
      .lt('created_at', todayEnd.toISOString())
      .not('guest_id', 'is', null);

    const todayGuests = todayGuestsData ? new Set(todayGuestsData.map(g => g.guest_id)).size : 0;

    // 3. 获取今日访客会话数
    const { data: todaySessionsData, error: todaySessionsError } = await supabase
      .from('n8n_chat_histories')
      .select('session_id')
      .eq('session_type', 'guest')
      .gte('created_at', todayStart.toISOString())
      .lt('created_at', todayEnd.toISOString());

    const guestSessions = todaySessionsData ? new Set(todaySessionsData.map(s => s.session_id)).size : 0;

    // 4. 获取最近活跃的访客（最近1小时内有活动）
    const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);
    const { data: recentGuestsData, error: recentGuestsError } = await supabase
      .from('n8n_chat_histories')
      .select('guest_id, session_id, created_at')
      .eq('session_type', 'guest')
      .gte('created_at', oneHourAgo.toISOString())
      .not('guest_id', 'is', null)
      .order('created_at', { ascending: false });

    // 统计每个访客的活动
    const guestActivity = new Map();
    if (recentGuestsData) {
      recentGuestsData.forEach(record => {
        const guestId = record.guest_id;
        if (!guestActivity.has(guestId)) {
          guestActivity.set(guestId, {
            guest_id: guestId,
            sessions: new Set(),
            messages: 0,
            lastActivity: record.created_at
          });
        }
        const activity = guestActivity.get(guestId);
        activity.sessions.add(record.session_id);
        activity.messages++;
        if (record.created_at > activity.lastActivity) {
          activity.lastActivity = record.created_at;
        }
      });
    }

    const recentGuestActivity = Array.from(guestActivity.values())
      .map(activity => ({
        ...activity,
        sessions: activity.sessions.size
      }))
      .slice(0, 10); // 最多显示10个

    const realTimeGuests = guestActivity.size;

    // 5. 计算平均会话时长（简化计算，使用今日数据）
    let averageSessionDuration = 0;
    if (todaySessionsData && todaySessionsData.length > 0) {
      // 简化计算：假设平均会话时长为15分钟
      averageSessionDuration = 15 * 60; // 15分钟转换为秒
    }

    // 6. 获取今日各小时访客分布
    const peakHours = [];
    for (let hour = 0; hour < 24; hour++) {
      const hourStart = new Date(todayStart.getTime() + hour * 60 * 60 * 1000);
      const hourEnd = new Date(hourStart.getTime() + 60 * 60 * 1000);

      const { data: hourData, error: hourError } = await supabase
        .from('n8n_chat_histories')
        .select('guest_id')
        .eq('session_type', 'guest')
        .gte('created_at', hourStart.toISOString())
        .lt('created_at', hourEnd.toISOString())
        .not('guest_id', 'is', null);

      const hourGuests = hourData ? new Set(hourData.map(g => g.guest_id)).size : 0;
      
      peakHours.push({
        hour,
        guestCount: hourGuests
      });
    }

    const monitorData = {
      realTimeGuests,
      todayGuests,
      guestSessions,
      averageSessionDuration,
      recentGuestActivity,
      peakHours: peakHours.filter(h => h.guestCount > 0), // 只返回有活动的小时
      lastUpdated: new Date().toISOString()
    };

    console.log('访客监控数据查询成功:', {
      realTimeGuests,
      todayGuests,
      guestSessions
    });

    return NextResponse.json({
      success: true,
      monitorData
    });

  } catch (error) {
    console.error('Guest monitor API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}