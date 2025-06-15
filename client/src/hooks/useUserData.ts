import { useEffect } from 'react';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { fetchUsers } from '@/store/slices/userSlice';

export function useUserData() {
  const dispatch = useAppDispatch();
  const users = useAppSelector(state => state.users.users);
  const loading = useAppSelector(state => state.users.loading);

  // Fetch users on first use
  useEffect(() => {
    if (users.length === 0 && !loading) {
      dispatch(fetchUsers());
    }
  }, [dispatch, users.length, loading]);

  // Utility function to get username by ID
  const getUserName = (userId: string): string => {
    const user = users.find(u => u.id === userId);
    return user?.fullName || 'Unknown User';
  };

  // Utility function to get multiple usernames from array of IDs
  const getUserNames = (userIds: string[]): string[] => {
    return userIds.map(id => getUserName(id));
  };

  return {
    users,
    loading,
    getUserName,
    getUserNames
  };
}