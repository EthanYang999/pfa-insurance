"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { AlertCircle, CheckCircle, Eye, EyeOff } from "lucide-react";

interface CreateUserFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
}

interface CreateUserData {
  email: string;
  password: string;
  role: string;
  sendEmail: boolean;
}

export function CreateUserForm({ open, onOpenChange, onSuccess }: CreateUserFormProps) {
  const [formData, setFormData] = useState<CreateUserData>({
    email: '',
    password: '',
    role: 'user',
    sendEmail: true
  });
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);

  // 生成随机密码
  const generatePassword = () => {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*';
    let password = '';
    for (let i = 0; i < 12; i++) {
      password += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    setFormData(prev => ({ ...prev, password }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(null);

    try {
      const response = await fetch('/api/admin/users/create', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      const result = await response.json();

      if (response.ok) {
        setSuccess(result.message);
        setTimeout(() => {
          onSuccess();
          onOpenChange(false);
          // 重置表单
          setFormData({
            email: '',
            password: '',
            role: 'user',
            sendEmail: true
          });
          setSuccess(null);
        }, 2000);
      } else {
        setError(result.error || '创建用户失败');
      }
    } catch (error) {
      setError('网络错误，请重试');
      console.error('创建用户失败:', error);
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({
      email: '',
      password: '',
      role: 'user',
      sendEmail: true
    });
    setError(null);
    setSuccess(null);
  };

  const handleOpenChange = (newOpen: boolean) => {
    if (!newOpen) {
      resetForm();
    }
    onOpenChange(newOpen);
  };

  // 验证邮箱格式
  const isEmailValid = (email: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  // 验证密码强度
  const isPasswordValid = (password: string) => {
    return password.length >= 6;
  };

  const canSubmit = formData.email && 
                   formData.password && 
                   isEmailValid(formData.email) && 
                   isPasswordValid(formData.password) && 
                   !loading;

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>创建新用户</DialogTitle>
          <DialogDescription>
            填写用户信息创建新账户。创建后用户将收到邀请邮件（如果选择发送）。
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* 邮箱 */}
          <div className="space-y-2">
            <Label htmlFor="email">邮箱地址 *</Label>
            <Input
              id="email"
              type="email"
              placeholder="user@example.com"
              value={formData.email}
              onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
              className={!formData.email || isEmailValid(formData.email) ? '' : 'border-red-500'}
              required
            />
            {formData.email && !isEmailValid(formData.email) && (
              <p className="text-sm text-red-500">请输入有效的邮箱地址</p>
            )}
          </div>

          {/* 密码 */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label htmlFor="password">临时密码 *</Label>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={generatePassword}
                className="text-xs h-auto p-1"
              >
                生成随机密码
              </Button>
            </div>
            <div className="relative">
              <Input
                id="password"
                type={showPassword ? "text" : "password"}
                placeholder="至少6位字符"
                value={formData.password}
                onChange={(e) => setFormData(prev => ({ ...prev, password: e.target.value }))}
                className={!formData.password || isPasswordValid(formData.password) ? '' : 'border-red-500'}
                required
              />
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? (
                  <EyeOff className="h-4 w-4" />
                ) : (
                  <Eye className="h-4 w-4" />
                )}
              </Button>
            </div>
            {formData.password && !isPasswordValid(formData.password) && (
              <p className="text-sm text-red-500">密码长度不能少于6位</p>
            )}
          </div>

          {/* 角色 */}
          <div className="space-y-2">
            <Label htmlFor="role">用户角色</Label>
            <Select
              value={formData.role}
              onValueChange={(value) => setFormData(prev => ({ ...prev, role: value }))}
            >
              <SelectTrigger>
                <SelectValue placeholder="选择用户角色" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="user">普通用户</SelectItem>
                <SelectItem value="admin">管理员</SelectItem>
                <SelectItem value="super_admin">超级管理员</SelectItem>
              </SelectContent>
            </Select>
            <p className="text-sm text-gray-500">
              {formData.role === 'user' && '只能访问聊天功能'}
              {formData.role === 'admin' && '可以管理用户和查看系统数据'}
              {formData.role === 'super_admin' && '拥有所有权限，包括系统配置'}
            </p>
          </div>

          {/* 发送邮件选项 */}
          <div className="flex items-center space-x-2">
            <Checkbox
              id="sendEmail"
              checked={formData.sendEmail}
              onCheckedChange={(checked) => 
                setFormData(prev => ({ ...prev, sendEmail: !!checked }))
              }
            />
            <Label htmlFor="sendEmail" className="text-sm">
              发送邀请邮件给用户
            </Label>
          </div>

          {/* 错误信息 */}
          {error && (
            <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-md">
              <AlertCircle className="h-4 w-4 text-red-500" />
              <p className="text-sm text-red-700">{error}</p>
            </div>
          )}

          {/* 成功信息 */}
          {success && (
            <div className="flex items-center gap-2 p-3 bg-green-50 border border-green-200 rounded-md">
              <CheckCircle className="h-4 w-4 text-green-500" />
              <p className="text-sm text-green-700">{success}</p>
            </div>
          )}

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => handleOpenChange(false)}
              disabled={loading}
            >
              取消
            </Button>
            <Button
              type="submit"
              disabled={!canSubmit}
              className="bg-pfa-royal-blue hover:bg-pfa-navy-blue"
            >
              {loading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin mr-2" />
                  创建中...
                </>
              ) : (
                '创建用户'
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}