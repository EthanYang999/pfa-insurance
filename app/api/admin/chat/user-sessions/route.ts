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
    const userId = searchParams.get('user_id');

    if (!userId) {
      return NextResponse.json(
        { error: 'user_id parameter is required' },
        { status: 400 }
      );
    }

    const supabase = await createClient();

    // 获取指定用户的所有会话
    const { data: chatData, error } = await supabase
      .from('n8n_chat_histories')
      .select('session_id, message, created_at')
      .eq('session_type', 'user')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching user chat sessions:', error);
      return NextResponse.json(
        { error: 'Failed to fetch user chat sessions' },
        { status: 500 }
      );
    }

    // 按会话分组并统计
    const sessionMap = new Map();
    
    chatData?.forEach((record) => {
      const sessionId = record.session_id;
      if (!sessionMap.has(sessionId)) {
        sessionMap.set(sessionId, {
          session_id: sessionId,
          title: '',
          message_count: 0,
          created_at: record.created_at,
          last_message_time: record.created_at,
          last_message: '',
          first_user_message: ''
        });
      }
      
      const session = sessionMap.get(sessionId);
      session.message_count++;
      
      // 更新最新消息时间和内容
      if (record.created_at > session.last_message_time) {
        session.last_message_time = record.created_at;
        session.last_message = record.message?.content || '';
      }
      
      // 更新最早时间
      if (record.created_at < session.created_at) {
        session.created_at = record.created_at;
      }
      
      // 记录用户的第一条消息作为会话标题
      if (record.message?.type === 'human' && !session.first_user_message) {
        session.first_user_message = record.message?.content || '';
      }
    });

    // 转换为数组并设置标题
    const sessions = Array.from(sessionMap.values()).map(session => ({
      ...session,
      title: session.first_user_message || `会话 ${session.session_id.substring(0, 8)}...`
    }));

    // 按最后消息时间排序
    sessions.sort((a, b) => new Date(b.last_message_time).getTime() - new Date(a.last_message_time).getTime());

    console.log('用户会话查询成功:', {
      userId,
      totalSessions: sessions.length
    });

    return NextResponse.json({
      success: true,
      sessions
    });

  } catch (error) {
    console.error('User sessions API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}