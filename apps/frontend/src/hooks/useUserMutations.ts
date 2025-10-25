import { useState, useCallback } from 'react';
import { usersService } from '../services/users.service';
import { CreateUserDto, UpdateUserDto, UserResponse } from '../types/user.types';

/**
 * Hook for user mutations (create, update, delete)
 * Provides loading and error states for each operation
 */

interface UseUserMutationsReturn {
  createUser: (data: CreateUserDto) => Promise<UserResponse>;
  updateUser: (id: string, data: UpdateUserDto) => Promise<UserResponse>;
  deleteUser: (id: string) => Promise<void>;
  loading: boolean;
  error: string | null;
  clearError: () => void;
}

export function useUserMutations(): UseUserMutationsReturn {
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  const createUser = useCallback(async (data: CreateUserDto): Promise<UserResponse> => {
    try {
      setLoading(true);
      setError(null);
      const result = await usersService.create(data);
      return result;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'حدث خطأ أثناء إنشاء المستخدم';
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const updateUser = useCallback(
    async (id: string, data: UpdateUserDto): Promise<UserResponse> => {
      try {
        setLoading(true);
        setError(null);
        const result = await usersService.update(id, data);
        return result;
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'حدث خطأ أثناء تحديث المستخدم';
        setError(errorMessage);
        throw err;
      } finally {
        setLoading(false);
      }
    },
    []
  );

  const deleteUser = useCallback(async (id: string): Promise<void> => {
    try {
      setLoading(true);
      setError(null);
      await usersService.delete(id);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'حدث خطأ أثناء حذف المستخدم';
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    createUser,
    updateUser,
    deleteUser,
    loading,
    error,
    clearError,
  };
}
