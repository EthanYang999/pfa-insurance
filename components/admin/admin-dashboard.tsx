"use client";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { UserManagement } from "./user-management";
import { AdvancedChatManagement } from "./advanced-chat-management";
import { SystemLogs } from "./system-logs";
import { FeedbackManagement } from "./feedback-management";
import { SystemSettings } from "./system-settings";
import { HomepageContentManagement } from "./homepage-content-management";
import { 
  Users, 
  MessageSquare, 
  MessageCircle, 
  Globe, 
  Settings, 
  FileText,
  Shield,
  TrendingUp,
  Activity
} from "lucide-react";

export function AdminDashboard() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      {/* Enhanced Header */}
      <div className="bg-white/80 backdrop-blur-sm shadow-sm border-b border-blue-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div className="flex items-center">
              <div>
                <h1 className="text-2xl font-bold text-gray-900">后台管理</h1>
                <p className="text-sm text-gray-500">系统管理与监控中心</p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                <Activity className="w-3 h-3 mr-1" />
                系统运行中
              </Badge>
            </div>
          </div>
        </div>
      </div>


      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Enhanced Content Tabs */}
        <Card className="shadow-xl border-0 bg-white/70 backdrop-blur-sm">
          <CardContent className="p-6">
            <Tabs defaultValue="users" className="space-y-6">
              <div className="border-b border-gray-200">
                <TabsList className="bg-transparent h-auto p-0 space-x-8">
                  <TabsTrigger 
                    value="users" 
                    className="flex items-center space-x-2 px-4 py-3 text-sm font-medium border-b-2 border-transparent data-[state=active]:border-pfa-royal-blue data-[state=active]:text-pfa-royal-blue data-[state=active]:bg-transparent bg-transparent hover:text-pfa-royal-blue transition-colors"
                  >
                    <Users className="w-4 h-4" />
                    <span>用户管理</span>
                  </TabsTrigger>
                  <TabsTrigger 
                    value="dify-chat"
                    className="flex items-center space-x-2 px-4 py-3 text-sm font-medium border-b-2 border-transparent data-[state=active]:border-pfa-royal-blue data-[state=active]:text-pfa-royal-blue data-[state=active]:bg-transparent bg-transparent hover:text-pfa-royal-blue transition-colors"
                  >
                    <MessageSquare className="w-4 h-4" />
                    <span>聊天记录</span>
                  </TabsTrigger>
                  <TabsTrigger 
                    value="feedback"
                    className="flex items-center space-x-2 px-4 py-3 text-sm font-medium border-b-2 border-transparent data-[state=active]:border-pfa-royal-blue data-[state=active]:text-pfa-royal-blue data-[state=active]:bg-transparent bg-transparent hover:text-pfa-royal-blue transition-colors"
                  >
                    <MessageCircle className="w-4 h-4" />
                    <span>反馈管理</span>
                  </TabsTrigger>
                  <TabsTrigger 
                    value="homepage"
                    className="flex items-center space-x-2 px-4 py-3 text-sm font-medium border-b-2 border-transparent data-[state=active]:border-pfa-royal-blue data-[state=active]:text-pfa-royal-blue data-[state=active]:bg-transparent bg-transparent hover:text-pfa-royal-blue transition-colors"
                  >
                    <Globe className="w-4 h-4" />
                    <span>首页内容</span>
                  </TabsTrigger>
                  <TabsTrigger 
                    value="settings"
                    className="flex items-center space-x-2 px-4 py-3 text-sm font-medium border-b-2 border-transparent data-[state=active]:border-pfa-royal-blue data-[state=active]:text-pfa-royal-blue data-[state=active]:bg-transparent bg-transparent hover:text-pfa-royal-blue transition-colors"
                  >
                    <Settings className="w-4 h-4" />
                    <span>系统设置</span>
                  </TabsTrigger>
                  <TabsTrigger 
                    value="logs"
                    className="flex items-center space-x-2 px-4 py-3 text-sm font-medium border-b-2 border-transparent data-[state=active]:border-pfa-royal-blue data-[state=active]:text-pfa-royal-blue data-[state=active]:bg-transparent bg-transparent hover:text-pfa-royal-blue transition-colors"
                  >
                    <FileText className="w-4 h-4" />
                    <span>日志管理</span>
                  </TabsTrigger>
                </TabsList>
              </div>

              <div className="pt-6">
                <TabsContent value="users" className="mt-0">
                  <UserManagement />
                </TabsContent>

                <TabsContent value="dify-chat" className="mt-0">
                  <AdvancedChatManagement />
                </TabsContent>

                <TabsContent value="feedback" className="mt-0">
                  <FeedbackManagement />
                </TabsContent>

                <TabsContent value="homepage" className="mt-0">
                  <HomepageContentManagement />
                </TabsContent>

                <TabsContent value="settings" className="mt-0">
                  <SystemSettings />
                </TabsContent>

                <TabsContent value="logs" className="mt-0">
                  <SystemLogs />
                </TabsContent>
              </div>
            </Tabs>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}