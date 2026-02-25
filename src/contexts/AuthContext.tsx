import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { authService, type AuthUser } from '../services/authService';
import { unifiedCacheService } from '../services/unifiedCacheService';
import { cacheManager } from '../utils/cacheManager';

export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  phone?: string;
  avatarUrl?: string;
  userType: 'buyer' | 'developer' | 'host' | 'admin';
  companyName?: string;
  licenseNumber?: string;
  address?: string;
  website?: string;
  instagram?: string;
  x?: string;
  facebook?: string;
  tiktok?: string;
  logoUrl?: string;
  preferences: {
    notifications: boolean;
    darkMode: boolean;
    language: string;
  };
}

export interface SignupData {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  userType: 'buyer' | 'developer' | 'host' | 'admin';
  phone?: string;
  companyName?: string;
  licenseNumber?: string;
  address?: string;
}

export interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  isAuthReady: boolean;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string; user?: User }>;
  signup: (userData: SignupData) => Promise<{ success: boolean; error?: string }>;
  signInWithGoogle: () => Promise<{ success: boolean; error?: string }>;
  logout: () => Promise<void>;
  updateProfile: (userData: Partial<User>) => Promise<{ success: boolean; error?: string }>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const ADMIN_EMAILS_LIST = [
  'admin@realaist.com',
  'admin@realaist.tech',
  'superadmin@realaist.com',
  'support@realaist.com',
];

function parseCachedUser(): User | null {
  try {
    const raw = typeof localStorage !== 'undefined' ? localStorage.getItem('current_user') : null;
    if (!raw) return null;
    const authUser = JSON.parse(raw) as AuthUser;
    const userType = ADMIN_EMAILS_LIST.includes((authUser.email || '').toLowerCase())
      ? 'admin'
      : (authUser.userType || 'buyer');
    return {
      id: authUser.id,
      email: authUser.email,
      firstName: authUser.firstName,
      lastName: authUser.lastName,
      phone: authUser.phone,
      avatarUrl: authUser.avatarUrl,
      userType: userType as User['userType'],
      companyName: authUser.companyName,
      licenseNumber: authUser.licenseNumber,
      address: authUser.address,
      website: authUser.website,
      instagram: authUser.instagram,
      x: authUser.x,
      facebook: authUser.facebook,
      tiktok: authUser.tiktok,
      logoUrl: authUser.logoUrl,
      preferences: { notifications: true, darkMode: false, language: 'en' },
    };
  } catch {
    return null;
  }
}

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(parseCachedUser);
  const [isLoading, setIsLoading] = useState(false);
  const [isAuthReady, setIsAuthReady] = useState(false);

  // ✅ Cleaned admin email list
  const ADMIN_EMAILS = [
    'admin@realaist.com',
    'admin@realaist.tech',
    'superadmin@realaist.com',
    'support@realaist.com',
  ];

  // Helper function to check if user is admin
  const isAdminUser = (email: string): boolean => ADMIN_EMAILS.includes(email.toLowerCase());

  // Convert backend AuthUser to local User object
  const convertAuthUserToUser = (authUser: AuthUser | any): User => {
    const userType = isAdminUser(authUser.email) ? 'admin' : authUser.userType;
    return {
      id: authUser.id,
      email: authUser.email,
      firstName: authUser.firstName,
      lastName: authUser.lastName,
      phone: authUser.phone,
      avatarUrl: authUser.avatarUrl,
      userType: userType as 'buyer' | 'developer' | 'host' | 'admin',
      companyName: authUser.companyName,
      licenseNumber: authUser.licenseNumber,
      address: authUser.address,
      website: authUser.website,
      instagram: authUser.instagram,
      x: authUser.x,
      facebook: authUser.facebook,
      tiktok: authUser.tiktok,
      logoUrl: authUser.logoUrl,
      preferences: {
        notifications: true,
        darkMode: false,
        language: 'en',
      },
    };
  };

  // Revalidate session in background (UI already shows cached user if any)
  useEffect(() => {
    let cancelled = false;
    const checkAuth = async () => {
      try {
        const authUser = await authService.getCurrentUser();
        if (cancelled) return;
        if (authUser) {
          setUser(convertAuthUserToUser(authUser));
        } else {
          const storedUser = localStorage.getItem('current_user');
          if (storedUser) {
            try {
              setUser(convertAuthUserToUser(JSON.parse(storedUser)));
            } catch {
              localStorage.removeItem('current_user');
              setUser(null);
            }
          } else {
            setUser(null);
          }
        }
      } catch {
        if (cancelled) return;
        const storedUser = localStorage.getItem('current_user');
        if (storedUser) {
          try {
            setUser(convertAuthUserToUser(JSON.parse(storedUser)));
          } catch {
            localStorage.removeItem('current_user');
            setUser(null);
          }
        } else {
          setUser(null);
        }
        localStorage.setItem('offline_mode', 'true');
        localStorage.setItem('offline_mode_timestamp', Date.now().toString());
      } finally {
        if (!cancelled) setIsAuthReady(true);
      }
    };
    checkAuth();
    return () => { cancelled = true; };

    const handleAdminLogin = (event: Event) => {
      const customEvent = event as CustomEvent<{ user: AuthUser }>;
      setUser(convertAuthUserToUser(customEvent.detail.user));
    };

    const handleUserLogin = (event: Event) => {
      const customEvent = event as CustomEvent<{ user: AuthUser }>;
      setUser(convertAuthUserToUser(customEvent.detail.user));
    };

    window.addEventListener('realaist:admin-login', handleAdminLogin);
    window.addEventListener('realaist:user-logged-in', handleUserLogin);

    return () => {
      window.removeEventListener('realaist:admin-login', handleAdminLogin);
      window.removeEventListener('realaist:user-logged-in', handleUserLogin);
    };
  }, []);

  const clearAllAppCaches = async () => {
    try {
      unifiedCacheService.clearAll();
      unifiedCacheService.clearUserCaches();
      cacheManager.clearAllCaches();
    } catch (e) {
      console.warn('Cache clear skipped due to error:', e);
    }
  };

  const login = async (email: string, password: string) => {
    try {
      setIsLoading(true);
      const timeoutId = setTimeout(() => setIsLoading(false), 10000);
      const result = await authService.signIn({ email, password });
      clearTimeout(timeoutId);

      if (result.user) {
        await clearAllAppCaches();
        localStorage.removeItem('offline_mode');
        localStorage.removeItem('offline_mode_timestamp');

        const newUser = convertAuthUserToUser(result.user);
        setUser(newUser);

        window.dispatchEvent(
          new CustomEvent('realaist:user-logged-in', { detail: { user: newUser } })
        );

        return { success: true, user: newUser };
      }
      return { success: false, error: result.error || 'Login failed' };
    } catch (error) {
      console.error('Login error:', error);
      return { success: false, error: 'Login failed. Please try again.' };
    } finally {
      setIsLoading(false);
    }
  };

  const signup = async (userData: SignupData) => {
    try {
      setIsLoading(true);
      const timeoutId = setTimeout(() => setIsLoading(false), 15000);

      // Preserve admin userType - database now supports it
      const result = await authService.signUp({
        ...userData,
        userType: userData.userType, // Keep original userType including 'admin'
      });

      clearTimeout(timeoutId);

      if (result.user) {
        await clearAllAppCaches();
        setUser(convertAuthUserToUser(result.user));
        return { success: true };
      }
      return { success: false, error: result.error || 'Signup failed' };
    } catch (error) {
      console.error('Signup error:', error);
      return { success: false, error: 'Signup failed. Please try again.' };
    } finally {
      setIsLoading(false);
    }
  };

  const signInWithGoogle = async () => {
    try {
      setIsLoading(true);
      const result = await authService.signInWithGoogle();
      if (result.error) return { success: false, error: result.error };
      return { success: true };
    } catch (error) {
      console.error('Google sign-in error:', error);
      return { success: false, error: 'Google sign-in failed. Please try again.' };
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    try {
      setUser(null);
      await authService.signOut();
      unifiedCacheService.clearUserCaches();
      localStorage.removeItem('current_user');
      localStorage.removeItem('offline_mode');
      localStorage.removeItem('offline_mode_timestamp');
      console.log('AuthContext: User logged out successfully');
    } catch (error) {
      console.error('Logout error:', error);
      setUser(null);
      unifiedCacheService.clearUserCaches();
      localStorage.removeItem('current_user');
      localStorage.removeItem('offline_mode');
      localStorage.removeItem('offline_mode_timestamp');
    }
  };

  const updateProfile = async (userData: Partial<User>) => {
    try {
      if (!user) return { success: false, error: 'No user logged in' };

      const result = await authService.updateProfile(userData);
      if (result.user) {
        setUser(convertAuthUserToUser(result.user));
        return { success: true };
      }
      return { success: false, error: result.error || 'Profile update failed' };
    } catch (error) {
      console.error('Profile update error:', error);
      return { success: false, error: 'Profile update failed. Please try again.' };
    }
  };

  const contextValue: AuthContextType = {
    user,
    isLoading,
    isAuthReady,
    isAuthenticated: !!user,
    login,
    signup,
    signInWithGoogle,
    logout,
    updateProfile,
  };

  return <AuthContext.Provider value={contextValue}>{children}</AuthContext.Provider>;
};
