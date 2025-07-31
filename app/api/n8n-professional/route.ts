import { NextRequest, NextResponse } from "next/server";

interface N8NRequest {
  conversationHistory: Array<{
    role: 'user' | 'assistant';
    content: string;
  }>;
  messageId: string;
  conversationId: string;
}

export async function POST(request: NextRequest) {
  try {
    const { conversationHistory, messageId, conversationId }: N8NRequest = await request.json();

    if (!conversationHistory || conversationHistory.length === 0) {
      return NextResponse.json(
        { error: "对话历史不能为空" },
        { status: 400 }
      );
    }

    // 获取最后一个用户消息
    const lastUserMessage = conversationHistory
      .filter(msg => msg.role === 'user')
      .pop();

    if (!lastUserMessage) {
      return NextResponse.json(
        { error: "未找到用户消息" },
        { status: 400 }
      );
    }

    // N8N配置
    const N8N_WEBHOOK_URL = process.env.N8N_WEBHOOK_URL || "https://n8nprd.aifunbox.com/webhook/insurance";

    console.log("调用N8N专业API:", { 
      url: N8N_WEBHOOK_URL,
      message: lastUserMessage.content.substring(0, 50) + "...",
      conversationId,
      historyLength: conversationHistory.length
    });

    // 验证N8N_WEBHOOK_URL是否配置
    if (!process.env.N8N_WEBHOOK_URL) {
      console.warn("N8N_WEBHOOK_URL环境变量未配置，使用默认地址");
    }

    // 准备发送给N8N的数据（只发送用户当前问题，不带对话历史）
    const requestData = {
      text: lastUserMessage.content,
      sessionId: `professional_${conversationId}`
    };

    console.log("发送N8N请求数据:", {
      text: requestData.text,
      sessionId: requestData.sessionId,
      text_length: requestData.text.length
    });

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 65000); // 65秒超时

    const response = await fetch(N8N_WEBHOOK_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(requestData),
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      console.error("N8N专业API错误:", response.status, response.statusText);
      
      // 尝试读取错误响应
      try {
        const errorData = await response.json();
        console.error("N8N专业API错误详情:", errorData);
        
        return NextResponse.json({
          success: false,
          response: "专业AI教练暂时不可用，请稍后再试。",
          error: `N8N专业API错误: ${response.status} ${response.statusText}`,
          details: errorData,
          debug: process.env.NODE_ENV === "development" ? { 
            requestData,
            webhook_url: N8N_WEBHOOK_URL 
          } : undefined
        }, { status: response.status });
      } catch (parseError) {
        console.error("N8N专业API错误，无法解析响应:", parseError);
        const errorText = await response.text().catch(() => '无法读取错误响应');
        
        return NextResponse.json({
          success: false,
          response: "专业AI教练暂时不可用，请稍后再试。",
          error: `N8N专业API错误: ${response.status} ${response.statusText}`,
          details: errorText,
          debug: process.env.NODE_ENV === "development" ? { 
            requestData,
            webhook_url: N8N_WEBHOOK_URL 
          } : undefined
        }, { status: response.status });
      }
    }

    const data = await response.json();
    console.log("N8N专业API响应:", {
      has_output: !!data.output,
      output_length: data.output ? data.output.length : 0,
      raw_response: data
    });

    // 提取AI回复，根据你的测试，N8N返回 {"output": "..."}
    const aiResponse = data.output || 
                      "抱歉，专业AI教练暂时无法处理您的请求，请稍后再试。";

    return NextResponse.json({
      success: true,
      response: aiResponse,
      messageId,
      responseTime: data.responseTime || 0,
      metadata: {
        n8n_response: !!data.output,
        response_length: data.output ? data.output.length : 0,
        timestamp: new Date().toISOString()
      }
    });

  } catch (error) {
    console.error('N8N专业API调用失败:', error);
    
    let errorMessage = "专业AI教练暂时不可用，请稍后再试。";
    let statusCode = 500;
    
    if (error instanceof Error) {
      if (error.name === 'AbortError') {
        errorMessage = "专业回答请求超时，请重试。系统需要更多时间分析您的问题。";
        statusCode = 408;
      } else if (error.message.includes('fetch')) {
        errorMessage = "无法连接到专业AI教练服务，请检查网络连接。";
        statusCode = 502;
      }
    }
    
    return NextResponse.json({
      success: false,
      response: errorMessage,
      error: error instanceof Error ? error.message : '未知错误',
      debug: process.env.NODE_ENV === "development" ? {
        stack: error instanceof Error ? error.stack : undefined
      } : undefined
    }, { status: statusCode });
  }
}

// 健康检查端点  
export async function GET() {
  return NextResponse.json({
    status: 'ok',
    service: 'n8n-professional',
    timestamp: new Date().toISOString()
  });
}