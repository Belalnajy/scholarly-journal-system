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

export interface SiteSettings {
  id: string;
  site_name: string;
  site_name_en?: string;
  logo_url?: string;
  favicon_url?: string;
  about_intro?: string;
  mission?: string;
  vision?: string;
  goals?: string[];
  contact_info?: {
    email?: string;
    phone?: string;
    address?: string;
    fax?: string;
  };
  social_links?: {
    facebook?: string;
    twitter?: string;
    linkedin?: string;
    instagram?: string;
    youtube?: string;
  };
  is_maintenance_mode: boolean;
  maintenance_message?: string;
  updated_at: string;
}

export interface UpdateSiteSettingsDto {
  site_name?: string;
  site_name_en?: string;
  logo_url?: string;
  favicon_url?: string;
  about_intro?: string;
  mission?: string;
  vision?: string;
  goals?: string[];
  contact_info?: {
    email?: string;
    phone?: string;
    address?: string;
    fax?: string;
  };
  social_links?: {
    facebook?: string;
    twitter?: string;
    linkedin?: string;
    instagram?: string;
    youtube?: string;
  };
  is_maintenance_mode?: boolean;
  maintenance_message?: string;
}

class SiteSettingsService {
  /**
   * Get site settings (Admin)
   * الحصول على إعدادات الموقع (للمسؤولين)
   */
  async getSettings(): Promise<SiteSettings> {
    try {
      const response = await axiosInstance.get('/site-settings');
      return response.data;
    } catch (error) {
      console.error('Error fetching site settings:', error);
      throw error;
    }
  }

  /**
   * Get public site settings
   * الحصول على الإعدادات العامة للموقع
   */
  async getPublicSettings(): Promise<Partial<SiteSettings>> {
    try {
      const response = await axiosInstance.get('/site-settings/public');
      return response.data;
    } catch (error) {
      console.error('Error fetching public settings:', error);
      throw error;
    }
  }

  /**
   * Update site settings
   * تحديث إعدادات الموقع
   */
  async updateSettings(data: UpdateSiteSettingsDto): Promise<SiteSettings> {
    try {
      const response = await axiosInstance.patch('/site-settings', data);
      return response.data;
    } catch (error) {
      console.error('Error updating site settings:', error);
      throw error;
    }
  }

  /**
   * Toggle maintenance mode
   * تفعيل/تعطيل وضع الصيانة
   */
  async toggleMaintenanceMode(enabled: boolean): Promise<SiteSettings> {
    try {
      const response = await axiosInstance.post('/site-settings/maintenance-mode', {
        enabled,
      });
      return response.data;
    } catch (error) {
      console.error('Error toggling maintenance mode:', error);
      throw error;
    }
  }

  /**
   * Upload logo
   * رفع شعار الموقع
   */
  async uploadLogo(file: File): Promise<{ logo_url: string }> {
    try {
      const formData = new FormData();
      formData.append('logo', file);

      const response = await axiosInstance.post('/site-settings/upload-logo', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      return response.data;
    } catch (error) {
      console.error('Error uploading logo:', error);
      throw error;
    }
  }

  /**
   * Upload favicon
   * رفع أيقونة الموقع
   */
  async uploadFavicon(file: File): Promise<{ favicon_url: string }> {
    try {
      const formData = new FormData();
      formData.append('favicon', file);

      const response = await axiosInstance.post('/site-settings/upload-favicon', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      return response.data;
    } catch (error) {
      console.error('Error uploading favicon:', error);
      throw error;
    }
  }
}

export default new SiteSettingsService();
