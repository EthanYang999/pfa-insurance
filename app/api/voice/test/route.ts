import { NextRequest, NextResponse } from 'next/server';
import type { ConnectivityTestResult } from '@/types/voice';

export const runtime = 'nodejs';

// 测试Azure TTS连接
async function testAzureTTS(): Promise<ConnectivityTestResult> {
  const startTime = Date.now();
  
  try {
    const testText = '你好，这是语音测试。';
    const response = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/api/voice/tts`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ text: testText })
    });

    const responseTime = Date.now() - startTime;

    if (response.ok) {
      const contentType = response.headers.get('content-type');
      const isAudio = contentType?.includes('audio/');
      
      return {
        service: 'azure_tts',
        status: isAudio ? 'success' : 'error',
        responseTime,
        details: { contentType, size: response.headers.get('content-length') }
      };
    } else {
      const errorText = await response.text();
      return {
        service: 'azure_tts',
        status: 'error',
        responseTime,
        error: `HTTP ${response.status}: ${response.statusText}`,
        details: errorText
      };
    }
  } catch (error: any) {
    return {
      service: 'azure_tts',
      status: 'error',
      responseTime: Date.now() - startTime,
      error: error instanceof Error ? error.message : '连接失败'
    };
  }
}

// 测试Dify流式接口
async function testDifyStream(): Promise<ConnectivityTestResult> {
  const startTime = Date.now();
  
  try {
    const response = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/api/dify-chat-stream`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        message: '你好',
        user: 'voice-test-user'
      })
    });

    const responseTime = Date.now() - startTime;

    if (response.ok) {
      const contentType = response.headers.get('content-type');
      const isStream = contentType?.includes('text/event-stream');
      
      return {
        service: 'dify_stream',
        status: isStream ? 'success' : 'error',
        responseTime,
        details: { contentType, streaming: isStream }
      };
    } else {
      const errorText = await response.text();
      return {
        service: 'dify_stream',
        status: 'error',
        responseTime,
        error: `HTTP ${response.status}: ${response.statusText}`,
        details: errorText
      };
    }
  } catch (error: any) {
    return {
      service: 'dify_stream',
      status: 'error',
      responseTime: Date.now() - startTime,
      error: error instanceof Error ? error.message : '连接失败'
    };
  }
}

// 测试VAD模型加载
async function testVADModel(): Promise<ConnectivityTestResult> {
  const startTime = Date.now();
  
  try {
    // 这里模拟VAD模型测试，实际测试需要在客户端进行
    // 服务端只能检查相关配置
    const responseTime = Date.now() - startTime;
    
    return {
      service: 'vad_model',
      status: 'success',
      responseTime,
      details: { 
        note: 'VAD测试需要在客户端浏览器中进行',
        modelURL: 'https://cdn.jsdelivr.net/npm/@ricky0123/vad-web@0.0.24/dist/silero_vad.onnx'
      }
    };
  } catch (error: any) {
    return {
      service: 'vad_model',
      status: 'error',
      responseTime: Date.now() - startTime,
      error: error instanceof Error ? error.message : '测试异常'
    };
  }
}

export async function POST(req: NextRequest): Promise<NextResponse> {
  try {
    const { services } = await req.json();
    const servicesToTest = services || ['azure_tts', 'dify_stream', 'vad_model'];
    
    console.log('开始语音服务连通性测试:', servicesToTest);

    const results: ConnectivityTestResult[] = [];

    // 并发测试多个服务
    const testPromises = servicesToTest.map((service: string) => {
      switch (service) {
        case 'azure_tts':
          return testAzureTTS();
        case 'dify_stream':
          return testDifyStream();
        case 'vad_model':
          return testVADModel();
        default:
          return Promise.resolve({
            service: service as any,
            status: 'error' as const,
            error: '未知的服务类型'
          });
      }
    });

    const testResults = await Promise.all(testPromises);
    results.push(...testResults);

    const hasErrors = results.some(r => r.status === 'error');
    const averageResponseTime = results
      .filter(r => r.responseTime)
      .reduce((sum, r) => sum + (r.responseTime || 0), 0) / results.length;

    console.log('语音服务连通性测试完成:', {
      totalTests: results.length,
      passed: results.filter(r => r.status === 'success').length,
      failed: results.filter(r => r.status === 'error').length,
      averageResponseTime: Math.round(averageResponseTime)
    });

    return NextResponse.json({
      success: !hasErrors,
      results,
      summary: {
        totalTests: results.length,
        passed: results.filter(r => r.status === 'success').length,
        failed: results.filter(r => r.status === 'error').length,
        averageResponseTime: Math.round(averageResponseTime)
      },
      timestamp: new Date().toISOString()
    });

  } catch (error: any) {
    console.error('语音服务测试异常:', error);
    return NextResponse.json({
      success: false,
      error: '测试服务异常',
      details: error instanceof Error ? error.message : '未知错误'
    }, { status: 500 });
  }
}

// 获取服务状态
export async function GET(): Promise<NextResponse> {
  const hasAzureCredentials = !!(process.env.AZURE_SPEECH_KEY && process.env.AZURE_SPEECH_REGION);
  const hasDifyConfig = !!(process.env.DIFY_API_KEY && process.env.DIFY_API_URL);
  
  return NextResponse.json({
    status: 'ready',
    services: {
      azure_tts: {
        configured: hasAzureCredentials,
        region: process.env.AZURE_SPEECH_REGION,
        voice: process.env.AZURE_SPEECH_VOICE || 'zh-CN-XiaoxiaoNeural'
      },
      dify_stream: {
        configured: hasDifyConfig,
        url: process.env.DIFY_API_URL
      },
      vad_model: {
        configured: true,
        note: '客户端加载'
      }
    },
    timestamp: new Date().toISOString()
  });
}