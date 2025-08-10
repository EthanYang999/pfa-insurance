'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import type { BrowserCapabilities } from '@/types/voice';

interface CapabilityTest {
  name: string;
  key: keyof BrowserCapabilities;
  icon: string;
  description: string;
  testFunction: () => Promise<boolean>;
}

export default function BrowserCapabilityTest() {
  const [capabilities, setCapabilities] = useState<BrowserCapabilities>({
    hasSpeechRecognition: false,
    hasWebAudio: false,
    hasUserMedia: false,
    hasVADSupport: false,
    browserName: '',
    isSupported: false
  });

  const [isRunning, setIsRunning] = useState(false);
  const [progress, setProgress] = useState(0);
  const [currentTest, setCurrentTest] = useState<string | null>(null);
  const [testResults, setTestResults] = useState<Record<string, boolean>>({});

  // 检测浏览器类型
  const detectBrowser = (): string => {
    const userAgent = navigator.userAgent;
    if (userAgent.includes('Chrome') && !userAgent.includes('Edg')) return 'Chrome';
    if (userAgent.includes('Edg')) return 'Edge';
    if (userAgent.includes('Firefox')) return 'Firefox';
    if (userAgent.includes('Safari') && !userAgent.includes('Chrome')) return 'Safari';
    return 'Unknown';
  };

  // 定义各项能力测试
  const capabilityTests: CapabilityTest[] = [
    {
      name: '语音识别 (SpeechRecognition)',
      key: 'hasSpeechRecognition',
      icon: '🎤',
      description: '检查浏览器是否支持Web Speech API语音识别',
      testFunction: async () => {
        return !!(window.SpeechRecognition || window.webkitSpeechRecognition);
      }
    },
    {
      name: 'Web Audio API',
      key: 'hasWebAudio',
      icon: '🔊',
      description: '检查是否支持音频播放和处理',
      testFunction: async () => {
        try {
          const audioContext = new (window.AudioContext || window.webkitAudioContext)();
          audioContext.close();
          return true;
        } catch {
          return false;
        }
      }
    },
    {
      name: '麦克风访问 (getUserMedia)',
      key: 'hasUserMedia',
      icon: '🎙️',
      description: '检查是否可以访问麦克风设备',
      testFunction: async () => {
        try {
          if (!navigator.mediaDevices?.getUserMedia) return false;
          
          const stream = await navigator.mediaDevices.getUserMedia({ 
            audio: true 
          });
          
          // 立即关闭流以释放资源
          stream.getTracks().forEach(track => track.stop());
          return true;
        } catch {
          return false;
        }
      }
    },
    {
      name: 'VAD模型支持',
      key: 'hasVADSupport',
      icon: '🧠',
      description: '检查是否支持语音活动检测模型加载',
      testFunction: async () => {
        try {
          // 检查是否支持WebAssembly（VAD模型需要）
          if (typeof WebAssembly !== 'object') return false;
          
          // 检查是否支持AudioWorklet（VAD需要）
          if (!window.AudioWorkletNode) return false;
          
          // 检查网络连接（模型需要从CDN下载）
          const response = await fetch('https://cdn.jsdelivr.net/npm/@ricky0123/vad-web@0.0.24/dist/silero_vad.onnx', {
            method: 'HEAD',
            mode: 'no-cors'  // 避免CORS问题
          });
          
          return true; // no-cors模式下无法检查真实状态，假设可访问
        } catch {
          return false;
        }
      }
    }
  ];

  // 运行单个能力测试
  const runSingleTest = async (test: CapabilityTest): Promise<boolean> => {
    try {
      setCurrentTest(test.name);
      const result = await test.testFunction();
      
      setTestResults(prev => ({
        ...prev,
        [test.key]: result
      }));
      
      return result;
    } catch (error) {
      console.error(`${test.name} 测试失败:`, error);
      setTestResults(prev => ({
        ...prev,
        [test.key]: false
      }));
      return false;
    }
  };

  // 运行所有能力测试
  const runCapabilityTests = async () => {
    setIsRunning(true);
    setProgress(0);
    setTestResults({});
    
    const browserName = detectBrowser();
    const newCapabilities: BrowserCapabilities = {
      browserName,
      hasSpeechRecognition: false,
      hasWebAudio: false,
      hasUserMedia: false,
      hasVADSupport: false,
      isSupported: false
    };

    for (let i = 0; i < capabilityTests.length; i++) {
      const test = capabilityTests[i];
      const result = await runSingleTest(test);
      
      newCapabilities[test.key] = result;
      setProgress(((i + 1) / capabilityTests.length) * 100);
      
      // 添加延迟以显示进度
      await new Promise(resolve => setTimeout(resolve, 300));
    }

    // 计算整体支持状态
    newCapabilities.isSupported = 
      newCapabilities.hasSpeechRecognition && 
      newCapabilities.hasWebAudio && 
      newCapabilities.hasUserMedia;

    setCapabilities(newCapabilities);
    setCurrentTest(null);
    setIsRunning(false);
  };

  // 获取状态徽章
  const getStatusBadge = (supported: boolean, tested: boolean = true) => {
    if (!tested) return <Badge variant="secondary">未测试</Badge>;
    
    return supported 
      ? <Badge className="bg-green-100 text-green-700">✓ 支持</Badge>
      : <Badge className="bg-red-100 text-red-700">✗ 不支持</Badge>;
  };

  // 获取整体状态
  const getOverallStatus = () => {
    if (Object.keys(testResults).length === 0) {
      return { status: 'untested', color: 'secondary', text: '未测试' };
    }
    
    if (capabilities.isSupported) {
      return { status: 'supported', color: 'green', text: '完全支持' };
    }
    
    const supportedCount = Object.values(testResults).filter(Boolean).length;
    const totalCount = capabilityTests.length;
    
    if (supportedCount >= totalCount - 1) {
      return { status: 'partial', color: 'yellow', text: '基本支持' };
    }
    
    return { status: 'unsupported', color: 'red', text: '不支持' };
  };

  const overallStatus = getOverallStatus();

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            🌐 浏览器能力检测
          </CardTitle>
          <CardDescription>
            检查当前浏览器对语音交互功能的支持程度
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          
          {/* 整体状态 */}
          <div className="flex items-center justify-between p-4 border rounded-lg">
            <div className="flex items-center gap-3">
              <div className="text-2xl">🖥️</div>
              <div>
                <div className="font-semibold">
                  {capabilities.browserName || '未知浏览器'}
                </div>
                <div className="text-sm text-muted-foreground">
                  语音交互兼容性状态
                </div>
              </div>
            </div>
            <div className="text-right">
              <Badge 
                className={
                  overallStatus.color === 'green' ? 'bg-green-100 text-green-700' :
                  overallStatus.color === 'yellow' ? 'bg-yellow-100 text-yellow-700' :
                  overallStatus.color === 'red' ? 'bg-red-100 text-red-700' :
                  'bg-gray-100 text-gray-700'
                }
              >
                {overallStatus.text}
              </Badge>
            </div>
          </div>

          {/* 测试控制 */}
          <div className="flex items-center justify-between">
            <div className="text-sm text-muted-foreground">
              {isRunning 
                ? `正在检测: ${currentTest}` 
                : '点击开始检测浏览器能力'
              }
            </div>
            <Button 
              onClick={runCapabilityTests} 
              disabled={isRunning}
            >
              {isRunning ? '检测中...' : '开始检测'}
            </Button>
          </div>

          {/* 进度条 */}
          {isRunning && (
            <Progress value={progress} className="w-full" />
          )}

          {/* 详细测试结果 */}
          <div className="space-y-3">
            {capabilityTests.map((test, index) => (
              <div key={test.key} className="border rounded-lg p-4">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <span className="text-xl">{test.icon}</span>
                    <span className="font-medium">{test.name}</span>
                  </div>
                  {getStatusBadge(
                    testResults[test.key] || false, 
                    test.key in testResults
                  )}
                </div>
                
                <p className="text-sm text-muted-foreground">
                  {test.description}
                </p>
                
                {test.key in testResults && !testResults[test.key] && (
                  <div className="mt-2 p-2 bg-red-50 rounded text-sm text-red-700">
                    ⚠️ 此功能不可用，可能影响语音交互体验
                  </div>
                )}
              </div>
            ))}
          </div>

        </CardContent>
      </Card>

      {/* 建议和兼容性信息 */}
      <Card>
        <CardHeader>
          <CardTitle className="text-sm">💡 兼容性建议</CardTitle>
        </CardHeader>
        <CardContent className="text-sm space-y-2">
          <p><strong>推荐浏览器:</strong> Chrome 25+, Edge 79+, Safari 14.1+ (移动端)</p>
          <p><strong>语音识别:</strong> 主要支持Chrome系浏览器，Firefox和Safari支持有限</p>
          <p><strong>麦克风权限:</strong> 需要用户手动授权，建议使用HTTPS协议</p>
          <p><strong>最佳体验:</strong> 建议使用最新版本的Chrome或Edge浏览器</p>
          {overallStatus.status === 'unsupported' && (
            <div className="mt-3 p-3 bg-red-50 rounded border-l-4 border-red-400">
              <p className="text-red-700 font-medium">
                ⚠️ 当前浏览器不支持语音交互功能，请升级浏览器或使用Chrome/Edge
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}