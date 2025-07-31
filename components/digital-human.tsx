"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";
import { Maximize2, Minimize2, Volume2, VolumeX } from "lucide-react";

interface DigitalHumanProps {
  className?: string;
  isMinimized?: boolean;
  onToggleMinimize?: () => void;
}

export function DigitalHuman({ 
  className, 
  isMinimized = false, 
  onToggleMinimize 
}: DigitalHumanProps) {
  const [isMuted, setIsMuted] = useState(false);

  return (
    <div className={cn(
      "relative bg-gradient-to-br from-coach-blue-primary to-coach-blue-gradient flex flex-col",
      isMinimized ? "h-16 md:h-full" : "h-full",
      className
    )}>
      {/* 顶部控制栏 */}
      <div className={cn(
        "flex items-center justify-between bg-black/10",
        isMinimized ? "p-2 md:p-4" : "p-3 sm:p-4"
      )}>
        <div className="flex items-center gap-1.5 sm:gap-2 min-w-0">
          <div className={cn(
            "bg-coach-gold-accent rounded-full animate-pulse flex-shrink-0",
            isMinimized ? "w-2 h-2 md:w-3 md:h-3" : "w-3 h-3"
          )}></div>
          <span className={cn(
            "text-coach-gold-light font-medium truncate",
            isMinimized ? "text-xs md:text-sm" : "text-sm"
          )}>
            AI助手
          </span>
        </div>
        
        <div className="flex items-center gap-1 sm:gap-2 flex-shrink-0">
          {/* 音量控制 */}
          <button
            onClick={() => setIsMuted(!isMuted)}
            className={cn(
              "bg-white/10 hover:bg-white/20 rounded-md flex items-center justify-center transition-colors",
              isMinimized ? "w-6 h-6 md:w-8 md:h-8" : "w-7 h-7 sm:w-8 sm:h-8"
            )}
            title={isMuted ? "开启音量" : "关闭音量"}
          >
            {isMuted ? (
              <VolumeX className={cn("text-white", isMinimized ? "w-3 h-3 md:w-4 md:h-4" : "w-3.5 h-3.5 sm:w-4 sm:h-4")} />
            ) : (
              <Volume2 className={cn("text-white", isMinimized ? "w-3 h-3 md:w-4 md:h-4" : "w-3.5 h-3.5 sm:w-4 sm:h-4")} />
            )}
          </button>
          
          {/* 最大化/最小化控制 (仅移动端显示) */}
          {onToggleMinimize && (
            <button
              onClick={onToggleMinimize}
              className={cn(
                "bg-white/10 hover:bg-white/20 rounded-md flex items-center justify-center transition-colors md:hidden",
                isMinimized ? "w-6 h-6" : "w-7 h-7"
              )}
              title={isMinimized ? "展开数字人" : "最小化数字人"}
            >
              {isMinimized ? (
                <Maximize2 className={cn("text-white", isMinimized ? "w-3 h-3" : "w-3.5 h-3.5")} />
              ) : (
                <Minimize2 className={cn("text-white", isMinimized ? "w-3 h-3" : "w-3.5 h-3.5")} />
              )}
            </button>
          )}
        </div>
      </div>
      
      {/* 数字人展示区域 */}
      {!isMinimized && (
        <div className="flex-1 relative overflow-hidden">
          {/* UE5数字人容器 - 预留集成接口 */}
          <div 
            id="ue5-digital-human-container"
            className="absolute inset-0 flex items-center justify-center"
          >
            {/* 占位符内容 - 等待UE5集成 */}
            <div className="text-center text-white px-4">
              <div className={cn(
                "mx-auto mb-2 sm:mb-4 bg-coach-gold-accent/20 rounded-full flex items-center justify-center",
                "w-16 h-16 sm:w-20 sm:h-20 md:w-24 md:h-24"
              )}>
                <div className={cn(
                  "bg-coach-gold-accent/40 rounded-full flex items-center justify-center",
                  "w-10 h-10 sm:w-12 sm:h-12 md:w-16 md:h-16"
                )}>
                  <div className={cn(
                    "bg-coach-gold-accent rounded-full",
                    "w-5 h-5 sm:w-6 sm:h-6 md:w-8 md:h-8"
                  )}></div>
                </div>
              </div>
              
              <h3 className="text-sm sm:text-base md:text-lg font-semibold mb-1 sm:mb-2">PFA智能助手</h3>
              <p className="text-coach-gold-light text-xs sm:text-sm opacity-80">
                AI保险培训助手
              </p>
            </div>
          </div>
          
          {/* 状态指示器 */}
          <div className="absolute bottom-2 sm:bottom-4 left-2 sm:left-4 flex items-center gap-1.5 sm:gap-2">
            <div className="w-1.5 h-1.5 sm:w-2 sm:h-2 bg-coach-status-success rounded-full animate-pulse"></div>
            <span className="text-white text-xs">在线</span>
          </div>
        </div>
      )}
      
      {/* 底部信息栏 (仅在完整模式下显示) */}
      {!isMinimized && (
        <div className="p-2 sm:p-3 md:p-4 bg-black/20 border-t border-white/10 hidden sm:block">
          <div className="text-center text-white/80 text-xs">
            专业 • 可靠 • 随时在线
          </div>
        </div>
      )}
    </div>
  );
}