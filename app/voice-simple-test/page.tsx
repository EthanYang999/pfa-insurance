'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import SimpleVoiceButton from '@/components/voice/SimpleVoiceButton';

export default function SimpleVoiceTestPage() {
  const [transcript, setTranscript] = useState('');
  const [aiResponse, setAiResponse] = useState('');
  
  const handleUserSpeech = (text: string) => {
    console.log('用户语音输入:', text);
    setTranscript(text);
    
    // 模拟AI回复
    const responses = [
      '您好！我听到您说了："' + text + '"',
      '这是一个语音测试回复。',
      '语音功能工作正常！'
    ];
    const response = responses[Math.floor(Math.random() * responses.length)];
    setAiResponse(response);
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto space-y-6">
        
        {/* 页面头部 */}
        <div className="text-center space-y-4">
          <h1 className="text-4xl font-bold">简化语音功能测试</h1>
          <p className="text-lg text-muted-foreground">
            测试不依赖VAD的手动语音识别功能
          </p>
        </div>

        {/* 语音测试卡片 */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              🎤 语音交互测试
            </CardTitle>
            <CardDescription>
              点击麦克风按钮开始，然后点击&ldquo;开始说话&rdquo;进行语音识别
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            
            {/* 语音按钮 */}
            <div className="flex justify-center">
              <SimpleVoiceButton 
                onUserSpeech={handleUserSpeech}
                onStatusChange={(status) => {
                  console.log('语音状态变化:', status);
                }}
                className="scale-150"
              />
            </div>

            {/* 对话内容显示 */}
            <div className="space-y-4">
              {transcript && (
                <div className="p-4 bg-blue-50 rounded-lg border-l-4 border-blue-400">
                  <div className="font-medium text-blue-900 mb-2">🗣️ 您说：</div>
                  <div className="text-blue-800">{transcript}</div>
                </div>
              )}
              
              {aiResponse && (
                <div className="p-4 bg-purple-50 rounded-lg border-l-4 border-purple-400">
                  <div className="font-medium text-purple-900 mb-2">🤖 AI回复：</div>
                  <div className="text-purple-800">{aiResponse}</div>
                </div>
              )}
            </div>

            {/* 使用说明 */}
            <div className="text-sm text-muted-foreground space-y-2 border-t pt-4">
              <h3 className="font-medium text-foreground">使用步骤：</h3>
              <ol className="list-decimal list-inside space-y-1">
                <li>点击麦克风图标启动语音功能</li>
                <li>看到&ldquo;开始说话&rdquo;按钮后，点击它</li>
                <li>开始清晰地说话</li>
                <li>说完后等待识别结果</li>
                <li>查看AI的语音回复</li>
              </ol>
              
              <div className="mt-3 p-2 bg-amber-50 rounded border">
                <strong className="text-amber-800">注意：</strong>
                <span className="text-amber-700 text-xs">
                  此版本使用手动触发模式，不依赖VAD自动检测，兼容性更好。
                </span>
              </div>
            </div>

          </CardContent>
        </Card>

        {/* 浏览器兼容性信息 */}
        <Card>
          <CardHeader>
            <CardTitle className="text-sm">🌐 浏览器兼容性</CardTitle>
          </CardHeader>
          <CardContent className="text-sm space-y-2">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
              <div>✅ Chrome 25+ (推荐)</div>
              <div>✅ Edge 79+</div>
              <div>⚠️ Safari 14.1+ (功能有限)</div>
              <div>❌ Firefox (不支持)</div>
            </div>
            <p className="text-xs text-muted-foreground mt-2">
              最佳体验请使用最新版 Chrome 或 Edge 浏览器
            </p>
          </CardContent>
        </Card>

      </div>
    </div>
  );
}