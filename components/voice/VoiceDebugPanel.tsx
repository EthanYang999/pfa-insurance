'use client';

import { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import type { VoiceEvent, VoiceDebugInfo } from '@/types/voice';

interface LogEntry {
  id: string;
  timestamp: number;
  level: 'info' | 'warn' | 'error' | 'debug';
  category: string;
  message: string;
  data?: any;
}

export default function VoiceDebugPanel() {
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [debugInfo, setDebugInfo] = useState<Partial<VoiceDebugInfo>>({});
  const [isMonitoring, setIsMonitoring] = useState(false);
  const [testText, setTestText] = useState('你好，这是语音合成测试。');
  const [isTestingTTS, setIsTestingTTS] = useState(false);
  const [audioContext, setAudioContext] = useState<AudioContext | null>(null);
  const logIdCounter = useRef(0);

  // 添加日志条目
  const addLog = (
    level: LogEntry['level'], 
    category: string, 
    message: string, 
    data?: any
  ) => {
    const logEntry: LogEntry = {
      id: `log-${++logIdCounter.current}`,
      timestamp: Date.now(),
      level,
      category,
      message,
      data
    };
    
    setLogs(prev => [logEntry, ...prev.slice(0, 99)]); // 保持最新100条日志
  };

  // 清空日志
  const clearLogs = () => {
    setLogs([]);
    addLog('info', 'System', '日志已清空');
  };

  // 更新调试信息
  const updateDebugInfo = () => {
    const info: Partial<VoiceDebugInfo> = {
      vadEnabled: false, // 这些值在实际语音组件中会被更新
      recognitionActive: false,
      audioContextState: audioContext?.state || 'suspended',
      currentQueue: [],
      performanceMetrics: {
        recognitionLatency: 0,
        ttsLatency: 0,
        totalResponseTime: 0
      }
    };
    
    setDebugInfo(info);
    addLog('debug', 'Debug', '调试信息已更新', info);
  };

  // 测试TTS功能
  const testTTS = async () => {
    if (!testText.trim()) {
      addLog('warn', 'TTS', '测试文本不能为空');
      return;
    }

    setIsTestingTTS(true);
    addLog('info', 'TTS', `开始测试语音合成: ${testText.substring(0, 30)}...`);
    
    const startTime = Date.now();
    
    try {
      const response = await fetch('/api/voice/tts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: testText })
      });

      const responseTime = Date.now() - startTime;
      addLog('info', 'TTS', `API响应时间: ${responseTime}ms`);

      if (response.ok) {
        const audioData = await response.arrayBuffer();
        addLog('info', 'TTS', `音频数据大小: ${audioData.byteLength} bytes`);

        // 播放音频
        if (!audioContext) {
          const ctx = new AudioContext();
          setAudioContext(ctx);
        }

        const currentContext = audioContext || new AudioContext();
        const audioBuffer = await currentContext.decodeAudioData(audioData);
        
        addLog('info', 'TTS', `音频时长: ${audioBuffer.duration.toFixed(2)}秒`);

        const source = currentContext.createBufferSource();
        source.buffer = audioBuffer;
        source.connect(currentContext.destination);
        
        source.onended = () => {
          addLog('info', 'TTS', '音频播放完成');
          setIsTestingTTS(false);
        };
        
        source.start(0);
        addLog('info', 'TTS', '开始播放音频');

      } else {
        const errorText = await response.text();
        addLog('error', 'TTS', `API调用失败: ${response.status} ${response.statusText}`, errorText);
      }
    } catch (error: any) {
      addLog('error', 'TTS', `TTS测试异常: ${error.message}`);
    } finally {
      if (!audioContext) { // 只有在没有播放音频时才设为false
        setIsTestingTTS(false);
      }
    }
  };

  // 测试浏览器语音识别
  const testSpeechRecognition = () => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    
    if (!SpeechRecognition) {
      addLog('error', 'STT', '浏览器不支持语音识别');
      return;
    }

    addLog('info', 'STT', '开始语音识别测试（请说话）');
    
    const recognition = new SpeechRecognition();
    recognition.lang = 'zh-CN';
    recognition.interimResults = true;
    
    recognition.onstart = () => {
      addLog('info', 'STT', '语音识别已启动');
    };
    
    recognition.onresult = (event: SpeechRecognitionEvent) => {
      const result = event.results[event.results.length - 1];
      const transcript = result[0].transcript;
      const confidence = result[0].confidence;
      
      addLog('info', 'STT', `识别结果: "${transcript}" (置信度: ${(confidence * 100).toFixed(1)}%)`);
    };
    
    recognition.onerror = (event: any) => {
      addLog('error', 'STT', `语音识别错误: ${event.error}`);
    };
    
    recognition.onend = () => {
      addLog('info', 'STT', '语音识别结束');
    };
    
    recognition.start();
  };

  // 获取系统信息
  const getSystemInfo = () => {
    const info = {
      userAgent: navigator.userAgent,
      language: navigator.language,
      platform: navigator.platform,
      cookieEnabled: navigator.cookieEnabled,
      onLine: navigator.onLine,
      screen: {
        width: screen.width,
        height: screen.height,
        colorDepth: screen.colorDepth
      },
      location: {
        protocol: window.location.protocol,
        host: window.location.host
      }
    };
    
    addLog('info', 'System', '系统信息已获取', info);
  };

  // 日志级别样式
  const getLevelBadge = (level: LogEntry['level']) => {
    switch (level) {
      case 'error':
        return <Badge className="bg-red-100 text-red-700">ERROR</Badge>;
      case 'warn':
        return <Badge className="bg-yellow-100 text-yellow-700">WARN</Badge>;
      case 'info':
        return <Badge className="bg-blue-100 text-blue-700">INFO</Badge>;
      case 'debug':
        return <Badge className="bg-gray-100 text-gray-700">DEBUG</Badge>;
      default:
        return <Badge variant="secondary">{level.toUpperCase()}</Badge>;
    }
  };

  // 格式化时间戳
  const formatTimestamp = (timestamp: number): string => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString('zh-CN', { 
      hour12: false, 
      hour: '2-digit', 
      minute: '2-digit', 
      second: '2-digit', 
      fractionalSecondDigits: 3 
    });
  };

  // 初始化
  useEffect(() => {
    addLog('info', 'System', '调试面板已启动');
    updateDebugInfo();
  }, []);

  return (
    <div className="space-y-4">
      
      {/* 调试控制面板 */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            🔧 语音调试工具
          </CardTitle>
          <CardDescription>
            实时监控语音交互过程，测试各项功能和性能
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="testing" className="w-full">
            
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="testing">功能测试</TabsTrigger>
              <TabsTrigger value="monitoring">实时监控</TabsTrigger>
              <TabsTrigger value="system">系统信息</TabsTrigger>
            </TabsList>
            
            <TabsContent value="testing" className="space-y-4">
              {/* TTS测试 */}
              <div className="space-y-2">
                <label className="text-sm font-medium">TTS语音合成测试</label>
                <div className="flex gap-2">
                  <Textarea
                    value={testText}
                    onChange={(e) => setTestText(e.target.value)}
                    placeholder="输入要合成的文本..."
                    className="flex-1"
                    rows={2}
                  />
                  <Button 
                    onClick={testTTS} 
                    disabled={isTestingTTS}
                    className="self-start"
                  >
                    {isTestingTTS ? '测试中...' : '测试TTS'}
                  </Button>
                </div>
              </div>

              {/* 其他测试按钮 */}
              <div className="flex gap-2 flex-wrap">
                <Button 
                  variant="outline" 
                  onClick={testSpeechRecognition}
                >
                  测试语音识别
                </Button>
                <Button 
                  variant="outline" 
                  onClick={getSystemInfo}
                >
                  获取系统信息
                </Button>
                <Button 
                  variant="outline" 
                  onClick={updateDebugInfo}
                >
                  刷新调试信息
                </Button>
              </div>
            </TabsContent>
            
            <TabsContent value="monitoring" className="space-y-4">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="text-center p-3 border rounded">
                  <div className="font-semibold">VAD状态</div>
                  <div className="text-sm text-muted-foreground">
                    {debugInfo.vadEnabled ? '✓ 活跃' : '○ 停止'}
                  </div>
                </div>
                <div className="text-center p-3 border rounded">
                  <div className="font-semibold">语音识别</div>
                  <div className="text-sm text-muted-foreground">
                    {debugInfo.recognitionActive ? '🎤 录音中' : '○ 空闲'}
                  </div>
                </div>
                <div className="text-center p-3 border rounded">
                  <div className="font-semibold">音频上下文</div>
                  <div className="text-sm text-muted-foreground">
                    {debugInfo.audioContextState || 'suspended'}
                  </div>
                </div>
                <div className="text-center p-3 border rounded">
                  <div className="font-semibold">播放队列</div>
                  <div className="text-sm text-muted-foreground">
                    {debugInfo.currentQueue?.length || 0} 项
                  </div>
                </div>
              </div>
              
              {debugInfo.performanceMetrics && (
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm">性能指标</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>识别延迟:</span>
                      <span>{debugInfo.performanceMetrics.recognitionLatency}ms</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span>TTS延迟:</span>
                      <span>{debugInfo.performanceMetrics.ttsLatency}ms</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span>总响应时间:</span>
                      <span>{debugInfo.performanceMetrics.totalResponseTime}ms</span>
                    </div>
                  </CardContent>
                </Card>
              )}
            </TabsContent>
            
            <TabsContent value="system" className="space-y-4">
              <div className="text-sm space-y-2">
                <p><strong>浏览器:</strong> {navigator.userAgent}</p>
                <p><strong>语言:</strong> {navigator.language}</p>
                <p><strong>在线状态:</strong> {navigator.onLine ? '在线' : '离线'}</p>
                <p><strong>协议:</strong> {window.location.protocol}</p>
                <p><strong>主机:</strong> {window.location.host}</p>
              </div>
            </TabsContent>
            
          </Tabs>
        </CardContent>
      </Card>

      {/* 实时日志 */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle className="text-lg">📝 实时日志</CardTitle>
            <CardDescription>显示最近的100条调试日志</CardDescription>
          </div>
          <Button variant="outline" size="sm" onClick={clearLogs}>
            清空日志
          </Button>
        </CardHeader>
        <CardContent>
          <div className="max-h-96 overflow-y-auto space-y-2 font-mono text-sm">
            {logs.length === 0 ? (
              <div className="text-center text-muted-foreground py-8">
                暂无日志记录
              </div>
            ) : (
              logs.map((log) => (
                <div key={log.id} className="flex items-start gap-2 p-2 border-b">
                  <span className="text-muted-foreground text-xs whitespace-nowrap">
                    {formatTimestamp(log.timestamp)}
                  </span>
                  {getLevelBadge(log.level)}
                  <span className="text-xs text-muted-foreground min-w-[60px]">
                    [{log.category}]
                  </span>
                  <div className="flex-1">
                    <div>{log.message}</div>
                    {log.data && (
                      <details className="mt-1">
                        <summary className="text-xs cursor-pointer text-muted-foreground">
                          详细数据
                        </summary>
                        <pre className="mt-1 p-2 bg-muted rounded text-xs overflow-auto max-h-32">
                          {JSON.stringify(log.data, null, 2)}
                        </pre>
                      </details>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}