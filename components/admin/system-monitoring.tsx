"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Activity } from "lucide-react";

export function SystemMonitoring() {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold">系统监控</h2>
        <p className="text-gray-500">监控系统运行状态和性能</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Activity className="h-5 w-5" />
            系统状态监控
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-gray-500">系统监控功能正在开发中...</p>
        </CardContent>
      </Card>
    </div>
  );
}