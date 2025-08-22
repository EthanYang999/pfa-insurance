'use client'

import { useState, useEffect } from 'react'
import { Button } from "@/components/ui/button"
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { ArrowRight, Bot, Users, TrendingUp, Shield, CheckCircle } from "lucide-react"
import Link from "next/link"
import { HomepageContent } from "@/types/homepage"

export default function HomePage() {
  const [content, setContent] = useState<HomepageContent | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchContent = async () => {
      try {
        const response = await fetch('/api/homepage-content')
        const data = await response.json()
        setContent(data)
      } catch (error) {
        console.error('Error fetching content:', error)
        // 使用默认内容作为后备
        setContent({
          hero_title_line1: '专业保险经纪人的',
          hero_title_line2: '智能成长平台',
          hero_description: 'AI实战教练为您提供24/7 AI教练支持，助力保险经纪人快速成长，实现事业突破。专业培训，智能指导，共创辉煌未来。',
          hero_button_text: '体验AI教练',
          
          ai_coach_title: 'AI教练：您的专属保险导师',
          ai_coach_description: '基于先进AI技术，为每位经纪人提供个性化指导，实时解答疑问，助力业务增长',
          ai_coach_feature1_title: '24/7 智能支持',
          ai_coach_feature1_desc: '随时随地获得专业指导，无论是产品咨询还是销售技巧',
          ai_coach_feature2_title: '个性化学习',
          ai_coach_feature2_desc: '根据您的经验水平和业务需求，定制专属学习路径',
          ai_coach_feature3_title: '团队协作',
          ai_coach_feature3_desc: '与团队成员分享经验，共同成长，建立强大的保险网络',
          
          about_title: '关于 AI实战教练',
          about_description: '我们是一个致力于推动保险行业数字化转型的专业平台。通过创新的AI技术和丰富的行业经验，为保险经纪人提供全方位的成长支持。',
          about_feature1: '专业的保险行业背景',
          about_feature2: '先进的AI技术支持',
          about_feature3: '完善的培训体系',
          about_feature4: '强大的团队文化',
          
          success_cases_title: '成功案例',
          success_cases_description: '见证AI教练如何助力保险经纪人实现突破',
          case1_number: '3个月',
          case1_title: '业绩翻倍',
          case1_desc: '新手经纪人通过AI教练指导快速成长',
          case2_number: '200%',
          case2_title: '效率提升',
          case2_desc: '团队协作效率大幅提升',
          case3_number: '45%',
          case3_title: '转化率',
          case3_desc: '客户转化率突破行业平均',
          
          cta_title: '准备开始您的保险事业新篇章？',
          cta_description: '加入 AI实战教练，与AI教练一起，实现您的职业目标',
          cta_button_text: '联系我们'
        })
      } finally {
        setLoading(false)
      }
    }

    fetchContent()
  }, [])

  if (loading || !content) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-pfa-royal-blue"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Navigation Header */}
      <header className="bg-pfa-royal-blue border-b border-pfa-navy-blue sticky top-0 z-50">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <Shield className="h-8 w-8 text-pfa-champagne-gold" />
                <span className="font-serif font-bold text-xl text-white">AI实战教练</span>
              </div>
            </div>
            <nav className="hidden md:flex items-center space-x-8">
              <a href="#ai-coach" className="text-white/80 hover:text-white transition-colors">
                AI教练
              </a>
              <a href="#about" className="text-white/80 hover:text-white transition-colors">
                关于我们
              </a>
              <a href="#success-cases" className="text-white/80 hover:text-white transition-colors">
                成功案例
              </a>
              <a href="#join" className="text-white/80 hover:text-white transition-colors">
                加入我们
              </a>
            </nav>
            <div className="flex items-center space-x-4">
              <Button size="sm" className="bg-pfa-champagne-gold hover:bg-pfa-accent-gold text-pfa-royal-blue" asChild>
                <Link href="/auth/login">
                  登录
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative py-24 lg:py-40 xl:py-48 overflow-hidden bg-white">
        <div className="absolute inset-0 bg-gradient-to-br from-pfa-royal-blue/8 to-pfa-navy-blue/10"></div>
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative">
          <div className="max-w-4xl mx-auto text-center">
            <h1 className="font-serif font-bold text-4xl md:text-6xl lg:text-7xl text-pfa-royal-blue mb-6 leading-tight">
              {content.hero_title_line1}
              <span className="text-pfa-champagne-gold block">{content.hero_title_line2}</span>
            </h1>
            <p className="text-xl text-pfa-royal-blue/70 mb-8 max-w-2xl mx-auto leading-relaxed">
              {content.hero_description}
            </p>
            <div className="flex justify-center">
              <Button size="lg" className="bg-pfa-champagne-gold hover:bg-pfa-accent-gold text-pfa-royal-blue text-lg px-8 py-4" asChild>
                <Link href="/ai-coach">
                  <Bot className="mr-2 h-5 w-5" />
                  {content.hero_button_text}
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* AI Coach Feature Section */}
      <section id="ai-coach" className="py-24 lg:py-40 xl:py-48 bg-pfa-light-gray">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl mx-auto text-center mb-16">
            <h2 className="font-serif font-bold text-3xl md:text-4xl text-pfa-royal-blue mb-6">{content.ai_coach_title}</h2>
            <p className="text-lg text-pfa-royal-blue/70 leading-relaxed">
              {content.ai_coach_description}
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            <Card className="border-pfa-champagne-gold/20 hover:shadow-lg transition-shadow bg-white">
              <CardHeader>
                <Bot className="h-12 w-12 text-pfa-champagne-gold mb-4" />
                <CardTitle className="font-serif text-pfa-royal-blue">{content.ai_coach_feature1_title}</CardTitle>
                <CardDescription className="text-pfa-royal-blue/60">{content.ai_coach_feature1_desc}</CardDescription>
              </CardHeader>
            </Card>

            <Card className="border-pfa-champagne-gold/20 hover:shadow-lg transition-shadow bg-white">
              <CardHeader>
                <TrendingUp className="h-12 w-12 text-pfa-champagne-gold mb-4" />
                <CardTitle className="font-serif text-pfa-royal-blue">{content.ai_coach_feature2_title}</CardTitle>
                <CardDescription className="text-pfa-royal-blue/60">{content.ai_coach_feature2_desc}</CardDescription>
              </CardHeader>
            </Card>

            <Card className="border-pfa-champagne-gold/20 hover:shadow-lg transition-shadow bg-white">
              <CardHeader>
                <Users className="h-12 w-12 text-pfa-champagne-gold mb-4" />
                <CardTitle className="font-serif text-pfa-royal-blue">{content.ai_coach_feature3_title}</CardTitle>
                <CardDescription className="text-pfa-royal-blue/60">{content.ai_coach_feature3_desc}</CardDescription>
              </CardHeader>
            </Card>
          </div>
        </div>
      </section>

      {/* About Section */}
      <section id="about" className="py-24 lg:py-40 xl:py-48">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <div>
              <h2 className="font-serif font-bold text-3xl md:text-4xl text-pfa-royal-blue mb-6">{content.about_title}</h2>
              <p className="text-lg text-pfa-royal-blue/70 mb-6 leading-relaxed">
                {content.about_description}
              </p>
            </div>
            <div className="space-y-4">
              <div className="flex items-center space-x-3">
                <CheckCircle className="h-5 w-5 text-pfa-champagne-gold flex-shrink-0" />
                <span className="text-pfa-royal-blue">{content.about_feature1}</span>
              </div>
              <div className="flex items-center space-x-3">
                <CheckCircle className="h-5 w-5 text-pfa-champagne-gold flex-shrink-0" />
                <span className="text-pfa-royal-blue">{content.about_feature2}</span>
              </div>
              <div className="flex items-center space-x-3">
                <CheckCircle className="h-5 w-5 text-pfa-champagne-gold flex-shrink-0" />
                <span className="text-pfa-royal-blue">{content.about_feature3}</span>
              </div>
              <div className="flex items-center space-x-3">
                <CheckCircle className="h-5 w-5 text-pfa-champagne-gold flex-shrink-0" />
                <span className="text-pfa-royal-blue">{content.about_feature4}</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Success Cases Preview */}
      <section id="success-cases" className="py-24 lg:py-40 xl:py-48 bg-pfa-light-gray">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="font-serif font-bold text-3xl md:text-4xl text-pfa-royal-blue mb-4">{content.success_cases_title}</h2>
            <p className="text-lg text-pfa-royal-blue/70">{content.success_cases_description}</p>
          </div>
          <div className="grid md:grid-cols-3 gap-6 mb-8">
            <Card className="border-pfa-champagne-gold/20 hover:shadow-lg transition-shadow bg-white">
              <CardHeader className="text-center">
                <div className="text-3xl font-bold text-pfa-champagne-gold mb-2">{content.case1_number}</div>
                <CardTitle className="font-serif text-pfa-royal-blue">{content.case1_title}</CardTitle>
                <CardDescription className="text-pfa-royal-blue/60">{content.case1_desc}</CardDescription>
              </CardHeader>
            </Card>
            <Card className="border-pfa-champagne-gold/20 hover:shadow-lg transition-shadow bg-white">
              <CardHeader className="text-center">
                <div className="text-3xl font-bold text-pfa-champagne-gold mb-2">{content.case2_number}</div>
                <CardTitle className="font-serif text-pfa-royal-blue">{content.case2_title}</CardTitle>
                <CardDescription className="text-pfa-royal-blue/60">{content.case2_desc}</CardDescription>
              </CardHeader>
            </Card>
            <Card className="border-pfa-champagne-gold/20 hover:shadow-lg transition-shadow bg-white">
              <CardHeader className="text-center">
                <div className="text-3xl font-bold text-pfa-champagne-gold mb-2">{content.case3_number}</div>
                <CardTitle className="font-serif text-pfa-royal-blue">{content.case3_title}</CardTitle>
                <CardDescription className="text-pfa-royal-blue/60">{content.case3_desc}</CardDescription>
              </CardHeader>
            </Card>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section id="join" className="py-24 lg:py-40 xl:py-48 bg-white">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="font-serif font-bold text-3xl md:text-4xl mb-6 text-pfa-royal-blue">{content.cta_title}</h2>
          <p className="text-xl mb-8 text-pfa-royal-blue/70 max-w-2xl mx-auto">
            {content.cta_description}
          </p>
          <div className="flex justify-center">
            <Button
              size="lg"
              className="bg-pfa-champagne-gold text-pfa-royal-blue hover:bg-pfa-accent-gold text-lg px-8 py-4"
            >
              {content.cta_button_text}
            </Button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-pfa-royal-blue border-t border-pfa-navy-blue py-12">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="border-t border-pfa-champagne-gold/30 pt-8 text-center text-white/70">
            <p>&copy; 2025 AI实战教练. 保留所有权利.</p>
          </div>
        </div>
      </footer>
    </div>
  )
}