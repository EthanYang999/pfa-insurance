import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient();

    // 获取最近的一些聊天记录以检查数据结构
    const { data: recentChats, error } = await supabase
      .from('n8n_chat_histories')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(20);

    if (error) {
      console.error('Error fetching chat records:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    // 统计数据
    const stats = {
      totalRecords: recentChats?.length || 0,
      userRecords: recentChats?.filter(r => r.user_id).length || 0,
      guestRecords: recentChats?.filter(r => r.guest_id).length || 0,
      unknownRecords: recentChats?.filter(r => !r.user_id && !r.guest_id).length || 0
    };

    // 获取用户类型分布
    const userTypes = recentChats?.reduce((acc, record) => {
      if (record.user_id) {
        acc.users.add(record.user_id);
      } else if (record.guest_id) {
        acc.guests.add(record.guest_id);
      }
      return acc;
    }, { users: new Set(), guests: new Set() });

    // 获取会话分布
    const sessions = recentChats?.reduce((acc, record) => {
      if (!acc[record.session_id]) {
        acc[record.session_id] = {
          type: record.session_type,
          user_id: record.user_id,
          guest_id: record.guest_id,
          count: 0
        };
      }
      acc[record.session_id].count++;
      return acc;
    }, {} as any);

    return NextResponse.json({
      success: true,
      stats,
      uniqueUsers: userTypes?.users.size || 0,
      uniqueGuests: userTypes?.guests.size || 0,
      uniqueSessions: Object.keys(sessions || {}).length,
      sessions: Object.entries(sessions || {}).map(([id, data]) => ({
        session_id: id,
        ...data
      })),
      sampleRecords: recentChats?.slice(0, 5).map(record => ({
        id: record.id,
        session_id: record.session_id,
        session_type: record.session_type,
        user_id: record.user_id,
        guest_id: record.guest_id,
        message_type: record.message?.type,
        message_content: record.message?.content ? record.message.content.substring(0, 100) + '...' : null,
        created_at: record.created_at
      })) || []
    });

  } catch (error) {
    console.error('Debug API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}