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
   * Uses the users.create endpoint and auto-login with JWT
   */
  async register(data: RegisterData): Promise<RegisterResponse> {
    try {
      // Create user using users service
      const user = await usersService.create(data);

      // Auto-login after registration using the real login endpoint
      const loginResult = await this.login({
        email: data.email,
        password: data.password,
      });

      if (loginResult.success) {
        return {
          success: true,
          user: loginResult.user,
        };
      } else {
        // If auto-login fails, return success but with a note
        return {
          success: true,
          user,
          error: 'تم إنشاء الحساب بنجاح. يرجى تسجيل الدخول.',
        };
      }
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

  /**
   * Request password reset
   * Sends a 6-digit verification code to user's email
   */
  async forgotPassword(email: string): Promise<{ message: string }> {
    try {
      const response = await api.post('/auth/forgot-password', { email });
      return response.data;
    } catch (error) {
      throw new Error(getErrorMessage(error));
    }
  },

  /**
   * Verify reset code
   * Validates the 6-digit code sent to user's email
   */
  async verifyResetCode(email: string, code: string): Promise<{ message: string; valid: boolean }> {
    try {
      const response = await api.post('/auth/verify-reset-code', { email, code });
      return response.data;
    } catch (error) {
      throw new Error(getErrorMessage(error));
    }
  },

  /**
   * Reset password
   * Changes user's password using the verification code
   */
  async resetPassword(email: string, code: string, newPassword: string): Promise<{ message: string }> {
    try {
      const response = await api.post('/auth/reset-password', { 
        email, 
        code, 
        newPassword 
      });
      return response.data;
    } catch (error) {
      throw new Error(getErrorMessage(error));
    }
  },

  /**
   * Resend reset code
   * Sends a new verification code to user's email
   */
  async resendResetCode(email: string): Promise<{ message: string }> {
    try {
      const response = await api.post('/auth/resend-reset-code', { email });
      return response.data;
    } catch (error) {
      throw new Error(getErrorMessage(error));
    }
  },
};

export default authService;
