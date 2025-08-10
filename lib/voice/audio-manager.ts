// 音频播放队列管理器
// 处理TTS音频的队列播放、打断控制和状态管理

import type { AudioQueueItem } from '@/types/voice';

export interface AudioManager {
  addToQueue(text: string, priority?: boolean): Promise<string>;
  play(id?: string): Promise<void>;
  pause(): void;
  stop(): void;
  clear(): void;
  interrupt(): void;
  getCurrentItem(): AudioQueueItem | null;
  getQueue(): AudioQueueItem[];
  getState(): AudioManagerState;
}

export interface AudioManagerState {
  isPlaying: boolean;
  isPaused: boolean;
  currentItemId?: string;
  queueLength: number;
  volume: number;
  error?: string;
}

export interface AudioManagerCallbacks {
  onPlay?: (item: AudioQueueItem) => void;
  onPause?: () => void;
  onStop?: () => void;
  onComplete?: (item: AudioQueueItem) => void;
  onError?: (error: string, item?: AudioQueueItem) => void;
  onQueueChange?: (queue: AudioQueueItem[]) => void;
  onStateChange?: (state: AudioManagerState) => void;
}

export class TTSAudioManager implements AudioManager {
  private audioContext: AudioContext | null = null;
  private currentSource: AudioBufferSourceNode | null = null;
  private gainNode: GainNode | null = null;
  private queue: AudioQueueItem[] = [];
  private state: AudioManagerState = {
    isPlaying: false,
    isPaused: false,
    queueLength: 0,
    volume: 1.0
  };
  private callbacks: AudioManagerCallbacks = {};
  private itemCounter = 0;

  constructor(callbacks: AudioManagerCallbacks = {}) {
    this.callbacks = callbacks;
    this.initializeAudioContext();
  }

  // 初始化音频上下文
  private async initializeAudioContext(): Promise<void> {
    try {
      const AudioContextClass = window.AudioContext || window.webkitAudioContext;
      this.audioContext = new AudioContextClass();
      
      // 创建增益节点用于音量控制
      this.gainNode = this.audioContext.createGain();
      this.gainNode.connect(this.audioContext.destination);
      this.gainNode.gain.value = this.state.volume;

      console.log('音频上下文初始化成功');
    } catch (error: any) {
      const errorMessage = `音频上下文初始化失败: ${error.message}`;
      console.error(errorMessage, error);
      this.state.error = errorMessage;
      this.callbacks.onError?.(errorMessage);
    }
  }

  // 添加到播放队列
  async addToQueue(text: string, priority: boolean = false): Promise<string> {
    const id = `audio-${++this.itemCounter}-${Date.now()}`;
    
    const item: AudioQueueItem = {
      id,
      text,
      isPlaying: false
    };

    // 优先级插入到队列前面，否则添加到末尾
    if (priority) {
      this.queue.unshift(item);
    } else {
      this.queue.push(item);
    }

    this.updateQueueState();
    console.log(`音频项目已添加到队列: ${id}, 文本: "${text.substring(0, 30)}..."`);

    // 获取音频数据
    try {
      const audioData = await this.fetchTTSAudio(text);
      if (audioData && this.audioContext) {
        const audioBuffer = await this.audioContext.decodeAudioData(audioData);
        item.audioBuffer = audioBuffer;
        console.log(`音频解码成功: ${id}, 时长: ${audioBuffer.duration.toFixed(2)}秒`);
      }
    } catch (error: any) {
      console.error(`音频获取失败: ${id}`, error);
      item.audioBuffer = undefined;
      this.callbacks.onError?.(error.message, item);
    }

    this.updateQueueState();

    // 🔒 安全的播放检查，避免并发调用
    if (!this.state.isPlaying && !this.state.isPaused && !this.state.currentItemId) {
      // 短暂延迟，让音频合成有时间完成
      setTimeout(() => {
        if (!this.state.isPlaying && !this.state.isPaused) {
          this.playNext();
        }
      }, 50);
    }

    return id;
  }

  // 播放指定项目或下一个项目
  async play(id?: string): Promise<void> {
    if (!this.audioContext) {
      await this.initializeAudioContext();
      if (!this.audioContext) {
        throw new Error('音频上下文未初始化');
      }
    }

    // 恢复音频上下文（用户交互后）
    if (this.audioContext.state === 'suspended') {
      await this.audioContext.resume();
    }

    let targetItem: AudioQueueItem | undefined;

    if (id) {
      // 播放指定项目
      targetItem = this.queue.find(item => item.id === id);
      if (!targetItem) {
        throw new Error(`未找到音频项目: ${id}`);
      }
    } else if (this.state.isPaused && this.currentSource) {
      // 恢复暂停的播放
      this.state.isPaused = false;
      this.state.isPlaying = true;
      this.notifyStateChange();
      return;
    } else {
      // 播放下一个项目
      targetItem = this.queue.find(item => !item.isPlaying);
    }

    if (!targetItem) {
      console.log('队列中没有可播放的项目');
      return;
    }

    await this.playItem(targetItem);
  }

  // 播放指定项目
  private async playItem(item: AudioQueueItem): Promise<void> {
    if (!this.audioContext || !this.gainNode) {
      throw new Error('音频上下文未准备就绪');
    }

    // 🔒 防止重复播放检查
    if (item.isPlaying || this.state.currentItemId === item.id) {
      console.warn(`⚠️ 项目已在播放中，跳过: ${item.id}`);
      return;
    }

    // 🔒 立即标记为播放状态，防止并发调用
    item.isPlaying = true;
    this.state.currentItemId = item.id;

    if (!item.audioBuffer) {
      console.warn(`音频缓冲区未就绪: ${item.id}`);
      // 尝试重新获取音频
      try {
        const audioData = await this.fetchTTSAudio(item.text);
        if (audioData) {
          item.audioBuffer = await this.audioContext.decodeAudioData(audioData);
        }
      } catch (error: any) {
        console.error(`重新获取音频失败: ${item.id}`, error);
        this.callbacks.onError?.(error.message, item);
        this.playNext(); // 跳过这个项目，播放下一个
        return;
      }
    }

    if (!item.audioBuffer) {
      console.error(`无法播放音频项目: ${item.id}`);
      // 🔒 清理状态
      item.isPlaying = false;
      this.state.currentItemId = undefined;
      this.playNext();
      return;
    }

    try {
      console.log(`开始播放音频: ${item.id}`);

      // 停止当前播放
      if (this.currentSource) {
        this.currentSource.stop();
        this.currentSource = null;
      }

      // 创建新的音频源
      this.currentSource = this.audioContext.createBufferSource();
      this.currentSource.buffer = item.audioBuffer;
      this.currentSource.connect(this.gainNode);

      // 设置播放结束回调
      this.currentSource.onended = () => {
        console.log(`音频播放完成: ${item.id}`);
        item.isPlaying = false;
        this.currentSource = null;
        
        this.callbacks.onComplete?.(item);
        this.removeFromQueue(item.id);
        
        // 播放下一个项目
        this.playNext();
      };

      // 开始播放
      this.currentSource.start(0);
      
      item.isPlaying = true;
      this.state.isPlaying = true;
      this.state.isPaused = false;
      this.state.currentItemId = item.id;
      
      this.callbacks.onPlay?.(item);
      this.updateQueueState();
      
    } catch (error: any) {
      const errorMessage = `播放音频失败: ${error.message}`;
      console.error(errorMessage, error);
      
      // 🔒 完整清理状态
      item.isPlaying = false;
      this.state.isPlaying = false;
      this.state.currentItemId = undefined;
      this.state.error = errorMessage;
      this.callbacks.onError?.(errorMessage, item);
      
      // 跳过错误项目，播放下一个
      this.playNext();
    }
  }

  // 播放下一个项目
  private playNext(): void {
    // 🔍 查找未播放且不是当前项目的下一个项目
    const nextItem = this.queue.find(item => 
      !item.isPlaying && 
      item.id !== this.state.currentItemId
    );
    
    if (nextItem) {
      this.playItem(nextItem);
    } else {
      // 队列播放完成
      this.state.isPlaying = false;
      this.state.currentItemId = undefined;
      this.notifyStateChange();
      console.log('音频队列播放完成');
    }
  }

  // 暂停播放
  pause(): void {
    if (!this.state.isPlaying) {
      console.log('当前没有播放中的音频');
      return;
    }

    // Web Audio API不支持暂停，只能停止
    // 这里我们标记为暂停状态，但实际上会停止播放
    this.state.isPaused = true;
    this.state.isPlaying = false;
    
    if (this.currentSource) {
      this.currentSource.stop();
      this.currentSource = null;
    }

    this.callbacks.onPause?.();
    this.notifyStateChange();
    console.log('音频播放已暂停');
  }

  // 停止播放
  stop(): void {
    if (this.currentSource) {
      this.currentSource.stop();
      this.currentSource = null;
    }

    // 重置所有项目状态
    this.queue.forEach(item => {
      item.isPlaying = false;
    });

    this.state.isPlaying = false;
    this.state.isPaused = false;
    this.state.currentItemId = undefined;

    this.callbacks.onStop?.();
    this.updateQueueState();
    console.log('音频播放已停止');
  }

  // 清空队列
  clear(): void {
    this.stop();
    this.queue = [];
    this.updateQueueState();
    console.log('音频队列已清空');
  }

  // 中断当前播放和队列
  interrupt(): void {
    console.log('音频播放被中断');
    this.clear();
  }

  // 设置音量
  setVolume(volume: number): void {
    this.state.volume = Math.max(0, Math.min(1, volume));
    if (this.gainNode) {
      this.gainNode.gain.value = this.state.volume;
    }
    this.notifyStateChange();
  }

  // 获取当前播放项目
  getCurrentItem(): AudioQueueItem | null {
    if (!this.state.currentItemId) return null;
    return this.queue.find(item => item.id === this.state.currentItemId) || null;
  }

  // 获取队列
  getQueue(): AudioQueueItem[] {
    return [...this.queue];
  }

  // 获取状态
  getState(): AudioManagerState {
    return { ...this.state };
  }

  // 从队列中移除项目
  private removeFromQueue(id: string): void {
    const index = this.queue.findIndex(item => item.id === id);
    if (index !== -1) {
      this.queue.splice(index, 1);
      this.updateQueueState();
    }
  }

  // 更新队列状态
  private updateQueueState(): void {
    this.state.queueLength = this.queue.length;
    this.callbacks.onQueueChange?.(this.getQueue());
    this.notifyStateChange();
  }

  // 通知状态变化
  private notifyStateChange(): void {
    this.callbacks.onStateChange?.(this.getState());
  }

  // 获取TTS音频数据
  private async fetchTTSAudio(text: string): Promise<ArrayBuffer | null> {
    try {
      const response = await fetch('/api/voice/tts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text })
      });

      if (!response.ok) {
        throw new Error(`TTS API错误: ${response.status} ${response.statusText}`);
      }

      return await response.arrayBuffer();
    } catch (error: any) {
      console.error('获取TTS音频失败:', error);
      throw error;
    }
  }

  // 销毁管理器
  destroy(): void {
    this.stop();
    this.clear();
    
    if (this.audioContext && this.audioContext.state !== 'closed') {
      this.audioContext.close();
    }
    
    this.audioContext = null;
    this.gainNode = null;
    console.log('音频管理器已销毁');
  }
}

// 创建音频管理器实例的工厂函数
export function createAudioManager(callbacks: AudioManagerCallbacks = {}): AudioManager {
  return new TTSAudioManager(callbacks);
}