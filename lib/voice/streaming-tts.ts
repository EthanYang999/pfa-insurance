// 流式TTS处理逻辑
// 从 VoiceInteraction.tsx 中提取的核心逻辑

import type { AudioManager } from './audio-manager';

export class StreamingTTSProcessor {
  private textBuffer: string = '';
  private audioManager: AudioManager | null = null;
  private conversationId: string = '';
  private lastProcessTime: number = 0;
  private forceFlushTimer: NodeJS.Timeout | null = null;

  constructor(audioManager: AudioManager | null) {
    this.audioManager = audioManager;
  }

  // 设置音频管理器
  setAudioManager(audioManager: AudioManager | null): void {
    this.audioManager = audioManager;
  }

  // 重置状态
  reset(): void {
    this.textBuffer = '';
    this.conversationId = '';
    this.lastProcessTime = 0;
    if (this.forceFlushTimer) {
      clearTimeout(this.forceFlushTimer);
      this.forceFlushTimer = null;
    }
  }

  // 设置对话ID
  setConversationId(conversationId: string): void {
    this.conversationId = conversationId;
  }

  // 处理文本块
  async processTextChunk(chunk: string): Promise<void> {
    if (!chunk?.trim() || !this.audioManager) return;

    // 添加到缓冲区
    this.textBuffer += chunk;
    this.lastProcessTime = Date.now();
    
    // 🚀 设置强制刷新定时器，确保即使没有句子结束符也能播放
    if (this.forceFlushTimer) {
      clearTimeout(this.forceFlushTimer);
    }
    this.forceFlushTimer = setTimeout(() => {
      this.forceFlushBuffer();
    }, 2000); // 2秒后强制刷新
    
    // 提取完整句子并进行TTS
    const sentences = this.extractCompleteSentences();
    
    for (const sentence of sentences) {
      if (sentence.trim()) {
        console.log('流式TTS合成句子:', sentence.substring(0, 30) + '...');
        try {
          await this.audioManager.addToQueue(sentence.trim());
        } catch (error) {
          console.error('添加句子到TTS队列失败:', error);
        }
      }
    }
  }

  // 处理剩余文本（流式结束时调用）
  async processRemainingText(): Promise<void> {
    if (!this.textBuffer.trim() || !this.audioManager) return;

    console.log('流式TTS合成剩余文本:', this.textBuffer.substring(0, 30) + '...');
    try {
      await this.audioManager.addToQueue(this.textBuffer.trim());
    } catch (error) {
      console.error('添加剩余文本到TTS队列失败:', error);
    }
    
    this.textBuffer = '';
  }

  // 提取完整句子（优化：更快触发TTS）
  private extractCompleteSentences(): string[] {
    // 🚀 扩展句子结束标记，包含更多中断点
    const sentenceEndings = /[.!?。！？;；:：,，\n]/g;
    const sentences: string[] = [];
    let lastIndex = 0;
    let match;

    while ((match = sentenceEndings.exec(this.textBuffer)) !== null) {
      const sentence = this.textBuffer.substring(lastIndex, match.index + 1);
      const trimmedSentence = sentence.trim();
      
      if (trimmedSentence) {
        // 🚀 降低最小长度要求，更快触发
        if (trimmedSentence.length >= 5) {
          sentences.push(trimmedSentence);
          lastIndex = match.index + 1;
        }
        // 🚀 对于很长的文本块，即使没有标点也要切分
        else if (this.textBuffer.length - lastIndex > 50) {
          sentences.push(trimmedSentence);
          lastIndex = match.index + 1;
        }
      }
    }

    // 🚀 如果缓冲区太长（>80字符）且没有句子分割，强制分割
    if (sentences.length === 0 && this.textBuffer.length > 80) {
      const forcedSplit = this.textBuffer.substring(0, 60).trim();
      if (forcedSplit) {
        sentences.push(forcedSplit);
        this.textBuffer = this.textBuffer.substring(60);
        return sentences;
      }
    }

    // 只有在找到句子时才更新缓冲区
    if (sentences.length > 0) {
      this.textBuffer = this.textBuffer.substring(lastIndex);
    }

    return sentences;
  }

  // 获取当前缓冲区状态
  getBufferInfo(): { buffer: string; isEmpty: boolean } {
    return {
      buffer: this.textBuffer,
      isEmpty: this.textBuffer.trim().length === 0
    };
  }

  // 强制处理当前缓冲区（用于紧急情况）
  async flushBuffer(): Promise<void> {
    if (this.textBuffer.trim() && this.audioManager) {
      console.log('强制刷新TTS缓冲区:', this.textBuffer);
      await this.audioManager.addToQueue(this.textBuffer.trim());
      this.textBuffer = '';
    }
  }

  // 🚀 定时强制刷新缓冲区
  private async forceFlushBuffer(): Promise<void> {
    if (this.textBuffer.trim() && this.audioManager) {
      // 如果缓冲区有内容且超过1秒没有新内容，强制处理
      const timeSinceLastProcess = Date.now() - this.lastProcessTime;
      if (timeSinceLastProcess >= 1000 && this.textBuffer.length >= 10) {
        console.log('定时强制刷新TTS缓冲区:', this.textBuffer.substring(0, 30) + '...');
        await this.audioManager.addToQueue(this.textBuffer.trim());
        this.textBuffer = '';
      }
    }
    
    if (this.forceFlushTimer) {
      clearTimeout(this.forceFlushTimer);
      this.forceFlushTimer = null;
    }
  }
}