import { NextRequest, NextResponse } from 'next/server';
import * as SpeechSDK from 'microsoft-cognitiveservices-speech-sdk';
import type { TTSRequest, TTSResponse } from '@/types/voice';

export const runtime = 'nodejs';

export async function POST(req: NextRequest): Promise<NextResponse> {
  try {
    // 获取Azure语音服务凭证
    const AZURE_SPEECH_KEY = process.env.AZURE_SPEECH_KEY;
    const AZURE_SPEECH_REGION = process.env.AZURE_SPEECH_REGION;
    const AZURE_SPEECH_VOICE = process.env.AZURE_SPEECH_VOICE || 'zh-CN-XiaoxiaoNeural';

    if (!AZURE_SPEECH_KEY || !AZURE_SPEECH_REGION) {
      console.error('Azure语音服务环境变量未配置');
      const errorResponse: TTSResponse = { 
        error: 'Azure语音服务凭证未配置' 
      };
      return NextResponse.json(errorResponse, { status: 500 });
    }

    // 解析请求体
    const requestBody: TTSRequest = await req.json();
    const { text, voice = AZURE_SPEECH_VOICE, rate = '0%', pitch = '0%' } = requestBody;

    if (!text?.trim()) {
      const errorResponse: TTSResponse = { 
        error: '文本内容不能为空' 
      };
      return NextResponse.json(errorResponse, { status: 400 });
    }

    console.log('TTS请求:', { 
      text: text.substring(0, 50) + (text.length > 50 ? '...' : ''),
      voice,
      textLength: text.length 
    });

    // 配置Azure Speech SDK
    const speechConfig = SpeechSDK.SpeechConfig.fromSubscription(AZURE_SPEECH_KEY, AZURE_SPEECH_REGION);
    speechConfig.speechSynthesisVoiceName = voice;
    
    // 构建SSML以支持语速和音调调节
    const ssml = `
      <speak version="1.0" xmlns="http://www.w3.org/2001/10/synthesis" xml:lang="zh-CN">
        <voice name="${voice}">
          <prosody rate="${rate}" pitch="${pitch}">
            ${text.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')}
          </prosody>
        </voice>
      </speak>
    `.trim();

    const synthesizer = new SpeechSDK.SpeechSynthesizer(speechConfig);

    // 执行语音合成
    const audioData: ArrayBuffer = await new Promise((resolve, reject) => {
      synthesizer.speakSsmlAsync(
        ssml,
        result => {
          if (result.reason === SpeechSDK.ResultReason.SynthesizingAudioCompleted) {
            console.log('TTS合成成功，音频大小:', result.audioData.byteLength, 'bytes');
            resolve(result.audioData);
          } else {
            const errorDetails = `语音合成失败: ${result.reason}. 错误: ${result.errorDetails}`;
            console.error(errorDetails);
            reject(new Error(errorDetails));
          }
          synthesizer.close();
        },
        error => {
          console.error('TTS合成异常:', error);
          reject(error);
          synthesizer.close();
        }
      );
    });

    // 返回音频数据
    return new NextResponse(audioData, {
      headers: {
        'Content-Type': 'audio/mpeg',
        'Cache-Control': 'no-cache',
        'Access-Control-Allow-Origin': '*'
      }
    });

  } catch (error: any) {
    console.error('TTS API路由错误:', error);
    const errorResponse: TTSResponse = {
      error: '语音合成服务异常',
      details: error.message || '未知错误'
    };
    return NextResponse.json(errorResponse, { status: 500 });
  }
}

// 健康检查
export async function GET(): Promise<NextResponse> {
  const hasCredentials = !!(process.env.AZURE_SPEECH_KEY && process.env.AZURE_SPEECH_REGION);
  
  return NextResponse.json({
    status: 'ok',
    service: 'azure-tts',
    hasCredentials,
    voice: process.env.AZURE_SPEECH_VOICE || 'zh-CN-XiaoxiaoNeural',
    region: process.env.AZURE_SPEECH_REGION,
    timestamp: new Date().toISOString()
  });
}