// Ubah ke true untuk mode mock (frontend-only, tanpa backend)
const MOCK_AUTH = true;
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User, AuthContextType, LoginFormData } from '../types';
import { authService } from '../services/authService';

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (MOCK_AUTH) {
      setIsLoading(false);
      return;
    }
    // Check if user is logged in on app start
    const checkAuth = async () => {
      try {
        const token = localStorage.getItem('token');
        if (token) {
          const userData = await authService.getProfile();
          setUser(userData);
        }
      } catch (error) {
        localStorage.removeItem('token');
      } finally {
        setIsLoading(false);
      }
    };
    checkAuth();
  }, []);

  const login = async (email: string, password: string, role: 'admin' | 'tenant') => {
    if (MOCK_AUTH) {
      setIsLoading(true);
      // Simulasi user mock
      await new Promise((res) => setTimeout(res, 500));
      setUser({
        id: 1,
        name: role === 'admin' ? 'Admin Demo' : 'Tenant Demo',
        email,
        role,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      });
      setIsLoading(false);
      return;
    }
    try {
      setIsLoading(true);
      const response = await authService.login(email, password, role);
      localStorage.setItem('token', response.token);
      setUser(response.user);
    } catch (error) {
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    if (MOCK_AUTH) {
      setUser(null);
      return;
    }
    localStorage.removeItem('token');
    setUser(null);
  };

  const value: AuthContextType = {
    user,
    login,
    logout,
    isLoading,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};