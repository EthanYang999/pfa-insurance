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
    const sessionId = searchParams.get('session_id');
    const format = searchParams.get('format') || 'csv';

    const supabase = await createClient();

    // 构建查询
    let query = supabase
      .from('dify_chat_histories')
      .select('*')
      .order('id', { ascending: true });

    // 如果指定了会话ID，只导出该会话
    if (sessionId) {
      query = query.eq('session_id', sessionId);
    }

    const { data: records, error } = await query;

    if (error) {
      console.error('Error fetching chat histories for export:', error);
      return NextResponse.json({ error: 'Failed to fetch data' }, { status: 500 });
    }

    if (format === 'csv') {
      // 生成CSV格式
      const csvHeaders = ['id', 'session_id', 'message'];
      const csvRows = records?.map(record => [
        record.id,
        record.session_id,
        JSON.stringify(record.message)
      ]) || [];

      const csvContent = [
        csvHeaders.join(','),
        ...csvRows.map(row => row.map(cell => `"${String(cell).replace(/"/g, '""')}"`).join(','))
      ].join('\n');

      const fileName = sessionId 
        ? `dify_chat_session_${sessionId}_${new Date().toISOString().split('T')[0]}.csv`
        : `dify_chat_histories_${new Date().toISOString().split('T')[0]}.csv`;

      return new NextResponse(csvContent, {
        headers: {
          'Content-Type': 'text/csv; charset=utf-8',
          'Content-Disposition': `attachment; filename="${fileName}"`
        }
      });
    } else if (format === 'json') {
      // 生成JSON格式
      const fileName = sessionId 
        ? `dify_chat_session_${sessionId}_${new Date().toISOString().split('T')[0]}.json`
        : `dify_chat_histories_${new Date().toISOString().split('T')[0]}.json`;

      return new NextResponse(JSON.stringify(records, null, 2), {
        headers: {
          'Content-Type': 'application/json',
          'Content-Disposition': `attachment; filename="${fileName}"`
        }
      });
    } else {
      return NextResponse.json({ error: 'Unsupported format' }, { status: 400 });
    }

  } catch (error) {
    console.error('Export API error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}