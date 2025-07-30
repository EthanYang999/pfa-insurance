import { NextRequest, NextResponse } from 'next/server';
import { requireAdmin, logAdminAction } from '@/lib/admin-auth';
import { createClient } from '@/lib/supabase/server';

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

    // 删除会话（会级联删除相关消息）
    const { error } = await supabase
      .from('chat_sessions')
      .delete()
      .eq('id', sessionId);

    if (error) {
      console.error('Database error:', error);
      return NextResponse.json({ error: 'Failed to delete session' }, { status: 500 });
    }

    // 记录管理员操作
    await logAdminAction('delete_session', 'session', sessionId);

    return NextResponse.json({ 
      success: true, 
      message: 'Session deleted successfully' 
    });

  } catch (error) {
    console.error('API error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}