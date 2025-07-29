import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    const { message, userId } = await request.json();

    if (!message || typeof message !== "string") {
      return NextResponse.json(
        { error: "Message is required" },
        { status: 400 }
      );
    }

    // n8n webhook URL - 优先使用环境变量，否则使用提供的默认地址
    const N8N_WEBHOOK_URL = process.env.N8N_WEBHOOK_URL || "https://n8n.aifunbox.com/webhook/insurance";
    
    console.log("Using N8N webhook URL:", N8N_WEBHOOK_URL);

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
    
    // 创建带超时的 AbortController
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 15000); // 15秒超时
    
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
      let errorDetails = "";
      try {
        const errorData = await response.json();
        errorDetails = errorData.message || errorData.hint || "";
        console.error("N8N error details:", errorData);
      } catch {
        console.error("Could not parse error response");
      }
      
      // 根据状态码提供不同的错误信息
      let errorMessage = "抱歉，AI培训系统遇到了问题。";
      
      if (response.status === 404) {
        errorMessage = "n8n工作流webhook未找到或未激活。请检查工作流是否已启动并激活。";
      } else if (response.status === 500) {
        errorMessage = "n8n工作流执行出错，请检查工作流配置。";
      } else if (response.status === 400) {
        errorMessage = "请求格式错误，请检查n8n工作流的输入配置。";
      }
      
      return NextResponse.json({
        response: errorMessage,
        timestamp: new Date().toISOString(),
        debug: process.env.NODE_ENV === "development" ? {
          status: response.status,
          statusText: response.statusText,
          errorDetails
        } : undefined,
      });
    }

    const data = await response.json();
    console.log("N8N response data:", data);
    
    // 处理不同的响应格式
    let aiResponse = "";
    if (typeof data === "string") {
      aiResponse = data;
    } else if (data.output) {
      // n8n工作流返回的主要字段
      aiResponse = data.output;
    } else if (data.response) {
      aiResponse = data.response;
    } else if (data.message) {
      aiResponse = data.message;
    } else if (data.text) {
      aiResponse = data.text;
    } else {
      aiResponse = "收到您的消息，让我为您提供专业的保险培训指导。";
    }
    
    return NextResponse.json({
      response: aiResponse,
      timestamp: new Date().toISOString(),
    });

  } catch (error) {
    console.error("Chat API Error:", error);
    
    // 特殊处理不同类型的错误
    let errorMessage = "抱歉，我现在无法连接到培训系统。";
    
    if (error instanceof Error) {
      if (error.name === "AbortError") {
        errorMessage = "请求超时了，n8n工作流可能没有响应。请检查n8n工作流是否正常运行，或稍后再试。";
      } else if (error.message.includes("fetch")) {
        errorMessage = "无法连接到n8n服务器，请检查网络连接和webhook地址是否正确。";
      }
    }
    
    return NextResponse.json({
      response: errorMessage,
      timestamp: new Date().toISOString(),
      debug: process.env.NODE_ENV === "development" ? (error as Error).message : undefined,
    });
  }
}