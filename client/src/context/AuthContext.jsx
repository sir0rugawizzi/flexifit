import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { apiGet, apiPost } from '../api/client';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(() => localStorage.getItem('flexifit_token'));
  const [loading, setLoading] = useState(true);

  // Validate existing token on mount
  useEffect(() => {
    if (!token) {
      setLoading(false);
      return;
    }

    apiGet('/auth/me')
      .then((data) => {
        setUser(data.user);
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
    return data;
  }, []);

  const register = useCallback(async (formData) => {
    const data = await apiPost('/auth/register', formData);
    localStorage.setItem('flexifit_token', data.token);
    localStorage.setItem('flexifit_user', JSON.stringify(data.user));
    setToken(data.token);
    setUser(data.user);
    return data;
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem('flexifit_token');
    localStorage.removeItem('flexifit_user');
    setToken(null);
    setUser(null);
  }, []);

  const value = {
    user,
    token,
    loading,
    isAuthenticated: !!user,
    isTrainer: user?.role === 'trainer',
    isClient: user?.role === 'client',
    login,
    register,
    logout,
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
