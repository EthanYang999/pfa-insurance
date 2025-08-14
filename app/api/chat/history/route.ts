import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

// 获取用户的聊天历史会话列表
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const user_id = searchParams.get('user_id');
    const guest_id = searchParams.get('guest_id');
    const limit = parseInt(searchParams.get('limit') || '20');
    const offset = parseInt(searchParams.get('offset') || '0');

    if (!user_id && !guest_id) {
      return NextResponse.json(
        { error: 'Missing user_id or guest_id parameter' },
        { status: 400 }
      );
    }

    const supabase = await createClient();

    let query = supabase
      .from('n8n_chat_histories')
      .select(`
        session_id,
        created_at,
        message,
        user_id,
        guest_id,
        session_type
      `);

    // 根据用户类型筛选
    if (user_id) {
      query = query.eq('user_id', user_id).eq('session_type', 'user');
    } else if (guest_id) {
      query = query.eq('guest_id', guest_id).eq('session_type', 'guest');
    }

    const { data: chatHistory, error } = await query
      .order('created_at', { ascending: false })
      .limit(limit * 10); // 获取更多数据用于分组

    if (error) {
      console.error('Error fetching chat history:', error);
      return NextResponse.json(
        { error: 'Failed to fetch chat history' },
        { status: 500 }
      );
    }

    // 按会话分组并统计
    const sessionMap = new Map();
    
    chatHistory?.forEach((record) => {
      const sessionId = record.session_id;
      const message = record.message;
      
      if (!sessionMap.has(sessionId)) {
        sessionMap.set(sessionId, {
          id: sessionId,
          conversation_id: sessionId,
          created_at: record.created_at,
          last_message_time: record.created_at,
          last_message: '',
          first_user_message: '', // 用户的第一条消息作为标题
          message_count: 0,
          messages: []
        });
      }
      
      const session = sessionMap.get(sessionId);
      session.message_count++;
      session.messages.push(record);
      
      // 记录用户的第一条消息作为会话标题
      if (record.message?.type === 'human' && !session.first_user_message) {
        session.first_user_message = record.message?.content || '';
      }
      
      // 更新最后一条消息
      if (record.created_at > session.last_message_time) {
        session.last_message_time = record.created_at;
        session.last_message = record.message?.content || '';
      }
    });

    // 转换为数组并排序
    const sessions = Array.from(sessionMap.values())
      .sort((a, b) => new Date(b.last_message_time).getTime() - new Date(a.last_message_time).getTime())
      .slice(offset, offset + limit)
      .map(session => ({
        id: session.id,
        conversation_id: session.conversation_id,
        title: session.first_user_message || '新会话', // 使用用户第一条消息作为标题
        last_message: session.last_message,
        last_message_time: session.last_message_time,
        message_count: session.message_count,
        created_at: session.created_at
      }));

    console.log('聊天历史查询成功:', {
      user_id,
      guest_id,
      totalSessions: sessionMap.size,
      returnedSessions: sessions.length
    });

    return NextResponse.json({
      success: true,
      sessions,
      total: sessionMap.size,
      limit,
      offset
    });

  } catch (error) {
    console.error('Chat history API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// 获取特定会话的详细消息
export async function POST(request: NextRequest) {
  try {
    const { session_id, user_id, guest_id } = await request.json();

    if (!session_id || (!user_id && !guest_id)) {
      return NextResponse.json(
        { error: 'Missing required fields: session_id and (user_id or guest_id)' },
        { status: 400 }
      );
    }

    const supabase = await createClient();

    let query = supabase
      .from('n8n_chat_histories')
      .select('*')
      .eq('session_id', session_id);

    // 验证会话所有权
    if (user_id) {
      query = query.eq('user_id', user_id).eq('session_type', 'user');
    } else if (guest_id) {
      query = query.eq('guest_id', guest_id).eq('session_type', 'guest');
    }

    const { data: messages, error } = await query
      .order('created_at', { ascending: true });

    if (error) {
      console.error('Error fetching session messages:', error);
      return NextResponse.json(
        { error: 'Failed to fetch session messages' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      session_id,
      messages: messages || []
    });

  } catch (error) {
    console.error('Session detail API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}