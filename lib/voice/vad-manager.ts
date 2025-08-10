// VAD (Voice Activity Detection) 管理器
// 处理语音活动检测的初始化、配置和事件管理

import type { VADConfig } from '@/types/voice';

export interface VADManager {
  initialize(): Promise<boolean>;
  start(): Promise<void>;
  pause(): void;
  destroy(): void;
  isActive(): boolean;
  getState(): VADState;
}

export interface VADState {
  isInitialized: boolean;
  isRunning: boolean;
  isPaused: boolean;
  isDestroyed: boolean;
  error?: string;
  lastActivity?: number;
}

export interface VADEventCallbacks {
  onSpeechStart?: () => void;
  onSpeechEnd?: () => void;
  onVADReady?: () => void;
  onError?: (error: string) => void;
  onStateChange?: (state: VADState) => void;
}

export class VADVoiceManager implements VADManager {
  private vad: any = null;
  private state: VADState = {
    isInitialized: false,
    isRunning: false,
    isPaused: false,
    isDestroyed: false
  };
  private callbacks: VADEventCallbacks = {};
  private config: VADConfig = {};

  constructor(callbacks: VADEventCallbacks = {}, config: VADConfig = {}) {
    this.callbacks = callbacks;
    this.config = {
      // 默认配置
      modelURL: 'https://cdn.jsdelivr.net/npm/@ricky0123/vad-web@0.0.24/dist/silero_vad.onnx',
      workletURL: 'https://cdn.jsdelivr.net/npm/@ricky0123/vad-web@0.0.24/dist/vad.worklet.bundle.min.js',
      ortConfig: {
        executionProviders: ['wasm']
      },
      ...config
    };
  }

  // 初始化VAD
  async initialize(): Promise<boolean> {
    if (this.state.isDestroyed) {
      throw new Error('VAD管理器已被销毁，无法重新初始化');
    }

    if (this.state.isInitialized) {
      console.log('VAD已初始化，跳过重复初始化');
      return true;
    }

    try {
      console.log('开始初始化VAD...');
      
      // 检查浏览器兼容性
      if (!this.checkBrowserSupport()) {
        throw new Error('浏览器不支持VAD所需的Web API');
      }

      // 动态加载VAD库
      const { VAD } = await this.loadVADLibrary();
      
      // 创建VAD实例
      this.vad = await VAD.create({
        ...this.config,
        onSpeechStart: () => {
          console.log('VAD检测到语音开始');
          this.state.lastActivity = Date.now();
          this.callbacks.onSpeechStart?.();
        },
        onSpeechEnd: () => {
          console.log('VAD检测到语音结束');
          this.callbacks.onSpeechEnd?.();
        }
      });

      this.state.isInitialized = true;
      this.state.error = undefined;
      
      console.log('VAD初始化成功');
      this.callbacks.onVADReady?.();
      this.notifyStateChange();
      
      return true;

    } catch (error: any) {
      const errorMessage = `VAD初始化失败: ${error.message}`;
      console.error(errorMessage, error);
      
      this.state.error = errorMessage;
      this.callbacks.onError?.(errorMessage);
      this.notifyStateChange();
      
      return false;
    }
  }

  // 启动VAD
  async start(): Promise<void> {
    if (this.state.isDestroyed) {
      throw new Error('VAD管理器已被销毁');
    }

    if (!this.state.isInitialized) {
      const initialized = await this.initialize();
      if (!initialized) {
        throw new Error('VAD初始化失败，无法启动');
      }
    }

    if (this.state.isRunning && !this.state.isPaused) {
      console.log('VAD已在运行，跳过启动');
      return;
    }

    try {
      console.log('启动VAD监听...');
      await this.vad?.start();
      
      this.state.isRunning = true;
      this.state.isPaused = false;
      this.state.error = undefined;
      
      console.log('VAD启动成功');
      this.notifyStateChange();

    } catch (error: any) {
      const errorMessage = `VAD启动失败: ${error.message}`;
      console.error(errorMessage, error);
      
      this.state.error = errorMessage;
      this.callbacks.onError?.(errorMessage);
      this.notifyStateChange();
      
      throw new Error(errorMessage);
    }
  }

  // 暂停VAD
  pause(): void {
    if (!this.state.isRunning) {
      console.log('VAD未运行，无需暂停');
      return;
    }

    try {
      console.log('暂停VAD监听...');
      this.vad?.pause();
      
      this.state.isPaused = true;
      console.log('VAD已暂停');
      this.notifyStateChange();

    } catch (error: any) {
      const errorMessage = `VAD暂停失败: ${error.message}`;
      console.error(errorMessage, error);
      
      this.state.error = errorMessage;
      this.callbacks.onError?.(errorMessage);
      this.notifyStateChange();
    }
  }

  // 销毁VAD
  destroy(): void {
    if (this.state.isDestroyed) {
      console.log('VAD已销毁，跳过重复销毁');
      return;
    }

    try {
      console.log('销毁VAD...');
      
      if (this.vad) {
        this.vad.destroy();
        this.vad = null;
      }
      
      this.state.isInitialized = false;
      this.state.isRunning = false;
      this.state.isPaused = false;
      this.state.isDestroyed = true;
      
      console.log('VAD已销毁');
      this.notifyStateChange();

    } catch (error: any) {
      const errorMessage = `VAD销毁失败: ${error.message}`;
      console.error(errorMessage, error);
      
      this.state.error = errorMessage;
      this.callbacks.onError?.(errorMessage);
    }
  }

  // 检查是否处于活跃状态
  isActive(): boolean {
    return this.state.isInitialized && 
           this.state.isRunning && 
           !this.state.isPaused && 
           !this.state.isDestroyed;
  }

  // 获取当前状态
  getState(): VADState {
    return { ...this.state };
  }

  // 检查浏览器支持
  private checkBrowserSupport(): boolean {
    // 检查必要的Web API
    if (typeof AudioContext === 'undefined' && typeof webkitAudioContext === 'undefined') {
      console.error('浏览器不支持AudioContext');
      return false;
    }

    if (typeof WebAssembly === 'undefined') {
      console.error('浏览器不支持WebAssembly');
      return false;
    }

    if (!navigator.mediaDevices?.getUserMedia) {
      console.error('浏览器不支持getUserMedia');
      return false;
    }

    if (typeof AudioWorkletNode === 'undefined') {
      console.error('浏览器不支持AudioWorkletNode');
      return false;
    }

    return true;
  }

  // 动态加载VAD库
  private async loadVADLibrary(): Promise<any> {
    try {
      console.log('正在动态加载VAD库...');
      // 尝试从不同的源加载VAD库
      const vadModule = await import('@ricky0123/vad-web');
      console.log('VAD库加载成功:', vadModule);
      
      // 检查VAD对象是否存在
      if (!vadModule.VAD) {
        console.error('VAD库结构:', Object.keys(vadModule));
        throw new Error('VAD对象不存在于加载的模块中');
      }
      
      return vadModule;
    } catch (error) {
      console.error('VAD库加载失败:', error);
      console.error('错误详情:', error);
      throw new Error(`无法加载VAD语音检测库: ${error instanceof Error ? error.message : '未知错误'}`);
    }
  }

  // 通知状态变化
  private notifyStateChange(): void {
    this.callbacks.onStateChange?.(this.getState());
  }
}

// 创建VAD管理器实例的工厂函数
export function createVADManager(
  callbacks: VADEventCallbacks = {},
  config: VADConfig = {}
): VADManager {
  return new VADVoiceManager(callbacks, config);
}

// VAD管理器单例（可选使用）
let globalVADManager: VADManager | null = null;

export function getGlobalVADManager(
  callbacks: VADEventCallbacks = {},
  config: VADConfig = {}
): VADManager {
  if (!globalVADManager) {
    globalVADManager = createVADManager(callbacks, config);
  }
  return globalVADManager;
}

export function destroyGlobalVADManager(): void {
  if (globalVADManager) {
    globalVADManager.destroy();
    globalVADManager = null;
  }
}