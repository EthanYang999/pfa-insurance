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
    
    // 等待n8n回复，给足够的时间
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 8000); // 8秒超时，最大化等待时间
    
    const response = await fetch(N8N_WEBHOOK_URL, {
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
      console.error("N8N webhook failed:", response.status, response.statusText);
      
      // 尝试读取错误响应
      try {
        const errorData = await response.json();
        console.error("N8N error details:", errorData);
      } catch {
        console.error("Could not parse error response");
      }
      
      throw new Error(`N8N webhook failed: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    console.log("N8N response data:", data);
    
    // 提取AI回复，支持多种响应格式
    const aiResponse = data.output || 
                      data.response || 
                      data.message || 
                      data.reply || 
                      data.data?.response ||
                      data.text || 
                      "抱歉，我暂时无法处理您的请求，请稍后再试。";
    
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