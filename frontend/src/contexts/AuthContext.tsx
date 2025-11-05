import React, { createContext, useContext, useEffect, useState } from 'react';
import { User, userAPI } from '@/lib/api';

interface AuthContextType {
  user: User | null;
  token: string | null;
  login: (token: string, user: User) => Promise<User | null>;
  logout: () => void;
  isLoading: boolean;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: React.ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Check for stored auth data on mount
    const storedToken = localStorage.getItem('token');
    const storedUser = localStorage.getItem('user');

    if (storedToken) {
      setToken(storedToken);
      // attempt to fetch latest profile to avoid stale role in localStorage
      userAPI
        .getProfile()
        .then((res) => {
          const freshUser = res.data.data;
          setUser(freshUser);
          localStorage.setItem('user', JSON.stringify(freshUser));
          
          // Handle faculty redirection if they're on the wrong dashboard
          if (freshUser.role === 'faculty' && window.location.pathname === '/dashboard') {
            window.location.href = '/faculty-dashboard';
          }
        })
        .catch(() => {
          // If profile fetch fails, fall back to stored user if available (best-effort)
          if (storedUser) {
            try {
              const parsedUser = JSON.parse(storedUser);
              setUser(parsedUser);
            } catch (error) {
              console.error('Error parsing stored user data:', error);
              localStorage.removeItem('token');
              localStorage.removeItem('user');
              setToken(null);
              setUser(null);
            }
          } else {
            setToken(null);
            setUser(null);
          }
        })
        .finally(() => setIsLoading(false));
      return;
    }
    setIsLoading(false);
    setIsLoading(false);
  }, []);

  const login = async (newToken: string, newUser: User) => {
    setToken(newToken);
    localStorage.setItem('token', newToken);
    try {
      const res = await userAPI.getProfile();
      const fresh = res.data.data;
      setUser(fresh);
      localStorage.setItem('user', JSON.stringify(fresh));
      return fresh;
    } catch (e) {
      // fallback to provided user if fetch fails
      setUser(newUser);
      localStorage.setItem('user', JSON.stringify(newUser));
      return newUser;
    }
  };

  const logout = () => {
    setToken(null);
    setUser(null);
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  };

  const value: AuthContextType = {
    user,
    token,
    login,
    logout,
    isLoading,
    isAuthenticated: !!token && !!user,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

