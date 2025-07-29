import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  console.log("=== Chat API Request Started ===");
  const startTime = Date.now();
  
  try {
    const { message, userId } = await request.json();
    console.log("Request payload received:", { messageLength: message?.length, userId });

    if (!message || typeof message !== "string") {
      console.log("Invalid message format");
      return NextResponse.json(
        { error: "Message is required" },
        { status: 400 }
      );
    }

    // n8n webhook URL - 优先使用环境变量，否则使用提供的默认地址
    const N8N_WEBHOOK_URL = process.env.N8N_WEBHOOK_URL || "https://n8n.aifunbox.com/webhook/insurance";
    
    console.log("Using N8N webhook URL:", N8N_WEBHOOK_URL);
    console.log("Environment check - NODE_ENV:", process.env.NODE_ENV);

    // 准备发送数据 - 匹配HTML成功的格式
    const requestData = {
      message,
      userId: userId || `user_${Date.now()}`,
      sessionId: `chat_${Date.now()}`,
      timestamp: new Date().toISOString(),
      context: {
        page: "chat",
        scenario: "insurance_training"
      }
    };
    
    console.log("Sending request to n8n:", requestData);
    
    // 尝试快速请求，如果超时则返回预设回复
    let response;
    let aiResponse = "";
    
    try {
      // 创建带超时的 AbortController - 只给3秒时间
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 3000);
      
      response = await fetch(N8N_WEBHOOK_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(requestData),
        signal: controller.signal,
      });
      
      clearTimeout(timeoutId);
      console.log("N8N response status:", response.status);

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      console.log("N8N response data:", data);
      
      // 提取AI回复，支持多种响应格式
      aiResponse = data.output || 
                  data.response || 
                  data.message || 
                  data.reply || 
                  data.data?.response ||
                  data.text || "";
                  
    } catch (error) {
      console.warn("N8N request failed or timed out:", error);
      // 如果n8n超时或失败，使用预设回复
      aiResponse = "";
    }

    // 如果没有从n8n获得回复，使用智能预设回复
    if (!aiResponse) {
      const fallbackResponses = [
        "您好！我是您的AI保险教练雪莉。很高兴为您服务！请告诉我您想了解哪方面的保险知识？",
        "感谢您的提问！作为专业的保险培训助手，我可以帮您解答产品知识、销售技巧等问题。请具体描述您的需求。",
        "我正在为您准备最专业的回答。请稍等片刻，或者您可以先告诉我更多具体信息，这样我能提供更精准的指导。"
      ];
      
      // 根据消息内容选择合适的回复
      const messageContent = message.toLowerCase();
      if (messageContent.includes('你好') || messageContent.includes('您好')) {
        aiResponse = fallbackResponses[0];
      } else if (messageContent.includes('问题') || messageContent.includes('帮助')) {
        aiResponse = fallbackResponses[1];
      } else {
        aiResponse = fallbackResponses[2];
      }
      
      console.log("Using fallback response due to n8n timeout");
    }
    
    const duration = Date.now() - startTime;
    console.log(`=== Chat API Success - Duration: ${duration}ms ===`);
    
    return NextResponse.json({
      response: aiResponse,
      timestamp: new Date().toISOString(),
    });

  } catch (error) {
    const duration = Date.now() - startTime;
    console.error(`=== Chat API Error - Duration: ${duration}ms ===`);
    console.error("Error details:", error);
    console.error("Error stack:", error instanceof Error ? error.stack : "No stack trace");
    
    // 特殊处理不同类型的错误
    let errorMessage = "抱歉，我现在无法连接到培训系统。";
    let statusCode = 500;
    
    if (error instanceof Error) {
      if (error.name === "AbortError") {
        errorMessage = "请求超时了，请稍后再试。";
        statusCode = 408;
      } else if (error.message.includes("fetch")) {
        errorMessage = "网络连接问题，请稍后重试。";
        statusCode = 502;
      }
    }
    
    return NextResponse.json({
      response: errorMessage,
      timestamp: new Date().toISOString(),
      error: "chat_api_error",
      debug: process.env.NODE_ENV === "development" ? {
        message: error instanceof Error ? error.message : String(error),
        duration: `${duration}ms`
      } : undefined,
    }, { status: statusCode });
  }
}