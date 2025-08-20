'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Shield, 
  ExternalLink, 
  Database, 
  CheckCircle,
  Brain,
  Video,
  Users,
  Target,
  BookOpen,
  Settings,
  Download,
  Play,
  Globe,
  Zap
} from 'lucide-react';

export default function TeamDelivery() {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-gradient-to-r from-pfa-royal-blue to-pfa-navy-blue text-white">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-8">
            <div className="flex items-center">
              <Shield className="h-10 w-10 mr-4" />
              <div>
                <h1 className="text-3xl font-bold">PFA 保险AI助手</h1>
                <p className="text-blue-100 mt-2">Professional Insurance AI Assistant - Team Delivery</p>
              </div>
            </div>
            <Badge variant="secondary" className="text-lg px-4 py-2">
              网站测试说明文档
            </Badge>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        
        {/* Testing Instructions */}
        <Card className="mb-8 border-2 border-pfa-royal-blue shadow-lg">
          <CardHeader className="bg-blue-50">
            <CardTitle className="flex items-center gap-2 text-pfa-royal-blue text-2xl">
              <Target className="h-7 w-7" />
              网站测试说明
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-6">
            <div className="space-y-6">
              {/* 基本信息 */}
              <div className="bg-blue-50 p-4 rounded-lg">
                <h3 className="text-lg font-semibold mb-3 text-pfa-royal-blue">📋 网站基本信息</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                  <div>
                    <strong>网站地址：</strong><br />
                    <code className="text-blue-600">http://fuyaolucky.com/</code>
                  </div>
                  <div>
                    <strong>测试时间：</strong><br />
                    随时可测试
                  </div>
                  <div>
                    <strong>适用设备：</strong><br />
                    电脑、手机、平板均可
                  </div>
                </div>
              </div>

              {/* 核心功能介绍 */}
              <div>
                <h3 className="text-lg font-semibold mb-3 text-gray-900">🎯 网站核心功能介绍</h3>
                <div className="space-y-2 text-sm">
                  <div className="flex items-center gap-2">
                    <span className="text-blue-600">🤖</span>
                    <strong>双重AI回答：</strong>快速回答 + 专业深度分析
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-blue-600">👥</span>
                    <strong>三级用户体系：</strong>普通用户、管理员、超级管理员
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-blue-600">🛠</span>
                    <strong>完整管理后台：</strong>用户管理、数据监控、系统维护
                  </div>
                </div>
              </div>

              {/* 测试账号 */}
              <div>
                <h3 className="text-lg font-semibold mb-3 text-gray-900">👤 测试账号信息</h3>
                <div className="bg-green-50 p-4 rounded-lg border border-green-200">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                    <div>
                      <strong>邮箱：</strong><code className="bg-white px-2 py-1 rounded">test@pfa.com</code>
                    </div>
                    <div>
                      <strong>密码：</strong><code className="bg-white px-2 py-1 rounded">test123456</code>
                    </div>
                  </div>
                </div>
              </div>

              {/* AI聊天功能测试 */}
              <div>
                <h3 className="text-lg font-semibold mb-3 text-gray-900">🤖 1. AI聊天功能测试</h3>
                <div className="bg-gray-50 p-4 rounded-lg">
                  <div className="mb-3">
                    <strong className="text-blue-600">测试地址：</strong>
                    <code className="text-blue-600">http://fuyaolucky.com/chat</code>
                  </div>
                  
                  <div className="space-y-4">
                    <div>
                      <h4 className="font-semibold text-gray-800 mb-2">步骤1：登录账户</h4>
                      <ol className="text-sm text-gray-700 space-y-1 ml-4">
                        <li>1. 点击&quot;立即体验&quot;或直接访问聊天页面</li>
                        <li>2. 使用测试账号登录：test@pfa.com / test123456</li>
                        <li>3. 成功进入聊天界面</li>
                      </ol>
                    </div>
                    
                    <div>
                      <h4 className="font-semibold text-gray-800 mb-2">步骤2：测试快速回答</h4>
                      <ol className="text-sm text-gray-700 space-y-1 ml-4">
                        <li>1. 输入保险相关问题</li>
                        <li>2. 观察AI快速回答</li>
                        <li>3. 回答应该即时显示，内容专业</li>
                      </ol>
                    </div>
                    
                    <div>
                      <h4 className="font-semibold text-gray-800 mb-2">步骤3：测试专业回答</h4>
                      <ol className="text-sm text-gray-700 space-y-1 ml-4">
                        <li>1. 在快速回答后，找到&quot;获取专业回答&quot;按钮</li>
                        <li>2. 点击按钮，等待专业分析</li>
                        <li>3. 专业回答应该更详细、深入</li>
                      </ol>
                    </div>
                  </div>
                  
                  <div className="mt-4 p-3 bg-white rounded border">
                    <strong className="text-green-600">预期结果：</strong>
                    <ul className="text-sm text-gray-700 mt-1 space-y-1">
                      <li>✅ 快速回答：3-5秒内显示</li>
                      <li>✅ 专业回答：10-30秒内显示，内容更专业</li>
                      <li>✅ 界面友好，回答清晰</li>
                    </ul>
                  </div>
                </div>
              </div>

              {/* 管理后台测试 */}
              <div>
                <h3 className="text-lg font-semibold mb-3 text-gray-900">🛠 2.管理后台测试</h3>
                <div className="bg-gray-50 p-4 rounded-lg">
                  <div className="mb-3">
                    <strong className="text-blue-600">测试地址：</strong>
                    <code className="text-blue-600">http://fuyaolucky.com/admin</code>
                  </div>
                  
                  <div>
                    <h4 className="font-semibold text-gray-800 mb-2">功能预览：</h4>
                    <ul className="text-sm text-gray-700 space-y-1 ml-4">
                      <li>• 👤 用户管理：查看所有注册用户</li>
                      <li>• 💬 聊天记录管理：查看所有对话数据</li>
                      <li>• 📊 系统监控：监控系统运行状态</li>
                      <li>• 📝 日志管理：查看系统操作日志</li>
                    </ul>
                  </div>
                </div>
              </div>

              {/* 测试检查清单 */}
              <div>
                <h3 className="text-lg font-semibold mb-3 text-gray-900">✅ 测试检查清单</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="bg-blue-50 p-3 rounded-lg">
                    <h4 className="font-semibold text-blue-800 mb-2 text-sm">基础功能测试</h4>
                    <ul className="text-xs text-gray-700 space-y-1">
                      <li>□ 网站正常访问</li>
                      <li>□ 主页内容显示完整</li>
                      <li>□ 登录功能正常</li>
                      <li>□ AI聊天快速回答正常</li>
                      <li>□ AI专业回答功能正常</li>
                    </ul>
                  </div>
                  <div className="bg-green-50 p-3 rounded-lg">
                    <h4 className="font-semibold text-green-800 mb-2 text-sm">用户体验测试</h4>
                    <ul className="text-xs text-gray-700 space-y-1">
                      <li>□ 页面加载速度合理（3秒内）</li>
                      <li>□ 手机端显示正常</li>
                      <li>□ 电脑端显示正常</li>
                      <li>□ 按钮点击响应正常</li>
                      <li>□ 文字清晰易读</li>
                    </ul>
                  </div>
                  <div className="bg-purple-50 p-3 rounded-lg">
                    <h4 className="font-semibold text-purple-800 mb-2 text-sm">功能完整性测试</h4>
                    <ul className="text-xs text-gray-700 space-y-1">
                      <li>□ 注册/登录流程顺畅</li>
                      <li>□ AI回答内容专业</li>
                      <li>□ 测试账号可正常使用</li>
                    </ul>
                  </div>
                </div>
              </div>

              {/* 重点测试建议 */}
              <div className="bg-gradient-to-r from-blue-50 to-purple-50 p-4 rounded-lg border border-blue-200">
                <h3 className="text-lg font-semibold mb-3 text-blue-900">🎯 重点测试建议</h3>
                <div>
                  <h4 className="font-semibold text-blue-800 mb-2 text-sm">优先测试功能：</h4>
                  <ol className="text-xs text-gray-700 space-y-1">
                    <li>1. AI双重回答系统 - 这是网站的核心功能</li>
                    <li>2. 用户登录体验 - 测试账号的使用体验</li>
                    <li>3. 响应式设计 - 多设备兼容性</li>
                  </ol>
                </div>
              </div>

              {/* 常见问题 */}
              <div>
                <h3 className="text-lg font-semibold mb-3 text-gray-900">🆘 常见问题解决</h3>
                <div className="space-y-3">
                  <div className="bg-yellow-50 p-3 rounded-lg border border-yellow-200">
                    <div className="font-semibold text-yellow-800 text-sm mb-1">Q: AI回答速度较慢？</div>
                    <div className="text-yellow-700 text-xs">A: 专业回答需要更多处理时间，请耐心等待10-30秒</div>
                  </div>
                  <div className="bg-yellow-50 p-3 rounded-lg border border-yellow-200">
                    <div className="font-semibold text-yellow-800 text-sm mb-1">Q: 手机端显示异常？</div>
                    <div className="text-yellow-700 text-xs">A: 建议使用较新版本的浏览器（Chrome、Safari等）</div>
                  </div>
                  <div className="bg-yellow-50 p-3 rounded-lg border border-yellow-200">
                    <div className="font-semibold text-yellow-800 text-sm mb-1">Q: 测试账号无法登录？</div>
                    <div className="text-yellow-700 text-xs">A: 确认邮箱和密码输入正确：test@pfa.com / test123456</div>
                  </div>
                </div>
              </div>

              {/* 测试反馈 */}
              <div className="bg-gradient-to-r from-green-50 to-blue-50 p-4 rounded-lg border border-green-200">
                <h3 className="text-lg font-semibold mb-3 text-green-900">📞 测试反馈</h3>
                <div className="text-sm text-gray-700">
                  <p className="mb-2">如测试过程中遇到问题或有改进建议，请记录：</p>
                  <ul className="space-y-1 ml-4">
                    <li>• 问题描述</li>
                    <li>• 出现时间</li>
                    <li>• 使用设备和浏览器</li>
                    <li>• 具体操作步骤</li>
                  </ul>
                </div>
              </div>

              {/* 结尾 */}
              <div className="text-center bg-gradient-to-r from-pfa-royal-blue to-pfa-navy-blue text-white p-4 rounded-lg">
                <h3 className="text-lg font-semibold">🎉 测试愉快！PFA智能保险教练期待为您提供专业的AI服务！</h3>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Quick Access */}
        <Card className="mb-8 bg-green-50 border-green-200">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-green-800">
              <Play className="h-6 w-6" />
              快速体验入口
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-white p-4 rounded-lg border">
                <h4 className="font-semibold mb-2 text-blue-600">🌐 主站体验</h4>
                <div className="text-sm text-gray-600 mb-3">
                  <div>网址：fuyaolucky.com</div>
                  <div>账号：test@pfa.com</div>
                  <div>密码：test123456</div>
                </div>
                <Button 
                  size="sm" 
                  className="w-full bg-pfa-royal-blue hover:bg-pfa-navy-blue"
                  onClick={() => window.open('http://fuyaolucky.com', '_blank')}
                >
                  <ExternalLink className="h-4 w-4 mr-2" />
                  立即体验
                </Button>
              </div>
              <div className="bg-white p-4 rounded-lg border">
                <h4 className="font-semibold mb-2 text-green-600">🛡️ 管理后台</h4>
                <div className="text-sm text-gray-600 mb-3">
                  <div>网址：fuyaolucky.com/admin</div>
                  <div>账号：test@pfa.com</div>
                  <div>密码：test123456</div>
                </div>
                <Button 
                  size="sm" 
                  variant="outline"
                  className="w-full border-pfa-royal-blue text-pfa-royal-blue hover:bg-blue-50"
                  onClick={() => window.open('http://fuyaolucky.com/admin', '_blank')}
                >
                  <Shield className="h-4 w-4 mr-2" />
                  管理面板
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Team Delivery Tabs */}
        <Tabs defaultValue="ethan" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4 h-12">
            <TabsTrigger value="ethan" className="flex items-center gap-2">
              <Globe className="h-4 w-4" />
              网站系统
            </TabsTrigger>
            <TabsTrigger value="jiuyan" className="flex items-center gap-2">
              <Database className="h-4 w-4" />
              知识库
            </TabsTrigger>
            <TabsTrigger value="tuzi" className="flex items-center gap-2">
              <Video className="h-4 w-4" />
              数字人
            </TabsTrigger>
            <TabsTrigger value="dunk" className="flex items-center gap-2">
              <Users className="h-4 w-4" />
              获客系统
            </TabsTrigger>
          </TabsList>

          {/* Ethan - Website System */}
          <TabsContent value="ethan">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-blue-600">
                  <Globe className="h-6 w-6" />
                  Ethan - 网站系统开发与部署
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                
                {/* Core Features */}
                <div>
                  <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                    <Settings className="h-5 w-5" />
                    核心功能实现
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="bg-blue-50 p-4 rounded-lg">
                      <h4 className="font-semibold text-blue-900 mb-2">🤖 AI对话系统</h4>
                      <ul className="text-sm text-blue-800 space-y-1">
                        <li>• 集成 AI工作流</li>
                        <li>• 实时流式对话体验</li>
                        <li>• 支持Markdown格式渲染</li>
                        <li>• 自动会话管理</li>
                      </ul>
                    </div>
                    <div className="bg-green-50 p-4 rounded-lg">
                      <h4 className="font-semibold text-green-900 mb-2">🛡️ 后台管理系统</h4>
                      <ul className="text-sm text-green-800 space-y-1">
                        <li>• 用户管理和权限控制</li>
                        <li>• 聊天记录查询分析</li>
                        <li>• 数据导出（CSV/JSON）</li>
                        <li>• 系统监控和日志</li>
                      </ul>
                    </div>
                  </div>
                </div>

                {/* Technical Stack */}
                <div>
                  <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                    <Zap className="h-5 w-5" />
                    技术架构
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <h4 className="font-semibold mb-2">前端技术</h4>
                      <ul className="text-sm text-gray-700 space-y-1">
                        <li>• Next.js 15.4.4</li>
                        <li>• TypeScript</li>
                        <li>• Tailwind CSS</li>
                        <li>• React Markdown</li>
                      </ul>
                    </div>
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <h4 className="font-semibold mb-2">后端服务</h4>
                      <ul className="text-sm text-gray-700 space-y-1">
                        <li>• Supabase数据库</li>
                        <li>• 身份认证系统</li>
                        <li>• RESTful APIs</li>
                        <li>• 行级安全策略</li>
                      </ul>
                    </div>
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <h4 className="font-semibold mb-2">AI集成</h4>
                      <ul className="text-sm text-gray-700 space-y-1">
                        <li>• 专业知识库</li>
                        <li>• 流式响应处理</li>
                        <li>• 上下文管理</li>
                      </ul>
                    </div>
                  </div>
                </div>



              </CardContent>
            </Card>
          </TabsContent>

          {/* 九烟 - Knowledge Base */}
          <TabsContent value="jiuyan">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-purple-600">
                  <BookOpen className="h-6 w-6" />
                  催梦师九烟 - 专业知识库构建
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                
                <div className="bg-purple-50 p-6 rounded-lg border-2 border-purple-200">
                  <h3 className="text-lg font-semibold mb-4 text-purple-900">🔍 多模态文档解析策略</h3>
                  <div className="mb-4 p-4 bg-white rounded-lg border border-purple-200">
                    <p className="text-sm text-gray-700 mb-3">
                      面对包含复杂图表、K线图和非线性排版的PDF文档，我们采用先进的多模态转录管线：
                    </p>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="bg-white p-4 rounded-lg border border-blue-200">
                      <h4 className="font-semibold mb-3 text-blue-600">📄 PDF转图像</h4>
                      <ul className="text-sm space-y-2">
                        <li className="flex items-start gap-2">
                          <CheckCircle className="h-4 w-4 text-green-600 mt-0.5" />
                          <span>高质量PDF页面转换</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <CheckCircle className="h-4 w-4 text-green-600 mt-0.5" />
                          <span>保持原始文档结构</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <CheckCircle className="h-4 w-4 text-green-600 mt-0.5" />
                          <span>n8n自动化处理</span>
                        </li>
                      </ul>
                    </div>
                    <div className="bg-white p-4 rounded-lg border border-purple-200">
                      <h4 className="font-semibold mb-3 text-purple-600">🤖 视觉大模型解读</h4>
                      <ul className="text-sm space-y-2">
                        <li className="flex items-start gap-2">
                          <Brain className="h-4 w-4 text-orange-600 mt-0.5" />
                          <span>LLM Vision深度分析</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <Brain className="h-4 w-4 text-orange-600 mt-0.5" />
                          <span>图表K线图智能识别</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <Brain className="h-4 w-4 text-orange-600 mt-0.5" />
                          <span>结构化Markdown转换</span>
                        </li>
                      </ul>
                    </div>
                    <div className="bg-white p-4 rounded-lg border border-green-200">
                      <h4 className="font-semibold mb-3 text-green-600">💾 Markdown入库</h4>
                      <ul className="text-sm space-y-2">
                        <li className="flex items-start gap-2">
                          <Target className="h-4 w-4 text-blue-600 mt-0.5" />
                          <span>Supabase结构化存储</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <Target className="h-4 w-4 text-blue-600 mt-0.5" />
                          <span>精准检索基础建立</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <Target className="h-4 w-4 text-blue-600 mt-0.5" />
                          <span>高质量文档标准</span>
                        </li>
                      </ul>
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="text-lg font-semibold mb-4">🔍 混合搜索引擎技术</h3>
                  <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-6 rounded-lg border border-blue-200">
                    <div className="mb-4">
                      <h4 className="font-semibold text-blue-900 mb-3">自主设计的Hybrid Search系统</h4>
                      <p className="text-sm text-gray-700">
                        兼顾语义理解的广度和关键词匹配的精度，通过Supabase RPC调用，动态调整权重并利用RRF算法智能重排
                      </p>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="bg-white p-4 rounded-lg border border-blue-200">
                        <h5 className="font-semibold text-blue-600 mb-3">🧠 语义搜索优势</h5>
                        <ul className="text-sm text-gray-700 space-y-2">
                          <li>• 开放性、概念性问题理解</li>
                          <li>• 深度语义关联分析</li>
                          <li>• 上下文相关性匹配</li>
                          <li>• 动态semantic_weight调整</li>
                        </ul>
                      </div>
                      <div className="bg-white p-4 rounded-lg border border-green-200">
                        <h5 className="font-semibold text-green-600 mb-3">🎯 全文搜索精度</h5>
                        <ul className="text-sm text-gray-700 space-y-2">
                          <li>• 产品代码精准命中</li>
                          <li>• 人名专有名词查询</li>
                          <li>• 具体条款精确定位</li>
                          <li>• full_text_weight优化</li>
                        </ul>
                      </div>
                    </div>
                    <div className="mt-4 p-3 bg-green-100 rounded-lg border border-green-300">
                      <p className="text-sm text-green-800 font-medium">
                        ✨ 最终效果：检索精准度相较于单一Embedding检索有质的飞跃
                      </p>
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="text-lg font-semibold mb-4">🎭 AI智能体双重人格设计</h3>
                  <div className="bg-gradient-to-r from-purple-50 to-pink-50 p-6 rounded-lg border border-purple-200">
                    <div className="mb-4">
                      <h4 className="font-semibold text-purple-900 mb-3">Dual-Persona Prompt架构</h4>
                      <p className="text-sm text-gray-700">
                        为AI Agent设计双重人格，根据场景无缝切换角色，从&quot;问答机器人&quot;升华为&quot;金牌教练&quot;
                      </p>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="bg-white p-5 rounded-lg border border-blue-200">
                        <h5 className="font-semibold text-blue-600 mb-3 flex items-center gap-2">
                          <BookOpen className="h-5 w-5" />
                          人格一：保险知识教学教练
                        </h5>
                        <div className="space-y-3">
                          <div>
                            <h6 className="font-medium text-blue-800 text-sm">核心职责</h6>
                            <p className="text-xs text-gray-600">精准、严谨地解析保险条款、产品知识和合规要点</p>
                          </div>
                          <div>
                            <h6 className="font-medium text-blue-800 text-sm">交互特点</h6>
                            <p className="text-xs text-gray-600">逻辑清晰，深入浅出，确保新人准确理解复杂专业知识</p>
                          </div>
                        </div>
                      </div>
                      <div className="bg-white p-5 rounded-lg border border-purple-200">
                        <h5 className="font-semibold text-purple-600 mb-3 flex items-center gap-2">
                          <Users className="h-5 w-5" />
                          人格二：销售话术与实战教练
                        </h5>
                        <div className="space-y-3">
                          <div>
                            <h6 className="font-medium text-purple-800 text-sm">核心职责</h6>
                            <p className="text-xs text-gray-600">聚焦销售技巧、沟通策略，将知识转化为实战能力</p>
                          </div>
                          <div>
                            <h6 className="font-medium text-purple-800 text-sm">交互特点</h6>
                            <p className="text-xs text-gray-600">充满温度、鼓励引导，通过角色扮演建立自信，植入PFA成功信念</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="text-lg font-semibold mb-4">💎 核心话术萃取与升华</h3>
                  <div className="bg-gradient-to-r from-orange-50 to-yellow-50 p-6 rounded-lg border border-orange-200">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                      <div className="bg-white p-4 rounded-lg border border-orange-200">
                        <h5 className="font-semibold text-orange-600 mb-3">🎤 语音转文本</h5>
                        <ul className="text-sm text-gray-700 space-y-2">
                          <li>• 三场核心培训视频</li>
                          <li>• ASR技术高精度转录</li>
                          <li>• 现场演讲完整还原</li>
                        </ul>
                      </div>
                      <div className="bg-white p-4 rounded-lg border border-blue-200">
                        <h5 className="font-semibold text-blue-600 mb-3">🤖 AI提炼校验</h5>
                        <ul className="text-sm text-gray-700 space-y-2">
                          <li>• 多轮AI智能提炼</li>
                          <li>• 人工质量校验</li>
                          <li>• 话术精髓萃取</li>
                        </ul>
                      </div>
                      <div className="bg-white p-4 rounded-lg border border-green-200">
                        <h5 className="font-semibold text-green-600 mb-3">📚 结构化话术库</h5>
                        <ul className="text-sm text-gray-700 space-y-2">
                          <li>• PFA核心话术精髓</li>
                          <li>• 结构化专业话术库</li>
                          <li>• AI可调用实战资源</li>
                        </ul>
                      </div>
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="text-lg font-semibold mb-4">🏆 技术成果与核心壁垒</h3>
                  <div className="space-y-6">
                    <div className="bg-gradient-to-r from-green-50 to-emerald-50 p-6 rounded-lg border border-green-200">
                      <h4 className="font-semibold text-green-900 mb-4">核心技术壁垒</h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="bg-white p-4 rounded-lg border border-green-200">
                          <h5 className="font-semibold text-green-700 mb-3">🔬 多模态解析技术</h5>
                          <ul className="text-sm text-gray-700 space-y-2">
                            <li>• 复杂PDF文档智能识别</li>
                            <li>• K线图表结构化转换</li>
                            <li>• 视觉大模型深度理解</li>
                            <li>• 非线性排版精准处理</li>
                          </ul>
                        </div>
                        <div className="bg-white p-4 rounded-lg border border-blue-200">
                          <h5 className="font-semibold text-blue-700 mb-3">⚡ 混合搜索算法</h5>
                          <ul className="text-sm text-gray-700 space-y-2">
                            <li>• 自主设计Hybrid Search</li>
                            <li>• 动态权重智能调整</li>
                            <li>• RRF算法结果重排</li>
                            <li>• 语义+全文双引擎</li>
                          </ul>
                        </div>
                      </div>
                    </div>

                    <div className="bg-gradient-to-r from-purple-50 to-indigo-50 p-6 rounded-lg border border-purple-200">
                      <h4 className="font-semibold text-purple-900 mb-4">AI教练专业能力</h4>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="bg-white p-4 rounded-lg border border-purple-200 text-center">
                          <div className="text-2xl font-bold text-purple-600 mb-1">95%+</div>
                          <div className="text-sm text-gray-600">专业术语准确率</div>
                        </div>
                        <div className="bg-white p-4 rounded-lg border border-blue-200 text-center">
                          <div className="text-2xl font-bold text-blue-600 mb-1">质的飞跃</div>
                          <div className="text-sm text-gray-600">检索精准度提升</div>
                        </div>
                        <div className="bg-white p-4 rounded-lg border border-green-200 text-center">
                          <div className="text-2xl font-bold text-green-600 mb-1">双人格</div>
                          <div className="text-sm text-gray-600">智能角色切换</div>
                        </div>
                      </div>
                    </div>

                    <div className="bg-gradient-to-r from-orange-50 to-amber-50 p-6 rounded-lg border border-orange-200">
                      <h4 className="font-semibold text-orange-900 mb-4">从原始素材到智能大脑</h4>
                      <div className="flex items-center justify-center">
                        <div className="flex items-center space-x-4 text-sm">
                          <div className="bg-white px-4 py-2 rounded-lg border border-orange-200 text-center">
                            <div className="font-semibold text-orange-600">复杂PDF</div>
                            <div className="text-xs text-gray-600">图表K线</div>
                          </div>
                          <div className="text-orange-600">→</div>
                          <div className="bg-white px-4 py-2 rounded-lg border border-blue-200 text-center">
                            <div className="font-semibold text-blue-600">多模态解析</div>
                            <div className="text-xs text-gray-600">LLM Vision</div>
                          </div>
                          <div className="text-blue-600">→</div>
                          <div className="bg-white px-4 py-2 rounded-lg border border-purple-200 text-center">
                            <div className="font-semibold text-purple-600">混合搜索</div>
                            <div className="text-xs text-gray-600">RRF算法</div>
                          </div>
                          <div className="text-purple-600">→</div>
                          <div className="bg-white px-4 py-2 rounded-lg border border-green-200 text-center">
                            <div className="font-semibold text-green-600">金牌教练</div>
                            <div className="text-xs text-gray-600">双重人格</div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

              </CardContent>
            </Card>
          </TabsContent>

          {/* 兔子 - Digital Human */}
          <TabsContent value="tuzi">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-pink-600">
                  <Video className="h-6 w-6" />
                  🐰兔子 - 数字人系统
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                
                <div className="bg-pink-50 p-6 rounded-lg border-2 border-pink-200">
                  <h3 className="text-lg font-semibold mb-4 text-pink-900">🎬 数字人测试包</h3>
                  <div className="text-center">
                    <div className="bg-white p-6 rounded-lg shadow-md max-w-md mx-auto">
                      <Video className="h-16 w-16 text-pink-600 mx-auto mb-4" />
                      <h4 className="text-lg font-semibold mb-2">AI数字人演示包</h4>
                      <p className="text-sm text-gray-600 mb-4">
                        包含完整的数字人安装包、使用说明和演示视频
                      </p>
                      <Button 
                        className="bg-pfa-champagne-gold hover:bg-pfa-accent-gold text-pfa-royal-blue mb-2"
                        onClick={() => window.open('https://drive.google.com/drive/folders/1dsqMFrM9jQlRwqfoh_KNFZs7ltfN0yZW', '_blank')}
                      >
                        <Download className="h-4 w-4 mr-2" />
                        下载测试包
                      </Button>
                      <p className="text-xs text-gray-500">
                        Google文档链接 - 包含安装包和说明
                      </p>
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="text-lg font-semibold mb-4">📹 使用指导视频</h3>
                  <div className="bg-gray-100 p-4 rounded-lg text-center">
                    <Play className="h-12 w-12 text-gray-600 mx-auto mb-3" />
                    <h4 className="font-semibold mb-2">安装使用教程</h4>
                    <p className="text-sm text-gray-600 mb-4">
                      详细的安装步骤和使用方法演示视频
                    </p>
                    <Button 
                      variant="outline"
                      onClick={() => window.open('https://drive.google.com/file/d/1j0y8xfh50_h6M7k-8O77W6Zfs_XmsI56/view?usp=drive_link', '_blank')}
                    >
                      <Play className="h-4 w-4 mr-2" />
                      观看教程视频
                    </Button>
                  </div>
                </div>

                <div>
                  <h3 className="text-lg font-semibold mb-4">🔧 技术特性</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="bg-white p-4 rounded-lg border">
                      <h4 className="font-semibold text-blue-600 mb-2">AI驱动</h4>
                      <ul className="text-sm text-gray-600 space-y-1">
                        <li>• 自然语言处理</li>
                        <li>• 表情动作同步</li>
                        <li>• 智能交互响应</li>
                      </ul>
                    </div>
                    <div className="bg-white p-4 rounded-lg border">
                      <h4 className="font-semibold text-green-600 mb-2">应用场景</h4>
                      <ul className="text-sm text-gray-600 space-y-1">
                        <li>• 客户接待介绍</li>
                        <li>• 产品演示说明</li>
                        <li>• 培训课程讲解</li>
                      </ul>
                    </div>
                  </div>
                </div>

              </CardContent>
            </Card>
          </TabsContent>

          {/* Dunk - Lead Generation */}
          <TabsContent value="dunk">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-orange-600">
                  <Users className="h-6 w-6" />
                  Dunk - AI销售获客系统
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                
                <div className="bg-orange-50 p-6 rounded-lg border-2 border-orange-200">
                  <h3 className="text-lg font-semibold mb-4 text-orange-900">🎯 现阶段功能概述</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <h4 className="font-semibold mb-3">📊 数据自动采集</h4>
                      <ul className="text-sm space-y-2">
                        <li className="flex items-start gap-2">
                          <Target className="h-4 w-4 text-orange-600 mt-0.5" />
                          <span>基于职业关键词和地区条件筛选ICP用户</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <Target className="h-4 w-4 text-orange-600 mt-0.5" />
                          <span>自动抓取姓名、邮箱、教育背景等信息</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <Target className="h-4 w-4 text-orange-600 mt-0.5" />
                          <span>数据去重和字段标准化处理</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <Target className="h-4 w-4 text-orange-600 mt-0.5" />
                          <span>实时写入Google Sheets/Airtable</span>
                        </li>
                      </ul>
                    </div>
                    <div>
                      <h4 className="font-semibold mb-3">💰 成本优势</h4>
                      <div className="bg-white p-4 rounded-lg border border-orange-200">
                        <div className="text-center">
                          <div className="text-2xl font-bold text-orange-600 mb-1">$0.01</div>
                          <div className="text-xs text-gray-600 mb-2">单条用户信息获取成本</div>
                          <div className="text-xs text-green-600">显著优于人工或第三方服务</div>
                        </div>
                      </div>
                      <ul className="text-sm space-y-2 mt-3">
                        <li className="flex items-start gap-2">
                          <Brain className="h-4 w-4 text-blue-600 mt-0.5" />
                          <span>支持大规模批量采集</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <Brain className="h-4 w-4 text-blue-600 mt-0.5" />
                          <span>基于n8n自动化工作流</span>
                        </li>
                      </ul>
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="text-lg font-semibold mb-4">🚀 近期升级计划</h3>
                  <div className="bg-gradient-to-r from-blue-50 to-purple-50 p-6 rounded-lg border border-blue-200">
                    <h4 className="font-semibold text-blue-900 mb-4">优先功能：自动化&quot;首次触达&quot;邮件系统</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <h5 className="font-semibold text-purple-800 mb-3">🤖 智能内容生成</h5>
                        <ul className="text-sm text-gray-700 space-y-2">
                          <li>• 基于客户姓名、职位、公司信息</li>
                          <li>• AI模型自动撰写个性化问候邮件</li>
                          <li>• 确保内容专业且契合收件人背景</li>
                          <li>• 提高邮件回复率和打开率</li>
                        </ul>
                      </div>
                      <div>
                        <h5 className="font-semibold text-green-800 mb-3">📧 自动化发送</h5>
                        <ul className="text-sm text-gray-700 space-y-2">
                          <li>• 集成Gmail、SendGrid等邮件API</li>
                          <li>• 数据采集完成后自动投递</li>
                          <li>• 缩短从线索获取到首次触达的时间</li>
                          <li>• 为后续销售转化建立信任起点</li>
                        </ul>
                      </div>
                    </div>
                  </div>
                </div>
                
                <div>
                  <h3 className="text-lg font-semibold mb-4">🌍 多平台自动化营销能力</h3>
                  <div className="bg-gradient-to-r from-green-50 to-blue-50 p-6 rounded-lg border border-green-200">
                    <p className="text-gray-700 mb-4">在获客流程之外，我们已搭建<strong>多平台内容自动发布工作流</strong>，可将营销内容自动分发至多个社交平台</p>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="bg-white p-4 rounded-lg border">
                        <h5 className="font-semibold text-red-600 mb-2">🎞️ 内容制作</h5>
                        <ul className="text-xs text-gray-600 space-y-1">
                          <li>• 自动化短视频制作</li>
                          <li>• 行业痛点分析</li>
                          <li>• 客户案例展示</li>
                          <li>• 解决方案推广</li>
                        </ul>
                      </div>
                      <div className="bg-white p-4 rounded-lg border">
                        <h5 className="font-semibold text-blue-600 mb-2">📡 平台分发</h5>
                        <ul className="text-xs text-gray-600 space-y-1">
                          <li>• YouTube</li>
                          <li>• X (Twitter)</li>
                          <li>• Instagram</li>
                          <li>• LinkedIn</li>
                        </ul>
                      </div>
                      <div className="bg-white p-4 rounded-lg border">
                        <h5 className="font-semibold text-purple-600 mb-2">🎯 引流转化</h5>
                        <ul className="text-xs text-gray-600 space-y-1">
                          <li>• Landing Page引流</li>
                          <li>• 预约表单收集</li>
                          <li>• 与主动获客无缝衔接</li>
                          <li>• 双引擎增长模型</li>
                        </ul>
                      </div>
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="text-lg font-semibold mb-4">💡 商业价值</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-4">
                      <div className="bg-gradient-to-r from-orange-50 to-yellow-50 p-4 rounded-lg border border-orange-200">
                        <h4 className="font-semibold text-orange-900 mb-2 flex items-center gap-2">
                          <Target className="h-5 w-5" />
                          高效获客
                        </h4>
                        <p className="text-sm text-orange-800">
                          全自动化流程，大幅缩短获客周期
                        </p>
                      </div>
                      <div className="bg-gradient-to-r from-green-50 to-blue-50 p-4 rounded-lg border border-green-200">
                        <h4 className="font-semibold text-green-900 mb-2 flex items-center gap-2">
                          <Download className="h-5 w-5" />
                          成本优化
                        </h4>
                        <p className="text-sm text-green-800">
                          极低单条数据成本，支持批量拓展
                        </p>
                      </div>
                    </div>
                    <div className="space-y-4">
                      <div className="bg-gradient-to-r from-purple-50 to-pink-50 p-4 rounded-lg border border-purple-200">
                        <h4 className="font-semibold text-purple-900 mb-2 flex items-center gap-2">
                          <Zap className="h-5 w-5" />
                          销售加速
                        </h4>
                        <p className="text-sm text-purple-800">
                          自动化首次触达显著提高初始互动率
                        </p>
                      </div>
                      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-4 rounded-lg border border-blue-200">
                        <h4 className="font-semibold text-blue-900 mb-2 flex items-center gap-2">
                          <Globe className="h-5 w-5" />
                          可扩展性
                        </h4>
                        <p className="text-sm text-blue-800">
                          基于n8n，快速接入其他数据源和AI功能
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
                
                <div>
                  <h3 className="text-lg font-semibold mb-4">🛡️ 下一步实施路线</h3>
                  <div className="bg-gray-50 p-6 rounded-lg border border-gray-200">
                    <ol className="space-y-3">
                      <li className="flex items-start gap-3">
                        <span className="bg-blue-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs font-bold mt-0.5">1</span>
                        <span className="text-gray-700">集成AI邮件生成与自动发送模块</span>
                      </li>
                      <li className="flex items-start gap-3">
                        <span className="bg-green-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs font-bold mt-0.5">2</span>
                        <span className="text-gray-700">对邮件模板进行A/B测试，优化回复率</span>
                      </li>
                      <li className="flex items-start gap-3">
                        <span className="bg-purple-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs font-bold mt-0.5">3</span>
                        <span className="text-gray-700">启动多平台内容投放试点，验证引流与转化效果</span>
                      </li>
                      <li className="flex items-start gap-3">
                        <span className="bg-orange-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs font-bold mt-0.5">4</span>
                        <span className="text-gray-700">形成&quot;数据采集 → 首次触达 → 持续跟进 → 内容引流&quot;的闭环流程</span>
                      </li>
                    </ol>
                  </div>
                </div>

              </CardContent>
            </Card>
          </TabsContent>

        </Tabs>


      </div>
    </div>
  );
}