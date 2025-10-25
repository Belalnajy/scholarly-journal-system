import { useState, useEffect, useCallback } from 'react';
import { usersService } from '../services/users.service';
import { UserResponse } from '../types/user.types';

/**
 * Hook for fetching a single user by ID
 * Provides loading, error states, and refetch functionality
 */

interface UseUserReturn {
  user: UserResponse | null;
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

export function useUser(id: string): UseUserReturn {
  const [user, setUser] = useState<UserResponse | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const fetchUser = useCallback(async () => {
    if (!id) {
      setError('معرف المستخدم مطلوب');
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);
      const data = await usersService.getById(id);
      setUser(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'حدث خطأ غير متوقع');
      setUser(null);
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchUser();
  }, [fetchUser]);

  return {
    user,
    loading,
    error,
    refetch: fetchUser,
  };
}
