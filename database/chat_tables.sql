-- PFA聊天记录管理数据库表结构（修复版）
-- 在Supabase SQL Editor中执行此脚本

-- 1. 聊天会话表
CREATE TABLE IF NOT EXISTS chat_sessions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  title VARCHAR(255) DEFAULT '新对话', -- 会话标题
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  is_archived BOOLEAN DEFAULT FALSE,
  session_type VARCHAR(50) DEFAULT 'general', -- 对话类型：general, product, sales, service
  message_count INTEGER DEFAULT 0, -- 消息数量
  metadata JSONB DEFAULT '{}' -- 额外元数据
);

-- 2. 聊天消息表
CREATE TABLE IF NOT EXISTS chat_messages (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  session_id UUID REFERENCES chat_sessions(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  message_type VARCHAR(20) NOT NULL CHECK (message_type IN ('user', 'assistant')),
  content TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  is_favorited BOOLEAN DEFAULT FALSE, -- 是否收藏
  tags TEXT[] DEFAULT '{}', -- 标签数组
  n8n_response_time INTEGER, -- n8n响应时间（毫秒）
  metadata JSONB DEFAULT '{}' -- 存储额外信息
);

-- 3. 创建索引优化查询性能
CREATE INDEX IF NOT EXISTS idx_chat_sessions_user_id ON chat_sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_chat_sessions_created_at ON chat_sessions(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_chat_sessions_updated_at ON chat_sessions(updated_at DESC);

CREATE INDEX IF NOT EXISTS idx_chat_messages_session_id ON chat_messages(session_id);
CREATE INDEX IF NOT EXISTS idx_chat_messages_user_id ON chat_messages(user_id);
CREATE INDEX IF NOT EXISTS idx_chat_messages_created_at ON chat_messages(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_chat_messages_type ON chat_messages(message_type);

-- 4. 创建全文搜索索引（支持中英文搜索）
CREATE INDEX IF NOT EXISTS idx_chat_messages_content_search 
ON chat_messages USING gin(to_tsvector('simple', content));
-- PFA聊天记录管理数据库表结构（修复版）
-- 在Supabase SQL Editor中执行此脚本

-- 1. 聊天会话表
CREATE TABLE IF NOT EXISTS chat_sessions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  title VARCHAR(255) DEFAULT '新对话', -- 会话标题
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  is_archived BOOLEAN DEFAULT FALSE,
  session_type VARCHAR(50) DEFAULT 'general', -- 对话类型：general, product, sales, service
  message_count INTEGER DEFAULT 0, -- 消息数量
  metadata JSONB DEFAULT '{}' -- 额外元数据
);

-- 2. 聊天消息表
CREATE TABLE IF NOT EXISTS chat_messages (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  session_id UUID REFERENCES chat_sessions(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  message_type VARCHAR(20) NOT NULL CHECK (message_type IN ('user', 'assistant')),
  content TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  is_favorited BOOLEAN DEFAULT FALSE, -- 是否收藏
  tags TEXT[] DEFAULT '{}', -- 标签数组
  n8n_response_time INTEGER, -- n8n响应时间（毫秒）
  metadata JSONB DEFAULT '{}' -- 存储额外信息
);

-- 3. 创建索引优化查询性能
CREATE INDEX IF NOT EXISTS idx_chat_sessions_user_id ON chat_sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_chat_sessions_created_at ON chat_sessions(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_chat_sessions_updated_at ON chat_sessions(updated_at DESC);

CREATE INDEX IF NOT EXISTS idx_chat_messages_session_id ON chat_messages(session_id);
CREATE INDEX IF NOT EXISTS idx_chat_messages_user_id ON chat_messages(user_id);
CREATE INDEX IF NOT EXISTS idx_chat_messages_created_at ON chat_messages(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_chat_messages_type ON chat_messages(message_type);

-- 4. 创建全文搜索索引（支持中英文搜索）
CREATE INDEX IF NOT EXISTS idx_chat_messages_content_search 
ON chat_messages USING gin(to_tsvector('simple', content));