'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import type { ConnectivityTestResult } from '@/types/voice';

interface TestState {
  isRunning: boolean;
  results: ConnectivityTestResult[];
  currentTest: string | null;
  progress: number;
}

export default function ConnectivityTest() {
  const [testState, setTestState] = useState<TestState>({
    isRunning: false,
    results: [],
    currentTest: null,
    progress: 0
  });

  const testServices = ['azure_tts', 'dify_stream', 'vad_model'];

  const runConnectivityTest = async () => {
    setTestState({
      isRunning: true,
      results: [],
      currentTest: null,
      progress: 0
    });

    try {
      for (let i = 0; i < testServices.length; i++) {
        const service = testServices[i];
        setTestState(prev => ({
          ...prev,
          currentTest: getServiceDisplayName(service),
          progress: (i / testServices.length) * 100
        }));

        // 调用测试API
        const response = await fetch('/api/voice/test', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ services: [service] })
        });

        if (response.ok) {
          const data = await response.json();
          const result = data.results[0];
          
          setTestState(prev => ({
            ...prev,
            results: [...prev.results, result]
          }));
        } else {
          // 处理API调用失败
          const errorResult: ConnectivityTestResult = {
            service: service as any,
            status: 'error',
            error: `API调用失败: ${response.status} ${response.statusText}`
          };
          
          setTestState(prev => ({
            ...prev,
            results: [...prev.results, errorResult]
          }));
        }

        // 添加延迟以显示进度
        await new Promise(resolve => setTimeout(resolve, 500));
      }

      setTestState(prev => ({
        ...prev,
        isRunning: false,
        currentTest: null,
        progress: 100
      }));

    } catch (error: any) {
      console.error('连通性测试异常:', error);
      setTestState(prev => ({
        ...prev,
        isRunning: false,
        currentTest: null,
        progress: 100
      }));
    }
  };

  const getServiceDisplayName = (service: string): string => {
    switch (service) {
      case 'azure_tts': return 'Azure TTS语音合成';
      case 'dify_stream': return 'Dify流式API';
      case 'vad_model': return 'VAD语音检测模型';
      default: return service;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'success':
        return <Badge className="bg-green-100 text-green-700">✓ 正常</Badge>;
      case 'error':
        return <Badge className="bg-red-100 text-red-700">✗ 异常</Badge>;
      case 'timeout':
        return <Badge className="bg-yellow-100 text-yellow-700">⏱ 超时</Badge>;
      default:
        return <Badge variant="secondary">未知</Badge>;
    }
  };

  const getServiceIcon = (service: string): string => {
    switch (service) {
      case 'azure_tts': return '🔊';
      case 'dify_stream': return '🌊';
      case 'vad_model': return '🎤';
      default: return '🔧';
    }
  };

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            🔗 服务连通性测试
          </CardTitle>
          <CardDescription>
            检查语音交互所依赖的各项服务的连接状态和响应时间
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          
          {/* 测试控制 */}
          <div className="flex items-center justify-between">
            <div className="text-sm text-muted-foreground">
              {testState.isRunning 
                ? `正在测试: ${testState.currentTest}` 
                : '点击开始测试服务连通性'
              }
            </div>
            <Button 
              onClick={runConnectivityTest} 
              disabled={testState.isRunning}
            >
              {testState.isRunning ? '测试中...' : '开始测试'}
            </Button>
          </div>

          {/* 进度条 */}
          {testState.isRunning && (
            <Progress value={testState.progress} className="w-full" />
          )}

          {/* 测试结果 */}
          <div className="space-y-3">
            {testState.results.map((result, index) => (
              <div key={index} className="border rounded-lg p-4">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <span className="text-xl">{getServiceIcon(result.service)}</span>
                    <span className="font-medium">{getServiceDisplayName(result.service)}</span>
                  </div>
                  {getStatusBadge(result.status)}
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-2 text-sm text-muted-foreground">
                  <div>
                    <strong>响应时间:</strong> {result.responseTime ? `${result.responseTime}ms` : 'N/A'}
                  </div>
                  {result.error && (
                    <div className="md:col-span-2">
                      <strong>错误信息:</strong> {result.error}
                    </div>
                  )}
                </div>
                
                {result.details && (
                  <details className="mt-2">
                    <summary className="text-sm cursor-pointer text-muted-foreground hover:text-foreground">
                      详细信息
                    </summary>
                    <pre className="mt-2 p-2 bg-muted rounded text-xs overflow-auto">
                      {JSON.stringify(result.details, null, 2)}
                    </pre>
                  </details>
                )}
              </div>
            ))}
          </div>

          {/* 测试总结 */}
          {testState.results.length > 0 && !testState.isRunning && (
            <Card className="bg-muted/50">
              <CardContent className="pt-4">
                <div className="grid grid-cols-3 gap-4 text-center">
                  <div>
                    <div className="text-2xl font-bold text-green-600">
                      {testState.results.filter(r => r.status === 'success').length}
                    </div>
                    <div className="text-sm text-muted-foreground">成功</div>
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-red-600">
                      {testState.results.filter(r => r.status === 'error').length}
                    </div>
                    <div className="text-sm text-muted-foreground">失败</div>
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-blue-600">
                      {testState.results.reduce((sum, r) => sum + (r.responseTime || 0), 0) / testState.results.length | 0}ms
                    </div>
                    <div className="text-sm text-muted-foreground">平均响应</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

        </CardContent>
      </Card>

      {/* 故障排除建议 */}
      <Card>
        <CardHeader>
          <CardTitle className="text-sm">🔧 故障排除</CardTitle>
        </CardHeader>
        <CardContent className="text-sm space-y-2">
          <p><strong>Azure TTS异常:</strong> 检查.env文件中的AZURE_SPEECH_KEY和AZURE_SPEECH_REGION配置</p>
          <p><strong>Dify API异常:</strong> 验证DIFY_API_KEY和DIFY_API_URL是否正确</p>
          <p><strong>VAD模型异常:</strong> 检查网络连接和CORS设置</p>
          <p><strong>响应时间过长:</strong> 可能是网络延迟或服务器负载过高</p>
        </CardContent>
      </Card>
    </div>
  );
}