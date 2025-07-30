"use client";

import { cn } from "@/lib/utils";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import Link from "next/link";
import { useState } from "react";

export function ForgotPasswordForm({
  className,
  ...props
}: React.ComponentPropsWithoutRef<"div">) {
  const [email, setEmail] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    const supabase = createClient();
    setIsLoading(true);
    setError(null);

    try {
      // The url which will be included in the email. This URL needs to be configured in your redirect URLs in the Supabase dashboard at https://supabase.com/dashboard/project/_/auth/url-configuration
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/auth/update-password`,
      });
      if (error) throw error;
      setSuccess(true);
    } catch (error: unknown) {
      setError(error instanceof Error ? error.message : "发送失败，请重试");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className={cn("", className)} {...props}>
      {success ? (
        <div className="text-center">
          <div className="mb-6">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h3 className="text-xl font-semibold text-pfa-royal-blue mb-2">请检查您的邮箱</h3>
            <p className="text-pfa-dark-gray text-sm">
              密码重置邮件已发送。如果您使用邮箱和密码注册，您将收到重置密码的邮件。
            </p>
          </div>
          <Link
            href="/auth/login"
            className="text-pfa-champagne-gold hover:text-pfa-accent-gold font-medium transition-colors"
          >
            返回登录
          </Link>
        </div>
      ) : (
        <form onSubmit={handleForgotPassword}>
          <div className="space-y-4">
            <div>
              <Label htmlFor="email" className="text-pfa-royal-blue font-medium">
                邮箱地址
              </Label>
              <Input
                id="email"
                type="email"
                placeholder="请输入您的邮箱"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="mt-1 border-pfa-royal-blue/20 focus:border-pfa-royal-blue focus:ring-pfa-royal-blue/20"
              />
            </div>
            
            {error && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-md">
                <p className="text-sm text-red-600">{error}</p>
              </div>
            )}
            
            <Button 
              type="submit" 
              className="w-full h-11 text-base bg-pfa-champagne-gold hover:bg-pfa-accent-gold text-pfa-royal-blue font-semibold transition-colors"
              disabled={isLoading}
            >
              {isLoading ? (
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 border-2 border-pfa-royal-blue/30 border-t-pfa-royal-blue rounded-full animate-spin" />
                  发送中...
                </div>
              ) : (
                "发送重置邮件"
              )}
            </Button>
          </div>
          
          <div className="mt-6 text-center text-sm text-pfa-dark-gray">
            想起密码了？{" "}
            <Link
              href="/auth/login"
              className="text-pfa-champagne-gold hover:text-pfa-accent-gold font-medium transition-colors"
            >
              立即登录
            </Link>
          </div>
        </form>
      )}
    </div>
  );
}
