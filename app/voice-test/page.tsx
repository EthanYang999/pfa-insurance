'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';

// 测试组件
import ConnectivityTest from '@/components/voice/ConnectivityTest';
import BrowserCapabilityTest from '@/components/voice/BrowserCapabilityTest';
import VoiceDebugPanel from '@/components/voice/VoiceDebugPanel';

export default function VoiceTestPage() {
  const [activeTab, setActiveTab] = useState('overview');
  
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-6xl mx-auto space-y-6">
        
        {/* 页面头部 */}
        <div className="text-center space-y-4">
          <h1 className="text-4xl font-bold">语音交互测试中心</h1>
          <p className="text-lg text-muted-foreground">
            验证语音助手的各项功能和连接状态
          </p>
          <div className="flex justify-center gap-2">
            <Badge variant="outline">Azure TTS</Badge>
            <Badge variant="outline">VAD检测</Badge>
            <Badge variant="outline">Dify流式</Badge>
            <Badge variant="outline">Web Audio</Badge>
          </div>
        </div>

        {/* 快速状态概览 */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              🎯 系统状态概览
            </CardTitle>
            <CardDescription>
              语音交互系统各组件的整体状态
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center p-4 border rounded-lg">
                <div className="text-2xl mb-2">🎤</div>
                <div className="font-semibold">语音识别</div>
                <Badge variant="secondary">待检测</Badge>
              </div>
              <div className="text-center p-4 border rounded-lg">
                <div className="text-2xl mb-2">🔊</div>
                <div className="font-semibold">语音合成</div>
                <Badge variant="secondary">待检测</Badge>
              </div>
              <div className="text-center p-4 border rounded-lg">
                <div className="text-2xl mb-2">🌊</div>
                <div className="font-semibold">流式输出</div>
                <Badge variant="secondary">待检测</Badge>
              </div>
              <div className="text-center p-4 border rounded-lg">
                <div className="text-2xl mb-2">🎧</div>
                <div className="font-semibold">音频播放</div>
                <Badge variant="secondary">待检测</Badge>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* 测试功能标签页 */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="overview">总览</TabsTrigger>
            <TabsTrigger value="connectivity">连通性</TabsTrigger>
            <TabsTrigger value="browser">浏览器</TabsTrigger>
            <TabsTrigger value="debug">调试</TabsTrigger>
          </TabsList>
          
          <TabsContent value="overview" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>测试指引</CardTitle>
                <CardDescription>
                  按照以下步骤完成语音交互功能的完整测试
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid gap-4">
                  <div className="flex items-start gap-3 p-4 border rounded-lg">
                    <div className="bg-blue-100 text-blue-600 rounded-full w-8 h-8 flex items-center justify-center font-bold">1</div>
                    <div>
                      <h3 className="font-semibold">浏览器能力检测</h3>
                      <p className="text-sm text-muted-foreground">
                        检查浏览器是否支持语音识别、音频播放等必要功能
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-start gap-3 p-4 border rounded-lg">
                    <div className="bg-green-100 text-green-600 rounded-full w-8 h-8 flex items-center justify-center font-bold">2</div>
                    <div>
                      <h3 className="font-semibold">服务连通性测试</h3>
                      <p className="text-sm text-muted-foreground">
                        验证Azure TTS、Dify API、VAD模型的网络连接状态
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-start gap-3 p-4 border rounded-lg">
                    <div className="bg-orange-100 text-orange-600 rounded-full w-8 h-8 flex items-center justify-center font-bold">3</div>
                    <div>
                      <h3 className="font-semibold">调试和监控</h3>
                      <p className="text-sm text-muted-foreground">
                        使用调试面板监控语音交互过程中的详细信息
                      </p>
                    </div>
                  </div>
                </div>
                
                <div className="pt-4 border-t">
                  <Button 
                    onClick={() => setActiveTab('browser')} 
                    className="w-full"
                  >
                    开始测试 🚀
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="connectivity" className="space-y-4">
            <ConnectivityTest />
          </TabsContent>
          
          <TabsContent value="browser" className="space-y-4">
            <BrowserCapabilityTest />
          </TabsContent>
          
          <TabsContent value="debug" className="space-y-4">
            <VoiceDebugPanel />
          </TabsContent>
        </Tabs>

        {/* 帮助信息 */}
        <Card>
          <CardHeader>
            <CardTitle className="text-sm">💡 提示</CardTitle>
          </CardHeader>
          <CardContent className="text-sm text-muted-foreground space-y-2">
            <p>• 建议使用最新版本的 Chrome 或 Edge 浏览器进行测试</p>
            <p>• 语音识别需要麦克风权限，请在浏览器提示时允许访问</p>
            <p>• 如果遇到问题，可以查看调试面板中的详细错误信息</p>
            <p>• 测试完成后可以返回主应用进行实际语音交互体验</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}