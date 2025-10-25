import { useState, useEffect, useCallback } from 'react';
import { usersService } from '../services/users.service';
import { UserResponse } from '../types/user.types';

/**
 * Hook for fetching all users
 * Provides loading, error states, and refetch functionality
 */

interface UseUsersReturn {
  users: UserResponse[];
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

export function useUsers(): UseUsersReturn {
  const [users, setUsers] = useState<UserResponse[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const fetchUsers = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await usersService.getAll();
      setUsers(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'حدث خطأ غير متوقع');
      setUsers([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  return {
    users,
    loading,
    error,
    refetch: fetchUsers,
  };
}
