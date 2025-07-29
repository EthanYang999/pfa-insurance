"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Send, Mic, MicOff } from "lucide-react";

interface ChatInputProps {
  onSendMessage: (message: string) => void;
  disabled?: boolean;
  placeholder?: string;
  className?: string;
}

export function ChatInput({ 
  onSendMessage, 
  disabled = false, 
  placeholder = "请输入您的问题，雪莉教练会为您提供专业指导...",
  className 
}: ChatInputProps) {
  const [message, setMessage] = useState("");
  const [isVoiceMode, setIsVoiceMode] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (message.trim() && !disabled) {
      onSendMessage(message.trim());
      setMessage("");
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  const toggleVoiceMode = () => {
    setIsVoiceMode(!isVoiceMode);
    // TODO: 实现语音功能
  };

  return (
    <div className={cn("bg-white border-t border-coach-gray-disabled p-4", className)}>
      <form onSubmit={handleSubmit} className="flex gap-3 items-end">
        <div className="flex-1">
          <Textarea
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={placeholder}
            disabled={disabled}
            className="input-primary resize-none min-h-[44px] max-h-32"
            rows={1}
          />
        </div>
        
        {/* 语音按钮 (预留) */}
        <Button
          type="button"
          variant="outline"
          size="icon"
          onClick={toggleVoiceMode}
          className="h-11 w-11 border-coach-gray-disabled hover:border-coach-blue-secondary hover:bg-coach-blue-secondary hover:text-white transition-colors"
          title={isVoiceMode ? "关闭语音模式" : "开启语音模式"}
        >
          {isVoiceMode ? (
            <MicOff className="w-4 h-4" />
          ) : (
            <Mic className="w-4 h-4" />
          )}
        </Button>
        
        {/* 发送按钮 */}
        <Button
          type="submit"
          disabled={!message.trim() || disabled}
          className="btn-primary h-11 px-6 gap-2"
        >
          <Send className="w-4 h-4" />
          发送
        </Button>
      </form>
      
      {/* 提示文本 */}
      <div className="mt-2 text-xs text-coach-gray-medium text-center">
        按 Enter 发送消息，Shift + Enter 换行
      </div>
    </div>
  );
}