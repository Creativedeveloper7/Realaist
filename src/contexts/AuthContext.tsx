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
  userType: 'buyer' | 'developer';
  companyName?: string;
  licenseNumber?: string;
  preferences: {
    notifications: boolean;
    darkMode: boolean;
    language: string;
  };
}

export interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  signup: (userData: SignupData) => Promise<{ success: boolean; error?: string }>;
  signInWithGoogle: () => Promise<{ success: boolean; error?: string }>;
  logout: () => Promise<void>;
  updateProfile: (userData: Partial<User>) => Promise<{ success: boolean; error?: string }>;
}

export interface SignupData {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  userType: 'buyer' | 'developer';
  phone?: string;
  companyName?: string;
  licenseNumber?: string;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

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
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Helper function to convert AuthUser to User
  const convertAuthUserToUser = (authUser: AuthUser): User => ({
    id: authUser.id,
    email: authUser.email,
    firstName: authUser.firstName,
    lastName: authUser.lastName,
    phone: authUser.phone,
    avatarUrl: authUser.avatarUrl,
    userType: authUser.userType,
    companyName: authUser.companyName,
    licenseNumber: authUser.licenseNumber,
    preferences: {
      notifications: true,
      darkMode: false,
      language: 'en'
    }
  });

  // Check for existing session on mount
  useEffect(() => {
    const checkAuth = async () => {
      try {
        // Check if we're in offline mode first (with timestamp check)
        const isOfflineMode = localStorage.getItem('offline_mode') === 'true';
        const offlineTimestamp = localStorage.getItem('offline_mode_timestamp');
        const isOfflineExpired = offlineTimestamp && 
          (Date.now() - parseInt(offlineTimestamp)) > 300000; // 5 minutes
        
        if (isOfflineMode && !isOfflineExpired) {
          console.log('AuthContext: Offline mode detected, skipping Supabase auth check');
          setIsLoading(false);
          return;
        } else if (isOfflineMode && isOfflineExpired) {
          console.log('AuthContext: Offline mode expired, attempting to reconnect');
          localStorage.removeItem('offline_mode');
          localStorage.removeItem('offline_mode_timestamp');
        }
        
        const authUser = await authService.getCurrentUser();
        if (authUser) {
          setUser(convertAuthUserToUser(authUser));
        } else {
          // No session: proactively clear caches to avoid stale views
          await clearAllAppCaches();
          setUser(null);
        }
      } catch (error) {
        console.error('Auth check failed:', error);
        // If auth fails, enable offline mode with timestamp
        localStorage.setItem('offline_mode', 'true');
        localStorage.setItem('offline_mode_timestamp', Date.now().toString());
      } finally {
        setIsLoading(false);
      }
    };

    checkAuth();

    // Listen to auth state changes (only if not in offline mode)
    const isOfflineMode = localStorage.getItem('offline_mode') === 'true';
    let subscription = null as any;
    
    if (!isOfflineMode) {
      const { data: { subscription: authSubscription } } = authService.onAuthStateChange(async (authUser) => {
        if (authUser) {
          setUser(convertAuthUserToUser(authUser));
        } else {
          setUser(null);
          await clearAllAppCaches();
        }
        // Don't set loading to false here as it interferes with login process
      });
      subscription = authSubscription;
    }

    return () => {
      if (subscription) {
        subscription.unsubscribe();
      }
    };
  }, []);

  const clearAllAppCaches = async () => {
    try {
      unifiedCacheService.clearAll();
      unifiedCacheService.clearUserCaches();
      // Clear SW/browser/local caches asynchronously; no need to block UI
      cacheManager.clearAllCaches();
    } catch (e) {
      console.warn('Cache clear skipped due to error:', e);
    }
  };

  const login = async (email: string, password: string): Promise<{ success: boolean; error?: string }> => {
    try {
      setIsLoading(true);
      
      // Add timeout to prevent infinite loading
      const timeoutId = setTimeout(() => {
        setIsLoading(false);
      }, 10000); // 10 second timeout
      
      const result = await authService.signIn({ email, password });
      
      clearTimeout(timeoutId);
      
      if (result.user) {
        // Blow away any stale caches immediately
        await clearAllAppCaches();
        setUser(convertAuthUserToUser(result.user));
        return { success: true };
      } else {
        return { success: false, error: result.error || 'Login failed' };
      }
    } catch (error) {
      console.error('Login error:', error);
      return { success: false, error: 'Login failed. Please try again.' };
    } finally {
      setIsLoading(false);
    }
  };

  const signup = async (userData: SignupData): Promise<{ success: boolean; error?: string }> => {
    try {
      setIsLoading(true);
      
      // Add timeout to prevent infinite loading
      const timeoutId = setTimeout(() => {
        setIsLoading(false);
      }, 15000); // 15 second timeout for signup
      
      const result = await authService.signUp({
        email: userData.email,
        password: userData.password,
        firstName: userData.firstName,
        lastName: userData.lastName,
        userType: userData.userType,
        phone: userData.phone,
        companyName: userData.companyName,
        licenseNumber: userData.licenseNumber
      });
      
      clearTimeout(timeoutId);
      
      if (result.user) {
        await clearAllAppCaches();
        setUser(convertAuthUserToUser(result.user));
        return { success: true };
      } else {
        return { success: false, error: result.error || 'Signup failed' };
      }
    } catch (error) {
      console.error('Signup error:', error);
      return { success: false, error: 'Signup failed. Please try again.' };
    } finally {
      setIsLoading(false);
    }
  };

  const signInWithGoogle = async (): Promise<{ success: boolean; error?: string }> => {
    try {
      setIsLoading(true);
      
      const result = await authService.signInWithGoogle();
      
      if (result.error) {
        return { success: false, error: result.error };
      }
      
      // After redirect-based OAuth, caches will be cleared after session restoration.
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
      // Clear user state immediately
      setUser(null);
      
      // Sign out from service
      await authService.signOut();
      
      // Clear any cached data
      unifiedCacheService.clearAll();
      unifiedCacheService.clearUserCaches();
      localStorage.removeItem('current_user');
      localStorage.removeItem('offline_mode');
      
      // Force reload to clear any cached state
      window.location.reload();
    } catch (error) {
      console.error('Logout error:', error);
      // Even if logout fails, clear the user state
      setUser(null);
      unifiedCacheService.clearAll();
      unifiedCacheService.clearUserCaches();
      localStorage.removeItem('current_user');
      localStorage.removeItem('offline_mode');
      window.location.reload();
    }
  };

  const updateProfile = async (userData: Partial<User>): Promise<{ success: boolean; error?: string }> => {
    try {
      if (!user) {
        return { success: false, error: 'No user logged in' };
      }

      const result = await authService.updateProfile({
        firstName: userData.firstName,
        lastName: userData.lastName,
        phone: userData.phone,
        avatarUrl: userData.avatarUrl,
        companyName: userData.companyName,
        licenseNumber: userData.licenseNumber
      });

      if (result.user) {
        setUser(convertAuthUserToUser(result.user));
        return { success: true };
      } else {
        return { success: false, error: result.error || 'Profile update failed' };
      }
    } catch (error) {
      console.error('Profile update error:', error);
      return { success: false, error: 'Profile update failed. Please try again.' };
    }
  };

  const contextValue: AuthContextType = {
    user,
    isLoading,
    isAuthenticated: !!user,
    login,
    signup,
    signInWithGoogle,
    logout,
    updateProfile
  };

  return (
    <AuthContext.Provider value={contextValue}>
      {children}
    </AuthContext.Provider>
  );
};
