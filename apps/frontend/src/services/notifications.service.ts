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

export enum NotificationType {
  // Research Notifications
  RESEARCH_SUBMITTED = 'research_submitted',
  RESEARCH_ACCEPTED = 'research_accepted',
  RESEARCH_REJECTED = 'research_rejected',
  RESEARCH_PUBLISHED = 'research_published',
  RESEARCH_REVISION_REQUIRED = 'research_revision_required',
  
  // Review Notifications
  REVIEW_ASSIGNED = 'review_assigned',
  REVIEW_SUBMITTED = 'review_submitted',
  REVIEW_REMINDER = 'review_reminder',
  
  // User Notifications
  ACCOUNT_CREATED = 'account_created',
  ACCOUNT_APPROVED = 'account_approved',
  ACCOUNT_SUSPENDED = 'account_suspended',
  PASSWORD_CHANGED = 'password_changed',
  
  // System Notifications
  SYSTEM_ANNOUNCEMENT = 'system_announcement',
  SYSTEM_MAINTENANCE = 'system_maintenance',
  
  // Other
  GENERAL = 'general',
}

export interface Notification {
  id: string;
  user_id: string;
  type: NotificationType;
  title: string;
  message: string;
  action_url: string | null;
  is_read: boolean;
  created_at: string;
  read_at: string | null;
}

export interface CreateNotificationDto {
  user_id: string;
  type: NotificationType;
  title: string;
  message: string;
  action_url?: string;
}

class NotificationsService {
  /**
   * Get all notifications for current user
   * الحصول على جميع الإشعارات للمستخدم الحالي
   */
  async getAll(filters?: {
    is_read?: boolean;
    type?: string;
    limit?: number;
  }): Promise<Notification[]> {
    try {
      // Get current user ID
      const userStr = localStorage.getItem('user');
      if (!userStr) {
        return [];
      }
      const user = JSON.parse(userStr);
      
      const params = new URLSearchParams();
      params.append('user_id', user.id);
      if (filters?.is_read !== undefined) params.append('is_read', String(filters.is_read));
      if (filters?.type) params.append('type', filters.type);
      if (filters?.limit) params.append('limit', String(filters.limit));

      const response = await axiosInstance.get(`/notifications?${params}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching notifications:', error);
      throw error;
    }
  }

  /**
   * Get unread notifications count
   * الحصول على عدد الإشعارات غير المقروءة
   */
  async getUnreadCount(): Promise<number> {
    try {
      // Get current user ID
      const userStr = localStorage.getItem('user');
      if (!userStr) {
        return 0;
      }
      const user = JSON.parse(userStr);
      
      const response = await axiosInstance.get(`/notifications/unread/count?user_id=${user.id}`);
      return response.data || 0;
    } catch (error) {
      console.error('Error fetching unread count:', error);
      return 0;
    }
  }

  /**
   * Mark notification as read
   * تعليم الإشعار كمقروء
   */
  async markAsRead(id: string): Promise<Notification> {
    try {
      const response = await axiosInstance.patch(`/notifications/${id}/read`);
      return response.data;
    } catch (error) {
      console.error('Error marking notification as read:', error);
      throw error;
    }
  }

  /**
   * Mark all notifications as read
   * تعليم جميع الإشعارات كمقروءة
   */
  async markAllAsRead(): Promise<void> {
    try {
      // Get current user ID
      const userStr = localStorage.getItem('user');
      if (!userStr) {
        throw new Error('User not found');
      }
      const user = JSON.parse(userStr);
      
      await axiosInstance.patch(`/notifications/read-all?user_id=${user.id}`);
    } catch (error) {
      console.error('Error marking all as read:', error);
      throw error;
    }
  }

  /**
   * Delete notification
   * حذف إشعار
   */
  async delete(id: string): Promise<void> {
    try {
      await axiosInstance.delete(`/notifications/${id}`);
    } catch (error) {
      console.error('Error deleting notification:', error);
      throw error;
    }
  }

  /**
   * Delete all read notifications
   * حذف جميع الإشعارات المقروءة
   */
  async deleteAllRead(): Promise<void> {
    try {
      // Get current user ID
      const userStr = localStorage.getItem('user');
      if (!userStr) {
        throw new Error('User not found');
      }
      const user = JSON.parse(userStr);
      
      await axiosInstance.delete(`/notifications/read?user_id=${user.id}`);
    } catch (error) {
      console.error('Error deleting read notifications:', error);
      throw error;
    }
  }

  /**
   * Create notification (Admin only)
   * إنشاء إشعار (للمسؤولين فقط)
   */
  async create(data: CreateNotificationDto): Promise<Notification> {
    try {
      const response = await axiosInstance.post('/notifications', data);
      return response.data;
    } catch (error) {
      console.error('Error creating notification:', error);
      throw error;
    }
  }

  /**
   * Broadcast notification to all users (Admin only)
   * إرسال إشعار لجميع المستخدمين (للمسؤولين فقط)
   */
  async broadcastToAll(data: {
    type: NotificationType;
    title: string;
    message: string;
    action_url?: string;
  }): Promise<{ count: number }> {
    try {
      const response = await axiosInstance.post('/notifications/broadcast', data);
      return response.data;
    } catch (error) {
      console.error('Error broadcasting notification:', error);
      throw error;
    }
  }

  /**
   * Get notifications for a specific user
   * الحصول على إشعارات مستخدم معين
   */
  async getUserNotifications(userId: string): Promise<Notification[]> {
    try {
      const response = await axiosInstance.get(`/notifications/user/${userId}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching user notifications:', error);
      return [];
    }
  }
}

export const notificationsService = new NotificationsService();
export default notificationsService;
