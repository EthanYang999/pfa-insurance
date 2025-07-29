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
    <div className={cn("flex gap-3 mb-4", isUser ? "justify-end" : "justify-start", className)}>
      {/* AI头像 */}
      {!isUser && (
        <div className="flex-shrink-0 w-8 h-8 bg-coach-blue-secondary rounded-full flex items-center justify-center">
          <Bot className="w-4 h-4 text-white" />
        </div>
      )}
      
      {/* 消息内容 */}
      <div className={cn("message-bubble", isUser ? "message-user" : "message-ai")}>
        <div className="whitespace-pre-wrap break-words">
          {message}
        </div>
        {timestamp && (
          <div className={cn(
            "text-xs mt-2 opacity-70",
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
        <div className="flex-shrink-0 w-8 h-8 bg-coach-gold-accent rounded-full flex items-center justify-center">
          <User className="w-4 h-4 text-white" />
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
    <div className={cn("flex gap-3 mb-4", className)}>
      <div className="flex-shrink-0 w-8 h-8 bg-coach-blue-secondary rounded-full flex items-center justify-center">
        <Bot className="w-4 h-4 text-white" />
      </div>
      <div className="message-bubble message-ai">
        <div className="flex items-center gap-1">
          <span className="text-coach-gray-medium">雪莉正在思考</span>
          <div className="flex gap-1">
            <div className="w-2 h-2 bg-coach-gray-medium rounded-full animate-bounce [animation-delay:-0.3s]"></div>
            <div className="w-2 h-2 bg-coach-gray-medium rounded-full animate-bounce [animation-delay:-0.15s]"></div>
            <div className="w-2 h-2 bg-coach-gray-medium rounded-full animate-bounce"></div>
          </div>
        </div>
      </div>
    </div>
  );
}