import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { apiGet, apiPost } from '../api/client';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(() => localStorage.getItem('flexifit_token'));
  const [loading, setLoading] = useState(true);
  const [isDemoMode, setIsDemoMode] = useState(false);

  // Validate existing token on mount
  useEffect(() => {
    if (!token) {
      setLoading(false);
      return;
    }

    apiGet('/auth/me')
      .then((data) => {
        setUser(data.user);
        setIsDemoMode(data.user?.is_demo || false);
      })
      .catch(() => {
        // Token invalid – clear it
        localStorage.removeItem('flexifit_token');
        localStorage.removeItem('flexifit_user');
        setToken(null);
      })
      .finally(() => setLoading(false));
  }, [token]);

  const login = useCallback(async (email, password) => {
    const data = await apiPost('/auth/login', { email, password });
    localStorage.setItem('flexifit_token', data.token);
    localStorage.setItem('flexifit_user', JSON.stringify(data.user));
    setToken(data.token);
    setUser(data.user);
    setIsDemoMode(false);
    return data;
  }, []);

  const demoLogin = useCallback(async (role) => {
    const data = await apiPost('/auth/demo-login', { role });
    localStorage.setItem('flexifit_token', data.token);
    localStorage.setItem('flexifit_user', JSON.stringify(data.user));
    setToken(data.token);
    setUser(data.user);
    setIsDemoMode(true);
    return data;
  }, []);

  const register = useCallback(async (formData) => {
    const data = await apiPost('/auth/register', formData);
    localStorage.setItem('flexifit_token', data.token);
    localStorage.setItem('flexifit_user', JSON.stringify(data.user));
    setToken(data.token);
    setUser(data.user);
    setIsDemoMode(false);
    return data;
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem('flexifit_token');
    localStorage.removeItem('flexifit_user');
    setToken(null);
    setUser(null);
    setIsDemoMode(false);
  }, []);

  /** Demo mode role switcher – switch between trainer & client instantly */
  const switchRole = useCallback(async (role) => {
    if (!isDemoMode) return;
    const data = await apiPost('/auth/demo-login', { role });
    localStorage.setItem('flexifit_token', data.token);
    localStorage.setItem('flexifit_user', JSON.stringify(data.user));
    setToken(data.token);
    setUser(data.user);
  }, [isDemoMode]);

  const value = {
    user,
    token,
    loading,
    isDemoMode,
    isAuthenticated: !!user,
    isTrainer: user?.role === 'trainer',
    isClient: user?.role === 'client',
    login,
    demoLogin,
    register,
    logout,
    switchRole,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
