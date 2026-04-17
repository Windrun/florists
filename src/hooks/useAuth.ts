import { useEffect, useState } from 'react';
import { auth } from '../firebase/config';
import { signInAnonymously, onAuthStateChanged, User as FirebaseUser } from 'firebase/auth';

export const useAuth = () => {
  const [user, setUser] = useState<FirebaseUser | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        setUser(firebaseUser);
      } else {
        const credential = await signInAnonymously(auth);
        setUser(credential.user);
      }
      setLoading(false);
    });
    return unsubscribe;
  }, []);

  return { user, loading };
};
