import { NextRequest, NextResponse } from "next/server";

interface DifyRequest {
  message: string;
  conversationId?: string;
  user: string;
}

export async function POST(request: NextRequest) {
  try {
    const { message, conversationId, user }: DifyRequest = await request.json();

    if (!message?.trim()) {
      return NextResponse.json(
        { error: "消息内容不能为空" },
        { status: 400 }
      );
    }

    // Dify API配置
    const DIFY_API_URL = process.env.DIFY_API_URL || "https://pro.aifunbox.com/v1/chat-messages";
    const DIFY_API_KEY = process.env.DIFY_API_KEY;

    if (!DIFY_API_KEY) {
      throw new Error('DIFY_API_KEY 环境变量未配置');
    }

    console.log("调用Dify API:", { 
      url: DIFY_API_URL,
      message: message.substring(0, 50) + "...", 
      conversationId,
      user 
    });

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 15000); // 15秒超时

    // 构建请求体
    const requestBody: {
      inputs: Record<string, unknown>;
      query: string;
      response_mode: string;
      user: string;
      auto_generate_name: boolean;
      conversation_id?: string;
    } = {
      inputs: {},
      query: message.trim(),
      response_mode: 'streaming', // 使用流式模式
      user: user || `user_${Date.now()}`,
      auto_generate_name: true
    };

    // 如果有会话ID，添加到请求中（第一次调用时不传，让Dify创建新对话）
    if (conversationId && conversationId.trim()) {
      requestBody.conversation_id = conversationId;
      console.log('使用现有会话ID:', conversationId);
    } else {
      console.log('创建新对话（不传conversation_id）');
    }

    const response = await fetch(DIFY_API_URL, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${DIFY_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(requestBody),
      signal: controller.signal
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      const errorText = await response.text();
      console.error("Dify API错误:", {
        status: response.status,
        statusText: response.statusText,
        errorText,
        requestBody
      });
      
      return NextResponse.json({
        success: false,
        response: "AI助手暂时不可用，请稍后再试。",
        error: `Dify API错误: ${response.status} ${response.statusText}`,
        details: errorText,
        debug: process.env.NODE_ENV === "development" ? { requestBody } : undefined
      }, { status: response.status });
    }

    const data = await response.json();
    console.log("Dify API响应:", {
      conversation_id: data.conversation_id,
      message_id: data.message_id,
      answer_length: data.answer?.length
    });

    return NextResponse.json({
      success: true,
      response: data.answer || "抱歉，我暂时无法理解您的问题。",
      conversationId: data.conversation_id || conversationId,
      messageId: data.message_id,
      metadata: {
        usage: data.usage,
        created_at: data.created_at
      }
    });

  } catch (error) {
    console.error('Dify API调用失败:', error);
    
    let errorMessage = "AI助手暂时不可用，请稍后再试。";
    let statusCode = 500;
    
    if (error instanceof Error) {
      if (error.name === 'AbortError') {
        errorMessage = "请求超时，请重试。";
        statusCode = 408;
      } else if (error.message.includes('400')) {
        errorMessage = "请求参数有误，请检查输入内容。";
        statusCode = 400;
      } else if (error.message.includes('401')) {
        errorMessage = "API认证失败，请检查配置。";
        statusCode = 401;
      } else if (error.message.includes('404')) {
        errorMessage = "对话不存在，将创建新对话。";
        statusCode = 404;
      }
    }
    
    return NextResponse.json({
      success: false,
      response: errorMessage,
      error: error instanceof Error ? error.message : '未知错误'
    }, { status: statusCode });
  }
}

// 健康检查端点
export async function GET() {
  return NextResponse.json({
    status: 'ok',
    service: 'dify-chat',
    timestamp: new Date().toISOString()
  });
}