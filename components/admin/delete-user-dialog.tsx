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
import { AlertTriangle, Trash2, Ban, CheckCircle, AlertCircle } from "lucide-react";
import { UserInfo } from "@/types/admin";

interface DeleteUserDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  user: UserInfo | null;
  onSuccess: () => void;
}

export function DeleteUserDialog({ open, onOpenChange, user, onSuccess }: DeleteUserDialogProps) {
  const [deleteType, setDeleteType] = useState<'soft' | 'hard'>('soft');
  const [confirmEmail, setConfirmEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user) return;
    
    // 硬删除需要确认邮箱
    if (deleteType === 'hard' && confirmEmail !== user.email) {
      setError('请输入正确的用户邮箱以确认删除');
      return;
    }
    
    setLoading(true);
    setError(null);
    setSuccess(null);

    try {
      const response = await fetch('/api/admin/users/delete', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId: user.id,
          deleteType
        }),
      });

      const result = await response.json();

      if (response.ok) {
        setSuccess(result.message);
        setTimeout(() => {
          onSuccess();
          onOpenChange(false);
          resetForm();
        }, 2000);
      } else {
        setError(result.error || '删除用户失败');
      }
    } catch (error) {
      setError('网络错误，请重试');
      console.error('删除用户失败:', error);
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setDeleteType('soft');
    setConfirmEmail('');
    setError(null);
    setSuccess(null);
  };

  const handleOpenChange = (newOpen: boolean) => {
    if (!newOpen) {
      resetForm();
    }
    onOpenChange(newOpen);
  };

  if (!user) return null;

  const canSubmit = deleteType === 'soft' || 
                   (deleteType === 'hard' && confirmEmail === user.email);

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-red-500" />
            删除用户账户
          </DialogTitle>
          <DialogDescription>
            您即将删除用户 <strong>{user.email}</strong> 的账户。请选择删除方式：
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* 用户信息卡片 */}
          <div className="bg-gray-50 rounded-lg p-4 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">用户邮箱:</span>
              <span className="text-sm">{user.email}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">注册时间:</span>
              <span className="text-sm">{new Date(user.created_at).toLocaleDateString('zh-CN')}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">聊天会话:</span>
              <span className="text-sm">{user.session_count || 0} 个</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">消息数量:</span>
              <span className="text-sm">{user.message_count || 0} 条</span>
            </div>
          </div>

          {/* 删除类型选择 */}
          <div className="space-y-2">
            <Label htmlFor="deleteType">删除方式</Label>
            <Select
              value={deleteType}
              onValueChange={(value) => setDeleteType(value as 'soft' | 'hard')}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="soft">
                  <div className="flex items-center gap-2">
                    <Ban className="h-4 w-4 text-orange-500" />
                    <div>
                      <div className="font-medium">软删除（推荐）</div>
                      <div className="text-xs text-gray-500">禁用账户，保留数据</div>
                    </div>
                  </div>
                </SelectItem>
                <SelectItem value="hard">
                  <div className="flex items-center gap-2">
                    <Trash2 className="h-4 w-4 text-red-500" />
                    <div>
                      <div className="font-medium">硬删除（危险）</div>
                      <div className="text-xs text-gray-500">彻底删除，不可恢复</div>
                    </div>
                  </div>
                </SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* 删除方式说明 */}
          <div className={`p-3 rounded-lg border ${deleteType === 'soft' ? 'bg-orange-50 border-orange-200' : 'bg-red-50 border-red-200'}`}>
            {deleteType === 'soft' ? (
              <div className="flex items-start gap-2">
                <Ban className="h-4 w-4 text-orange-500 mt-0.5" />
                <div className="text-sm">
                  <div className="font-medium text-orange-700">软删除（推荐）</div>
                  <div className="text-orange-600 mt-1">
                    • 用户账户将被禁用，无法登录<br/>
                    • 聊天记录和数据将被保留<br/>
                    • 可以随时恢复账户（通过启用功能）<br/>
                    • 适合临时禁用或违规用户
                  </div>
                </div>
              </div>
            ) : (
              <div className="flex items-start gap-2">
                <Trash2 className="h-4 w-4 text-red-500 mt-0.5" />
                <div className="text-sm">
                  <div className="font-medium text-red-700">硬删除（危险操作）</div>
                  <div className="text-red-600 mt-1">
                    • 用户账户将被彻底删除<br/>
                    • 所有聊天记录和数据将被清除<br/>
                    • 此操作不可逆转，无法恢复<br/>
                    • 仅在确定不再需要该用户时使用
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* 硬删除确认 */}
          {deleteType === 'hard' && (
            <div className="space-y-2">
              <Label htmlFor="confirmEmail" className="flex items-center gap-2 text-red-700">
                <AlertTriangle className="h-4 w-4" />
                确认删除（输入用户邮箱）
              </Label>
              <Input
                id="confirmEmail"
                type="email"
                placeholder={`请输入 ${user.email} 以确认删除`}
                value={confirmEmail}
                onChange={(e) => setConfirmEmail(e.target.value)}
                className="border-red-300 focus:border-red-500"
              />
              <p className="text-xs text-red-600">
                ⚠️ 硬删除将永久删除用户的所有数据，此操作不可撤销！
              </p>
            </div>
          )}

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
              disabled={!canSubmit || loading}
              className={`${deleteType === 'soft' 
                ? 'bg-orange-500 hover:bg-orange-600' 
                : 'bg-red-500 hover:bg-red-600'} text-white`}
            >
              {loading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin mr-2" />
                  删除中...
                </>
              ) : (
                <>
                  {deleteType === 'soft' ? (
                    <Ban className="h-4 w-4 mr-2" />
                  ) : (
                    <Trash2 className="h-4 w-4 mr-2" />
                  )}
                  确认{deleteType === 'soft' ? '禁用' : '删除'}
                </>
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}