// 后台管理系统类型定义

export interface AdminUser {
  id: string;
  user_id: string;
  role: 'super_admin' | 'admin' | 'monitor';
  permissions: Record<string, boolean>;
  created_at: string;
  updated_at: string;
  is_active: boolean;
  last_login_at?: string;
  created_by?: string;
  user?: {
    email: string;
    created_at: string;
    last_sign_in_at?: string;
  };
}

export interface SystemLog {
  id: string;
  admin_id: string;
  action: string;
  target_type?: string;
  target_id?: string;
  details: Record<string, unknown>;
  ip_address?: string;
  user_agent?: string;
  created_at: string;
  admin?: {
    user?: {
      email: string;
    };
  };
}

export interface SystemConfig {
  key: string;
  value: unknown;
  description?: string;
  updated_by?: string;
  updated_at: string;
}

export interface ServiceHealth {
  id: string;
  service_name: string;
  status: 'healthy' | 'warning' | 'error' | 'unknown';
  response_time?: number;
  error_message?: string;
  metadata: Record<string, unknown>;
  checked_at: string;
}

export interface UserActivityStats {
  id: string;
  user_id: string;
  date: string;
  login_count: number;
  chat_sessions_count: number;
  messages_count: number;
  total_chat_time: number;
  created_at: string;
}

export interface ApiCallStats {
  id: string;
  endpoint: string;
  method: string;
  status_code: number;
  response_time?: number;
  user_id?: string;
  error_message?: string;
  created_at: string;
}

export interface AdminDashboardStats {
  total_users: number;
  new_users_today: number;
  new_sessions_today: number;
  new_messages_today: number;
  active_sessions: number;
  avg_n8n_response_time?: number;
}

export interface UserInfo {
  id: string;
  email: string;
  created_at: string;
  updated_at: string;
  last_sign_in_at?: string;
  email_confirmed_at?: string;
  banned_until?: string;
  // 扩展信息
  session_count?: number;
  message_count?: number;
  last_activity?: string;
}

export interface AdminQuery {
  page?: number;
  limit?: number;
  search?: string;
  role?: string;
  status?: string; 
  dateFrom?: string;
  dateTo?: string;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export interface N8nHealthStatus {
  status: 'healthy' | 'warning' | 'error' | 'unknown';
  response_time?: number;
  last_check: string;
  workflows?: {
    id: string;
    name: string;
    active: boolean;
    status: 'running' | 'error' | 'waiting';
  }[];
  error_message?: string;
}

export interface SystemMetrics {
  cpu_usage?: number;
  memory_usage?: number;
  disk_usage?: number;
  api_calls_per_minute?: number;
  error_rate?: number;
  uptime?: number;
}

export type AdminAction = 
  | 'login'
  | 'logout'
  | 'create_user'
  | 'update_user'
  | 'delete_user'
  | 'ban_user'
  | 'unban_user'
  | 'reset_password'
  | 'view_user_data'
  | 'export_data'
  | 'update_config'
  | 'view_logs'
  | 'view_dashboard'
  | 'system_maintenance'
  | 'delete_session'
  | 'archive_session'
  | 'unarchive_session'
  | 'view_system_health';

export interface AdminPermissions {
  user_management: boolean;
  system_config: boolean;
  data_export: boolean;
  log_access: boolean;
  service_monitoring: boolean;
  user_data_access: boolean;
}