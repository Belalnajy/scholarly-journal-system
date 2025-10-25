import { usersService } from './users.service';
import { CreateUserDto, UserResponse } from '../types/user.types';
import api from './api';
import axios from 'axios';

/**
 * Auth Service
 * Handles authentication operations using JWT tokens
 */

// ============================================
// Types
// ============================================

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface LoginResponse {
  success: boolean;
  user?: UserResponse;
  token?: string;
  error?: string;
}

export interface RegisterData extends CreateUserDto {
  // Registration uses CreateUserDto from users
}

export interface RegisterResponse {
  success: boolean;
  user?: UserResponse;
  error?: string;
}

// ============================================
// Helper Functions
// ============================================

/**
 * Extract error message from axios error
 */
function getErrorMessage(error: unknown): string {
  if (axios.isAxiosError(error)) {
    const message = error.response?.data?.message;
    if (message) {
      return Array.isArray(message) ? message.join(', ') : message;
    }

    switch (error.response?.status) {
      case 401:
        return 'البريد الإلكتروني أو كلمة المرور غير صحيحة';
      case 404:
        return 'المستخدم غير موجود';
      case 409:
        return 'البريد الإلكتروني مستخدم بالفعل';
      case 400:
        return 'البيانات المدخلة غير صحيحة';
      default:
        return 'حدث خطأ في الاتصال بالخادم';
    }
  }

  if (error instanceof Error) {
    return error.message;
  }

  return 'حدث خطأ غير متوقع';
}

// ============================================
// Auth Service
// ============================================

export const authService = {
  /**
   * Login user
   * Authenticates with backend and receives JWT token
   */
  async login(credentials: LoginCredentials): Promise<LoginResponse> {
    try {
      // Call the new auth/login endpoint
      const response = await api.post('/auth/login', credentials);
      
      const { access_token, user } = response.data;

      // Store JWT token
      localStorage.setItem('token', access_token);
      
      // Store user ID for quick access
      localStorage.setItem('userId', user.id);

      // Store user object for activity logging
      localStorage.setItem('user', JSON.stringify(user));

      return {
        success: true,
        user,
        token: access_token,
      };
    } catch (error) {
      return {
        success: false,
        error: getErrorMessage(error),
      };
    }
  },

  /**
   * Register new user
   * Uses the users.create endpoint
   */
  async register(data: RegisterData): Promise<RegisterResponse> {
    try {
      // Create user using users service
      const user = await usersService.create(data);

      // Auto-login after registration
      localStorage.setItem('userId', user.id);

      // Store user object for activity logging
      localStorage.setItem('user', JSON.stringify(user));

      // Generate a mock token
      const mockToken = btoa(`${user.id}:${Date.now()}`);
      localStorage.setItem('token', mockToken);

      return {
        success: true,
        user,
      };
    } catch (error) {
      return {
        success: false,
        error: getErrorMessage(error),
      };
    }
  },

  /**
   * Logout user
   */
  logout(): void {
    localStorage.removeItem('userId');
    localStorage.removeItem('user');
    localStorage.removeItem('token');
  },

  /**
   * Get current user from storage
   * Fetches fresh user data from backend using stored userId
   */
  async getCurrentUser(): Promise<UserResponse | null> {
    try {
      const token = localStorage.getItem('token');
      const userId = localStorage.getItem('userId');
      
      if (!token || !userId) {
        return null;
      }

      // Fetch fresh user data from backend
      // The JWT token will be automatically added by api interceptor
      const user = await usersService.getById(userId);
      
      // Update stored user object
      localStorage.setItem('user', JSON.stringify(user));
      
      return user;
    } catch (error) {
      // If user not found or token invalid, clear storage
      this.logout();
      return null;
    }
  },

  /**
   * Check if user is authenticated
   */
  isAuthenticated(): boolean {
    return !!localStorage.getItem('userId') && !!localStorage.getItem('token');
  },
};

export default authService;
