import { createClient } from "@/lib/supabase/server";
import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    
    // 验证用户身份
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    if (userError || !user) {
      return NextResponse.json(
        { error: "未授权访问" },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { 
      sessionIds, 
      format = 'json', 
      dateFrom, 
      dateTo,
      includeMetadata = true 
    } = body;

    if (!sessionIds || !Array.isArray(sessionIds) || sessionIds.length === 0) {
      return NextResponse.json(
        { error: "请选择要导出的对话" },
        { status: 400 }
      );
    }

    // 获取会话信息
    let sessionsQuery = supabase
      .from('chat_sessions_with_stats')
      .select('*')
      .eq('user_id', user.id)
      .in('id', sessionIds);

    if (dateFrom) {
      sessionsQuery = sessionsQuery.gte('created_at', dateFrom);
    }
    if (dateTo) {
      sessionsQuery = sessionsQuery.lte('created_at', dateTo);
    }

    const { data: sessions, error: sessionsError } = await sessionsQuery;

    if (sessionsError) {
      console.error('获取会话信息失败:', sessionsError);
      return NextResponse.json(
        { error: "获取会话信息失败" },
        { status: 500 }
      );
    }

    if (!sessions || sessions.length === 0) {
      return NextResponse.json(
        { error: "未找到指定的对话记录" },
        { status: 404 }
      );
    }

    // 获取所有消息
    const { data: messages, error: messagesError } = await supabase
      .from('chat_messages')
      .select('*')
      .eq('user_id', user.id)
      .in('session_id', sessionIds)
      .order('session_id')
      .order('created_at', { ascending: true });

    if (messagesError) {
      console.error('获取消息失败:', messagesError);
      return NextResponse.json(
        { error: "获取消息失败" },
        { status: 500 }
      );
    }

    // 组织数据结构
    const exportData = sessions.map(session => {
      const sessionMessages = (messages || []).filter(msg => msg.session_id === session.id);
      
      const sessionData: Record<string, unknown> = {
        sessionInfo: {
          id: session.id,
          title: session.title,
          created_at: session.created_at,
          updated_at: session.updated_at,
          session_type: session.session_type,
          message_count: session.message_count
        },
        messages: sessionMessages.map(msg => ({
          id: msg.id,
          content: msg.content,
          message_type: msg.message_type,
          created_at: msg.created_at,
          ...(includeMetadata && {
            n8n_response_time: msg.n8n_response_time,
            error_details: msg.error_details
          })
        }))
      };

      return sessionData;
    });

    // 根据格式返回数据
    if (format === 'json') {
      const exportResult = {
        export_info: {
          exported_at: new Date().toISOString(),
          user_id: user.id,
          user_email: user.email,
          total_sessions: sessions.length,
          total_messages: messages?.length || 0,
          date_range: {
            from: dateFrom || null,
            to: dateTo || null
          }
        },
        sessions: exportData
      };

      return NextResponse.json(exportResult, {
        headers: {
          'Content-Disposition': `attachment; filename="chat_export_${new Date().toISOString().split('T')[0]}.json"`,
          'Content-Type': 'application/json'
        }
      });
    }

    if (format === 'csv') {
      // 生成CSV格式
      const csvRows = ['会话标题,消息类型,消息内容,发送时间,响应时间(秒)'];
      
      exportData.forEach(session => {
        const sessionMessages = session.messages as Record<string, unknown>[];
        sessionMessages.forEach((msg) => {
          const responseTime = msg.n8n_response_time ? (Number(msg.n8n_response_time) / 1000).toFixed(1) : '';
          const sessionInfo = session.sessionInfo as Record<string, unknown>;
          const row = [
            `"${String(sessionInfo.title).replace(/"/g, '""')}"`,
            msg.message_type === 'user' ? '用户' : 'AI助手',
            `"${String(msg.content).replace(/"/g, '""').replace(/\n/g, ' ')}"`,
            new Date(String(msg.created_at)).toLocaleString('zh-CN'),
            responseTime
          ].join(',');
          csvRows.push(row);
        });
      });

      const csvContent = csvRows.join('\n');
      const buffer = Buffer.from('\uFEFF' + csvContent, 'utf8'); // 添加BOM以支持中文

      return new NextResponse(buffer, {
        headers: {
          'Content-Disposition': `attachment; filename="chat_export_${new Date().toISOString().split('T')[0]}.csv"`,
          'Content-Type': 'text/csv; charset=utf-8'
        }
      });
    }

    if (format === 'txt') {
      // 生成纯文本格式
      const txtContent = exportData.map(session => {
        const sessionInfo = session.sessionInfo as Record<string, unknown>;
        const header = `=== ${sessionInfo.title} ===\n创建时间: ${new Date(String(sessionInfo.created_at)).toLocaleString('zh-CN')}\n消息数量: ${sessionInfo.message_count}\n\n`;
        
        const messagesText = (session.messages as Record<string, unknown>[]).map((msg) => {
          const time = new Date(String(msg.created_at)).toLocaleString('zh-CN');
          const sender = msg.message_type === 'user' ? '用户' : 'AI助手';
          return `[${time}] ${sender}:\n${msg.content}\n`;
        }).join('\n');

        return header + messagesText + '\n' + '='.repeat(50) + '\n\n';
      }).join('');

      const fullContent = `PFA保险培训助手 - 聊天记录导出\n导出时间: ${new Date().toLocaleString('zh-CN')}\n用户: ${user.email}\n会话数量: ${sessions.length}\n总消息数: ${messages?.length || 0}\n\n${'='.repeat(50)}\n\n${txtContent}`;

      const buffer = Buffer.from(fullContent, 'utf8');

      return new NextResponse(buffer, {
        headers: {
          'Content-Disposition': `attachment; filename="chat_export_${new Date().toISOString().split('T')[0]}.txt"`,
          'Content-Type': 'text/plain; charset=utf-8'
        }
      });
    }

    return NextResponse.json(
      { error: "不支持的导出格式" },
      { status: 400 }
    );

  } catch (error) {
    console.error('聊天记录导出API处理失败:', error);
    return NextResponse.json(
      { 
        error: "服务器内部错误",
        details: error instanceof Error ? error.message : '未知错误'
      },
      { status: 500 }
    );
  }
}