"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Database } from "lucide-react";

export function DatabaseManagement() {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold">数据库管理</h2>
        <p className="text-gray-500">查看和管理数据库内容</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Database className="h-5 w-5" />
            数据库概览
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-gray-500">数据库管理功能正在开发中...</p>
        </CardContent>
      </Card>
    </div>
  );
}