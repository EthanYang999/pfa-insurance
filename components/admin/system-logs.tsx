"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { FileText } from "lucide-react";

export function SystemLogs() {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold">日志管理</h2>
        <p className="text-gray-500">查看系统操作日志</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            系统日志
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-gray-500">日志管理功能正在开发中...</p>
        </CardContent>
      </Card>
    </div>
  );
}