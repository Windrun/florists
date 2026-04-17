import { useEffect, useState, useCallback } from 'react';
import { User } from '../types';
import { getUserData, createUserIfNotExists } from '../services/userService';

export const useUserData = (uid: string | undefined) => {
  const [userData, setUserData] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    if (!uid) return;
    const data = await getUserData(uid);
    setUserData(data);
    setLoading(false);
  }, [uid]);

  useEffect(() => {
    if (!uid) return;

    const load = async () => {
      setLoading(true);
      await createUserIfNotExists(uid);
      const data = await getUserData(uid);
      setUserData(data);
      setLoading(false);
    };
    load();
  }, [uid]);

  return { userData, loading, setUserData, refresh };
};
