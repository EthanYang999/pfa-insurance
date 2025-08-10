import { NextRequest, NextResponse } from 'next/server';
import type { VoiceConfig } from '@/types/voice';

export const runtime = 'nodejs';

// 获取语音服务配置（客户端安全配置）
export async function GET(): Promise<NextResponse> {
  try {
    // 只返回客户端需要的、安全的配置信息
    const config: Partial<VoiceConfig> = {
      azureRegion: process.env.AZURE_SPEECH_REGION || 'westus3',
      azureVoice: process.env.AZURE_SPEECH_VOICE || 'zh-CN-XiaoxiaoNeural',
      difyApiUrl: '/api/dify-chat-stream', // 使用相对路径，通过我们的代理
      language: 'zh-CN',
      autoStart: false
    };

    // 检查必要配置是否完整
    const hasAzureCredentials = !!(process.env.AZURE_SPEECH_KEY && process.env.AZURE_SPEECH_REGION);
    const hasDifyConfig = !!(process.env.DIFY_API_KEY && process.env.DIFY_API_URL);

    const configStatus = {
      azure: hasAzureCredentials,
      dify: hasDifyConfig,
      overall: hasAzureCredentials && hasDifyConfig
    };

    return NextResponse.json({
      config,
      status: configStatus,
      ready: configStatus.overall,
      message: configStatus.overall ? '语音服务配置完整' : '语音服务配置不完整',
      timestamp: new Date().toISOString()
    });

  } catch (error: any) {
    console.error('获取语音配置失败:', error);
    return NextResponse.json({
      error: '获取配置失败',
      details: error.message || '未知错误'
    }, { status: 500 });
  }
}

// 验证配置完整性
export async function POST(req: NextRequest): Promise<NextResponse> {
  try {
    const { validateCredentials = false } = await req.json();

    const checks = {
      environmentVariables: {
        AZURE_SPEECH_KEY: !!process.env.AZURE_SPEECH_KEY,
        AZURE_SPEECH_REGION: !!process.env.AZURE_SPEECH_REGION,
        AZURE_SPEECH_VOICE: !!process.env.AZURE_SPEECH_VOICE,
        DIFY_API_KEY: !!process.env.DIFY_API_KEY,
        DIFY_API_URL: !!process.env.DIFY_API_URL
      }
    };

    const missingVars = Object.entries(checks.environmentVariables)
      .filter(([_, exists]) => !exists)
      .map(([name, _]) => name);

    let credentialValidation = null;
    if (validateCredentials && missingVars.length === 0) {
      try {
        // 简单验证Azure连接
        const testResponse = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/api/voice/tts`, {
          method: 'GET'
        });
        
        credentialValidation = {
          azure: testResponse.ok,
          error: testResponse.ok ? null : await testResponse.text()
        };
      } catch (error: any) {
        credentialValidation = {
          azure: false,
          error: error.message
        };
      }
    }

    const isValid = missingVars.length === 0 && (!credentialValidation || credentialValidation.azure);

    return NextResponse.json({
      valid: isValid,
      checks,
      missingVariables: missingVars,
      credentialValidation,
      recommendations: missingVars.length > 0 ? [
        '请检查.env文件中是否包含所有必要的环境变量',
        '确保Azure语音服务密钥和区域正确配置',
        '验证Dify API密钥和URL是否有效'
      ] : [],
      timestamp: new Date().toISOString()
    });

  } catch (error: any) {
    console.error('配置验证失败:', error);
    return NextResponse.json({
      valid: false,
      error: '配置验证异常',
      details: error.message || '未知错误'
    }, { status: 500 });
  }
}