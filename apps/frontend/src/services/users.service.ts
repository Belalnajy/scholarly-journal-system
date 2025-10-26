import api from './api';
import {
  CreateUserDto,
  UpdateUserDto,
  UserResponse,
  UserStats,
} from '../types/user.types';
import axios from 'axios';

/**
 * Users Service
 * Handles all API calls related to users
 * Matches backend endpoints in users.controller.ts
 */

// ============================================
// Error Messages (Arabic)
// ============================================

const ERROR_MESSAGES = {
  NETWORK_ERROR: 'خطأ في الاتصال بالخادم',
  NOT_FOUND: 'المستخدم غير موجود',
  CONFLICT: 'البريد الإلكتروني مستخدم بالفعل',
  VALIDATION_ERROR: 'البيانات المدخلة غير صحيحة',
  UNAUTHORIZED: 'يجب تسجيل الدخول أولاً',
  FORBIDDEN: 'ليس لديك صلاحية لهذا الإجراء',
  SERVER_ERROR: 'حدث خطأ في الخادم',
  UNKNOWN_ERROR: 'حدث خطأ غير متوقع',
};

// ============================================
// Helper Functions
// ============================================

/**
 * Extract error message from axios error
 */
function getErrorMessage(error: unknown): string {
  if (axios.isAxiosError(error)) {
    const status = error.response?.status;
    const message = error.response?.data?.message;

    // Return backend message if available
    if (message) {
      return Array.isArray(message) ? message.join(', ') : message;
    }

    // Map status codes to messages
    switch (status) {
      case 404:
        return ERROR_MESSAGES.NOT_FOUND;
      case 409:
        return ERROR_MESSAGES.CONFLICT;
      case 400:
        return ERROR_MESSAGES.VALIDATION_ERROR;
      case 401:
        return ERROR_MESSAGES.UNAUTHORIZED;
      case 403:
        return ERROR_MESSAGES.FORBIDDEN;
      case 500:
        return ERROR_MESSAGES.SERVER_ERROR;
      default:
        return error.message || ERROR_MESSAGES.NETWORK_ERROR;
    }
  }

  if (error instanceof Error) {
    return error.message;
  }

  return ERROR_MESSAGES.UNKNOWN_ERROR;
}

// ============================================
// Users Service
// ============================================

export const usersService = {
  /**
   * Get all users
   * GET /api/users
   */
  async getAll(): Promise<UserResponse[]> {
    try {
      const response = await api.get<UserResponse[]>('/users');
      return response.data;
    } catch (error) {
      throw new Error(getErrorMessage(error));
    }
  },

  /**
   * Get editors (Public endpoint)
   * GET /api/users/editors
   */
  async getEditors(): Promise<UserResponse[]> {
    try {
      const response = await api.get<UserResponse[]>('/users/editors');
      return response.data;
    } catch (error) {
      throw new Error(getErrorMessage(error));
    }
  },

  /**
   * Get user by ID
   * GET /api/users/:id
   */
  async getById(id: string): Promise<UserResponse> {
    try {
      const response = await api.get<UserResponse>(`/users/${id}`);
      return response.data;
    } catch (error) {
      throw new Error(getErrorMessage(error));
    }
  },

  /**
   * Create new user
   * POST /api/users
   */
  async create(data: CreateUserDto): Promise<UserResponse> {
    try {
      const response = await api.post<UserResponse>('/users', data);
      return response.data;
    } catch (error) {
      throw new Error(getErrorMessage(error));
    }
  },

  /**
   * Update user
   * PATCH /api/users/:id
   */
  async update(id: string, data: UpdateUserDto): Promise<UserResponse> {
    try {
      const response = await api.patch<UserResponse>(`/users/${id}`, data);
      return response.data;
    } catch (error) {
      throw new Error(getErrorMessage(error));
    }
  },

  /**
   * Delete user
   * DELETE /api/users/:id
   */
  async delete(id: string): Promise<void> {
    try {
      await api.delete(`/users/${id}`);
    } catch (error) {
      throw new Error(getErrorMessage(error));
    }
  },

  /**
   * Get user statistics
   * GET /api/users/stats
   */
  async getStats(): Promise<UserStats> {
    try {
      const response = await api.get<UserStats>('/users/stats');
      return response.data;
    } catch (error) {
      throw new Error(getErrorMessage(error));
    }
  },

  /**
   * Verify user password
   * POST /api/users/:id/verify-password
   */
  async verifyPassword(id: string, password: string): Promise<boolean> {
    try {
      await api.post(`/users/${id}/verify-password`, { password });
      return true;
    } catch (error) {
      // Re-throw the error to preserve status code
      throw error;
    }
  },

  /**
   * Upload user avatar to Cloudinary
   * POST /api/users/:id/upload-avatar
   */
  async uploadAvatar(id: string, file: File): Promise<UserResponse> {
    try {
      const formData = new FormData();
      formData.append('file', file);

      const response = await api.post<UserResponse>(
        `/users/${id}/upload-avatar`,
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        }
      );
      return response.data;
    } catch (error) {
      throw new Error(getErrorMessage(error));
    }
  },

  /**
   * Delete user avatar
   * DELETE /api/users/:id/avatar
   */
  async deleteAvatar(id: string): Promise<UserResponse> {
    try {
      const response = await api.delete<UserResponse>(`/users/${id}/avatar`);
      return response.data;
    } catch (error) {
      throw new Error(getErrorMessage(error));
    }
  },

  /**
   * Get optimized avatar URL
   * GET /api/users/:id/avatar-url?width=400&height=400
   */
  async getAvatarUrl(
    id: string,
    width?: number,
    height?: number
  ): Promise<{ avatar_url: string }> {
    try {
      const params = new URLSearchParams();
      if (width) params.append('width', width.toString());
      if (height) params.append('height', height.toString());

      const response = await api.get<{ avatar_url: string }>(
        `/users/${id}/avatar-url?${params.toString()}`
      );
      return response.data;
    } catch (error) {
      throw new Error(getErrorMessage(error));
    }
  },
};

// ============================================
// Export default
// ============================================

export default usersService;
