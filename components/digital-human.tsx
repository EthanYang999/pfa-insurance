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
      isMinimized ? "h-32" : "h-full",
      className
    )}>
      {/* 顶部控制栏 */}
      <div className="flex items-center justify-between p-4 bg-black/10">
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 bg-coach-gold-accent rounded-full animate-pulse"></div>
          <span className="text-coach-gold-light text-sm font-medium">
            雪莉教练
          </span>
        </div>
        
        <div className="flex items-center gap-2">
          {/* 音量控制 */}
          <button
            onClick={() => setIsMuted(!isMuted)}
            className="w-8 h-8 bg-white/10 hover:bg-white/20 rounded-md flex items-center justify-center transition-colors"
            title={isMuted ? "开启音量" : "关闭音量"}
          >
            {isMuted ? (
              <VolumeX className="w-4 h-4 text-white" />
            ) : (
              <Volume2 className="w-4 h-4 text-white" />
            )}
          </button>
          
          {/* 最大化/最小化控制 (仅移动端显示) */}
          {onToggleMinimize && (
            <button
              onClick={onToggleMinimize}
              className="w-8 h-8 bg-white/10 hover:bg-white/20 rounded-md flex items-center justify-center transition-colors md:hidden"
              title={isMinimized ? "展开数字人" : "最小化数字人"}
            >
              {isMinimized ? (
                <Maximize2 className="w-4 h-4 text-white" />
              ) : (
                <Minimize2 className="w-4 h-4 text-white" />
              )}
            </button>
          )}
        </div>
      </div>
      
      {/* 数字人展示区域 */}
      <div className="flex-1 relative overflow-hidden">
        {/* UE5数字人容器 - 预留集成接口 */}
        <div 
          id="ue5-digital-human-container"
          className="absolute inset-0 flex items-center justify-center"
        >
          {/* 占位符内容 - 等待UE5集成 */}
          <div className="text-center text-white">
            <div className="w-24 h-24 mx-auto mb-4 bg-coach-gold-accent/20 rounded-full flex items-center justify-center">
              <div className="w-16 h-16 bg-coach-gold-accent/40 rounded-full flex items-center justify-center">
                <div className="w-8 h-8 bg-coach-gold-accent rounded-full"></div>
              </div>
            </div>
            
            {!isMinimized && (
              <>
                <h3 className="text-lg font-semibold mb-2">雪莉教练</h3>
                <p className="text-coach-gold-light text-sm opacity-80">
                  AI保险培训专家
                </p>
                <div className="mt-4 text-xs text-white/60">
                  UE5数字人集成预备中...
                </div>
              </>
            )}
          </div>
        </div>
        
        {/* 状态指示器 */}
        <div className="absolute bottom-4 left-4 flex items-center gap-2">
          <div className="w-2 h-2 bg-coach-status-success rounded-full animate-pulse"></div>
          <span className="text-white text-xs">在线</span>
        </div>
      </div>
      
      {/* 底部信息栏 (仅在完整模式下显示) */}
      {!isMinimized && (
        <div className="p-4 bg-black/20 border-t border-white/10">
          <div className="text-center text-white/80 text-xs">
            专业 • 可靠 • 随时在线
          </div>
        </div>
      )}
    </div>
  );
}