import React, { createContext, useContext, useEffect, useState } from 'react';
import { User, LoginRequest, RegisterRequest } from '../types';
import apiClient from '../services/api';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (credentials: LoginRequest) => Promise<void>;
  register: (userData: RegisterRequest) => Promise<void>;
  logout: () => void;
  isAuthenticated: boolean;
  refreshUser: () => Promise<void>;
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
  const [loading, setLoading] = useState(true);

  const loadUser = async () => {
    try {
      console.log('AuthContext: Loading user, isAuthenticated:', apiClient.isAuthenticated());
      console.log('AuthContext: Access token exists:', !!apiClient.getAccessToken());
      
      if (apiClient.isAuthenticated()) {
        const userData = await apiClient.getProfile();
        console.log('AuthContext: User loaded successfully, full userData:', userData);
        console.log('AuthContext: User email:', userData.email);
        console.log('AuthContext: User name:', userData.name);
        setUser(userData);
      } else {
        console.log('AuthContext: No valid tokens, clearing user');
        // No valid tokens, clear any stale data
        setUser(null);
      }
    } catch (error) {
      console.error('Failed to load user:', error);
      // If token is invalid, clear it
      apiClient.logout();
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadUser();
  }, []);

  const login = async (credentials: LoginRequest) => {
    setLoading(true);
    try {
      const authResponse = await apiClient.login(credentials);
      console.log('Full auth response:', authResponse);
      console.log('User object:', authResponse.user);
      setUser(authResponse.user);
    } catch (error: any) {
      console.error('Login error:', error);
      throw new Error(error.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  const register = async (userData: RegisterRequest) => {
    setLoading(true);
    try {
      const authResponse = await apiClient.register(userData);
      setUser(authResponse.user);
    } catch (error: any) {
      throw new Error(error.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    apiClient.logout();
    setUser(null);
  };

  const refreshUser = async () => {
    if (apiClient.isAuthenticated()) {
      try {
        const userData = await apiClient.getProfile();
        setUser(userData);
      } catch (error) {
        console.error('Failed to refresh user:', error);
        logout();
      }
    }
  };

  const value: AuthContextType = {
    user,
    loading,
    login,
    register,
    logout,
    isAuthenticated: !!user && apiClient.isAuthenticated(),
    refreshUser,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};