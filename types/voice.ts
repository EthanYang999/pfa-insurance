// 语音交互相关的TypeScript类型定义

// 语音助手状态
export type VoiceStatus = 'IDLE' | 'LISTENING' | 'THINKING' | 'SPEAKING' | 'STOPPED';

// 连续语音模式
export enum VoiceMode {
  OFF = 'OFF',           // 完全关闭
  ACTIVE = 'ACTIVE',     // 激活但等待语音
  LISTENING = 'LISTENING', // 正在识别语音
  SPEAKING = 'SPEAKING'   // AI正在播放
}

// VAD (Voice Activity Detection) 配置
export interface VADConfig {
  onSpeechStart?: () => void;
  onSpeechEnd?: () => void;
  modelURL?: string;
  workletURL?: string;
  ortConfig?: {
    executionProviders?: string[];
  };
}

// Azure TTS 请求接口
export interface TTSRequest {
  text: string;
  voice?: string;
  rate?: string;
  pitch?: string;
}

// Azure TTS 响应接口
export interface TTSResponse {
  audioData?: ArrayBuffer;
  error?: string;
  details?: string;
}

// 语音识别结果
export interface SpeechRecognitionResult {
  transcript: string;
  confidence: number;
  isFinal: boolean;
}

// Dify 流式响应事件
export interface DifyStreamEvent {
  event: 'message_chunk' | 'message_complete' | 'stream_end' | 'error';
  chunk?: string;
  conversation_id?: string;
  message_id?: string;
  complete_answer?: string;
  error?: string;
}

// 语音交互组件状态
export interface VoiceState {
  status: VoiceStatus;
  userTranscript: string;
  aiResponse: string;
  isVADActive: boolean;
  isRecording: boolean;
  isPlaying: boolean;
  conversationId?: string;
  error?: string;
}

// 音频播放队列项
export interface AudioQueueItem {
  id: string;
  text: string;
  audioBuffer?: AudioBuffer;
  isPlaying: boolean;
}

// 语音配置接口
export interface VoiceConfig {
  azureRegion: string;
  azureVoice: string;
  difyApiUrl: string;
  language: 'zh-CN' | 'en-US';
  autoStart: boolean;
}

// 浏览器能力检测结果
export interface BrowserCapabilities {
  hasSpeechRecognition: boolean;
  hasWebAudio: boolean;
  hasUserMedia: boolean;
  hasVADSupport: boolean;
  browserName: string;
  isSupported: boolean;
}

// API 连通性测试结果
export interface ConnectivityTestResult {
  service: 'azure_tts' | 'dify_stream' | 'vad_model';
  status: 'success' | 'error' | 'timeout';
  responseTime?: number;
  error?: string;
  details?: any;
}

// 语音交互事件类型
export type VoiceEventType = 
  | 'user_speech_start'
  | 'user_speech_end' 
  | 'ai_response_start'
  | 'ai_response_end'
  | 'audio_play_start'
  | 'audio_play_end'
  | 'interrupt'
  | 'error';

// 语音交互事件
export interface VoiceEvent {
  type: VoiceEventType;
  timestamp: number;
  data?: any;
}

// 调试信息
export interface VoiceDebugInfo {
  vadEnabled: boolean;
  recognitionActive: boolean;
  audioContextState: AudioContextState;
  currentQueue: AudioQueueItem[];
  lastError?: string;
  performanceMetrics: {
    recognitionLatency: number;
    ttsLatency: number;
    totalResponseTime: number;
  };
}