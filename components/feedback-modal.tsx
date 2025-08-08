"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { MessageSquare, Send } from "lucide-react";

interface FeedbackModalProps {
  userEmail?: string;
  userId?: string;
}

export function FeedbackModal({ userEmail, userId }: FeedbackModalProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    submitterName: "",
    feedbackType: "",
    description: "",
  });

  const feedbackTypes = [
    { value: "knowledge_error", label: "知识点错误" },
    { value: "response_delay", label: "响应延迟" },
    { value: "system_freeze", label: "系统卡死" },
    { value: "ui_issue", label: "界面问题" },
    { value: "feature_request", label: "功能建议" },
    { value: "bug_report", label: "错误报告" },
    { value: "content_quality", label: "内容质量问题" },
    { value: "other", label: "其他问题" },
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const response = await fetch("/api/feedback", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          submitter_name: formData.submitterName,
          feedback_type: formData.feedbackType,
          description: formData.description,
          user_email: userEmail,
          user_id: userId,
        }),
      });

      if (!response.ok) {
        throw new Error("提交失败");
      }

      // 重置表单
      setFormData({
        submitterName: "",
        feedbackType: "",
        description: "",
      });

      setIsOpen(false);
      alert("反馈提交成功！感谢您的宝贵意见。");
    } catch (error) {
      console.error("提交反馈失败:", error);
      alert("提交失败，请稍后重试。");
    } finally {
      setIsSubmitting(false);
    }
  };

  const isFormValid = formData.submitterName.trim() && 
                     formData.feedbackType && 
                     formData.description.trim();

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button
          variant="ghost"
          size="sm"
          className="text-white hover:text-pfa-champagne-gold hover:bg-white/10 transition-colors"
        >
          <MessageSquare className="h-4 w-4 mr-1" />
          <span className="hidden sm:inline">反馈</span>
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle className="text-pfa-royal-blue">问题反馈</DialogTitle>
          <DialogDescription>
            遇到问题或有建议？请告诉我们，我们会尽快改进。
          </DialogDescription>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="submitterName" className="text-pfa-royal-blue font-medium">
              您的姓名 *
            </Label>
            <Input
              id="submitterName"
              placeholder="请输入您的姓名"
              value={formData.submitterName}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, submitterName: e.target.value }))
              }
              className="mt-1 border-pfa-royal-blue/20 focus:border-pfa-royal-blue focus:ring-pfa-royal-blue/20"
              required
            />
          </div>

          <div>
            <Label htmlFor="feedbackType" className="text-pfa-royal-blue font-medium">
              问题类型 *
            </Label>
            <Select
              value={formData.feedbackType}
              onValueChange={(value) =>
                setFormData((prev) => ({ ...prev, feedbackType: value }))
              }
            >
              <SelectTrigger className="mt-1 border-pfa-royal-blue/20 focus:border-pfa-royal-blue focus:ring-pfa-royal-blue/20">
                <SelectValue placeholder="请选择问题类型" />
              </SelectTrigger>
              <SelectContent>
                {feedbackTypes.map((type) => (
                  <SelectItem key={type.value} value={type.value}>
                    {type.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="description" className="text-pfa-royal-blue font-medium">
              详细描述 *
            </Label>
            <Textarea
              id="description"
              placeholder="请详细描述您遇到的问题或建议..."
              value={formData.description}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, description: e.target.value }))
              }
              className="mt-1 min-h-[100px] border-pfa-royal-blue/20 focus:border-pfa-royal-blue focus:ring-pfa-royal-blue/20"
              required
            />
          </div>

          <div className="flex gap-3 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => setIsOpen(false)}
              className="flex-1 border-pfa-royal-blue/20 text-pfa-royal-blue hover:bg-pfa-royal-blue/5"
            >
              取消
            </Button>
            <Button
              type="submit"
              disabled={!isFormValid || isSubmitting}
              className="flex-1 bg-pfa-champagne-gold hover:bg-pfa-accent-gold text-pfa-royal-blue font-semibold"
            >
              {isSubmitting ? (
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 border-2 border-pfa-royal-blue/30 border-t-pfa-royal-blue rounded-full animate-spin" />
                  提交中...
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <Send className="h-4 w-4" />
                  提交反馈
                </div>
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}