'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Mic, MicOff, Volume2, VolumeX, Square, Play } from 'lucide-react';

import { createVADManager, type VADManager, type VADState } from '@/lib/voice/vad-manager';
import { createAudioManager, type AudioManager, type AudioManagerState } from '@/lib/voice/audio-manager';
import type { VoiceStatus, VoiceState, DifyStreamEvent } from '@/types/voice';

interface VoiceInteractionProps {
  onUserSpeech?: (transcript: string) => void;
  onAISpeechStart?: () => void;
  onAISpeechEnd?: () => void;
  onStatusChange?: (status: VoiceStatus) => void;
  onError?: (error: string) => void;
  disabled?: boolean;
  showDebugInfo?: boolean;
}

export default function VoiceInteraction({
  onUserSpeech,
  onAISpeechStart,
  onAISpeechEnd,
  onStatusChange,
  onError,
  disabled = false,
  showDebugInfo = false
}: VoiceInteractionProps) {
  
  // 状态管理
  const [voiceState, setVoiceState] = useState<VoiceState>({
    status: 'STOPPED',
    userTranscript: '',
    aiResponse: '',
    isVADActive: false,
    isRecording: false,
    isPlaying: false
  });

  const [vadState, setVADState] = useState<VADState | null>(null);
  const [audioState, setAudioState] = useState<AudioManagerState | null>(null);

  // 引用和管理器
  const vadManagerRef = useRef<VADManager | null>(null);
  const audioManagerRef = useRef<AudioManager | null>(null);
  const recognitionRef = useRef<SpeechRecognition | null>(null);
  const textBufferRef = useRef('');
  const conversationIdRef = useRef<string>('');

  // 初始化语音识别
  const initializeSpeechRecognition = useCallback(() => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    
    if (!SpeechRecognition) {
      const error = '浏览器不支持语音识别';
      console.error(error);
      onError?.(error);
      return false;
    }

    const recognition = new SpeechRecognition();
    recognition.lang = 'zh-CN';
    recognition.interimResults = false;
    recognition.maxAlternatives = 1;

    recognition.onstart = () => {
      console.log('语音识别已启动');
      updateVoiceState({ isRecording: true });
    };

    recognition.onresult = (event: SpeechRecognitionEvent) => {
      const result = event.results[0][0];
      const transcript = result.transcript;
      const confidence = result.confidence;
      
      console.log(`语音识别结果: "${transcript}" (置信度: ${(confidence * 100).toFixed(1)}%)`);
      
      updateVoiceState({ 
        userTranscript: transcript,
        isRecording: false,
        status: 'THINKING'
      });

      onUserSpeech?.(transcript);
    };

    recognition.onerror = (event: any) => {
      const error = `语音识别错误: ${event.error}`;
      console.error(error);
      onError?.(error);
      updateVoiceState({ isRecording: false });
    };

    recognition.onend = () => {
      console.log('语音识别结束');
      updateVoiceState({ isRecording: false });
    };

    recognitionRef.current = recognition;
    return true;
  }, [onUserSpeech, onError]);

  // 初始化VAD管理器
  const initializeVAD = useCallback(async () => {
    if (vadManagerRef.current) return;

    const vadManager = createVADManager({
      onSpeechStart: () => {
        console.log('VAD: 检测到语音开始');
        
        // 如果AI正在说话，立即打断
        if (voiceState.isPlaying && audioManagerRef.current) {
          console.log('VAD: 打断AI语音');
          audioManagerRef.current.interrupt();
          updateVoiceState({ isPlaying: false });
        }

        // 启动语音识别
        if (recognitionRef.current && voiceState.status !== 'LISTENING') {
          updateVoiceState({ status: 'LISTENING' });
          try {
            recognitionRef.current.start();
          } catch (error) {
            console.warn('语音识别启动失败，可能已在运行:', error);
          }
        }
      },
      
      onSpeechEnd: () => {
        console.log('VAD: 检测到语音结束');
        // VAD结束检测，但让SpeechRecognition自己决定何时结束
      },
      
      onVADReady: () => {
        console.log('VAD: 准备就绪');
        setVadState(vadManagerRef.current!.getState());
      },
      
      onError: (error: string) => {
        console.error('VAD错误:', error);
        onError?.(`VAD错误: ${error}`);
      },
      
      onStateChange: (state: VADState) => {
        setVadState(state);
        updateVoiceState({ isVADActive: state.isRunning && !state.isPaused });
      }
    });

    vadManagerRef.current = vadManager;
    
    try {
      const initialized = await vadManager.initialize();
      if (initialized) {
        console.log('VAD管理器初始化成功');
      }
    } catch (error: any) {
      console.error('VAD管理器初始化失败:', error);
      onError?.(`VAD初始化失败: ${error.message}`);
    }
  }, [voiceState.isPlaying, voiceState.status, onError]);

  // 初始化音频管理器
  const initializeAudioManager = useCallback(() => {
    if (audioManagerRef.current) return;

    const audioManager = createAudioManager({
      onPlay: (item) => {
        console.log('音频开始播放:', item.id);
        updateVoiceState({ 
          isPlaying: true,
          status: 'SPEAKING' 
        });
        onAISpeechStart?.();
      },
      
      onComplete: (item) => {
        console.log('音频播放完成:', item.id);
      },
      
      onStop: () => {
        console.log('音频播放停止');
        updateVoiceState({ 
          isPlaying: false,
          status: 'IDLE'
        });
        onAISpeechEnd?.();
      },
      
      onError: (error: string, item) => {
        console.error('音频播放错误:', error, item);
        onError?.(`音频播放错误: ${error}`);
      },
      
      onStateChange: (state: AudioManagerState) => {
        setAudioState(state);
        updateVoiceState({ isPlaying: state.isPlaying });
        
        // 如果播放结束且队列为空，回到空闲状态
        if (!state.isPlaying && state.queueLength === 0) {
          updateVoiceState({ status: 'IDLE' });
          onAISpeechEnd?.();
        }
      }
    });

    audioManagerRef.current = audioManager;
    console.log('音频管理器初始化成功');
  }, [onAISpeechStart, onAISpeechEnd, onError]);

  // 处理Dify流式响应
  const handleDifyStream = useCallback(async (message: string) => {
    if (!message.trim()) return;

    console.log('开始处理Dify流式响应');
    updateVoiceState({ 
      status: 'SPEAKING',
      aiResponse: ''
    });

    textBufferRef.current = '';

    try {
      const response = await fetch('/api/dify-chat-stream', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: message,
          conversationId: conversationIdRef.current || undefined,
          user: 'voice-user'
        })
      });

      if (!response.body) {
        throw new Error('无法获取流式响应');
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder();

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value, { stream: true });
        const lines = chunk.split('\n');

        for (const line of lines) {
          if (line.startsWith('data: ')) {
            try {
              const jsonStr = line.slice(6).trim();
              if (!jsonStr || jsonStr === '[DONE]') continue;

              const eventData: DifyStreamEvent = JSON.parse(jsonStr);

              // 保存对话ID
              if (eventData.conversation_id) {
                conversationIdRef.current = eventData.conversation_id;
              }

              // 处理消息块
              if (eventData.event === 'message_chunk' && eventData.chunk) {
                textBufferRef.current += eventData.chunk;
                
                // 更新显示的AI回复
                updateVoiceState(prev => ({
                  aiResponse: prev.aiResponse + eventData.chunk
                }));

                // 检查是否有完整句子可以合成
                const sentences = extractCompleteSentences(textBufferRef.current);
                
                for (const sentence of sentences) {
                  if (sentence.trim() && audioManagerRef.current) {
                    console.log('添加句子到TTS队列:', sentence.substring(0, 30) + '...');
                    await audioManagerRef.current.addToQueue(sentence.trim());
                  }
                }
              }
            } catch (parseError) {
              console.warn('解析流式数据失败:', parseError);
            }
          }
        }
      }

      // 处理剩余文本
      if (textBufferRef.current.trim() && audioManagerRef.current) {
        console.log('添加剩余文本到TTS队列');
        await audioManagerRef.current.addToQueue(textBufferRef.current.trim());
      }

    } catch (error: any) {
      console.error('Dify流式处理失败:', error);
      onError?.(`流式处理失败: ${error.message}`);
      updateVoiceState({ status: 'IDLE' });
    }
  }, [onError]);

  // 提取完整句子
  const extractCompleteSentences = (text: string): string[] => {
    const sentenceEndings = /[.!?。！？]/g;
    const sentences: string[] = [];
    let lastIndex = 0;
    let match;

    while ((match = sentenceEndings.exec(text)) !== null) {
      const sentence = text.substring(lastIndex, match.index + 1);
      sentences.push(sentence);
      lastIndex = match.index + 1;
    }

    // 更新文本缓冲区，保留未完成的部分
    textBufferRef.current = text.substring(lastIndex);

    return sentences;
  };

  // 更新语音状态
  const updateVoiceState = useCallback((updates: Partial<VoiceState> | ((prev: VoiceState) => Partial<VoiceState>)) => {
    setVoiceState(prev => {
      const newUpdates = typeof updates === 'function' ? updates(prev) : updates;
      const newState = { ...prev, ...newUpdates };
      
      // 通知状态变化
      if (newState.status !== prev.status) {
        onStatusChange?.(newState.status);
      }
      
      return newState;
    });
  }, [onStatusChange]);

  // 开始语音交互
  const startVoiceInteraction = useCallback(async () => {
    if (disabled) return;

    try {
      console.log('开始语音交互');

      // 初始化各个组件
      const speechRecognitionInitialized = initializeSpeechRecognition();
      if (!speechRecognitionInitialized) return;

      initializeAudioManager();
      await initializeVAD();

      // 启动VAD
      if (vadManagerRef.current) {
        await vadManagerRef.current.start();
      }

      updateVoiceState({ 
        status: 'IDLE',
        userTranscript: '',
        aiResponse: ''
      });

      console.log('语音交互启动成功');

    } catch (error: any) {
      console.error('启动语音交互失败:', error);
      onError?.(`启动失败: ${error.message}`);
    }
  }, [disabled, initializeSpeechRecognition, initializeAudioManager, initializeVAD, onError]);

  // 停止语音交互
  const stopVoiceInteraction = useCallback(() => {
    console.log('停止语音交互');

    // 停止VAD
    if (vadManagerRef.current) {
      vadManagerRef.current.pause();
    }

    // 停止音频播放
    if (audioManagerRef.current) {
      audioManagerRef.current.stop();
    }

    // 停止语音识别
    if (recognitionRef.current) {
      try {
        recognitionRef.current.stop();
      } catch (error) {
        console.warn('停止语音识别失败:', error);
      }
    }

    updateVoiceState({ 
      status: 'STOPPED',
      isVADActive: false,
      isRecording: false,
      isPlaying: false
    });

    console.log('语音交互已停止');
  }, []);

  // 切换语音交互状态
  const toggleVoiceInteraction = useCallback(async () => {
    if (voiceState.status === 'STOPPED') {
      await startVoiceInteraction();
    } else {
      stopVoiceInteraction();
    }
  }, [voiceState.status, startVoiceInteraction, stopVoiceInteraction]);

  // 处理用户语音输入
  const handleUserSpeech = useCallback(async (transcript: string) => {
    console.log('处理用户语音输入:', transcript);
    await handleDifyStream(transcript);
  }, [handleDifyStream]);

  // 清理资源
  useEffect(() => {
    return () => {
      vadManagerRef.current?.destroy();
      audioManagerRef.current?.destroy();
      
      if (recognitionRef.current) {
        try {
          recognitionRef.current.stop();
        } catch (error) {
          console.warn('清理语音识别失败:', error);
        }
      }
    };
  }, []);

  // 设置用户语音处理回调
  useEffect(() => {
    if (onUserSpeech) {
      // 使用内部处理函数
      return;
    } else {
      // 使用handleUserSpeech作为默认处理
      onUserSpeech = handleUserSpeech;
    }
  }, [onUserSpeech, handleUserSpeech]);

  // 获取状态显示文本
  const getStatusText = (status: VoiceStatus): string => {
    switch (status) {
      case 'IDLE': return '空闲 - 等待您说话';
      case 'LISTENING': return '正在聆听...';
      case 'THINKING': return '正在思考...';
      case 'SPEAKING': return 'AI正在回答';
      case 'STOPPED': return '语音交互已停止';
      default: return status;
    }
  };

  // 获取状态颜色
  const getStatusColor = (status: VoiceStatus): string => {
    switch (status) {
      case 'IDLE': return 'bg-blue-100 text-blue-700';
      case 'LISTENING': return 'bg-green-100 text-green-700';
      case 'THINKING': return 'bg-yellow-100 text-yellow-700';
      case 'SPEAKING': return 'bg-purple-100 text-purple-700';
      case 'STOPPED': return 'bg-gray-100 text-gray-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  return (
    <div className="space-y-4">
      {/* 主控制区域 */}
      <Card>
        <CardContent className="pt-6 space-y-4">
          
          {/* 状态显示 */}
          <div className="text-center space-y-3">
            <Badge className={`px-3 py-1 ${getStatusColor(voiceState.status)}`}>
              {getStatusText(voiceState.status)}
            </Badge>
            
            <div className="flex justify-center items-center gap-4">
              <div className="flex items-center gap-1 text-sm text-muted-foreground">
                <Mic className={`w-4 h-4 ${voiceState.isRecording ? 'text-red-500' : ''}`} />
                <span>{voiceState.isRecording ? '录音中' : '待机'}</span>
              </div>
              
              <div className="flex items-center gap-1 text-sm text-muted-foreground">
                <Volume2 className={`w-4 h-4 ${voiceState.isPlaying ? 'text-blue-500' : ''}`} />
                <span>{voiceState.isPlaying ? '播放中' : '静音'}</span>
              </div>
            </div>
          </div>

          {/* 控制按钮 */}
          <div className="flex justify-center gap-3">
            <Button
              onClick={toggleVoiceInteraction}
              disabled={disabled}
              variant={voiceState.status === 'STOPPED' ? 'default' : 'destructive'}
              size="lg"
            >
              {voiceState.status === 'STOPPED' ? (
                <>
                  <Play className="w-4 h-4 mr-2" />
                  开始对话
                </>
              ) : (
                <>
                  <Square className="w-4 h-4 mr-2" />
                  结束对话
                </>
              )}
            </Button>

            {voiceState.isPlaying && audioManagerRef.current && (
              <Button
                onClick={() => audioManagerRef.current?.interrupt()}
                variant="outline"
              >
                <VolumeX className="w-4 h-4 mr-2" />
                停止播放
              </Button>
            )}
          </div>

          {/* 对话内容显示 */}
          {(voiceState.userTranscript || voiceState.aiResponse) && (
            <div className="space-y-3 border-t pt-4">
              {voiceState.userTranscript && (
                <div className="text-sm">
                  <div className="font-medium text-blue-600 mb-1">您说：</div>
                  <div className="bg-blue-50 p-2 rounded">{voiceState.userTranscript}</div>
                </div>
              )}
              
              {voiceState.aiResponse && (
                <div className="text-sm">
                  <div className="font-medium text-purple-600 mb-1">AI回复：</div>
                  <div className="bg-purple-50 p-2 rounded">{voiceState.aiResponse}</div>
                </div>
              )}
            </div>
          )}

        </CardContent>
      </Card>

      {/* 调试信息 */}
      {showDebugInfo && (
        <Card>
          <CardContent className="pt-4">
            <div className="text-sm space-y-2">
              <div className="font-medium">调试信息</div>
              
              {vadState && (
                <div>
                  <strong>VAD状态:</strong> 
                  {vadState.isInitialized ? ' 已初始化' : ' 未初始化'}
                  {vadState.isRunning ? ' | 运行中' : ''}
                  {vadState.isPaused ? ' | 已暂停' : ''}
                  {vadState.error && ` | 错误: ${vadState.error}`}
                </div>
              )}
              
              {audioState && (
                <div>
                  <strong>音频状态:</strong>
                  {audioState.isPlaying ? ' 播放中' : ' 停止'}
                  {audioState.isPaused ? ' | 已暂停' : ''}
                  {` | 队列长度: ${audioState.queueLength}`}
                  {` | 音量: ${Math.round(audioState.volume * 100)}%`}
                </div>
              )}
              
              {conversationIdRef.current && (
                <div>
                  <strong>对话ID:</strong> {conversationIdRef.current.substring(0, 20)}...
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}