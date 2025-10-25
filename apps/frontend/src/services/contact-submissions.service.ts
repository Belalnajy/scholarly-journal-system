import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

// Create axios instance with default config
const axiosInstance = axios.create({
  baseURL: API_URL,
});

// Add token to requests (optional for contact submissions)
axiosInstance.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export interface CreateContactSubmissionDto {
  user_id?: string;
  name: string;
  email: string;
  subject: string;
  message: string;
}

export interface ContactSubmission {
  id: string;
  user_id: string | null;
  name: string;
  email: string;
  subject: string;
  message: string;
  status: 'pending' | 'in_progress' | 'resolved' | 'closed';
  submitted_at: string;
  responded_at: string | null;
}

class ContactSubmissionsService {
  /**
   * Create a new contact submission
   * إنشاء رسالة تواصل جديدة
   */
  async create(data: CreateContactSubmissionDto): Promise<ContactSubmission> {
    try {
      // Get user ID if logged in
      const userStr = localStorage.getItem('user');
      if (userStr) {
        const user = JSON.parse(userStr);
        data.user_id = user.id;
      }

      const response = await axiosInstance.post('/contact-submissions', data);
      return response.data;
    } catch (error) {
      console.error('Error creating contact submission:', error);
      throw error;
    }
  }

  /**
   * Get all contact submissions (Admin only)
   * الحصول على جميع رسائل التواصل
   */
  async getAll(filters?: {
    status?: string;
    user_id?: string;
  }): Promise<ContactSubmission[]> {
    try {
      const params = new URLSearchParams();
      if (filters?.status) params.append('status', filters.status);
      if (filters?.user_id) params.append('user_id', filters.user_id);

      const response = await axiosInstance.get(`/contact-submissions?${params}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching contact submissions:', error);
      throw error;
    }
  }

  /**
   * Get one contact submission by ID
   * الحصول على رسالة تواصل واحدة
   */
  async getById(id: string): Promise<ContactSubmission> {
    try {
      const response = await axiosInstance.get(`/contact-submissions/${id}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching contact submission:', error);
      throw error;
    }
  }

  /**
   * Update submission status (Admin only)
   * تحديث حالة الرسالة
   */
  async updateStatus(id: string, status: string): Promise<ContactSubmission> {
    try {
      const response = await axiosInstance.patch(`/contact-submissions/${id}/status`, { status });
      return response.data;
    } catch (error) {
      console.error('Error updating contact submission status:', error);
      throw error;
    }
  }

  /**
   * Get submissions statistics (Admin only)
   * الحصول على إحصائيات الرسائل
   */
  async getStats(): Promise<{
    total: number;
    pending: number;
    inProgress: number;
    resolved: number;
    closed: number;
  }> {
    try {
      const response = await axiosInstance.get('/contact-submissions/stats');
      return response.data;
    } catch (error) {
      console.error('Error fetching contact submissions stats:', error);
      throw error;
    }
  }

  /**
   * Delete a contact submission (Admin only)
   * حذف رسالة تواصل
   */
  async delete(id: string): Promise<void> {
    try {
      await axiosInstance.delete(`/contact-submissions/${id}`);
    } catch (error) {
      console.error('Error deleting contact submission:', error);
      throw error;
    }
  }
}

export default new ContactSubmissionsService();
