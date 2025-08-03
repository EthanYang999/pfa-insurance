import { NextRequest, NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/admin-auth';
import { createClient } from '@/lib/supabase/server';

export async function GET(request: NextRequest) {
  try {
    // 验证管理员权限
    const adminCheck = await requireAdmin();
    if (!adminCheck.isAdmin) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');
    const search = searchParams.get('search') || '';

    const supabase = await createClient();

    // 构建查询条件
    let query = supabase
      .from('n8n_chat_histories')
      .select('*', { count: 'exact' });

    // 如果有搜索条件，搜索message内容
    if (search) {
      query = query.or(`message->>content.ilike.%${search}%,session_id.ilike.%${search}%`);
    }

    // 分页
    const offset = (page - 1) * limit;
    query = query
      .order('id', { ascending: false })
      .range(offset, offset + limit - 1);

    const { data: records, error, count } = await query;

    if (error) {
      console.error('Error fetching N8N chat histories:', error);
      return NextResponse.json({ error: 'Failed to fetch data' }, { status: 500 });
    }

    // 按session_id分组统计会话信息
    const sessionStats = new Map();
    
    if (records) {
      for (const record of records) {
        const sessionId = record.session_id;
        if (!sessionStats.has(sessionId)) {
          sessionStats.set(sessionId, {
            session_id: sessionId,
            first_message_id: record.id,
            message_count: 0,
            first_message_time: record.id,
            last_message_time: record.id,
            preview_content: ''
          });
        }
        
        const session = sessionStats.get(sessionId);
        session.message_count++;
        
        // 更新首尾消息时间（基于ID，因为没有时间戳）
        if (record.id > session.last_message_time) {
          session.last_message_time = record.id;
        }
        if (record.id < session.first_message_time) {
          session.first_message_time = record.id;
          // 设置预览内容为最早的用户消息
          if (record.message?.type === 'human') {
            session.preview_content = record.message?.content?.substring(0, 100) || '';
          }
        }
      }
    }

    const sessions = Array.from(sessionStats.values());

    return NextResponse.json({
      success: true,
      sessions,
      total: count || 0,
      page,
      limit
    });

  } catch (error) {
    console.error('N8N sessions API error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}