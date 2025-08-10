'use client';

import { useState, useRef, useCallback, useEffect, forwardRef, useImperativeHandle } from 'react';
import { Button } from '@/components/ui/button';
import { Mic, MicOff, Volume2, VolumeX } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

import { createVADManager, type VADManager } from '@/lib/voice/vad-manager';
import { createAudioManager, type AudioManager } from '@/lib/voice/audio-manager';
import type { VoiceStatus } from '@/types/voice';

interface VoiceButtonProps {
  onUserSpeech?: (transcript: string) => void;
  onStatusChange?: (status: VoiceStatus) => void;
  disabled?: boolean;
  className?: string;
}

export interface VoiceButtonRef {
  speakText: (text: string) => Promise<void>;
  getStatus: () => VoiceStatus;
  isActive: () => boolean;
}

const VoiceButton = forwardRef<VoiceButtonRef, VoiceButtonProps>(({
  onUserSpeech,
  onStatusChange,
  disabled = false,
  className = ''
}, ref) => {
  
  const [status, setStatus] = useState<VoiceStatus>('STOPPED');
  const [isRecording, setIsRecording] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);

  const vadManagerRef = useRef<VADManager | null>(null);
  const audioManagerRef = useRef<AudioManager | null>(null);
  const recognitionRef = useRef<SpeechRecognition | null>(null);
  const isInitializedRef = useRef(false);

  // 更新状态
  const updateStatus = useCallback((newStatus: VoiceStatus) => {
    setStatus(newStatus);
    onStatusChange?.(newStatus);
  }, [onStatusChange]);

  // 初始化语音识别
  const initializeSpeechRecognition = useCallback(() => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) return false;

    const recognition = new SpeechRecognition();
    recognition.lang = 'zh-CN';
    recognition.interimResults = false;

    recognition.onstart = () => {
      console.log('语音识别启动');
      setIsRecording(true);
      updateStatus('LISTENING');
    };

    recognition.onresult = (event: SpeechRecognitionEvent) => {
      const transcript = event.results[0][0].transcript;
      console.log('识别结果:', transcript);
      
      setIsRecording(false);
      updateStatus('THINKING');
      onUserSpeech?.(transcript);
    };

    recognition.onerror = (event: any) => {
      console.error('语音识别错误:', event.error);
      setIsRecording(false);
      if (status !== 'STOPPED') {
        updateStatus('IDLE');
      }
    };

    recognition.onend = () => {
      console.log('语音识别结束');
      setIsRecording(false);
    };

    recognitionRef.current = recognition;
    return true;
  }, [onUserSpeech, status, updateStatus]);

  // 初始化管理器
  const initializeManagers = useCallback(async () => {
    if (isInitializedRef.current) return true;

    try {
      // 初始化语音识别
      if (!initializeSpeechRecognition()) {
        console.error('浏览器不支持语音识别');
        return false;
      }

      // 初始化VAD
      const vadManager = createVADManager({
        onSpeechStart: () => {
          console.log('VAD: 语音开始');
          
          // 如果正在播放，立即停止
          if (isPlaying && audioManagerRef.current) {
            audioManagerRef.current.interrupt();
          }

          // 启动语音识别
          if (recognitionRef.current && status === 'IDLE') {
            try {
              recognitionRef.current.start();
            } catch (error) {
              console.warn('语音识别启动失败:', error);
            }
          }
        },
        
        onError: (error: string) => {
          console.error('VAD错误:', error);
        }
      });

      // 初始化音频管理器
      const audioManager = createAudioManager({
        onPlay: () => {
          console.log('开始播放音频');
          setIsPlaying(true);
          updateStatus('SPEAKING');
        },
        
        onStateChange: (state) => {
          setIsPlaying(state.isPlaying);
          if (!state.isPlaying && state.queueLength === 0 && status === 'SPEAKING') {
            updateStatus('IDLE');
          }
        },
        
        onError: (error) => {
          console.error('音频播放错误:', error);
        }
      });

      vadManagerRef.current = vadManager;
      audioManagerRef.current = audioManager;

      // 初始化VAD
      await vadManager.initialize();
      
      isInitializedRef.current = true;
      console.log('语音组件初始化成功');
      return true;

    } catch (error: any) {
      console.error('初始化语音组件失败:', error);
      return false;
    }
  }, [initializeSpeechRecognition, isPlaying, status, updateStatus]);

  // 开始语音交互
  const startVoice = useCallback(async () => {
    const initialized = await initializeManagers();
    if (!initialized) return;

    try {
      if (vadManagerRef.current) {
        await vadManagerRef.current.start();
      }
      
      updateStatus('IDLE');
      console.log('语音交互已启动');
    } catch (error: any) {
      console.error('启动语音交互失败:', error);
    }
  }, [initializeManagers, updateStatus]);

  // 停止语音交互
  const stopVoice = useCallback(() => {
    if (vadManagerRef.current) {
      vadManagerRef.current.pause();
    }
    
    if (audioManagerRef.current) {
      audioManagerRef.current.stop();
    }

    if (recognitionRef.current) {
      try {
        recognitionRef.current.stop();
      } catch (error) {
        console.warn('停止语音识别失败:', error);
      }
    }

    setIsRecording(false);
    setIsPlaying(false);
    updateStatus('STOPPED');
    console.log('语音交互已停止');
  }, [updateStatus]);

  // 切换语音状态
  const toggleVoice = useCallback(async () => {
    if (disabled) return;
    
    if (status === 'STOPPED') {
      await startVoice();
    } else {
      stopVoice();
    }
  }, [disabled, status, startVoice, stopVoice]);

  // 处理AI响应的TTS
  const speakText = useCallback(async (text: string) => {
    if (!text.trim()) return;
    
    // 如果需要，先初始化音频管理器
    if (!audioManagerRef.current) {
      await initializeManagers();
    }
    
    if (!audioManagerRef.current) {
      console.error('音频管理器未初始化');
      return;
    }
    
    console.log('添加文本到语音队列:', text.substring(0, 50) + '...');
    updateStatus('SPEAKING');
    await audioManagerRef.current.addToQueue(text);
  }, [updateStatus, initializeManagers]);

  // 暴露给父组件的方法
  useImperativeHandle(ref, () => ({
    speakText,
    getStatus: () => status,
    isActive: () => status !== 'STOPPED'
  }), [speakText, status]);

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

  // 获取按钮图标
  const getButtonIcon = () => {
    if (isRecording) {
      return <MicOff className="w-4 h-4 text-red-500" />;
    }
    
    if (isPlaying) {
      return <Volume2 className="w-4 h-4 text-blue-500" />;
    }
    
    if (status === 'STOPPED') {
      return <Mic className="w-4 h-4" />;
    }
    
    return <Mic className="w-4 h-4 text-green-500" />;
  };

  // 获取状态文本
  const getStatusText = () => {
    switch (status) {
      case 'IDLE': return '待机';
      case 'LISTENING': return '聆听中';
      case 'THINKING': return '处理中';
      case 'SPEAKING': return '回答中';
      case 'STOPPED': return '语音关闭';
      default: return '';
    }
  };

  // 获取按钮颜色
  const getButtonVariant = () => {
    if (status === 'STOPPED') return 'outline';
    if (isRecording) return 'destructive';
    return 'default';
  };

  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <Button
        onClick={toggleVoice}
        disabled={disabled}
        variant={getButtonVariant()}
        size="sm"
        className="relative"
      >
        {getButtonIcon()}
        {(isRecording || isPlaying) && (
          <div className="absolute -top-1 -right-1 w-2 h-2 bg-red-500 rounded-full animate-pulse" />
        )}
      </Button>
      
      {status !== 'STOPPED' && (
        <Badge 
          variant="secondary" 
          className="text-xs"
        >
          {getStatusText()}
        </Badge>
      )}
    </div>
  );
});

VoiceButton.displayName = 'VoiceButton';

export default VoiceButton;
export type { VoiceButtonRef };