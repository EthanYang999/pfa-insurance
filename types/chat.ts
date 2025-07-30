// 聊天相关的TypeScript类型定义

export interface ChatSession {
  id: string;
  user_id: string;
  title: string;
  created_at: string;
  updated_at: string;
  is_archived: boolean;
  session_type: 'general' | 'product' | 'sales' | 'service';
  message_count: number;
  metadata: Record<string, unknown>;
}

export interface ChatMessage {
  id: string;
  session_id: string;
  user_id: string;
  message_type: 'user' | 'assistant';
  content: string;
  created_at: string;
  is_favorited: boolean;
  tags: string[];
  n8n_response_time?: number;
  metadata: Record<string, unknown>;
}

export interface ChatSessionWithStats extends ChatSession {
  last_message_at: string;
  last_message_preview: string;
}

export interface ChatRequest {
  message: string;
  sessionId?: string;
  sessionType?: 'general' | 'product' | 'sales' | 'service';
}

export interface ChatResponse {
  success: boolean;
  response: string;
  sessionId: string;
  responseTime: number;
  metadata: {
    messagesSaved: boolean;
    n8nError?: string;
  };
}

export interface ChatError {
  error: string;
  details?: string;
}

// 聊天历史查询参数
export interface ChatHistoryQuery {
  limit?: number;
  offset?: number;
  sessionId?: string;
  searchTerm?: string;
  sessionType?: string;
  dateFrom?: string;
  dateTo?: string;
}

// 导出格式选项
export type ExportFormat = 'json' | 'csv' | 'pdf';

export interface ExportOptions {
  format: ExportFormat;
  sessionIds?: string[];
  dateRange?: {
    from: string;
    to: string;
  };
  includeMetadata?: boolean;
}