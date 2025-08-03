import { NextRequest, NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/admin-auth';
import { createClient } from '@/lib/supabase/server';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ sessionId: string }> }
) {
  try {
    // 验证管理员权限
    const adminCheck = await requireAdmin();
    if (!adminCheck.isAdmin) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { sessionId } = await params;
    const supabase = await createClient();

    // 获取指定会话的所有消息
    const { data: messages, error } = await supabase
      .from('n8n_chat_histories')
      .select('*')
      .eq('session_id', sessionId)
      .order('id', { ascending: true });

    if (error) {
      console.error('Error fetching session messages:', error);
      return NextResponse.json({ error: 'Failed to fetch messages' }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      messages: messages || []
    });

  } catch (error) {
    console.error('Session messages API error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ sessionId: string }> }
) {
  try {
    // 验证管理员权限
    const adminCheck = await requireAdmin();
    if (!adminCheck.isAdmin) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { sessionId } = await params;
    const supabase = await createClient();

    // 删除指定会话的所有消息
    const { error } = await supabase
      .from('n8n_chat_histories')
      .delete()
      .eq('session_id', sessionId);

    if (error) {
      console.error('Error deleting session:', error);
      return NextResponse.json({ error: 'Failed to delete session' }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      message: 'Session deleted successfully'
    });

  } catch (error) {
    console.error('Delete session API error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}