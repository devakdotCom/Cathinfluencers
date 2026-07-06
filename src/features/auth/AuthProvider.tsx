import {
  browserSessionPersistence,
  createUserWithEmailAndPassword,
  GoogleAuthProvider,
  onAuthStateChanged,
  sendPasswordResetEmail,
  setPersistence,
  signInWithEmailAndPassword,
  signInWithPopup,
  signOut as firebaseSignOut,
  type User,
} from 'firebase/auth';
import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';
import { auth } from '../../firebase';

export type AppRole = 'admin' | 'moderator' | 'member' | null;

interface AuthContextValue {
  user: User | null;
  role: AppRole;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<Exclude<AppRole, null>>;
  register: (email: string, password: string) => Promise<Exclude<AppRole, null>>;
  signInWithGoogle: () => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
  signOut: () => Promise<void>;
  refreshClaims: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [role, setRole] = useState<AppRole>(null);
  const [loading, setLoading] = useState(true);

  const loadClaims = async (nextUser: User | null, forceRefresh = false) => {
    if (!nextUser) {
      setRole(null);
      return;
    }

    const token = await nextUser.getIdTokenResult(forceRefresh);
    setRole(
      token.claims.admin === true
        ? 'admin'
        : token.claims.moderator === true
          ? 'moderator'
          : 'member',
    );
  };

  useEffect(() => {
    if (!auth) {
      setLoading(false);
      return;
    }

    void setPersistence(auth, browserSessionPersistence);
    return onAuthStateChanged(auth, async nextUser => {
      setLoading(true);
      setUser(nextUser);
      try {
        await loadClaims(nextUser);
      } finally {
        setLoading(false);
      }
    });
  }, []);

  const value = useMemo<AuthContextValue>(() => ({
    user,
    role,
    loading,
    signIn: async (email, password) => {
      if (!auth) throw new Error('Firebase Authentication is not configured.');
      await setPersistence(auth, browserSessionPersistence);
      const credential = await signInWithEmailAndPassword(auth, email.trim(), password);
      const token = await credential.user.getIdTokenResult(true);
      const nextRole = token.claims.admin === true
        ? 'admin'
        : token.claims.moderator === true
          ? 'moderator'
          : 'member';
      setRole(nextRole);
      return nextRole;
    },
    register: async (email, password) => {
      if (!auth) throw new Error('Firebase Authentication is not configured.');
      await setPersistence(auth, browserSessionPersistence);
      await createUserWithEmailAndPassword(auth, email.trim(), password);
      setRole('member');
      return 'member';
    },
    signInWithGoogle: async () => {
      if (!auth) throw new Error('Firebase Authentication is not configured.');
      await setPersistence(auth, browserSessionPersistence);
      await signInWithPopup(auth, new GoogleAuthProvider());
    },
    resetPassword: async email => {
      if (!auth) throw new Error('Firebase Authentication is not configured.');
      const normalizedEmail = email.trim();
      if (!normalizedEmail) throw new Error('Enter your registered email address first.');
      await sendPasswordResetEmail(auth, normalizedEmail);
    },
    signOut: async () => {
      if (auth) await firebaseSignOut(auth);
    },
    refreshClaims: async () => {
      await loadClaims(user, true);
    },
  }), [loading, role, user]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const value = useContext(AuthContext);
  if (!value) throw new Error('useAuth must be used inside AuthProvider.');
  return value;
}
