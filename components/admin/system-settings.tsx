"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Settings } from "lucide-react";

export function SystemSettings() {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold">系统设置</h2>
        <p className="text-gray-500">配置系统参数和选项</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings className="h-5 w-5" />
            系统配置
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-gray-500">系统设置功能正在开发中...</p>
        </CardContent>
      </Card>
    </div>
  );
}