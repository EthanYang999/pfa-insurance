"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { 
  MessageCircle, 
  BookOpen, 
  Users, 
  TrendingUp, 
  Award, 
  Target,
  ArrowRight,
  Play,
  Menu,
  X
} from "lucide-react";
import { useRouter } from "next/navigation";

interface User {
  email?: string;
  sub?: string;
}

interface PFADashboardProps {
  user: User;
}

export function PFADashboard({ user }: PFADashboardProps) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const router = useRouter();

  return (
    <div className="min-h-screen bg-gradient-to-br from-pfa-light-gray to-white">
      {/* Navigation Header */}
      <nav className="bg-pfa-royal-blue shadow-lg relative z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            {/* Logo */}
            <div className="flex items-center">
              <div className="flex-shrink-0 flex items-center">
                <div className="w-10 h-10 bg-pfa-champagne-gold rounded-lg flex items-center justify-center mr-3">
                  <span className="text-pfa-royal-blue font-bold text-lg">P</span>
                </div>
                <div className="hidden sm:block">
                  <h1 className="text-xl font-bold text-white">PFA 保险联盟</h1>
                  <p className="text-pfa-champagne-gold text-xs">Premier Financial Alliance</p>
                </div>
              </div>
            </div>

            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center space-x-8">
              <a href="#home" className="text-white hover:text-pfa-champagne-gold transition-colors">首页</a>
              <button onClick={() => router.push('/chat')} className="text-white hover:text-pfa-champagne-gold transition-colors">AI 教练</button>
              <a href="#about" className="text-white hover:text-pfa-champagne-gold transition-colors">关于我们</a>
              <a href="#concept" className="text-white hover:text-pfa-champagne-gold transition-colors">核心理念</a>
              <a href="#opportunity" className="text-white hover:text-pfa-champagne-gold transition-colors">事业机会</a>
              <a href="#success" className="text-white hover:text-pfa-champagne-gold transition-colors">成功案例</a>
              <div className="flex items-center space-x-3">
                <span className="text-pfa-champagne-gold text-sm">
                  {user?.email?.split('@')[0] || '会员'}
                </span>
                <Button 
                  variant="outline" 
                  size="sm"
                  className="border-pfa-champagne-gold text-pfa-champagne-gold hover:bg-pfa-champagne-gold hover:text-pfa-royal-blue"
                >
                  退出
                </Button>
              </div>
            </div>

            {/* Mobile menu button */}
            <div className="md:hidden flex items-center">
              <button
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="text-white hover:text-pfa-champagne-gold"
              >
                {isMobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isMobileMenuOpen && (
          <div className="md:hidden bg-pfa-navy-blue border-t border-pfa-champagne-gold/20">
            <div className="px-2 pt-2 pb-3 space-y-1">
              <a href="#home" className="block px-3 py-2 text-white hover:text-pfa-champagne-gold">首页</a>
              <button onClick={() => router.push('/chat')} className="block px-3 py-2 text-white hover:text-pfa-champagne-gold text-left w-full">AI 教练</button>
              <a href="#about" className="block px-3 py-2 text-white hover:text-pfa-champagne-gold">关于我们</a>
              <a href="#concept" className="block px-3 py-2 text-white hover:text-pfa-champagne-gold">核心理念</a>
              <a href="#opportunity" className="block px-3 py-2 text-white hover:text-pfa-champagne-gold">事业机会</a>
              <a href="#success" className="block px-3 py-2 text-white hover:text-pfa-champagne-gold">成功案例</a>
              <div className="px-3 py-2 border-t border-pfa-champagne-gold/20 mt-2">
                <p className="text-pfa-champagne-gold text-sm mb-2">{user?.email?.split('@')[0] || '会员'}</p>
                <Button variant="outline" size="sm" className="w-full border-pfa-champagne-gold text-pfa-champagne-gold">
                  退出
                </Button>
              </div>
            </div>
          </div>
        )}
      </nav>

      {/* Hero Section */}
      <section id="home" className="relative pt-16 pb-32 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-pfa-royal-blue/10 to-pfa-navy-blue/5"></div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="lg:grid lg:grid-cols-12 lg:gap-8">
            <div className="sm:text-center md:max-w-2xl md:mx-auto lg:col-span-6 lg:text-left">
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-pfa-royal-blue leading-tight">
                AI驱动的
                <span className="text-pfa-champagne-gold"> 保险教练</span>
                <br />助您成就卓越
              </h1>
              <p className="mt-6 text-xl text-pfa-dark-gray leading-relaxed">
                专为PFA保险经纪人打造的智能培训平台。24/7 AI教练雪莉，提供个性化指导，
                助您掌握销售技巧、产品知识，实现事业突破。
              </p>
              <div className="mt-8 flex flex-col sm:flex-row gap-4">
                <Button 
                  onClick={() => router.push('/chat')}
                  className="bg-pfa-champagne-gold hover:bg-pfa-accent-gold text-pfa-royal-blue font-semibold px-8 py-6 text-lg"
                >
                  <MessageCircle className="mr-2 h-5 w-5" />
                  立即体验 AI 教练
                </Button>
                <Button 
                  variant="outline"
                  className="border-pfa-royal-blue text-pfa-royal-blue hover:bg-pfa-royal-blue hover:text-white px-8 py-6 text-lg"
                >
                  <Play className="mr-2 h-5 w-5" />
                  观看演示视频
                </Button>
              </div>
            </div>
            
            {/* Hero Image/Animation */}
            <div className="mt-12 lg:mt-0 lg:col-span-6">
              <div className="bg-gradient-to-br from-pfa-royal-blue to-pfa-navy-blue rounded-2xl p-8 shadow-2xl">
                <div className="bg-white rounded-lg p-6">
                  <div className="flex items-center mb-4">
                    <div className="w-10 h-10 bg-pfa-champagne-gold rounded-full flex items-center justify-center mr-3">
                      <MessageCircle className="h-5 w-5 text-pfa-royal-blue" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-pfa-royal-blue">AI教练雪莉</h3>
                      <p className="text-sm text-pfa-dark-gray">在线 · 随时为您服务</p>
                    </div>
                  </div>
                  <div className="space-y-3">
                    <div className="bg-pfa-light-gray rounded-lg p-3">
                      <p className="text-sm text-pfa-dark-gray">您好！我是雪莉，您的专属AI保险教练。我可以帮助您...</p>
                    </div>
                    <div className="flex space-x-2">
                      <Button size="sm" variant="outline" className="text-xs">产品知识</Button>
                      <Button size="sm" variant="outline" className="text-xs">销售技巧</Button>
                      <Button size="sm" variant="outline" className="text-xs">客户服务</Button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h2 className="text-3xl sm:text-4xl font-bold text-pfa-royal-blue">
              专业功能，助力成长
            </h2>
            <p className="mt-4 text-xl text-pfa-dark-gray">
              全方位的培训支持，让每一位经纪人都能发挥最大潜能
            </p>
          </div>

          <div className="mt-16 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              {
                icon: <MessageCircle className="h-8 w-8" />,
                title: "AI智能对话",
                description: "24/7在线，即时回答您的专业问题，提供个性化指导建议"
              },
              {
                icon: <BookOpen className="h-8 w-8" />,
                title: "产品知识库",
                description: "完整的保险产品信息，条款解析，帮助您成为产品专家"
              },
              {
                icon: <Target className="h-8 w-8" />,
                title: "销售技巧训练",
                description: "从开场到成交的全流程指导，提升您的专业销售能力"
              },
              {
                icon: <Users className="h-8 w-8" />,
                title: "团队协作",
                description: "分享经验，互相学习，打造高效的团队合作环境"
              },
              {
                icon: <TrendingUp className="h-8 w-8" />,
                title: "业绩分析",
                description: "数据驱动的业绩分析，帮助您发现提升空间和机会"
              },
              {
                icon: <Award className="h-8 w-8" />,
                title: "成长认证",
                description: "专业技能认证体系，记录您的每一步成长轨迹"
              }
            ].map((feature, index) => (
              <Card key={index} className="border-0 shadow-lg hover:shadow-xl transition-shadow duration-300">
                <CardHeader className="text-center">
                  <div className="w-16 h-16 bg-pfa-champagne-gold/10 rounded-full flex items-center justify-center mx-auto mb-4">
                    <div className="text-pfa-champagne-gold">
                      {feature.icon}
                    </div>
                  </div>
                  <CardTitle className="text-xl text-pfa-royal-blue">{feature.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-pfa-dark-gray text-center">{feature.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 bg-gradient-to-r from-pfa-royal-blue to-pfa-navy-blue">
        <div className="max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl sm:text-4xl font-bold text-white">
            准备开始您的专业成长之旅？
          </h2>
          <p className="mt-6 text-xl text-pfa-champagne-gold">
            立即体验AI教练雪莉，获得个性化的专业指导，让您的保险事业更上一层楼
          </p>
          <div className="mt-8">
            <Button 
              onClick={() => router.push('/chat')}
              className="bg-pfa-champagne-gold hover:bg-pfa-accent-gold text-pfa-royal-blue font-semibold px-8 py-6 text-lg"
            >
              开始对话
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-pfa-royal-blue text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div className="md:col-span-2">
              <div className="flex items-center mb-4">
                <div className="w-10 h-10 bg-pfa-champagne-gold rounded-lg flex items-center justify-center mr-3">
                  <span className="text-pfa-royal-blue font-bold text-lg">P</span>
                </div>
                <div>
                  <h3 className="text-xl font-bold">PFA 保险联盟</h3>
                  <p className="text-pfa-champagne-gold text-sm">Premier Financial Alliance</p>
                </div>
              </div>
              <p className="text-gray-300 mb-4">
                专注于为保险经纪人提供最专业的AI培训支持，助力每一位伙伴实现事业成功。
              </p>
            </div>
            
            <div>
              <h4 className="text-lg font-semibold mb-4 text-pfa-champagne-gold">快速链接</h4>
              <ul className="space-y-2">
                <li><a href="#about" className="text-gray-300 hover:text-white transition-colors">关于我们</a></li>
                <li><a href="#concept" className="text-gray-300 hover:text-white transition-colors">核心理念</a></li>
                <li><a href="#opportunity" className="text-gray-300 hover:text-white transition-colors">事业机会</a></li>
                <li><a href="#success" className="text-gray-300 hover:text-white transition-colors">成功案例</a></li>
              </ul>
            </div>
            
            <div>
              <h4 className="text-lg font-semibold mb-4 text-pfa-champagne-gold">联系我们</h4>
              <div className="space-y-2 text-gray-300">
                <p>[联系信息待添加]</p>
                <p>[详情敬请期待]</p>
              </div>
            </div>
          </div>
          
          <div className="border-t border-pfa-champagne-gold/20 mt-8 pt-8 text-center">
            <p className="text-gray-300">
              © 2024 PFA 保险联盟. 保留所有权利.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}