import { createClient } from "@/lib/supabase/server";
import { NextRequest, NextResponse } from "next/server";

interface ChatRequest {
  message: string;
  sessionId?: string;
  sessionType?: string;
}

interface N8nResponse {
  output?: string;
  response?: string;
  [key: string]: unknown;
}

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

    // 解析请求体
    const { message, sessionId, sessionType = 'general' }: ChatRequest = await request.json();
    
    if (!message?.trim()) {
      return NextResponse.json(
        { error: "消息内容不能为空" },
        { status: 400 }
      );
    }

    let currentSessionId = sessionId;
    
    // 如果没有提供sessionId，创建新的聊天会话
    if (!currentSessionId) {
      const { data: newSession, error: sessionError } = await supabase
        .from('chat_sessions')
        .insert({
          user_id: user.id,
          title: generateSessionTitle(message),
          session_type: sessionType,
          metadata: {}
        })
        .select('id')
        .single();

      if (sessionError) {
        console.error('创建聊天会话失败:', sessionError);
        return NextResponse.json(
          { error: "创建聊天会话失败" },
          { status: 500 }
        );
      }

      currentSessionId = newSession.id;
    }

    // 保存用户消息到数据库
    const { error: userMessageError } = await supabase
      .from('chat_messages')
      .insert({
        session_id: currentSessionId,
        user_id: user.id,
        message_type: 'user',
        content: message.trim(),
        metadata: { timestamp: new Date().toISOString() }
      });

    if (userMessageError) {
      console.error('保存用户消息失败:', userMessageError);
      return NextResponse.json(
        { error: "保存用户消息失败" },
        { status: 500 }
      );
    }

    // 调用n8n webhook
    const n8nStartTime = Date.now();
    let n8nResponse: string = '';
    let n8nError: string | null = null;

    try {
      const webhookUrl = process.env.N8N_WEBHOOK_URL;
      if (!webhookUrl) {
        throw new Error('N8N_WEBHOOK_URL 环境变量未配置');
      }

      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 60000); // 60秒超时

      const response = await fetch(webhookUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          text: message.trim(),
          sessionId: `user_${user.id}_${currentSessionId}`
        }),
        signal: controller.signal
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        throw new Error(`n8n响应错误: ${response.status} ${response.statusText}`);
      }

      const data: N8nResponse = await response.json();
      n8nResponse = data.output || data.response || JSON.stringify(data);

    } catch (error) {
      console.error('n8n调用失败:', error);
      n8nError = error instanceof Error ? error.message : '未知错误';
      n8nResponse = '抱歉，AI教练暂时无法回复，请稍后再试。';
    }

    const n8nResponseTime = Date.now() - n8nStartTime;

    // 保存AI回复到数据库
    const { error: aiMessageError } = await supabase
      .from('chat_messages')
      .insert({
        session_id: currentSessionId,
        user_id: user.id,
        message_type: 'assistant',
        content: n8nResponse,
        n8n_response_time: n8nResponseTime,
        metadata: {
          timestamp: new Date().toISOString(),
          n8n_error: n8nError,
          response_time_ms: n8nResponseTime
        }
      });

    if (aiMessageError) {
      console.error('保存AI回复失败:', aiMessageError);
      // 这里不返回错误，因为用户已经看到了回复
    }

    // 返回成功响应
    return NextResponse.json({
      success: true,
      response: n8nResponse,
      sessionId: currentSessionId,
      responseTime: n8nResponseTime,
      metadata: {
        messagesSaved: !userMessageError && !aiMessageError,
        n8nError: n8nError
      }
    });

  } catch (error) {
    console.error('聊天API处理失败:', error);
    return NextResponse.json(
      { 
        error: "服务器内部错误",
        details: error instanceof Error ? error.message : '未知错误'
      },
      { status: 500 }
    );
  }
}

// 辅助函数：根据消息内容生成会话标题
function generateSessionTitle(message: string): string {
  const trimmed = message.trim();
  
  // 如果消息太短，使用默认标题
  if (trimmed.length < 10) {
    return '新对话';
  }
  
  // 截取前30个字符作为标题
  let title = trimmed.substring(0, 30);
  
  // 如果被截断，添加省略号
  if (trimmed.length > 30) {
    title += '...';
  }
  
  // 移除换行符
  title = title.replace(/\n/g, ' ');
  
  return title;
}

// 健康检查端点
export async function GET() {
  return NextResponse.json({
    status: 'ok',
    service: 'chat-with-history',
    timestamp: new Date().toISOString()
  });
}