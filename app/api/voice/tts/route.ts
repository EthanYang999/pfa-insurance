import { NextRequest, NextResponse } from 'next/server';
import * as SpeechSDK from 'microsoft-cognitiveservices-speech-sdk';
import type { TTSRequest, TTSResponse } from '@/types/voice';

export const runtime = 'nodejs';

// TTS缓存 - 避免重复合成相同文本
const ttsCache = new Map<string, { data: ArrayBuffer; timestamp: number }>();
const CACHE_DURATION = 5 * 60 * 1000; // 5分钟缓存

// 清理过期缓存
const cleanExpiredCache = () => {
  const now = Date.now();
  for (const [key, value] of ttsCache.entries()) {
    if (now - value.timestamp > CACHE_DURATION) {
      ttsCache.delete(key);
    }
  }
};

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

    // 文本长度限制
    if (text.length > 1000) {
      const errorResponse: TTSResponse = { 
        error: '文本长度超出限制(最大1000字符)' 
      };
      return NextResponse.json(errorResponse, { status: 400 });
    }

    // 生成缓存键
    const cacheKey = `${text.trim()}_${voice}_${rate}_${pitch}`;
    
    // 清理过期缓存
    cleanExpiredCache();
    
    // 检查缓存
    const cachedResult = ttsCache.get(cacheKey);
    if (cachedResult) {
      console.log('TTS缓存命中:', { 
        text: text.substring(0, 30) + '...',
        cacheSize: cachedResult.data.byteLength 
      });
      return new NextResponse(cachedResult.data, {
        headers: {
          'Content-Type': 'audio/mpeg',
          'Cache-Control': 'public, max-age=300',
          'X-Cache-Status': 'HIT',
          'Access-Control-Allow-Origin': '*'
        }
      });
    }

    console.log('TTS请求:', { 
      text: text.substring(0, 50) + (text.length > 50 ? '...' : ''),
      voice,
      textLength: text.length,
      cacheKey: cacheKey.substring(0, 50) + '...'
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
    const startTime = Date.now();
    const audioData: ArrayBuffer = await new Promise((resolve, reject) => {
      // 设置超时
      const timeout = setTimeout(() => {
        synthesizer.close();
        reject(new Error('TTS合成超时(30秒)'));
      }, 30000);

      synthesizer.speakSsmlAsync(
        ssml,
        result => {
          clearTimeout(timeout);
          if (result.reason === SpeechSDK.ResultReason.SynthesizingAudioCompleted) {
            const duration = Date.now() - startTime;
            console.log('TTS合成成功:', {
              audioSize: result.audioData.byteLength,
              duration: duration + 'ms',
              textLength: text.length
            });
            resolve(result.audioData);
          } else {
            const errorDetails = `语音合成失败: ${result.reason}. 错误: ${result.errorDetails}`;
            console.error(errorDetails);
            reject(new Error(errorDetails));
          }
          synthesizer.close();
        },
        error => {
          clearTimeout(timeout);
          console.error('TTS合成异常:', error);
          reject(error);
          synthesizer.close();
        }
      );
    });

    // 缓存结果
    if (audioData.byteLength > 0) {
      ttsCache.set(cacheKey, {
        data: audioData,
        timestamp: Date.now()
      });
      
      // 限制缓存大小（最多100个条目）
      if (ttsCache.size > 100) {
        const firstKey = ttsCache.keys().next().value;
        ttsCache.delete(firstKey);
      }
    }

    // 返回音频数据
    return new NextResponse(audioData, {
      headers: {
        'Content-Type': 'audio/mpeg',
        'Cache-Control': 'public, max-age=300',
        'X-Cache-Status': 'MISS',
        'X-Synthesis-Time': (Date.now() - startTime).toString(),
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