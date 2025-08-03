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

    // 保存聊天记录到dify_chat_histories表
    const { data, error } = await supabase
      .from('dify_chat_histories')
      .insert({
        session_id,
        message
      })
      .select()
      .single();

    if (error) {
      console.error('Error saving Dify chat history:', error);
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
    console.error('Dify chat history API error:', error);
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
      .from('dify_chat_histories')
      .select('*')
      .eq('session_id', session_id)
      .order('id', { ascending: true });

    if (error) {
      console.error('Error fetching Dify chat history:', error);
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
    console.error('Dify chat history fetch API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}