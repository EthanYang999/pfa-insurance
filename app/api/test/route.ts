import { NextRequest, NextResponse } from "next/server";

export async function GET() {
  console.log("=== Test API Called ===");
  
  return NextResponse.json({
    status: "ok",
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV,
    hasN8nUrl: !!process.env.N8N_WEBHOOK_URL,
    hasSupabaseUrl: !!process.env.NEXT_PUBLIC_SUPABASE_URL,
  });
}

export async function POST(request: NextRequest) {
  console.log("=== Test POST API Called ===");
  
  try {
    const body = await request.json();
    console.log("Request body:", body);
    
    // 简单测试n8n连接但不等待响应
    const N8N_WEBHOOK_URL = process.env.N8N_WEBHOOK_URL || "https://n8n.aifunbox.com/webhook/insurance";
    console.log("N8N URL:", N8N_WEBHOOK_URL);
    
    return NextResponse.json({
      status: "success",
      receivedMessage: body.message,
      n8nUrl: N8N_WEBHOOK_URL,
      timestamp: new Date().toISOString(),
    });
    
  } catch (error) {
    console.error("Test API Error:", error);
    return NextResponse.json({
      status: "error",
      error: error instanceof Error ? error.message : String(error),
      timestamp: new Date().toISOString(),
    }, { status: 500 });
  }
}