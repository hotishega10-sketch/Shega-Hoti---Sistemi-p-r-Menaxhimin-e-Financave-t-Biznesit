import { createContext, useContext, useEffect, useState, useCallback } from 'react';
import * as authService from '../services/authService';
import { tokenStore } from '../services/api';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(Boolean(tokenStore.get()));

  // Në hapje: nëse ka token të ruajtur, kontrollo me serverin kush je.
  useEffect(() => {
    if (!tokenStore.get()) return;
    authService.me().then(setUser).catch(() => authService.logout()).finally(() => setLoading(false));
  }, []);

  // api.js lëshon këtë event kur serveri kthen 401 (token i skaduar).
  useEffect(() => {
    const onExpired = () => setUser(null);
    window.addEventListener('auth:expired', onExpired);
    return () => window.removeEventListener('auth:expired', onExpired);
  }, []);

  const login = useCallback(async (email, password) => {
    await authService.login(email, password);
    setUser(await authService.me());
  }, []);

  const logout = useCallback(() => { authService.logout(); setUser(null); }, []);

  const role = user && user.role;
  const value = {
    user, loading, login, logout,
    isOwner: role === 'pronar',
    canManage: role === 'pronar' || role === 'kontabilist', // transaksione (ndrysho), klientë, fatura
  };
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export const useAuth = () => useContext(AuthContext);
