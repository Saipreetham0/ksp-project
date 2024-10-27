// src/hooks/useAuth.ts
import { useState, useEffect } from 'react';
import {
  User,
  onAuthStateChanged,
  GoogleAuthProvider,
  signInWithPopup,
  signOut as firebaseSignOut
} from 'firebase/auth';
import { auth, db } from '@/lib/firebase';
import { doc, getDoc, setDoc,  } from 'firebase/firestore';
import { useRouter } from 'next/navigation';
import { UserData,  } from '@/types/auth';
import { ROLE_PERMISSIONS } from '@/lib/roles';

export function useAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [userData, setUserData] = useState<UserData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(
      auth,
      async (user) => {
        setUser(user);
        if (user) {
          // Fetch user data including role
          const userRef = doc(db, 'users', user.uid);
          const userDoc = await getDoc(userRef);

          if (userDoc.exists()) {
            setUserData(userDoc.data() as UserData);
          } else {
            // Create new user document with default role
            const newUserData: UserData = {
              uid: user.uid,
              email: user.email!,
              role: 'user',
              displayName: user.displayName || undefined,
              photoURL: user.photoURL || undefined,
              createdAt: new Date().toISOString(),
              lastLogin: new Date().toISOString()
            };
            await setDoc(userRef, newUserData);
            setUserData(newUserData);
          }
        } else {
          setUserData(null);
        }
        setLoading(false);
      },
      (error) => {
        console.error('Auth state change error:', error);
        setError(error.message);
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, []);

  const hasPermission = (permission: string): boolean => {
    return userData ? ROLE_PERMISSIONS[userData.role]?.includes(permission) ?? false : false;
  };

  const signInWithGoogle = async () => {
    setLoading(true);
    setError(null);

    try {
      const provider = new GoogleAuthProvider();
      provider.setCustomParameters({
        prompt: 'select_account'
      });

      const result = await signInWithPopup(auth, provider);
      router.push('/dashboard');
      return result.user;
    } catch (error) {
      console.error('Google sign-in error:', error);
      // setError(error.message);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const signOut = async () => {
    try {
      await firebaseSignOut(auth);
      router.push('/');
    } catch (error) {
      console.error('Sign out error:', error);
      // setError(error.message);
      throw error;
    }
  };

  return {
    user,
    userData,
    loading,
    error,
    signInWithGoogle,
    signOut,
    hasPermission
  };
}