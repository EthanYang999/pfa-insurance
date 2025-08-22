'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Save, RefreshCw } from 'lucide-react'
import { HomepageContent } from '@/types/homepage'

export default function HomepageAdminPage() {
  const [content, setContent] = useState<HomepageContent>({} as HomepageContent)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    fetchContent()
  }, [])

  const fetchContent = async () => {
    try {
      const response = await fetch('/api/homepage-content')
      const data = await response.json()
      setContent(data)
    } catch (error) {
      console.error('Error fetching content:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSave = async () => {
    setSaving(true)
    try {
      const response = await fetch('/api/homepage-content', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(content)
      })

      if (response.ok) {
        alert('内容保存成功！')
      } else {
        alert('保存失败，请重试')
      }
    } catch (error) {
      console.error('Error saving content:', error)
      alert('保存失败，请重试')
    } finally {
      setSaving(false)
    }
  }

  const updateContent = (field: keyof HomepageContent, value: string) => {
    setContent(prev => ({
      ...prev,
      [field]: value
    }))
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <RefreshCw className="h-8 w-8 animate-spin" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">首页内容管理</h1>
          <p className="text-gray-600 mt-2">修改首页展示的文字内容</p>
        </div>

        <div className="mb-6">
          <Button 
            onClick={handleSave} 
            disabled={saving}
            className="bg-blue-600 hover:bg-blue-700"
          >
            {saving ? (
              <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <Save className="mr-2 h-4 w-4" />
            )}
            {saving ? '保存中...' : '保存所有更改'}
          </Button>
        </div>

        <Tabs defaultValue="hero" className="space-y-6">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="hero">首页横幅</TabsTrigger>
            <TabsTrigger value="ai-coach">AI教练</TabsTrigger>
            <TabsTrigger value="about">关于我们</TabsTrigger>
            <TabsTrigger value="cases">成功案例</TabsTrigger>
            <TabsTrigger value="cta">行动号召</TabsTrigger>
          </TabsList>

          {/* 首页横幅部分 */}
          <TabsContent value="hero">
            <Card>
              <CardHeader>
                <CardTitle>首页横幅区域</CardTitle>
                <CardDescription>页面顶部的主要标题和描述</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="hero_title_line1">主标题第一行</Label>
                  <Input
                    id="hero_title_line1"
                    value={content.hero_title_line1 || ''}
                    onChange={(e) => updateContent('hero_title_line1', e.target.value)}
                    placeholder="专业保险经纪人的"
                  />
                </div>
                <div>
                  <Label htmlFor="hero_title_line2">主标题第二行</Label>
                  <Input
                    id="hero_title_line2"
                    value={content.hero_title_line2 || ''}
                    onChange={(e) => updateContent('hero_title_line2', e.target.value)}
                    placeholder="智能成长平台"
                  />
                </div>
                <div>
                  <Label htmlFor="hero_description">描述文字</Label>
                  <Textarea
                    id="hero_description"
                    value={content.hero_description || ''}
                    onChange={(e) => updateContent('hero_description', e.target.value)}
                    placeholder="AI实战教练为您提供24/7 AI教练支持..."
                    rows={3}
                  />
                </div>
                <div>
                  <Label htmlFor="hero_button_text">按钮文字</Label>
                  <Input
                    id="hero_button_text"
                    value={content.hero_button_text || ''}
                    onChange={(e) => updateContent('hero_button_text', e.target.value)}
                    placeholder="体验AI教练"
                  />
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* AI教练部分 */}
          <TabsContent value="ai-coach">
            <Card>
              <CardHeader>
                <CardTitle>AI教练区域</CardTitle>
                <CardDescription>AI教练功能介绍部分</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="ai_coach_title">标题</Label>
                  <Input
                    id="ai_coach_title"
                    value={content.ai_coach_title || ''}
                    onChange={(e) => updateContent('ai_coach_title', e.target.value)}
                    placeholder="AI教练：您的专属保险导师"
                  />
                </div>
                <div>
                  <Label htmlFor="ai_coach_description">描述</Label>
                  <Textarea
                    id="ai_coach_description"
                    value={content.ai_coach_description || ''}
                    onChange={(e) => updateContent('ai_coach_description', e.target.value)}
                    placeholder="基于先进AI技术，为每位经纪人提供个性化指导..."
                    rows={2}
                  />
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <h4 className="font-semibold">特性1</h4>
                    <Input
                      value={content.ai_coach_feature1_title || ''}
                      onChange={(e) => updateContent('ai_coach_feature1_title', e.target.value)}
                      placeholder="24/7 智能支持"
                    />
                    <Textarea
                      value={content.ai_coach_feature1_desc || ''}
                      onChange={(e) => updateContent('ai_coach_feature1_desc', e.target.value)}
                      placeholder="随时随地获得专业指导..."
                      rows={2}
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <h4 className="font-semibold">特性2</h4>
                    <Input
                      value={content.ai_coach_feature2_title || ''}
                      onChange={(e) => updateContent('ai_coach_feature2_title', e.target.value)}
                      placeholder="个性化学习"
                    />
                    <Textarea
                      value={content.ai_coach_feature2_desc || ''}
                      onChange={(e) => updateContent('ai_coach_feature2_desc', e.target.value)}
                      placeholder="根据您的经验水平..."
                      rows={2}
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <h4 className="font-semibold">特性3</h4>
                    <Input
                      value={content.ai_coach_feature3_title || ''}
                      onChange={(e) => updateContent('ai_coach_feature3_title', e.target.value)}
                      placeholder="团队协作"
                    />
                    <Textarea
                      value={content.ai_coach_feature3_desc || ''}
                      onChange={(e) => updateContent('ai_coach_feature3_desc', e.target.value)}
                      placeholder="与团队成员分享经验..."
                      rows={2}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* 关于我们部分 */}
          <TabsContent value="about">
            <Card>
              <CardHeader>
                <CardTitle>关于我们区域</CardTitle>
                <CardDescription>公司介绍和特点</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="about_title">标题</Label>
                  <Input
                    id="about_title"
                    value={content.about_title || ''}
                    onChange={(e) => updateContent('about_title', e.target.value)}
                    placeholder="关于 AI实战教练"
                  />
                </div>
                <div>
                  <Label htmlFor="about_description">描述</Label>
                  <Textarea
                    id="about_description"
                    value={content.about_description || ''}
                    onChange={(e) => updateContent('about_description', e.target.value)}
                    placeholder="我们是一个致力于推动保险行业数字化转型的专业平台..."
                    rows={3}
                  />
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="about_feature1">特点1</Label>
                    <Input
                      id="about_feature1"
                      value={content.about_feature1 || ''}
                      onChange={(e) => updateContent('about_feature1', e.target.value)}
                      placeholder="专业的保险行业背景"
                    />
                  </div>
                  <div>
                    <Label htmlFor="about_feature2">特点2</Label>
                    <Input
                      id="about_feature2"
                      value={content.about_feature2 || ''}
                      onChange={(e) => updateContent('about_feature2', e.target.value)}
                      placeholder="先进的AI技术支持"
                    />
                  </div>
                  <div>
                    <Label htmlFor="about_feature3">特点3</Label>
                    <Input
                      id="about_feature3"
                      value={content.about_feature3 || ''}
                      onChange={(e) => updateContent('about_feature3', e.target.value)}
                      placeholder="完善的培训体系"
                    />
                  </div>
                  <div>
                    <Label htmlFor="about_feature4">特点4</Label>
                    <Input
                      id="about_feature4"
                      value={content.about_feature4 || ''}
                      onChange={(e) => updateContent('about_feature4', e.target.value)}
                      placeholder="强大的团队文化"
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* 成功案例部分 */}
          <TabsContent value="cases">
            <Card>
              <CardHeader>
                <CardTitle>成功案例区域</CardTitle>
                <CardDescription>展示成果数据</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="success_cases_title">标题</Label>
                  <Input
                    id="success_cases_title"
                    value={content.success_cases_title || ''}
                    onChange={(e) => updateContent('success_cases_title', e.target.value)}
                    placeholder="成功案例"
                  />
                </div>
                <div>
                  <Label htmlFor="success_cases_description">描述</Label>
                  <Input
                    id="success_cases_description"
                    value={content.success_cases_description || ''}
                    onChange={(e) => updateContent('success_cases_description', e.target.value)}
                    placeholder="见证AI教练如何助力保险经纪人实现突破"
                  />
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <h4 className="font-semibold">案例1</h4>
                    <Input
                      value={content.case1_number || ''}
                      onChange={(e) => updateContent('case1_number', e.target.value)}
                      placeholder="3个月"
                    />
                    <Input
                      value={content.case1_title || ''}
                      onChange={(e) => updateContent('case1_title', e.target.value)}
                      placeholder="业绩翻倍"
                    />
                    <Input
                      value={content.case1_desc || ''}
                      onChange={(e) => updateContent('case1_desc', e.target.value)}
                      placeholder="新手经纪人通过AI教练指导快速成长"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <h4 className="font-semibold">案例2</h4>
                    <Input
                      value={content.case2_number || ''}
                      onChange={(e) => updateContent('case2_number', e.target.value)}
                      placeholder="200%"
                    />
                    <Input
                      value={content.case2_title || ''}
                      onChange={(e) => updateContent('case2_title', e.target.value)}
                      placeholder="效率提升"
                    />
                    <Input
                      value={content.case2_desc || ''}
                      onChange={(e) => updateContent('case2_desc', e.target.value)}
                      placeholder="团队协作效率大幅提升"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <h4 className="font-semibold">案例3</h4>
                    <Input
                      value={content.case3_number || ''}
                      onChange={(e) => updateContent('case3_number', e.target.value)}
                      placeholder="45%"
                    />
                    <Input
                      value={content.case3_title || ''}
                      onChange={(e) => updateContent('case3_title', e.target.value)}
                      placeholder="转化率"
                    />
                    <Input
                      value={content.case3_desc || ''}
                      onChange={(e) => updateContent('case3_desc', e.target.value)}
                      placeholder="客户转化率突破行业平均"
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* 行动号召部分 */}
          <TabsContent value="cta">
            <Card>
              <CardHeader>
                <CardTitle>行动号召区域</CardTitle>
                <CardDescription>页面底部的号召行动部分</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="cta_title">标题</Label>
                  <Input
                    id="cta_title"
                    value={content.cta_title || ''}
                    onChange={(e) => updateContent('cta_title', e.target.value)}
                    placeholder="准备开始您的保险事业新篇章？"
                  />
                </div>
                <div>
                  <Label htmlFor="cta_description">描述</Label>
                  <Input
                    id="cta_description"
                    value={content.cta_description || ''}
                    onChange={(e) => updateContent('cta_description', e.target.value)}
                    placeholder="加入 AI实战教练，与AI教练一起，实现您的职业目标"
                  />
                </div>
                <div>
                  <Label htmlFor="cta_button_text">按钮文字</Label>
                  <Input
                    id="cta_button_text"
                    value={content.cta_button_text || ''}
                    onChange={(e) => updateContent('cta_button_text', e.target.value)}
                    placeholder="联系我们"
                  />
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}