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
    const type = searchParams.get('type'); // 'user' | 'all' | 'date'
    const format = searchParams.get('format') || 'json'; // 'json' | 'csv'
    const userId = searchParams.get('user_id');
    const startDate = searchParams.get('start_date');
    const endDate = searchParams.get('end_date');

    if (!type) {
      return NextResponse.json(
        { error: 'type parameter is required' },
        { status: 400 }
      );
    }

    // 验证参数
    if (type === 'user' && !userId) {
      return NextResponse.json(
        { error: 'user_id is required for user export' },
        { status: 400 }
      );
    }

    if (type === 'date' && (!startDate || !endDate)) {
      return NextResponse.json(
        { error: 'start_date and end_date are required for date export' },
        { status: 400 }
      );
    }

    // 验证日期范围不超过7天
    if (type === 'date') {
      const start = new Date(startDate!);
      const end = new Date(endDate!);
      const diffTime = Math.abs(end.getTime() - start.getTime());
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      
      if (diffDays > 7) {
        return NextResponse.json(
          { error: 'Date range cannot exceed 7 days' },
          { status: 400 }
        );
      }
    }

    const supabase = await createClient();

    // 构建查询条件
    let query = supabase
      .from('n8n_chat_histories')
      .select('*')
      .eq('session_type', 'user')
      .not('user_id', 'is', null)
      .order('created_at', { ascending: true });

    // 应用筛选条件
    if (type === 'user') {
      query = query.eq('user_id', userId);
    } else if (type === 'date') {
      const startDateTime = new Date(startDate!);
      startDateTime.setHours(0, 0, 0, 0);
      
      const endDateTime = new Date(endDate!);
      endDateTime.setHours(23, 59, 59, 999);
      
      query = query
        .gte('created_at', startDateTime.toISOString())
        .lte('created_at', endDateTime.toISOString());
    }

    const { data: chatData, error } = await query;

    if (error) {
      console.error('Error fetching chat data for export:', error);
      return NextResponse.json(
        { error: 'Failed to fetch chat data' },
        { status: 500 }
      );
    }

    // 获取用户邮箱信息以便更好的导出
    const userIds = [...new Set(chatData?.map(record => record.user_id) || [])];
    let userEmailMap = new Map();

    if (userIds.length > 0) {
      try {
        const { createAdminClient } = await import('@/lib/supabase/admin');
        const adminClient = createAdminClient();
        
        const { data: authUsers } = await adminClient.auth.admin.listUsers();
        
        authUsers?.users.forEach(user => {
          userEmailMap.set(user.id, user.email || 'Unknown');
        });
      } catch (error) {
        console.error('Failed to fetch user emails:', error);
      }
    }

    // CSV格式处理函数
    const generateCSV = (data: any[]) => {
      if (data.length === 0) {
        return 'No data available';
      }

      // CSV标题行
      const headers = [
        'ID',
        '用户ID',
        '用户邮箱',
        '会话ID',
        '消息类型',
        '消息内容',
        '创建时间'
      ];

      // 转换数据为CSV格式
      const csvRows = [
        headers.join(','), // 标题行
        ...data.map(record => {
          const userEmail = userEmailMap.get(record.user_id) || 'Unknown';
          return [
            record.id,
            record.user_id,
            `"${userEmail}"`, // 用引号包围邮箱以防逗号问题
            record.session_id,
            record.message?.type || '',
            `"${(record.message?.content || '').replace(/"/g, '""')}"`, // 转义引号
            record.created_at
          ].join(',');
        })
      ];

      return csvRows.join('\n');
    };

    // 组织导出数据
    const exportData = {
      export_info: {
        export_type: type,
        export_time: new Date().toISOString(),
        date_range: type === 'date' ? { start_date: startDate, end_date: endDate } : null,
        user_id: type === 'user' ? userId : null,
        total_records: chatData?.length || 0,
        total_users: userIds.length
      },
      users: {} as Record<string, any>
    };

    // 按用户分组数据（仅用于JSON格式）
    if (format === 'json') {
      chatData?.forEach(record => {
        const userId = record.user_id;
        const userEmail = userEmailMap.get(userId) || 'Unknown';
        
        if (!exportData.users[userId]) {
          exportData.users[userId] = {
            user_id: userId,
            user_email: userEmail,
            sessions: {} as Record<string, any>
          };
        }
        
        const sessionId = record.session_id;
        if (!exportData.users[userId].sessions[sessionId]) {
          exportData.users[userId].sessions[sessionId] = {
            session_id: sessionId,
            messages: []
          };
        }
        
        exportData.users[userId].sessions[sessionId].messages.push({
          id: record.id,
          message_type: record.message?.type,
          content: record.message?.content,
          created_at: record.created_at
        });
      });
    }

    // 生成文件名
    const timestamp = new Date().toISOString().split('T')[0];
    const extension = format === 'csv' ? 'csv' : 'json';
    let filename = `chat_export_${timestamp}.${extension}`;
    
    if (type === 'user') {
      const userEmail = userEmailMap.get(userId) || userId;
      filename = `chat_export_${userEmail.replace('@', '_')}_${timestamp}.${extension}`;
    } else if (type === 'date') {
      filename = `chat_export_${startDate}_to_${endDate}.${extension}`;
    } else {
      filename = `chat_export_all_users_${timestamp}.${extension}`;
    }

    console.log('聊天导出成功:', {
      type,
      format,
      userId: type === 'user' ? userId : undefined,
      dateRange: type === 'date' ? { startDate, endDate } : undefined,
      totalRecords: chatData?.length || 0,
      totalUsers: userIds.length,
      filename
    });

    // 根据格式返回相应的文件
    if (format === 'csv') {
      const csvContent = generateCSV(chatData || []);
      
      return new NextResponse(csvContent, {
        status: 200,
        headers: {
          'Content-Type': 'text/csv; charset=utf-8',
          'Content-Disposition': `attachment; filename="${filename}"`,
          'Cache-Control': 'no-cache'
        }
      });
    } else {
      // 返回JSON文件
      const jsonString = JSON.stringify(exportData, null, 2);
      
      return new NextResponse(jsonString, {
        status: 200,
        headers: {
          'Content-Type': 'application/json',
          'Content-Disposition': `attachment; filename="${filename}"`,
          'Cache-Control': 'no-cache'
        }
      });
    }

  } catch (error) {
    console.error('Chat export API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}