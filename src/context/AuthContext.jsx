import { createContext, useContext, useEffect, useMemo, useState } from 'react';
import {
  subscribeToAuth,
  registerUser,
  loginUser,
  logoutUser,
} from '../services/authService';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  // true, пока Firebase не восстановил сессию из localStorage/IndexedDB
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = subscribeToAuth((firebaseUser) => {
      setUser(firebaseUser);
      setLoading(false);
    });
    return unsubscribe; // очистка подписки при размонтировании
  }, []);

  const value = useMemo(
    () => ({
      user,
      loading,
      register: registerUser,
      login: loginUser,
      logout: logoutUser,
    }),
    [user, loading]
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