"use client";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { UserManagement } from "./user-management";
import { AdvancedChatManagement } from "./advanced-chat-management";
import { SystemLogs } from "./system-logs";
import { FeedbackManagement } from "./feedback-management";
import { SystemSettings } from "./system-settings";

export function AdminDashboard() {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div className="flex items-center">
              <div>
                <h1 className="text-2xl font-bold text-gray-900">后台管理</h1>
                <p className="text-sm text-gray-500">系统管理与监控中心</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Main Content Tabs */}
        <Tabs defaultValue="users" className="space-y-6">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="users">用户管理</TabsTrigger>
            <TabsTrigger value="dify-chat">聊天记录</TabsTrigger>
            <TabsTrigger value="feedback">反馈管理</TabsTrigger>
            <TabsTrigger value="settings">系统设置</TabsTrigger>
            <TabsTrigger value="logs">日志管理</TabsTrigger>
          </TabsList>

          <TabsContent value="users">
            <UserManagement />
          </TabsContent>

          <TabsContent value="dify-chat">
            <AdvancedChatManagement />
          </TabsContent>

          <TabsContent value="feedback">
            <FeedbackManagement />
          </TabsContent>

          <TabsContent value="settings">
            <SystemSettings />
          </TabsContent>

          <TabsContent value="logs">
            <SystemLogs />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}