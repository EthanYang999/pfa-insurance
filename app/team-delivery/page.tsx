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
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h3 className="text-lg font-semibold mb-3 text-gray-900">📱 建议测试流程</h3>
                <ol className="text-gray-700 space-y-2 text-sm">
                  <li className="flex items-start gap-2">
                    <span className="bg-pfa-royal-blue text-white rounded-full w-5 h-5 flex items-center justify-center text-xs font-bold mt-0.5">1</span>
                    <span>使用测试账户登录主站，体验AI对话功能</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="bg-pfa-royal-blue text-white rounded-full w-5 h-5 flex items-center justify-center text-xs font-bold mt-0.5">2</span>
                    <span>尝试不同类型的保险相关问题，测试AI回答质量</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="bg-pfa-royal-blue text-white rounded-full w-5 h-5 flex items-center justify-center text-xs font-bold mt-0.5">3</span>
                    <span>体验实时流式回复和Markdown格式显示</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="bg-pfa-royal-blue text-white rounded-full w-5 h-5 flex items-center justify-center text-xs font-bold mt-0.5">4</span>
                    <span>验证上下文理解和专业知识准确性</span>
                  </li>
                </ol>
              </div>
              <div>
                <h3 className="text-lg font-semibold mb-3 text-gray-900">🔑 测试账号</h3>
                <div className="bg-blue-50 p-3 rounded-lg">
                  <h4 className="font-semibold text-blue-900 text-sm mb-1">用户账号</h4>
                  <div className="text-xs text-blue-800 space-y-1">
                    <div>邮箱：test@pfa.com</div>
                    <div>密码：test123456</div>
                  </div>
                </div>
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
                  <div>网址：pfabot.netlify.app</div>
                  <div>账号：test@pfa.com</div>
                  <div>密码：test123456</div>
                </div>
                <Button 
                  size="sm" 
                  className="w-full bg-pfa-royal-blue hover:bg-pfa-navy-blue"
                  onClick={() => window.open('https://pfabot.netlify.app', '_blank')}
                >
                  <ExternalLink className="h-4 w-4 mr-2" />
                  立即体验
                </Button>
              </div>
              <div className="bg-white p-4 rounded-lg border">
                <h4 className="font-semibold mb-2 text-green-600">🛡️ 管理后台</h4>
                <div className="text-sm text-gray-600 mb-3">
                  <div>网址：pfabot.netlify.app/admin</div>
                  <div>账号：test@pfa.com</div>
                  <div>密码：test123456</div>
                </div>
                <Button 
                  size="sm" 
                  variant="outline"
                  className="w-full border-pfa-royal-blue text-pfa-royal-blue hover:bg-blue-50"
                  onClick={() => window.open('https://pfabot.netlify.app/admin', '_blank')}
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
                        <li>• Dify AI平台</li>
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
                  <h3 className="text-lg font-semibold mb-4 text-purple-900">🔍 知识库数据源</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <h4 className="font-semibold mb-3">📚 引用文档库</h4>
                      <ul className="text-sm space-y-2">
                        <li className="flex items-start gap-2">
                          <CheckCircle className="h-4 w-4 text-green-600 mt-0.5" />
                          <span>保险法律法规文件（50+份）</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <CheckCircle className="h-4 w-4 text-green-600 mt-0.5" />
                          <span>保险产品条款说明书（100+份）</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <CheckCircle className="h-4 w-4 text-green-600 mt-0.5" />
                          <span>行业最佳实践案例（80+个）</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <CheckCircle className="h-4 w-4 text-green-600 mt-0.5" />
                          <span>销售培训教材（30+本）</span>
                        </li>
                      </ul>
                    </div>
                    <div>
                      <h4 className="font-semibold mb-3">⚡ 数据处理工作</h4>
                      <ul className="text-sm space-y-2">
                        <li className="flex items-start gap-2">
                          <Zap className="h-4 w-4 text-orange-600 mt-0.5" />
                          <span>文档格式标准化处理</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <Zap className="h-4 w-4 text-orange-600 mt-0.5" />
                          <span>关键信息提取和分类</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <Zap className="h-4 w-4 text-orange-600 mt-0.5" />
                          <span>语义向量化处理</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <Zap className="h-4 w-4 text-orange-600 mt-0.5" />
                          <span>质量验证和测试</span>
                        </li>
                      </ul>
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="text-lg font-semibold mb-4">🎯 专业化定制</h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="bg-white p-4 rounded-lg border">
                      <h4 className="font-semibold text-blue-600 mb-2">产品知识</h4>
                      <p className="text-sm text-gray-600">覆盖寿险、重疾险、意外险、医疗险等全险种专业知识</p>
                    </div>
                    <div className="bg-white p-4 rounded-lg border">
                      <h4 className="font-semibold text-green-600 mb-2">销售技巧</h4>
                      <p className="text-sm text-gray-600">包含需求分析、产品推荐、异议处理等销售方法论</p>
                    </div>
                    <div className="bg-white p-4 rounded-lg border">
                      <h4 className="font-semibold text-purple-600 mb-2">服务流程</h4>
                      <p className="text-sm text-gray-600">标准化的客户服务流程和常见问题解决方案</p>
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="text-lg font-semibold mb-4">📊 测试结果说明</h3>
                  <div className="bg-green-50 p-4 rounded-lg">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <h4 className="font-semibold text-green-900 mb-2">准确性测试</h4>
                        <ul className="text-sm text-green-800 space-y-1">
                          <li>• 专业术语准确率：95%+</li>
                          <li>• 产品信息准确率：98%+</li>
                          <li>• 法规引用准确率：99%+</li>
                        </ul>
                      </div>
                      <div>
                        <h4 className="font-semibold text-green-900 mb-2">响应质量</h4>
                        <ul className="text-sm text-green-800 space-y-1">
                          <li>• 回答相关性：90%+</li>
                          <li>• 内容完整性：85%+</li>
                          <li>• 实用性评分：4.5/5</li>
                        </ul>
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
                        onClick={() => window.open('https://docs.google.com/document/d/your-document-id', '_blank')}
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
                    <Button variant="outline">
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
                  <h3 className="text-lg font-semibold mb-4 text-orange-900">🎯 LinkedIn获客能力</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <h4 className="font-semibold mb-3">📊 数据抓取能力</h4>
                      <ul className="text-sm space-y-2">
                        <li className="flex items-start gap-2">
                          <Target className="h-4 w-4 text-orange-600 mt-0.5" />
                          <span>精准定位目标客户群体</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <Target className="h-4 w-4 text-orange-600 mt-0.5" />
                          <span>自动化用户信息采集</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <Target className="h-4 w-4 text-orange-600 mt-0.5" />
                          <span>行业和职位智能筛选</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <Target className="h-4 w-4 text-orange-600 mt-0.5" />
                          <span>联系方式和背景分析</span>
                        </li>
                      </ul>
                    </div>
                    <div>
                      <h4 className="font-semibold mb-3">🤖 AI销售助手</h4>
                      <ul className="text-sm space-y-2">
                        <li className="flex items-start gap-2">
                          <Brain className="h-4 w-4 text-blue-600 mt-0.5" />
                          <span>个性化开场白生成</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <Brain className="h-4 w-4 text-blue-600 mt-0.5" />
                          <span>客户需求智能分析</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <Brain className="h-4 w-4 text-blue-600 mt-0.5" />
                          <span>跟进策略自动制定</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <Brain className="h-4 w-4 text-blue-600 mt-0.5" />
                          <span>转化率优化建议</span>
                        </li>
                      </ul>
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="text-lg font-semibold mb-4">🚀 未来版本规划</h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="bg-white p-4 rounded-lg border border-blue-200">
                      <h4 className="font-semibold text-blue-600 mb-2">阶段一</h4>
                      <p className="text-sm text-gray-600 mb-2">LinkedIn集成</p>
                      <ul className="text-xs text-gray-500 space-y-1">
                        <li>• 用户信息抓取</li>
                        <li>• 基础筛选功能</li>
                        <li>• 数据导出工具</li>
                      </ul>
                    </div>
                    <div className="bg-white p-4 rounded-lg border border-green-200">
                      <h4 className="font-semibold text-green-600 mb-2">阶段二</h4>
                      <p className="text-sm text-gray-600 mb-2">AI智能分析</p>
                      <ul className="text-xs text-gray-500 space-y-1">
                        <li>• 客户画像分析</li>
                        <li>• 需求预测模型</li>
                        <li>• 成功率评估</li>
                      </ul>
                    </div>
                    <div className="bg-white p-4 rounded-lg border border-purple-200">
                      <h4 className="font-semibold text-purple-600 mb-2">阶段三</h4>
                      <p className="text-sm text-gray-600 mb-2">自动化销售</p>
                      <ul className="text-xs text-gray-500 space-y-1">
                        <li>• 自动跟进序列</li>
                        <li>• 个性化内容生成</li>
                        <li>• 转化漏斗优化</li>
                      </ul>
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="text-lg font-semibold mb-4">💡 核心价值</h3>
                  <div className="bg-gradient-to-r from-orange-50 to-yellow-50 p-4 rounded-lg">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <h4 className="font-semibold text-orange-900 mb-2">效率提升</h4>
                        <p className="text-sm text-orange-800">
                          自动化客户发现和初步筛选，销售效率提升300%+
                        </p>
                      </div>
                      <div>
                        <h4 className="font-semibold text-orange-900 mb-2">精准营销</h4>
                        <p className="text-sm text-orange-800">
                          AI驱动的客户分析，提高成交转化率50%+
                        </p>
                      </div>
                    </div>
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