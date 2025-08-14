"use client";

import { cn } from "@/lib/utils";
import { Bot, User } from "lucide-react";

interface ChatMessageProps {
  message: string;
  isUser: boolean;
  timestamp?: Date;
  className?: string;
}

export function ChatMessage({ message, isUser, timestamp, className }: ChatMessageProps) {
  return (
    <div className={cn("flex gap-2 sm:gap-3 mb-3 sm:mb-4", isUser ? "justify-end" : "justify-start", className)}>
      {/* AI头像 */}
      {!isUser && (
        <div className="flex-shrink-0 w-7 h-7 sm:w-8 sm:h-8 bg-coach-blue-secondary rounded-full flex items-center justify-center">
          <Bot className="w-3 h-3 sm:w-4 sm:h-4 text-white" />
        </div>
      )}
      
      {/* 消息内容 */}
      <div className={cn("message-bubble text-sm sm:text-base", isUser ? "message-user" : "message-ai")}>
        <div className="whitespace-pre-wrap break-words">
          {message}
        </div>
        {timestamp && (
          <div className={cn(
            "text-xs mt-1 sm:mt-2 opacity-70",
            isUser ? "text-white/70" : "text-coach-gray-medium"
          )}>
            {timestamp.toLocaleTimeString('zh-CN', { 
              hour: '2-digit', 
              minute: '2-digit' 
            })}
          </div>
        )}
      </div>
      
      {/* 用户头像 */}
      {isUser && (
        <div className="flex-shrink-0 w-7 h-7 sm:w-8 sm:h-8 bg-coach-gold-accent rounded-full flex items-center justify-center">
          <User className="w-3 h-3 sm:w-4 sm:h-4 text-white" />
        </div>
      )}
    </div>
  );
}

interface TypingIndicatorProps {
  className?: string;
}

export function TypingIndicator({ className }: TypingIndicatorProps) {
  return (
    <div className={cn("flex gap-2 sm:gap-3 mb-3 sm:mb-4", className)}>
      <div className="flex-shrink-0 w-7 h-7 sm:w-8 sm:h-8 bg-coach-blue-secondary rounded-full flex items-center justify-center">
        <Bot className="w-3 h-3 sm:w-4 sm:h-4 text-white" />
      </div>
      <div className="message-bubble message-ai text-sm sm:text-base">
        <div className="flex items-center gap-1">
          <span className="text-coach-gray-medium">AI实战教练正在思考</span>
          <div className="flex gap-1">
            <div className="w-1.5 h-1.5 sm:w-2 sm:h-2 bg-coach-gray-medium rounded-full animate-bounce [animation-delay:-0.3s]"></div>
            <div className="w-1.5 h-1.5 sm:w-2 sm:h-2 bg-coach-gray-medium rounded-full animate-bounce [animation-delay:-0.15s]"></div>
            <div className="w-1.5 h-1.5 sm:w-2 sm:h-2 bg-coach-gray-medium rounded-full animate-bounce"></div>
          </div>
        </div>
      </div>
    </div>
  );
}