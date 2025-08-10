'use client';

import { useState, useRef, useCallback, useEffect, forwardRef, useImperativeHandle } from 'react';
import { Button } from '@/components/ui/button';
import { Mic, MicOff, Volume2, VolumeX } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

import { createAudioManager, type AudioManager } from '@/lib/voice/audio-manager';
import type { VoiceStatus } from '@/types/voice';

interface SimpleVoiceButtonProps {
  onUserSpeech?: (transcript: string) => void;
  onStatusChange?: (status: VoiceStatus) => void;
  disabled?: boolean;
  className?: string;
}

export interface SimpleVoiceButtonRef {
  speakText: (text: string) => Promise<void>;
  getStatus: () => VoiceStatus;
  isActive: () => boolean;
  startListening: () => void;
  stopListening: () => void;
}

const SimpleVoiceButton = forwardRef<SimpleVoiceButtonRef, SimpleVoiceButtonProps>(({
  onUserSpeech,
  onStatusChange,
  disabled = false,
  className = ''
}, ref) => {
  
  const [status, setStatus] = useState<VoiceStatus>('STOPPED');
  const [isRecording, setIsRecording] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);

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
    if (!SpeechRecognition) {
      console.error('浏览器不支持语音识别');
      return false;
    }

    const recognition = new SpeechRecognition();
    recognition.lang = 'zh-CN';
    recognition.interimResults = false;
    recognition.continuous = false;
    recognition.maxAlternatives = 1;

    recognition.onstart = () => {
      console.log('语音识别启动');
      setIsRecording(true);
      updateStatus('LISTENING');
    };

    recognition.onresult = (event: SpeechRecognitionEvent) => {
      const transcript = event.results[0][0].transcript;
      const confidence = event.results[0][0].confidence;
      console.log(`识别结果: "${transcript}" (置信度: ${(confidence * 100).toFixed(1)}%)`);
      
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
      if (status === 'LISTENING') {
        updateStatus('IDLE');
      }
    };

    recognitionRef.current = recognition;
    return true;
  }, [onUserSpeech, status, updateStatus]);

  // 初始化音频管理器
  const initializeAudioManager = useCallback(() => {
    if (audioManagerRef.current) return;

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

    audioManagerRef.current = audioManager;
    console.log('音频管理器初始化成功');
  }, [status, updateStatus]);

  // 初始化管理器
  const initializeManagers = useCallback(async () => {
    if (isInitializedRef.current) return true;

    try {
      // 初始化语音识别
      if (!initializeSpeechRecognition()) {
        console.error('浏览器不支持语音识别');
        return false;
      }

      // 初始化音频管理器
      initializeAudioManager();
      
      isInitializedRef.current = true;
      console.log('语音组件初始化成功');
      return true;

    } catch (error: any) {
      console.error('初始化语音组件失败:', error);
      return false;
    }
  }, [initializeSpeechRecognition, initializeAudioManager]);

  // 开始聆听
  const startListening = useCallback(async () => {
    const initialized = await initializeManagers();
    if (!initialized) return;

    if (isRecording) {
      console.log('已在录音中');
      return;
    }

    // 如果正在播放，先停止
    if (isPlaying && audioManagerRef.current) {
      audioManagerRef.current.interrupt();
      setIsPlaying(false);
    }

    try {
      if (recognitionRef.current) {
        recognitionRef.current.start();
      }
    } catch (error: any) {
      console.error('启动语音识别失败:', error);
    }
  }, [initializeManagers, isRecording, isPlaying]);

  // 停止聆听
  const stopListening = useCallback(() => {
    if (recognitionRef.current && isRecording) {
      try {
        recognitionRef.current.stop();
      } catch (error) {
        console.warn('停止语音识别失败:', error);
      }
    }
    
    if (audioManagerRef.current) {
      audioManagerRef.current.stop();
    }

    setIsRecording(false);
    setIsPlaying(false);
    updateStatus('STOPPED');
    console.log('语音功能已停止');
  }, [isRecording, updateStatus]);

  // 开始语音交互
  const startVoice = useCallback(async () => {
    const initialized = await initializeManagers();
    if (!initialized) return;
    
    updateStatus('IDLE');
    console.log('语音交互已启动');
  }, [initializeManagers, updateStatus]);

  // 停止语音交互
  const stopVoice = useCallback(() => {
    stopListening();
  }, [stopListening]);

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
    isActive: () => status !== 'STOPPED',
    startListening,
    stopListening
  }), [speakText, status, startListening, stopListening]);

  // 清理资源
  useEffect(() => {
    return () => {
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

  // 获取按钮图标和样式
  const getButtonConfig = () => {
    if (isRecording) {
      return {
        icon: <MicOff className="w-4 h-4 text-red-500" />,
        variant: 'destructive' as const,
        text: '录音中',
        onClick: stopListening
      };
    }
    
    if (isPlaying) {
      return {
        icon: <Volume2 className="w-4 h-4 text-blue-500" />,
        variant: 'default' as const,
        text: '播放中',
        onClick: () => audioManagerRef.current?.interrupt()
      };
    }
    
    if (status === 'STOPPED') {
      return {
        icon: <Mic className="w-4 h-4" />,
        variant: 'outline' as const,
        text: '启动语音',
        onClick: toggleVoice
      };
    }
    
    return {
      icon: <Mic className="w-4 h-4 text-green-500" />,
      variant: 'default' as const,
      text: '开始说话',
      onClick: startListening
    };
  };

  const buttonConfig = getButtonConfig();

  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <Button
        onClick={buttonConfig.onClick}
        disabled={disabled}
        variant={buttonConfig.variant}
        size="sm"
        className="relative"
        title={buttonConfig.text}
      >
        {buttonConfig.icon}
        {(isRecording || isPlaying) && (
          <div className="absolute -top-1 -right-1 w-2 h-2 bg-red-500 rounded-full animate-pulse" />
        )}
      </Button>
      
      {status !== 'STOPPED' && (
        <Badge 
          variant="secondary" 
          className="text-xs"
        >
          {isRecording ? '录音中' : 
           isPlaying ? '播放中' : 
           status === 'THINKING' ? '处理中' : 
           status === 'SPEAKING' ? '回答中' : '待机'}
        </Badge>
      )}
    </div>
  );
});

SimpleVoiceButton.displayName = 'SimpleVoiceButton';

export default SimpleVoiceButton;
export type { SimpleVoiceButtonRef };