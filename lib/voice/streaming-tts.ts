// 流式TTS处理逻辑
// 从 VoiceInteraction.tsx 中提取的核心逻辑

import type { AudioManager } from './audio-manager';

export class StreamingTTSProcessor {
  private textBuffer: string = '';
  private audioManager: AudioManager | null = null;
  private conversationId: string = '';

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

  // 提取完整句子
  private extractCompleteSentences(): string[] {
    const sentenceEndings = /[.!?。！？]/g;
    const sentences: string[] = [];
    let lastIndex = 0;
    let match;

    while ((match = sentenceEndings.exec(this.textBuffer)) !== null) {
      const sentence = this.textBuffer.substring(lastIndex, match.index + 1);
      if (sentence.trim()) {
        sentences.push(sentence.trim());
      }
      lastIndex = match.index + 1;
    }

    // 更新文本缓冲区，保留未完成的部分
    this.textBuffer = this.textBuffer.substring(lastIndex);

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
}