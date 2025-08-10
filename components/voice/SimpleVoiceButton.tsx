'use client';

import { useState, useRef, useCallback, useEffect, forwardRef, useImperativeHandle } from 'react';
import { Button } from '@/components/ui/button';
import { Mic, Volume2 } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

import { createAudioManager, type AudioManager } from '@/lib/voice/audio-manager';
import { StreamingTTSProcessor } from '@/lib/voice/streaming-tts';
import type { VoiceStatus } from '@/types/voice';
import { VoiceMode } from '@/types/voice';

interface SimpleVoiceButtonProps {
  onUserSpeech?: (transcript: string) => void;
  onStatusChange?: (status: VoiceStatus) => void;
  disabled?: boolean;
  className?: string;
}

export interface SimpleVoiceButtonRef {
  speakText: (text: string) => Promise<void>;
  processTextChunk: (chunk: string) => Promise<void>;
  finishStreaming: () => Promise<void>;
  resetStreaming: () => void;
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
  const [voiceMode, setVoiceMode] = useState<VoiceMode>(VoiceMode.OFF);
  const [isRecording, setIsRecording] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);

  const audioManagerRef = useRef<AudioManager | null>(null);
  const recognitionRef = useRef<SpeechRecognition | null>(null);
  const streamingTTSRef = useRef<StreamingTTSProcessor | null>(null);
  const isInitializedRef = useRef(false);
  
  // 🔄 连续监听相关状态
  const continuousListeningRef = useRef(false);
  const restartTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const lastSpeechTimeRef = useRef(Date.now());
  const processedResultsRef = useRef(0); // 🔒 追踪已处理的结果数量
  
  // 🚀 性能优化和错误恢复
  const errorCountRef = useRef(0);
  const maxErrorCount = 3;
  const performanceMetricsRef = useRef({
    lastSpeechTime: Date.now(),
    avgProcessingTime: 0,
    totalRequests: 0
  });

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
    // 🚀 启用连续识别模式
    recognition.interimResults = true;
    recognition.continuous = true;
    recognition.maxAlternatives = 1;

    recognition.onstart = () => {
      console.log('语音识别启动');
      setIsRecording(true);
      updateStatus('LISTENING');
      // 🔒 重置结果处理索引
      processedResultsRef.current = 0;
    };

    // 🚀 连续监听模式的结果处理（防重复 + 智能打断）
    recognition.onresult = (event: SpeechRecognitionEvent) => {
      const results = event.results;
      let newFinalTranscript = '';
      let hasInterimResults = false;
      
      // 检查是否有中间结果（用户开始说话）
      for (let i = 0; i < results.length; i++) {
        if (!results[i].isFinal && results[i][0].transcript.trim()) {
          hasInterimResults = true;
          break;
        }
      }
      
      // 🚀 快速打断：检测到用户开始说话就立即彻底停止播放
      if (hasInterimResults && voiceMode === VoiceMode.SPEAKING && audioManagerRef.current) {
        console.log('🚨 检测到用户开始说话，快速打断AI播放');
        audioManagerRef.current.interrupt();
        setIsPlaying(false);
        setVoiceMode(VoiceMode.LISTENING);
        
        // 🧹 同时清理TTS处理器，防止后台继续处理
        if (streamingTTSRef.current) {
          console.log('🧹 快速打断时清理TTS处理器');
          streamingTTSRef.current.reset();
        }
      }
      
      // 🔒 只处理新的最终结果，避免重复
      for (let i = processedResultsRef.current; i < results.length; i++) {
        const result = results[i];
        if (result.isFinal) {
          newFinalTranscript += result[0].transcript;
          processedResultsRef.current = i + 1; // 更新已处理的结果索引
        }
      }
      
      if (newFinalTranscript.trim()) {
        const confidence = results[results.length - 1][0].confidence;
        console.log(`🎙️ 新识别结果: "${newFinalTranscript}" (置信度: ${(confidence * 100).toFixed(1)}%)`);
        
        // 🚀 性能监控
        const now = Date.now();
        const processingTime = now - lastSpeechTimeRef.current;
        performanceMetricsRef.current.totalRequests++;
        performanceMetricsRef.current.avgProcessingTime = 
          (performanceMetricsRef.current.avgProcessingTime * (performanceMetricsRef.current.totalRequests - 1) + processingTime) / 
          performanceMetricsRef.current.totalRequests;
        
        // 🔄 成功识别后重置错误计数
        errorCountRef.current = 0;
        
        // 🚀 智能打断：如果正在播放，彻底停止并清理
        if (voiceMode === VoiceMode.SPEAKING && audioManagerRef.current) {
          console.log('🚨 用户打断AI播放，彻底停止TTS');
          audioManagerRef.current.interrupt();
          setIsPlaying(false);
        }
        
        // 🧹 彻底清理TTS处理器，确保不会继续播放上一条回复
        if (streamingTTSRef.current) {
          console.log('🧹 清理流式TTS处理器，停止上一条回复');
          streamingTTSRef.current.reset();
        }
        
        lastSpeechTimeRef.current = now;
        setVoiceMode(VoiceMode.LISTENING);
        updateStatus('THINKING');
        onUserSpeech?.(newFinalTranscript.trim());
      }
    };

    recognition.onerror = (event: SpeechRecognitionErrorEvent) => {
      console.error('🚨 语音识别错误:', event.error);
      setIsRecording(false);
      
      // 🚀 智能错误处理和恢复
      errorCountRef.current++;
      
      if (errorCountRef.current > maxErrorCount) {
        console.error('❌ 错误次数过多，停止连续监听模式');
        stopContinuousListening();
        return;
      }
      
      // 🔄 连续模式下的错误处理
      if (continuousListeningRef.current && event.error !== 'aborted') {
        console.log(`🔄 错误后重启识别... (${errorCountRef.current}/${maxErrorCount})`);
        // 延迟时间随错误次数递增
        const delay = Math.min(1000 * errorCountRef.current, 5000);
        setTimeout(() => restartRecognition(), delay);
      } else if (voiceMode !== VoiceMode.OFF) {
        setVoiceMode(VoiceMode.ACTIVE);
        updateStatus('IDLE');
      }
    };

    recognition.onend = () => {
      console.log('📝 语音识别结束');
      setIsRecording(false);
      
      // 🔄 连续监听模式：自动重启识别
      if (continuousListeningRef.current && voiceMode !== VoiceMode.OFF) {
        restartRecognition();
      } else if (voiceMode !== VoiceMode.OFF) {
        setVoiceMode(VoiceMode.ACTIVE);
        updateStatus('IDLE');
      }
    };

    recognitionRef.current = recognition;
    return true;
  }, [onUserSpeech, status, updateStatus, voiceMode]);

  // 🔄 重启语音识别（连续监听核心）
  const restartRecognition = useCallback(() => {
    if (!continuousListeningRef.current || voiceMode === VoiceMode.OFF) {
      return;
    }

    // 清除现有的重启定时器
    if (restartTimeoutRef.current) {
      clearTimeout(restartTimeoutRef.current);
      restartTimeoutRef.current = null;
    }

    // 延迟重启，避免过于频繁
    restartTimeoutRef.current = setTimeout(() => {
      if (recognitionRef.current && continuousListeningRef.current) {
        try {
          console.log('🔄 重启语音识别...');
          processedResultsRef.current = 0; // 🔒 重置处理索引
          recognitionRef.current.start();
          setVoiceMode(VoiceMode.ACTIVE);
        } catch (error) {
          console.error('重启语音识别失败:', error);
          // 如果重启失败，稍后再试
          setTimeout(() => restartRecognition(), 2000);
        }
      }
    }, 500);
  }, [voiceMode]);

  // 初始化音频管理器
  const initializeAudioManager = useCallback(() => {
    if (audioManagerRef.current) return;

    const audioManager = createAudioManager({
      onPlay: () => {
        console.log('开始播放音频');
        setIsPlaying(true);
        setVoiceMode(VoiceMode.SPEAKING);
        updateStatus('SPEAKING');
      },
      
      onStateChange: (state) => {
        setIsPlaying(state.isPlaying);
        // 🔄 播放完成后，根据连续监听状态决定模式
        if (!state.isPlaying && state.queueLength === 0 && status === 'SPEAKING') {
          if (continuousListeningRef.current) {
            setVoiceMode(VoiceMode.ACTIVE);
            updateStatus('IDLE');
          } else {
            setVoiceMode(VoiceMode.OFF);
            updateStatus('STOPPED');
          }
        }
      },
      
      onError: (error) => {
        console.error('音频播放错误:', error);
      }
    });

    audioManagerRef.current = audioManager;
    
    // 初始化流式TTS处理器
    streamingTTSRef.current = new StreamingTTSProcessor(audioManager);
    
    console.log('音频管理器和流式TTS处理器初始化成功');
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

    } catch (error: unknown) {
      console.error('初始化语音组件失败:', error);
      return false;
    }
  }, [initializeSpeechRecognition, initializeAudioManager]);

  // 🚀 启动连续监听模式
  const startContinuousListening = useCallback(async () => {
    console.log('🚀 启动连续监听模式');
    
    const initialized = await initializeManagers();
    if (!initialized) {
      console.error('初始化失败，无法启动连续监听');
      return;
    }

    continuousListeningRef.current = true;
    setVoiceMode(VoiceMode.ACTIVE);
    updateStatus('IDLE');
    
    // 启动语音识别
    if (recognitionRef.current) {
      try {
        processedResultsRef.current = 0; // 🔒 重置处理索引
        recognitionRef.current.start();
        console.log('✅ 连续监听模式已激活');
      } catch (error) {
        console.error('启动语音识别失败:', error);
        continuousListeningRef.current = false;
        setVoiceMode(VoiceMode.OFF);
      }
    }
  }, [initializeManagers, updateStatus]);

  // 🛑 停止连续监听模式
  const stopContinuousListening = useCallback(() => {
    console.log('🛑 停止连续监听模式');
    
    continuousListeningRef.current = false;
    processedResultsRef.current = 0; // 🔒 重置处理索引
    setVoiceMode(VoiceMode.OFF);
    updateStatus('STOPPED');
    
    // 清除定时器
    if (restartTimeoutRef.current) {
      clearTimeout(restartTimeoutRef.current);
      restartTimeoutRef.current = null;
    }
    
    // 停止语音识别
    if (recognitionRef.current) {
      try {
        recognitionRef.current.stop();
      } catch (error) {
        console.error('停止语音识别失败:', error);
      }
    }
    
    // 停止音频播放
    if (audioManagerRef.current) {
      audioManagerRef.current.interrupt();
      setIsPlaying(false);
    }
    
    setIsRecording(false);
    console.log('❌ 连续监听模式已关闭');
  }, [updateStatus]);

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
    } catch (error: unknown) {
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


  // 处理AI响应的TTS（完整文本）
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
    
    console.log('添加完整文本到语音队列:', text.substring(0, 50) + '...');
    updateStatus('SPEAKING');
    await audioManagerRef.current.addToQueue(text);
  }, [updateStatus, initializeManagers]);

  // 流式处理文本块
  const processTextChunk = useCallback(async (chunk: string) => {
    if (!chunk?.trim()) return;
    
    // 🔒 严格检查初始化状态，避免重复初始化
    if (!isInitializedRef.current) {
      const initialized = await initializeManagers();
      if (!initialized) {
        console.error('组件初始化失败');
        return;
      }
    }
    
    if (!streamingTTSRef.current) {
      console.error('流式TTS处理器未初始化');
      return;
    }
    
    // 如果还未开始播放，设置状态为SPEAKING
    if (status !== 'SPEAKING') {
      updateStatus('SPEAKING');
    }
    
    console.log('流式处理文本块:', chunk.substring(0, 30) + '...');
    await streamingTTSRef.current.processTextChunk(chunk);
  }, [initializeManagers, status, updateStatus]);

  // 完成流式处理
  const finishStreaming = useCallback(async () => {
    if (!streamingTTSRef.current) return;
    
    console.log('完成流式TTS处理');
    await streamingTTSRef.current.processRemainingText();
  }, []);

  // 重置流式处理（彻底清理）
  const resetStreaming = useCallback(() => {
    console.log('🧹 彻底重置语音状态');
    
    // 停止当前音频播放
    if (audioManagerRef.current) {
      console.log('🚨 停止当前音频播放');
      audioManagerRef.current.interrupt();
      setIsPlaying(false);
    }
    
    // 重置流式TTS处理器
    if (streamingTTSRef.current) {
      console.log('🔄 重置流式TTS处理器');
      streamingTTSRef.current.reset();
    }
    
    // 重置语音模式状态
    if (voiceMode === VoiceMode.SPEAKING) {
      console.log('🔄 重置语音模式为激活状态');
      setVoiceMode(VoiceMode.ACTIVE);
      updateStatus('IDLE');
    }
  }, [voiceMode, updateStatus]);

  // 暴露给父组件的方法
  useImperativeHandle(ref, () => ({
    speakText,
    processTextChunk,
    finishStreaming,
    resetStreaming,
    getStatus: () => status,
    isActive: () => status !== 'STOPPED',
    startListening,
    stopListening
  }));

  // 清理资源和内存管理
  useEffect(() => {
    return () => {
      // 🔄 清理连续监听相关资源
      continuousListeningRef.current = false;
      processedResultsRef.current = 0;
      errorCountRef.current = 0;
      
      if (restartTimeoutRef.current) {
        clearTimeout(restartTimeoutRef.current);
        restartTimeoutRef.current = null;
      }
      
      // 🚀 彻底清理音频资源
      if (audioManagerRef.current) {
        try {
          audioManagerRef.current.destroy();
          audioManagerRef.current = null;
        } catch (error) {
          console.warn('清理音频管理器失败:', error);
        }
      }
      
      // 🚀 彻底清理流式TTS处理器
      if (streamingTTSRef.current) {
        try {
          streamingTTSRef.current.reset();
          streamingTTSRef.current = null;
        } catch (error) {
          console.warn('清理流式TTS处理器失败:', error);
        }
      }
      
      if (recognitionRef.current) {
        try {
          recognitionRef.current.stop();
          recognitionRef.current = null;
        } catch (error) {
          console.warn('清理语音识别失败:', error);
        }
      }
      
      // 重置初始化标识
      isInitializedRef.current = false;
      
      console.log('🧹 连续监听组件已彻底清理');
    };
  }, []);

  // 🚀 增强的按钮配置（连续监听模式 + 优化视觉反馈）
  const getButtonConfig = () => {
    switch (voiceMode) {
      case VoiceMode.OFF:
        return {
          icon: <Mic className="w-4 h-4 text-coach-gray-medium" />,
          variant: 'outline' as const,
          text: '启动语音助手',
          onClick: startContinuousListening,
          pulse: false,
          recording: false,
          playing: false,
          bgColor: 'hover:bg-blue-50 border-coach-gray-disabled hover:border-blue-300'
        };
      
      case VoiceMode.ACTIVE:
        return {
          icon: <Mic className="w-4 h-4 text-blue-600" />,
          variant: 'default' as const,
          text: '语音助手待命中（随时可说话）',
          onClick: stopContinuousListening,
          pulse: true,
          recording: false,
          playing: false,
          bgColor: 'bg-blue-50 hover:bg-blue-100 border-blue-300'
        };
      
      case VoiceMode.LISTENING:
        return {
          icon: <Mic className="w-4 h-4 text-red-600 animate-pulse" />,
          variant: 'default' as const,
          text: '正在识别您的语音...',
          onClick: stopContinuousListening,
          pulse: false,
          recording: true,
          playing: false,
          bgColor: 'bg-red-50 hover:bg-red-100 border-red-300'
        };
      
      case VoiceMode.SPEAKING:
        return {
          icon: <Volume2 className="w-4 h-4 text-green-600 animate-pulse" />,
          variant: 'default' as const,
          text: 'AI正在回复（可随时打断）',
          onClick: stopContinuousListening,
          pulse: false,
          recording: false,
          playing: true,
          bgColor: 'bg-green-50 hover:bg-green-100 border-green-300'
        };
      
      default:
        return {
          icon: <Mic className="w-4 h-4 text-coach-gray-medium" />,
          variant: 'outline' as const,
          text: '启动语音助手',
          onClick: startContinuousListening,
          pulse: false,
          recording: false,
          playing: false,
          bgColor: 'hover:bg-blue-50 border-coach-gray-disabled hover:border-blue-300'
        };
    }
  };

  const buttonConfig = getButtonConfig();

  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <Button
        onClick={buttonConfig.onClick}
        disabled={disabled}
        variant={buttonConfig.variant}
        className={`relative h-10 sm:h-11 px-3 sm:px-4 transition-all duration-200 ${buttonConfig.bgColor} ${
          voiceMode === VoiceMode.LISTENING ? 'voice-wave' : 
          voiceMode === VoiceMode.ACTIVE ? 'animate-pulse-slow' : ''
        } ${className || ''}`}
        title={buttonConfig.text}
      >
        <div className={`flex items-center justify-center ${voiceMode === VoiceMode.SPEAKING ? 'animate-bounce-gentle' : ''}`}>
          {buttonConfig.icon}
        </div>
        
        {/* 🎨 精美的视觉指示器 */}
        {buttonConfig.pulse && (
          <div className="absolute -top-0.5 -right-0.5 w-2.5 h-2.5 bg-blue-500 rounded-full animate-pulse shadow-sm" />
        )}
        
        {buttonConfig.recording && (
          <>
            <div className="absolute -top-0.5 -right-0.5 w-2.5 h-2.5 bg-red-500 rounded-full animate-pulse shadow-sm" />
            <div className="absolute -inset-0.5 bg-red-200 rounded-full animate-ping opacity-30" />
          </>
        )}
        
        {buttonConfig.playing && (
          <>
            <div className="absolute -top-0.5 -right-0.5 w-2.5 h-2.5 bg-green-500 rounded-full animate-pulse shadow-sm" />
            <div className="absolute -inset-0.5 bg-green-200 rounded-full animate-ping opacity-25" />
          </>
        )}
      </Button>
      
      {/* 🎯 简洁状态指示 - 只在移动端显示 */}
      {voiceMode !== VoiceMode.OFF && (
        <Badge 
          variant={voiceMode === VoiceMode.LISTENING ? 'destructive' : 
                  voiceMode === VoiceMode.SPEAKING ? 'default' :
                  'secondary'}
          className={`text-xs ml-1 transition-all duration-200 sm:hidden ${
            voiceMode === VoiceMode.LISTENING ? 'animate-pulse' :
            voiceMode === VoiceMode.SPEAKING ? 'animate-pulse' : ''
          }`}
        >
          {voiceMode === VoiceMode.ACTIVE ? '待命' : 
           voiceMode === VoiceMode.LISTENING ? '识别' : 
           voiceMode === VoiceMode.SPEAKING ? '播放' : 
           status === 'THINKING' ? '思考' : '就绪'}
        </Badge>
      )}
    </div>
  );
});

SimpleVoiceButton.displayName = 'SimpleVoiceButton';

export default SimpleVoiceButton;