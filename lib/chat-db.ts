// 聊天数据库操作工具库
import { createClient } from "@/lib/supabase/client";
import { ChatSession, ChatMessage, ChatSessionWithStats, ChatHistoryQuery } from "@/types/chat";

export class ChatDB {
  private supabase = createClient();

  // 获取用户的聊天会话列表
  async getUserSessions(userId: string, limit = 20, offset = 0): Promise<ChatSessionWithStats[]> {
    const { data, error } = await this.supabase
      .from('chat_sessions_with_stats')
      .select('*')
      .eq('user_id', userId)
      .eq('is_archived', false)
      .order('last_message_at', { ascending: false })
      .range(offset, offset + limit - 1);

    if (error) {
      console.error('获取聊天会话失败:', error);
      throw new Error('获取聊天会话失败');
    }

    return data || [];
  }

  // 获取特定会话的消息
  async getSessionMessages(sessionId: string, limit = 50, offset = 0): Promise<ChatMessage[]> {
    const { data, error } = await this.supabase
      .from('chat_messages')
      .select('*')
      .eq('session_id', sessionId)
      .order('created_at', { ascending: true })
      .range(offset, offset + limit - 1);

    if (error) {
      console.error('获取聊天消息失败:', error);
      throw new Error('获取聊天消息失败');
    }

    return data || [];
  }

  // 创建新的聊天会话
  async createSession(
    userId: string, 
    title: string, 
    sessionType: string = 'general'
  ): Promise<ChatSession> {
    const { data, error } = await this.supabase
      .from('chat_sessions')
      .insert({
        user_id: userId,
        title,
        session_type: sessionType,
        metadata: {}
      })
      .select()
      .single();

    if (error) {
      console.error('创建聊天会话失败:', error);
      throw new Error('创建聊天会话失败');
    }

    return data;
  }

  // 更新会话标题
  async updateSessionTitle(sessionId: string, title: string): Promise<void> {
    const { error } = await this.supabase
      .from('chat_sessions')
      .update({ title, updated_at: new Date().toISOString() })
      .eq('id', sessionId);

    if (error) {
      console.error('更新会话标题失败:', error);
      throw new Error('更新会话标题失败');
    }
  }

  // 归档会话（软删除）
  async archiveSession(sessionId: string): Promise<void> {
    const { error } = await this.supabase
      .from('chat_sessions')
      .update({ is_archived: true, updated_at: new Date().toISOString() })
      .eq('id', sessionId);

    if (error) {
      console.error('归档会话失败:', error);
      throw new Error('归档会话失败');
    }
  }

  // 收藏/取消收藏消息
  async toggleMessageFavorite(messageId: string, isFavorited: boolean): Promise<void> {
    const { error } = await this.supabase
      .from('chat_messages')
      .update({ is_favorited: isFavorited })
      .eq('id', messageId);

    if (error) {
      console.error('更新消息收藏状态失败:', error);
      throw new Error('更新消息收藏状态失败');
    }
  }

  // 搜索聊天消息
  async searchMessages(
    userId: string, 
    query: ChatHistoryQuery
  ): Promise<{ messages: ChatMessage[]; total: number }> {
    let queryBuilder = this.supabase
      .from('chat_messages')
      .select('*, chat_sessions!inner(title, session_type)', { count: 'exact' })
      .eq('user_id', userId);

    // 添加搜索条件
    if (query.searchTerm) {
      queryBuilder = queryBuilder.textSearch('content', query.searchTerm);
    }

    if (query.sessionId) {
      queryBuilder = queryBuilder.eq('session_id', query.sessionId);
    }

    if (query.sessionType) {
      queryBuilder = queryBuilder.eq('chat_sessions.session_type', query.sessionType);
    }

    if (query.dateFrom) {
      queryBuilder = queryBuilder.gte('created_at', query.dateFrom);
    }

    if (query.dateTo) {
      queryBuilder = queryBuilder.lte('created_at', query.dateTo);
    }

    // 排序和分页
    queryBuilder = queryBuilder
      .order('created_at', { ascending: false })
      .range(query.offset || 0, (query.offset || 0) + (query.limit || 20) - 1);

    const { data, error, count } = await queryBuilder;

    if (error) {
      console.error('搜索消息失败:', error);
      throw new Error('搜索消息失败');
    }

    return {
      messages: data || [],
      total: count || 0
    };
  }

  // 获取用户统计信息
  async getUserStats(userId: string): Promise<{
    totalSessions: number;
    totalMessages: number;
    favoritedMessages: number;
    thisMonthMessages: number;
  }> {
    const now = new Date();
    const firstDayOfMonth = new Date(now.getFullYear(), now.getMonth(), 1).toISOString();

    const [sessionsResult, messagesResult, favoritesResult, monthlyResult] = await Promise.all([
      // 总会话数
      this.supabase
        .from('chat_sessions')
        .select('id', { count: 'exact', head: true })
        .eq('user_id', userId)
        .eq('is_archived', false),
      
      // 总消息数
      this.supabase
        .from('chat_messages')
        .select('id', { count: 'exact', head: true })
        .eq('user_id', userId),
      
      // 收藏消息数
      this.supabase
        .from('chat_messages')
        .select('id', { count: 'exact', head: true })
        .eq('user_id', userId)
        .eq('is_favorited', true),
      
      // 本月消息数
      this.supabase
        .from('chat_messages')
        .select('id', { count: 'exact', head: true })
        .eq('user_id', userId)
        .gte('created_at', firstDayOfMonth)
    ]);

    return {
      totalSessions: sessionsResult.count || 0,
      totalMessages: messagesResult.count || 0,
      favoritedMessages: favoritesResult.count || 0,
      thisMonthMessages: monthlyResult.count || 0
    };
  }

  // 批量导出聊天记录
  async exportChatData(
    userId: string,
    sessionIds?: string[],
    dateRange?: { from: string; to: string }
  ): Promise<{ sessions: ChatSessionWithStats[]; messages: ChatMessage[] }> {
    let sessionsQuery = this.supabase
      .from('chat_sessions_with_stats')
      .select('*')
      .eq('user_id', userId);

    let messagesQuery = this.supabase
      .from('chat_messages')
      .select('*')
      .eq('user_id', userId);

    // 添加筛选条件
    if (sessionIds && sessionIds.length > 0) {
      sessionsQuery = sessionsQuery.in('id', sessionIds);
      messagesQuery = messagesQuery.in('session_id', sessionIds);
    }

    if (dateRange) {
      sessionsQuery = sessionsQuery
        .gte('created_at', dateRange.from)
        .lte('created_at', dateRange.to);
      messagesQuery = messagesQuery
        .gte('created_at', dateRange.from)
        .lte('created_at', dateRange.to);
    }

    const [sessionsResult, messagesResult] = await Promise.all([
      sessionsQuery.order('created_at', { ascending: false }),
      messagesQuery.order('created_at', { ascending: true })
    ]);

    if (sessionsResult.error) {
      throw new Error('导出会话数据失败');
    }

    if (messagesResult.error) {
      throw new Error('导出消息数据失败');
    }

    return {
      sessions: sessionsResult.data || [],
      messages: messagesResult.data || []
    };
  }
}