import { NextRequest, NextResponse } from 'next/server';
import { requireAdmin, logAdminAction } from '@/lib/admin-auth';
import { createClient } from '@/lib/supabase/server';

export async function POST(
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
    const { archived } = await request.json();

    const supabase = await createClient();

    // 更新会话归档状态
    const { error } = await supabase
      .from('chat_sessions')
      .update({ is_archived: archived })
      .eq('id', sessionId);

    if (error) {
      console.error('Database error:', error);
      return NextResponse.json({ error: 'Failed to update session' }, { status: 500 });
    }

    // 记录管理员操作
    await logAdminAction(
      archived ? 'archive_session' : 'unarchive_session',
      'session',
      sessionId,
      { archived }
    );

    return NextResponse.json({ 
      success: true, 
      message: `Session ${archived ? 'archived' : 'unarchived'} successfully` 
    });

  } catch (error) {
    console.error('API error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}