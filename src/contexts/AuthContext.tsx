import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { authService, type AuthUser } from '../services/authService';

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
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  signup: (userData: SignupData) => Promise<{ success: boolean; error?: string }>;
  signInWithGoogle: () => Promise<{ success: boolean; error?: string }>;
  logout: () => void;
  updateProfile: (userData: Partial<User>) => Promise<{ success: boolean; error?: string }>;
  updatePreferences: (preferences: Partial<User['preferences']>) => Promise<{ success: boolean; error?: string }>;
}

export interface SignupData {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  phone?: string;
  userType: 'buyer' | 'developer';
  // Developer-specific fields
  companyName?: string;
  licenseNumber?: string;
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
        const authUser = await authService.getCurrentUser();
        if (authUser) {
          setUser(convertAuthUserToUser(authUser));
        }
      } catch (error) {
        console.error('Auth check failed:', error);
      } finally {
        setIsLoading(false);
      }
    };

    checkAuth();

    // Listen to auth state changes
    const { data: { subscription } } = authService.onAuthStateChange((authUser) => {
      if (authUser) {
        setUser(convertAuthUserToUser(authUser));
      } else {
        setUser(null);
      }
      // Don't set loading to false here as it interferes with login process
    });

    return () => {
      if (subscription) {
        subscription.unsubscribe();
      }
    };
  }, []);

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
      await authService.signOut();
      setUser(null);
    } catch (error) {
      console.error('Logout error:', error);
      setUser(null);
    }
  };

  const updateProfile = async (userData: Partial<User>): Promise<{ success: boolean; error?: string }> => {
    try {
      if (!user) {
        return { success: false, error: 'Not authenticated' };
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
      return { success: false, error: 'Profile update failed' };
    }
  };

  const updatePreferences = async (preferences: Partial<User['preferences']>): Promise<{ success: boolean; error?: string }> => {
    try {
      if (!user) {
        return { success: false, error: 'Not authenticated' };
      }
      
      const updatedUser = {
        ...user,
        preferences: { ...user.preferences, ...preferences }
      };
      localStorage.setItem('user_data', JSON.stringify(updatedUser));
      setUser(updatedUser);
      
      return { success: true };
    } catch (error) {
      return { success: false, error: 'Preferences update failed' };
    }
  };

  const value: AuthContextType = {
    user,
    isAuthenticated: !!user,
    isLoading,
    login,
    signup,
    signInWithGoogle,
    logout,
    updateProfile,
    updatePreferences
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
