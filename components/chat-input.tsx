"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Send } from "lucide-react";

interface ChatInputProps {
  onSendMessage: (message: string) => void;
  disabled?: boolean;
  placeholder?: string;
  className?: string;
}

export function ChatInput({ 
  onSendMessage, 
  disabled = false, 
  placeholder = "请输入您的问题，PFA智能助手会为您提供专业指导...",
  className 
}: ChatInputProps) {
  const [message, setMessage] = useState("");

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


  return (
    <div className={cn("bg-white border-t border-coach-gray-disabled p-3 sm:p-4", className)}>
      <form onSubmit={handleSubmit} className="flex gap-2 sm:gap-3 items-end">
        <div className="flex-1">
          <Textarea
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={placeholder}
            disabled={disabled}
            className="input-primary resize-none min-h-[40px] sm:min-h-[44px] max-h-32 text-sm sm:text-base"
            rows={1}
          />
        </div>
        
        {/* 发送按钮 */}
        <Button
          type="submit"
          disabled={!message.trim() || disabled}
          className="btn-primary h-10 sm:h-11 px-3 sm:px-6 gap-1 sm:gap-2 text-sm sm:text-base"
        >
          <Send className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
          <span className="hidden sm:inline">发送</span>
        </Button>
      </form>
      
      {/* 提示文本 - 桌面端显示 */}
      <div className="mt-2 text-xs text-coach-gray-medium text-center hidden sm:block">
        按 Enter 发送消息，Shift + Enter 换行
      </div>
    </div>
  );
}