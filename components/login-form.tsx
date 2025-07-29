"use client";

import { cn } from "@/lib/utils";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";

export function LoginForm({
  className,
  ...props
}: React.ComponentPropsWithoutRef<"div">) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    const supabase = createClient();
    setIsLoading(true);
    setError(null);

    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      if (error) throw error;
      // Update this route to redirect to an authenticated route. The user already has an active session.
      router.push("/protected");
    } catch (error: unknown) {
      setError(error instanceof Error ? error.message : "An error occurred");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className={cn("", className)} {...props}>
      <form onSubmit={handleLogin}>
        <div className="space-y-4">
          <div>
            <Label htmlFor="email" className="text-coach-gray-dark font-medium">
              邮箱地址
            </Label>
            <Input
              id="email"
              type="email"
              placeholder="请输入您的邮箱"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="input-primary mt-1"
            />
          </div>
          <div>
            <div className="flex items-center justify-between">
              <Label htmlFor="password" className="text-coach-gray-dark font-medium">
                密码
              </Label>
              <Link
                href="/auth/forgot-password"
                className="text-sm text-coach-blue-secondary hover:text-coach-blue-primary transition-colors"
              >
                忘记密码？
              </Link>
            </div>
            <Input
              id="password"
              type="password"
              placeholder="请输入您的密码"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="input-primary mt-1"
            />
          </div>
          
          {error && (
            <div className="p-3 bg-coach-status-error/10 border border-coach-status-error/30 rounded-md">
              <p className="text-sm text-coach-status-error">{error}</p>
            </div>
          )}
          
          <Button 
            type="submit" 
            className="btn-primary w-full h-11 text-base"
            disabled={isLoading}
          >
            {isLoading ? (
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                登录中...
              </div>
            ) : (
              "登录"
            )}
          </Button>
        </div>
        
        <div className="mt-6 text-center text-sm text-coach-gray-medium">
          还没有账户？{" "}
          <Link
            href="/auth/sign-up"
            className="text-coach-blue-secondary hover:text-coach-blue-primary font-medium transition-colors"
          >
            立即注册
          </Link>
        </div>
      </form>
    </div>
  );
}
