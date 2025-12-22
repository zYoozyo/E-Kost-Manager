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
        const token = sessionStorage.getItem('token');

        // Check backend jika token ada
        if (token) {
          console.log('AuthContext checkAuth: Token found, fetching profile...');
          try {
            const userData = await authService.getProfile();
            console.log('AuthContext checkAuth: Profile fetched successfully:', userData);
            console.log('AuthContext checkAuth: User role:', userData?.role);
            setUser(userData);
          } catch (error) {
            console.log('AuthContext checkAuth: Error fetching profile:', error);
            sessionStorage.removeItem('token');
            sessionStorage.removeItem('user');
          }
        } else {
          console.log('AuthContext checkAuth: No token found');
        }
      } catch (error) {
        sessionStorage.removeItem('token');
        sessionStorage.removeItem('user');
      } finally {
        setIsLoading(false);
      }
    };
    checkAuth();
  }, []);

  const login = async (email: string, password: string) => {
    try {
      setIsLoading(true);
      const response = await authService.login(email, password);
      
      // Debug: Log response structure
      console.log('AuthContext login response:', response);
      console.log('User role from response:', response.user?.role);
      
      // Simpan token terlebih dahulu agar request berikutnya terautentikasi
      sessionStorage.setItem('token', response.token);
      console.log('Token saved to sessionStorage:', response.token?.substring(0, 20) + '...');

      // Setelah login, ambil profil terbaru dari backend (termasuk avatar URL)
      const userData = await authService.getProfile();
      console.log('User data from getProfile:', userData);
      console.log('User role from profile:', userData?.role);
      console.log('Complete user object:', JSON.stringify(userData, null, 2));
      
      setUser(userData);
      return userData;
    } catch (error) {
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    if (MOCK_AUTH) {
      setUser(null);
      sessionStorage.removeItem('token');
      sessionStorage.removeItem('user');
      return;
    }
    sessionStorage.removeItem('token');
    sessionStorage.removeItem('user');
    setUser(null);
  };

  const value: AuthContextType = {
    user,
    login,
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