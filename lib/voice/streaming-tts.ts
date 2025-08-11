// 流式TTS处理逻辑
// 从 VoiceInteraction.tsx 中提取的核心逻辑

import type { AudioManager } from './audio-manager';

// 🧹 TTS文本清理函数 - 移除Markdown格式和表情符号
function cleanTextForTTS(text: string): string {
  if (!text || typeof text !== 'string') return '';
  
  let cleanText = text;
  
  // 1. 移除Markdown链接格式 [文字](链接) -> 文字
  cleanText = cleanText.replace(/\[([^\]]+)\]\([^)]+\)/g, '$1');
  
  // 2. 移除Markdown粗体格式 **文字** -> 文字
  cleanText = cleanText.replace(/\*\*([^*]+)\*\*/g, '$1');
  
  // 3. 移除Markdown斜体格式 *文字* -> 文字
  cleanText = cleanText.replace(/\*([^*]+)\*/g, '$1');
  
  // 4. 移除代码块格式 ```代码``` -> (移除)
  cleanText = cleanText.replace(/```[\s\S]*?```/g, '');
  
  // 5. 移除行内代码格式 `代码` -> 代码
  cleanText = cleanText.replace(/`([^`]+)`/g, '$1');
  
  // 6. 移除标题格式 # 标题 -> 标题
  cleanText = cleanText.replace(/^#{1,6}\s+/gm, '');
  
  // 7. 移除列表符号 - 项目 -> 项目
  cleanText = cleanText.replace(/^[-*+]\s+/gm, '');
  
  // 8. 移除数字列表 1. 项目 -> 项目
  cleanText = cleanText.replace(/^\d+\.\s+/gm, '');
  
  // 9. 移除引用格式 > 引用 -> 引用
  cleanText = cleanText.replace(/^>\s+/gm, '');
  
  // 10. 移除表情符号 (Unicode范围)
  cleanText = cleanText.replace(/[\u{1F600}-\u{1F64F}]|[\u{1F300}-\u{1F5FF}]|[\u{1F680}-\u{1F6FF}]|[\u{1F1E0}-\u{1F1FF}]|[\u{2600}-\u{26FF}]|[\u{2700}-\u{27BF}]/gu, '');
  
  // 11. 移除常见文本表情符号
  cleanText = cleanText.replace(/:\w+:/g, ''); // :smile:, :heart: 等
  
  // 12. 移除多余的空白字符
  cleanText = cleanText.replace(/\s+/g, ' ');
  
  // 13. 移除首尾空白
  cleanText = cleanText.trim();
  
  return cleanText;
}

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
        // 🧹 清理Markdown格式和表情符号
        const cleanedSentence = cleanTextForTTS(sentence.trim());
        
        // 跳过清理后为空的句子
        if (!cleanedSentence) continue;
        
        console.log('原始句子:', sentence.substring(0, 30) + '...');
        console.log('清理后句子:', cleanedSentence.substring(0, 30) + '...');
        
        try {
          await this.audioManager.addToQueue(cleanedSentence);
        } catch (error) {
          console.error('添加句子到TTS队列失败:', error);
        }
      }
    }
  }

  // 处理剩余文本（流式结束时调用）
  async processRemainingText(): Promise<void> {
    if (!this.textBuffer.trim() || !this.audioManager) return;

    // 🧹 清理Markdown格式和表情符号
    const cleanedText = cleanTextForTTS(this.textBuffer.trim());
    
    if (cleanedText) {
      console.log('流式TTS合成剩余文本 - 原始:', this.textBuffer.substring(0, 30) + '...');
      console.log('流式TTS合成剩余文本 - 清理后:', cleanedText.substring(0, 30) + '...');
      
      try {
        await this.audioManager.addToQueue(cleanedText);
      } catch (error) {
        console.error('添加剩余文本到TTS队列失败:', error);
      }
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
      // 🧹 清理Markdown格式和表情符号
      const cleanedText = cleanTextForTTS(this.textBuffer.trim());
      
      if (cleanedText) {
        console.log('强制刷新TTS缓冲区 - 原始:', this.textBuffer.substring(0, 30) + '...');
        console.log('强制刷新TTS缓冲区 - 清理后:', cleanedText.substring(0, 30) + '...');
        await this.audioManager.addToQueue(cleanedText);
      }
      
      this.textBuffer = '';
    }
  }

  // 🚀 定时强制刷新缓冲区
  private async forceFlushBuffer(): Promise<void> {
    if (this.textBuffer.trim() && this.audioManager) {
      // 如果缓冲区有内容且超过1秒没有新内容，强制处理
      const timeSinceLastProcess = Date.now() - this.lastProcessTime;
      if (timeSinceLastProcess >= 1000 && this.textBuffer.length >= 10) {
        // 🧹 清理Markdown格式和表情符号
        const cleanedText = cleanTextForTTS(this.textBuffer.trim());
        
        if (cleanedText) {
          console.log('定时强制刷新TTS缓冲区 - 原始:', this.textBuffer.substring(0, 30) + '...');
          console.log('定时强制刷新TTS缓冲区 - 清理后:', cleanedText.substring(0, 30) + '...');
          await this.audioManager.addToQueue(cleanedText);
        }
        
        this.textBuffer = '';
      }
    }
    
    if (this.forceFlushTimer) {
      clearTimeout(this.forceFlushTimer);
      this.forceFlushTimer = null;
    }
  }
}