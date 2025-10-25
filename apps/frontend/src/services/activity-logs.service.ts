import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

// Create axios instance with default config
const axiosInstance = axios.create({
  baseURL: API_URL,
});

// Add token to requests
axiosInstance.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export enum ActivityAction {
  // User Actions
  USER_LOGIN = 'user_login',
  USER_LOGOUT = 'user_logout',
  USER_REGISTER = 'user_register',
  USER_UPDATE_PROFILE = 'user_update_profile',
  
  // Research Actions
  RESEARCH_SUBMIT = 'research_submit',
  RESEARCH_UPDATE = 'research_update',
  RESEARCH_DELETE = 'research_delete',
  RESEARCH_ACCEPT = 'research_accept',
  RESEARCH_REJECT = 'research_reject',
  RESEARCH_PUBLISH = 'research_publish',
  
  // Review Actions
  REVIEW_ASSIGN = 'review_assign',
  REVIEW_SUBMIT = 'review_submit',
  REVIEW_UPDATE = 'review_update',
  
  // Admin Actions
  USER_CREATE = 'user_create',
  USER_UPDATE = 'user_update',
  USER_DELETE = 'user_delete',
  USER_STATUS_CHANGE = 'user_status_change',
  
  // Other Actions
  FILE_UPLOAD = 'file_upload',
  FILE_DELETE = 'file_delete',
  SETTINGS_UPDATE = 'settings_update',
}

export interface CreateActivityLogDto {
  user_id?: string;
  research_id?: string;
  action_type: ActivityAction;
  description: string;
  metadata?: Record<string, any>;
}

export interface ActivityLog {
  id: string;
  user_id: string | null;
  research_id: string | null;
  action_type: ActivityAction;
  description: string;
  metadata: Record<string, any> | null;
  created_at: string;
  user?: {
    id: string;
    name: string;
    email: string;
  };
}

class ActivityLogsService {
  /**
   * Create a new activity log
   * إنشاء سجل نشاط جديد
   */
  async create(data: CreateActivityLogDto): Promise<ActivityLog> {
    try {
      const response = await axiosInstance.post('/activity-logs', data);
      return response.data;
    } catch (error) {
      console.error('Error creating activity log:', error);
      throw error;
    }
  }

  /**
   * Log user action
   * تسجيل نشاط المستخدم
   */
  async logUserAction(
    action_type: ActivityAction,
    description: string,
    metadata?: Record<string, any>,
    userId?: string // Optional: للحالات اللي المستخدم مش موجود في localStorage
  ): Promise<void> {
    try {
      // Get user from localStorage or use provided userId
      let user_id = userId;
      
      if (!user_id) {
        const token = localStorage.getItem('token');
        const userStr = localStorage.getItem('user');
        
        if (!token || !userStr) {
          return;
        }

        const user = JSON.parse(userStr);
        user_id = user.id;
      }
      
      const logData = {
        user_id,
        action_type,
        description,
        metadata,
      };
      
      await this.create(logData);
    } catch (error) {
      // Don't throw error to avoid breaking the main flow
      console.error('Failed to log activity:', error);
    }
  }

  /**
   * Get all activity logs with filters
   * الحصول على جميع سجلات النشاط
   */
  async getAll(filters?: {
    user_id?: string;
    research_id?: string;
    action_type?: string;
    limit?: number;
  }): Promise<ActivityLog[]> {
    try {
      const params = new URLSearchParams();
      if (filters?.user_id) params.append('user_id', filters.user_id);
      if (filters?.research_id) params.append('research_id', filters.research_id);
      if (filters?.action_type) params.append('action_type', filters.action_type);
      if (filters?.limit) params.append('limit', filters.limit.toString());

      const response = await axiosInstance.get(`/activity-logs?${params}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching activity logs:', error);
      throw error;
    }
  }

  /**
   * Get activity logs by user
   * الحصول على سجلات نشاط مستخدم معين
   */
  async getByUser(userId: string, limit = 50): Promise<ActivityLog[]> {
    try {
      const response = await axiosInstance.get(`/activity-logs/user/${userId}?limit=${limit}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching user activity logs:', error);
      throw error;
    }
  }

  /**
   * Get activity statistics
   * الحصول على إحصائيات النشاط
   */
  async getStats(): Promise<{ total: number; today: number }> {
    try {
      const response = await axiosInstance.get('/activity-logs/stats');
      return response.data;
    } catch (error) {
      console.error('Error fetching activity stats:', error);
      throw error;
    }
  }
}

export default new ActivityLogsService();
