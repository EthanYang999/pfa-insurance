# AI教练雪莉 - PFA保险培训助手

> PFA保险经纪人的AI智能培训助手，提供7x24小时产品知识和话术辅导

## 🎯 项目概述

AI教练雪莉是一个基于Next.js和Supabase构建的智能保险培训系统，为PFA保险经纪人提供专业的AI辅导服务。系统采用商务专业科技风设计，支持实时聊天对话，并预留了UE5数字人集成接口。

## 🏗️ 技术架构

### 前端技术栈
- **框架**: Next.js 15 (App Router) + React 19 + TypeScript
- **样式**: Tailwind CSS + CSS Variables + Tailwindcss-animate
- **UI组件**: Radix UI + Shadcn/UI 组件系统
- **图标**: Lucide React
- **主题**: next-themes (支持暗色模式)

### 后端服务
- **认证**: Supabase Authentication (SSR支持)
- **数据库**: Supabase PostgreSQL
- **AI工作流**: n8n webhook (预留集成)
- **数字人**: UE5 + MetaHuman (预留集成)

## 🎨 设计规范

### 色彩系统
- **主色调**: 深蓝色 (#1E3A8A) - 传达稳定可靠
- **辅助色**: 中蓝色 (#3B82F6) - 交互元素
- **金色强调**: 金黄色 (#F59E0B) - 重要按钮和强调
- **中性色**: 灰色系统 - 文字和背景

### 字体规范
- **中文字体**: PingFang SC, Microsoft YaHei
- **英文字体**: Geist (备用字体)
- **标题**: 20px-28px, font-weight: 500-600
- **正文**: 14px-16px, line-height: 1.5-1.6

## 📱 响应式布局

### 断点设置
- **Mobile**: < 768px - 单列布局，数字人区域折叠
- **Tablet**: 768px - 1024px - 30%-70% 分栏布局
- **Desktop**: > 1024px - 40%-60% 分栏布局

### 布局特性
- 左侧：数字人展示区域（UE5集成预留）
- 右侧：聊天对话区域
- 移动端：数字人区域可折叠为顶部横条

## 🚀 快速开始

### 环境要求
- Node.js 18.17+ 
- npm 或 yarn 或 pnpm

### 安装依赖
```bash
npm install
# 或
yarn install
# 或
pnpm install
```

### 环境配置
1. 复制 `.env.example` 为 `.env.local`
2. 配置 Supabase 相关环境变量：
   ```env
   NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
   N8N_WEBHOOK_URL=your_n8n_webhook_url (可选)
   ```

### 运行开发服务器
```bash
npm run dev
# 或
yarn dev
# 或
pnpm dev
```

访问 [http://localhost:3000](http://localhost:3000) 查看结果

## 📋 功能特性

### ✅ 已实现功能
- [x] 用户认证系统（Supabase Auth）
- [x] 商务专业风格登录页面
- [x] 响应式聊天界面
- [x] 实时消息对话
- [x] n8n webhook集成
- [x] 数字人展示区域预留
- [x] 语音功能入口预留
- [x] 移动端适配
- [x] 自定义设计系统

### 🔄 开发中功能
- [ ] UE5数字人集成
- [ ] 语音对话功能
- [ ] 消息历史存储
- [ ] 用户等级系统
- [ ] 对话历史导出

## 🗂️ 项目结构

```
pfa-insurance/
├── app/                          # Next.js App Router
│   ├── api/chat/                # 聊天API路由
│   ├── auth/                    # 认证相关页面
│   ├── protected/               # 受保护的页面
│   ├── globals.css              # 全局样式
│   └── layout.tsx               # 根布局
├── components/                   # React组件
│   ├── ui/                      # 基础UI组件
│   ├── chat-interface.tsx       # 聊天主界面
│   ├── chat-message.tsx         # 聊天消息组件
│   ├── chat-input.tsx           # 聊天输入组件
│   ├── digital-human.tsx        # 数字人展示组件
│   └── login-form.tsx           # 登录表单
├── lib/                         # 工具库
│   ├── supabase/               # Supabase客户端
│   └── utils.ts                # 工具函数
├── PRD.md                       # 产品需求文档
├── DESIGN_SPEC.md              # 设计规范文档
└── CLAUDE.md                   # 项目说明文档
```

## 🔧 核心组件说明

### ChatInterface
聊天主界面组件，管理整个对话流程
- 响应式布局控制
- 消息状态管理
- API调用处理

### ChatMessage & TypingIndicator
消息显示组件，支持用户和AI消息区分
- 消息气泡样式
- 时间戳显示
- 打字指示器动画

### DigitalHuman
数字人展示组件，预留UE5集成接口
- iframe/canvas容器预留
- 状态指示器
- 移动端折叠功能

### ChatInput
聊天输入组件，支持多种输入方式
- 文本输入和自动调整
- Enter键快速发送
- 语音功能入口预留

## 🌐 API接口

### POST /api/chat
聊天消息处理接口
```typescript
// 请求
{
  "message": "用户消息内容",
  "userId": "用户ID"
}

// 响应  
{
  "response": "AI回复内容",
  "timestamp": "2025-01-01T00:00:00.000Z"
}
```

## 🔗 集成说明

### Supabase认证
- 支持邮箱密码登录
- 自动会话管理
- 受保护路由控制

### n8n Webhook（已集成）
- **默认地址**: `https://n8n.aifunbox.com/webhook/insurance`
- **环境变量**: 可通过 `N8N_WEBHOOK_URL` 自定义webhook地址
- **请求格式**: 
  ```json
  {
    "message": "用户消息内容",
    "userId": "用户ID",
    "timestamp": "ISO时间戳"
  }
  ```
- **响应处理**: 支持多种响应格式（response, message, output, text等）

### UE5数字人（预留）
在 `DigitalHuman` 组件中已预留 `#ue5-digital-human-container` 容器，支持iframe或canvas集成

## 🎯 部署指南

### Vercel部署（推荐）
1. Fork 此仓库
2. 在 Vercel 中导入项目
3. 配置环境变量
4. 自动部署完成

### 其他平台
支持部署到任何支持 Next.js 的平台：
- Netlify
- Railway
- DigitalOcean App Platform

## 🤝 开发贡献

### 代码规范
- 使用 TypeScript 进行类型检查
- 遵循 ESLint 规则
- 使用 Prettier 格式化代码

### 提交规范
- feat: 新功能
- fix: 修复问题
- docs: 文档更新
- style: 样式调整
- refactor: 代码重构

## 📞 技术支持

如有技术问题，请提交 Issue 或联系开发团队。

## 📄 许可证

© 2025 PFA保险公司. 保留所有权利.

---

**AI教练雪莉** - 让保险培训更智能，让专业成长更高效！ 🚀
