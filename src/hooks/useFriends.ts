import { useState, useEffect, useCallback } from 'react';
import { User } from '../types';
import { findUserByInviteCode, addFriend, removeFriend, getFriendsData } from '../services/userService';

interface UseFriendsResult {
  friends: User[];
  loading: boolean;
  error: string | null;
  addFriendByCode: (code: string) => Promise<{ success: boolean; message: string }>;
  removeFriendById: (friendUid: string) => Promise<{ success: boolean; message: string }>;
  refreshFriends: () => Promise<void>;
}

export const useFriends = (currentUser: User | null): UseFriendsResult => {
  const [friends, setFriends] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadFriends = useCallback(async () => {
    if (!currentUser) {
      setFriends([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const friendUids = (currentUser.friends || []).map(f => f.uid);
      const friendsData = await getFriendsData(friendUids);
      setFriends(friendsData);
    } catch (err) {
      setError('Ошибка загрузки друзей');
      console.error('Error loading friends:', err);
    } finally {
      setLoading(false);
    }
  }, [currentUser]);

  useEffect(() => {
    loadFriends();
  }, [loadFriends]);

  const addFriendByCode = async (code: string): Promise<{ success: boolean; message: string }> => {
    if (!currentUser) {
      return { success: false, message: 'Не авторизован' };
    }

    setError(null);

    try {
      const foundUser = await findUserByInviteCode(code);
      
      if (!foundUser) {
        return { success: false, message: 'Код не найден' };
      }

      if (foundUser.uid === currentUser.uid) {
        return { success: false, message: 'Нельзя добавить себя' };
      }

      const result = await addFriend(currentUser.uid, foundUser.uid, {
        displayName: foundUser.displayName,
        photoURL: foundUser.photoURL,
      });

      if (result.success) {
        await loadFriends();
      }

      return result;
    } catch (err) {
      console.error('Error adding friend:', err);
      return { success: false, message: 'Ошибка при добавлении друга' };
    }
  };

  const removeFriendById = async (friendUid: string): Promise<{ success: boolean; message: string }> => {
    if (!currentUser) {
      return { success: false, message: 'Не авторизован' };
    }

    setError(null);

    try {
      const result = await removeFriend(currentUser.uid, friendUid);
      
      if (result.success) {
        await loadFriends();
      }

      return result;
    } catch (err) {
      console.error('Error removing friend:', err);
      return { success: false, message: 'Ошибка при удалении друга' };
    }
  };

  return {
    friends,
    loading,
    error,
    addFriendByCode,
    removeFriendById,
    refreshFriends: loadFriends,
  };
};
