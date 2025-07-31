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
  X,
  Heart,
  Shield,
  Star,
  Globe,
  Lightbulb,
  Zap,
  CheckCircle,
  Quote
} from "lucide-react";
import { useRouter } from "next/navigation";
import { LogoutButton } from "@/components/logout-button";

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
      <nav className="bg-pfa-royal-blue shadow-lg sticky top-0 z-50">
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
                <LogoutButton />
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
                <LogoutButton className="w-full" />
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
                专为PFA保险经纪人打造的智能培训平台。24/7 PFA智能助手，提供个性化指导，
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
                      <h3 className="font-semibold text-pfa-royal-blue">PFA智能助手</h3>
                      <p className="text-sm text-pfa-dark-gray">在线 · 随时为您服务</p>
                    </div>
                  </div>
                  <div className="space-y-3">
                    <div className="bg-pfa-light-gray rounded-lg p-3">
                      <p className="text-sm text-pfa-dark-gray">您好！我是PFA智能助手，您的专属AI保险培训助手。我可以帮助您...</p>
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

      {/* About Section */}
      <section id="about" className="py-24 bg-gradient-to-r from-pfa-royal-blue/5 to-pfa-navy-blue/5">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold text-pfa-royal-blue mb-6">
              关于 PFA 保险联盟
            </h2>
            <p className="text-xl text-pfa-dark-gray max-w-3xl mx-auto">
              Premier Financial Alliance - 致力于成为保险行业的领军者，以专业、创新、卓越为核心，
              为每一位伙伴提供最优质的培训支持和事业发展平台。
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div className="space-y-6">
              <div className="flex items-start space-x-4">
                <div className="w-12 h-12 bg-pfa-champagne-gold rounded-lg flex items-center justify-center flex-shrink-0">
                  <Heart className="h-6 w-6 text-pfa-royal-blue" />
                </div>
                <div>
                  <h3 className="text-xl font-semibold text-pfa-royal-blue mb-2">使命愿景</h3>
                  <p className="text-pfa-dark-gray">
                    以人为本，用心服务每一位客户和伙伴。通过专业的保险解决方案和卓越的团队文化，
                    创造更美好的未来，让保险真正成为生活的保障。
                  </p>
                </div>
              </div>

              <div className="flex items-start space-x-4">
                <div className="w-12 h-12 bg-pfa-champagne-gold rounded-lg flex items-center justify-center flex-shrink-0">
                  <Shield className="h-6 w-6 text-pfa-royal-blue" />
                </div>
                <div>
                  <h3 className="text-xl font-semibold text-pfa-royal-blue mb-2">专业保障</h3>
                  <p className="text-pfa-dark-gray">
                    拥有资深的专业团队和完善的培训体系，确保每一位经纪人都能提供最专业、
                    最贴心的保险咨询和服务，为客户创造真正的价值。
                  </p>
                </div>
              </div>

              <div className="flex items-start space-x-4">
                <div className="w-12 h-12 bg-pfa-champagne-gold rounded-lg flex items-center justify-center flex-shrink-0">
                  <Star className="h-6 w-6 text-pfa-royal-blue" />
                </div>
                <div>
                  <h3 className="text-xl font-semibold text-pfa-royal-blue mb-2">卓越文化</h3>
                  <p className="text-pfa-dark-gray">
                    倡导&ldquo;一个人走得快，一群人走得远&rdquo;的团队精神，营造互助共赢的工作环境，
                    让每个人都能在团队中实现个人价值和职业成长。
                  </p>
                </div>
              </div>
            </div>

            <div className="relative">
              <div className="bg-gradient-to-br from-pfa-royal-blue to-pfa-navy-blue rounded-2xl p-8 shadow-2xl">
                <div className="bg-white/10 backdrop-blur-sm rounded-lg p-6 text-center">
                  <Globe className="h-16 w-16 text-pfa-champagne-gold mx-auto mb-4" />
                  <h4 className="text-2xl font-bold text-white mb-4">全球视野，本土服务</h4>
                  <p className="text-pfa-champagne-gold">
                    结合国际先进的保险理念与本土市场需求，为客户提供最适合的保险解决方案
                  </p>
                  <div className="mt-6 pt-6 border-t border-white/20">
                    <p className="text-white/80 text-sm">
                      [专业团队形象展示区域 - 内容待添加]
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Core Philosophy Section */}
      <section id="concept" className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold text-pfa-royal-blue mb-6">
              核心理念
            </h2>
            <p className="text-xl text-pfa-dark-gray max-w-3xl mx-auto">
              PFA 独特的保险经营理念，以创新科技赋能传统保险业务，实现客户、经纪人、公司的三方共赢
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
            {[
              {
                icon: <Lightbulb className="h-10 w-10" />,
                title: "智慧驱动",
                description: "运用AI技术和数据分析，为每位经纪人提供智能化的培训支持和业务指导，让专业服务更加精准高效。"
              },
              {
                icon: <Users className="h-10 w-10" />,
                title: "团队共赢",
                description: "坚持&lsquo;一个人走得快，一群人走得远&rsquo;的理念，通过团队协作和资源共享，实现集体成长和共同成功。"
              },
              {
                icon: <Heart className="h-10 w-10" />,
                title: "客户至上",
                description: "始终将客户需求放在首位，通过专业的风险评估和个性化的保障方案，为每个家庭提供最适合的保险保障。"
              }
            ].map((philosophy, index) => (
              <Card key={index} className="border-0 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105">
                <CardHeader className="text-center pb-4">
                  <div className="w-20 h-20 bg-gradient-to-br from-pfa-champagne-gold to-pfa-accent-gold rounded-full flex items-center justify-center mx-auto mb-4">
                    <div className="text-pfa-royal-blue">
                      {philosophy.icon}
                    </div>
                  </div>
                  <CardTitle className="text-xl text-pfa-royal-blue">{philosophy.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-pfa-dark-gray text-center leading-relaxed">{philosophy.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>

          <div className="bg-gradient-to-r from-pfa-royal-blue/5 to-pfa-champagne-gold/5 rounded-2xl p-8">
            <div className="text-center">
              <Zap className="h-12 w-12 text-pfa-champagne-gold mx-auto mb-4" />
              <h3 className="text-2xl font-bold text-pfa-royal-blue mb-4">AI科技赋能 · 专业服务升级</h3>
              <p className="text-pfa-dark-gray text-lg max-w-4xl mx-auto">
                通过先进的AI教练系统，我们将复杂的保险知识转化为易懂的培训内容，
                让每位经纪人都能快速掌握专业技能，为客户提供更专业、更贴心的服务。
                科技与人文的完美结合，让保险服务真正做到有温度、有智慧。
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Opportunity Section */}
      <section id="opportunity" className="py-24 bg-gradient-to-br from-pfa-royal-blue/10 to-pfa-navy-blue/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold text-pfa-royal-blue mb-6">
              事业机会
            </h2>
            <p className="text-xl text-pfa-dark-gray max-w-3xl mx-auto">
              加入 PFA 团队，开启您的保险事业新篇章。我们提供完整的培训体系、
              强大的团队支持和广阔的发展空间，助您实现事业梦想。
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 mb-16">
            <div className="space-y-8">
              <div className="bg-white rounded-xl p-6 shadow-lg">
                <div className="flex items-center mb-4">
                  <div className="w-12 h-12 bg-pfa-champagne-gold rounded-lg flex items-center justify-center mr-4">
                    <BookOpen className="h-6 w-6 text-pfa-royal-blue" />
                  </div>
                  <h3 className="text-xl font-semibold text-pfa-royal-blue">完善培训体系</h3>
                </div>
                <p className="text-pfa-dark-gray">
                  从入门基础到高级技能，从产品知识到销售技巧，提供系统化、专业化的培训课程，
                  确保每位伙伴都能快速成长为专业的保险顾问。
                </p>
              </div>

              <div className="bg-white rounded-xl p-6 shadow-lg">
                <div className="flex items-center mb-4">
                  <div className="w-12 h-12 bg-pfa-champagne-gold rounded-lg flex items-center justify-center mr-4">
                    <Users className="h-6 w-6 text-pfa-royal-blue" />
                  </div>
                  <h3 className="text-xl font-semibold text-pfa-royal-blue">强大团队支持</h3>
                </div>
                <p className="text-pfa-dark-gray">
                  资深导师一对一指导，团队资源共享，定期交流分享会。
                  在PFA，您永远不是一个人在奋斗，整个团队都是您的坚强后盾。
                </p>
              </div>

              <div className="bg-white rounded-xl p-6 shadow-lg">
                <div className="flex items-center mb-4">
                  <div className="w-12 h-12 bg-pfa-champagne-gold rounded-lg flex items-center justify-center mr-4">
                    <TrendingUp className="h-6 w-6 text-pfa-royal-blue" />
                  </div>
                  <h3 className="text-xl font-semibold text-pfa-royal-blue">广阔发展前景</h3>
                </div>
                <p className="text-pfa-dark-gray">
                  多元化的职业发展路径，从个人顾问到团队领导，从区域经理到合伙人，
                  为每个人提供适合的成长空间和晋升机会。
                </p>
              </div>
            </div>

            <div className="space-y-6">
              <div className="bg-gradient-to-br from-pfa-royal-blue to-pfa-navy-blue rounded-2xl p-8 text-white">
                <h3 className="text-2xl font-bold mb-6 text-center">为什么选择 PFA？</h3>
                <div className="space-y-4">
                  {[
                    "AI智能教练24/7专业指导",
                    "行业领先的产品组合和服务",
                    "完善的激励机制和福利体系", 
                    "持续的技能提升和职业发展",
                    "温暖的团队文化和工作氛围"
                  ].map((benefit, index) => (
                    <div key={index} className="flex items-center">
                      <CheckCircle className="h-5 w-5 text-pfa-champagne-gold mr-3 flex-shrink-0" />
                      <span className="text-white/90">{benefit}</span>
                    </div>
                  ))}
                </div>
                <div className="mt-8 text-center">
                  <Button 
                    className="bg-pfa-champagne-gold hover:bg-pfa-accent-gold text-pfa-royal-blue font-semibold px-8 py-3"
                    onClick={() => router.push('/chat')}
                  >
                    了解加入详情
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </div>
              </div>

              <div className="bg-white rounded-xl p-6 shadow-lg border-l-4 border-pfa-champagne-gold">
                <Quote className="h-8 w-8 text-pfa-champagne-gold mb-4" />
                <p className="text-pfa-dark-gray italic mb-4">
                  &ldquo;一个人走得快，一群人走得远。在PFA，我们不仅仅是同事，更是相互支撑的伙伴和朋友。&rdquo;
                </p>
                <p className="text-pfa-royal-blue font-semibold">— PFA 核心理念</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Success Stories Section */}
      <section id="success" className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold text-pfa-royal-blue mb-6">
              成功案例
            </h2>
            <p className="text-xl text-pfa-dark-gray max-w-3xl mx-auto">
              真实的成长故事，见证每一位伙伴在PFA平台上的专业蜕变和事业成功
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-16">
            {[
              {
                name: "李经理",
                role: "资深保险顾问",
                story: "从零基础到年度销售冠军，在PFA的专业培训和AI教练指导下，一年内业绩提升300%，成功帮助200多个家庭建立完善的保障规划。",
                achievement: "年度销售冠军"
              },
              {
                name: "王团队长",
                role: "区域团队领导",  
                story: "通过PFA的团队管理培训，从个人顾问成长为优秀的团队领导者，带领30人团队创造了区域业绩第一的佳绩。",
                achievement: "优秀团队领导者"
              },
              {
                name: "张经纪人",
                role: "新人培训导师",
                story: "利用PFA的AI教练系统快速掌握专业技能，半年内通过所有认证考试，现已成为新人培训的资深导师。",
                achievement: "资深培训导师"
              }
            ].map((story, index) => (
              <Card key={index} className="border-0 shadow-lg hover:shadow-xl transition-all duration-300">
                <CardContent className="p-6">
                  <div className="text-center mb-4">
                    <div className="w-16 h-16 bg-gradient-to-br from-pfa-champagne-gold to-pfa-accent-gold rounded-full flex items-center justify-center mx-auto mb-3">
                      <span className="text-pfa-royal-blue font-bold text-lg">{story.name[0]}</span>
                    </div>
                    <h3 className="font-semibold text-pfa-royal-blue">{story.name}</h3>
                    <p className="text-pfa-champagne-gold text-sm">{story.role}</p>
                  </div>
                  <p className="text-pfa-dark-gray text-sm leading-relaxed mb-4">{story.story}</p>
                  <div className="bg-pfa-royal-blue/5 rounded-lg p-3 text-center">
                    <Award className="h-5 w-5 text-pfa-champagne-gold mx-auto mb-1" />
                    <p className="text-pfa-royal-blue font-semibold text-xs">{story.achievement}</p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          <div className="bg-gradient-to-r from-pfa-royal-blue/5 to-pfa-champagne-gold/5 rounded-2xl p-8 text-center">
            <h3 className="text-2xl font-bold text-pfa-royal-blue mb-4">更多成功故事</h3>
            <p className="text-pfa-dark-gray mb-6">
              [真实经纪人成功案例展示区域 - 详细内容待添加]
            </p>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-2xl mx-auto">
              <div className="bg-white rounded-lg p-4 shadow-sm">
                <div className="text-2xl font-bold text-pfa-royal-blue">500+</div>
                <div className="text-pfa-dark-gray text-sm">成功经纪人</div>
              </div>
              <div className="bg-white rounded-lg p-4 shadow-sm">
                <div className="text-2xl font-bold text-pfa-royal-blue">1000+</div>
                <div className="text-pfa-dark-gray text-sm">满意客户</div>
              </div>
              <div className="bg-white rounded-lg p-4 shadow-sm">
                <div className="text-2xl font-bold text-pfa-royal-blue">95%</div>
                <div className="text-pfa-dark-gray text-sm">客户满意度</div>
              </div>
              <div className="bg-white rounded-lg p-4 shadow-sm">
                <div className="text-2xl font-bold text-pfa-royal-blue">98%</div>
                <div className="text-pfa-dark-gray text-sm">续保率</div>
              </div>
            </div>
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
            立即体验PFA智能助手，获得个性化的专业指导，让您的保险事业更上一层楼
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

      {/* Contact & Join Section */}
      <section className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16">
            {/* Join Us */}
            <div className="bg-gradient-to-br from-pfa-royal-blue to-pfa-navy-blue rounded-2xl p-8 text-white">
              <div className="text-center mb-8">
                <h2 className="text-3xl font-bold mb-4">加入 PFA 团队</h2>
                <p className="text-pfa-champagne-gold text-lg">
                  开启您的保险事业新篇章，与我们一起创造更美好的未来
                </p>
              </div>

              <div className="space-y-6">
                <div className="bg-white/10 backdrop-blur-sm rounded-lg p-6">
                  <h3 className="text-xl font-semibold mb-4 text-pfa-champagne-gold">会员计划</h3>
                  <div className="space-y-3">
                    <div className="flex items-center">
                      <CheckCircle className="h-5 w-5 text-pfa-champagne-gold mr-3" />
                      <span className="text-white/90">专业培训认证体系</span>
                    </div>
                    <div className="flex items-center">
                      <CheckCircle className="h-5 w-5 text-pfa-champagne-gold mr-3" />
                      <span className="text-white/90">AI教练一对一指导</span>
                    </div>
                    <div className="flex items-center">
                      <CheckCircle className="h-5 w-5 text-pfa-champagne-gold mr-3" />
                      <span className="text-white/90">团队资源共享平台</span>
                    </div>
                    <div className="flex items-center">
                      <CheckCircle className="h-5 w-5 text-pfa-champagne-gold mr-3" />
                      <span className="text-white/90">丰厚的激励和奖励机制</span>
                    </div>
                  </div>
                  <div className="mt-6 pt-4 border-t border-white/20 text-center">
                    <p className="text-white/80 text-sm">
                      [详细会员计划内容 - 待完善]
                    </p>
                  </div>
                </div>

                <div className="text-center">
                  <Button 
                    className="bg-pfa-champagne-gold hover:bg-pfa-accent-gold text-pfa-royal-blue font-semibold px-8 py-4 text-lg w-full"
                    onClick={() => router.push('/chat')}
                  >
                    立即咨询加入
                    <ArrowRight className="ml-2 h-5 w-5" />
                  </Button>
                </div>
              </div>
            </div>

            {/* Contact Us */}
            <div>
              <div className="text-center mb-8">
                <h2 className="text-3xl font-bold text-pfa-royal-blue mb-4">联系我们</h2>
                <p className="text-pfa-dark-gray text-lg">
                  有任何问题或想要了解更多信息？我们随时为您服务
                </p>
              </div>

              <div className="space-y-6">
                <Card className="border-0 shadow-lg">
                  <CardContent className="p-6">
                    <div className="bg-gradient-to-r from-pfa-royal-blue/5 to-pfa-champagne-gold/5 rounded-lg p-6 text-center">
                      <MessageCircle className="h-12 w-12 text-pfa-champagne-gold mx-auto mb-4" />
                      <h3 className="text-xl font-semibold text-pfa-royal-blue mb-3">AI智能咨询</h3>
                      <p className="text-pfa-dark-gray mb-4">
                        与我们的PFA智能助手对话，获得即时的专业解答和个性化建议
                      </p>
                      <Button 
                        className="bg-pfa-royal-blue hover:bg-pfa-navy-blue text-white px-6 py-2"
                        onClick={() => router.push('/chat')}
                      >
                        开始咨询
                      </Button>
                    </div>
                  </CardContent>
                </Card>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <Card className="border-0 shadow-lg">
                    <CardContent className="p-6 text-center">
                      <div className="w-12 h-12 bg-pfa-champagne-gold rounded-lg flex items-center justify-center mx-auto mb-3">
                        <Users className="h-6 w-6 text-pfa-royal-blue" />
                      </div>
                      <h4 className="font-semibold text-pfa-royal-blue mb-2">团队交流</h4>
                      <p className="text-pfa-dark-gray text-sm">
                        [团队联系方式待添加]
                      </p>
                    </CardContent>
                  </Card>

                  <Card className="border-0 shadow-lg">
                    <CardContent className="p-6 text-center">
                      <div className="w-12 h-12 bg-pfa-champagne-gold rounded-lg flex items-center justify-center mx-auto mb-3">
                        <Globe className="h-6 w-6 text-pfa-royal-blue" />
                      </div>
                      <h4 className="font-semibold text-pfa-royal-blue mb-2">在线支持</h4>
                      <p className="text-pfa-dark-gray text-sm">
                        [在线服务支持待添加]
                      </p>
                    </CardContent>
                  </Card>
                </div>

                <Card className="border-0 shadow-lg border-l-4 border-pfa-champagne-gold">
                  <CardContent className="p-6">
                    <h4 className="font-semibold text-pfa-royal-blue mb-3">联系表单</h4>
                    <div className="space-y-4">
                      <div className="bg-pfa-light-gray rounded-lg p-4 text-center">
                        <p className="text-pfa-dark-gray">
                          [专业在线联系表单 - 待实现]
                        </p>
                        <p className="text-pfa-dark-gray text-sm mt-2">
                          姓名、电话、邮箱、咨询内容等字段
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
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
                <li><a href="#home" className="text-gray-300 hover:text-white transition-colors">首页</a></li>
                <li><a href="#about" className="text-gray-300 hover:text-white transition-colors">关于我们</a></li>
                <li><a href="#concept" className="text-gray-300 hover:text-white transition-colors">核心理念</a></li>
                <li><a href="#opportunity" className="text-gray-300 hover:text-white transition-colors">事业机会</a></li>
                <li><a href="#success" className="text-gray-300 hover:text-white transition-colors">成功案例</a></li>
                <li><button onClick={() => router.push('/chat')} className="text-gray-300 hover:text-white transition-colors text-left">AI 教练</button></li>
              </ul>
            </div>
            
            <div>
              <h4 className="text-lg font-semibold mb-4 text-pfa-champagne-gold">服务支持</h4>
              <div className="space-y-2 text-gray-300">
                <p className="flex items-center">
                  <MessageCircle className="h-4 w-4 mr-2" />
                  AI智能咨询
                </p>
                <p className="flex items-center">
                  <BookOpen className="h-4 w-4 mr-2" />
                  专业培训体系
                </p>
                <p className="flex items-center">
                  <Users className="h-4 w-4 mr-2" />
                  团队协作平台
                </p>
                <p className="text-sm text-gray-400 mt-3 border-t border-pfa-champagne-gold/20 pt-3">
                  [具体联系方式待添加]
                </p>
              </div>
            </div>
          </div>
          
          <div className="border-t border-pfa-champagne-gold/20 mt-8 pt-8 text-center">
            <p className="text-gray-300">
              © 2025 PFA 保险联盟. 保留所有权利.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}