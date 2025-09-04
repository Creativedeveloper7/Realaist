import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  phone?: string;
  avatar?: string;
  role: 'buyer' | 'developer' | 'admin';
  userType: 'buyer' | 'developer';
  createdAt: string;
  preferences: {
    notifications: boolean;
    darkMode: boolean;
    language: string;
  };
  // Buyer-specific data
  savedProperties?: string[];
  favoriteProperties?: string[];
  // Developer-specific data
  companyName?: string;
  licenseNumber?: string;
  properties?: string[];
}

export interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  signup: (userData: SignupData) => Promise<{ success: boolean; error?: string }>;
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

  // Check for existing session on mount
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const token = localStorage.getItem('auth_token');
        if (token) {
          // In a real app, you'd validate the token with your backend
          const userData = localStorage.getItem('user_data');
          if (userData) {
            setUser(JSON.parse(userData));
          }
        }
      } catch (error) {
        console.error('Auth check failed:', error);
        localStorage.removeItem('auth_token');
        localStorage.removeItem('user_data');
      } finally {
        setIsLoading(false);
      }
    };

    checkAuth();
  }, []);

  const login = async (email: string, password: string): Promise<{ success: boolean; error?: string }> => {
    try {
      setIsLoading(true);
      
      // Mock API call - replace with real API
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Mock validation
      if (email === 'buyer@realaist.com' && password === 'password') {
        const mockUser: User = {
          id: '1',
          email: 'buyer@realaist.com',
          firstName: 'John',
          lastName: 'Doe',
          phone: '+254 700 000 000',
          role: 'buyer',
          userType: 'buyer',
          createdAt: new Date().toISOString(),
          preferences: {
            notifications: true,
            darkMode: false,
            language: 'en'
          },
          savedProperties: [],
          favoriteProperties: []
        };
        
        const token = 'mock_jwt_token_' + Date.now();
        localStorage.setItem('auth_token', token);
        localStorage.setItem('user_data', JSON.stringify(mockUser));
        setUser(mockUser);
        
        return { success: true };
      } else if (email === 'developer@realaist.com' && password === 'password') {
        const mockUser: User = {
          id: '2',
          email: 'developer@realaist.com',
          firstName: 'Jane',
          lastName: 'Smith',
          phone: '+254 700 000 001',
          role: 'developer',
          userType: 'developer',
          createdAt: new Date().toISOString(),
          preferences: {
            notifications: true,
            darkMode: false,
            language: 'en'
          },
          companyName: 'Smith Properties Ltd',
          licenseNumber: 'DEV-2024-001',
          properties: []
        };
        
        const token = 'mock_jwt_token_' + Date.now();
        localStorage.setItem('auth_token', token);
        localStorage.setItem('user_data', JSON.stringify(mockUser));
        setUser(mockUser);
        
        return { success: true };
      } else {
        return { success: false, error: 'Invalid email or password' };
      }
    } catch (error) {
      return { success: false, error: 'Login failed. Please try again.' };
    } finally {
      setIsLoading(false);
    }
  };

  const signup = async (userData: SignupData): Promise<{ success: boolean; error?: string }> => {
    try {
      setIsLoading(true);
      
      // Mock API call - replace with real API
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Mock validation
      if (userData.email && userData.password && userData.firstName && userData.lastName) {
        const newUser: User = {
          id: Date.now().toString(),
          email: userData.email,
          firstName: userData.firstName,
          lastName: userData.lastName,
          phone: userData.phone,
          role: userData.userType,
          userType: userData.userType,
          createdAt: new Date().toISOString(),
          preferences: {
            notifications: true,
            darkMode: false,
            language: 'en'
          },
          // Initialize user type specific data
          ...(userData.userType === 'buyer' && {
            savedProperties: [],
            favoriteProperties: []
          }),
          ...(userData.userType === 'developer' && {
            companyName: userData.companyName,
            licenseNumber: userData.licenseNumber,
            properties: []
          })
        };
        
        const token = 'mock_jwt_token_' + Date.now();
        localStorage.setItem('auth_token', token);
        localStorage.setItem('user_data', JSON.stringify(newUser));
        setUser(newUser);
        
        return { success: true };
      } else {
        return { success: false, error: 'Please fill in all required fields' };
      }
    } catch (error) {
      return { success: false, error: 'Signup failed. Please try again.' };
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    localStorage.removeItem('auth_token');
    localStorage.removeItem('user_data');
    setUser(null);
  };

  const updateProfile = async (userData: Partial<User>): Promise<{ success: boolean; error?: string }> => {
    try {
      if (!user) {
        return { success: false, error: 'Not authenticated' };
      }
      
      const updatedUser = { ...user, ...userData };
      localStorage.setItem('user_data', JSON.stringify(updatedUser));
      setUser(updatedUser);
      
      return { success: true };
    } catch (error) {
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
