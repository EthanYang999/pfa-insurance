import { NextRequest } from "next/server";

export const runtime = 'edge';

interface DifyRequest {
  message: string;
  conversationId?: string;
  user: string;
}

interface DifyStreamEvent {
  event: string;
  data?: any;
  answer?: string;
  conversation_id?: string;
  message_id?: string;
}

export async function POST(request: NextRequest) {
  try {
    const { message, conversationId, user }: DifyRequest = await request.json();

    if (!message?.trim()) {
      return new Response(
        JSON.stringify({ error: "消息内容不能为空" }),
        { 
          status: 400,
          headers: { 'Content-Type': 'application/json' }
        }
      );
    }

    // Dify API配置
    const DIFY_API_URL = process.env.DIFY_API_URL || "https://pro.aifunbox.com/v1/chat-messages";
    const DIFY_API_KEY = process.env.DIFY_API_KEY;

    if (!DIFY_API_KEY) {
      return new Response(
        JSON.stringify({ error: "DIFY_API_KEY 环境变量未配置" }),
        { 
          status: 500,
          headers: { 'Content-Type': 'application/json' }
        }
      );
    }

    console.log("调用Dify流式API:", { 
      url: DIFY_API_URL,
      message: message.substring(0, 50) + "...", 
      conversationId: conversationId || 'NEW_CONVERSATION',
      user 
    });

    // 构建请求体
    const requestBody: any = {
      inputs: {},
      query: message.trim(),
      response_mode: 'streaming', // 流式模式
      user: user || `user_${Date.now()}`,
      auto_generate_name: true
    };

    // 如果有会话ID，添加到请求中
    if (conversationId && conversationId.trim()) {
      requestBody.conversation_id = conversationId;
      console.log('使用现有会话ID:', conversationId);
    } else {
      console.log('创建新对话（流式模式）');
    }

    // 调用Dify API
    const difyResponse = await fetch(DIFY_API_URL, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${DIFY_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(requestBody)
    });

    if (!difyResponse.ok) {
      const errorText = await difyResponse.text();
      console.error("Dify流式API错误:", {
        status: difyResponse.status,
        statusText: difyResponse.statusText,
        errorText
      });
      
      return new Response(
        JSON.stringify({ 
          error: `Dify API错误: ${difyResponse.status} ${difyResponse.statusText}`,
          details: errorText 
        }),
        { 
          status: difyResponse.status,
          headers: { 'Content-Type': 'application/json' }
        }
      );
    }

    // 创建可读流来处理Dify的流式响应
    const stream = new ReadableStream({
      async start(controller) {
        const reader = difyResponse.body?.getReader();
        const decoder = new TextDecoder();
        
        let conversationIdFromStream = '';
        let messageIdFromStream = '';
        let completeAnswer = '';
        
        if (!reader) {
          controller.enqueue(new TextEncoder().encode(
            `data: ${JSON.stringify({ 
              error: "无法读取流式响应" 
            })}\n\n`
          ));
          controller.close();
          return;
        }

        try {
          while (true) {
            const { done, value } = await reader.read();
            
            if (done) {
              // 发送最终完成事件
              controller.enqueue(new TextEncoder().encode(
                `data: ${JSON.stringify({ 
                  event: 'stream_end',
                  conversation_id: conversationIdFromStream,
                  message_id: messageIdFromStream,
                  complete_answer: completeAnswer
                })}\n\n`
              ));
              controller.close();
              break;
            }

            const chunk = decoder.decode(value, { stream: true });
            const lines = chunk.split('\n');
            
            for (const line of lines) {
              if (line.startsWith('data: ')) {
                try {
                  const jsonStr = line.slice(6).trim();
                  if (!jsonStr || jsonStr === '[DONE]') continue;
                  
                  const eventData: DifyStreamEvent = JSON.parse(jsonStr);
                  
                  // 记录会话信息
                  if (eventData.conversation_id) {
                    conversationIdFromStream = eventData.conversation_id;
                  }
                  if (eventData.message_id) {
                    messageIdFromStream = eventData.message_id;
                  }
                  
                  // 处理不同类型的事件
                  if (eventData.event === 'message') {
                    // 消息内容块
                    const answer = eventData.answer || '';
                    completeAnswer += answer;
                    
                    // 转发给前端
                    controller.enqueue(new TextEncoder().encode(
                      `data: ${JSON.stringify({
                        event: 'message_chunk',
                        chunk: answer,
                        conversation_id: conversationIdFromStream,
                        message_id: messageIdFromStream
                      })}\n\n`
                    ));
                  } else if (eventData.event === 'message_end') {
                    // 消息结束
                    controller.enqueue(new TextEncoder().encode(
                      `data: ${JSON.stringify({
                        event: 'message_complete',
                        conversation_id: conversationIdFromStream,
                        message_id: messageIdFromStream,
                        complete_answer: completeAnswer
                      })}\n\n`
                    ));
                  } else if (eventData.event === 'error') {
                    // 错误事件
                    controller.enqueue(new TextEncoder().encode(
                      `data: ${JSON.stringify({
                        event: 'error',
                        error: eventData.data || '流式处理出错'
                      })}\n\n`
                    ));
                  }
                } catch (parseError) {
                  console.error('解析Dify流式数据失败:', parseError, 'Raw line:', line);
                }
              }
            }
          }
        } catch (error) {
          console.error('处理Dify流式响应失败:', error);
          controller.enqueue(new TextEncoder().encode(
            `data: ${JSON.stringify({ 
              event: 'error',
              error: error instanceof Error ? error.message : '流式处理失败' 
            })}\n\n`
          ));
          controller.close();
        }
      }
    });

    // 返回流式响应
    return new Response(stream, {
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'POST',
        'Access-Control-Allow-Headers': 'Content-Type'
      }
    });

  } catch (error) {
    console.error('Dify流式API调用失败:', error);
    
    return new Response(
      JSON.stringify({
        error: "服务器内部错误",
        details: error instanceof Error ? error.message : '未知错误'
      }),
      { 
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      }
    );
  }
}

// 健康检查端点
export async function GET() {
  return new Response(
    JSON.stringify({
      status: 'ok',
      service: 'dify-chat-stream',
      timestamp: new Date().toISOString()
    }),
    {
      headers: { 'Content-Type': 'application/json' }
    }
  );
}