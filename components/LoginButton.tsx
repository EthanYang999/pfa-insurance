"use client";

import { LogIn } from "lucide-react";

interface LoginButtonProps {
  onClick: () => void;
}

export function LoginButton({ onClick }: LoginButtonProps) {
  return (
    <button
      onClick={onClick}
      className="flex items-center gap-2 px-3 py-1.5 bg-pfa-champagne-gold text-pfa-royal-blue rounded-lg text-sm font-medium hover:bg-pfa-champagne-gold/90 transition-colors"
    >
      <LogIn className="w-4 h-4" />
      <span className="hidden sm:inline">登录</span>
    </button>
  );
}