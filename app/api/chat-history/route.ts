import { createClient } from "@/lib/supabase/server";
import { NextRequest, NextResponse } from "next/server";
import { ChatHistoryQuery } from "@/types/chat";

export async function GET(request: NextRequest) {
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

    // 解析查询参数
    const { searchParams } = new URL(request.url);
    const query: ChatHistoryQuery = {
      limit: parseInt(searchParams.get('limit') || '20'),
      offset: parseInt(searchParams.get('offset') || '0'),
      sessionId: searchParams.get('sessionId') || undefined,
      searchTerm: searchParams.get('search') || undefined,
      sessionType: searchParams.get('type') || undefined,
      dateFrom: searchParams.get('dateFrom') || undefined,
      dateTo: searchParams.get('dateTo') || undefined,
    };

    // 如果请求特定会话的消息
    if (query.sessionId) {
      const { data: messages, error: messagesError } = await supabase
        .from('chat_messages')
        .select('*')
        .eq('session_id', query.sessionId)
        .eq('user_id', user.id)
        .order('created_at', { ascending: true })
        .range(query.offset || 0, (query.offset || 0) + (query.limit || 20) - 1);

      if (messagesError) {
        console.error('获取聊天消息失败:', messagesError);
        return NextResponse.json(
          { error: "获取聊天消息失败" },
          { status: 500 }
        );
      }

      return NextResponse.json({
        success: true,
        messages: messages || [],
        total: messages?.length || 0
      });
    }

    // 获取会话列表
    let sessionsQuery = supabase
      .from('chat_sessions_with_stats')
      .select('*', { count: 'exact' })
      .eq('user_id', user.id)
      .eq('is_archived', false);

    // 添加筛选条件
    if (query.sessionType) {
      sessionsQuery = sessionsQuery.eq('session_type', query.sessionType);
    }

    if (query.dateFrom) {
      sessionsQuery = sessionsQuery.gte('created_at', query.dateFrom);
    }

    if (query.dateTo) {
      sessionsQuery = sessionsQuery.lte('created_at', query.dateTo);
    }

    // 如果有搜索词，需要通过消息内容搜索
    if (query.searchTerm) {
      // 首先获取匹配搜索词的消息所属的会话ID
      const { data: matchingMessages } = await supabase
        .from('chat_messages')
        .select('session_id')
        .eq('user_id', user.id)
        .textSearch('content', query.searchTerm);

      if (matchingMessages && matchingMessages.length > 0) {
        const sessionIds = [...new Set(matchingMessages.map(m => m.session_id))];
        sessionsQuery = sessionsQuery.in('id', sessionIds);
      } else {
        // 如果没有匹配的消息，返回空结果
        return NextResponse.json({
          success: true,
          sessions: [],
          total: 0
        });
      }
    }

    // 应用排序和分页
    const { data: sessions, error: sessionsError, count } = await sessionsQuery
      .order('last_message_at', { ascending: false })
      .range(query.offset || 0, (query.offset || 0) + (query.limit || 20) - 1);

    if (sessionsError) {
      console.error('获取聊天会话失败:', sessionsError);
      return NextResponse.json(
        { error: "获取聊天会话失败" },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      sessions: sessions || [],
      total: count || 0
    });

  } catch (error) {
    console.error('聊天历史API处理失败:', error);
    return NextResponse.json(
      { 
        error: "服务器内部错误",
        details: error instanceof Error ? error.message : '未知错误'
      },
      { status: 500 }
    );
  }
}

// 更新会话标题
export async function PATCH(request: NextRequest) {
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

    const { sessionId, title } = await request.json();

    if (!sessionId || !title) {
      return NextResponse.json(
        { error: "缺少必要参数" },
        { status: 400 }
      );
    }

    // 更新会话标题
    const { error: updateError } = await supabase
      .from('chat_sessions')
      .update({ 
        title: title.trim(),
        updated_at: new Date().toISOString()
      })
      .eq('id', sessionId)
      .eq('user_id', user.id); // 确保只能更新自己的会话

    if (updateError) {
      console.error('更新会话标题失败:', updateError);
      return NextResponse.json(
        { error: "更新会话标题失败" },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "会话标题更新成功"
    });

  } catch (error) {
    console.error('更新会话标题API处理失败:', error);
    return NextResponse.json(
      { 
        error: "服务器内部错误",
        details: error instanceof Error ? error.message : '未知错误'
      },
      { status: 500 }
    );
  }
}

// 删除（归档）会话
export async function DELETE(request: NextRequest) {
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

    const { searchParams } = new URL(request.url);
    const sessionId = searchParams.get('sessionId');

    if (!sessionId) {
      return NextResponse.json(
        { error: "缺少会话ID" },
        { status: 400 }
      );
    }

    // 归档会话（软删除）
    const { error: deleteError } = await supabase
      .from('chat_sessions')
      .update({ 
        is_archived: true,
        updated_at: new Date().toISOString()
      })
      .eq('id', sessionId)
      .eq('user_id', user.id); // 确保只能删除自己的会话

    if (deleteError) {
      console.error('删除会话失败:', deleteError);
      return NextResponse.json(
        { error: "删除会话失败" },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "会话删除成功"
    });

  } catch (error) {
    console.error('删除会话API处理失败:', error);
    return NextResponse.json(
      { 
        error: "服务器内部错误",
        details: error instanceof Error ? error.message : '未知错误'
      },
      { status: 500 }
    );
  }
}