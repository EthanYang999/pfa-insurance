import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function POST(request: NextRequest) {
  try {
    const { session_id, message } = await request.json();

    if (!session_id || !message) {
      return NextResponse.json(
        { error: 'Missing required fields: session_id, message' },
        { status: 400 }
      );
    }

    const supabase = await createClient();

    // 构建插入数据，支持用户ID和访客ID
    const insertData: any = {
      session_id,
      message: {
        ...message,
        // 确保message对象包含所有必要字段
        type: message.type,
        content: message.content,
        additional_kwargs: message.additional_kwargs || {},
        response_metadata: message.response_metadata || {}
      }
    };

    // 添加用户标识信息（支持用户ID或访客ID）
    if (message.user_id) {
      insertData.user_id = message.user_id;
      insertData.session_type = 'user';
      console.log('保存用户聊天记录:', { session_id, user_id: message.user_id });
    } else if (message.guest_id) {
      insertData.guest_id = message.guest_id;
      insertData.session_type = 'guest';
      console.log('保存访客聊天记录:', { session_id, guest_id: message.guest_id });
    } else {
      // 兜底处理：如果都没有，记录为未知类型
      insertData.session_type = 'unknown';
      console.warn('聊天记录缺少用户/访客标识:', { session_id });
    }

    // 保存聊天记录到n8n_chat_histories表（统一存储）
    const { data, error } = await supabase
      .from('n8n_chat_histories')
      .insert(insertData)
      .select()
      .single();

    if (error) {
      console.error('Error saving chat history to n8n_chat_histories:', error);
      return NextResponse.json(
        { error: 'Failed to save chat history' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      data
    });

  } catch (error) {
    console.error('N8N chat history API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const session_id = searchParams.get('session_id');

    if (!session_id) {
      return NextResponse.json(
        { error: 'Missing session_id parameter' },
        { status: 400 }
      );
    }

    const supabase = await createClient();

    // 获取指定会话的聊天记录
    const { data, error } = await supabase
      .from('n8n_chat_histories')
      .select('*')
      .eq('session_id', session_id)
      .order('id', { ascending: true });

    if (error) {
      console.error('Error fetching chat history from n8n_chat_histories:', error);
      return NextResponse.json(
        { error: 'Failed to fetch chat history' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      data: data || []
    });

  } catch (error) {
    console.error('N8N chat history fetch API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}