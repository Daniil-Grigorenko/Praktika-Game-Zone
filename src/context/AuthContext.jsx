import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';
import {
  subscribeToAuth,
  registerUser,
  loginUser,
  logoutUser,
} from '../services/authService';
import { getUserRole } from '../services/adminService';
import { syncUserDoc } from '../services/usersService';
import { auth } from '../services/firebase';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [role, setRole] = useState('user'); // 'owner' | 'admin' | 'user'
  const [isBlocked, setIsBlocked] = useState(false);
  const [accountDeleted, setAccountDeleted] = useState(false);

  const [loading, setLoading] = useState(true);

  const [version, setVersion] = useState(0);
  const registeringRef = useRef(false);

  useEffect(() => {
    let active = true;

    const unsubscribe = subscribeToAuth(async (firebaseUser) => {
      if (!firebaseUser) {
        setUser(null);
        setRole('user');
        setIsBlocked(false);
        setLoading(false);
        return;
      }

      let state = { blocked: false, deleted: false };
      if (!registeringRef.current) {
        try {
          state = await syncUserDoc(firebaseUser);
        } catch {
          state = { blocked: false, deleted: false };
        }
      }

      if (state.deleted) {

        if (active) setAccountDeleted(true);
        await logoutUser();
        return;
      }

      let userRole = 'user';
      try {
        userRole = await getUserRole(firebaseUser.uid);
      } catch {
        userRole = 'user';
      }

      if (!active) return;
      setUser(firebaseUser);
      setRole(userRole);
      setIsBlocked(state.blocked);
      setLoading(false);
    });

    return () => {
      active = false;
      unsubscribe();
    };
  }, []);


  const refreshUser = useCallback(async () => {
    if (!auth.currentUser) return;
    await auth.currentUser.reload();
    setVersion((v) => v + 1);
  }, []);

  const register = useCallback(async (data) => {
    registeringRef.current = true;
    try {
      const created = await registerUser(data);
      try {
        await syncUserDoc(created, { login: true });
      } catch {

      }
      setAccountDeleted(false);
      setVersion((v) => v + 1);
      return created;
    } finally {
      registeringRef.current = false;
    }
  }, []);

  const login = useCallback(async (data) => {
    const loggedIn = await loginUser(data);

    let state = { blocked: false, deleted: false };
    try {
      state = await syncUserDoc(loggedIn, { login: true });
    } catch {

    }

    if (state.deleted) {
      setAccountDeleted(true);
      await logoutUser();
      const err = new Error('Account deleted');
      err.code = 'app/account-deleted';
      throw err;
    }

    setAccountDeleted(false);
    setIsBlocked(state.blocked);
    return loggedIn;
  }, []);

  const value = useMemo(
    () => ({
      user,
      role,
      isOwner: role === 'owner',
      isAdmin: role === 'owner' || role === 'admin', // владелец тоже имеет права админа
      isBlocked,
      accountDeleted,
      loading,
      register,
      login,
      logout: logoutUser,
      refreshUser,
    }),
    [user, role, isBlocked, accountDeleted, loading, version, register, login, refreshUser]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error('useAuth нужно использовать внутри <AuthProvider>');
  }
  return ctx;
}