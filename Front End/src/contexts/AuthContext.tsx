// Ubah ke true untuk mode mock (frontend-only, tanpa backend)
const MOCK_AUTH = false;
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
        const savedUser = localStorage.getItem('user');
        
        // Jika ada user yang disimpan di localStorage (demo login)
        if (savedUser && token && token.startsWith('demo-token-')) {
          try {
            const userData = JSON.parse(savedUser);
            setUser(userData);
            setIsLoading(false);
            return;
          } catch (e) {
            // Jika parsing gagal, lanjut ke check backend
          }
        }
        
        // Check backend jika token ada
        if (token) {
          try {
            const userData = await authService.getProfile();
            setUser(userData);
          } catch (error) {
            // Jika backend error, cek apakah ini demo token
            if (token.startsWith('demo-token-') && savedUser) {
              const userData = JSON.parse(savedUser);
              setUser(userData);
            } else {
              localStorage.removeItem('token');
              localStorage.removeItem('user');
            }
          }
        }
      } catch (error) {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
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

  const demoLogin = async (role: 'admin' | 'tenant') => {
    setIsLoading(true);
    // Simulasi loading
    await new Promise((res) => setTimeout(res, 500));
    
    const mockUser: User = {
      id: role === 'admin' ? 1 : 2,
      name: role === 'admin' ? 'Admin Demo' : 'Budi',
      email: role === 'admin' ? 'admin@demo.com' : 'budi@demo.com',
      role,
      phone: '+62 812 345 6789',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
    
    // Set ke localStorage
    localStorage.setItem('token', 'demo-token-' + role);
    localStorage.setItem('user', JSON.stringify(mockUser));
    
    // Set user di context
    setUser(mockUser);
    setIsLoading(false);
  };

  const logout = () => {
    if (MOCK_AUTH) {
      setUser(null);
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      return;
    }
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
  };

  const value: AuthContextType = {
    user,
    login,
    demoLogin,
    logout,
    isLoading,
    setUser,
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